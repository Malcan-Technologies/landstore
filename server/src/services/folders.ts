import db from "../../config/prisma.js";
import { generateSignedUrl } from "./s3Upload.js";
import { transformPropertyWithSignedUrls } from "./signedUrlTransformer.js";

const createHttpError = (message: string, statusCode: number) => {
	const error = new Error(message) as Error & { statusCode?: number };
	error.statusCode = statusCode;
	return error;
};

/**
 * Create a new shortlist folder for a user (flat, no nesting)
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
				parentFolderId: null, // No parent - always a root folder
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
 * Get all shortlist folders for a user with properties (paginated)
 */
export const getFoldersByUserId = async (userId: string, page: number = 1, limit: number = 10) => {
	const validPage = Number.isFinite(page) && page > 0 ? page : 1;
	const validLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10;
	const skip = (validPage - 1) * validLimit;

	try {
		const [folders, total] = await Promise.all([
			db.shortlistFolder.findMany({
				where: {
					userId,
					parentFolderId: null, // Only root folders
				},
				include: {
					properties: {
						include: {
							property: true, // All property fields
						},
					},
				},
				skip,
				take: validLimit,
				orderBy: { createdAt: "desc" },
			}),
			db.shortlistFolder.count({
				where: {
					userId,
					parentFolderId: null,
				},
			}),
		]);

		const totalPages = Math.ceil(total / validLimit);

		// Transform properties with signed URLs
		const itemsWithTransformedProperties = await Promise.all(
			folders.map(async (folder: any) => ({
				...folder,
				propertyCount: folder.properties.length,
				properties: await Promise.all(
					folder.properties.map(async (sp: any) => ({
						...await transformPropertyWithSignedUrls(sp.property),
						shortlistedAt: sp.createdAt,
					}))
				),
			}))
		);

		return {
			items: itemsWithTransformedProperties,
			pagination: {
				page: validPage,
				limit: validLimit,
				total,
				totalPages,
			},
		};
	} catch (error) {
		throw error;
	}
};

/**
 * Get a single folder by ID with all properties (flat structure only)
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
						property: true, // All property fields and relations
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

		// Transform properties with signed URLs
		const propertiesWithUrls = await Promise.all(
			folder.properties.map(async (sp: any) => ({
				...await transformPropertyWithSignedUrls(sp.property),
				shortlistedAt: sp.createdAt,
			}))
		);

		return {
			...folder,
			propertyCount: folder.properties.length,
			properties: propertiesWithUrls,
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

