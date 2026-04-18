import { DealType, FeatureTag, Prisma, TerrainType } from "@prisma/client";
import db from "../../config/prisma.js";
import { uploadFileToS3, deleteFileFromS3 } from "./s3Upload.js";
import { transformPropertyWithSignedUrls, generateMediaSignedUrl, processConcurrently } from "./signedUrlTransformer.js";

type MulterFile = Express.Multer.File;

type PropertyLocationPayload = {
	state: string;
	district: string;
	mukim?: string;
	section?: string;
	latitude: number | string;
	longitude: number | string;
	isApproximate?: boolean;
};

type LeaseholdDetailPayload = {
	startYear: number;
	leasePeriodYears: number;
};

type PropertyStatus = "draft" | "active" | "pending" | "under_review" | "need_more_info";

const PROPERTY_STATUS_ALIASES: Record<string, PropertyStatus> = {
	draft: "draft",
	active: "active",
	pending: "pending",
	under_review: "under_review",
	"under review": "under_review",
	need_more_info: "need_more_info",
	"need more info": "need_more_info",
};

const normalizePropertyStatus = (
	status: string | null | undefined
): PropertyStatus | null | undefined => {
	if (status === undefined) return undefined;
	if (status === null) return null;

	const normalized = PROPERTY_STATUS_ALIASES[status.trim().toLowerCase()];
	if (!normalized) {
		throw createHttpError(
			`Invalid property status. Allowed values are active, pending, under review, and need more info`,
			400
		);
	}

	return normalized;
};

export type CreateListLandPayload = {
	title: string;
	categoryId: string;
	ownershipTypeId: string;
	utilizationId: string;
	titleTypeId: string;
	landMediaIds?: string[];
	documentIds?: string[];
	tanahRizabMelayu?: boolean;
	dealTypes?: string[];
	terrainChips?: string[];
	featureTags?: string[];
	landArea: number | string;
	landAreaUnit: string;
	estimatedValuation?: number | string | null;
	description?: string | null;
	listingCode: string;
	price: number | string;
	pricePerSqrft: number | string;
	status?: string | null;
	agreementAccepted?: boolean;
	agreementAcceptedAt?: string | Date | null;
	location?: PropertyLocationPayload | null;
	leaseholdDetails?: LeaseholdDetailPayload | null;
};

export type UpdateListLandPayload = Partial<CreateListLandPayload>;

type GetLandsQuery = {
	page?: number;
	limit?: number;
	status?: string;
	recentlyApproved?: boolean;
};

const createHttpError = (message: string, statusCode: number) => {
	const error = new Error(message);
	(error as Error & { statusCode?: number }).statusCode = statusCode;
	return error;
};

const parseDecimal = (value: string | number, fieldName: string) => {
	try {
		return new Prisma.Decimal(value);
	} catch {
		throw createHttpError(`${fieldName} must be a valid number`, 400);
	}
};

const parseEnumArray = <T extends string>(
	value: string[] | string | undefined,
	fieldName: string,
	allowedValues: readonly T[]
): T[] => {
	if (value === undefined) return [];

	// Convert string to array if needed
	let arrayValue: string[];
	if (typeof value === "string") {
		arrayValue = [value];
	} else if (Array.isArray(value)) {
		arrayValue = value;
	} else {
		throw createHttpError(
			`${fieldName} must be a string or array`,
			400
		);
	}

	const allowedSet = new Set<string>(allowedValues);
	const normalized = arrayValue.map((item) => item.trim());
	const invalid = normalized.filter((item) => !allowedSet.has(item));

	if (invalid.length > 0) {
		throw createHttpError(
			`${fieldName} contains invalid values: ${invalid.join(", ")}`,
			400
		);
	}

	return normalized as T[];
};

const toDateOrNull = (value?: string | Date | null) => {
	if (value === undefined) return undefined;
	if (value === null) return null;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		throw createHttpError("agreementAcceptedAt must be a valid date", 400);
	}
	return parsed;
};

const parseBoolean = (value: boolean | string | undefined | null): boolean | null | undefined => {
	if (value === undefined) return undefined;
	if (value === null) return null;
	if (typeof value === "boolean") return value;
	if (typeof value === "string") {
		if (value.toLowerCase() === "true") return true;
		if (value.toLowerCase() === "false") return false;
		throw createHttpError(
			`Boolean value must be 'true' or 'false', received '${value}'`,
			400
		);
	}
	return undefined;
};

const normalizeBoolean = (value: boolean | null | undefined): boolean | null => {
	if (value === undefined) return null;
	return value;
};

const includePropertyRelations = {
	category: true,
	ownershipType: true,
	utilization: true,
	titleType: true,
	location: true,
	leaseholdDetails: true,
	media: true,
} as const;

/**
 * Get uploaded media and documents with their file URLs
 */
