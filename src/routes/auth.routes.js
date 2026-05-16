import { Router } from "express"
import { registerUser, loginUser } from "../controllers/auth.controller.js"
import {
  registerUserValidator,
  loginUserValidator,
} from "../validators/index.js"
import { validator } from "../middlewares/validator.middleware.js"
const router = Router()
router.route("/register").post(registerUserValidator(), validator, registerUser)
router.route("/login").post(loginUserValidator(), validator, loginUser)
export default router
