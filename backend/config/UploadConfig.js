
import multer from "multer";
import path from "node:path";

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_FILES = 5;

export const allowedTypes = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const expectedMimeType = allowedTypes[extension];

  if (!expectedMimeType) {
    return callback(new Error("Unsupported file extension."));
  }

  if (file.mimetype !== expectedMimeType) {
    return callback(
      new Error("File extension and MIME type do not match.")
    );
  }

  callback(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});