export const getUploadedMediaAndDocuments = async (
	mediaIds: string[],
	documentIds: string[]
) => {
	const uploadedImages = mediaIds.length > 0 
		? await db.media.findMany({
				where: { id: { in: mediaIds } },
				select: {
					id: true,
					fileUrl: true,
					mediaType: true,
					mediaCategory: true,
					createdAt: true,
				},
			})
		: [];

	const uploadedDocuments = documentIds.length > 0
		? await db.document.findMany({
				where: { id: { in: documentIds } },
				select: {
					id: true,
					verificationStatus: true,
					media: {
						select: {
							fileUrl: true,
						},
					},
					createdAt: true,
				},
			})
		: [];

	// Generate signed URLs for all images
	const imagesWithSignedUrls = await Promise.all(
		uploadedImages.map(async (image) => ({
			...image,
			fileUrl: await generateMediaSignedUrl(image.fileUrl),
		}))
	);

	// Generate signed URLs for all documents
	const documentsWithSignedUrls = await Promise.all(
		uploadedDocuments.map(async (doc) => ({
			id: doc.id,
			fileUrl: await generateMediaSignedUrl(doc.media?.fileUrl),
			verificationStatus: doc.verificationStatus,
			createdAt: doc.createdAt,
		}))
	);

	return {
		images: imagesWithSignedUrls,
		documents: documentsWithSignedUrls,
	};
};

/**
 * Upload multiple property documents (Geran) to S3 and create document records
 * @param userId - ID of the user uploading documents
 * @param files - Array of files from multer
 * @returns Array of document IDs
 */
export const uploadPropertyDocuments = async (
	userId: string,
	files: MulterFile[]
): Promise<string[]> => {
	if (!files || files.length === 0) {
		return []; // Documents are optional
	}

	try {
		const documentIds: string[] = [];

		for (const file of files) {
			const fileUrl = await uploadFileToS3(file);

			const media = await db.media.create({
				data: {
					userId,
					fileUrl,
					mediaType: "document",
					mediaCategory: "geran_documents",
				},
			});

			// Create document record
			const doc = await db.document.create({
				data: {
					mediaId: media.id,
					verificationStatus: "pending",
				},
			});

			documentIds.push(doc.id);
		}

		return documentIds;
	} catch (error: unknown) {
		if (error instanceof Error && error.message.includes("S3")) {
			throw createHttpError("Failed to upload documents to S3", 500);
		}

		throw error;
	}
};

/**
 * Upload multiple images of property which will be uploaded to s3 and their link will be stored in media with media type list land images and this media will be used in property model.
 */
export const uploadPropertyImages = async (
	userId: string,
	files: MulterFile[]
): Promise<string[]> => {
	if (!files || files.length === 0) {
		throw createHttpError("At least one image is required", 400);
	}

	try {
		const mediaIds: string[] = [];

		for (const file of files) {
			const fileUrl = await uploadFileToS3(file);
			console.log(fileUrl);

			const media = await db.media.create({
				data: {
					userId,
					fileUrl,
					mediaType: "image",
					mediaCategory: "list_land_images",
				},
			});

			mediaIds.push(media.id);
		}

		return mediaIds;
	} catch (error: unknown) {
		if (error instanceof Error && error.message.includes("S3")) {
			throw createHttpError("Failed to upload images to S3", 500);
		}

		throw error;
	}
};

/**
 * Create a new property listing with location and leasehold details
 */
export const createListLand = async (
	userId: string,
	payload: CreateListLandPayload
) => {
	try {
		const requiredFields: Array<keyof CreateListLandPayload> = [
			"title",
			"categoryId",
			"ownershipTypeId",
			"utilizationId",
			"titleTypeId",
			"landAreaUnit",
			"listingCode",
		];

		for (const field of requiredFields) {
			const value = payload[field];
			if (typeof value !== "string" || !value.trim()) {
				throw createHttpError(`${field} is required`, 400);
			}
		}

		if (
			payload.landArea === undefined ||
			payload.price === undefined ||
			payload.pricePerSqrft === undefined
		) {
			throw createHttpError("landArea, price, and pricePerSqrft are required", 400);
		}

		const created = await db.$transaction(async (trx) => {
			// Create property
			const property = await trx.property.create({
				data: {
					userId,
					title: payload.title.trim(),
					categoryId: payload.categoryId,
					ownershipTypeId: payload.ownershipTypeId,
					utilizationId: payload.utilizationId,
					titleTypeId: payload.titleTypeId,
					tanahRizabMelayu: normalizeBoolean(parseBoolean(payload.tanahRizabMelayu)),
					dealTypes: parseEnumArray(
						payload.dealTypes,
						"dealTypes",
						Object.values(DealType)
					),
					terrainChips: parseEnumArray(
						payload.terrainChips,
						"terrainChips",
						Object.values(TerrainType)
					),
					featureTags: parseEnumArray(
						payload.featureTags,
						"featureTags",
						Object.values(FeatureTag)
					),
					landArea: parseDecimal(payload.landArea, "landArea"),
					landAreaUnit: payload.landAreaUnit,
					estimatedValuation:
						payload.estimatedValuation === undefined ||
						payload.estimatedValuation === null
							? null
							: parseDecimal(payload.estimatedValuation, "estimatedValuation"),
					description: payload.description ?? null,
					listingCode: payload.listingCode,
					price: parseDecimal(payload.price, "price"),
					pricePerSqrft: parseDecimal(payload.pricePerSqrft, "pricePerSqrft"),
					status: normalizePropertyStatus(payload.status) ?? "pending",
					agreementAccepted: normalizeBoolean(parseBoolean(payload.agreementAccepted)) ?? false,
					agreementAcceptedAt: toDateOrNull(payload.agreementAcceptedAt) ?? null,
				},
			});

			// Link all media files to the property
			if (payload.landMediaIds && payload.landMediaIds.length > 0) {
				await trx.media.updateMany({
					where: { id: { in: payload.landMediaIds } },
					data: { propertyId: property.id },
				});
			}

			// Create location if provided
			if (payload.location) {
				await trx.location.create({
					data: {
						propertyId: property.id,
						state: payload.location.state,
						district: payload.location.district,
						mukim: payload.location.mukim ?? null,
						section: payload.location.section ?? null,
						latitude: parseDecimal(payload.location.latitude, "location.latitude"),
						longitude: parseDecimal(payload.location.longitude, "location.longitude"),
						isApproximate: normalizeBoolean(parseBoolean(payload.location.isApproximate)) ?? false,
					},
				});
			}

			// Create leasehold details if provided
			if (payload.leaseholdDetails) {
				await trx.leaseholdDetail.create({
					data: {
						propertyId: property.id,
						startYear: payload.leaseholdDetails.startYear,
						leasePeriodYears: payload.leaseholdDetails.leasePeriodYears,
					},
				});
			}

			return trx.property.findUnique({
				where: { id: property.id },
				include: includePropertyRelations,
			});
		});

		return created;
	} catch (error: unknown) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				throw createHttpError("listingCode already exists", 409);
			}
			if (error.code === "P2003") {
				throw createHttpError("Invalid relation id in payload", 400);
			}
		}

		throw error;
	}
};

