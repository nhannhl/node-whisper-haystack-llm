import { callLlama } from "../../llama.service.js";
import QA_SEMANTIC_PROMPT from "../prompts/qaSemantic_prompt.js";
import { searchDocuments } from "../../qdrant_vector_db.service.js";

export default async function qaSemantic({ videoId, normalizedQuestionResult }) {
    console.log("[Deep RAG] qaSemantic Function:", { videoId, normalizedQuestionResult });

    const searchedDocs = await searchDocuments(normalizedQuestionResult.question, videoId, 10);

    console.log(`[Deep RAG] qaSemantic: Found ${searchedDocs.length} relevant chunks`);

    const context = searchedDocs
        .map((doc, idx) => `[Đoạn ${idx + 1}] ${doc.content}`)
        .join("\n\n");

    if (!context || context.trim().length === 0) {
        return "Không tìm thấy thông tin liên quan trong video.";
    }

    const prompt = QA_SEMANTIC_PROMPT
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