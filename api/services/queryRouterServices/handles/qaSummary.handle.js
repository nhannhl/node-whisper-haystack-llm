import { callLlama } from "../../llama.service.js";
import QA_SUMMARY_PROMPT from "../prompts/qaSummary_prompt.js";
import { searchDocumentsByTimeRange } from "../../qdrant_vector_db.service.js";

export default async function qaSummary({ videoId, normalizedQuestionResult }) {
    console.log("[Deep RAG] qaSummary Function:", { videoId, normalizedQuestionResult });

    const { start, end } = normalizedQuestionResult;

    const searchedDocs = await searchDocumentsByTimeRange(
        "",
        videoId,
        start,
        end,
        15
    );

    console.log(`[Deep RAG] qaSummary: Found ${searchedDocs.length} chunks in time range [${start}, ${end}]`);

    const context = searchedDocs
        .sort((a, b) => (a.metadata?.start_time || 0) - (b.metadata?.start_time || 0))
        .map((doc) => doc.content)
        .join("\n\n");

    if (!context || context.trim().length === 0) {
        return `Không tìm thấy nội dung trong khoảng thời gian ${start || 0}s - ${end || "end"}s.`;
    }

    const prompt = QA_SUMMARY_PROMPT
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