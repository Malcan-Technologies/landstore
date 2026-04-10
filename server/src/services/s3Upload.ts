import s3ClientConfig from "../../config/AWSs3.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
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

    return `https://${bucketName}.s3.amazonaws.com/${file.originalname}`;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("Failed to upload file to S3");
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