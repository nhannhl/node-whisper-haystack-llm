import path from "path";
import { downloadWithYtDlpByQuanlity } from "../services/yt.service.js";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function translateVideo(req, res) {
    try {
        const video_url = req.query.url || null;
        const tempFile = path.join(UPLOAD_DIR, `${Date.now()}.mp4`);
        await downloadWithYtDlpByQuanlity(video_url, tempFile);

        res.json({ message: "Video downloaded successfully" });
    } catch (error) {
        console.error("Error downloading video:", error);
        res.status(500).json({ error: "Failed to download video" });
    }
}