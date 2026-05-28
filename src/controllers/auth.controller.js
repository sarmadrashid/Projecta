import ApiResponse from "../utils/api-response.js"
import asyncHandler from "../utils/async-handler.js"
import { User } from "../models/user.models.js"
import ApiError from "../utils/api-error.js"
import { sendEmail, emailVerficationMailgenContent } from "../utils/mail.js"
import { useReducer } from "react"

const generateAccessandRefreshToken = async (user_id) => {
  try {
    const user = await User.findById(user_id)
    if (!user) {
      throw new ApiError(404, "User not found", [])
    }
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    return {
      accessToken,
      refreshToken,
    }
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong during generation of JWT Tokens",
      [error],
    )
  }
}
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password, role } = req.body
  const findUser = await User.findOne({
    $or: [{ username }, { email }],
  })
  if (findUser) {
    throw new ApiError(409, "User with username or email already existed", [])
  }
  const user = await User.create({
    username,
    fullname,
    email,
    password,
    isEmailVerified: false,
  })
  if (!user) {
    throw new ApiError(500, "User registration failed", [])
  }

  const { unhashedToken, hashedToken, TokenExpiry } =
    user.generateTemporaryToken()
  user.emailVerificationToken = hashedToken
  user.emailVerificationTokenExpiry = TokenExpiry
  await user.save({ validateBeforeSave: false })
  await sendEmail({
    email: user?.email,
    subject: "Please Verify your Email",
    MailgenContent: emailVerficationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`,
    ),
  })
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry",
  )
  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering the user ",
      [],
    )
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        "User registered successfully and the verification mail has been sent",
      ),
    )
})
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(404, "User with this email does not exist", [])
  }
  const isPasswordValid = await user.comparePassword(password)
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials", [])
  }
  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id,
  )

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry",
  )

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully",
      ),
    )
})

const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        refreshToken: "",
      },
    },
    { new: true },
  )

  const options = {
    httpOnly: true,
    secure: true,
  }
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out successfully", []))
})

const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const user = await User.findById(userId).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry",
  )
  if (!user) {
    throw new ApiError(404, "User not found", [])
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User details fetched successfully"))
})

const verifyEmail = asyncHandler(async (req, res) => {
  const verificationToken = req.params
  if (!verificationToken) {
    throw new ApiError(404, "Verification token is not found", {})
  }

  const hashedtoken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex")

  const user = await User.findOne({
    emailVerificationToken: hashedtoken,
    emailVerificationTokenExpiry: { $gt: Date.now() },
  })
  if (!user) {
    throw new ApiError(404, "Token is invalid or expired", {})
  }
  user.emailVerificationToken = undefined
  user.emailVerificationTokenExpiry = undefined
  user.isEmailVerified = true
  await user.save({ validateBeforeSave: false })
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isEmailVerified: true },
        "Email verified successfully",
      ),
    )
})

const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) {
    throw new ApiError(404, "User not found", {})
  }
  if (user.isEmailVerified) {
    throw new ApiError(404, "Email is already verified", {})
  }
  const { unhashedToken, hashedToken, TokenExpiry } =
    user.generateTemporaryToken()
  user.emailVerificationToken = hashedToken
  user.emailVerificationTokenExpiry = TokenExpiry
  await user.save({ validateBeforeSave: false })
  await sendEmail({
    email: user?.email,
    subject: "Please Verify your Email",
    MailgenContent: emailVerficationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`,
    ),
  })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verification resend successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    )
    const user = await User.findById(decodedToken._id)
    if (!user) {
      throw new ApiError(404, "User not found", {})
    }
    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is expired", {})
    }
    const { accessToken, refreshToken: newRefreshToken } =
      user.generateAccessToken()
    const options = {
      httpOnly: true,
      secure: true,
    }
    user.refreshToken = newRefreshToken
    await user.save({ validateBeforeSave: false })
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "Access token refreshed successfully",
        ),
      )
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token", [error])
  }
})

// Password Related Controllers

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(404, "User with this email does not exist", [])
  }
  const { unhashedToken, hashedToken, TokenExpiry } =
    user.generateTemporaryToken()
  user.passwordResetToken = hashedToken
  user.passwordResetTokenExpiry = TokenExpiry
  await user.save({ validateBeforeSave: false })
  await sendEmail({
    email: user?.email,
    subject: "Password Forgot Request",
    MailgenContent: forgotPasswordMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/forgot-password/${unhashedToken}`,
    ),
  })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset email sent successfully"))
})

const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body
  const resetToken = req.params.resetToken
  const user = await User.findOne({
    forgotPasswordToken: crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex"),
    forgotPasswordTokenExpiry: { $gt: Date.now() },
  })
  if (!user) {
    throw new ApiError(404, "Invalid or expired password reset token", {})
  }
  user.password = newPassword
  user.forgotPasswordToken = undefined
  user.forgotPasswordTokenExpiry = undefined
  await user.save({ validateBeforeSave: false })
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"))
})

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const userID = req.user._id
  const user = await User.findById(req.user._id)

  user
    .comparePassword(currentPassword)
    .then(() => {
      user.password = newPassword
    })
    .catch((err) => {
      throw new ApiError(401, "Enter valid current password", [err])
    })
  await user.save({ validateBeforeSave: false })
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

export {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  verifyEmail,
  resendEmailVerification,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  refreshAccessToken,
}
