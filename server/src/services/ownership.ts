import db from "../../config/prisma.js";

const createHttpError = (message: string, statusCode: number) => {
	const error = new Error(message) as Error & { statusCode?: number };
	error.statusCode = statusCode;
	return error;
};

/**
 * Create a new ownership type
 */
export const createOwnershipType = async (name: string) => {
	if (!name || name.trim().length === 0) {
		throw createHttpError("Ownership type name is required", 400);
	}

	try {
		const ownershipType = await db.propertyOwnershipType.create({
			data: {
				name: name.trim(),
			},
		});

		return {
			id: ownershipType.id,
			name: ownershipType.name,
			createdAt: ownershipType.createdAt,
			updatedAt: ownershipType.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get all ownership types with property count (paginated)
 */
export const getAllOwnershipTypes = async (page: number = 1, limit: number = 10) => {
	const validPage = Number.isFinite(page) && page > 0 ? page : 1;
	const validLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10;
	const skip = (validPage - 1) * validLimit;

	try {
		const [types, total] = await Promise.all([
			db.propertyOwnershipType.findMany({
				include: {
					properties: {
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
			db.propertyOwnershipType.count(),
		]);

		return {
			items: types.map((type: any) => ({
				id: type.id,
				name: type.name,
				propertyCount: type.properties.length,
				createdAt: type.createdAt,
				updatedAt: type.updatedAt,
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
 * Get a single ownership type by ID
 */
export const getOwnershipTypeById = async (typeId: string) => {
	if (!typeId || typeId.trim().length === 0) {
		throw createHttpError("Ownership type ID is required", 400);
	}

	try {
		const type = await db.propertyOwnershipType.findUnique({
			where: {
				id: typeId,
			},
			include: {
				properties: {
					select: {
						id: true,
						title: true,
						listingCode: true,
						price: true,
					},
				},
			},
		});

		if (!type) {
			throw createHttpError("Ownership type not found", 404);
		}

		return {
			id: type.id,
			name: type.name,
			propertyCount: type.properties.length,
			properties: type.properties,
			createdAt: type.createdAt,
			updatedAt: type.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Update ownership type name
 */
export const updateOwnershipType = async (
	typeId: string,
	newName: string
) => {
	if (!typeId || typeId.trim().length === 0) {
		throw createHttpError("Ownership type ID is required", 400);
	}

	if (!newName || newName.trim().length === 0) {
		throw createHttpError("Ownership type name is required", 400);
	}

	try {
		const type = await db.propertyOwnershipType.findUnique({
			where: {
				id: typeId,
			},
		});

		if (!type) {
			throw createHttpError("Ownership type not found", 404);
		}

		const updatedType = await db.propertyOwnershipType.update({
			where: {
				id: typeId,
			},
			data: {
				name: newName.trim(),
			},
		});

		return {
			id: updatedType.id,
			name: updatedType.name,
			updatedAt: updatedType.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Delete ownership type (only if no properties associated)
 */
export const deleteOwnershipType = async (typeId: string): Promise<void> => {
	if (!typeId || typeId.trim().length === 0) {
		throw createHttpError("Ownership type ID is required", 400);
	}

	try {
		const type = await db.propertyOwnershipType.findUnique({
			where: {
				id: typeId,
			},
			include: {
				properties: {
					select: {
						id: true,
					},
				},
			},
		});

		if (!type) {
			throw createHttpError("Ownership type not found", 404);
		}

		if (type.properties.length > 0) {
			throw createHttpError(
				`Cannot delete ownership type with ${type.properties.length} associated properties`,
				409
			);
		}

		await db.propertyOwnershipType.delete({
			where: {
				id: typeId,
			},
		});
	} catch (error: unknown) {
		throw error;
	}
};
