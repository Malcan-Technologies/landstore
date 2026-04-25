import { generateSignedUrl } from "./s3Upload.js";

// AWS configuration - MUST be defined
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME as string;
const SIGNED_URL_EXPIRY = 3600; // 1 hour in seconds
const MAX_CONCURRENT_REQUESTS = 5; // Concurrency limit to avoid overwhelming S3

// Validate AWS bucket name on import
if (!AWS_BUCKET_NAME) {
	console.error("❌ CRITICAL: AWS_BUCKET_NAME environment variable is not defined!");
	console.error("Please set AWS_BUCKET_NAME in your .env file");
}

/**
 * Process signed URLs with concurrency limit
 * Prevents overwhelming S3 API with too many simultaneous requests
 * 
 * @param items - Array of items to process
 * @param processFn - Async function to process each item
 * @param concurrency - Max concurrent requests
 * @returns Processed items
 */
/**
 * Process items with controlled concurrency to avoid overwhelming S3 API
 * Used for transforming multiple items (properties, media) in parallel with limits
 * 
 * @param items - Array of items to process
 * @param processFn - Async function to process each item
 * @param concurrency - Maximum concurrent operations (default: 5)
 * @returns Array of processed results in original order
 */
export const processConcurrently = async <T, R>(
	items: T[],
	processFn: (item: T) => Promise<R>,
	concurrency: number = MAX_CONCURRENT_REQUESTS
): Promise<R[]> => {
	const results: R[] = [];
	const executing: Promise<void>[] = [];

	for (const item of items) {
		const promise = Promise.resolve().then(async () => {
			const result = await processFn(item);
			results.push(result);
		});

		executing.push(promise);

		if (executing.length >= concurrency) {
			await Promise.race(executing);
			executing.splice(executing.findIndex(p => p === promise), 1);
		}
	}

	await Promise.all(executing);
	return results;
};

/**
 * Transform property media with signed URLs
 * 
 * USAGE: Call this in GET endpoints to dynamically generate signed URLs
 * DO NOT store signed URLs in database - only store fileKeys
 * 
 * Performance notes:
 * - Uses concurrency limiting for bulk media
 * - Suitable for detail endpoints (GET /properties/:id)
 * - Each media item gets a unique signed URL
 * - Respects concurrency to avoid S3 API limits
 * 
 * @param property - Property object with media array
 * @returns Property object with signed URLs added to media and documents
 */
