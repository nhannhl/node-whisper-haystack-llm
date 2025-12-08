import express from "express";
import { deleteAllPointsByDocument, migrateCollection } from "../controllers/dbhandle.controller.js";

const router = express.Router();

router.get("/delete-all-points/:name?", deleteAllPointsByDocument);
router.get("/migrate-collection", migrateCollection);

export default router;
