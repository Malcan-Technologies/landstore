import db from "../../config/prisma.js";
import { generateSignedUrl } from "./s3Upload.js";

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
export const getFoldersByUserId = async (userId: string, page: number = 1, limit: number = 10) => {
	const validPage = Number.isFinite(page) && page > 0 ? page : 1;
	const validLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10;
	const skip = (validPage - 1) * validLimit;

	try {
		const [folders, total] = await Promise.all([
			db.shortlistFolder.findMany({
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
								},
							},
						},
					},
				},
				skip,
				take: validLimit,
			}),
			db.shortlistFolder.count({
				where: { userId },
			}),
		]);

		const totalPages = Math.ceil(total / validLimit);

		return {
			items: folders,
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

		// Transform properties with signed URLs
		const propertiesWithUrls = await Promise.all(
			folder.properties.map(async (sp: any) => ({
				id: sp.property.id,
				title: sp.property.title,
				listingCode: sp.property.listingCode,
				price: sp.property.price,
				landArea: sp.property.landArea,
				landAreaUnit: sp.property.landAreaUnit,
				location: sp.property.location,
				imageUrl: sp.property.media?.fileUrl
					? await generateSignedUrl(sp.property.media.fileUrl)
					: null,
				shortlistedAt: sp.createdAt,
			}))
		);

		return {
			id: folder.id,
			name: folder.name,
			propertyCount: folder.properties.length,
			properties: propertiesWithUrls,
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

/**
 * Create a subfolder inside a parent folder
 */
export const createSubfolder = async (
	parentFolderId: string,
	subfoldername: string,
	userId: string
): Promise<{ id: string; name: string; parentFolderId: string; createdAt: Date }> => {
	if (!subfoldername || subfoldername.trim().length === 0) {
		throw createHttpError("Subfolder name is required", 400);
	}

	try {
		// Verify parent folder exists and belongs to user
		const parentFolder = await db.shortlistFolder.findUnique({
			where: { id: parentFolderId },
		});

		if (!parentFolder) {
			throw createHttpError("Parent folder not found", 404);
		}

		if (parentFolder.userId !== userId) {
			throw createHttpError(
				"You do not have permission to create a subfolder in this folder",
				403
			);
		}

		// Create subfolder
		const subfolder = await db.shortlistFolder.create({
			data: {
				userId,
				name: subfoldername.trim(),
				parentFolderId,
			},
		});

		return {
			id: subfolder.id,
			name: subfolder.name,
			parentFolderId: subfolder.parentFolderId || "",
			createdAt: subfolder.createdAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get folder hierarchy (includes subfolders and properties)
 */
export const getFolderHierarchy = async (
	folderId: string,
	userId: string
): Promise<any> => {
	try {
		// Get the main folder
		const folder = await db.shortlistFolder.findUnique({
			where: { id: folderId },
			include: {
				subFolders: {
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
				},
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

		// Transform main folder properties with signed URLs
		const mainPropertiesWithUrls = await Promise.all(
			folder.properties.map(async (sp: any) => ({
				id: sp.property.id,
				title: sp.property.title,
				listingCode: sp.property.listingCode,
				price: sp.property.price,
				landArea: sp.property.landArea,
				landAreaUnit: sp.property.landAreaUnit,
				location: sp.property.location,
				imageUrl: sp.property.media?.fileUrl
					? await generateSignedUrl(sp.property.media.fileUrl)
					: null,
				shortlistedAt: sp.createdAt,
			}))
		);

		// Transform subfolders with signed URLs
		const subFoldersWithUrls = await Promise.all(
			folder.subFolders.map(async (sf: any) => {
				const subPropertiesWithUrls = await Promise.all(
					sf.properties.map(async (sp: any) => ({
						id: sp.property.id,
						title: sp.property.title,
						listingCode: sp.property.listingCode,
						price: sp.property.price,
						landArea: sp.property.landArea,
						landAreaUnit: sp.property.landAreaUnit,
						location: sp.property.location,
						imageUrl: sp.property.media?.fileUrl
							? await generateSignedUrl(sp.property.media.fileUrl)
							: null,
						shortlistedAt: sp.createdAt,
					}))
				);

				return {
					id: sf.id,
					name: sf.name,
					parentFolderId: sf.parentFolderId,
					propertyCount: sf.properties.length,
					properties: subPropertiesWithUrls,
					createdAt: sf.createdAt,
					updatedAt: sf.updatedAt,
				};
			})
		);

		// Build hierarchical structure
		return {
			id: folder.id,
			name: folder.name,
			parentFolderId: folder.parentFolderId,
			propertyCount: folder.properties.length,
			properties: mainPropertiesWithUrls,
			subFolders: subFoldersWithUrls,
			createdAt: folder.createdAt,
			updatedAt: folder.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Move a folder under another parent folder
 */
export const moveFolder = async (
	folderId: string,
	newParentFolderId: string,
	userId: string
): Promise<{ id: string; parentFolderId: string; updatedAt: Date }> => {
	try {
		// Verify the folder exists and belongs to user
		const folder = await db.shortlistFolder.findUnique({
			where: { id: folderId },
		});

		if (!folder) {
			throw createHttpError("Folder not found", 404);
		}

		if (folder.userId !== userId) {
			throw createHttpError(
				"You do not have permission to move this folder",
				403
			);
		}

		// Prevent moving to itself
		if (folderId === newParentFolderId) {
			throw createHttpError("Cannot move a folder to itself", 400);
		}

		// Verify new parent folder exists and belongs to user
		const newParentFolder = await db.shortlistFolder.findUnique({
			where: { id: newParentFolderId },
		});

		if (!newParentFolder) {
			throw createHttpError("New parent folder not found", 404);
		}

		if (newParentFolder.userId !== userId) {
			throw createHttpError(
				"You do not have permission to move to this folder",
				403
			);
		}

		// Prevent circular reference (moving parent to child)
		let current = newParentFolder;
		while (current.parentFolderId) {
			if (current.parentFolderId === folderId) {
				throw createHttpError(
					"Cannot move a parent folder under its subfolder (circular reference)",
					400
				);
			}
			current = await db.shortlistFolder.findUniqueOrThrow({
				where: { id: current.parentFolderId },
			});
		}

		// Move the folder
		const movedFolder = await db.shortlistFolder.update({
			where: { id: folderId },
			data: { parentFolderId: newParentFolderId },
		});

		return {
			id: movedFolder.id,
			parentFolderId: movedFolder.parentFolderId || "",
			updatedAt: movedFolder.updatedAt,
		};
	} catch (error: unknown) {
		throw error;
	}
};

/**
 * Get all root folders and their hierarchy for a user (paginated)
 */
export const getAllFoldersHierarchy = async (
	userId: string,
	page: number = 1,
	limit: number = 10
): Promise<any> => {
	const validPage = Number.isFinite(page) && page > 0 ? page : 1;
	const validLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10;
	const skip = (validPage - 1) * validLimit;

	try {
		// Get only root folders (parentFolderId is null) with pagination
		const [rootFolders, total] = await Promise.all([
			db.shortlistFolder.findMany({
				where: {
					userId,
					parentFolderId: null,
				},
				include: {
					subFolders: {
						include: {
							properties: true,
							subFolders: true,
						},
					},
					properties: true,
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: validLimit,
			}),
			db.shortlistFolder.count({
				where: {
					userId,
					parentFolderId: null,
				},
			}),
		]);

		return {
			items: rootFolders.map((folder: any) => ({
				id: folder.id,
				name: folder.name,
				parentFolderId: folder.parentFolderId,
				propertyCount: folder.properties.length,
				subFolderCount: folder.subFolders.length,
				subFolders: folder.subFolders.map((sf: any) => ({
					id: sf.id,
					name: sf.name,
					parentFolderId: sf.parentFolderId,
					propertyCount: sf.properties.length,
					subFolderCount: sf.subFolders.length,
				})),
				createdAt: folder.createdAt,
				updatedAt: folder.updatedAt,
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
