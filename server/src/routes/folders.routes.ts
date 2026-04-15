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
} from "../controllers/folders.controller.js";
import requireApiAuth from "../middleware/requireApiAuth.js";

const router = Router();

// Folder CRUD routes (flat structure only - no nesting)
router.post("/", requireApiAuth, createFolderController);
router.get("/", requireApiAuth, getFoldersController);
router.get("/:id", requireApiAuth, getFolderByIdController);
router.patch("/:id", requireApiAuth, updateFolderNameController);
router.delete("/:id", requireApiAuth, deleteFolderController);

// Shortlist routes
router.post("/:id/shortlist", requireApiAuth, addPropertyToFolderController);
router.delete("/:id/shortlist/:propertyId", requireApiAuth, removePropertyFromFolderController);
router.get("/:id/shortlist", requireApiAuth, checkPropertyShortlistedController);

export default router;
