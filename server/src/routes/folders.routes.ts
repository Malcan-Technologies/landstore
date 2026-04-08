import { Router } from "express";
import {
	createFolderController,
	getFoldersController,
	getFolderByIdController,
	updateFolderNameController,
	deleteFolderController,
	addPropertyToFolderController,
	removePropertyFromFolderController,
	checkPropertyShortlistedController,
} from "../controllers/folders.controller.ts";
import requireApiAuth from "../middleware/requireApiAuth.ts";
import { requireAdmin } from "../middleware/authorization.ts";

const router = Router();

// Folder CRUD routes
router.post("/", requireApiAuth, createFolderController);
router.get("/", requireApiAuth, requireAdmin ,getFoldersController);
router.get("/:id", requireApiAuth, getFolderByIdController);
router.patch("/:id", requireApiAuth, updateFolderNameController);
router.delete("/:id", requireApiAuth, deleteFolderController);

// Shortlist routes
router.post("/:id/shortlist", requireApiAuth, addPropertyToFolderController);
router.delete("/:id/shortlist/:propertyId", requireApiAuth, removePropertyFromFolderController);
router.get("/:id/shortlist/:propertyId", checkPropertyShortlistedController);

export default router;
