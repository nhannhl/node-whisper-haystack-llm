import { storeDocument, isExistingDocumentByHash } from "./qdrant_vector_db.service.js";
import { createTranscriptHash } from "../utils/common.util.js";

export async function processTranscriptToVectorDB(videoId, transcript) {
    console.log(`[TranscriptPipeline] Start processing for videoId: ${videoId}`);

    if (!transcript || !transcript?.text || !transcript?.time_transcript
        || !Array.isArray(transcript?.time_transcript)
        || !transcript?.time_transcript.length) {
        return {
            success: true,
            chunks: 0,
            message: "Transcript already exists in Qdrant. Skipped processing.",
        };
    }

    const transcriptHash = createTranscriptHash(transcript.text);
    const exists = await isExistingDocumentByHash(transcriptHash);
    if (exists) {
        console.log(`[TranscriptPipeline] Transcript already exists in Qdrant. Skipping processing.`);
        return {
            success: true,
            chunks: 0,
            message: "Transcript already exists in Qdrant. Skipped processing.",
        };
    }

    console.log(`[PIPELINE] Chunked into ${transcript.time_transcript.length} chunks.`);
    console.log(`[PIPELINE] Chunked context: ${transcript.time_transcript}`);

    let stored = 0;

    for (let i = 0; i < transcript.time_transcript.length; i++) {
        const chunk = transcript.time_transcript[i];

        const docId = `${videoId}_chunk_${i + 1}`;

        // metadata
        const metadata = {
            videoId,
            chunk_index: i + 1,
            total_chunks: transcript.time_transcript.length,
            source: "transcript",
            transcript_hash: transcriptHash,
            start_time: chunk.start,
            end_time: chunk.end,
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