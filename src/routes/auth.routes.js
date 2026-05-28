import { Router } from "express"
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  resendEmailVerification,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
} from "../controllers/auth.controller.js"
import {
  registerUserValidator,
  loginUserValidator,
  forgotPasswordValidator,
  changePasswordValidator,
  resetPasswordValidator,
} from "../validators/index.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { validator } from "../middlewares/validator.middleware.js"
const router = Router()

// Unsecured routes
router.route("/register").post(registerUserValidator(), validator, registerUser)
router.route("/login").post(loginUserValidator(), validator, loginUser)
router.route("/verify-email/:verificationToken").get(verifyEmail)
router.route("/refresh-token").post(refreshAccessToken)
router
  .route("/forgot-password")
  .post(forgotPasswordValidator(), validator, forgotPassword)
router
  .route("/reset-password/:resetToken")
  .post(resetPasswordValidator(), validator, resetPassword)

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification)
router
  .route("/change-password")
  .post(verifyJWT, changePasswordValidator(), validator, changePassword)

export default router
