import { Router } from "express";
import {
  createLeaseholdDetailController,
  getLeaseholdDetailByIdController,
  getLeaseholdDetailByPropertyIdController,
  updateLeaseholdDetailController,
  deleteLeaseholdDetailController,
  getAllLeaseholdDetailsController,
} from "../controllers/leasehold.controller.js";

const router = Router();

// Create leasehold detail
router.post("/", createLeaseholdDetailController);

// Get all leasehold details
router.get("/", getAllLeaseholdDetailsController);

// Get leasehold detail by property ID
router.get("/property/:propertyId", getLeaseholdDetailByPropertyIdController);

// Get leasehold detail by ID
router.get("/:id", getLeaseholdDetailByIdController);

// Update leasehold detail
router.put("/:id", updateLeaseholdDetailController);

// Delete leasehold detail
router.delete("/:id", deleteLeaseholdDetailController);

export default router;
