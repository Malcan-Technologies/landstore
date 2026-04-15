import { Router } from "express";
import requireApiAuth from "../middleware/requireApiAuth.js";
import upload from "../middleware/multer.js";
import {
	createListLandController,
	deleteListLandController,
	getListLandByIdController,
	getListLandsController,
	getAllListingsController,
	updateListLandController,
	searchPropertiesByRadiusController,
} from "../controllers/listLand.controller.js";

const listLandRouter = Router();

// Create property with images and documents: Images + Documents uploaded to S3 -> Media/Document records created -> Property created
listLandRouter.post("/", requireApiAuth, upload.any(), createListLandController);

// Search properties by geographic radius
listLandRouter.post("/search/by-radius", requireApiAuth, searchPropertiesByRadiusController);

// Get all public listings (accessible to any authenticated user)
listLandRouter.get("/all-listings", requireApiAuth, getAllListingsController);

// Get all properties (user-specific or all for admin)
listLandRouter.get("/", requireApiAuth, getListLandsController);

// Get single property
listLandRouter.get("/:id", requireApiAuth, getListLandByIdController);

// Update property with optional image and document uploads
listLandRouter.patch("/:id", requireApiAuth, upload.any(), updateListLandController);

// Delete property
listLandRouter.delete("/:id", requireApiAuth, deleteListLandController);

export default listLandRouter;
