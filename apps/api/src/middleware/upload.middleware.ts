import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { logger } from "../utils/logger";

// Ensure upload directory exists
const createUploadDirectory = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Define storage for different file types
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    let uploadPath = "";

    if (file.fieldname === "candidateImage") {
      uploadPath = path.join(__dirname, "../../uploads/candidates");
    } else if (file.fieldname === "document") {
      uploadPath = path.join(__dirname, "../../uploads/documents");
    } else {
      uploadPath = path.join(__dirname, "../../uploads/misc");
    }

    createUploadDirectory(uploadPath);
    cb(null, uploadPath);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
    const fileExtension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
  },
});

// File filter to allow only specific file types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Define allowed MIME types
  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  const allowedDocTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  // Check file type based on fieldname
  if (
    file.fieldname === "candidateImage" &&
    allowedImageTypes.includes(file.mimetype)
  ) {
    return cb(null, true);
  } else if (
    file.fieldname === "document" &&
    allowedDocTypes.includes(file.mimetype)
  ) {
    return cb(null, true);
  } else if (
    file.fieldname === "candidateImage" ||
    file.fieldname === "document"
  ) {
    return cb(
      new Error(
        `Invalid file type. Allowed types: ${
          file.fieldname === "candidateImage"
            ? "JPEG, JPG, PNG, WEBP"
            : "PDF, DOC, DOCX"
        }`
      )
    );
  }

  // For other field names, allow any type
  cb(null, true);
};

// Configure multer with size limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
});

// Middleware for handling file upload errors
export const handleUploadError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  } else if (err) {
    logger.error("File upload error:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "Error uploading file",
    });
  }
  next();
};

// Export configured upload middleware for different use cases
export const uploadCandidateImage = upload.single("candidateImage");
export const uploadDocument = upload.single("document");
export const uploadMultipleFiles = upload.fields([
  { name: "candidateImage", maxCount: 1 },
  { name: "document", maxCount: 3 },
]);
