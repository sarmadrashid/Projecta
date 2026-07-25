import { body } from "express-validator"
import { AvailableTaskStatuses, AvailableUserRoles } from "../constant.js"

const registerUserValidator = () => {
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
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long")
      .matches(/^[a-z0-9_]+$/)
      .withMessage("Username must be in lowercase without spaces and Symbols"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password must not be empty")
      .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)
      .withMessage("Password must contain uppercase, lowercase and number")
      .isLength({ min: 8, max: 14 })
      .withMessage(
        "Password must be at least 8 characters long and not exceed 14 characters",
      ),
    body("fullname").optional().trim(),
  ]
}

const loginUserValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is Invalid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password must not be empty"),
  ]
}
const forgotPasswordValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is Invalid"),
  ]
}
const changePasswordValidator = () => {
  return [
    body("currentPassword")
      .trim()
      .notEmpty()
      .withMessage("Current password must not be empty")
      .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)
      .withMessage(
        "Current password must contain uppercase, lowercase and number",
      )
      .isLength({ min: 8, max: 14 })
      .withMessage(
        "Current Password must be at least 8 characters long and not exceed 14 characters",
      ),
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("New password must not be empty")
      .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)
      .withMessage("New password must contain uppercase, lowercase and number")
      .isLength({ min: 8, max: 14 })
      .withMessage(
        "New password must be at least 8 characters long and not exceed 14 characters",
      ),
  ]
}
const resetPasswordValidator = () => {
  return [
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("New password must not be empty")
      .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)
      .withMessage("New password must contain uppercase, lowercase and number")
      .isLength({ min: 8, max: 14 })
      .withMessage(
        "New password must be at least 8 characters long and not exceed 14 characters",
      ),
  ]
}
const addProjectValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Project name is required")
      .isLength({ min: 3, max: 100 })
      .withMessage(
        "Title must be at least 3 characters long and not exceed 100 characters",
      ),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ min: 3, max: 1500 })
      .withMessage(
        "Description max character limit mustn't exceeded from 1500 and should be greater than 3",
      ),
  ]
}

const addProjectMemberValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is Invalid"),
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(AvailableUserRoles)
      .withMessage("Role is invalid"),
  ]
}
const updateMemberRoleValidator = () => {
  return [
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(AvailableUserRoles)
      .withMessage("Role is invalid"),
  ]
}

const addTaskValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 3, max: 180 })
      .withMessage(
        "Title must be at least 3 characters long and not exceed 180 characters",
      ),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ min: 3, max: 1500 })
      .withMessage(
        "Description max character limit mustn't exceeded from 1500 and should be greater than 3",
      ),
    body("status")
      .trim()
      .notEmpty()
      .withMessage("Status is required")
      .isIn(AvailableTaskStatuses)
      .withMessage("Status is invalid"),
    body("assignedTo")
      .trim()
      .notEmpty()
      .withMessage("Assigned To is required")
      .isMongoId()
      .withMessage("Assigned To must be a valid MongoDB ObjectId"),
  ]
}

const addSubtaskValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 3, max: 180 })
      .withMessage(
        "Title must be at least 3 characters long and not exceed 180 characters",
      ),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ min: 3, max: 1500 })
      .withMessage(
        "Description max character limit mustn't exceeded from 1500 and should be greater than 3",
      ),
    body("isCompleted")
      .isBoolean()
      .withMessage("Completed status should be in boolean")
      .notEmpty()
      .withMessage("Completed status is required"),
  ]
}

const updateSubtaskValidator = () => {
  return [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 3, max: 180 })
      .withMessage(
        "Title must be at least 3 characters long and not exceed 180 characters",
      ),
    body("description")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ min: 3, max: 1500 })
      .withMessage(
        "Description max character limit mustn't exceeded from 1500 and should be greater than 3",
      ),
    body("isCompleted")
      .optional()
      .isBoolean()
      .withMessage("Completed status should be in boolean")
      .notEmpty()
      .withMessage("Completed status is required"),
  ]
}

const addNoteValidator = () => {
  return [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ min: 3, max: 1500 })
      .withMessage(
        "Content max character limit mustn't exceeded from 1500 and should be greater than 3",
      ),
  ]
}

export {
  registerUserValidator,
  loginUserValidator,
  forgotPasswordValidator,
  changePasswordValidator,
  resetPasswordValidator,
  addProjectValidator,
  addProjectMemberValidator,
  updateMemberRoleValidator,
  addTaskValidator,
  addSubtaskValidator,
  updateSubtaskValidator,
  addNoteValidator,
}
