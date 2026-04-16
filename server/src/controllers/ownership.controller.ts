import type { Request, Response } from "express";
import {
	createOwnershipType,
	getAllOwnershipTypes,
	getOwnershipTypeById,
	updateOwnershipType,
	deleteOwnershipType,
} from "../services/ownership.js";

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
 * Create a new property ownership type
 */
export const createOwnershipTypeController = async (
	req: Request,
	res: Response
) => {
	try {
		getRequesterUserOrThrow(req);

		const { name } = req.body;

		const result = await createOwnershipType(name);

		res.status(201).json({
			success: true,
			message: "Ownership type created successfully",
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
 * Get all property ownership types
 */
export const getAllOwnershipTypesController = async (
	req: Request,
	res: Response
) => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;

		const result = await getAllOwnershipTypes(page, limit);

		res.status(200).json({
			success: true,
			message: "Ownership types retrieved successfully",
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
 * Get a single property ownership type by ID
 */
export const getOwnershipTypeByIdController = async (
	req: Request,
	res: Response
) => {
	try {
		const typeId = req.params.typeId as string;

		const type = await getOwnershipTypeById(typeId);

		res.status(200).json({
			success: true,
			message: "Ownership type retrieved successfully",
			data: type,
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
 * Update a property ownership type
 */
export const updateOwnershipTypeController = async (
	req: Request,
	res: Response
) => {
	try {
		await getRequesterUserOrThrow(req);

		const typeId = req.params.typeId as string;
		const { name } = req.body;

		const result = await updateOwnershipType(typeId, name);

		res.status(200).json({
			success: true,
			message: "Ownership type updated successfully",
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
 * Delete a property ownership type
 */
export const deleteOwnershipTypeController = async (
	req: Request,
	res: Response
) => {
	try {
		await getRequesterUserOrThrow(req);

		const typeId = req.params.typeId as string;

		await deleteOwnershipType(typeId);

		res.status(200).json({
			success: true,
			message: "Ownership type deleted successfully",
		});
	} catch (error: any) {
		const { statusCode, message } = getErrorPayload(error);
		res.status(statusCode).json({
			success: false,
			message,
		});
	}
};
