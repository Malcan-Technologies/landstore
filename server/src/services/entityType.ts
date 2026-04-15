import db from "../../config/prisma.js";

const createHttpError = (message: string, statusCode: number) => {
	const error = new Error(message) as Error & { statusCode?: number };
	error.statusCode = statusCode;
	return error;
};

/**
 * Create a new entity type
 */
export const createEntityType = async (name: string) => {
	if (!name || name.trim().length === 0) {
		throw createHttpError("Entity type name is required", 400);
	}

	try {
		const entityType = await db.entityType.create({
			data: {
				name: name.trim(),
			},
		});

		return {
			id: entityType.id,
			name: entityType.name,
			createdAt: entityType.createdAt,
			updatedAt: entityType.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get all entity types with user count (paginated)
 */
export const getAllEntityTypes = async (page: number = 1, limit: number = 10) => {
	const validPage = Number.isFinite(page) && page > 0 ? page : 1;
	const validLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10;
	const skip = (validPage - 1) * validLimit;

	try {
		const [entityTypes, total] = await Promise.all([
			db.entityType.findMany({
				include: {
					users: {
						select: {
							id: true,
						},
					},
				},
				orderBy: {
					name: "asc",
				},
				skip,
				take: validLimit,
			}),
			db.entityType.count(),
		]);

		return {
			items: entityTypes.map((entityType: any) => ({
				id: entityType.id,
				name: entityType.name,
				userCount: entityType.users.length,
				createdAt: entityType.createdAt,
				updatedAt: entityType.updatedAt,
			})),
			pagination: {
				page: validPage,
				limit: validLimit,
				total,
				totalPages: Math.ceil(total / validLimit) || 1,
			},
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get a single entity type by ID with users
 */
export const getEntityTypeById = async (entityTypeId: string) => {
	if (!entityTypeId || entityTypeId.trim().length === 0) {
		throw createHttpError("Entity type ID is required", 400);
	}

	try {
		const entityType = await db.entityType.findUnique({
			where: {
				id: entityTypeId,
			},
			include: {
				users: {
					select: {
						id: true,
						userId: true,
						user: {
							select: {
								id: true,
								email: true,
								userType: true,
							},
						},
						createdAt: true,
					},
					orderBy: {
						createdAt: "desc",
					},
				},
			},
		});

		if (!entityType) {
			throw createHttpError("Entity type not found", 404);
		}

		return {
			id: entityType.id,
			name: entityType.name,
			userCount: entityType.users.length,
			users: entityType.users,
			createdAt: entityType.createdAt,
			updatedAt: entityType.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Update entity type name
 */
export const updateEntityType = async (
	entityTypeId: string,
	newName: string
) => {
	if (!entityTypeId || entityTypeId.trim().length === 0) {
		throw createHttpError("Entity type ID is required", 400);
	}

	if (!newName || newName.trim().length === 0) {
		throw createHttpError("Entity type name is required", 400);
	}

	try {
		const entityType = await db.entityType.findUnique({
			where: {
				id: entityTypeId,
			},
		});

		if (!entityType) {
			throw createHttpError("Entity type not found", 404);
		}

		const updatedEntityType = await db.entityType.update({
			where: {
				id: entityTypeId,
			},
			data: {
				name: newName.trim(),
			},
		});

		return {
			id: updatedEntityType.id,
			name: updatedEntityType.name,
			updatedAt: updatedEntityType.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Delete entity type (only if no users associated)
 */
export const deleteEntityType = async (
	entityTypeId: string
): Promise<void> => {
	if (!entityTypeId || entityTypeId.trim().length === 0) {
		throw createHttpError("Entity type ID is required", 400);
	}

	try {
		const entityType = await db.entityType.findUnique({
			where: {
				id: entityTypeId,
			},
			include: {
				users: {
					select: {
						id: true,
					},
				},
			},
		});

		if (!entityType) {
			throw createHttpError("Entity type not found", 404);
		}

		if (entityType.users.length > 0) {
			throw createHttpError(
				`Cannot delete entity type with ${entityType.users.length} associated users`,
				409
			);
		}

		await db.entityType.delete({
			where: {
				id: entityTypeId,
			},
		});
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Check if entity type exists
 */
export const entityTypeExists = async (entityTypeId: string): Promise<boolean> => {
	try {
		const entityType = await db.entityType.findUnique({
			where: {
				id: entityTypeId,
			},
		});

		return !!entityType;
	} catch (error: unknown) {
		throw error;
	}
};
