import express from "express";

// Child routes
import processRoute from "./process.route.js";
import ragRoute from "./rag.route.js";

const router = express.Router();

// Mount child routes
router.use("/", processRoute);
router.use("/rag", ragRoute);

export default router;
