import type { Request, Response } from "express";
import { getRequesterUserFromToken } from "../services/user.ts";
import {
	createTitleType,
	getAllTitleTypes,
	getTitleTypeById,
	updateTitleType,
	deleteTitleType,
} from "../services/titleType.ts";

const getTokenFromRequest = (req: Request): string | null => {
	const authHeader = req.headers.authorization;
	if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
	return (req.cookies as Record<string, string>)?.["__session"] ?? null;
};

const getRequesterUserOrThrow = async (req: Request) => {
	const token = getTokenFromRequest(req);
	if (!token) {
		const unauthorizedError = new Error("Unauthorized");
		(unauthorizedError as Error & { statusCode?: number }).statusCode = 401;
		throw unauthorizedError;
	}

	return getRequesterUserFromToken(token);
};

/**
 * Create a new land title type
 */
export const createTitleTypeController = async (
	req: Request,
	res: Response
) => {
	try {
		await getRequesterUserOrThrow(req);

		const { name } = req.body;

		const result = await createTitleType(name);

		res.status(201).json({
			success: true,
			message: "Land title type created successfully",
			data: result,
		});
	} catch (error: any) {
		const statusCode = error?.statusCode || 500;
		res.status(statusCode).json({
			success: false,
			message: error?.message || "Failed to create land title type",
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
		const types = await getAllTitleTypes();

		res.status(200).json({
			success: true,
			message: "Land title types retrieved successfully",
			data: types,
		});
	} catch (error: any) {
		const statusCode = error?.statusCode || 500;
		res.status(statusCode).json({
			success: false,
			message: error?.message || "Failed to retrieve land title types",
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
		const statusCode = error?.statusCode || 500;
		res.status(statusCode).json({
			success: false,
			message: error?.message || "Failed to retrieve land title type",
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
		const statusCode = error?.statusCode || 500;
		res.status(statusCode).json({
			success: false,
			message: error?.message || "Failed to update land title type",
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
		const statusCode = error?.statusCode || 500;
		res.status(statusCode).json({
			success: false,
			message: error?.message || "Failed to delete land title type",
		});
	}
};
