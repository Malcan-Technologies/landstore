import db from "../../config/prisma.js";

const createHttpError = (message: string, statusCode: number) => {
	const error = new Error(message) as Error & { statusCode?: number };
	error.statusCode = statusCode;
	return error;
};

/**
 * Create a new property category
 */
export const createCategory = async (name: string) => {
	if (!name || name.trim().length === 0) {
		throw createHttpError("Category name is required", 400);
	}

	try {
		const category = await db.propertyCategory.create({
			data: {
				name: name.trim(),
			},
		});

		return {
			id: category.id,
			name: category.name,
			createdAt: category.createdAt,
			updatedAt: category.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get all property categories with property count
 */
export const getAllCategories = async () => {
	try {
		const categories = await db.propertyCategory.findMany({
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

		return categories.map((category: any) => ({
			id: category.id,
			name: category.name,
			propertyCount: category.properties.length,
			createdAt: category.createdAt,
			updatedAt: category.updatedAt,
		}));
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get a single category by ID with properties
 */
export const getCategoryById = async (categoryId: string) => {
	if (!categoryId || categoryId.trim().length === 0) {
		throw createHttpError("Category ID is required", 400);
	}

	try {
		const category = await db.propertyCategory.findUnique({
			where: {
				id: categoryId,
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

		if (!category) {
			throw createHttpError("Category not found", 404);
		}

		return {
			id: category.id,
			name: category.name,
			propertyCount: category.properties.length,
			properties: category.properties,
			createdAt: category.createdAt,
			updatedAt: category.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Update category name
 */
export const updateCategory = async (
	categoryId: string,
	newName: string
) => {
	if (!categoryId || categoryId.trim().length === 0) {
		throw createHttpError("Category ID is required", 400);
	}

	if (!newName || newName.trim().length === 0) {
		throw createHttpError("Category name is required", 400);
	}

	try {
		const category = await db.propertyCategory.findUnique({
			where: {
				id: categoryId,
			},
		});

		if (!category) {
			throw createHttpError("Category not found", 404);
		}

		const updatedCategory = await db.propertyCategory.update({
			where: {
				id: categoryId,
			},
			data: {
				name: newName.trim(),
			},
		});

		return {
			id: updatedCategory.id,
			name: updatedCategory.name,
			updatedAt: updatedCategory.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Delete category (only if no properties associated)
 */
export const deleteCategory = async (categoryId: string): Promise<void> => {
	if (!categoryId || categoryId.trim().length === 0) {
		throw createHttpError("Category ID is required", 400);
	}

	try {
		const category = await db.propertyCategory.findUnique({
			where: {
				id: categoryId,
			},
			include: {
				properties: {
					select: {
						id: true,
					},
				},
			},
		});

		if (!category) {
			throw createHttpError("Category not found", 404);
		}

		if (category.properties.length > 0) {
			throw createHttpError(
				`Cannot delete category with ${category.properties.length} associated properties`,
				409
			);
		}

		await db.propertyCategory.delete({
			where: {
				id: categoryId,
			},
		});
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Check if category exists
 */
export const categoryExists = async (categoryId: string): Promise<boolean> => {
	try {
		const category = await db.propertyCategory.findUnique({
			where: {
				id: categoryId,
			},
		});

		return !!category;
	} catch (error: unknown) {
		return false;
	}
};