/**
 * Get paginated list of properties
 */
export const getListLands = async (
	userId: string,
	userType: string,
	query: GetLandsQuery
) => {
	const page =
		Number.isFinite(query.page) && query.page && query.page > 0
			? query.page
			: 1;
	const limit =
		Number.isFinite(query.limit) && query.limit && query.limit > 0
			? Math.min(query.limit, 100)
			: 10;
	const skip = (page - 1) * limit;

	const where: Prisma.PropertyWhereInput = {};

	if (userType !== "admin") {
		where.userId = userId;
	}

	if (query.status) {
		const normalizedStatus = normalizePropertyStatus(query.status);
		if (normalizedStatus) {
			where.status = normalizedStatus;
		}
	}

	const [items, total] = await Promise.all([
		db.property.findMany({
			where,
			include: includePropertyRelations,
			orderBy: { createdAt: "desc" },
			skip,
			take: limit,
		}),
		db.property.count({ where }),
	]);

	// Transform items with signed URLs using concurrency control and add isShortListed
	let itemsWithSignedUrls;
	try {
		console.log(`📦 Transforming ${items.length} properties with concurrency limit`);
		const transformed = await processConcurrently(
			items,
			(item) => transformPropertyWithSignedUrls(item),
			5 // Max concurrent property transformations
		);
		
		// Add isShortListed status for each property
		itemsWithSignedUrls = await Promise.all(
			transformed.map(async (item) => {
				const shortlistedProperty = await db.shortlistProperty.findFirst({
					where: {
						propertyId: item.id,
						folder: {
							userId: userId
						}
					},
				});
				return {
					...item,
					isShortListed: !!shortlistedProperty
				};
			})
		);
	} catch (signingError) {
		console.error("Error transforming items with signed URLs in getListLands:", signingError);
		// Fallback: return items without signed URLs
		itemsWithSignedUrls = items.map(item => ({
			...item,
			isShortListed: false
		}));
	}

	return {
		items: itemsWithSignedUrls,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit) || 1,
		},
	};
};

/**
 * Get all public listings accessible to any authenticated user
 * Returns all properties filtered by status
 */
export const getAllListings = async (query: GetLandsQuery, userId?: string) => {
	const page =
		Number.isFinite(query.page) && query.page && query.page > 0
			? query.page
			: 1;
	const limit =
		Number.isFinite(query.limit) && query.limit && query.limit > 0
			? Math.min(query.limit, 100)
			: 10;
	const skip = (page - 1) * limit;

	let where: Prisma.PropertyWhereInput;

	if (query.status) {
		// If status filter is provided, use it
		const normalizedStatus = normalizePropertyStatus(query.status);
		where = normalizedStatus
			? { status: normalizedStatus }
			: { status: { not: null } };
	} else if (query.recentlyApproved) {
		// If recentlyApproved is true, show only active properties
		where = { status: "active" };
	} else {
		// Show all properties with a status set
		where = { status: { not: null } };
	}

	const [items, total] = await Promise.all([
		db.property.findMany({
			where,
			include: includePropertyRelations,
			orderBy: { createdAt: "desc" },
			skip,
			take: limit,
		}),
		db.property.count({ where }),
	]);

	// Transform items with signed URLs and add isShortListed
	let itemsWithSignedUrls;
	try {
		itemsWithSignedUrls = await Promise.all(
			items.map(async (item) => {
				const transformed = await transformPropertyWithSignedUrls(item);
				
				// Check if property is shortlisted by user
				let isShortListed = false;
				if (userId) {
					const shortlistedProperty = await db.shortlistProperty.findFirst({
						where: {
							propertyId: item.id,
							folder: {
								userId: userId
							}
						},
					});
					isShortListed = !!shortlistedProperty;
				}
				
				return {
					...transformed,
					isShortListed
				};
			})
		);
	} catch (signingError) {
		console.error("Error transforming items with signed URLs in getAllListings:", signingError);
		// Fallback: return items without signed URLs but with isShortListed
		itemsWithSignedUrls = items.map(item => ({
			...item,
			isShortListed: false
		}));
	}

	return {
		items: itemsWithSignedUrls,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit) || 1,
		},
	};
};

