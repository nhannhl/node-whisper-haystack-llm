import path from "path";
import fs from "fs";
import { downloadSubtitleWithYtDlp, downloadAudioWithYtDlp } from "../services/yt.service.js";
import { sendToWhisper } from "../services/whisper.service.js";
import { callLlamaForSummerize } from "../services/llama.service.js";
import { processTranscriptToVectorDB } from "../services/transcript_pipeline.service.js";
import { safeUnlink } from "../utils/file.util.js";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function processHandler(req, res) {
  let tempFile = null;
  let subFile = null;

  try {
    const { type, content, url } = req.body;

    // ---------------------------------------------
    // CASE 1: YouTube URL
    // ---------------------------------------------
    if (type === "url" && url) {
      const id = url.match(/v=([^&]+)/)?.[1] || `video_${Date.now()}`;
      const subFileBase = path.join(UPLOAD_DIR, `${id}-${Date.now()}`);

      let hasSubtitle = false;

      try {
        await downloadSubtitleWithYtDlp(url, subFileBase);
        subFile = `${subFileBase}.en.vtt`;
        hasSubtitle = fs.existsSync(subFile);
      } catch (e) {
        hasSubtitle = false;
      }

      // --- CASE 1: SUBTITLE FOUND ---
      if (hasSubtitle) {
        console.log("[YT] Subtitle found — skipping Whisper");

        const subtitleText = fs.readFileSync(subFile, "utf8");

        try {
          await processTranscriptToVectorDB(id, subtitleText);
        } catch (e) {
          console.error("[Pipeline] Subtitle pipeline error:", e);
        }

        const summary = await callLlamaForSummerize(subtitleText);

        return res.json({
          summary,
          original_length: subtitleText.length,
          source: "subtitle",
        });
      }

      // --- CASE 2: NO SUBTITLE → FALLBACK TO WHISPER ---
      console.log("[YT] No subtitle → fallback to Whisper");

      tempFile = path.join(UPLOAD_DIR, `${id}-${Date.now()}.mp3`);
      await downloadAudioWithYtDlp(url, tempFile);

      const transcript = await sendToWhisper(tempFile);

      try {
        await processTranscriptToVectorDB(id, transcript);
      } catch (e) {
        console.error("[Pipeline] Whisper pipeline error:", e);
      }

      const summary = await callLlamaForSummerize(transcript);

      return res.json({
        summary,
        original_length: transcript.length,
        source: "whisper",
      });
    }

    // ---------------------------------------------
    // CASE 2: Uploaded VIDEO FILE
    // ---------------------------------------------
    if (type === "video" && req.file) {
      const id = `upload_${Date.now()}`;
      tempFile = req.file.path;

      const transcript = await sendToWhisper(tempFile);

      // NEW: Store to vector DB
      await processTranscriptToVectorDB(id, transcript);

      const summary = await callLlamaForSummerize(transcript);

      return res.json({
        summary,
        original_length: transcript.length,
        source: "uploaded_video",
      });
    }

    // ---------------------------------------------
    // CASE 3: Raw lyrics or input text
    // ---------------------------------------------
    if (type === "lyrics" && content) {
      const id = `text_${Date.now()}`;

      await processTranscriptToVectorDB(id, content);

      const summary = await callLlamaForSummerize(content);

      return res.json({
        summary,
        original_length: content.length,
        source: "raw_text",
      });
    }

    return res.status(400).json({ error: "Invalid request" });
  } catch (err) {
    console.error("PROCESS ERROR:", err);
    return res.status(500).json({
      error: "Processing failed",
      detail: err.message,
    });
  } finally {
    if (tempFile) await safeUnlink(tempFile);
    if (subFile) await safeUnlink(subFile);
    if (req.file?.path) await safeUnlink(req.file.path);
  }
}
