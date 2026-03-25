import type { Request, Response } from "express";
import { getRequesterUserFromToken } from "../services/user.ts";
import {
	createFolder,
	getFoldersByUserId,
	getFolderById,
	updateFolderName,
	deleteFolder,
	addPropertyToFolder,
	removePropertyFromFolder,
	isPropertyShortlisted,
} from "../services/folders.ts";

const getErrorPayload = (error: unknown) => {
	const err = error as
		| { statusCode?: number; message?: string; errors?: Array<{ message?: string }> }
		| undefined;

	return {
		statusCode: err?.statusCode ?? 500,
		message: err?.errors?.[0]?.message ?? err?.message ?? "Internal server error",
	};
};

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

const getFolderIdParamOrThrow = (req: Request): string => {
	const param = req.params.id;
	if (typeof param !== "string" || !param.trim()) {
		const badRequestError = new Error("Invalid folder id");
		(badRequestError as Error & { statusCode?: number }).statusCode = 400;
		throw badRequestError;
	}

	return param;
};

const getPropertyIdParamOrThrow = (req: Request): string => {
	const param = req.params.propertyId;
	if (typeof param !== "string" || !param.trim()) {
		const badRequestError = new Error("Invalid property id");
		(badRequestError as Error & { statusCode?: number }).statusCode = 400;
		throw badRequestError;
	}

	return param;
};

/**
 * Create a new shortlist folder
 * POST /api/folders
 */
export const createFolderController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const requester = await getRequesterUserOrThrow(req);
		const { name } = req.body;

		if (!name) {
			const badRequestError = new Error("Folder name is required");
			(badRequestError as Error & { statusCode?: number }).statusCode = 400;
			throw badRequestError;
		}

		const folder = await createFolder(requester.id, name);

		res.status(201).json({
			success: true,
			data: folder,
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
 * Get all folders for the authenticated user
 * GET /api/folders
 */
export const getFoldersController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const requester = await getRequesterUserOrThrow(req);

		const folders = await getFoldersByUserId(requester.id);

		res.status(200).json({
			success: true,
			data: folders,
			count: folders.length,
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
 * Get a single folder by ID
 * GET /api/folders/:id
 */
export const getFolderByIdController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const requester = await getRequesterUserOrThrow(req);
		const folderId = getFolderIdParamOrThrow(req);

		const folder = await getFolderById(folderId, requester.id);

		res.status(200).json({
			success: true,
			data: folder,
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
 * Update folder name (rename)
 * PATCH /api/folders/:id
 */
export const updateFolderNameController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const requester = await getRequesterUserOrThrow(req);
		const folderId = getFolderIdParamOrThrow(req);
		const { name } = req.body;

		if (!name) {
			const badRequestError = new Error("New folder name is required");
			(badRequestError as Error & { statusCode?: number }).statusCode = 400;
			throw badRequestError;
		}

		const updatedFolder = await updateFolderName(folderId, requester.id, name);

		res.status(200).json({
			success: true,
			data: updatedFolder,
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
 * Delete a folder
 * DELETE /api/folders/:id
 */
export const deleteFolderController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const requester = await getRequesterUserOrThrow(req);
		const folderId = getFolderIdParamOrThrow(req);

		await deleteFolder(folderId, requester.id);

		res.status(200).json({
			success: true,
			message: "Folder deleted successfully",
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
 * Add a property to a folder (shortlist)
 * POST /api/folders/:id/shortlist
 */
export const addPropertyToFolderController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const requester = await getRequesterUserOrThrow(req);
		const folderId = getFolderIdParamOrThrow(req);
		const { propertyId } = req.body;

		if (!propertyId) {
			const badRequestError = new Error("Property ID is required");
			(badRequestError as Error & { statusCode?: number }).statusCode = 400;
			throw badRequestError;
		}

		const shortlist = await addPropertyToFolder(
			folderId,
			propertyId,
			requester.id
		);

		res.status(201).json({
			success: true,
			message: "Property added to shortlist",
			data: shortlist,
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
 * Remove a property from a folder
 * DELETE /api/folders/:id/shortlist/:propertyId
 */
export const removePropertyFromFolderController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const requester = await getRequesterUserOrThrow(req);
		const folderId = getFolderIdParamOrThrow(req);
		const propertyId = getPropertyIdParamOrThrow(req);

		await removePropertyFromFolder(folderId, propertyId, requester.id);

		res.status(200).json({
			success: true,
			message: "Property removed from shortlist",
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
 * Check if a property is shortlisted
 * GET /api/folders/:id/shortlist/:propertyId
 */
export const checkPropertyShortlistedController = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const folderId = getFolderIdParamOrThrow(req);
		const propertyId = getPropertyIdParamOrThrow(req);

		const isShortlisted = await isPropertyShortlisted(folderId, propertyId);

		res.status(200).json({
			success: true,
			data: {
				isShortlisted,
			},
		});
	} catch (error: unknown) {
		const errorPayload = getErrorPayload(error);
		res.status(errorPayload.statusCode).json({
			success: false,
			message: errorPayload.message,
		});
	}
};
