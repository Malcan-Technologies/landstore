import { Router } from "express";
import {
	createEntityTypeController,
	getAllEntityTypesController,
	getEntityTypeByIdController,
	updateEntityTypeController,
	deleteEntityTypeController,
} from "../controllers/entityType.controller.js";
import requireApiAuth from "../middleware/requireApiAuth.js";

const router = Router();

// Entity type CRUD routes
router.post("/", requireApiAuth, createEntityTypeController);
router.get("/", getAllEntityTypesController);
router.get("/:id", getEntityTypeByIdController);
router.patch("/:id", requireApiAuth, updateEntityTypeController);
router.delete("/:id", requireApiAuth, deleteEntityTypeController);

export default router;
