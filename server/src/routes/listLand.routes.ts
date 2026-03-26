import { Router } from "express";
import requireApiAuth from "../middleware/requireApiAuth.ts";
import upload from "../middleware/multer.ts";
import {
	createListLandController,
	deleteListLandController,
	getListLandByIdController,
	getListLandsController,
	updateListLandController,
} from "../controllers/listLand.controller.ts";

const listLandRouter = Router();

// Create property with images and documents: Images + Documents uploaded to S3 -> Media/Document records created -> Property created
listLandRouter.post("/", requireApiAuth, upload.any(), createListLandController);

// Get all properties
listLandRouter.get("/", requireApiAuth, getListLandsController);

// Get single property
listLandRouter.get("/:id", requireApiAuth, getListLandByIdController);

// Update property with optional image and document uploads
listLandRouter.patch("/:id", requireApiAuth, upload.any(), updateListLandController);

// Delete property
listLandRouter.delete("/:id", requireApiAuth, deleteListLandController);

export default listLandRouter;