export const transformPropertyWithSignedUrls = async (property: any) => {
	if (!property) {
		return property;
	}
	console.log(property);

	const mediaRelation = property.media;
	const documentsRelation = property.documents;

	let transformedDocuments = documentsRelation;
	if (Array.isArray(documentsRelation) && documentsRelation.length > 0) {
		console.log(`📋 Processing ${documentsRelation.length} property documents for property ${property.id}`);
		transformedDocuments = await processConcurrently(
			documentsRelation,
			async (doc: any) => {
				if (!doc?.media?.fileUrl) {
					console.log(`⚠️ Document has no media or fileUrl, returning as-is`);
					return doc;
				}

				try {
					console.log(`🔗 Generating signed URL for document ${doc.id} - fileKey: ${doc.media.fileUrl}`);
					const docSignedUrl = await generateSignedUrl(doc.media.fileUrl, AWS_BUCKET_NAME, SIGNED_URL_EXPIRY);
					return {
						...doc,
						media: {
							...doc.media,
							fileUrl: docSignedUrl,
						},
					};
				} catch (docError) {
					console.error(`❌ Failed to generate signed URL for document ${doc.id}`, docError);
					return doc;
				}
			},
			MAX_CONCURRENT_REQUESTS
		);
	}

	if (!mediaRelation) {
		console.log(`ℹ️ Property has no media, returning as-is`);
		return {
			...property,
			documents: transformedDocuments,
		};
	}

	if (Array.isArray(mediaRelation)) {
		if (mediaRelation.length === 0) {
			console.log(`ℹ️ Property has no media, returning as-is`);
			return property;
		}

		console.log(`📋 Processing ${mediaRelation.length} media items for property ${property.id}`);

		const mediaWithUrls = await processConcurrently(
			mediaRelation,
			async (media: any) => {
				if (!media || !media.fileUrl) {
					console.log(`⚠️ Media item has no fileUrl, returning as-is`);
					return media;
				}

				try {
					console.log(`🔗 Generating signed URL for media ${media.id} - fileKey: ${media.fileUrl}`);
					const signedUrl = await generateSignedUrl(media.fileUrl, AWS_BUCKET_NAME, SIGNED_URL_EXPIRY);

					return {
						...media,
						fileUrl: signedUrl,
					};
				} catch (error) {
					console.error(`❌ Failed to generate signed URL for media ${media.id}`, error);
					return media;
				}
			},
			MAX_CONCURRENT_REQUESTS
		);

		return {
			...property,
			media: mediaWithUrls,
			documents: transformedDocuments,
		};
	}

	if (!mediaRelation.fileUrl) {
		console.log(`⚠️ Media item has no fileUrl, returning as-is`);
		return property;
	}

	try {
		console.log(`🔗 Generating signed URL for media ${mediaRelation.id} - fileKey: ${mediaRelation.fileUrl}`);
		const signedUrl = await generateSignedUrl(mediaRelation.fileUrl, AWS_BUCKET_NAME, SIGNED_URL_EXPIRY);

		return {
			...property,
			media: {
				...mediaRelation,
				fileUrl: signedUrl,
			},
			documents: transformedDocuments,
		};
	} catch (error) {
		console.error(`❌ Failed to generate signed URL for media ${mediaRelation.id}`, error);
		return {
			...property,
			documents: transformedDocuments,
		};
	}
};

/**
 * Transform single media item with signed URL
 * 
 * USAGE: Use for individual media items (e.g., user profile picture)
 * DO NOT store result - generate on-demand in GET endpoints
 * 
 * @param media - Media object with fileUrl (S3 file key)
 * @returns Media object with signed URL, or original if generation fails
 */
export const transformMediaWithSignedUrl = async (media: any): Promise<any> => {
	if (!media || !media.fileUrl) {
		console.log(`ℹ️ Media item is empty or has no fileUrl`);
		return media;
	}

	try {
		console.log(`🔗 Generating signed URL for media ${media.id} - fileKey: ${media.fileUrl}`);
		const signedUrl = await generateSignedUrl(media.fileUrl, AWS_BUCKET_NAME, SIGNED_URL_EXPIRY);

		return {
			...media,
			fileUrl: signedUrl, // Overwrite fileKey with temporary signed URL
		};
	} catch (error) {
		console.error(`❌ Failed to generate signed URL for media ${media.id}`, error);
		// Return media with original fileKey on error (graceful fallback)
		return media;
	}
};

/**
 * Generate signed URL for a single file
 * 
 * USAGE: For individual file requests
 * DO NOT store result - generate on-demand in GET endpoints
 * 
 * @param fileUrl - S3 file key (stored in database)
 * @returns Signed URL or original fileKey if generation fails
 */
export const generateMediaSignedUrl = async (fileUrl: string | null): Promise<string | null> => {
	if (!fileUrl) {
		return null;
	}

	try {
		console.log(`🔗 Generating signed URL for fileKey: ${fileUrl}`);
		const signedUrl = await generateSignedUrl(fileUrl, AWS_BUCKET_NAME, SIGNED_URL_EXPIRY);
		console.log(`✅ Signed URL generated successfully`);
		return signedUrl;
	} catch (error) {
		console.error(`❌ Error generating signed URL for ${fileUrl}:`, error);
		// Return original fileKey as fallback
		console.log(`⚠️ Falling back to original fileKey`);
		return fileUrl;
	}
};
