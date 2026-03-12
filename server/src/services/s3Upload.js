import s3ClientConfig from "../../config/AWSs3.js";
import { PutObjectCommand,DeleteObjectCommand } from "@aws-sdk/client-s3";

export const uploadFileToS3 = async (file, bucketName = process.env.AWS_BUCKET_NAME) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3ClientConfig.send(command);

    return `https://${bucketName}.s3.amazonaws.com/${file.originalname}`;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
};

export const deleteFileFromS3 = async (fileKey, bucketName = process.env.AWS_BUCKET_NAME) => {
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