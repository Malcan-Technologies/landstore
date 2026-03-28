import { Router } from "express";
import {
	createEnquiryController,
	getEnquiriesController,
	getEnquiryByIdController,
	getEnquiriesByPropertyIdController,
	getEnquiriesByUserIdController,
	updateEnquiryController,
	updateEnquiryStatusController,
	deleteEnquiryController,
} from "../controllers/enquiry.controller.ts";
import requireApiAuth from "../middleware/requireApiAuth.ts";

const router = Router();

// Enquiry filter routes (specific routes before parameterized routes)
router.get("/property/:propertyId", requireApiAuth, getEnquiriesByPropertyIdController);
router.get("/user/:userId", requireApiAuth, getEnquiriesByUserIdController);

// Enquiry CRUD routes
router.post("/", requireApiAuth, createEnquiryController);
router.get("/", requireApiAuth, getEnquiriesController);
router.get("/:id", requireApiAuth, getEnquiryByIdController);
router.patch("/:id", requireApiAuth, updateEnquiryController);
router.patch("/:id/status", requireApiAuth, updateEnquiryStatusController);
router.delete("/:id", requireApiAuth, deleteEnquiryController);

export default router;
