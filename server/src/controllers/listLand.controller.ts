import type { Request, Response } from "express";
import {
	createListLand,
	deleteListLandById,
	getListLandById,
	getListLands,
	updateListLandById,
	uploadPropertyImages,
	uploadPropertyDocuments,
} from "../services/listLand.ts";
import { getRequesterUserFromToken } from "../services/user.ts";

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

const getPropertyIdParamOrThrow = (req: Request): string => {
	const param = req.params.id;
	if (typeof param !== "string" || !param.trim()) {
		const badRequestError = new Error("Invalid property id");
		(badRequestError as Error & { statusCode?: number }).statusCode = 400;
		throw badRequestError;
	}

	return param;
};

/**
 * Create property listing endpoint
 * Flow: Images & Documents uploaded (multipart) -> Upload to S3 -> Media/Document records created -> Property created with all details
 */
export const createListLandController = async (req: Request, res: Response) => {
	try {
		const requester = await getRequesterUserOrThrow(req);
		const files = req.files as Express.Multer.File[];

		let mediaIds: string[] = [];
		let documentIds: string[] = [];

		if (files && files.length > 0) {
			// Separate images and documents by field name
			const imageFiles: Express.Multer.File[] = [];
			const documentFiles: Express.Multer.File[] = [];

			for (const file of files) {
				if (file.fieldname === "images") {
					imageFiles.push(file);
				} else if (file.fieldname === "documents") {
					documentFiles.push(file);
				}
			}

			// Upload images if provided
			if (imageFiles.length > 0) {
				mediaIds = await uploadPropertyImages(requester.id, imageFiles);
			}

			// Upload documents/geran if provided
			if (documentFiles.length > 0) {
				documentIds = await uploadPropertyDocuments(requester.id, documentFiles);
			}
		}

		// Add uploaded media IDs and document IDs to payload
		const payload = {
			...req.body,
			landMediaIds: mediaIds.length > 0 ? mediaIds : req.body.landMediaIds,
			documentIds: documentIds.length > 0 ? documentIds : req.body.documentIds,
		};

		// Create property with images, documents and all other details
		const property = await createListLand(requester.id, payload);

		return res.status(201).json({
			message: "Property created successfully with images and documents",
			property,
			imageCount: mediaIds.length,
			documentCount: documentIds.length,
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};

/**
 * Get all properties endpoint
 * Supports pagination and status filtering
 */
export const getListLandsController = async (req: Request, res: Response) => {
	try {
		const requester = await getRequesterUserOrThrow(req);

		const page = req.query.page ? Number(req.query.page) : undefined;
		const limit = req.query.limit ? Number(req.query.limit) : undefined;
		const status =
			typeof req.query.status === "string" ? req.query.status : undefined;

		const result = await getListLands(requester.id, requester.userType, {
			page,
			limit,
			status,
		});

		return res.status(200).json(result);
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};

/**
 * Get single property endpoint
 */
export const getListLandByIdController = async (req: Request, res: Response) => {
	try {
		const requester = await getRequesterUserOrThrow(req);
		const propertyId = getPropertyIdParamOrThrow(req);

		const property = await getListLandById(
			propertyId,
			requester.id,
			requester.userType
		);

		return res.status(200).json({ property });
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};

/**
 * Update property endpoint
 * Can also upload new images and documents to update property
 */
export const updateListLandController = async (req: Request, res: Response) => {
	try {
		const requester = await getRequesterUserOrThrow(req);
		const propertyId = getPropertyIdParamOrThrow(req);
		const files = req.files as Express.Multer.File[];

		let mediaIds: string[] = [];
		let documentIds: string[] = [];

		if (files && files.length > 0) {
			// Separate images and documents by field name
			const imageFiles: Express.Multer.File[] = [];
			const documentFiles: Express.Multer.File[] = [];

			for (const file of files) {
				if (file.fieldname === "images") {
					imageFiles.push(file);
				} else if (file.fieldname === "documents") {
					documentFiles.push(file);
				}
			}

			// Upload images if provided
			if (imageFiles.length > 0) {
				mediaIds = await uploadPropertyImages(requester.id, imageFiles);
			}

			// Upload documents if provided
			if (documentFiles.length > 0) {
				documentIds = await uploadPropertyDocuments(requester.id, documentFiles);
			}
		}

		// Add uploaded media IDs and document IDs to payload
		const payload = {
			...req.body,
			...(mediaIds.length > 0 && { landMediaIds: mediaIds }),
			...(documentIds.length > 0 && { documentIds }),
		};

		const property = await updateListLandById(
			propertyId,
			requester.id,
			requester.userType,
			payload
		);

		return res.status(200).json({
			message: "Property updated successfully",
			property,
			imageCount: mediaIds.length,
			documentCount: documentIds.length,
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};

/**
 * Delete property endpoint (Soft Delete)
 * Marks property as deleted by setting deletedAt timestamp
 */
export const deleteListLandController = async (req: Request, res: Response) => {
	try {
		const requester = await getRequesterUserOrThrow(req);
		const propertyId = getPropertyIdParamOrThrow(req);

		const result = await deleteListLandById(
			propertyId,
			requester.id,
			requester.userType
		);

		return res.status(200).json(result);
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};
