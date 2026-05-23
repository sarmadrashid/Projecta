import ApiResponse from "../utils/api-response.js"
import asyncHandler from "../utils/async-handler.js"
import { User } from "../models/user.models.js"
import ApiError from "../utils/api-error.js"
import { sendEmail, emailVerficationMailgenContent } from "../utils/mail.js"

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
export { registerUser, loginUser, logoutUser }
