import s3ClientConfig from "../../config/AWSs3.js";
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream } from "fs";

type MulterFile = Express.Multer.File;

export const uploadFileToS3 = async (
  file: MulterFile,
  bucketName: string = process.env.AWS_BUCKET_NAME as string
): Promise<string> => {
  try {
    const fileBody = file.buffer ?? createReadStream(file.path);

    const params = {
      Bucket: bucketName,
      Key: file.originalname,
      Body: fileBody,
      ContentType: file.mimetype,
    };

    const upload = new Upload({
      client: s3ClientConfig,
      params,
    });

    await upload.done();

    // Return file key (not the direct URL, since bucket is private)
    // Frontend/services can use generateSignedUrl to get temporary access URLs
    return file.originalname;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
};

/**
 * Generate a signed URL for accessing a private S3 object
 * @param fileKey - The S3 object key (filename)
 * @param bucketName - The S3 bucket name
 * @param expiresIn - URL expiration in seconds (default: 3600 = 1 hour)
 */
export const generateSignedUrl = async (
  fileKey: string,
  bucketName: string = process.env.AWS_BUCKET_NAME as string,
  expiresIn: number = 3600
): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });

    // Generate signed URL valid for specified duration
    const url = await getSignedUrl(s3ClientConfig, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate signed URL");
  }
};

/**
 * Convert S3 fileKey to a signed URL
 * Utility function to enhance responses with temporary access URLs
 */
export const getFileSignedUrl = async (
  fileKey: string | null | undefined,
  bucketName: string = process.env.AWS_BUCKET_NAME as string,
  expiresIn: number = 3600
): Promise<string | null> => {
  if (!fileKey) return null;
  
  try {
    return await generateSignedUrl(fileKey, bucketName, expiresIn);
  } catch (error) {
    console.error("Error getting signed URL for file:", fileKey, error);
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