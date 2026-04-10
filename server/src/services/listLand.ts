import { DealType, FeatureTag, Prisma, TerrainType } from "@prisma/client";
import db from "../../config/prisma.js";
import { uploadFileToS3, deleteFileFromS3 } from "./s3Upload.js";

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
	value: string[] | undefined,
	fieldName: string,
	allowedValues: readonly T[]
): T[] => {
	if (value === undefined) return [];

	const allowedSet = new Set<string>(allowedValues);
	const normalized = value.map((item) => item.trim());
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
					landMediaId: payload.landMediaIds?.[0] ?? null,
					tanahRizabMelayu: payload.tanahRizabMelayu ?? null,
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
					status: payload.status ?? null,
					agreementAccepted: payload.agreementAccepted ?? false,
					agreementAcceptedAt: toDateOrNull(payload.agreementAcceptedAt) ?? null,
				},
			});

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
						isApproximate: payload.location.isApproximate ?? false,
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

	const where: Prisma.PropertyWhereInput = {
		...(userType === "admin" ? {} : { userId }),
		...(query.status ? { status: query.status } : {}),
	};

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

	return {
		items,
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
	userId: string,
	userType: string
) => {
	const property = await db.property.findUnique({
		where: { id: propertyId },
		include: includePropertyRelations,
	});

	if (!property) {
		throw createHttpError("Property not found", 404);
	}

	if (userType !== "admin" && property.userId !== userId) {
		throw createHttpError("Forbidden", 403);
	}

	return property;
};

/**
 * Update property by ID
 */
export const updateListLandById = async (
	propertyId: string,
	userId: string,
	userType: string,
	payload: UpdateListLandPayload
) => {
	const existingProperty = await db.property.findUnique({
		where: { id: propertyId },
	});

	if (!existingProperty) {
		throw createHttpError("Property not found", 404);
	}

	if (userType !== "admin" && existingProperty.userId !== userId) {
		throw createHttpError("Forbidden", 403);
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
			if (payload.landMediaIds !== undefined)
				updateData.landMediaId = payload.landMediaIds[0] ?? null;
			if (payload.tanahRizabMelayu !== undefined)
				updateData.tanahRizabMelayu = payload.tanahRizabMelayu;
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
			if (payload.status !== undefined) updateData.status = payload.status;
			if (payload.agreementAccepted !== undefined)
				updateData.agreementAccepted = payload.agreementAccepted;
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
							isApproximate: payload.location.isApproximate ?? false,
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
							isApproximate: payload.location.isApproximate ?? false,
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

	if (userType !== "admin" && existingProperty.userId !== userId) {
		throw createHttpError("Forbidden", 403);
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
