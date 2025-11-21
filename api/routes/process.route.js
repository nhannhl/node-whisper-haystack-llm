import express from "express";
import multer from "multer";
import path from "path";
import { processHandler } from "../controllers/process.controller.js";

const router = express.Router();

const UPLOAD_LIMIT = parseInt(process.env.UPLOAD_LIMIT || "52428800");
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: UPLOAD_LIMIT }
});

router.post("/process", upload.single("video"), processHandler);

export default router;
