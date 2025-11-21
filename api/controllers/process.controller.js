import path from "path";
import { downloadWithYtDlp, downloadSubtitleWithYtDlp, downloadAudioWithYtDlp } from "../services/yt.service.js";
import { sendToWhisper } from "../services/whisper.service.js";
import { callLlama } from "../services/llama.service.js";
import { safeUnlink } from "../utils/file.util.js";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function processHandler(req, res) {
  let tempFile = null;
  let subFile = null;

  try {
    const { type, content, url } = req.body;

    // ===== CASE: URL YouTube =====
    if (type === "url" && url) {
      const id = url.match(/v=([^&]+)/)?.[1] || "video";

      subFile = path.join(UPLOAD_DIR, `${id}-${Date.now()}.vtt`);
      try {
        await downloadSubtitleWithYtDlp(url, subFile);

        if (fs.existsSync(subFile)) {
          console.log("[YT] Subtitle found — skipping Whisper!");

          const subtitleText = fs.readFileSync(subFile, "utf8");

          const summary = await callLlama(subtitleText);

          return res.json({
            summary,
            original_length: subtitleText.length,
            source: "subtitle"
          });
        }
      } catch (e) {
        console.log("[YT] No subtitle found. Fallback to Whisper.");
      } finally {
        if (subFile) await safeUnlink(subFile);
      }

      // tempFile = path.join(UPLOAD_DIR, `${id}-${Date.now()}.mp4`);
      tempFile = path.join(UPLOAD_DIR, `${id}-${Date.now()}.mp3`);

      console.log("[YT] Downloading...");
      await downloadAudioWithYtDlp(url, tempFile);

      const transcript = await sendToWhisper(tempFile);
      const summary = await callLlama(transcript);

      return res.json({ summary, original_length: transcript.length });
    }

    // ===== CASE: UPLOADED VIDEO =====
    if (type === "video" && req.file) {
      tempFile = req.file.path;

      const transcript = await sendToWhisper(tempFile);
      const summary = await callLlama(transcript);

      return res.json({ summary, original_length: transcript.length });
    }

    // ===== CASE: LYRICS =====
    if (type === "lyrics" && content) {
      const summary = await callLlama(content);
      return res.json({ summary, original_length: content.length });
    }

    return res.status(400).json({ error: "Invalid request" });

  } catch (err) {
    console.error("PROCESS ERROR:", err);
    return res.status(500).json({
      error: "Processing failed",
      detail: err.message
    });

  } finally {
    if (tempFile) await safeUnlink(tempFile);
    if (subFile) await safeUnlink(subFile);
    if (req.file?.path) await safeUnlink(req.file.path);
  }
}
