import ApiResponse from "../utils/api-response.js"
import asyncHandler from "../utils/async-handler.js"
import ApiError from "../utils/api-error.js"
import { User } from "../models/user.models.js"
import { Project } from "../models/project.models.js"
import { ProjectMember } from "../models/projectmember.models.js"
import mongoose from "mongoose"
import { UserRolesEnum, AvailableUserRoles } from "../constant.js"
import { Task } from "../models/task.models.js"
import { SubTask } from "../models/subtask.models.js"
import fs from "fs/promises"

const createProject = asyncHandler(async (req, res) => {
  const { title, description } = req.body
  if (!title || !description) {
    throw new ApiError(400, "Title and description are required", [])
  }
  let project
  const session = await mongoose.startSession()
  try {
    session.startTransaction()
    ;[project] = await Project.create(
      [
        {
          title,
          description,
          createdBy: new mongoose.Types.ObjectId(req.user._id),
        },
      ],
      { session },
    )
    await ProjectMember.create(
      [
        {
          user: new mongoose.Types.ObjectId(req.user._id),
          project: new mongoose.Types.ObjectId(project._id),
          role: UserRolesEnum.ADMIN,
        },
      ],
      { session },
    )
    await session.commitTransaction()
  } catch (error) {
    await session.abortTransaction()
    if (error instanceof ApiError) {
      throw error
    }
    console.log(error)
    throw new ApiError(500, "Failed to create the project", [error.message])
  } finally {
    await session.endSession()
  }

  return res
    .status(201)
    .json(new ApiResponse(201, { project }, "Project created successfully"))
})
const updateProject = asyncHandler(async (req, res) => {
  const { title, description } = req.body
  if (!title || !description) {
    throw new ApiError(400, "Title and description are required", [])
  }
  const { projectId } = req.params
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Project Id is invalid", [])
  }

  const project = await Project.findByIdAndUpdate(
    new mongoose.Types.ObjectId(projectId),
    {
      title,
      description,
    },
    { new: true },
  )
  if (!project) {
    throw new ApiError(404, "Project Not Found", [])
  }
  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"))
})
const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Project Id is invalid", [])
  }
  let attachments = []
  const session = await mongoose.startSession()

  try {
    session.startTransaction()
    const project = await Project.findById(projectId).session(session)

    if (!project) {
      throw new ApiError(404, "Project Not Found", [])
    }
    const tasks = await Task.find({
      project: projectId,
    }).session(session)

    let taskIds = tasks.map((task) => task._id)
    for (const task of tasks) {
      attachments.push(...task.attachments)
    }
    await SubTask.deleteMany(
      {
        task: {
          $in: taskIds,
        },
      },
      {
        session,
      },
    )
    await Task.deleteMany(
      {
        project: projectId,
      },
      { session },
    )
    await ProjectMember.deleteMany(
      {
        project: projectId,
      },
      { session },
    )

    const deletedProject = await Project.findByIdAndDelete(projectId, {
      session,
    })
    if (!deletedProject) {
      throw new ApiError(404, "Project Not Found", [])
    }
    await session.commitTransaction()
  } catch (error) {
    await session.abortTransaction()
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, "Failed to delete the project", [error.message])
  } finally {
    await session.endSession()
  }
  if (attachments.length > 0) {
    for (const attachment of attachments) {
      try {
        await fs.unlink(attachment.path)
      } catch (error) {
        console.log(`Failed to delete ${attachment.path}`, error)
      }
    }
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project deleted successfully"))
})
const getProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "projects",
        pipeline: [
          {
            $lookup: {
              from: "projectmembers",
              localField: "_id",
              foreignField: "project",
              as: "projectmembers",
            },
          },
          {
            $addFields: {
              members: {
                $size: "$projectmembers",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$projects",
    },
    {
      $project: {
        project: {
          _id: "$projects._id",
          title: "$projects.title",
          description: "$projects.description",
          members: "$projects.members",
          createdAt: "$projects.createdAt",
          createdBy: "$projects.createdBy",
        },
        role: 1,
        _id: 0,
      },
    },
  ])
  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully"))
})
const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid Project Id", [])
  }
  const project = await Project.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "projectmembers",
        localField: "_id",
        foreignField: "project",
        as: "members",
      },
    },
    {
      $addFields: {
        memberCount: {
          $size: "$members",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
        pipeline: [
          {
            $project: {
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
    {
      $lookup: {
        from: "tasks",
        localField: "_id",
        foreignField: "project",
        as: "tasks",
        pipeline: [
          {
            $project: {
              _id: 1,
              title: 1,
              status: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },

    {
      $project: {
        title: 1,
        description: 1,
        memberCount: 1,
        tasks: 1,
        createdBy: 1,

        _id: 0,
      },
    },
  ])
  if (!project.length) {
    throw new ApiError(404, "Project Not Found", [])
  }
  return res
    .status(200)
    .json(new ApiResponse(200, project[0], "Project found successfully"))
})
const addProjectMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body
  const { projectId } = req.params
  if (!AvailableUserRoles.includes(role)) {
    throw new ApiError(400, "Invalid role", [])
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID", [])
  }
  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(404, "User Not Found", [])
  }
  const project = await Project.findById(projectId)
  if (!project) {
    throw new ApiError(404, "Project Not Found", [])
  }
  try {
    await ProjectMember.create({
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
      role,
    })
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "User is already a member of this project", [
        error.message,
      ])
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Member has been added successfully"))
})
const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  const project = await Project.findById(new mongoose.Types.ObjectId(projectId))
  if (!project) {
    throw new ApiError(404, "Project Not found", [])
  }
  const projectMembers = await ProjectMember.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "members",
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
        members: {
          $arrayElemAt: ["$members", 0],
        },
      },
    },
    {
      $project: {
        project: 1,
        members: 1,
        role: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 0,
      },
    },
  ])

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMembers,
        "Project Members fetched successfully",
      ),
    )
})
const updateMemberRole = asyncHandler(async (req, res) => {
  const { role } = req.body
  const { userId, projectId } = req.params

  if (!AvailableUserRoles.includes(role)) {
    throw new ApiError(400, "Invalid role", [])
  }

  const projectMember = await ProjectMember.findOneAndUpdate(
    {
      user: userId,
      project: projectId,
    },

    {
      role: role,
    },
    {
      new: true,
    },
  )
  if (!projectMember) {
    throw new ApiError(404, "Project Member Not Found", [])
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Project Member role been updated successfully"),
    )
})
const removeProjectMember = asyncHandler(async (req, res) => {
  const { userId, projectId } = req.params

  const projectMember = await ProjectMember.findOneAndDelete({
    user: userId,
    project: projectId,
  })
  if (!projectMember) {
    throw new ApiError(404, "Project Member Not Found", [])
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Project Member has been deleted successfully"),
    )
})

export {
  getProjectById,
  getProjects,
  createProject,
  updateMemberRole,
  updateProject,
  deleteProject,
  removeProjectMember,
  getProjectMembers,
  addProjectMember,
}
