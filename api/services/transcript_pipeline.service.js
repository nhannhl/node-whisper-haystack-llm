import { chunkText } from "../utils/chunker.util.js";
import { storeDocument, isExistingDocumentByHash } from "./qdrant_vector_db.service.js";
import { sanitizeTranscript } from "../utils/sanitize_transcript.util.js";
import { createTranscriptHash } from "../utils/common.util.js";

/**
 * Process transcript → chunk → embed → store in Qdrant
 * @param {string} videoId - ID của video (hoặc file upload)
 * @param {string} transcript - Full transcript từ Whisper hoặc subtitle
 * @returns {object} summary metadata
 */
export async function processTranscriptToVectorDB(videoId, transcript) {
  console.log(`[TranscriptPipeline] Start processing for videoId: ${videoId}`);

  const clean = sanitizeTranscript(transcript)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ") // remove control chars
    .replace(/\uFEFF/g, "")                        // remove BOM
    .replace(/\u2028|\u2029/g, "\n")               // normalize line separators
    .normalize("NFC");
  console.log(`[TranscriptPipeline] Cleaned transcript: ${clean}.`);

  // Check if this transcript already exists in Qdrant
  const transcriptHash = createTranscriptHash(clean);
  const exists = await isExistingDocumentByHash(transcriptHash);
  if (exists) {
    console.log(`[TranscriptPipeline] Transcript already exists in Qdrant. Skipping processing.`);
    return {
      success: true,
      chunks: 0,
      message: "Transcript already exists in Qdrant. Skipped processing.",
    };
  }

  // 1 CHUNKING
  const chunks = chunkText(clean);
  console.log(`[PIPELINE] Chunked into ${chunks.length} chunks.`);
  console.log(`[PIPELINE] Chunked context: ${chunks}`);

  let stored = 0;

  // 2 LOOP: embed + upsert Qdrant
  for (let i = 0; i < chunks.length; i++) {
    let chunk = chunks[i];

    if (Buffer.isBuffer(chunk)) {
      chunk = chunk.toString("utf8");
    }

    if (Array.isArray(chunk)) {
      chunk = chunk.join("");
    }

    chunk = String(chunk);

    const docId = `${videoId}_chunk_${i + 1}`;

    // metadata
    const metadata = {
      videoId,
      chunk_index: i + 1,
      total_chunks: chunks.length,
      source: "transcript",
      transcript_hash: transcriptHash,
    };

    console.log(`[TranscriptPipeline] Storing chunk ${chunk} with id ${docId}`);

    await storeDocument(docId, chunk, metadata);
    stored++;
  }

  return {
    success: true,
    chunks: stored,
  };
}