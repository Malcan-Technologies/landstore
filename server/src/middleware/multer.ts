import multer from "multer";
import type { StorageEngine } from "multer";
import type { Request } from "express";

const storage: StorageEngine = multer.diskStorage({
  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

export default upload;