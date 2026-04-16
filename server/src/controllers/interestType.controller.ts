import type { Request, Response } from "express";
import {
	createInterestType,
	getAllInterestTypes,
	getInterestTypeById,
	updateInterestType,
	deleteInterestType,
} from "../services/interestType.js";

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

const getInterestTypeIdParamOrThrow = (req: Request): string => {
	const param = req.params.id;
	if (typeof param !== "string" || !param.trim()) {
		const badRequestError = new Error("Invalid interest type id");
		(badRequestError as Error & { statusCode?: number }).statusCode = 400;
		throw badRequestError;
	}

	return param;
};

/**
 * Create a new interest type
 * POST /api/interest-types
 */
export const createInterestTypeController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated (can be restricted to admins later if needed)
		getRequesterUserOrThrow(req);

		const { name } = req.body;

		if (!name) {
			const badRequestError = new Error("Interest type name is required");
			(badRequestError as Error & { statusCode?: number }).statusCode = 400;
			throw badRequestError;
		}

		const interestType = await createInterestType(name);

		res.status(201).json({
			success: true,
			message: "Interest type created successfully",
			data: interestType,
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
 * Get all interest types
 * GET /api/interest-types
 */
export const getAllInterestTypesController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;

		const result = await getAllInterestTypes(page, limit);

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
 * Get a single interest type by ID
 * GET /api/interest-types/:id
 */
export const getInterestTypeByIdController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const interestTypeId = getInterestTypeIdParamOrThrow(req);

		const interestType = await getInterestTypeById(interestTypeId);

		res.status(200).json({
			success: true,
			data: interestType,
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
 * Update interest type name
 * PATCH /api/interest-types/:id
 */
export const updateInterestTypeController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated (can be restricted to admins later if needed)
		getRequesterUserOrThrow(req);

		const interestTypeId = getInterestTypeIdParamOrThrow(req);

		const { name } = req.body;

		if (!name) {
			const badRequestError = new Error("Interest type name is required");
			(badRequestError as Error & { statusCode?: number }).statusCode = 400;
			throw badRequestError;
		}

		const updatedInterestType = await updateInterestType(interestTypeId, name);

		res.status(200).json({
			success: true,
			message: "Interest type updated successfully",
			data: updatedInterestType,
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
 * Delete an interest type
 * DELETE /api/interest-types/:id
 */
export const deleteInterestTypeController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated (can be restricted to admins later if needed)
		getRequesterUserOrThrow(req);

		const interestTypeId = getInterestTypeIdParamOrThrow(req);

		await deleteInterestType(interestTypeId);

		res.status(200).json({
			success: true,
			message: "Interest type deleted successfully",
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};
