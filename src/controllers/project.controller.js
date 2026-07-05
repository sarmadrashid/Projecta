import ApiResponse from "../utils/api-response.js"
import asyncHandler from "../utils/async-handler.js"
import ApiError from "../utils/api-error.js"
import { User } from "../models/user.models.js"
import { Project } from "../models/project.models.js"
import { ProjectMember } from "../models/projectmember.models.js"
import mongoose from "mongoose"
import { UserRolesEnum } from "../constant.js"

const createProject = asyncHandler(async (req, res) => {
  const { title, description } = req.body
  const project = await Project.create({
    title,
    description,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  })

  await ProjectMember.create({
    user: new mongoose.Types.ObjectId(req.user._id),
    project: new mongoose.Types.ObjectId(project._id),
    role: UserRolesEnum.ADMIN,
  })

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"))
})
const updateProject = asyncHandler(async (req, res) => {
  const { newTitle, newDescription } = req.body
  const projectId = req.params
  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      title: newTitle,
      description: newDescription,
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
  const projectId = req.params
  const project = await Project.findByIdAndDelete(projectId)
  if (!project) {
    throw new ApiError(404, "Project Not Found", [])
  }
  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project deleted successfully"))
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
      $unwind: "$project",
    },
    {
      $project: {
        project: {
          _id: 1,
          name: 1,
          description: 1,
          members: 1,
          createdAt: 1,
          createdBy: 1,
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
  const project = await Project.findById(projectId)
  if (!project) {
    throw new ApiError(404, "Project Not Found", [])
  }
  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project found successfully"))
})
const addProjectMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body
  const projectID = req.params

  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(404, "User Not Found", [])
  }

  await ProjectMember.findByIdAndUpdate(
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectID),
    },
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectID),
      role: role,
    },
    {
      new: true,
      upsert: true,
    },
  )

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Member has been added successfully"))
})
const getProjectMembers = asyncHandler(async (req, res) => {
  const projectID = req.params
  const project = await Project.findById(projectID)
  if (!project) {
    throw new ApiError(404, "Project Not found", [])
  }
  await ProjectMember.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(projectID),
      },
    },
    {
      $lookup: {
        from: "user",
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
})
const updateMemberRole = asyncHandler(async (req, res) => {
  const newRole = req.body
  const { userID, projectID } = req.params

  if (!availableUserRoles.includes(newRole)) {
    throw new ApiError(400, "Invalid role", [])
  }
  let projectMember = await ProjectMember.findOne({
    user: new mongoose.Types.ObjectId(userID),
    project: new mongoose.Types.ObjectId(projectID),
  })
  if (!projectMember) {
    throw new ApiError(404, "Projec tMember Not Found", [])
  }

  projectMember = await ProjectMember.findByIdAndUpdate(
    projectMember._id,

    {
      role: newRole,
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
  const { userID, projectID } = req.params

  let projectMember = await ProjectMember.findOne({
    user: new mongoose.Types.ObjectId(userID),
    project: new mongoose.Types.ObjectId(projectID),
  })
  if (!projectMember) {
    throw new ApiError(404, "Project Member Not Found", [])
  }

  projectMember = await ProjectMember.findByIdAndDelete(projectMember._id)
  if (!projectMember) {
    throw new ApiError(404, "ProjectMember Not Found", [])
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
  updateMemberRole,
  removeProjectMember,
  getProjectMembers,
  addProjectMember,
}
