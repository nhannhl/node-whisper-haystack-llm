import { storeDocument, isExistingDocumentByHash } from "./qdrant_vector_db.service.js";
import { createTranscriptHash } from "../utils/common.util.js";

export async function processTranscriptXToVectorDB(videoId, transcript) {
    console.log("[TranscriptPipeline] Start processing for videoId: " + videoId);

    if (!transcript || !transcript?.segments || !Array.isArray(transcript?.segments) || !transcript?.segments.length) {
        return {
            success: true,
            chunks: 0,
            message: "Transcript not exists.",
        };
    }

    const transcriptText = transcript.segments.map(segment => segment.text.trim()).join(" ").trim();
    const transcriptHash = createTranscriptHash(transcriptText);
    const exists = await isExistingDocumentByHash(transcriptHash);
    if (exists) {
        console.log(`[TranscriptPipeline] Transcript already exists in Qdrant. Skipping processing.`);
        return {
            success: true,
            chunks: 0,
            message: "Transcript already exists in Qdrant. Skipped processing.",
        };
    }

    console.log(`[PIPELINE] Chunked into ${transcript.segments.length} chunks.`);

    let stored = 0;

    for (let i = 0; i < transcript.segments.length; i++) {
        const chunk = transcript.segments[i];

        const docId = `${videoId}_chunk_${i + 1}`;

        // metadata
        const metadata = {
            videoId,
            chunk_index: i + 1,
            total_chunks: transcript.segments.length,
            source: "transcript",
            transcript_hash: transcriptHash,
            start_time: chunk.start,
            end_time: chunk.end,
            speaker: chunk.speaker,
            text: chunk.text,
        };

        console.log(`[TranscriptPipeline] Storing chunk ${chunk} with id ${docId}`);

        await storeDocument(docId, chunk.text, metadata);
    }

    console.log(`[TranscriptPipeline] Stored ${stored} chunks.`);
    return {
        success: true,
        chunks: stored,
        message: "Transcript processed and stored successfully.",
    };
}
