import express from "express";

// Child routes
import processRoute from "./process.route.js";
import ragRoute from "./rag.route.js";
import dbhandleRoute from "./dbhandle.js";
import videoTranslateRoute from "./video-translate.route.js";

const router = express.Router();

// Mount child routes
router.use("/", processRoute);
router.use("/rag", ragRoute);
router.use("/db", dbhandleRoute);
router.use("/video-translate", videoTranslateRoute);

export default router;