/**
 * Get single property by ID
 */
export const getListLandById = async (
	propertyId: string,
	userId?: string
) => {
	const property = await db.property.findUnique({
		where: { id: propertyId },
		include: includePropertyRelations,
	});

	if (!property) {
		throw createHttpError("Property not found", 404);
	}

	// Check if property is shortlisted by user
	let isShortListed = false;
	if (userId) {
		const shortlistedProperty = await db.shortlistProperty.findFirst({
			where: {
				propertyId: propertyId,
				folder: {
					userId: userId
				}
			},
		});
		isShortListed = !!shortlistedProperty;
	}

	// Transform property with signed URLs
	try {
		const transformed = await transformPropertyWithSignedUrls(property);
		return {
			...transformed,
			isShortListed
		};
	} catch (signingError) {
		console.error("Error transforming property with signed URLs in getListLandById:", signingError);
		// Fallback: return property without signed URLs
		return {
			...property,
			isShortListed
		};
	}
};

/**
 * Update property by ID
 */
export const updateListLandById = async (
	propertyId: string,
	payload: UpdateListLandPayload
) => {
	const existingProperty = await db.property.findUnique({
		where: { id: propertyId },
	});

	if (!existingProperty) {
		throw createHttpError("Property not found", 404);
	}

	try {
		const updated = await db.$transaction(async (trx) => {
			const updateData: Prisma.PropertyUncheckedUpdateInput = {};

			if (payload.title !== undefined) updateData.title = payload.title;
			if (payload.categoryId !== undefined)
				updateData.categoryId = payload.categoryId;
			if (payload.ownershipTypeId !== undefined)
				updateData.ownershipTypeId = payload.ownershipTypeId;
			if (payload.utilizationId !== undefined)
				updateData.utilizationId = payload.utilizationId;
			if (payload.titleTypeId !== undefined)
				updateData.titleTypeId = payload.titleTypeId;
			if (payload.landMediaIds !== undefined) {
				// Update all media files to be associated with this property
				await trx.media.updateMany({
					where: { id: { in: payload.landMediaIds } },
					data: { propertyId: propertyId },
				});
			}
			if (payload.tanahRizabMelayu !== undefined) {
				const normalizedValue = normalizeBoolean(parseBoolean(payload.tanahRizabMelayu));
				if (normalizedValue !== null) {
					updateData.tanahRizabMelayu = normalizedValue;
				}
			}
			if (payload.dealTypes !== undefined) {
				updateData.dealTypes = parseEnumArray(
					payload.dealTypes,
					"dealTypes",
					Object.values(DealType)
				);
			}
			if (payload.terrainChips !== undefined) {
				updateData.terrainChips = parseEnumArray(
					payload.terrainChips,
					"terrainChips",
					Object.values(TerrainType)
				);
			}
			if (payload.featureTags !== undefined) {
				updateData.featureTags = parseEnumArray(
					payload.featureTags,
					"featureTags",
					Object.values(FeatureTag)
				);
			}
			if (payload.landArea !== undefined)
				updateData.landArea = parseDecimal(payload.landArea, "landArea");
			if (payload.landAreaUnit !== undefined)
				updateData.landAreaUnit = payload.landAreaUnit;
			if (payload.estimatedValuation !== undefined) {
				updateData.estimatedValuation =
					payload.estimatedValuation === null
						? null
						: parseDecimal(payload.estimatedValuation, "estimatedValuation");
			}
			if (payload.description !== undefined)
				updateData.description = payload.description;
			if (payload.listingCode !== undefined)
				updateData.listingCode = payload.listingCode;
			if (payload.price !== undefined)
				updateData.price = parseDecimal(payload.price, "price");
			if (payload.pricePerSqrft !== undefined) {
				updateData.pricePerSqrft = parseDecimal(
					payload.pricePerSqrft,
					"pricePerSqrft"
				);
			}
			if (payload.status !== undefined) {
				const normalizedStatus = normalizePropertyStatus(payload.status);
				if (normalizedStatus !== undefined) {
					updateData.status = normalizedStatus;
				}
			}
			if (payload.agreementAccepted !== undefined) {
				const normalizedValue = normalizeBoolean(parseBoolean(payload.agreementAccepted));
				if (normalizedValue !== null) {
					updateData.agreementAccepted = normalizedValue;
				}
			}
			if (payload.agreementAcceptedAt !== undefined) {
				updateData.agreementAcceptedAt = payload.agreementAcceptedAt;
			}

			if (Object.keys(updateData).length > 0) {
				await trx.property.update({
					where: { id: propertyId },
					data: updateData,
				});
			}

			// Handle location update
			if (payload.location !== undefined) {
				if (payload.location === null) {
					await trx.location.deleteMany({ where: { propertyId } });
				} else if (payload.location) {
					await trx.location.upsert({
						where: { propertyId },
						update: {
							state: payload.location.state,
							district: payload.location.district,
							mukim: payload.location.mukim ?? null,
							section: payload.location.section ?? null,
							latitude: parseDecimal(
								payload.location.latitude,
								"location.latitude"
							),
							longitude: parseDecimal(
								payload.location.longitude,
								"location.longitude"
							),
						isApproximate: normalizeBoolean(parseBoolean(payload.location.isApproximate)) ?? false,
					},
					create: {
						propertyId,
						state: payload.location.state,
						district: payload.location.district,
						mukim: payload.location.mukim ?? null,
						section: payload.location.section ?? null,
						latitude: parseDecimal(
							payload.location.latitude,
							"location.latitude"
						),
						longitude: parseDecimal(
							payload.location.longitude,
							"location.longitude"
						),
						isApproximate: normalizeBoolean(parseBoolean(payload.location.isApproximate)) ?? false,
						},
					});
				}
			}

			// Handle leasehold details update
			if (payload.leaseholdDetails !== undefined) {
				if (payload.leaseholdDetails === null) {
					await trx.leaseholdDetail.deleteMany({ where: { propertyId } });
				} else if (payload.leaseholdDetails) {
					await trx.leaseholdDetail.upsert({
						where: { propertyId },
						update: {
							startYear: payload.leaseholdDetails.startYear,
							leasePeriodYears: payload.leaseholdDetails.leasePeriodYears,
						},
						create: {
							propertyId,
							startYear: payload.leaseholdDetails.startYear,
							leasePeriodYears: payload.leaseholdDetails.leasePeriodYears,
						},
					});
				}
			}

			return trx.property.findUnique({
				where: { id: propertyId },
				include: includePropertyRelations,
			});
		});

		return updated;
	} catch (error: unknown) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				throw createHttpError("listingCode already exists", 409);
			}
			if (error.code === "P2003") {
				throw createHttpError("Invalid relation id in payload", 400);
			}
		}

		throw error;
	}
};

