import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import fs from "fs";
import path from "path";
import { initializeCollection } from "./services/qdrant_vector_db.service.js";

dotenv.config();

const app = express();
const PORT = 3000;

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(cors("*"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("tiny"));
app.use("/uploads", express.static(UPLOAD_DIR));

app.use("/", routes);

async function startServer() {
  console.log(" Initializing Qdrant collection…");

  try {
    await initializeCollection();
    console.log("Qdrant collection ready.");

    app.listen(PORT, () => {
      console.log(`API RUNNING on port ${PORT}`);
    });

  } catch (err) {
    console.error("Failed to initialize Qdrant!", err.message);

    process.exit(1);
  }
}

startServer();
