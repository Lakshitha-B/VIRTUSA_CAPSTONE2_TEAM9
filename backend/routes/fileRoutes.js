
import express from "express";

import { getAllFiles } from "../controllers/fileController.js";
import { previewFile } from "../controllers/filePreviewController.js";
import { downloadFile } from "../controllers/fileDownloadController.js";
import { deleteFile } from "../controllers/fileDeleteController.js";

const router = express.Router();

router.get("/", getAllFiles);
router.get("/:filename/download", downloadFile);
router.delete("/:filename", deleteFile);
router.get("/:filename", previewFile);

export default router;
