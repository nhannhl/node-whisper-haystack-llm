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
    },
    {
        "id": "speaker_id_1",
        "query_type": "speaker_identification",
        "handler": "qaSpeakerIdentify",
        "category": "speaker",
        "description": "Câu hỏi nhằm xác định ai là người đang nói tại một thời điểm hoặc đoạn video cụ thể."
    },
    {
        "id": "speaker_id_2",
        "query_type": "speaker_identification",
        "handler": "qaSpeakerIdentify",
        "category": "speaker",
        "description": "Các câu dạng 'ai đang nói', 'đây là giọng của ai', hoặc 'speaker nào nói câu này'."
    },
    {
        "id": "speaker_id_3",
        "query_type": "speaker_identification",
        "handler": "qaSpeakerIdentify",
        "category": "speaker",
        "description": "Nếu câu hỏi yêu cầu xác định speaker gắn với một đoạn hoặc lời thoại cụ thể, nó thuộc speaker_identification."
    },
    {
        "id": "speaker_content_1",
        "query_type": "speaker_specific_question",
        "handler": "qaSpeakerContent",
        "category": "speaker",
        "description": "Câu hỏi yêu cầu nội dung, ý kiến hoặc thông tin do một speaker cụ thể trình bày."
    },
    {
        "id": "speaker_content_2",
        "query_type": "speaker_specific_question",
        "handler": "qaSpeakerContent",
        "category": "speaker",
        "description": "Các câu dạng 'người này nói gì', 'ý chính của speaker X', hoặc 'đoạn người nam/nữ trình bày nội dung gì'."
    },
    {
        "id": "speaker_content_3",
        "query_type": "speaker_specific_question",
        "handler": "qaSpeakerContent",
        "category": "speaker",
        "description": "Nếu người dùng hỏi về nội dung phát biểu của một speaker riêng biệt, có hoặc không kèm timestamp."
    },
    {
        "id": "speaker_cmp_1",
        "query_type": "speaker_comparison",
        "handler": "qaSpeakerCompare",
        "category": "speaker",
        "description": "Câu hỏi yêu cầu so sánh, đối chiếu hoặc phân tích sự khác biệt giữa hai hoặc nhiều speaker."
    },
    {
        "id": "speaker_cmp_2",
        "query_type": "speaker_comparison",
        "handler": "qaSpeakerCompare",
        "category": "speaker",
        "description": "Các câu dạng 'hai người nói khác nhau ở điểm nào', 'quan điểm của nam và nữ có gì khác', hoặc 'ai phản biện ai'."
    },
    {
        "id": "speaker_cmp_3",
        "query_type": "speaker_comparison",
        "handler": "qaSpeakerCompare",
        "category": "speaker",
        "description": "Nếu câu hỏi yêu cầu đối chiếu, tranh luận hoặc tổng hợp quan điểm giữa các speaker, nó thuộc speaker_comparison."
    }
];

const queryRouterCollection = process.env.QDRANT_COLLECTION_QUERY_ROUTER_NAME || "query-router";

export default async function queryRouterSeed() {
    for (const item of queryRouter) {
        await upsert(item.description, item, queryRouterCollection);
    }
    return queryRouter;
}