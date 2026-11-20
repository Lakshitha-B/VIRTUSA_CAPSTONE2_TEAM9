
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

const allowedTypes = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
};

export const previewFile = (req, res) => {
    try {
        const filename = req.params.filename;

        // Reject unsafe filenames
        if (
            !filename ||
            filename !== path.basename(filename) ||
            filename.includes("\\") ||
            filename.includes("/")
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid filename",
            });
        }

        const filePath = path.resolve(UPLOADS_DIR, filename);
        const relativePath = path.relative(UPLOADS_DIR, filePath);

        // Prevent access outside uploads directory
        if (
            relativePath.startsWith("..") ||
            path.isAbsolute(relativePath)
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const extension = path.extname(filename).toLowerCase();
        const contentType = allowedTypes[extension];

        if (!contentType) {
            return res.status(415).json({
                success: false,
                message: "This file type cannot be previewed",
            });
        }

        if (
            !fs.existsSync(filePath) ||
            !fs.statSync(filePath).isFile()
        ) {
            return res.status(404).json({
                success: false,
                message: "File not found",
            });
        }

        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", "inline");
        res.setHeader("X-Content-Type-Options", "nosniff");

        const stream = fs.createReadStream(filePath);

        stream.on("error", (error) => {
            console.error("Preview error:", error);

            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: "Unable to preview file",
                });
            } else {
                res.destroy(error);
            }
        });

        stream.pipe(res);

    } catch (error) {
        console.error("Preview error:", error);

        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Unable to preview file",
            });
        }
    }
};
