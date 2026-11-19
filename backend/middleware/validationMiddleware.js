
import path from "node:path";
import { fileTypeFromBuffer } from "file-type";

import {
  allowedTypes,
  MAX_FILE_SIZE,
  MAX_FILES,
} from "../config/UploadConfig.js";

const normalizeExtension = (extension) =>
  extension === ".jpeg" ? ".jpg" : extension;

const createError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const detectFileType = async (buffer) => {
  // PDF signature
  if (buffer.subarray(0, 5).toString("ascii") === "%PDF-") {
    return { ext: "pdf", mime: "application/pdf" };
  }

  // JPEG and PNG signature detection
  return await fileTypeFromBuffer(buffer);
};

const validationMiddleware = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);

    if (files.length === 0) {
      throw createError("No files were uploaded.");
    }

    if (files.length > MAX_FILES) {
      throw createError(`Maximum ${MAX_FILES} files are allowed.`);
    }

    // Validate all files before continuing.
    for (const file of files) {
      if (!file.buffer || file.size === 0) {
        throw createError(`${file.originalname}: Empty or invalid file.`);
      }

      if (file.size > MAX_FILE_SIZE) {
        throw createError(`${file.originalname}: File exceeds 5 MB.`);
      }

      const extension = path.extname(file.originalname).toLowerCase();
      const expectedMime = allowedTypes[extension];

      if (!expectedMime) {
        throw createError(`${file.originalname}: Unsupported extension.`);
      }

      if (file.mimetype !== expectedMime) {
        throw createError(`${file.originalname}: MIME type mismatch.`);
      }

      const detectedType = await detectFileType(file.buffer);

      if (!detectedType) {
        throw createError(`${file.originalname}: Invalid file signature.`);
      }

      const actualExtension = `.${detectedType.ext}`;

      if (
        normalizeExtension(actualExtension) !==
          normalizeExtension(extension) ||
        detectedType.mime !== expectedMime
      ) {
        throw createError(
          `${file.originalname}: File content does not match its extension.`
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default validationMiddleware;
