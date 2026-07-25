import { mongoose } from "mongoose"
import { ProjectMember } from "../models/projectmember.models.js"
import ApiError from "../utils/api-error.js"
import asyncHandler from "../utils/async-handler.js"
mongoose

export const validateProjectPermission = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { projectId } = req.params

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, "Invalid Project Id", [])
    }

    const projectMember = await ProjectMember.findOne({
      user: req.user._id,
      project: projectId,
    })
    if (!projectMember) {
      throw new ApiError(403, "You are not a member of this project", [])
    }
    const givenRole = projectMember?.role

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
