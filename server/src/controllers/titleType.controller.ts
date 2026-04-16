import type { Request, Response } from "express";
import {
	createTitleType,
	getAllTitleTypes,
	getTitleTypeById,
	updateTitleType,
	deleteTitleType,
} from "../services/titleType.js";

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

/**
 * Create a new land title type
 */
export const createTitleTypeController = async (
	req: Request,
	res: Response
) => {
	try {
		getRequesterUserOrThrow(req);

		const { name } = req.body;

		const result = await createTitleType(name);

		res.status(201).json({
			success: true,
			message: "Land title type created successfully",
			data: result,
		});
	} catch (error: any) {
		const { statusCode, message } = getErrorPayload(error);
		res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

/**
 * Get all land title types
 */
export const getAllTitleTypesController = async (
	req: Request,
	res: Response
) => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;

		const result = await getAllTitleTypes(page, limit);

		res.status(200).json({
			success: true,
			message: "Land title types retrieved successfully",
			data: result.items,
			pagination: result.pagination,
		});
	} catch (error: any) {
		const { statusCode, message } = getErrorPayload(error);
		res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

/**
 * Get a single land title type by ID
 */
export const getTitleTypeByIdController = async (
	req: Request,
	res: Response
) => {
	try {
		const typeId = req.params.typeId as string;

		const titleType = await getTitleTypeById(typeId);

		res.status(200).json({
			success: true,
			message: "Land title type retrieved successfully",
			data: titleType,
		});
	} catch (error: any) {
		const { statusCode, message } = getErrorPayload(error);
		res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

/**
 * Update a land title type
 */
export const updateTitleTypeController = async (
	req: Request,
	res: Response
) => {
	try {
		await getRequesterUserOrThrow(req);

		const typeId = req.params.typeId as string;
		const { name } = req.body;

		const result = await updateTitleType(typeId, name);

		res.status(200).json({
			success: true,
			message: "Land title type updated successfully",
			data: result,
		});
	} catch (error: any) {
		const { statusCode, message } = getErrorPayload(error);
		res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

/**
 * Delete a land title type
 */
export const deleteTitleTypeController = async (
	req: Request,
	res: Response
) => {
	try {
		await getRequesterUserOrThrow(req);

		const typeId = req.params.typeId as string;

		await deleteTitleType(typeId);

		res.status(200).json({
			success: true,
			message: "Land title type deleted successfully",
		});
	} catch (error: any) {
		const { statusCode, message } = getErrorPayload(error);
		res.status(statusCode).json({
			success: false,
			message,
		});
	}
};
