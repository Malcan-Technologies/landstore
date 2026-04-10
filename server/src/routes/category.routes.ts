import { Router } from "express";
import {
	createCategoryController,
	getAllCategoriesController,
	getCategoryByIdController,
	updateCategoryController,
	deleteCategoryController,
} from "../controllers/category.controller.js";
import requireApiAuth  from "../middleware/requireApiAuth.js";

const router = Router();

// Category CRUD routes
router.post("/", requireApiAuth, createCategoryController);
router.get("/", getAllCategoriesController);
router.get("/:id", getCategoryByIdController);
router.patch("/:id", requireApiAuth, updateCategoryController);
router.delete("/:id", requireApiAuth, deleteCategoryController);

export default router;
