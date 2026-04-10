import db from "../../config/prisma.js";

const createHttpError = (message: string, statusCode: number) => {
	const error = new Error(message) as Error & { statusCode?: number };
	error.statusCode = statusCode;
	return error;
};

/**
 * Create a new interest type
 */
export const createInterestType = async (name: string) => {
	if (!name || name.trim().length === 0) {
		throw createHttpError("Interest type name is required", 400);
	}

	try {
		const interestType = await db.interestType.create({
			data: {
				name: name.trim(),
			},
		});

		return {
			id: interestType.id,
			name: interestType.name,
			createdAt: interestType.createdAt,
			updatedAt: interestType.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get all interest types with enquiry count
 */
export const getAllInterestTypes = async () => {
	try {
		const interestTypes = await db.interestType.findMany({
			include: {
				enquiries: {
					select: {
						id: true,
					},
				},
			},
			orderBy: {
				name: "asc",
			},
		});

		return interestTypes.map((interestType: any) => ({
			id: interestType.id,
			name: interestType.name,
			enquiryCount: interestType.enquiries.length,
			createdAt: interestType.createdAt,
			updatedAt: interestType.updatedAt,
		}));
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get a single interest type by ID with enquiries
 */
export const getInterestTypeById = async (interestTypeId: string) => {
	if (!interestTypeId || interestTypeId.trim().length === 0) {
		throw createHttpError("Interest type ID is required", 400);
	}

	try {
		const interestType = await db.interestType.findUnique({
			where: {
				id: interestTypeId,
			},
			include: {
				enquiries: {
					select: {
						id: true,
						propertyId: true,
						userId: true,
						status: true,
						createdAt: true,
					},
					orderBy: {
						createdAt: "desc",
					},
				},
			},
		});

		if (!interestType) {
			throw createHttpError("Interest type not found", 404);
		}

		return {
			id: interestType.id,
			name: interestType.name,
			enquiryCount: interestType.enquiries.length,
			enquiries: interestType.enquiries,
			createdAt: interestType.createdAt,
			updatedAt: interestType.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Update interest type name
 */
export const updateInterestType = async (
	interestTypeId: string,
	newName: string
) => {
	if (!interestTypeId || interestTypeId.trim().length === 0) {
		throw createHttpError("Interest type ID is required", 400);
	}

	if (!newName || newName.trim().length === 0) {
		throw createHttpError("Interest type name is required", 400);
	}

	try {
		const interestType = await db.interestType.findUnique({
			where: {
				id: interestTypeId,
			},
		});

		if (!interestType) {
			throw createHttpError("Interest type not found", 404);
		}

		const updatedInterestType = await db.interestType.update({
			where: {
				id: interestTypeId,
			},
			data: {
				name: newName.trim(),
			},
		});

		return {
			id: updatedInterestType.id,
			name: updatedInterestType.name,
			updatedAt: updatedInterestType.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Delete interest type (only if no enquiries associated)
 */
export const deleteInterestType = async (
	interestTypeId: string
): Promise<void> => {
	if (!interestTypeId || interestTypeId.trim().length === 0) {
		throw createHttpError("Interest type ID is required", 400);
	}

	try {
		const interestType = await db.interestType.findUnique({
			where: {
				id: interestTypeId,
			},
			include: {
				enquiries: {
					select: {
						id: true,
					},
				},
			},
		});

		if (!interestType) {
			throw createHttpError("Interest type not found", 404);
		}

		if (interestType.enquiries.length > 0) {
			throw createHttpError(
				`Cannot delete interest type with ${interestType.enquiries.length} associated enquiries`,
				409
			);
		}

		await db.interestType.delete({
			where: {
				id: interestTypeId,
			},
		});
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Check if interest type exists
 */
export const interestTypeExists = async (interestTypeId: string): Promise<boolean> => {
	try {
		const interestType = await db.interestType.findUnique({
			where: {
				id: interestTypeId,
			},
		});

		return !!interestType;
	} catch (error: unknown) {
		throw error;
	}
};