/**
 * Request changes for a property listing
 * Moves the listing back to draft and notifies the owner.
 */
export const requestListLandChanges = async (
	propertyId: string,
	adminId: string,
	reason: string
) => {
	if (!propertyId || propertyId.trim().length === 0) {
		throw createHttpError("Property ID is required", 400);
	}

	if (!reason || reason.trim().length === 0) {
		throw createHttpError("Reason is required", 400);
	}

	try {
		const property = await db.property.findUnique({
			where: { id: propertyId },
			select: {
				id: true,
				title: true,
				listingCode: true,
				status: true,
				userId: true,
				user: {
					select: {
						id: true,
						email: true,
					},
				},
			},
		});

		if (!property) {
			throw createHttpError("Property not found", 404);
		}

		const trimmedReason = reason.trim();

		const result = await db.$transaction(async (trx) => {
			const updatedProperty = await trx.property.update({
				where: { id: propertyId },
				data: {
					status: "draft",
				},
				include: includePropertyRelations,
			});

			const notificationContent = [
				`Your listing "${property.title}" (Listing Code: ${property.listingCode}) has been moved back to Draft.`,
				`Administrative reason: ${trimmedReason}`,
			].join(" ");

			const notification = await trx.notification.create({
				data: {
					userId: property.userId,
					type: "urgent",
					content: notificationContent,
					isRead: false,
				},
			});

			return {
				property: updatedProperty,
				notification,
				adminId,
			};
		});

		return result;
	} catch (error: unknown) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2003") {
				throw createHttpError("Invalid relation id in payload", 400);
			}
		}

		throw error;
	}
};

/**
 * Delete property by ID
 */
/**
 * Delete property by ID (Hard Delete)
 */
export const deleteListLandById = async (
	propertyId: string,
	userId: string,
	userType: string
) => {
	const existingProperty = await db.property.findUnique({
		where: { id: propertyId },
	});

	if (!existingProperty) {
		throw createHttpError("Property not found", 404);
	}

	// Check authorization: only admin or property owner can delete
	if (userType !== "admin" && existingProperty.userId !== userId) {
		throw createHttpError(
			"You do not have permission to delete this property",
			403
		);
	}

	try {
		await db.$transaction([
			db.location.deleteMany({ where: { propertyId } }),
			db.leaseholdDetail.deleteMany({ where: { propertyId } }),
			db.property.delete({ where: { id: propertyId } }),
		]);

		return { message: "Property deleted successfully" };
	} catch (error: unknown) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2003"
		) {
			throw createHttpError("Cannot delete property due to related records", 409);
		}

		throw error;
	}
};

