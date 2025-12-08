import { QdrantClient } from "@qdrant/js-client-rest";
import { generateEmbedding } from "./embedding.service.js";
import { randomUUID } from "crypto";

// Initialize Qdrant client
const client = new QdrantClient({
  host: process.env.QDRANT_HOST || "vectordb",
  port: parseInt(process.env.QDRANT_PORT) || 6333,
});

const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || "documents";

// Initialize the Qdrant collection configuration
export async function initializeCollection() {
  try {
    const collections = await client.getCollections();
    const collectionExists = collections.collections.some(
      (col) => col.name === COLLECTION_NAME
    );

    if (!collectionExists) {
      console.log(`[Qdrant] Creating optimized collection: ${COLLECTION_NAME}`);

      const embeddingSize = 768; // BGE-base-en-v1.5

      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: embeddingSize,
          distance: "Cosine",      // chuẩn cho BGE + TEI
        },

        // HNSW index: tăng tốc & tăng độ chính xác khi search
        hnsw_config: {
          m: 16,                   // default 16, trade-off speed/accuracy
          ef_construct: 200        // >100 tăng accuracy khi build graph
        },

        // Quantization: giảm RAM ~4x, đủ tốt cho semantic search
        quantization_config: {
          scalar: {
            type: "int8",          // int8 quantization
            quantile: 0.99,        // bỏ outlier để nén tốt hơn
            always_ram: true       // giữ index quantized trong RAM
          }
        },

        // Optional: on-disk payload & vectors (tùy dữ liệu lớn hay nhỏ)
        // on_disk_payload: true,   // bật nếu payload rất lớn
        // on_disk_vectors: false,  // để true nếu bộ vector cực lớn, RAM ít
      });

      console.log(`[Qdrant] Collection ${COLLECTION_NAME} created with advanced config`);
    } else {
      console.log(`[Qdrant] Collection ${COLLECTION_NAME} already exists`);
    }
  } catch (error) {
    console.error("[Qdrant] Error initializing collection:", error.message);
    throw error;
  }
}

/**
 * Store a document with its content and metadata in Qdrant
 * @param {string} id - Document ID
 * @param {string} content - Content to be embedded and stored
 * @param {Object} metadata - Additional metadata to store
 */
export async function storeDocument(id, content, metadata = {}) {
  try {
    console.log(`[Qdrant] Storing document: ${id}`);
    console.log(`[Qdrant] Content length: ${content} characters`);

    const embedding = await generateEmbedding(content);

    await client.upsert(COLLECTION_NAME, {
      wait: true,
      points: [
        {
          id: randomUUID(),
          vector: embedding,
          payload: {
            content,
            ...metadata,
            timestamp: new Date().toISOString(),
            video_chunk_id: id,
          },
        },
      ],
    });

    console.log(`[Qdrant] Document ${id} stored successfully`);
  } catch (error) {
    console.error("[Qdrant] Error storing document:", error.message);
    throw error;
  }
}

/**
 * Search for similar documents in Qdrant
 * @param {string} query - Query text to search for
 * @param {number} limit - Number of results to return (default: 5)
 * @returns {Array} - Array of similar documents with scores
 */
export async function searchDocuments(query, videoId, limit = 10) {
  try {
    console.log(`[Qdrant] Searching for: "${query}"`);

    const queryEmbedding = await generateEmbedding(query);

    const results = await client.search(COLLECTION_NAME, {
      vector: queryEmbedding,
      limit,
      filter: {
        must: [
          {
            key: "videoId",
            match: {
              value: videoId,
            },
          },
        ],
      },
      with_payload: true,
      params: {
        hnsw_ef: 128,          // tăng để tăng accuracy (default ~64)
        exact: false,          // true = brute-force, false = HNSW
      },
      score_threshold: 0.25,   // loại kết quả quá lệch nghĩa
    });

    console.log(`[Qdrant] Found ${results.length} results`);

    return results.map((result) => ({
      id: result.id,
      content: result.payload?.content,
      metadata: result.payload,
      score: result.score,
    }));
  } catch (error) {
    console.error("[Qdrant] Error searching documents:", error.message);
    throw error;
  }
}

/**
 * Search for documents in Qdrant with optional time range filtering
 * @param {string} query - Query text to search for
 * @param {string} videoId - Video ID to filter by
 * @param {number|null} start - Start time in seconds (null for no start limit)
 * @param {number|null} end - End time in seconds (null for no end limit)
 * @param {number} limit - Number of results to return (default: 10)
 * @returns {Array} - Array of similar documents with scores
 */
export async function searchDocumentsByTimeRange(query, videoId, start = null, end = null, limit = 10) {
  try {
    console.log(`[Qdrant] Searching with time range: start=${start}, end=${end}`);

    const queryEmbedding = await generateEmbedding(query);

    // Build filter with time range
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

    // Add time range filters if provided
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

    const results = await client.search(COLLECTION_NAME, {
      vector: queryEmbedding,
      limit,
      filter,
      with_payload: true,
      params: {
        hnsw_ef: 128,
        exact: false,
      },
      score_threshold: 0.25,
    });

    console.log(`[Qdrant] Found ${results.length} results in time range`);

    return results.map((result) => ({
      id: result.id,
      content: result.payload?.content,
      metadata: result.payload,
      score: result.score,
    }));
  } catch (error) {
    console.error("[Qdrant] Error searching documents by time range:", error.message);
    throw error;
  }
}

/** * Check if a document with the given hash exists in Qdrant
 * @param {string} hash - The hash of the document to check
 * @returns {boolean} - True if the document exists, false otherwise
 */
export async function isExistingDocumentByHash(hash) {
  try {
    console.log(`[Qdrant] Finding document by hash: ${hash}`);
    const results = await client.scroll(COLLECTION_NAME, {
      filter: {
        must: [
          {
            key: "transcript_hash",
            match: {
              value: hash,
            },
          },
        ],
      },
      limit: 1,
      with_payload: false,
    });

    const exists = results.points.length > 0;
    console.log(`[Qdrant] Document with hash ${hash} exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error("[Qdrant] Error finding document by hash:", error.message);
    throw error;
  }
}

/**
 * Delete all points in the collection, or points for a specific document
 * @param {string|null} name - Deletes ALL points.
 */
export async function deleteAllPointsInDocument(name = null) {
  try {
    name = name ?? COLLECTION_NAME;
    console.log(`[Qdrant] Deleting points for document: ${name}`);
    await client.delete(name, {
      filter: {},
      wait: true,
    });
    console.log("[Qdrant] All points deleted successfully");
  } catch (error) {
    console.error("[Qdrant] Error deleting points:", error.message);
    throw error;
  }
}