import type { Request, Response } from "express";
import {
	createEntityType,
	getAllEntityTypes,
	getEntityTypeById,
	updateEntityType,
	deleteEntityType,
} from "../services/entityType.js";

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
		const unauthorizedError = new Error("Unauthorized");
		(unauthorizedError as Error & { statusCode?: number }).statusCode = 401;
		throw unauthorizedError;
	}

	return user;
};

const getEntityTypeIdParamOrThrow = (req: Request): string => {
	const param = req.params.id;
	if (typeof param !== "string" || !param.trim()) {
		const badRequestError = new Error("Invalid entity type id");
		(badRequestError as Error & { statusCode?: number }).statusCode = 400;
		throw badRequestError;
	}

	return param;
};

/**
 * Create a new entity type
 * POST /api/entity-types
 */
export const createEntityTypeController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated (can be restricted to admins later if needed)
		getRequesterUserOrThrow(req);

		const { name } = req.body;

		if (!name) {
			const badRequestError = new Error("Entity type name is required");
			(badRequestError as Error & { statusCode?: number }).statusCode = 400;
			throw badRequestError;
		}

		const entityType = await createEntityType(name);

		res.status(201).json({
			success: true,
			message: "Entity type created successfully",
			data: entityType,
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
 * Get all entity types
 * GET /api/entity-types
 */
export const getAllEntityTypesController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const entityTypes = await getAllEntityTypes();

		res.status(200).json({
			success: true,
			data: entityTypes,
			count: entityTypes.length,
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
 * Get a single entity type by ID
 * GET /api/entity-types/:id
 */
export const getEntityTypeByIdController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const entityTypeId = getEntityTypeIdParamOrThrow(req);

		const entityType = await getEntityTypeById(entityTypeId);

		res.status(200).json({
			success: true,
			data: entityType,
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
 * Update entity type name
 * PATCH /api/entity-types/:id
 */
export const updateEntityTypeController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated (can be restricted to admins later if needed)
		getRequesterUserOrThrow(req);

		const entityTypeId = getEntityTypeIdParamOrThrow(req);

		const { name } = req.body;

		if (!name) {
			const badRequestError = new Error("Entity type name is required");
			(badRequestError as Error & { statusCode?: number }).statusCode = 400;
			throw badRequestError;
		}

		const updatedEntityType = await updateEntityType(entityTypeId, name);

		res.status(200).json({
			success: true,
			message: "Entity type updated successfully",
			data: updatedEntityType,
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
 * Delete an entity type
 * DELETE /api/entity-types/:id
 */
export const deleteEntityTypeController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Verify user is authenticated (can be restricted to admins later if needed)
		getRequesterUserOrThrow(req);

		const entityTypeId = getEntityTypeIdParamOrThrow(req);

		await deleteEntityType(entityTypeId);

		res.status(200).json({
			success: true,
			message: "Entity type deleted successfully",
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};
