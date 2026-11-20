
import express from "express";
import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

import { corsConfig, helmetConfig } from "./config/securityConfig.js";
import { generalLimiter, uploadLimiter } from "./middleware/rateLimiter.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import { upload } from "./config/UploadConfig.js";
import validationMiddleware from "./middleware/validationMiddleware.js";

// Document management routes
import fileRoutes from "./routes/fileRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Upload storage directory
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const METADATA_FILE = path.join(UPLOADS_DIR, "file-metadata.json");

// Security middleware
app.use(helmetConfig);
app.use(corsConfig);

// Body parser
app.use(express.json({ limit: "100kb" }));

// Rate limiters
app.use("/api/", generalLimiter);
app.use("/api/documents/upload", uploadLimiter);

// Document management routes
app.use("/api/files", fileRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Secure Document Upload API is running!",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    environment: process.env.NODE_ENV || "development"
  });
});

// Security information
app.get("/api/security-info", (req, res) => {
  res.status(200).json({
    success: true,
    security: {
      helmet: "HTTP security headers enabled",
      cors: `CORS restricted to: ${process.env.CLIENT_URL || "http://localhost:5173"}`,
      rateLimiting: {
        general: "100 requests per 15 minutes",
        upload: "25 uploads per 15 minutes"
      },
      bodyLimit: "JSON body capped at 100kb",
      errorHandling: "Centralized error middleware active"
    }
  });
});

// Rate limit demo
app.get("/api/rate-limit-demo", uploadLimiter, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Request accepted! Hit this 25+ times to trigger rate limiting.",
    requestAt: new Date().toISOString()
  });
});

// Error demo
app.get("/api/error-demo", (req, res, next) => {
  const error = new Error("This is a test error from the server.");
  error.statusCode = 500;
  next(error);
});

// Document upload, validation and permanent storage
app.post(
  "/api/documents/upload",

  // Receive files into memory
  (req, res, next) => {
    upload.array("files", 5)(req, res, (error) => {
      if (error) {
        error.statusCode =
          error.code === "LIMIT_FILE_SIZE" ? 413 : 400;

        return next(error);
      }

      next();
    });
  },

  // Validate file type, size and actual file signature
  validationMiddleware,

  // Save validated files and their original filename metadata
  async (req, res, next) => {
    const savedFiles = [];

    try {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });

      // Read existing metadata
      let metadata = {};

      try {
        const metadataContent = await fs.readFile(
          METADATA_FILE,
          "utf-8"
        );

        metadata = JSON.parse(metadataContent);
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }

      // Save uploaded files
      for (const file of req.files || []) {
        const extension = path.extname(file.originalname).toLowerCase();

        const filename = `${crypto.randomUUID()}${extension}`;

        const filePath = path.join(UPLOADS_DIR, filename);

        const uploadDate = new Date().toISOString();

        await fs.writeFile(filePath, file.buffer, { flag: "wx" });

        savedFiles.push({
          filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          uploadDate
        });

        // Store original filename and upload date
        metadata[filename] = {
          originalname: file.originalname,
          uploadDate
        };
      }

      // Write metadata to a temporary file first
      const tempMetadataFile =
        `${METADATA_FILE}.${crypto.randomUUID()}.tmp`;

      try {
        await fs.writeFile(
          tempMetadataFile,
          JSON.stringify(metadata, null, 2),
          "utf-8"
        );

        // Replace metadata file
        await fs.rename(tempMetadataFile, METADATA_FILE);

      } catch (error) {
        await fs.unlink(tempMetadataFile).catch(() => {});
        throw error;
      }

      return res.status(200).json({
        success: true,
        message: "Files validated and uploaded successfully.",
        files: savedFiles
      });

    } catch (error) {
      // Remove newly saved files if upload processing fails
      await Promise.all(
        savedFiles.map((file) =>
          fs.unlink(
            path.join(UPLOADS_DIR, file.filename)
          ).catch(() => {})
        )
      );

      next(error);
    }
  }
);

// Error handling (must remain last)
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log("----------------------------------------");
  console.log(`Server running at http://localhost:${PORT}`);
  console.log("----------------------------------------");
  console.log("Available endpoints:");
  console.log("GET    /api/health");
  console.log("GET    /api/security-info");
  console.log("GET    /api/rate-limit-demo");
  console.log("GET    /api/error-demo");
  console.log("POST   /api/documents/upload");
  console.log("GET    /api/files");
  console.log("GET    /api/files/:filename");
  console.log("GET    /api/files/:filename/download");
  console.log("DELETE /api/files/:filename");
  console.log("----------------------------------------");
});
