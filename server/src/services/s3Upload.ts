import s3ClientConfig from "../../config/AWSs3.js";
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream } from "fs";
import { randomBytes } from "crypto";
import path from "path";

type MulterFile = Express.Multer.File;

/**
 * Generate unique file key for S3 storage
 * Uses crypto random bytes + timestamp + original file extension for uniqueness
 * Example: "a1b2c3d4e5f6g7h8_1713283200000.pdf"
 * 
 * @param file - Multer file object
 * @returns Unique file key
 */
const generateUniqueFileKey = (file: MulterFile): string => {
	const randomString = randomBytes(8).toString("hex");
	const timestamp = Date.now();
	const ext = path.extname(file.originalname);
	const uniqueKey = `${randomString}_${timestamp}${ext}`;
	console.log(`📦 Generated unique file key: ${uniqueKey} (original: ${file.originalname})`);
	return uniqueKey;
};

/**
 * Upload file to S3 bucket
 * 
 * IMPORTANT: This function returns ONLY the file key (not a URL).
 * The file key is stored in the database.
 * Signed URLs are generated dynamically in GET endpoints via signedUrlTransformer.
 * 
 * @param file - Multer file object
 * @param bucketName - S3 bucket name
 * @returns Unique file key (stored in database)
 */
export const uploadFileToS3 = async (
	file: MulterFile,
	bucketName: string = process.env.AWS_BUCKET_NAME as string
): Promise<string> => {
	// Validate environment
	if (!bucketName) {
		throw new Error("AWS_BUCKET_NAME is not defined");
	}

	try {
		const fileKey = generateUniqueFileKey(file);
		const fileBody = file.buffer ?? createReadStream(file.path);

		const params = {
			Bucket: bucketName,
			Key: fileKey,
			Body: fileBody,
			ContentType: file.mimetype,
		};

		console.log(`📤 Uploading to S3 - Bucket: ${bucketName}, Key: ${fileKey}`);

		const upload = new Upload({
			client: s3ClientConfig,
			params,
		});

		await upload.done();

		console.log(`✅ File uploaded successfully to S3: ${fileKey}`);

		// Return ONLY the file key (not any URL)
		// Signed URLs are generated dynamically when needed
		return fileKey;
	} catch (error) {
		console.error("❌ Error uploading file to S3:", error);
		throw new Error("Failed to upload file to S3");
	}
};

/**
 * Generate a signed URL for accessing a private S3 object
 * 
 * IMPORTANT USAGE:
 * - Called dynamically in GET endpoints to generate temporary access URLs
 * - Each signed URL expires after expiresIn seconds (default: 1 hour)
 * - File key must be stored in database, NOT the signed URL
 * - Signed URLs are NEVER stored - they are generated on-demand
 * 
 * @param fileKey - The S3 object key (file identifier in database)
 * @param bucketName - The S3 bucket name
 * @param expiresIn - URL expiration in seconds (default: 3600 = 1 hour)
 * @returns Temporary signed URL (valid for expiresIn duration)
 */
export const generateSignedUrl = async (
	fileKey: string,
	bucketName: string = process.env.AWS_BUCKET_NAME as string,
	expiresIn: number = 3600
): Promise<string> => {
	// Validate inputs
	if (!fileKey || fileKey.trim() === "") {
		const errorMsg = "File key is required and cannot be empty";
		console.error(`❌ ${errorMsg}`);
		throw new Error(errorMsg);
	}

	if (!bucketName || bucketName.trim() === "") {
		const errorMsg = "AWS_BUCKET_NAME is not defined or empty";
		console.error(`❌ ${errorMsg}`);
		throw new Error(errorMsg);
	}

	try {
		const command = new GetObjectCommand({
			Bucket: bucketName,
			Key: fileKey,
		});

		console.log(`🔗 Generating signed URL for: ${fileKey} (expires in ${expiresIn}s)`);

		// Generate signed URL valid for specified duration
		const signedUrl = await getSignedUrl(s3ClientConfig, command, { expiresIn });

		console.log(`✅ Signed URL generated successfully`);
		return signedUrl;
	} catch (error) {
		console.error(`❌ Error generating signed URL for ${fileKey}:`, error);
		throw new Error(`Failed to generate signed URL for file: ${fileKey}`);
	}
};

/**
 * Safe wrapper to convert S3 fileKey to a signed URL
 * Returns null if signing fails (instead of throwing)
 * Use this for graceful degradation
 * 
 * @param fileKey - The S3 object key
 * @param bucketName - The S3 bucket name
 * @param expiresIn - URL expiration in seconds
 * @returns Signed URL or null if generation fails
 */
export const getFileSignedUrl = async (
	fileKey: string | null | undefined,
	bucketName: string = process.env.AWS_BUCKET_NAME as string,
	expiresIn: number = 3600
): Promise<string | null> => {
	if (!fileKey) {
		return null;
	}

	try {
		return await generateSignedUrl(fileKey, bucketName, expiresIn);
	} catch (error) {
		console.error(`⚠️ Failed to generate signed URL for ${fileKey}, returning null`, error);
		return null;
	}
};

export const deleteFileFromS3 = async (
  fileKey: string,
  bucketName: string = process.env.AWS_BUCKET_NAME as string
): Promise<string> => {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileKey,
    };

    const command = new DeleteObjectCommand(params);
    await s3ClientConfig.send(command);

    return `File ${fileKey} deleted successfully from S3`;
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw new Error("Failed to delete file from S3");
  }
};