/**
 * Search properties within a geographic radius
 *
 * Algorithm:
 * 1. Calculate bounding box from center point and radius
 * 2. Query all active properties within the bounding box
 * 3. Refine results using Pythagorean theorem to check if within actual circle
 *
 * Formula for geographic coordinates:
 * - dY = radius (km) / 111.11
 * - dX = dY / cos(latitude in radians)
 * - Bounding Box: (lat - dY, lat + dY, lon - dX, lon + dX)
 *
 * Distance calculation:
 * - distance² = (lat1 - lat2)² + (lon1 - lon2)²
 * - if distance² < radius², point is within radius
 */
export const searchPropertiesByRadius = async (
	latitude: number | string,
	longitude: number | string,
	radiusKm: number | string,
	page: number = 1,
	limit: number = 10,
	userId?: string,
	filters?: {
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
	},
	userFilters?: {
		myListings?: boolean;
		myShortlistings?: boolean;
		myEnquiries?: boolean;
	}
) => {
	try {
		// Parse and validate inputs
		const lat = Number(latitude);
		const lon = Number(longitude);
		const radius = Number(radiusKm);

		if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
			throw createHttpError("Invalid latitude. Must be between -90 and 90", 400);
		}

		if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
			throw createHttpError("Invalid longitude. Must be between -180 and 180", 400);
		}

		if (!Number.isFinite(radius) || radius <= 0) {
			throw createHttpError("Invalid radius. Must be a positive number", 400);
		}

		// Step 1: Calculate bounding box
		// dY = radius (km) / 111.11 km per degree of latitude
		const dY = radius / 111.11;

		// dX = dY / cos(latitude in radians)
		const latRadians = (lat * Math.PI) / 180;
		const dX = dY / Math.cos(latRadians);

		const minLat = lat - dY;
		const maxLat = lat + dY;
		const minLon = lon - dX;
		const maxLon = lon + dX;

		// Build WHERE clause with filters
		const whereCondition: Prisma.PropertyWhereInput = {
			status: "active",
			location: {
				latitude: {
					gte: new Prisma.Decimal(minLat),
					lte: new Prisma.Decimal(maxLat),
				},
				longitude: {
					gte: new Prisma.Decimal(minLon),
					lte: new Prisma.Decimal(maxLon),
				},
			},
		};

		// Apply user-specific filters if requested (will be handled in query phase)

		// Apply optional filters
		if (filters) {
			if (filters.state) {
				(whereCondition.location as any).state = filters.state;
			}

			if (filters.dealTypes && filters.dealTypes.length > 0) {
				whereCondition.dealTypes = {
					hasSome: filters.dealTypes as DealType[],
				};
			}

			if (filters.categoryId) {
				whereCondition.categoryId = filters.categoryId;
			}

			if (filters.terrainChips && filters.terrainChips.length > 0) {
				whereCondition.terrainChips = {
					hasSome: filters.terrainChips as TerrainType[],
				};
			}

			if (filters.utilizationId) {
				whereCondition.utilizationId = filters.utilizationId;
			}

			if (filters.tanahRizabMelayu !== undefined) {
				whereCondition.tanahRizabMelayu = filters.tanahRizabMelayu;
			}

			if (filters.landAreaMin !== undefined || filters.landAreaMax !== undefined) {
				whereCondition.landArea = {};
				if (filters.landAreaMin !== undefined) {
					(whereCondition.landArea as any).gte = new Prisma.Decimal(filters.landAreaMin);
				}
				if (filters.landAreaMax !== undefined) {
					(whereCondition.landArea as any).lte = new Prisma.Decimal(filters.landAreaMax);
				}
			}

			if (filters.pricePerSqft !== undefined) {
				whereCondition.pricePerSqrft = {
					lte: new Prisma.Decimal(filters.pricePerSqft)
				};
			}

			if (filters.titleTypeId) {
				whereCondition.titleTypeId = filters.titleTypeId;
			}
		}

		// Determine if any user-specific filter is active
		const hasUserFilters = userFilters?.myListings || userFilters?.myShortlistings || userFilters?.myEnquiries;

		// Step 2: Query properties based on geolocation with optional filters
		const geoSkip = (page - 1) * limit;

		const boxResults = await db.property.findMany({
			where: whereCondition,
			include: includePropertyRelations,
			skip: geoSkip,
			take: limit,
		});

		// Step 3: Refine results using Pythagorean theorem
		const results = boxResults.filter((property) => {
			const location = (property as any).location;
			if (!location) return false;

			const propLat = Number(location.latitude);
			const propLon = Number(location.longitude);

			// Calculate distance² = (lat1 - lat2)² + (lon1 - lon2)²
			const latDiff = lat - propLat;
			const lonDiff = lon - propLon;

			// Note: This is an approximation since we're treating lat/lon as Cartesian coordinates
			// For more accuracy, use Haversine formula, but Pythagorean is good for small radii
			const distanceSquared = Math.pow(latDiff, 2) + Math.pow(lonDiff, 2);

			// Only include if within the radius
			return distanceSquared <= Math.pow(dY, 2);
		});

		// Get total count for pagination
		const totalCount = await db.property.count({
			where: whereCondition,
		});

		let userFilterData: {
			myListings: { items: any[]; total: number } | null;
			myShortlistings: { items: any[]; total: number } | null;
			myEnquiries: { items: any[]; total: number } | null;
		} | null = null;

		if (hasUserFilters && userId) {
			const shortlistWhere: Prisma.ShortlistPropertyWhereInput = {
				folder: { userId },
			};

			const enquiryWhere: Prisma.PropertyEnquiryWhereInput = {
				userId,
			};

			const [myListingsResults, myShortlistingsResults, myEnquiriesResults] = await Promise.all([
				userFilters?.myListings
					? db.property.findMany({
						where: { userId },
						include: includePropertyRelations,
						orderBy: { createdAt: "desc" },
					})
					: Promise.resolve([]),
				userFilters?.myShortlistings
					? db.shortlistProperty.findMany({
						where: shortlistWhere,
						include: {
							folder: {
								select: {
									id: true,
									name: true,
									parentFolderId: true,
									createdAt: true,
									updatedAt: true,
								},
							},
							property: {
								include: includePropertyRelations,
							},
						},
						orderBy: { createdAt: "desc" },
					})
					: Promise.resolve([]),
				userFilters?.myEnquiries
					? db.propertyEnquiry.findMany({
						where: enquiryWhere,
						include: {
							property: {
								include: includePropertyRelations,
							},
							interestType: true,
						},
						orderBy: { createdAt: "desc" },
					})
					: Promise.resolve([]),
			]);

			const transformPropertyList = async (properties: any[]) => {
				const transformed = await Promise.all(
					properties.map((property) => transformPropertyWithSignedUrls(property))
				);

				return Promise.all(
					transformed.map(async (item) => ({
						...item,
						isShortListed: !!(await db.shortlistProperty.findFirst({
							where: {
								propertyId: item.id,
								folder: { userId },
							},
						})),
					}))
				);
			};

			const transformShortlistEntries = async (shortlists: any[]) => {
				return Promise.all(
					shortlists.map(async (shortlist) => ({
						...shortlist,
						property: {
							...await transformPropertyWithSignedUrls(shortlist.property),
							isShortListed: true,
						},
					}))
				);
			};

			const transformEnquiryEntries = async (enquiries: any[]) => {
				return Promise.all(
					enquiries.map(async (enquiry) => ({
						...enquiry,
						budget: enquiry.budget?.toString() ?? null,
						property: {
							...await transformPropertyWithSignedUrls(enquiry.property),
							isShortListed: !!(await db.shortlistProperty.findFirst({
								where: {
									propertyId: enquiry.propertyId,
									folder: { userId },
								},
							})),
						},
					}))
				);
			};

			const [myListings, myShortlistings, myEnquiries] = await Promise.all([
				userFilters?.myListings ? transformPropertyList(myListingsResults as any[]) : Promise.resolve([]),
				userFilters?.myShortlistings ? transformShortlistEntries(myShortlistingsResults as any[]) : Promise.resolve([]),
				userFilters?.myEnquiries ? transformEnquiryEntries(myEnquiriesResults as any[]) : Promise.resolve([]),
			]);

			userFilterData = {
				myListings: userFilters?.myListings ? { items: myListings, total: myListingsResults.length } : null,
				myShortlistings: userFilters?.myShortlistings ? { items: myShortlistings, total: myShortlistingsResults.length } : null,
				myEnquiries: userFilters?.myEnquiries ? { items: myEnquiries, total: myEnquiriesResults.length } : null,
			};
		}
		
		// Transform results with signed URLs and add isShortListed with error handling
		let resultsWithSignedUrls;
		try {
			const transformed = await Promise.all(
				results.map((item) => transformPropertyWithSignedUrls(item))
			);
			
			// Add isShortListed status for each property
			resultsWithSignedUrls = await Promise.all(
				transformed.map(async (item) => {
					let isShortListed = false;
					if (userId) {
						const shortlistedProperty = await db.shortlistProperty.findFirst({
							where: {
								propertyId: item.id,
								folder: {
									userId: userId
								}
							},
						});
						isShortListed = !!shortlistedProperty;
					}
					return {
						...item,
						isShortListed
					};
				})
			);
		} catch (signingError) {
			console.error("Error during batch URL signing, returning results without signed URLs:", signingError);
			// Fallback: return results without signed URLs but with isShortListed
			resultsWithSignedUrls = results.map(item => ({
				...item,
				isShortListed: false
			}));
		}

		return {
			items: resultsWithSignedUrls,
			pagination: {
				page,
				limit,
				total: results.length,
				totalInBoundingBox: totalCount,
				totalPages: Math.ceil(results.length / limit),
			},
			appliedFilters: {
				state: filters?.state ?? null,
				dealTypes: filters?.dealTypes ?? null,
				categoryId: filters?.categoryId ?? null,
				terrainChips: filters?.terrainChips ?? null,
				utilizationId: filters?.utilizationId ?? null,
				tanahRizabMelayu: filters?.tanahRizabMelayu ?? null,
				landAreaMin: filters?.landAreaMin ?? null,
				landAreaMax: filters?.landAreaMax ?? null,
				pricePerSqft: filters?.pricePerSqft ?? null,
				titleTypeId: filters?.titleTypeId ?? null,
			},
			userFilters: userFilterData,
			searchParams: {
				centerLat: lat,
				centerLon: lon,
				radiusKm: radius,
				boundingBox: {
					minLat,
					maxLat,
					minLon,
					maxLon,
				},
			},
		};
	} catch (error: unknown) {
		const err = error as Error & { statusCode?: number };
		if (err.statusCode) {
			throw error;
		}

		throw createHttpError("Failed to search properties by radius", 500);
	}
};

