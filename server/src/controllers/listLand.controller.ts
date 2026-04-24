
import type { Request, Response } from "express";
import {
	createListLand,
	deleteListLandById,
	getListLandById,
	getListLands,
	getAllListings,
	updateListLandById,
	requestListLandChanges,
	uploadPropertyImages,
	uploadPropertyDocuments,
	getUploadedMediaAndDocuments,
	searchPropertiesByRadius,
	searchPropertiesByBoundingBox,
	getActiveListingsOverTime,
	getListingStatusCounts,
	getListingStatistics,
	rejectListLand,
	softDeleteListLand,
	type CreateListLandPayload,
} from "../services/listLand.js";
import type { GetLandsQuery } from "../../types/express/land.types.js";
import type { string } from "better-auth";
import db from "../../config/prisma.js";

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
		const user = (req as any).user as { id?: string } | undefined;

		const property = await getListLandById(
			propertyId,
			user?.id
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

		// Fetch existing property with media and documents to validate status and get old assets
		const existingPropertyRaw = await db.property.findUnique({
			where: { id: propertyId },
			include: {
				media: {
					include: {
						documents: true,
					},
				},
			},
		});

		if (!existingPropertyRaw) {
			return res.status(404).json({ message: "Property not found" });
		}

		// Only allow updates if status is "pending" or "draft"
		if (existingPropertyRaw.status && !["pending", "draft"].includes(existingPropertyRaw.status.toLowerCase())) {
			return res.status(403).json({
				message: `Cannot update property with status '${existingPropertyRaw.status}'. Only listings with status 'pending' or 'draft' can be updated.`,
			});
		}

		let mediaIds: string[] = [];
		let documentIds: string[] = [];
		let oldMediaIds: string[] = [];
		let oldDocumentIds: string[] = [];

		// Separate new image and document files by field name
		const imageFiles: Express.Multer.File[] = [];
		const documentFiles: Express.Multer.File[] = [];

		if (files && files.length > 0) {
			for (const file of files) {
				if (file.fieldname === "images") {
					imageFiles.push(file);
				} else if (file.fieldname === "documents") {
					documentFiles.push(file);
				}
			}
		}

		// If new images are being uploaded, collect old image IDs for deletion
		if (imageFiles.length > 0 && existingPropertyRaw.media && existingPropertyRaw.media.length > 0) {
			oldMediaIds = existingPropertyRaw.media.map((m) => m.id);
			// Upload new images
			mediaIds = await uploadPropertyImages(requester.id, imageFiles);
		} else if (imageFiles.length > 0) {
			// Upload new images without old ones to delete
			mediaIds = await uploadPropertyImages(requester.id, imageFiles);
		}

		// If new documents are being uploaded, collect old document IDs for deletion
		if (documentFiles.length > 0) {
			// Collect all document IDs from existing media
			if (existingPropertyRaw.media && existingPropertyRaw.media.length > 0) {
				for (const media of existingPropertyRaw.media) {
					if (media.documents && media.documents.length > 0) {
						oldDocumentIds.push(...media.documents.map((d) => d.id));
					}
				}
			}
			// Upload new documents
			documentIds = await uploadPropertyDocuments(requester.id, documentFiles);
		}

		const normalizedBody = buildNestedMultipartPayload(req.body as Record<string, unknown>);

		// Add uploaded media IDs and document IDs to payload, including info about old ones to delete
		const payload = {
			...normalizedBody,
			...(mediaIds.length > 0 && { landMediaIds: mediaIds }),
			...(documentIds.length > 0 && { documentIds }),
			...(oldMediaIds.length > 0 && { oldMediaIds }),
			...(oldDocumentIds.length > 0 && { oldDocumentIds }),
		};

		const property = await updateListLandById(propertyId, payload);

		return res.status(200).json({
			message: "Property updated successfully",
			property,
			imageCount: mediaIds.length,
			documentCount: documentIds.length,
			deletedImageCount: oldMediaIds.length,
			deletedDocumentCount: oldDocumentIds.length,
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};

/**
 * Request changes for a property listing
 * Admin only: moves the listing back to draft and notifies the owner
 */
export const requestListLandChangesController = async (req: Request, res: Response) => {
	try {
		const requester = getRequesterUserOrThrow(req);
		const propertyId = getPropertyIdParamOrThrow(req);
		const reason = typeof req.body.reason === "string" ? req.body.reason.trim() : "";

		if (!reason) {
			return res.status(400).json({
				message: "reason is required",
			});
		}

		const result = await requestListLandChanges(propertyId, requester.id, reason);

		return res.status(200).json({
			message: "Listing moved to draft and user notified successfully",
			data: result,
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
 * Query: { page?, limit?, status? }
 * - status: filter by listing status (e.g., "active", "pending", etc.)
 */
export const getAllListingsController = async (req: Request, res: Response) => {
	try {
		const user = getRequesterUserOrThrow(req); // Verify user is authenticated

		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const status = req.query.status as string;
		const recentlyApproved = req.query.recentlyApproved === "true";

		const query: GetLandsQuery = {
			page,
			limit,
			status,
			recentlyApproved,
		};

		const result = await getAllListings(query, user.id);

		return res.status(200).json(result);
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};

/**
 * SEARCH PROPERTIES BY RADIUS OR BOUNDING BOX
 * 
 * RADIUS SEARCH:
 * POST /api/list-lands/search/by-radius
 * Body: { latitude, longitude, radiusKm }
 * 
 * BOUNDING BOX SEARCH:
 * POST /api/list-lands/search/by-radius
 * Body: { minLat, maxLat, minLon, maxLon }
 * 
 * Query: { page?, limit?, state?, dealTypes?, categoryId?, terrainChips?, utilizationId?, tanahRizabMelayu?, landAreaMin?, landAreaMax?, pricePerSqft?, titleTypeId? }
 *
 * The controller detects which search type based on the provided parameters:
 * - If 4 bbox parameters are provided: uses bounding box search
 * - If 3 radius parameters are provided: uses radius search
 * 
 * Returns: { items, pagination, searchParams }
 */
export const searchPropertiesByRadiusController = async (
	req: Request,
	res: Response
) => {
	try {
		const { latitude, longitude, radiusKm, minLat, maxLat, minLon, maxLon } = req.body;

		// Detect search type: Bounding Box or Radius
		const hasBboxParams = minLat !== undefined && maxLat !== undefined && minLon !== undefined && maxLon !== undefined;
		const hasRadiusParams = latitude !== undefined && longitude !== undefined && radiusKm !== undefined;

		if (!hasBboxParams && !hasRadiusParams) {
			return res.status(400).json({
				success: false,
				message: "Either provide bounding box (minLat, maxLat, minLon, maxLon) OR radius search (latitude, longitude, radiusKm) parameters",
			});
		}

		const page = toNumberOrUndefined(req.query.page) || 1;
		const limit = toNumberOrUndefined(req.query.limit) || 10;
		
		// Get user ID if authenticated (optional for public endpoint)
		const user = getOptionalAuthenticatedUser(req);
		const userId = user?.id;

		// Parse boolean filters
		const myListings = req.query.myListings === "true";
		const myShortlistings = req.query.myShortlistings === "true";
		const myEnquiries = req.query.myEnquiries === "true";

		// If any user-specific filter is requested, user must be authenticated
		if ((myListings || myShortlistings || myEnquiries) && !userId) {
			return res.status(401).json({
				success: false,
				message: "Authentication required to use user-specific filters (myListings, myShortlistings, myEnquiries)",
			});
		}
		
        // Extract optional filters from query parameters
		const filters: {
			state?: string;
			dealTypes?: string[];
			categoryId?: string;
			terrainChips?: string[];
			utilizationId?: string;
			tanahRizabMelayu?: boolean;
			landAreaMin?: number;
			landAreaMax?: number;
			pricePerSqft?: number;
			titleTypeId?: string;
		} = {};

		if (req.query.state !== undefined) filters.state = req.query.state as string;
		if (req.query.dealTypes !== undefined) {
			const dealTypes = req.query.dealTypes;
			filters.dealTypes = Array.isArray(dealTypes) ? (dealTypes as string[]) : [dealTypes as string];
		}
		if (req.query.categoryId !== undefined) filters.categoryId = req.query.categoryId as string;
		if (req.query.terrainChips !== undefined) {
			const terrainChips = req.query.terrainChips;
			filters.terrainChips = Array.isArray(terrainChips) ? (terrainChips as string[]) : [terrainChips as string];
		}
		if (req.query.utilizationId !== undefined) filters.utilizationId = req.query.utilizationId as string;
		if (req.query.tanahRizabMelayu !== undefined) {
			filters.tanahRizabMelayu = req.query.tanahRizabMelayu === "true";
		}
		if (req.query.landAreaMin !== undefined) {
			const landAreaMin = Number(req.query.landAreaMin);
			if (Number.isFinite(landAreaMin)) filters.landAreaMin = landAreaMin;
		}
		if (req.query.landAreaMax !== undefined) {
			const landAreaMax = Number(req.query.landAreaMax);
			if (Number.isFinite(landAreaMax)) filters.landAreaMax = landAreaMax;
		}
		if (req.query.pricePerSqft !== undefined) {
			const pricePerSqft = Number(req.query.pricePerSqft);
			if (Number.isFinite(pricePerSqft)) filters.pricePerSqft = pricePerSqft;
		}
		if (req.query.titleTypeId !== undefined) filters.titleTypeId = req.query.titleTypeId as string;
		
		let result;
		let searchType: string;

		// Execute appropriate search based on parameters provided
		if (hasBboxParams) {
			searchType = "bounding_box";
			result = await searchPropertiesByBoundingBox(
				minLat,
				maxLat,
				minLon,
				maxLon,
				page,
				limit,
				userId,
				filters,
				{
					myListings,
					myShortlistings,
					myEnquiries
				}
			);
		} else {
			searchType = "radius";
			result = await searchPropertiesByRadius(
				latitude,
				longitude,
				radiusKm,
				page,
				limit,
				userId,
				filters,
				{
					myListings,
					myShortlistings,
					myEnquiries
				}
			);
		}

		return res.status(200).json({
			success: true,
			message: "Properties found",
			searchType,
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

/**
 * DEPRECATED: Use searchPropertiesByRadiusController instead
 * This function is kept for backward compatibility and reference
 * Searches for active properties within a geographic radius using:
 * 1. Bounding box calculation for initial filtering
 * 2. Pythagorean theorem for precise distance verification
 * 3. Optional filters for refining results
 *
 * Returns: { items, pagination, searchParams }
 *
export const searchPropertiesByRadiusControllerOld = async (

/**
 * Get active listings analytics over time
 * Supports time ranges: 12months, 30days, 7days, 24hours
 */
export const getActiveListingsOverTimeController = async (req: Request, res: Response) => {
	try {
		const { timeRange } = req.query;

		// Set default timeRange to "12months" if not provided
		const validatedTimeRange = (timeRange as string) || "12months";

		// Validate timeRange
		const validTimeRanges = ["12months", "30days", "7days", "24hours"];
		if (!validTimeRanges.includes(validatedTimeRange)) {
			return res.status(400).json({
				success: false,
				message: `Invalid timeRange. Must be one of: ${validTimeRanges.join(", ")}`,
			});
		}

		const { getActiveListingsOverTime } = await import("../services/listLand.js");

		const analyticsData = await getActiveListingsOverTime(
			validatedTimeRange as "12months" | "30days" | "7days" | "24hours"
		);

		return res.status(200).json({
			success: true,
			data: analyticsData,
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

/**
 * Get total listings and counts by listing status
 * Admin only
 */
export const getListingStatusCountsController = async (req: Request, res: Response) => {
	try {
		getRequesterUserOrThrow(req);

		const data = await getListingStatusCounts();

		return res.status(200).json({
			success: true,
			data,
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

/**
 * Get listing statistics (admin only)
 * GET /api/listings/statistics
 * Returns counts of listings by status
 */
export const getListingStatisticsController = async (req: Request, res: Response) => {
	try {
		getRequesterUserOrThrow(req);

		const statistics = await getListingStatistics();
		return res.status(200).json({
			success: true,
			data: statistics,
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({
			success: false,
			message,
		});
	}
};

/**
 * Reject a property listing
 * Admin only: sets the listing status to 'rejected' and notifies the owner
 */
export const rejectListLandController = async (req: Request, res: Response) => {
	try {
		const requester = getRequesterUserOrThrow(req);
		const propertyId = getPropertyIdParamOrThrow(req);
		const reason = typeof req.body.reason === "string" ? req.body.reason.trim() : "";

		if (!reason) {
			return res.status(400).json({
				message: "reason is required",
			});
		}

		const result = await rejectListLand(propertyId, requester.id, reason);

		return res.status(200).json({
			message: "Listing rejected and locked. User cannot republish without major revisions.",
			data: result,
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};

/**
 * Permanently (soft) delete a property listing
 * Admin only: sets the listing status to 'deleted' and notifies the owner
 */
export const softDeleteListLandController = async (req: Request, res: Response) => {
	try {
		const requester = getRequesterUserOrThrow(req);
		const propertyId = getPropertyIdParamOrThrow(req);
		const reason = typeof req.body.reason === "string" ? req.body.reason.trim() : "";

		if (!reason) {
			return res.status(400).json({
				message: "reason is required",
			});
		}

		const result = await softDeleteListLand(propertyId, requester.id, reason);

		return res.status(200).json({
			message: "Listing deleted for extreme policy violations. Action recorded in audit log.",
			data: result,
		});
	} catch (error: unknown) {
		const { statusCode, message } = getErrorPayload(error);
		return res.status(statusCode).json({ message });
	}
};