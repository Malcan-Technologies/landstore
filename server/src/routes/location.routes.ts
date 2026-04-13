import { Router } from "express";
import {
  createLocationController,
  getLocationByIdController,
  getLocationByPropertyIdController,
  updateLocationController,
  deleteLocationController,
  getAllLocationsController,
} from "../controllers/location.controller.js";

const router = Router();

// Create location
router.post("/", createLocationController);

// Get all locations
router.get("/", getAllLocationsController);

// Get location by property ID
router.get("/property/:propertyId", getLocationByPropertyIdController);

// Get location by ID
router.get("/:id", getLocationByIdController);

// Update location
router.put("/:id", updateLocationController);

// Delete location
router.delete("/:id", deleteLocationController);

export default router;
