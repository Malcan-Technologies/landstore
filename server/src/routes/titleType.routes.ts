import express from "express";
import requireApiAuth from "../middleware/requireApiAuth.js";
import {
	createTitleTypeController,
	getAllTitleTypesController,
	getTitleTypeByIdController,
	updateTitleTypeController,
	deleteTitleTypeController,
} from "../controllers/titleType.controller.js";

const router = express.Router();

/**
 * POST /api/title-types
 * Create a new land title type
 * @param {string} name - The name of the land title type
 */
router.post("/", requireApiAuth, createTitleTypeController);

/**
 * GET /api/title-types
 * Get all land title types
 */
router.get("/", getAllTitleTypesController);

/**
 * GET /api/title-types/:typeId
 * Get a single land title type by ID
 */
router.get("/:typeId", getTitleTypeByIdController);

/**
 * PATCH /api/title-types/:typeId
 * Update a land title type
 * @param {string} name - The new name of the land title type
 */
router.patch("/:typeId", requireApiAuth, updateTitleTypeController);

/**
 * DELETE /api/title-types/:typeId
 * Delete a land title type
 */
router.delete("/:typeId", requireApiAuth, deleteTitleTypeController);

export default router;
