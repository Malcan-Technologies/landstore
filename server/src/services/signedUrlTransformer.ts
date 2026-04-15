import { generateSignedUrl } from "./s3Upload.js";

/**
 * Transform property media with signed URLs
 * Converts stored S3 file keys into temporary signed URLs
 * 
 * @param property - Property object with media array
 * @returns Property object with signed URLs for media files
 * 
 * This function handles:
 * - Null/undefined media checks
 * - Non-array media validation
 * - Individual signed URL generation with error handling
 * - Fallback to original S3 key if signing fails
 */
export const transformPropertyWithSignedUrls = async (property: any) => {
	if (!property.media || !Array.isArray(property.media) || property.media.length === 0) {
		return property;
	}

	const mediaWithUrls = await Promise.all(
		property.media.map(async (media: any) => {
			try {
				return {
					...media,
					fileUrl: media.fileUrl ? await generateSignedUrl(media.fileUrl) : null,
				};
			} catch (error) {
				console.error("Error generating signed URL for media:", media?.id, error);
				// Return media with original fileUrl if signing fails
				return media;
			}
		})
	);

	return {
		...property,
		media: mediaWithUrls,
	};
};

/**
 * Transform single media item with signed URL
 * Converts a single S3 file key into a temporary signed URL
 * 
 * @param media - Media object with fileUrl S3 key
 * @returns Media object with signed URL, or original if signing fails
 */
export const transformMediaWithSignedUrl = async (media: any): Promise<any> => {
	if (!media || !media.fileUrl) {
		return media;
	}

	try {
		return {
			...media,
			fileUrl: await generateSignedUrl(media.fileUrl),
		};
	} catch (error) {
		console.error("Error generating signed URL for media:", media?.id, error);
		// Return media with original fileUrl if signing fails
		return media;
	}
};

/**
 * Generate signed URL for a file path
 * Wrapper around generateSignedUrl with error handling
 * 
 * @param fileUrl - S3 file path/key
 * @returns Signed URL or original path if signing fails
 */
export const generateMediaSignedUrl = async (fileUrl: string | null): Promise<string | null> => {
	if (!fileUrl) return null;

	try {
		return await generateSignedUrl(fileUrl);
	} catch (error) {
		console.error("Error generating signed URL:", error);
		// Return original fileUrl as fallback
		return fileUrl;
	}
};
