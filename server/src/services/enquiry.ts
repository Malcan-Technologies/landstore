import db from "../../config/prisma.js";
import { Prisma } from "@prisma/client";

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

export type CreateEnquiryPayload = {
	propertyId: string;
	userId: string;
	interestTypeId: string;
	message?: string | null;
	budget?: string | number | null;
	timeline?: string | null;
	status?: string | null;
};

export type UpdateEnquiryPayload = {
	message?: string | null;
	budget?: string | number | null;
	timeline?: string | null;
	status?: string | null;
};

type GetEnquiriesQuery = {
	propertyId?: string | undefined;
	userId?: string | undefined;
	status?: string | undefined;
	page?: number | undefined;
	limit?: number | undefined;
};

const includeEnquiryRelations = {
	property: {
		select: {
			id: true,
			title: true,
			listingCode: true,
			price: true,
		},
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
export const createEnquiry = async (payload: CreateEnquiryPayload) => {
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
			select: { id: true },
		});

		if (!propertyExists) {
			throw createHttpError("Property not found", 404);
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
				status: payload.status ?? "pending",
			},
			include: includeEnquiryRelations,
		});

		return {
			...enquiry,
			budget: enquiry.budget?.toString(),
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get all enquiries with optional filters and pagination
 */
export const getEnquiries = async (query: GetEnquiriesQuery) => {
	try {
		const pageSize = query.limit ?? 10;
		const pageNumber = query.page ?? 1;
		const skip = (pageNumber - 1) * pageSize;

		const where: Prisma.PropertyEnquiryWhereInput = {};

		if (query.propertyId) {
			where.propertyId = query.propertyId;
		}

		if (query.userId) {
			where.userId = query.userId;
		}

		if (query.status) {
			where.status = query.status;
		}

		const [enquiries, total] = await Promise.all([
			db.propertyEnquiry.findMany({
				where,
				include: includeEnquiryRelations,
				skip,
				take: pageSize,
				orderBy: {
					createdAt: "desc",
				},
			}),
			db.propertyEnquiry.count({ where }),
		]);

		return {
			data: enquiries.map((enquiry) => ({
				...enquiry,
				budget: enquiry.budget?.toString(),
				messagesCount: enquiry.messages.length,
			})),
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
export const getEnquiryById = async (enquiryId: string) => {
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

		return {
			...enquiry,
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
	limit?: number
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

		return {
			data: enquiries.map((enquiry) => ({
				...enquiry,
				budget: enquiry.budget?.toString(),
				messagesCount: enquiry.messages.length,
			})),
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
	limit?: number
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

		return {
			data: enquiries.map((enquiry) => ({
				...enquiry,
				budget: enquiry.budget?.toString(),
				messagesCount: enquiry.messages.length,
			})),
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
	payload: UpdateEnquiryPayload
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
			updateData.status = payload.status;
		}

		const updatedEnquiry = await db.propertyEnquiry.update({
			where: { id: enquiryId },
			data: updateData,
			include: includeEnquiryRelations,
		});

		return {
			...updatedEnquiry,
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
				status: status.trim(),
			},
		});
	} catch (error: unknown) {
		throw error;
	}
};
