import express from "express";
import requireApiAuth from "../middleware/requireApiAuth";
import {
	createUtilizationController,
	getAllUtilizationsController,
	getUtilizationByIdController,
	updateUtilizationController,
	deleteUtilizationController,
} from "../controllers/utilization.controller";

const router = express.Router();

/**
 * POST /api/utilizations
 * Create a new utilization
 * @param {string} name - The name of the utilization
 */
router.post("/", requireApiAuth, createUtilizationController);

/**
 * GET /api/utilizations
 * Get all utilizations
 */
router.get("/", getAllUtilizationsController);

/**
 * GET /api/utilizations/:utilId
 * Get a single utilization by ID
 */
router.get("/:utilId", getUtilizationByIdController);

/**
 * PATCH /api/utilizations/:utilId
 * Update a utilization
 * @param {string} name - The new name of the utilization
 */
router.patch("/:utilId", requireApiAuth, updateUtilizationController);

/**
 * DELETE /api/utilizations/:utilId
 * Delete a utilization
 */
router.delete("/:utilId", requireApiAuth, deleteUtilizationController);

export default router;
