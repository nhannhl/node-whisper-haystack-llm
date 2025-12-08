import { upsert } from "../../services/qdrant_base.service.js";

const queryRouter = [
    {
        "id": "explain_1",
        "query_type": "explain_term",
        "handler": "qaExplainTerm",
        "category": "explain",
        "description": "Câu hỏi yêu cầu giải thích nghĩa của một từ hoặc cụm từ trong video."
    },
    {
        "id": "explain_2",
        "query_type": "explain_term",
        "handler": "qaExplainTerm",
        "category": "explain",
        "description": "Nếu câu hỏi chứa cụm như 'nghĩa là gì', 'là gì', 'giải thích', hoặc 'mean', thì đó là explain_term."
    },
    {
        "id": "explain_3",
        "query_type": "explain_term",
        "handler": "qaExplainTerm",
        "category": "explain",
        "description": "Các câu hỏi tập trung vào nghĩa của một thuật ngữ, từ vựng, hoặc cụm từ."
    },
    {
        "id": "semantic_1",
        "query_type": "semantic_qa",
        "handler": "qaSemantic",
        "category": "semantic",
        "description": "Câu hỏi không chứa timestamp và yêu cầu thông tin chung hoặc nội dung tổng thể từ video."
    },
    {
        "id": "semantic_2",
        "query_type": "semantic_qa",
        "handler": "qaSemantic",
        "category": "semantic",
        "description": "Các câu hỏi dạng 'video nói gì về...', 'có đề cập đến...', hoặc tìm hiểu nguyên nhân, sự kiện tổng quan."
    },
    {
        "id": "semantic_3",
        "query_type": "semantic_qa",
        "handler": "qaSemantic",
        "category": "semantic",
        "description": "Nếu câu hỏi yêu cầu kiến thức từ toàn video mà không có phạm vi thời gian cụ thể, nó thuộc semantic_qa."
    },
    {
        "id": "segment_1",
        "query_type": "segment_question",
        "handler": "qaSegment",
        "category": "segment",
        "description": "Câu hỏi muốn biết nội dung xảy ra trong một đoạn video theo mốc thời gian nhưng không yêu cầu tóm tắt."
    },
    {
        "id": "segment_2",
        "query_type": "segment_question",
        "handler": "qaSegment",
        "category": "segment",
        "description": "Câu hỏi dạng 'đoạn đó nói gì' hoặc 'tại thời điểm này họ làm gì' thuộc segment_question khi xuất hiện timestamp."
    },
    {
        "id": "segment_3",
        "query_type": "segment_question",
        "handler": "qaSegment",
        "category": "segment",
        "description": "Nếu người dùng hỏi nội dung cụ thể trong một đoạn video xác định bằng thời gian, đây là segment_question."
    },
    {
        "id": "summary_1",
        "query_type": "summary_by_timestamp",
        "handler": "qaSummary",
        "category": "summary",
        "description": "Câu hỏi yêu cầu tóm tắt nội dung của một đoạn video được xác định bằng thời gian."
    },
    {
        "id": "summary_2",
        "query_type": "summary_by_timestamp",
        "handler": "qaSummary",
        "category": "summary",
        "description": "Nếu người dùng muốn summary hoặc tổng hợp nội dung trong một vùng thời gian của video thì thuộc dạng summary_by_timestamp."
    },
    {
        "id": "summary_3",
        "query_type": "summary_by_timestamp",
        "handler": "qaSummary",
        "category": "summary",
        "description": "Các câu chứa từ khóa như tóm tắt, summary, tổng hợp và đề cập đến đoạn thời gian."
    }
];

const queryRouterCollection = process.env.QDRANT_COLLECTION_QUERY_ROUTER_NAME || "query-router";

export default async function queryRouterSeed() {
    for (const item of queryRouter) {
        await upsert(item.description, item, queryRouterCollection);
    }
    return queryRouter;
}