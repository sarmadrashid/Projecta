import { ProjectMember } from "../models/projectmember.models.js"
import ApiError from "../utils/api-error.js"
import asyncHandler from "../utils/async-handler.js"

export const validateProjectPermission = (roles = []) => {
  asyncHandler(async (req, res, next) => {
    const projectID = req.params
    if (!projectID) {
      throw new ApiError(404, "Project Id is missing", [])
    }
    const projectMember = await ProjectMember.findOne({
      user: new mongoose.Types.ObjectId(req.user._id),
      project: new mongoose.Types.ObjectId(projectID),
    })
    if (!projectMember) {
      throw new ApiError(404, "Project Member Not Found", [])
    }
    const givenRole = projectMember?.role
    req.user.role = givenRole
    if (!roles.includes(givenRole)) {
      throw new ApiError(
        403,
        "You don't have permission to perform this action",
        [],
      )
    }
    next()
  })
}
