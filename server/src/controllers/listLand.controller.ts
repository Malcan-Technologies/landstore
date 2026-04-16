import type { Request, Response } from "express";
import {
	createListLand,
	deleteListLandById,
	getListLandById,
	getListLands,
	getAllListings,
	updateListLandById,
	uploadPropertyImages,
	uploadPropertyDocuments,
	getUploadedMediaAndDocuments,
	searchPropertiesByRadius,
	type CreateListLandPayload,
} from "../services/listLand.js";
import type { GetLandsQuery } from "../../types/express/land.types.js";

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

const getPropertyIdParamOrThrow = (req: Request): string => {
	const param = req.params.id;
	if (typeof param !== "string" || !param.trim()) {
		const badRequestError = new Error("Invalid property id");
		(badRequestError as Error & { statusCode?: number }).statusCode = 400;
		throw badRequestError;
	}

	return param;
};

const toNumberOrUndefined = (value: unknown): number | undefined => {
	if (value === undefined || value === null || value === "") return undefined;

	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
};

const getOptionalAuthenticatedUser = (req: Request) => {
	try {
		return getRequesterUserOrThrow(req);
	} catch {
		return null;
	}
};

const buildNestedMultipartPayload = (body: Record<string, unknown>) => {
	const payload: Record<string, unknown> = { ...body };

	if (typeof payload.location === "string") {
		try {
			payload.location = JSON.parse(payload.location);
		} catch {
			// Keep original value when not valid JSON.
		}
	}

	if (typeof payload.leaseholdDetails === "string") {
		try {
			payload.leaseholdDetails = JSON.parse(payload.leaseholdDetails);
		} catch {
			// Keep original value when not valid JSON.
		}
	}

	const hasDottedLocation =
		payload["location.state"] !== undefined ||
		payload["location.district"] !== undefined ||
		payload["location.mukim"] !== undefined ||
		payload["location.section"] !== undefined ||
		payload["location.latitude"] !== undefined ||
		payload["location.longitude"] !== undefined ||
		payload["location.isApproximate"] !== undefined;

	if (hasDottedLocation) {
		payload.location = {
			...(payload["location.state"] !== undefined ? { state: payload["location.state"] } : {}),
			...(payload["location.district"] !== undefined ? { district: payload["location.district"] } : {}),
			...(payload["location.mukim"] !== undefined ? { mukim: payload["location.mukim"] } : {}),
			...(payload["location.section"] !== undefined ? { section: payload["location.section"] } : {}),
			...(payload["location.latitude"] !== undefined ? { latitude: payload["location.latitude"] } : {}),
			...(payload["location.longitude"] !== undefined ? { longitude: payload["location.longitude"] } : {}),
			...(payload["location.isApproximate"] !== undefined
				? { isApproximate: payload["location.isApproximate"] }
				: {}),
		};
	}

	delete payload["location.state"];
	delete payload["location.district"];
	delete payload["location.mukim"];
	delete payload["location.section"];
	delete payload["location.latitude"];
	delete payload["location.longitude"];
	delete payload["location.isApproximate"];

	const startYearFromLeaseDate =
		typeof payload.leaseStartDate === "string"
			? (() => {
					const parsedDate = new Date(payload.leaseStartDate);
					return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate.getFullYear();
			  })()
			: undefined;

	const hasDottedLeasehold =
		payload["leaseholdDetails.startYear"] !== undefined ||
		payload["leaseholdDetails.leasePeriodYears"] !== undefined;

	const startYear =
		toNumberOrUndefined(payload["leaseholdDetails.startYear"]) ?? startYearFromLeaseDate;
	const leasePeriodYears = toNumberOrUndefined(payload["leaseholdDetails.leasePeriodYears"]);

	if (hasDottedLeasehold && startYear !== undefined && leasePeriodYears !== undefined) {
		payload.leaseholdDetails = {
			startYear,
			leasePeriodYears,
		};
	}

	delete payload["leaseholdDetails.startYear"];
	delete payload["leaseholdDetails.leasePeriodYears"];

	return payload;
};

/**
 * Create property listing endpoint
 * Flow: Images & Documents uploaded (multipart) -> Upload to S3 -> Media/Document records created -> Property created with all details
 */
