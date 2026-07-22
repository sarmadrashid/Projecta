import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
  getTasks,
  createTask,
  getTaskDetails,
  updateTask,
  deleteTask,
  addAttachmentsToTask,
  removeAttachmentFromTask,
  createSubTask,
  updateSubTask,
  deleteSubTask,
} from "../controllers/task.controller.js"
import { validateProjectPermission } from "../middlewares/permissionValidator.middleware.js"
import { validator } from "../middlewares/validator.middleware.js"

import { AvailableUserRoles, UserRolesEnum } from "../constant.js"
import {
  addTaskValidator,
  addSubtaskValidator,
  updateSubtaskValidator,
} from "../validators/index.js"
import { upload } from "../middlewares/multer.middleware.js"

const adminRoles = [UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]

const router = Router()

router.use(verifyJWT)

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRoles), getTasks)
  .post(
    validateProjectPermission(adminRoles),
    upload.array("attachments"),
    addTaskValidator(),
    validator,
    createTask,
  )
router
  .route("/:projectId/t/:taskId")
  .get(validateProjectPermission(AvailableUserRoles), getTaskDetails)
  .put(
    validateProjectPermission(adminRoles),
    addTaskValidator(),
    validator,
    updateTask,
  )
  .delete(validateProjectPermission(adminRoles), deleteTask)
router
  .route("/:projectId/t/:taskId/attachments")
  .post(
    validateProjectPermission(adminRoles),
    upload.array("attachments"),
    addAttachmentsToTask,
  )
router
  .route("/:projectId/t/:taskId/attachments/:attachmentId")
  .delete(validateProjectPermission(adminRoles), removeAttachmentFromTask)
router
  .route("/:projectId/t/:taskId/subtasks")
  .post(
    validateProjectPermission(adminRoles),
    addSubtaskValidator(),
    validator,
    createSubTask,
  )
router
  .route("/:projectId/t/:taskId/subtasks/:subTaskId")
  .put(
    validateProjectPermission(adminRoles),
    updateSubtaskValidator(),
    validator,
    updateSubTask,
  )
  .delete(validateProjectPermission(adminRoles), deleteSubTask)

export default router
