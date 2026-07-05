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
} from "../controllers/project.controller.js"
import { validateProjectPermission } from "../middlewares/permissionValidator.middleware.js"
import { addProjectValidator } from "../validators/index.js"
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
    createProjectValidator(),
    validator,
    updateProject,
  )
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProject)
router.route("/:projectId/members").get(getProjectMembers)
router
  .route("/:projectId/members/:userId")
  .post(
    verifyJWT,
    validateProjectPermission(["Admin"]),
    validator,
    addProjectMember,
  )
router
  .route("/:projectId/members/:userId")
  .put(verifyJWT, validateProjectPermission(["Admin"]), updateMemberRole)
router
  .route("/:projectId/members/:userId")
  .delete(verifyJWT, validateProjectPermission(["Admin"]), removeProjectMember)

export default router
