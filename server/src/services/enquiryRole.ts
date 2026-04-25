import { Prisma } from "@prisma/client";
import db from "../../config/prisma.js";

type CreateEnquiryRolePayload = {
	enquiryId: string;
	roleId: string;
};

type UpdateEnquiryRolePayload = {
	enquiryId?: string;
	roleId?: string;
};

type GetEnquiryRolesQuery = {
	enquiryId?: string;
	roleId?: string;
	page?: number;
	limit?: number;
};

const createHttpError = (message: string, statusCode: number) => {
	const error = new Error(message) as Error & { statusCode?: number };
	error.statusCode = statusCode;
	return error;
};

const ensureNonEmptyString = (value: unknown, fieldName: string): string => {
	if (typeof value !== "string" || !value.trim()) {
		throw createHttpError(`${fieldName} is required`, 400);
	}

	return value.trim();
};

const parsePositiveInteger = (
	value: number | undefined,
	fallback: number,
	max: number
): number => {
	if (value === undefined || value === null) return fallback;
	if (!Number.isFinite(value) || value <= 0) return fallback;
	return Math.min(Math.floor(value), max);
};

const includeEnquiryRoleRelations = {
	enquiry: {
		select: {
			id: true,
			propertyId: true,
			userId: true,
			status: true,
			createdAt: true,
			updatedAt: true,
		},
	},
	role: true,
} as const;

const validateEnquiryExists = async (enquiryId: string) => {
	const enquiry = await db.propertyEnquiry.findUnique({
		where: { id: enquiryId },
		select: { id: true },
	});

	if (!enquiry) {
		throw createHttpError("Enquiry not found", 404);
	}
};

const validateRoleExists = async (roleId: string) => {
	const role = await db.role.findUnique({
		where: { id: roleId },
		select: { id: true },
	});

	if (!role) {
		throw createHttpError("Role not found", 404);
	}
};

export const createEnquiryRole = async (payload: CreateEnquiryRolePayload) => {
	try {
		const enquiryId = ensureNonEmptyString(payload.enquiryId, "enquiryId");
		const roleId = ensureNonEmptyString(payload.roleId, "roleId");

		await Promise.all([validateEnquiryExists(enquiryId), validateRoleExists(roleId)]);

		return await db.enquiryRole.create({
			data: {
				enquiryId,
				roleId,
			},
			include: includeEnquiryRoleRelations,
		});
	} catch (error: unknown) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				throw createHttpError("This role is already assigned to the enquiry", 409);
			}
			if (error.code === "P2003") {
				throw createHttpError("Invalid enquiryId or roleId", 400);
			}
		}

		throw error;
	}
};

export const getEnquiryRoles = async (query: GetEnquiryRolesQuery) => {
	const where: Prisma.EnquiryRoleWhereInput = {};

	if (typeof query.enquiryId === "string" && query.enquiryId.trim()) {
		where.enquiryId = query.enquiryId.trim();
	}

	if (typeof query.roleId === "string" && query.roleId.trim()) {
		where.roleId = query.roleId.trim();
	}

	const page = parsePositiveInteger(query.page, 1, 100000);
	const pageSize = parsePositiveInteger(query.limit, 10, 100);
	const skip = (page - 1) * pageSize;

	const [items, total] = await Promise.all([
		db.enquiryRole.findMany({
			where,
			include: includeEnquiryRoleRelations,
			orderBy: { createdAt: "desc" },
			skip,
			take: pageSize,
		}),
		db.enquiryRole.count({ where }),
	]);

	return {
		data: items,
		pagination: {
			page,
			pageSize,
			total,
			pages: Math.ceil(total / pageSize),
		},
	};
};

export const getEnquiryRoleById = async (id: string) => {
	const enquiryRoleId = ensureNonEmptyString(id, "id");

	const enquiryRole = await db.enquiryRole.findUnique({
		where: { id: enquiryRoleId },
		include: includeEnquiryRoleRelations,
	});

	if (!enquiryRole) {
		throw createHttpError("Enquiry role not found", 404);
	}

	return enquiryRole;
};

export const updateEnquiryRole = async (
	id: string,
	payload: UpdateEnquiryRolePayload
) => {
	const enquiryRoleId = ensureNonEmptyString(id, "id");

	const existing = await db.enquiryRole.findUnique({
		where: { id: enquiryRoleId },
		select: { id: true },
	});

	if (!existing) {
		throw createHttpError("Enquiry role not found", 404);
	}

	const updateData: Prisma.EnquiryRoleUpdateInput = {};

	if (payload.enquiryId !== undefined) {
		const enquiryId = ensureNonEmptyString(payload.enquiryId, "enquiryId");
		await validateEnquiryExists(enquiryId);
		updateData.enquiry = {
			connect: { id: enquiryId },
		};
	}

	if (payload.roleId !== undefined) {
		const roleId = ensureNonEmptyString(payload.roleId, "roleId");
		await validateRoleExists(roleId);
		updateData.role = {
			connect: { id: roleId },
		};
	}

	if (Object.keys(updateData).length === 0) {
		throw createHttpError("At least one field (enquiryId or roleId) must be provided", 400);
	}

	try {
		return await db.enquiryRole.update({
			where: { id: enquiryRoleId },
			data: updateData,
			include: includeEnquiryRoleRelations,
		});
	} catch (error: unknown) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2002") {
				throw createHttpError("This role is already assigned to the enquiry", 409);
			}
			if (error.code === "P2003") {
				throw createHttpError("Invalid enquiryId or roleId", 400);
			}
		}

		throw error;
	}
};

export const deleteEnquiryRole = async (id: string) => {
	const enquiryRoleId = ensureNonEmptyString(id, "id");

	const existing = await db.enquiryRole.findUnique({
		where: { id: enquiryRoleId },
		select: { id: true },
	});

	if (!existing) {
		throw createHttpError("Enquiry role not found", 404);
	}

	await db.enquiryRole.delete({
		where: { id: enquiryRoleId },
	});

	return { message: "Enquiry role deleted successfully" };
};
