import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/notes.controller.js"
import { validateProjectPermission } from "../middlewares/permissionValidator.middleware.js"
import { validator } from "../middlewares/validator.middleware.js"

import { AvailableUserRoles, UserRolesEnum } from "../constant.js"
import { addNoteValidator } from "../validators/index.js"

const adminRoles = [UserRolesEnum.ADMIN]

const router = Router()

router.use(verifyJWT)

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRoles), getNotes)
  .post(
    validateProjectPermission(adminRoles),

    addNoteValidator(),
    validator,
    createNote,
  )
router
  .route("/:projectId/n/:noteId")
  .get(validateProjectPermission(AvailableUserRoles), getNoteById)
  .put(
    validateProjectPermission(adminRoles),
    addNoteValidator(),
    validator,
    updateNote,
  )
  .delete(validateProjectPermission(adminRoles), deleteNote)

export default router
