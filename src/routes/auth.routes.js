import { Router } from "express"
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/auth.controller.js"
import {
  registerUserValidator,
  loginUserValidator,
} from "../validators/index.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { validator } from "../middlewares/validator.middleware.js"
const router = Router()
router.route("/register").post(registerUserValidator(), validator, registerUser)
router.route("/login").post(loginUserValidator(), validator, loginUser)
router.route("/logout").get(verifyJWT, logoutUser)
export default router
