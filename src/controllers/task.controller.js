import ApiResponse from "../utils/api-response.js"
import asyncHandler from "../utils/async-handler.js"
import ApiError from "../utils/api-error.js"
import mongoose from "mongoose"
import fs from "fs/promises"
import { AvailableTaskStatuses } from "../constant.js"
import { Task } from "../models/task.models.js"
import { UserRolesEnum, AvailableUserRoles } from "../constant.js"
import { SubTask } from "../models/subtask.models.js"
import { upload } from "../middlewares/multer.middleware.js"
import { Project } from "../models/project.models.js"
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
} from "../utils/cloudinary.js"

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  console.log("projectId", projectId)
  const project = await Project.findById(new mongoose.Types.ObjectId(projectId))
  if (!project) {
    throw new ApiError(404, "Project not found", [])
  }

  const tasks = await Task.find({
    project: new mongoose.Types.ObjectId(projectId),
  }).populate("assignedTo", "avatar username fullName")
  return res
    .status(201)
    .json(new ApiResponse(201, tasks, "Task fetched successfully"))
})
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, assignedTo } = req.body
  const { projectId } = req.params
  if (!AvailableTaskStatuses.includes(status)) {
    throw new ApiError(400, "Invalid Status", [])
  }

  const project = await Project.findById(new mongoose.Types.ObjectId(projectId))
  if (!project) {
    throw new ApiError(404, "Project not found", [])
  }
  const files = req.files || []
  const attachments = await files.map((file) => {
    return {
      url: `${process.env.SERVER_URL}/${file.mimetype.includes("pdf") ? "pdfs" : "images"}/${file.filename}`,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    }
  })
  const task = await Task.create({
    title,
    description,
    status,
    assignedTo: assignedTo
      ? new mongoose.Types.ObjectId(assignedTo)
      : undefined,
    project: new mongoose.Types.ObjectId(projectId),
    assignedBy: new mongoose.Types.ObjectId(req.user._id),
    attachments,
  })
  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"))
})

const getTaskDetails = asyncHandler(async (req, res) => {
  const { taskId } = req.params
  if (!taskId) {
    throw new ApiError(404, "Task Id is required", [])
  }
  const task = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullname: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "Subtask",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullname: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              createdBy: {
                $arrayElemAt: ["$createdBy", 0],
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElemAt: ["$assignedTo", 0],
        },
      },
    },
  ])

  if (!task || task.length === 0) {
    throw new ApiError(404, "Task not found", [])
  }
  return res
    .status(200)
    .json(new ApiResponse(200, task[0], "Task fetched successfully"))
})
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, status, assignedTo } = req.body
  const { taskId } = req.params
  if (!AvailableTaskStatuses.includes(status)) {
    throw new ApiError(400, "Invalid Status", [])
  }
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Task Id is required", [])
  }

  const updatedTask = await Task.findByIdAndUpdate(
    new mongoose.Types.ObjectId(taskId),
    {
      title: title,
      description: description,
      status: status,
      assignedTo: assignedTo
        ? new mongoose.Types.ObjectId(assignedTo)
        : undefined,
    },
    {
      new: true,
      runValidators: true,
    },
  )
  if (!updatedTask) {
    throw new ApiError(404, "Task not Found", [])
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedTask, "Task Updated successfully"))
})

const addAttachmentsToTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Task Id is required", [])
  }

  const files = req.files || []

  if (files.length === 0) {
    throw new ApiError(400, "Please upload at least one attachment", [])
  }

  const attachments = []

  try {
    for (const file of files) {
      const uploaded = await uploadOnCloudinary(file.path)

      attachments.push({
        url: uploaded.url,
        publicId: uploaded.publicId,
        mimetype: file.mimetype,
        size: file.size,
      })
    }
  } catch (error) {
    await deleteMultipleFromCloudinary(attachments)

    if (error instanceof ApiError) {
      throw error
    }
    console.log(error.message)

    throw new ApiError(500, "Failed to upload attachments", [error.message])
  }

  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        $push: {
          attachments: {
            $each: attachments,
          },
        },
      },
      {
        new: true,
        session,
      },
    )

    if (!task) {
      throw new ApiError(404, "Task not found", [])
    }

    await session.commitTransaction()

    return res
      .status(200)
      .json(new ApiResponse(200, task, "Attachments added successfully"))
  } catch (error) {
    await session.abortTransaction()

    await deleteMultipleFromCloudinary(attachments)

    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(500, "Failed to add attachments", [error.message])
  } finally {
    await session.endSession()
  }
})
const removeAttachmentFromTask = asyncHandler(async (req, res) => {
  const { taskId, attachmentId } = req.params

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Task Id is invalid", [])
  }

  if (!mongoose.Types.ObjectId.isValid(attachmentId)) {
    throw new ApiError(400, "Attachment Id is invalid", [])
  }

  const session = await mongoose.startSession()

  let publicId = null

  try {
    session.startTransaction()

    const task = await Task.findOne(
      {
        _id: taskId,
        "attachments._id": attachmentId,
      },
      {
        attachments: {
          $elemMatch: {
            _id: attachmentId,
          },
        },
      },
    ).session(session)

    if (!task) {
      throw new ApiError(404, "Attachment not found", [])
    }

    publicId = task.attachments[0].publicId

    await Task.updateOne(
      {
        _id: taskId,
      },
      {
        $pull: {
          attachments: {
            _id: attachmentId,
          },
        },
      },
      {
        session,
      },
    )

    await session.commitTransaction()
  } catch (error) {
    await session.abortTransaction()

    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(500, "Failed to remove attachment", [error.message])
  } finally {
    await session.endSession()
  }

  try {
    await deleteFromCloudinary(publicId)
  } catch (error) {
    console.error(
      `Failed to delete Cloudinary file (${publicId})`,
      error.message,
    )
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Attachment removed successfully"))
})
const deleteTask = asyncHandler(async (req, res) => {
  const { taskId, projectId } = req.params

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Task Id is required", [])
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Project Id is required", [])
  }
  let attachments = []
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    const deletedTask = await Task.findOneAndDelete(
      {
        _id: taskId,
        project: projectId,
      },
      { session },
    )
    if (!deletedTask) {
      throw new ApiError(404, "Task not found", [])
    }
    attachments = deletedTask.attachments ?? []
    await SubTask.deleteMany(
      {
        task: taskId,
      },
      { session },
    )
    await session.commitTransaction()
  } catch (error) {
    await session.abortTransaction()
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, "Failed to delete the task", [error.message])
  } finally {
    session.endSession()
  }
  if (attachments.length > 0) {
    await deleteMultipleFromCloudinary(attachments)
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Task deleted successfully"))
})
const createSubTask = asyncHandler(async (req, res) => {
  const { title, description, isCompleted } = req.body
  const { taskId } = req.params
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Task Id is required", [])
  }
  const task = await Task.findById(new mongoose.Types.ObjectId(taskId))
  if (!task) {
    throw new ApiError(404, "Task not found", [])
  }
  const subtask = await SubTask.create({
    title,
    description,
    isCompleted: isCompleted,
    task: new mongoose.Types.ObjectId(taskId),
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  })
  return res
    .status(201)
    .json(new ApiResponse(201, subtask, "Subtask created successfully"))
})
const updateSubTask = asyncHandler(async (req, res) => {
  const { title, description, isCompleted } = req.body
  const { taskId, subtaskId } = req.params
  console.log(taskId)
  console.log(subtaskId)
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Task Id is required", [])
  }
  if (!mongoose.Types.ObjectId.isValid(subtaskId)) {
    throw new ApiError(400, "Subtask Id is required", [])
  }
  const task = await Task.findById(taskId)
  if (!task) {
    throw new ApiError(404, "Task not found", [])
  }
  const subtask = await SubTask.findByIdAndUpdate(
    {
      _id: subtaskId,
      task: taskId,
    },
    {
      title,
      description,
      isCompleted,
    },
    { new: true, runValidators: true },
  )
  if (!subtask) {
    throw new ApiError(404, "Subtask not found", [])
  }
  return res
    .status(200)
    .json(new ApiResponse(200, subtask, "Subtask updated successfully"))
})
const deleteSubTask = asyncHandler(async (req, res) => {
  const { taskId, subtaskId } = req.params
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Task Id is required", [])
  }
  if (!mongoose.Types.ObjectId.isValid(subtaskId)) {
    throw new ApiError(400, "Subtask Id is required", [])
  }

  const subtask = await SubTask.findByIdAndDelete({
    _id: subtaskId,
    task: taskId,
  })
  if (!subtask) {
    throw new ApiError(404, "Subtask not found", [])
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Subtask deleted successfully"))
})

export {
  getTasks,
  createTask,
  getTaskDetails,
  updateTask,
  deleteTask,
  addAttachmentsToTask,
  removeAttachmentFromTask,
  createSubTask,
  updateSubTask,
  deleteSubTask,
}
