import { callLlama } from "../../llama.service.js";
import QA_SEGMENT_PROMPT from "../prompts/qaSegment_prompt.js";
import { searchDocumentsByTimeRange } from "../../qdrant_vector_db.service.js";

export default async function qaSegment({ videoId, normalizedQuestionResult }) {
    console.log("[Deep RAG] qaSegment Function:", { videoId, normalizedQuestionResult });

    const { start, end } = normalizedQuestionResult;

    const searchedDocs = await searchDocumentsByTimeRange(
        normalizedQuestionResult.question,
        videoId,
        start,
        end,
        10
    );

    console.log(`[Deep RAG] qaSegment: Found ${searchedDocs.length} chunks in time range [${start}, ${end}]`);

    const context = searchedDocs
        .map((doc) => doc.content)
        .join("\n\n");

    if (!context || context.trim().length === 0) {
        return `Không tìm thấy thông tin trong khoảng thời gian ${start || 0}s - ${end || "end"}s.`;
    }

    const prompt = QA_SEGMENT_PROMPT
        .replace("{{question}}", normalizedQuestionResult.question)
        .replace("{{context}}", context)
        .replace("{{start}}", start || "0")
        .replace("{{end}}", end || "unknown");

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