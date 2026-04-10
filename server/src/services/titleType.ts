import db from "../../config/prisma.js";

const createHttpError = (message: string, statusCode: number) => {
	const error = new Error(message) as Error & { statusCode?: number };
	error.statusCode = statusCode;
	return error;
};

/**
 * Create a new land title type
 */
export const createTitleType = async (name: string) => {
	if (!name || name.trim().length === 0) {
		throw createHttpError("Land title type name is required", 400);
	}

	try {
		const titleType = await db.landTitleType.create({
			data: {
				name: name.trim(),
			},
		});

		return {
			id: titleType.id,
			name: titleType.name,
			createdAt: titleType.createdAt,
			updatedAt: titleType.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get all land title types with property count
 */
export const getAllTitleTypes = async () => {
	try {
		const titleTypes = await db.landTitleType.findMany({
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
		});

		return titleTypes.map((type: any) => ({
			id: type.id,
			name: type.name,
			propertyCount: type.properties.length,
			createdAt: type.createdAt,
			updatedAt: type.updatedAt,
		}));
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get a single land title type by ID
 */
export const getTitleTypeById = async (typeId: string) => {
	if (!typeId || typeId.trim().length === 0) {
		throw createHttpError("Land title type ID is required", 400);
	}

	try {
		const titleType = await db.landTitleType.findUnique({
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

		if (!titleType) {
			throw createHttpError("Land title type not found", 404);
		}

		return {
			id: titleType.id,
			name: titleType.name,
			propertyCount: titleType.properties.length,
			properties: titleType.properties,
			createdAt: titleType.createdAt,
			updatedAt: titleType.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Update land title type name
 */
export const updateTitleType = async (
	typeId: string,
	newName: string
) => {
	if (!typeId || typeId.trim().length === 0) {
		throw createHttpError("Land title type ID is required", 400);
	}

	if (!newName || newName.trim().length === 0) {
		throw createHttpError("Land title type name is required", 400);
	}

	try {
		const titleType = await db.landTitleType.findUnique({
			where: {
				id: typeId,
			},
		});

		if (!titleType) {
			throw createHttpError("Land title type not found", 404);
		}

		const updatedType = await db.landTitleType.update({
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
 * Delete land title type (only if no properties associated)
 */
export const deleteTitleType = async (typeId: string): Promise<void> => {
	if (!typeId || typeId.trim().length === 0) {
		throw createHttpError("Land title type ID is required", 400);
	}

	try {
		const titleType = await db.landTitleType.findUnique({
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

		if (!titleType) {
			throw createHttpError("Land title type not found", 404);
		}

		if (titleType.properties.length > 0) {
			throw createHttpError(
				`Cannot delete land title type with ${titleType.properties.length} associated properties`,
				409
			);
		}

		await db.landTitleType.delete({
			where: {
				id: typeId,
			},
		});
	} catch (error: unknown) {
		throw error;
	}
};
