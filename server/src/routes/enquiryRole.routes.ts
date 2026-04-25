import { Router } from "express";
import requireApiAuth from "../middleware/requireApiAuth.js";
import {
	createEnquiryRoleController,
	deleteEnquiryRoleController,
	getEnquiryRoleByIdController,
	getEnquiryRolesController,
	updateEnquiryRoleController,
} from "../controllers/enquiryRole.controller.js";

const router = Router();

router.post("/", requireApiAuth, createEnquiryRoleController);
router.get("/", requireApiAuth, getEnquiryRolesController);
router.get("/:id", requireApiAuth, getEnquiryRoleByIdController);
router.patch("/:id", requireApiAuth, updateEnquiryRoleController);
router.delete("/:id", requireApiAuth, deleteEnquiryRoleController);

export default router;
