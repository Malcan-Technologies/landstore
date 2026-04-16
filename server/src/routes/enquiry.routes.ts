import { Router } from "express";
import {
	createEnquiryController,
	getAllMyEnquiriesController,
	getEnquiriesController,
	getEnquiryByIdController,
	getEnquiriesByPropertyIdController,
	getEnquiriesByUserIdController,
	updateEnquiryController,
	updateEnquiryStatusController,
	deleteEnquiryController,
} from "../controllers/enquiry.controller.js";
import { requireAdmin } from "../middleware/authorization.js";
import requireApiAuth from "../middleware/requireApiAuth.js";

const router = Router();

// Get all enquiries for authenticated user (specific route before parameterized routes)
router.get("/my-enquiries", requireApiAuth, getAllMyEnquiriesController);

// Enquiry filter routes (specific routes before parameterized routes)
router.get("/property/:propertyId", requireApiAuth, getEnquiriesByPropertyIdController);
router.get("/user/:userId", requireApiAuth, getEnquiriesByUserIdController);

// Enquiry CRUD routes
router.post("/", requireApiAuth, createEnquiryController);
router.get("/", requireApiAuth, requireAdmin,getEnquiriesController);
router.get("/:id", requireApiAuth, getEnquiryByIdController);
router.patch("/:id", requireApiAuth, updateEnquiryController);
router.patch("/:id/status", requireApiAuth, updateEnquiryStatusController);
router.delete("/:id", requireApiAuth, deleteEnquiryController);

export default router;
