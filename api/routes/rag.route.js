import express from "express";
import { ragQueryHandler } from "../controllers/rag.controller.js";
import { deepRAGQueryHandler } from "../controllers/deep-rag.controller.js";

const router = express.Router();

router.post("/query", ragQueryHandler);
router.post("/deep-query", deepRAGQueryHandler);

export default router;
