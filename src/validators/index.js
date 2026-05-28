import { body } from "express-validator"

const registerUserValidator = (req, res, next) => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is Invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be in lower case")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password must not be empty"),
    body("fullname").optional().trim(),
  ]
}

const loginUserValidator = (req, res, next) => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is Invalid"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ]
}
const forgotPasswordValidator = (req, res, next) => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is Invalid"),
  ]
}
const changePasswordValidator = (req, res, next) => {
  return [
    body("currentPassword")
      .trim()
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("New p  assword is required"),
  ]
}
const resetPasswordValidator = (req, res, next) => {
  return [
    body("newPassword").trim().notEmpty().withMessage("Password is required"),
  ]
}
export {
  registerUserValidator,
  loginUserValidator,
  forgotPasswordValidator,
  changePasswordValidator,
  resetPasswordValidator,
}
