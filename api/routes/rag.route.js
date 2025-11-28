import express from "express";
import { ragQueryHandler } from "../controllers/rag.controller.js";

const router = express.Router();

router.post("/query", ragQueryHandler);

export default router;
