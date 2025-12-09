import { callLlama } from "../../llama.service.js";
import SPEAKER_SPECIFIC_QUESTION_PROMPT from "../prompts/speakerSpecificQuestion_prompt.js";
import { searchByFilter } from "../../qdrant_vector_db.service.js";

export default async function qaSpeakerContent({ videoId, normalizedQuestionResult }) {
    const speaker = normalizedQuestionResult?.speaker;
    const start = normalizedQuestionResult?.start ?? null;
    const end = normalizedQuestionResult?.end ?? null;

    console.log(`[Deep RAG] qaSpeakerContent: speaker ${speaker}`);

    const filter = {
        must: [
            {
                key: "videoId",
                match: {
                    value: videoId,
                },
            },
        ],
    };

    if (start !== null) {
        filter.must.push({
            key: "start_time",
            range: {
                gte: start,
            },
        });
    }

    if (end !== null) {
        filter.must.push({
            key: "end_time",
            range: {
                lte: end,
            },
        });
    }

    if (speaker !== null) {
        filter.must.push({
            key: "speaker",
            match: {
                value: speaker,
            },
        });
    }

    const documents = await searchByFilter(filter);

    console.log(`[Deep RAG] qaSpeakerContent: Found ${documents.length} relevant chunks`);

    const context = documents
        .map((doc) => doc.content)
        .join("\n\n");

    if (!context || context.trim().length === 0) {
        return `Không tìm thấy thông tin về "${normalizedQuestionResult.question}" trong video.`;
    }

    const prompt = SPEAKER_SPECIFIC_QUESTION_PROMPT
        .replace("{{question}}", normalizedQuestionResult.question)
        .replace("{{context}}", context)
        .replace("{{speaker}}", speaker);

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