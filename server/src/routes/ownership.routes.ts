import express from "express";
import requireApiAuth from "../middleware/requireApiAuth";
import {
	createOwnershipTypeController,
	getAllOwnershipTypesController,
	getOwnershipTypeByIdController,
	updateOwnershipTypeController,
	deleteOwnershipTypeController,
} from "../controllers/ownership.controller";

const router = express.Router();

/**
 * POST /api/ownership-types
 * Create a new property ownership type
 * @param {string} name - The name of the ownership type
 */
router.post("/", requireApiAuth, createOwnershipTypeController);

/**
 * GET /api/ownership-types
 * Get all property ownership types
 */
router.get("/", getAllOwnershipTypesController);

/**
 * GET /api/ownership-types/:typeId
 * Get a single property ownership type by ID
 */
router.get("/:typeId", getOwnershipTypeByIdController);

/**
 * PATCH /api/ownership-types/:typeId
 * Update a property ownership type
 * @param {string} name - The new name of the ownership type
 */
router.patch("/:typeId", requireApiAuth, updateOwnershipTypeController);

/**
 * DELETE /api/ownership-types/:typeId
 * Delete a property ownership type
 */
router.delete("/:typeId", requireApiAuth, deleteOwnershipTypeController);

export default router;
