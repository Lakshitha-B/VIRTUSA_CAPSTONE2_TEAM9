
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const METADATA_FILE = path.join(UPLOADS_DIR, "file-metadata.json");

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const getAllFiles = (req, res) => {
    try {
        const files = fs.readdirSync(UPLOADS_DIR);

        let metadata = {};

        if (fs.existsSync(METADATA_FILE)) {
            metadata = JSON.parse(
                fs.readFileSync(METADATA_FILE, "utf-8")
            );
        }

        const fileDetails = files
            .filter((filename) => {
                if (filename === "file-metadata.json") {
                    return false;
                }

                const filePath = path.join(UPLOADS_DIR, filename);

                return fs.statSync(filePath).isFile();
            })
            .map((filename) => {
                const filePath = path.join(UPLOADS_DIR, filename);
                const stats = fs.statSync(filePath);
                const fileMetadata = metadata[filename] || {};

                return {
                    filename,
                    originalname: fileMetadata.originalname || filename,
                    size: stats.size,
                    uploadDate: fileMetadata.uploadDate || stats.birthtime,
                };
            })
            // Most recently uploaded files first
            .sort(
                (a, b) =>
                    new Date(b.uploadDate).getTime() -
                    new Date(a.uploadDate).getTime()
            );

        res.status(200).json({
            success: true,
            count: fileDetails.length,
            files: fileDetails,
        });

    } catch (error) {
        console.error("Error retrieving files:", error);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve uploaded files",
        });
    }
};
