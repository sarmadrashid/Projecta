import mongoose, { Schema } from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"
const userSchema = Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    avatar: {
      type: {
        url: String,
        publicId: String,
      },
      default: {
        url: "https://placehold.co/200x200",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordTokenExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationTokenExpiry: {
      type: Date,
    },
  },
  { timestamps: true },
)

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return
  }
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      username: this.username,
    },
    `${process.env.ACCESS_TOKEN_SECRET}`,
    { expiresIn: `${process.env.ACCESS_TOKEN_EXPIRY}` },
  )
}
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      username: this.username,
    },
    `${process.env.REFRESH_TOKEN_SECRET}`,
    { expiresIn: `${process.env.REFRESH_TOKEN_EXPIRY}` },
  )
}
userSchema.methods.generateTemporaryToken = function () {
  const unhashedToken = crypto.randomBytes(32).toString("hex")
  const hashedToken = crypto
    .createHash("sha256")
    .update(unhashedToken)
    .digest("hex")
  const TokenExpiry = Date.now() + 20 * 60 * 1000

  return { unhashedToken, hashedToken, TokenExpiry }
}
export const User = mongoose.model("User", userSchema)
