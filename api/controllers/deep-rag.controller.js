import queryRouter from "../services/queryRouterServices/query_router.service.js";

export async function deepRAGQueryHandler(req, res) {
    const { question, videoId } = req.body;
    if (!question || !question.trim()) {
        return res.status(400).json({ error: "Questionnaire requested" });
    }

    try {
        const result = await queryRouter(question, videoId);
        console.log("[Deep RAG] Final Result:", result);

        return res.json({
            answer: result,
            chunks_used: 0,
            context_chunks: []
        });
    } catch (error) {
        console.error("[Deep RAG] Error:", error.message);
        return res.status(500).json({
            error: "RAG handle error",
            detail: err.message
        });
    }
}