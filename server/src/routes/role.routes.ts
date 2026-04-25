import { Router } from "express";
import requireApiAuth from "../middleware/requireApiAuth.js";
import {
	createRoleController,
	deleteRoleController,
	getRoleByIdController,
	getRolesController,
	updateRoleController,
} from "../controllers/role.controller.js";

const router = Router();

router.post("/", requireApiAuth, createRoleController);
router.get("/", requireApiAuth, getRolesController);
router.get("/:id", requireApiAuth, getRoleByIdController);
router.patch("/:id", requireApiAuth, updateRoleController);
router.delete("/:id", requireApiAuth, deleteRoleController);

export default router;
