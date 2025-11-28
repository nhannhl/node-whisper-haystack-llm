import axios from "axios";

const EMBEDDINGS_URL = process.env.EMBEDDINGS_SERVICE_URL || "http://embeddings:80";

/**
 * Generates embeddings for the given text using the embeddings service.
 * @param {string} text
 * @returns {Promise<Array<number>>} - The embedding vector
 */
export async function generateEmbedding(text) {
  console.log("[Embeddings] Start");
  console.time("embeddings");

  try {
    const response = await axios.post(`${EMBEDDINGS_URL}/embed`, {
      inputs: [text]
    }, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    console.timeEnd("embeddings");
    
    // The API returns an array of embeddings, we want the first one
    const embeddings = response.data;
    if (Array.isArray(embeddings) && embeddings.length > 0) {
      console.log("[Embeddings] Success - dimension:", embeddings[0].length);
      return embeddings[0];
    } else {
      throw new Error("Unexpected response format from embeddings service");
    }
  } catch (error) {
    console.timeEnd("embeddings");
    console.error("[Embeddings] Error:", error.message);
    
    if (error.response) {
      console.error("[Embeddings] Response error:", error.response.status, error.response.data);
    }
    
    throw error;
  }
}