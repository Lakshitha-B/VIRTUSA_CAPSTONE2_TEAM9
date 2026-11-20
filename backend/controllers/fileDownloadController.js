
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

export const downloadFile = (req, res) => {
    try {
        const filename = req.params.filename;

        // Validate filename
        if (
            !filename ||
            filename !== path.basename(filename) ||
            filename.includes("/") ||
            filename.includes("\\")
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

        if (
            !fs.existsSync(filePath) ||
            !fs.statSync(filePath).isFile()
        ) {
            return res.status(404).json({
                success: false,
                message: "File not found",
            });
        }

        res.download(filePath, filename, (error) => {
            if (error) {
                console.error("Download error:", error);

                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: "Unable to download file",
                    });
                }
            }
        });

    } catch (error) {
        console.error("Download error:", error);

        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Unable to download file",
            });
        }
    }
};
