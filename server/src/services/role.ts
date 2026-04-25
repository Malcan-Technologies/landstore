import db from "../../config/prisma.js";

type CreateRolePayload = {
	name: string;
};

type UpdateRolePayload = {
	name?: string;
};

type GetRolesQuery = {
	name?: string;
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

const includeRoleRelations = {
	enquiryRoles: {
		include: {
			enquiry: {
				select: {
					id: true,
					propertyId: true,
					userId: true,
					status: true,
				},
			},
		},
	},
} as const;

const ensureRoleNameUnique = async (name: string, excludeId?: string) => {
	const existing = await db.role.findFirst({
		where: {
			...(excludeId ? { id: { not: excludeId } } : {}),
			name: {
				equals: name,
				mode: "insensitive",
			},
		},
		select: { id: true },
	});

	if (existing) {
		throw createHttpError("Role name already exists", 409);
	}
};

export const createRole = async (payload: CreateRolePayload) => {
	const name = ensureNonEmptyString(payload.name, "name");
	await ensureRoleNameUnique(name);

	return await db.role.create({
		data: {
			name,
		},
		include: includeRoleRelations,
	});
};

export const getRoles = async (query: GetRolesQuery) => {
	const where =
		typeof query.name === "string" && query.name.trim()
			? {
				name: {
					contains: query.name.trim(),
					mode: "insensitive" as const,
				},
			}
			: {};

	const page = parsePositiveInteger(query.page, 1, 100000);
	const pageSize = parsePositiveInteger(query.limit, 10, 100);
	const skip = (page - 1) * pageSize;

	const [items, total] = await Promise.all([
		db.role.findMany({
			where,
			include: includeRoleRelations,
			orderBy: { createdAt: "desc" },
			skip,
			take: pageSize,
		}),
		db.role.count({ where }),
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

export const getRoleById = async (id: string) => {
	const roleId = ensureNonEmptyString(id, "id");

	const role = await db.role.findUnique({
		where: { id: roleId },
		include: includeRoleRelations,
	});

	if (!role) {
		throw createHttpError("Role not found", 404);
	}

	return role;
};

export const updateRole = async (id: string, payload: UpdateRolePayload) => {
	const roleId = ensureNonEmptyString(id, "id");

	const existing = await db.role.findUnique({
		where: { id: roleId },
		select: { id: true },
	});

	if (!existing) {
		throw createHttpError("Role not found", 404);
	}

	if (payload.name === undefined) {
		throw createHttpError("At least one field (name) must be provided", 400);
	}

	const name = ensureNonEmptyString(payload.name, "name");
	await ensureRoleNameUnique(name, roleId);

	return await db.role.update({
		where: { id: roleId },
		data: { name },
		include: includeRoleRelations,
	});
};

export const deleteRole = async (id: string) => {
	const roleId = ensureNonEmptyString(id, "id");

	const existing = await db.role.findUnique({
		where: { id: roleId },
		select: { id: true },
	});

	if (!existing) {
		throw createHttpError("Role not found", 404);
	}

	await db.role.delete({
		where: { id: roleId },
	});

	return { message: "Role deleted successfully" };
};