export const createListLandController = async (req: Request, res: Response) => {
	try {
		const requester = getRequesterUserOrThrow(req);
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

		const normalizedBody = buildNestedMultipartPayload(req.body as Record<string, unknown>);

		// Add uploaded media IDs and document IDs to payload
		const payload = {
			...normalizedBody,
			landMediaIds: mediaIds.length > 0 ? mediaIds : req.body.landMediaIds,
			documentIds: documentIds.length > 0 ? documentIds : req.body.documentIds,
		} as CreateListLandPayload;

		// Create property with images, documents and all other details
		const property = await createListLand(requester.id, payload);

		// Fetch uploaded media and documents with their URLs
		const uploadedAssets = await getUploadedMediaAndDocuments(mediaIds, documentIds);

		return res.status(201).json({
			message: "Property created successfully with images and documents",
			property,
			uploadedAssets,
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
		const requester = getRequesterUserOrThrow(req);

		const page = parseInt(req.query.page as string) || 1
		const limit = parseInt(req.query.limit as string) || 10

		const query: GetLandsQuery = {
			page,
			limit,
			status: req.query.status as string
		}

		const result = await getListLands(requester.id, requester.userType, query);

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
		const propertyId = getPropertyIdParamOrThrow(req);
		
		// Get user ID if authenticated (optional)
		let userId: string | undefined;
		try {
			const user = getRequesterUserOrThrow(req);
			userId = user.id;
		} catch {
			// User not authenticated, proceed without userId
		}

		const property = await getListLandById(
			propertyId,
			userId
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
		const requester = getRequesterUserOrThrow(req);
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

		const normalizedBody = buildNestedMultipartPayload(req.body as Record<string, unknown>);

		// Add uploaded media IDs and document IDs to payload
		const payload = {
			...normalizedBody,
			...(mediaIds.length > 0 && { landMediaIds: mediaIds }),
			...(documentIds.length > 0 && { documentIds }),
		};

		const property = await updateListLandById(
			propertyId,
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
		const requester = getRequesterUserOrThrow(req);
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

/**
 * Get all public listings endpoint
 * Accessible by any authenticated user
 * Returns all approved listings with pagination
 */
export const getAllListingsController = async (req: Request, res: Response) => {
	try {
		const user = getRequesterUserOrThrow(req); // Verify user is authenticated

		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;

		const query: GetLandsQuery = {
			page,
			limit,
		};

		const result = await getAllListings(query, user.id);

		return res.status(200).json(result);
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};

/**
 * SEARCH PROPERTIES BY RADIUS
 * POST /api/list-lands/search/by-radius
 * Body: { latitude, longitude, radiusKm }
 * Query: { page?, limit? }
 *
 * Searches for active properties within a geographic radius using:
 * 1. Bounding box calculation for initial filtering
 * 2. Pythagorean theorem for precise distance verification
 *
 * Returns: { items, pagination, searchParams }
 */
export const searchPropertiesByRadiusController = async (
	req: Request,
	res: Response
) => {
	try {
		const { latitude, longitude, radiusKm } = req.body;

		// Validate required fields
		if (latitude === undefined || latitude === null) {
			return res.status(400).json({
				success: false,
				message: "Latitude is required",
			});
		}

		if (longitude === undefined || longitude === null) {
			return res.status(400).json({
				success: false,
				message: "Longitude is required",
			});
		}

		if (radiusKm === undefined || radiusKm === null) {
			return res.status(400).json({
				success: false,
				message: "Radius (radiusKm) is required",
			});
		}

		const page = toNumberOrUndefined(req.query.page) || 1;
		const limit = toNumberOrUndefined(req.query.limit) || 10;
		
		// Get user ID if authenticated (optional for public endpoint)
		const user = getOptionalAuthenticatedUser(req);
		const userId = user?.id;
		
		const result = await searchPropertiesByRadius(
			latitude,
			longitude,
			radiusKm,
			page,
			limit,
			userId
		);

		return res.status(200).json({
			success: true,
			message: "Properties found within radius",
			data: result,
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({
			success: false,
			message,
		});
	}
};
