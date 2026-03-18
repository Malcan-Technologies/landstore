import multer, { StorageEngine } from "multer";
import { Request } from "express";

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