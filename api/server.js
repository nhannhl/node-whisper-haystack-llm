import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import processRoute from "./routes/process.route.js";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const PORT = 3000;

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(cors("*"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("tiny"));

app.use("/", processRoute);

app.listen(PORT, () => console.log("API RUNNING on port", PORT));
