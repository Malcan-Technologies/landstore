import type { Request, Response } from "express";
import {
	createCategory,
	getAllCategories,
	getCategoryById,
	updateCategory,
	deleteCategory,
} from "../services/category.js";

const getErrorPayload = (error: unknown) => {
	const err = error as
		| { statusCode?: number; message?: string; errors?: Array<{ message?: string }> }
		| undefined;

	return {
		statusCode: err?.statusCode ?? 500,
		message: err?.errors?.[0]?.message ?? err?.message ?? "Internal server error",
	};
};

const getRequesterUserOrThrow = (req: Request) => {
	// Middleware already validated session and attached user
	const user = (req as any).user;
	if (!user) {
		const unauthorizedError = new Error("Authentication required. Please log in to access this resource.");
		(unauthorizedError as Error & { statusCode?: number }).statusCode = 401;
		throw unauthorizedError;
	}

	return user;
};

const getCategoryIdParamOrThrow = (req: Request): string => {
	const param = req.params.id;
	if (typeof param !== "string" || !param.trim()) {
		const badRequestError = new Error("Invalid category id");
		(badRequestError as Error & { statusCode?: number }).statusCode = 400;
		throw badRequestError;
	}

	return param;
};

/**
 * Create a new property category
 * POST /api/categories
 */
export const createCategoryController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated (can be restricted to admins later if needed)
		getRequesterUserOrThrow(req);

		const { name } = req.body;

		if (!name) {
			const badRequestError = new Error("Category name is required");
			(badRequestError as Error & { statusCode?: number }).statusCode = 400;
			throw badRequestError;
		}

		const category = await createCategory(name);

		res.status(201).json({
			success: true,
			data: category,
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};

/**
 * Get all categories (paginated)
 * GET /api/categories?page=1&limit=10
 */
export const getAllCategoriesController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;

		const result = await getAllCategories(page, limit);

		res.status(200).json({
			success: true,
			data: result.items,
			pagination: result.pagination,
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};

/**
 * Get category by ID
 * GET /api/categories/:id
 */
export const getCategoryByIdController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const categoryId = getCategoryIdParamOrThrow(req);

		const category = await getCategoryById(categoryId);

		res.status(200).json({
			success: true,
			data: category,
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};

/**
 * Update category
 * PATCH /api/categories/:id
 */
export const updateCategoryController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		await getRequesterUserOrThrow(req);

		const categoryId = getCategoryIdParamOrThrow(req);
		const { name } = req.body;

		if (!name) {
			const badRequestError = new Error("Category name is required");
			(badRequestError as Error & { statusCode?: number }).statusCode = 400;
			throw badRequestError;
		}

		const updatedCategory = await updateCategory(categoryId, name);

		res.status(200).json({
			success: true,
			data: updatedCategory,
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};

/**
 * Delete category
 * DELETE /api/categories/:id
 */
export const deleteCategoryController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated
		await getRequesterUserOrThrow(req);

		const categoryId = getCategoryIdParamOrThrow(req);

		await deleteCategory(categoryId);

		res.status(200).json({
			success: true,
			message: "Category deleted successfully",
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};
