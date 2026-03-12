import { uploadFileToS3,deleteFileFromS3 } from "../services/s3Upload.js";
import db from '../../config/prisma.js';

export const uploadTestFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = await uploadFileToS3(req.file);
    const newFileRecord = await db.FileTest.create({
      data: {
        fileUrl,
        fileKey: req.file.originalname,
      },
    });
    res.status(201).json({ success: true, message: 'File uploaded successfully', fileUrl });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};