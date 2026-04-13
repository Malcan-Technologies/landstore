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
	createSubfolderController,
	getFolderHierarchyController,
	moveFolderController,
	getAllFoldersHierarchyController,
} from "../controllers/folders.controller.js";
import requireApiAuth from "../middleware/requireApiAuth.js";

const router = Router();

// Folder CRUD routes
router.post("/", requireApiAuth, createFolderController);
router.get("/", requireApiAuth, getFoldersController);
router.get("/hierarchy/all", requireApiAuth, getAllFoldersHierarchyController);
router.get("/:id", requireApiAuth, getFolderByIdController);
router.get("/:id/hierarchy", requireApiAuth, getFolderHierarchyController);
router.patch("/:id", requireApiAuth, updateFolderNameController);
router.put("/:id/move", requireApiAuth, moveFolderController);
router.delete("/:id", requireApiAuth, deleteFolderController);

// Subfolder routes
router.post("/:id/subfolders", requireApiAuth, createSubfolderController);

// Shortlist routes
router.post("/:id/shortlist", requireApiAuth, addPropertyToFolderController);
router.delete("/:id/shortlist/:propertyId", requireApiAuth, removePropertyFromFolderController);
router.get("/:id/shortlist/:propertyId", checkPropertyShortlistedController);

export default router;
