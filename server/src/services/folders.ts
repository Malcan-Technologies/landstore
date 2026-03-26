import db from "../../config/prisma";

const createHttpError = (message: string, statusCode: number) => {
	const error = new Error(message) as Error & { statusCode?: number };
	error.statusCode = statusCode;
	return error;
};

/**
 * Create a new shortlist folder for a user
 */
export const createFolder = async (
	userId: string,
	name: string
): Promise<{ id: string; name: string; createdAt: Date; updatedAt: Date }> => {
	if (!name || name.trim().length === 0) {
		throw createHttpError("Folder name is required", 400);
	}

	try {
		const folder = await db.shortlistFolder.create({
			data: {
				userId,
				name: name.trim(),
			},
		});

		return {
			id: folder.id,
			name: folder.name,
			createdAt: folder.createdAt,
			updatedAt: folder.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get all shortlist folders for a user
 */
export const getFoldersByUserId = async (userId: string) => {
	try {
		const folders = await db.shortlistFolder.findMany({
			where: {
				userId,
			},
			include: {
				properties: {
					include: {
						property: {
							select: {
								id: true,
								title: true,
								listingCode: true,
								price: true,
								landArea: true,
								landAreaUnit: true,
								location: {
									select: {
										state: true,
										district: true,
									},
								},
								media: {
									select: {
										fileUrl: true,
									},
								},
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return folders.map((folder: any) => ({
			id: folder.id,
			name: folder.name,
			propertyCount: folder.properties.length,
			properties: folder.properties.map((sp: any) => ({
				id: sp.property.id,
				title: sp.property.title,
				listingCode: sp.property.listingCode,
				price: sp.property.price,
				landArea: sp.property.landArea,
				landAreaUnit: sp.property.landAreaUnit,
				location: sp.property.location,
				imageUrl: sp.property.media?.fileUrl,
				shortlistedAt: sp.createdAt,
			})),
			createdAt: folder.createdAt,
			updatedAt: folder.updatedAt,
		}));
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get a single folder by ID (user ownership check included)
 */
export const getFolderById = async (
	folderId: string,
	userId: string
) => {
	try {
		const folder = await db.shortlistFolder.findUnique({
			where: {
				id: folderId,
			},
			include: {
				properties: {
					include: {
						property: {
							select: {
								id: true,
								title: true,
								listingCode: true,
								price: true,
								landArea: true,
								landAreaUnit: true,
								location: {
									select: {
										state: true,
										district: true,
									},
								},
								media: {
									select: {
										fileUrl: true,
									},
								},
							},
						},
					},
				},
			},
		});

		if (!folder) {
			throw createHttpError("Folder not found", 404);
		}

		if (folder.userId !== userId) {
			throw createHttpError(
				"You do not have permission to access this folder",
				403
			);
		}

		return {
			id: folder.id,
			name: folder.name,
			propertyCount: folder.properties.length,
			properties: folder.properties.map((sp) => ({
				id: sp.property.id,
				title: sp.property.title,
				listingCode: sp.property.listingCode,
				price: sp.property.price,
				landArea: sp.property.landArea,
				landAreaUnit: sp.property.landAreaUnit,
				location: sp.property.location,
				imageUrl: sp.property.media?.fileUrl,
				shortlistedAt: sp.createdAt,
			})),
			createdAt: folder.createdAt,
			updatedAt: folder.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Update folder name (rename)
 */
export const updateFolderName = async (
	folderId: string,
	userId: string,
	newName: string
): Promise<{ id: string; name: string; updatedAt: Date }> => {
	if (!newName || newName.trim().length === 0) {
		throw createHttpError("Folder name is required", 400);
	}

	try {
		// Check ownership
		const folder = await db.shortlistFolder.findUnique({
			where: {
				id: folderId,
			},
		});

		if (!folder) {
			throw createHttpError("Folder not found", 404);
		}

		if (folder.userId !== userId) {
			throw createHttpError(
				"You do not have permission to update this folder",
				403
			);
		}

		const updatedFolder = await db.shortlistFolder.update({
			where: {
				id: folderId,
			},
			data: {
				name: newName.trim(),
			},
		});

		return {
			id: updatedFolder.id,
			name: updatedFolder.name,
			updatedAt: updatedFolder.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Delete a folder and all its shortlisted properties
 */
export const deleteFolder = async (
	folderId: string,
	userId: string
): Promise<void> => {
	try {
		// Check ownership
		const folder = await db.shortlistFolder.findUnique({
			where: {
				id: folderId,
			},
		});

		if (!folder) {
			throw createHttpError("Folder not found", 404);
		}

		if (folder.userId !== userId) {
			throw createHttpError(
				"You do not have permission to delete this folder",
				403
			);
		}

		// Delete folder (cascade delete will handle ShortlistProperty)
		await db.shortlistFolder.delete({
			where: {
				id: folderId,
			},
		});
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Add a property to a shortlist folder
 */
export const addPropertyToFolder = async (
	folderId: string,
	propertyId: string,
	userId: string
): Promise<{ id: string; folderId: string; propertyId: string }> => {
	try {
		// Check folder ownership
		const folder = await db.shortlistFolder.findUnique({
			where: {
				id: folderId,
			},
		});

		if (!folder) {
			throw createHttpError("Folder not found", 404);
		}

		if (folder.userId !== userId) {
			throw createHttpError(
				"You do not have permission to modify this folder",
				403
			);
		}

		// Check if property exists
		const property = await db.property.findUnique({
			where: {
				id: propertyId,
			},
		});

		if (!property) {
			throw createHttpError("Property not found", 404);
		}

		// Check if already shortlisted in this folder
		const existingShortlist = await db.shortlistProperty.findUnique({
			where: {
				folderId_propertyId: {
					folderId,
					propertyId,
				},
			},
		});

		if (existingShortlist) {
			throw createHttpError(
				"Property is already shortlisted in this folder",
				400
			);
		}

		// Add to shortlist
		const shortlist = await db.shortlistProperty.create({
			data: {
				folderId,
				propertyId,
			},
		});

		return {
			id: shortlist.id,
			folderId: shortlist.folderId,
			propertyId: shortlist.propertyId,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Remove a property from a shortlist folder
 */
export const removePropertyFromFolder = async (
	folderId: string,
	propertyId: string,
	userId: string
): Promise<void> => {
	try {
		// Check folder ownership
		const folder = await db.shortlistFolder.findUnique({
			where: {
				id: folderId,
			},
		});

		if (!folder) {
			throw createHttpError("Folder not found", 404);
		}

		if (folder.userId !== userId) {
			throw createHttpError(
				"You do not have permission to modify this folder",
				403
			);
		}

		// Check if shortlist exists
		const shortlist = await db.shortlistProperty.findUnique({
			where: {
				folderId_propertyId: {
					folderId,
					propertyId,
				},
			},
		});

		if (!shortlist) {
			throw createHttpError(
				"Property is not shortlisted in this folder",
				404
			);
		}

		// Remove from shortlist
		await db.shortlistProperty.delete({
			where: {
				id: shortlist.id,
			},
		});
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Check if a property is shortlisted in a folder
 */
export const isPropertyShortlisted = async (
	folderId: string,
	propertyId: string
): Promise<boolean> => {
	try {
		const shortlist = await db.shortlistProperty.findUnique({
			where: {
				folderId_propertyId: {
					folderId,
					propertyId,
				},
			},
		});

		return !!shortlist;
	} catch (error: unknown) {
		return false;
	}
};
