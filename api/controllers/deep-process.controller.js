import path from "path";
import { downloadAudioWithYtDlp } from "../services/yt.service.js";
import { safeUnlink } from "../utils/file.util.js";
import { sendToFasterWhisper, sendToWhisperX } from "../services/whisper.service.js";
import { filterTimeTranscript } from "../utils/common.util.js";
import { processTranscriptToVectorDB } from "../services/transcript_faster_whisper_pipeline.service.js";
import { processTranscriptXToVectorDB } from "../services/transcript_whisper_x_pipeline.js";
import { callLlamaForSummerize } from "../services/llama.service.js";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function deepProcessHandler(req, res) {
    let tempFile = null;

    try {
        const { type, url } = req.body;
        const id = url.match(/v=([^&]+)/)?.[1] || `video_${Date.now()}`;
        tempFile = path.join(UPLOAD_DIR, `${id}-${Date.now()}.mp3`);
        await downloadAudioWithYtDlp(url, tempFile);

        let transcript = null;
        if (type === 'faster-whisper') {
            transcript = await sendToFasterWhisper(tempFile);
            transcript = {
                ...transcript,
                time_transcript: filterTimeTranscript(transcript)
            };
            try {
                await processTranscriptToVectorDB(id, transcript);
            } catch (e) {
                console.error("[Pipeline] Whisper pipeline error:", e);
            }
        } else if (type === 'whisper-x') {
            transcript = await sendToWhisperX(tempFile);
            const transcriptText = transcript?.segments.map(segment => segment.text.trim()).join(" ").trim() || '';
            transcript = {
                ...transcript,
                time_transcript: transcript?.segments || [],
                text: transcriptText
            };
            console.log("[Pipeline] WhisperX transcript:", transcript);

            try {
                await processTranscriptXToVectorDB(id, transcript);
            } catch (e) {
                console.error("[Pipeline] WhisperX pipeline error:", e);
            }
        }

        const summary = await callLlamaForSummerize(transcript?.text);

        return res.json({
            summary,
            original_length: transcript?.segments?.length || 0,
            source: type,
            time_transcript: transcript.time_transcript,
            videoId: id
        });
    } catch (err) {
        console.error("PROCESS ERROR:", err);
        return res.status(500).json({
            error: "Processing failed",
            detail: err.message,
        });
    } finally {
        if (tempFile) await safeUnlink(tempFile);
    }
}