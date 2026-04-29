import db from "../../config/prisma.js";
import { Prisma } from "@prisma/client";
import { enrichListingResult, enrichListingCollection } from "./listLand.js";

const createHttpError = (message: string, statusCode: number) => {
	const error = new Error(message) as Error & { statusCode?: number };
	error.statusCode = statusCode;
	return error;
};

const parseDecimal = (value: string | number, fieldName: string) => {
	try {
		return new Prisma.Decimal(value);
	} catch {
		throw createHttpError(`${fieldName} must be a valid number`, 400);
	}
};

const ENQUIRY_STATUSES = [
	"SCHEDULED",
	"MATCHED_INPROGRESS",
	"PENDING_MATCHING",
	"UNDER_REVIEW",
	"NEED_MORE_INFO",
	"CLOSED_NOT_PROCEEDING",
	"CLOSED_SUCCESSFUL",
] as const;

const normalizeEnquiryStatus = (status: string) => status.trim().toUpperCase();

const isValidEnquiryStatus = (
	status: string
): status is (typeof ENQUIRY_STATUSES)[number] => {
	return ENQUIRY_STATUSES.includes(status as (typeof ENQUIRY_STATUSES)[number]);
};

export type CreateEnquiryPayload = {
	propertyId: string;
	userId: string;
	interestTypeId: string;
	message?: string | null;
	budget?: string | number | null;
	timeline?: string | null;
};

export type UpdateEnquiryPayload = {
	message?: string | null;
	budget?: string | number | null;
	timeline?: string | null;
	status?: string | null;
};

type GetEnquiriesQuery = {
	search?: string | undefined;
	status?: string | undefined;
	page?: number | undefined;
	limit?: number | undefined;
};

const includeEnquiryRelations = {
	property: {
		include: {
			media: true,
			documents: {
				include: {
					media: true
				}
			}
		}
	},
	user: {
		select: {
			id: true,
			email: true,
			phone: true,
			individuals: {
				select: {
					fullName: true,
				},
			},
			companies: {
				select: {
					companyName: true,
				},
			},
		},
	},
	interestType: true,
	roles: {
		include: {
			role: true,
		},
	},
	messages: {
		take: 5,
		orderBy: {
			createdAt: "desc" as const,
		},
	},
} as const;

/**
 * Create a new property enquiry
 */
