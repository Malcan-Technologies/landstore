import { uploadTestFile } from "../controllers/testFile.controller.js";
import express from 'express';
import upload from '../middleware/multer.js';

const router = express.Router();

router.post('/upload', upload.single('file'), uploadTestFile);

export default router;