import { searchDocuments } from "../services/qdrant_vector_db.service.js";
import { callLlamaForRAG } from "../services/llama.service.js";

export async function ragQueryHandler(req, res) {
  try {
    const { question, videoId } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Questionnaire requested" });
    }

    // 1. Search Qdrant
    const results = await searchDocuments(question, videoId, 10);

    const context = results
      .map(r => r.content)
      .filter(Boolean)
      .join("\n\n");

    console.log(`[RAG] Retrieved ${context} chunks for question: "${question}"`);

    // 2. Llama RAG
    const answer = await callLlamaForRAG(context, question);

    return res.json({
      answer,
      chunks_used: results.length,
      context_chunks: results.map(r => ({
        id: r.id,
        score: r.score,
        content: r.content
      }))
    });

  } catch (err) {
    console.error("[RAG] Error:", err);
    return res.status(500).json({ error: "RAG handle error", detail: err.message });
  }
}