/**
 * Get active listings over time with optional filtering by time range
 * Supports time ranges: 24hours, 7days, 30days, 12months
 * Returns data points with cumulative active listings count and percentage increase
 */
export const getActiveListingsOverTime = async (
	timeRange: "12months" | "30days" | "7days" | "24hours" = "12months"
) => {
	try {
		// Calculate date range
		const now = new Date();
		let startDate = new Date();

		switch (timeRange) {
			case "24hours":
				startDate.setHours(startDate.getHours() - 24);
				break;
			case "7days":
				startDate.setDate(startDate.getDate() - 7);
				break;
			case "30days":
				startDate.setDate(startDate.getDate() - 30);
				break;
			case "12months":
				startDate.setFullYear(startDate.getFullYear() - 1);
				break;
		}

		// Build where clause for active listings within date range
		const whereClause: any = {
			status: "active",
			createdAt: {
				gte: startDate,
				lte: now,
			},
		};

		// Get all active listings within the date range
		const listings = await db.property.findMany({
			where: whereClause,
			select: {
				id: true,
				createdAt: true,
			},
			orderBy: {
				createdAt: "asc",
			},
		});

		// Group listings by date and calculate cumulative count
		const listingsByDate: Record<string, number> = {};
		let cumulativeCount = 0;

		// Get the starting cumulative count (active listings before the start date)
		const priorCount = await db.property.count({
			where: {
				status: "active",
				createdAt: { lt: startDate },
			},
		});

		cumulativeCount = priorCount;

		// Process each listing and group by date
		listings.forEach((listing) => {
			const dateKey = listing.createdAt.toISOString().split("T")[0] || ""; // YYYY-MM-DD format

			if (dateKey) {
				if (!listingsByDate[dateKey]) {
					listingsByDate[dateKey] = 0;
				}
				listingsByDate[dateKey]++;
			}
		});

		// Generate data points with cumulative counts
		const dataPoints: Array<{
			date: string;
			count: number;
			cumulativeCount: number;
		}> = [];

		Object.keys(listingsByDate)
			.sort()
			.forEach((date) => {
				const count = listingsByDate[date];
				if (count !== undefined) {
					cumulativeCount += count;
					dataPoints.push({
						date,
						count,
						cumulativeCount,
					});
				}
			});

		// Calculate percentage increase
		let percentageIncrease = 0;
		if (dataPoints.length > 1) {
			const firstDataPoint = dataPoints[0];
			const lastDataPoint = dataPoints[dataPoints.length - 1];
			if (firstDataPoint && lastDataPoint) {
				const firstCount = firstDataPoint.cumulativeCount;
				const lastCount = lastDataPoint.cumulativeCount;
				percentageIncrease = Math.min(((lastCount - firstCount) / firstCount) * 100, 100);
			}
		}

		// Get current total active listings
		const currentTotal = await db.property.count({
			where: {
				status: "active",
			},
		});

		return {
			timeRange,
			dataPoints,
			summary: {
				totalActiveListings: currentTotal,
				listingsInRange: dataPoints.reduce((sum, dp) => sum + dp.count, 0),
				percentageIncrease: parseFloat(percentageIncrease.toFixed(2)),
				startDate: startDate.toISOString(),
				endDate: now.toISOString(),
			},
		};
	} catch (error: unknown) {
		throw error;
	}
};

export const getListingStatusCounts = async () => {
	try {
		const [totalListings, groupedCounts] = await Promise.all([
			db.property.count(),
			db.property.groupBy({
				by: ["status"],
				_count: {
					status: true,
				},
			}),
		]);

		const statusCounts = {
			draft: 0,
			active: 0,
			pending: 0,
			under_review: 0,
			need_more_info: 0,
		};

		let nullStatusCount = 0;

		for (const entry of groupedCounts) {
			if (!entry.status) {
				nullStatusCount = entry._count.status;
				continue;
			}

			statusCounts[entry.status as keyof typeof statusCounts] = entry._count.status;
		}

		return {
			totalListings,
			statusCounts,
			nullStatusCount,
			statusGroups: groupedCounts.map((entry) => ({
				status: entry.status,
				count: entry._count.status,
			})),
		};
	} catch (error: unknown) {
		throw error;
	}
};
