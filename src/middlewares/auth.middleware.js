import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"
import ApiError from "../utils/api-error.js"

export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return next(new ApiError(401, "Unauthorized: No token provided", []))
    }

    const decoded = await jwt.verify(
      token,
      `${process.env.ACCESS_TOKEN_SECRET}`,
    )

    const user = await User.findById(decoded.id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry",
    )

    if (!user) {
      return next(new ApiError(401, "Unauthorized: User not found", []))
    }

    req.user = user
    next()
  } catch (err) {
    return next(new ApiError(401, "Unauthorized: Invalid token", [err.message]))
  }
}
