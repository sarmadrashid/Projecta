import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
  addProjectMember,
  createProject,
  deleteProject,
  getProjectById,
  getProjectMembers,
  removeProjectMember,
  updateMemberRole,
  updateProject,
  getProjects,
} from "../controllers/project.controller.js"
import { validateProjectPermission } from "../middlewares/permissionValidator.middleware.js"
import { validator } from "../middlewares/validator.middleware.js"
import {
  addProjectMemberValidator,
  addProjectValidator,
} from "../validators/index.js"
import { AvailableUserRoles, UserRolesEnum } from "../constant.js"

const router = Router()
router.use(verifyJWT)
router
  .route("/")
  .get(getProjects)
  .post(addProjectValidator(), validator, createProject)

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRoles), getProjectById)
  .put(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    addProjectValidator(),
    validator,
    updateProject,
  )
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProject)

router
  .route("/:projectId/members")
  .get(getProjectMembers)
  .post(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    addProjectMemberValidator(),
    validator,
    addProjectMember,
  )
router
  .route("/:projectId/members/:userId")
  .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateMemberRole)
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), removeProjectMember)

export default router
