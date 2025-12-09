import { callLlama } from "../../llama.service.js";
import SPEAKER_COMPARISON_PROMPT from "../prompts/speakerComparison_prompt.js"
import { searchDocuments } from "../../qdrant_vector_db.service.js";

export default async function qaSpeakerCompare({ videoId, normalizedQuestionResult }) {

    const searchedDocs = await searchDocuments(
        normalizedQuestionResult.question,
        videoId,
        5
    );

    console.log(`[Deep RAG] qaSpeakerCompare: Found ${searchedDocs.length} relevant chunks`);

    const context = searchedDocs
        .map((doc) => doc.content)
        .join("\n\n");

    if (!context || context.trim().length === 0) {
        return `Không tìm thấy thông tin về "${normalizedQuestionResult.question}" trong video.`;
    }

    // Replace placeholders in the prompt
    const prompt = SPEAKER_COMPARISON_PROMPT
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