import { Router } from "express";
import requireApiAuth from "../middleware/requireApiAuth.js";
import optionalApiAuth from "../middleware/optionalApiAuth.js";
import { requireAdmin } from "../middleware/authorization.js";
import authorizeListLandVisibility from "../middleware/authorizeListLandVisibility.js";
import upload from "../middleware/multer.js";
import {
	createListLandController,
	deleteListLandController,
	getListLandByIdController,
	getListLandsController,
	getAllListingsController,
	updateListLandController,
	requestListLandChangesController,
	searchPropertiesByRadiusController,
	getActiveListingsOverTimeController,
	getListingStatusCountsController,
} from "../controllers/listLand.controller.js";

const listLandRouter = Router();

// Create property with images and documents: Images + Documents uploaded to S3 -> Media/Document records created -> Property created
listLandRouter.post("/", requireApiAuth, upload.any(), createListLandController);

// Search properties by geographic radius (public with optional authentication)
listLandRouter.post("/search/by-radius", optionalApiAuth, searchPropertiesByRadiusController);

// Get all public listings (accessible to any authenticated user)
listLandRouter.get("/all-listings", requireApiAuth, requireAdmin,getAllListingsController);

// Get active listings analytics over time (admin only)
listLandRouter.get("/analytics/active-listings", requireApiAuth, requireAdmin, getActiveListingsOverTimeController);

// Get total listings and counts by listing status (admin only)
listLandRouter.get("/analytics/listing-status-counts", requireApiAuth, requireAdmin, getListingStatusCountsController);

// Get all properties (user-specific or all for admin)
listLandRouter.get("/", requireApiAuth, getListLandsController);

// Request changes for a property listing (admin only)
listLandRouter.post("/:id/request-changes", requireApiAuth, requireAdmin, requestListLandChangesController);

// Get single property (public active-only, owner/admin can see all statuses)
listLandRouter.get("/:id", optionalApiAuth, authorizeListLandVisibility, getListLandByIdController);

// Update property with optional image and document uploads
listLandRouter.patch("/:id", requireApiAuth, upload.any(), updateListLandController);

// Delete property
listLandRouter.delete("/:id", requireApiAuth, deleteListLandController);

export default listLandRouter;
