import { mongoose } from "mongoose"
import { ProjectMember } from "../models/projectmember.models.js"
import ApiError from "../utils/api-error.js"
import asyncHandler from "../utils/async-handler.js"
mongoose

export const validateProjectPermission = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { projectId } = req.params

    if (!projectId) {
      throw new ApiError(404, "Project Id is missing", [])
    }

    const projectMember = await ProjectMember.findOne({
      user: new mongoose.Types.ObjectId(req.user._id),
      project: new mongoose.Types.ObjectId(projectId),
    })
    if (!projectMember) {
      throw new ApiError(404, "Project Member Not Found", [])
    }
    const givenRole = projectMember?.role
    req.user.role = givenRole

    if (!roles.includes(givenRole)) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action",
        [],
      )
    }
    next()
  })
}
