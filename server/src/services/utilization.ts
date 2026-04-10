import db from "../../config/prisma.js";

const createHttpError = (message: string, statusCode: number) => {
	const error = new Error(message) as Error & { statusCode?: number };
	error.statusCode = statusCode;
	return error;
};

/**
 * Create a new utilization
 */
export const createUtilization = async (name: string) => {
	if (!name || name.trim().length === 0) {
		throw createHttpError("Utilization name is required", 400);
	}

	try {
		const utilization = await db.utilization.create({
			data: {
				name: name.trim(),
			},
		});

		return {
			id: utilization.id,
			name: utilization.name,
			createdAt: utilization.createdAt,
			updatedAt: utilization.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get all utilizations with property count
 */
export const getAllUtilizations = async () => {
	try {
		const utilizations = await db.utilization.findMany({
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

		return utilizations.map((util: any) => ({
			id: util.id,
			name: util.name,
			propertyCount: util.properties.length,
			createdAt: util.createdAt,
			updatedAt: util.updatedAt,
		}));
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get a single utilization by ID
 */
export const getUtilizationById = async (utilId: string) => {
	if (!utilId || utilId.trim().length === 0) {
		throw createHttpError("Utilization ID is required", 400);
	}

	try {
		const utilization = await db.utilization.findUnique({
			where: {
				id: utilId,
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

		if (!utilization) {
			throw createHttpError("Utilization not found", 404);
		}

		return {
			id: utilization.id,
			name: utilization.name,
			propertyCount: utilization.properties.length,
			properties: utilization.properties,
			createdAt: utilization.createdAt,
			updatedAt: utilization.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Update utilization name
 */
export const updateUtilization = async (
	utilId: string,
	newName: string
) => {
	if (!utilId || utilId.trim().length === 0) {
		throw createHttpError("Utilization ID is required", 400);
	}

	if (!newName || newName.trim().length === 0) {
		throw createHttpError("Utilization name is required", 400);
	}

	try {
		const utilization = await db.utilization.findUnique({
			where: {
				id: utilId,
			},
		});

		if (!utilization) {
			throw createHttpError("Utilization not found", 404);
		}

		const updatedUtil = await db.utilization.update({
			where: {
				id: utilId,
			},
			data: {
				name: newName.trim(),
			},
		});

		return {
			id: updatedUtil.id,
			name: updatedUtil.name,
			updatedAt: updatedUtil.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Delete utilization (only if no properties associated)
 */
export const deleteUtilization = async (utilId: string): Promise<void> => {
	if (!utilId || utilId.trim().length === 0) {
		throw createHttpError("Utilization ID is required", 400);
	}

	try {
		const utilization = await db.utilization.findUnique({
			where: {
				id: utilId,
			},
			include: {
				properties: {
					select: {
						id: true,
					},
				},
			},
		});

		if (!utilization) {
			throw createHttpError("Utilization not found", 404);
		}

		if (utilization.properties.length > 0) {
			throw createHttpError(
				`Cannot delete utilization with ${utilization.properties.length} associated properties`,
				409
			);
		}

		await db.utilization.delete({
			where: {
				id: utilId,
			},
		});
	} catch (error: unknown) {
		throw error;
	}
};
