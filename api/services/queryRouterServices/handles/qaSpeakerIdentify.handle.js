import { callLlama } from "../../llama.service.js";
import SPEAKER_IDENTIFICATION_PROMPT from "../prompts/speakerIdentification_prompt.js";
import { searchDocumentsByTimeRange } from "../../qdrant_vector_db.service.js";

export default async function qaSpeakerIdentify({ videoId, normalizedQuestionResult }) {
    const start = normalizedQuestionResult?.start ?? null;
    const end = normalizedQuestionResult?.end ?? null;

    const documents = await searchDocumentsByTimeRange(videoId, start, end);

    console.log(`[Deep RAG] qaSpeakerIdentify: Found ${documents.length} relevant chunks`);

    const context = documents
        .map((doc) => doc.content)
        .join("\n\n");

    if (!context || context.trim().length === 0) {
        return `Không tìm thấy thông tin về "${normalizedQuestionResult.question}" trong video.`;
    }

    const prompt = SPEAKER_IDENTIFICATION_PROMPT
        .replace("{{question}}", normalizedQuestionResult.question)
        .replace("{{context}}", context);

    const requestData = {
        messages: [
            { role: "user", content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.3,
        stream: false
    };

    const response = await callLlama(requestData);
    return response;
}