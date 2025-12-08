import MASTER_PROMPT from "./prompts/master_prompt.js";
import { callLlama } from "../llama.service.js";
import { search } from "../qdrant_base.service.js";
import { handlers } from "./handles/index.js";

export default async function queryRouter(question, videoId) {
    console.log("[Query Router] Start");

    const normalizedQuestionResult = await normalizeQuestion(question);
    console.log("[Query Router] Normalized Question:", normalizedQuestionResult);

    const searchResult = await searchDB(normalizedQuestionResult.question, normalizedQuestionResult.query_type);
    console.log("[Query Router] Search Result:", searchResult);

    const handlerName = searchResult[0]?.payload?.handler;
    if (!handlerName || !handlers[handlerName]) {
        throw new Error(`Handler "${handlerName}" not found`);
    }

    const result = await handlers[handlerName]({ videoId, normalizedQuestionResult });

    return result;
}

async function normalizeQuestion(question) {
    const requestData = {
        messages: [
            { role: "system", content: MASTER_PROMPT },
            { role: "user", content: question }
        ],
        max_tokens: 200,
        temperature: 0.2,
        stream: false
    };
    const response = await callLlama(requestData);

    try {
        return JSON.parse(response);
    } catch (error) {
        console.error("[Query Router] Failed to parse LLaMA response:", error.message);
        console.error("[Query Router] Raw response:", response);
        throw new Error("Invalid JSON response from LLaMA");
    }
}

async function searchDB(question, queryType) {
    const collection = process.env.QDRANT_COLLECTION_QUERY_ROUTER_NAME || "query-router";

    let filter = {};
    if (queryType) {
        filter = {
            must: [
                {
                    key: "query_type",
                    match: {
                        value: queryType,
                    },
                },
            ],
        }
    }

    const result = await search(collection, question, filter, 1);
    return result;
}