export const createEnquiry = async (payload: CreateEnquiryPayload, userId?: string) => {
	try {
		// Validate required fields
		const requiredFields: Array<keyof CreateEnquiryPayload> = [
			"propertyId",
			"userId",
			"interestTypeId",
		];

		for (const field of requiredFields) {
			const value = payload[field];
			if (typeof value !== "string" || !value.trim()) {
				throw createHttpError(`${field} is required`, 400);
			}
		}

		// Verify property exists
		const propertyExists = await db.property.findUnique({
			where: { id: payload.propertyId },
			select: { id: true, userId: true },
		});

		if (!propertyExists) {
			throw createHttpError("Property not found", 404);
		}

		// A user cannot create an enquiry for their own property
		if (propertyExists.userId === payload.userId) {
			throw createHttpError("You cannot enquire about your own property", 403);
		}

		// Verify user exists
		const userExists = await db.user.findUnique({
			where: { id: payload.userId },
			select: { id: true },
		});

		if (!userExists) {
			throw createHttpError("User not found", 404);
		}

		// Verify interest type exists
		const interestTypeExists = await db.interestType.findUnique({
			where: { id: payload.interestTypeId },
			select: { id: true },
		});

		if (!interestTypeExists) {
			throw createHttpError("Interest type not found", 404);
		}

		// Check for duplicate enquiry
		const existingEnquiry = await db.propertyEnquiry.findFirst({
			where: {
				propertyId: payload.propertyId,
				userId: payload.userId,
			},
		});

		if (existingEnquiry) {
			throw createHttpError(
				"User has already created an enquiry for this property",
				409
			);
		}

		const enquiry = await db.propertyEnquiry.create({
			data: {
				propertyId: payload.propertyId,
				userId: payload.userId,
				interestTypeId: payload.interestTypeId,
				message: payload.message ?? null,
				budget:
					payload.budget === undefined || payload.budget === null
						? null
						: parseDecimal(payload.budget, "budget"),
				timeline: payload.timeline ?? null,
				status: "PENDING_MATCHING",
			},
			include: includeEnquiryRelations,
		});

		// Enrich property with signed URLs
		const enrichedProperty = await enrichListingResult(enquiry.property, userId);

		return {
			...enquiry,
			property: enrichedProperty,
			budget: enquiry.budget?.toString(),
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get all enquiries with optional filters and pagination
 */
export const getEnquiries = async (query: GetEnquiriesQuery, userId?: string) => {
	try {
		const pageSize = query.limit ?? 10;
		const pageNumber = query.page ?? 1;
		const skip = (pageNumber - 1) * pageSize;

		const normalizedStatus = query.status ? normalizeEnquiryStatus(query.status) : undefined;
		if (normalizedStatus && !isValidEnquiryStatus(normalizedStatus)) {
			throw createHttpError("Invalid enquiry status", 400);
		}

		const searchPattern = query.search?.trim() || undefined;
		if (searchPattern) {
			try {
				new RegExp(searchPattern, "i");
			} catch {
				throw createHttpError("Invalid enquiry search pattern", 400);
			}
		}

		const searchConditions: Prisma.Sql[] = [];
		if (searchPattern) {
			searchConditions.push(Prisma.sql`pe."id" ~* ${searchPattern}`);
			searchConditions.push(Prisma.sql`pe."propertyId" ~* ${searchPattern}`);
			searchConditions.push(Prisma.sql`pe."userId" ~* ${searchPattern}`);
			searchConditions.push(Prisma.sql`pe."interestTypeId" ~* ${searchPattern}`);
			searchConditions.push(Prisma.sql`COALESCE(pe."message", '') ~* ${searchPattern}`);
			searchConditions.push(Prisma.sql`COALESCE(pe."timeline", '') ~* ${searchPattern}`);
			searchConditions.push(Prisma.sql`COALESCE(pe."status"::text, '') ~* ${searchPattern}`);
			searchConditions.push(Prisma.sql`COALESCE(pe."budget"::text, '') ~* ${searchPattern}`);
			searchConditions.push(Prisma.sql`COALESCE(pe."createdAt"::text, '') ~* ${searchPattern}`);
			searchConditions.push(Prisma.sql`COALESCE(pe."updatedAt"::text, '') ~* ${searchPattern}`);
			searchConditions.push(Prisma.sql`EXISTS (
				SELECT 1
				FROM "Property" p
				LEFT JOIN "Location" l ON l."propertyId" = p."id"
				LEFT JOIN "PropertyCategory" pc ON pc."id" = p."categoryId"
				LEFT JOIN "PropertyOwnershipType" pot ON pot."id" = p."ownershipTypeId"
				LEFT JOIN "Utilization" u ON u."id" = p."utilizationId"
				LEFT JOIN "LandTitleType" ltt ON ltt."id" = p."titleTypeId"
				WHERE p."id" = pe."propertyId"
				AND (
					COALESCE(p."title", '') ~* ${searchPattern}
					OR COALESCE(p."listingCode", '') ~* ${searchPattern}
					OR COALESCE(p."description", '') ~* ${searchPattern}
					OR COALESCE(p."landArea"::text, '') ~* ${searchPattern}
					OR COALESCE(p."landAreaUnit", '') ~* ${searchPattern}
					OR COALESCE(p."estimatedValuation"::text, '') ~* ${searchPattern}
					OR COALESCE(p."price"::text, '') ~* ${searchPattern}
					OR COALESCE(p."pricePerSqrft"::text, '') ~* ${searchPattern}
					OR COALESCE(p."status"::text, '') ~* ${searchPattern}
					OR COALESCE(p."createdAt"::text, '') ~* ${searchPattern}
					OR COALESCE(p."updatedAt"::text, '') ~* ${searchPattern}
					OR COALESCE(l."state", '') ~* ${searchPattern}
					OR COALESCE(l."district", '') ~* ${searchPattern}
					OR COALESCE(l."mukim", '') ~* ${searchPattern}
					OR COALESCE(l."section", '') ~* ${searchPattern}
					OR COALESCE(l."latitude"::text, '') ~* ${searchPattern}
					OR COALESCE(l."longitude"::text, '') ~* ${searchPattern}
					OR COALESCE(l."isApproximate"::text, '') ~* ${searchPattern}
					OR COALESCE(pc."name", '') ~* ${searchPattern}
					OR COALESCE(pot."name", '') ~* ${searchPattern}
					OR COALESCE(u."name", '') ~* ${searchPattern}
					OR COALESCE(ltt."name", '') ~* ${searchPattern}
				)
			)`);
			searchConditions.push(Prisma.sql`EXISTS (
				SELECT 1
				FROM "User" usr
				LEFT JOIN "Individual" i ON i."userId" = usr."id"
				LEFT JOIN "Company" c ON c."userId" = usr."id"
				LEFT JOIN "Koperasi" k ON k."userId" = usr."id"
				WHERE usr."id" = pe."userId"
				AND (
					COALESCE(usr."email", '') ~* ${searchPattern}
					OR COALESCE(usr."phone", '') ~* ${searchPattern}
					OR COALESCE(usr."name", '') ~* ${searchPattern}
					OR COALESCE(usr."image", '') ~* ${searchPattern}
					OR COALESCE(usr."status"::text, '') ~* ${searchPattern}
					OR COALESCE(i."fullName", '') ~* ${searchPattern}
					OR COALESCE(i."identityNo", '') ~* ${searchPattern}
					OR COALESCE(c."companyName", '') ~* ${searchPattern}
					OR COALESCE(c."registrationNo", '') ~* ${searchPattern}
					OR COALESCE(k."koperasiName", '') ~* ${searchPattern}
					OR COALESCE(k."registrationNo", '') ~* ${searchPattern}
				)
			)`);
			searchConditions.push(Prisma.sql`EXISTS (
				SELECT 1
				FROM "InterestType" it
				WHERE it."id" = pe."interestTypeId"
				AND (
					COALESCE(it."name", '') ~* ${searchPattern}
					OR COALESCE(it."id", '') ~* ${searchPattern}
				)
			)`);
			searchConditions.push(Prisma.sql`EXISTS (
				SELECT 1
				FROM "EnquiryRole" er
				LEFT JOIN "Role" r ON r."id" = er."roleId"
				WHERE er."enquiryId" = pe."id"
				AND (
					COALESCE(er."id", '') ~* ${searchPattern}
					OR COALESCE(er."roleId", '') ~* ${searchPattern}
					OR COALESCE(r."name", '') ~* ${searchPattern}
				)
			)`);
			searchConditions.push(Prisma.sql`EXISTS (
				SELECT 1
				FROM "Message" m
				WHERE m."enquiryId" = pe."id"
				AND (
					COALESCE(m."content", '') ~* ${searchPattern}
					OR COALESCE(m."createdAt"::text, '') ~* ${searchPattern}
				)
			)`);
		}

		const whereClauses: Prisma.Sql[] = [];
		if (normalizedStatus) {
			whereClauses.push(Prisma.sql`pe."status" = ${normalizedStatus}`);
		}
		if (searchConditions.length > 0) {
			const searchSql = searchConditions.slice(1).reduce(
				(combined, condition) => Prisma.sql`${combined} OR ${condition}`,
				searchConditions[0],
			);
			whereClauses.push(Prisma.sql`(${searchSql})`);
		}

		const whereSql = whereClauses.length > 0
			? Prisma.sql`WHERE ${whereClauses.slice(1).reduce(
				(combined, condition) => Prisma.sql`${combined} AND ${condition}`,
				whereClauses[0],
			)}`
			: Prisma.empty;

		const [countResult, enquiryIds] = await Promise.all([
			db.$queryRaw<Array<{ total: bigint }>>(Prisma.sql`
				SELECT COUNT(*)::bigint AS total
				FROM "PropertyEnquiry" pe
				${whereSql}
			`),
			db.$queryRaw<Array<{ id: string }>>(Prisma.sql`
				SELECT pe."id"
				FROM "PropertyEnquiry" pe
				${whereSql}
				ORDER BY pe."createdAt" DESC, pe."id" DESC
				LIMIT ${pageSize}
				OFFSET ${skip}
			`),
		]);

		const total = Number(countResult[0]?.total ?? 0n);
		const ids = enquiryIds.map((entry) => entry.id);

		const enquiries = ids.length > 0
			? await db.propertyEnquiry.findMany({
				where: {
					id: {
						in: ids,
					},
				},
				include: includeEnquiryRelations,
			})
			: [];

		const enquiryById = new Map(enquiries.map((enquiry) => [enquiry.id, enquiry]));
		const orderedEnquiries = ids
			.map((id) => enquiryById.get(id))
			.filter((enquiry): enquiry is (typeof enquiries)[number] => Boolean(enquiry));

		// Enrich properties with signed URLs
		const enrichedEnquiries = await Promise.all(
			orderedEnquiries.map(async (enquiry) => ({
				...enquiry,
				property: await enrichListingResult(enquiry.property, userId),
				budget: enquiry.budget?.toString(),
				messagesCount: enquiry.messages.length,
			}))
		);

		return {
			data: enrichedEnquiries,
			pagination: {
				page: pageNumber,
				pageSize,
				total,
				pages: Math.ceil(total / pageSize),
			},
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get a single enquiry by ID
 */
export const getEnquiryById = async (enquiryId: string, userId?: string) => {
	if (!enquiryId || enquiryId.trim().length === 0) {
		throw createHttpError("Enquiry ID is required", 400);
	}

	try {
		const enquiry = await db.propertyEnquiry.findUnique({
			where: { id: enquiryId },
			include: {
				...includeEnquiryRelations,
				messages: {
					orderBy: {
						createdAt: "asc",
					},
				},
			},
		});

		if (!enquiry) {
			throw createHttpError("Enquiry not found", 404);
		}

		// Enrich property with signed URLs
		const enrichedProperty = await enrichListingResult(enquiry.property, userId);

		return {
			...enquiry,
			property: enrichedProperty,
			budget: enquiry.budget?.toString(),
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get all enquiries for a specific property
 */
export const getEnquiriesByPropertyId = async (
	propertyId: string,
	page?: number,
	limit?: number,
	userId?: string
) => {
	if (!propertyId || propertyId.trim().length === 0) {
		throw createHttpError("Property ID is required", 400);
	}

	try {
		// Verify property exists
		const propertyExists = await db.property.findUnique({
			where: { id: propertyId },
			select: { id: true },
		});

		if (!propertyExists) {
			throw createHttpError("Property not found", 404);
		}

		const pageSize = limit ?? 10;
		const pageNumber = page ?? 1;
		const skip = (pageNumber - 1) * pageSize;

		const [enquiries, total] = await Promise.all([
			db.propertyEnquiry.findMany({
				where: { propertyId },
				include: includeEnquiryRelations,
				skip,
				take: pageSize,
				orderBy: {
					createdAt: "desc",
				},
			}),
			db.propertyEnquiry.count({ where: { propertyId } }),
		]);

		// Enrich properties with signed URLs
		const enrichedEnquiries = await Promise.all(
			enquiries.map(async (enquiry) => ({
				...enquiry,
				property: await enrichListingResult(enquiry.property, userId),
				budget: enquiry.budget?.toString(),
				messagesCount: enquiry.messages.length,
			}))
		);

		return {
			data: enrichedEnquiries,
			pagination: {
				page: pageNumber,
				pageSize,
				total,
				pages: Math.ceil(total / pageSize),
			},
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get all enquiries by a specific user
 */
export const getEnquiriesByUserId = async (
	userId: string,
	page?: number,
	limit?: number,
	requestingUserId?: string
) => {
	if (!userId || userId.trim().length === 0) {
		throw createHttpError("User ID is required", 400);
	}

	try {
		// Verify user exists
		const userExists = await db.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!userExists) {
			throw createHttpError("User not found", 404);
		}

		const pageSize = limit ?? 10;
		const pageNumber = page ?? 1;
		const skip = (pageNumber - 1) * pageSize;

		const [enquiries, total] = await Promise.all([
			db.propertyEnquiry.findMany({
				where: { userId },
				include: includeEnquiryRelations,
				skip,
				take: pageSize,
				orderBy: {
					createdAt: "desc",
				},
			}),
			db.propertyEnquiry.count({ where: { userId } }),
		]);

		// Enrich properties with signed URLs
		const enrichedEnquiries = await Promise.all(
			enquiries.map(async (enquiry) => ({
				...enquiry,
				property: await enrichListingResult(enquiry.property, requestingUserId),
				budget: enquiry.budget?.toString(),
				messagesCount: enquiry.messages.length,
			}))
		);

		return {
			data: enrichedEnquiries,
			pagination: {
				page: pageNumber,
				pageSize,
				total,
				pages: Math.ceil(total / pageSize),
			},
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Update enquiry details
 */
export const updateEnquiry = async (
	enquiryId: string,
	payload: UpdateEnquiryPayload,
	userId?: string
) => {
	if (!enquiryId || enquiryId.trim().length === 0) {
		throw createHttpError("Enquiry ID is required", 400);
	}

	// Validate that at least one field is being updated
	const hasUpdate = Object.values(payload).some(
		(value) => value !== undefined
	);

	if (!hasUpdate) {
		throw createHttpError("At least one field must be updated", 400);
	}

	try {
		// Verify enquiry exists
		const enquiry = await db.propertyEnquiry.findUnique({
			where: { id: enquiryId },
		});

		if (!enquiry) {
			throw createHttpError("Enquiry not found", 404);
		}

		const updateData: Prisma.PropertyEnquiryUpdateInput = {};

		if (payload.message !== undefined) {
			updateData.message = payload.message;
		}

		if (payload.budget !== undefined) {
			updateData.budget =
				payload.budget === null
					? null
					: parseDecimal(payload.budget, "budget");
		}

		if (payload.timeline !== undefined) {
			updateData.timeline = payload.timeline;
		}

		if (payload.status !== undefined) {
			if (payload.status === null) {
				updateData.status = null;
			} else {
				const normalizedStatus = normalizeEnquiryStatus(payload.status);
				if (!isValidEnquiryStatus(normalizedStatus)) {
					throw createHttpError("Invalid enquiry status", 400);
				}

				updateData.status = normalizedStatus;
			}
		}

		const updatedEnquiry = await db.propertyEnquiry.update({
			where: { id: enquiryId },
			data: updateData,
			include: includeEnquiryRelations,
		});

		// Enrich property with signed URLs
		const enrichedProperty = await enrichListingResult(updatedEnquiry.property, userId);

		return {
			...updatedEnquiry,
			property: enrichedProperty,
			budget: updatedEnquiry.budget?.toString(),
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Delete an enquiry
 */
export const deleteEnquiry = async (enquiryId: string): Promise<void> => {
	if (!enquiryId || enquiryId.trim().length === 0) {
		throw createHttpError("Enquiry ID is required", 400);
	}

	try {
		// Verify enquiry exists
		const enquiry = await db.propertyEnquiry.findUnique({
			where: { id: enquiryId },
		});

		if (!enquiry) {
			throw createHttpError("Enquiry not found", 404);
		}

		// Delete associated enquiry roles first (due to foreign key constraint)
		await db.enquiryRole.deleteMany({
			where: { enquiryId },
		});

		// Delete associated messages
		await db.message.deleteMany({
			where: { enquiryId },
		});

		// Delete the enquiry
		await db.propertyEnquiry.delete({
			where: { id: enquiryId },
		});
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Update enquiry status
 */
export const updateEnquiryStatus = async (
	enquiryId: string,
	status: string
): Promise<void> => {
	if (!enquiryId || enquiryId.trim().length === 0) {
		throw createHttpError("Enquiry ID is required", 400);
	}

	if (!status || status.trim().length === 0) {
		throw createHttpError("Status is required", 400);
	}

	const normalizedStatus = normalizeEnquiryStatus(status);
	if (!isValidEnquiryStatus(normalizedStatus)) {
		throw createHttpError("Invalid enquiry status", 400);
	}

	try {
		// Verify enquiry exists
		const enquiry = await db.propertyEnquiry.findUnique({
			where: { id: enquiryId },
		});

		if (!enquiry) {
			throw createHttpError("Enquiry not found", 404);
		}

		await db.propertyEnquiry.update({
			where: { id: enquiryId },
			data: {
				status: normalizedStatus,
			},
		});
	} catch (error: unknown) {
		throw error;
	}
};
