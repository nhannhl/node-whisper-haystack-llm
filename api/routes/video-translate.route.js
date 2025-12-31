import express from "express";
import { translateVideo } from "../controllers/video-translate.controller.js";

const router = express.Router();

router.get("/translate-video", translateVideo);

export default router;
