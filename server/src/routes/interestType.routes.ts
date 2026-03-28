import { Router } from "express";
import {
	createInterestTypeController,
	getAllInterestTypesController,
	getInterestTypeByIdController,
	updateInterestTypeController,
	deleteInterestTypeController,
} from "../controllers/interestType.controller.ts";
import requireApiAuth from "../middleware/requireApiAuth.ts";

const router = Router();

// Interest type CRUD routes
router.post("/", requireApiAuth, createInterestTypeController);
router.get("/", getAllInterestTypesController);
router.get("/:id", getInterestTypeByIdController);
router.patch("/:id", requireApiAuth, updateInterestTypeController);
router.delete("/:id", requireApiAuth, deleteInterestTypeController);

export default router;
