import { QdrantClient } from "@qdrant/js-client-rest";
import { randomUUID } from "crypto";
import { generateEmbedding } from "./embedding.service.js";

const client = new QdrantClient({
    host: process.env.QDRANT_HOST || "vectordb",
    port: parseInt(process.env.QDRANT_PORT) || 6333,
});

const master_collections = {
    queryRouter: process.env.QDRANT_COLLECTION_QUERY_ROUTER_NAME || "query-router"
};

export async function initializeCollection() {
    try {
        const collections = await client.getCollections();

        for (const collection of Object.values(master_collections)) {
            const collectionExists = collections.collections.some(
                (col) => col.name === collection
            );

            if (!collectionExists) {
                console.log(`[Qdrant] Creating collection: ${collection}`);
                await client.createCollection(collection, {
                    vectors: {
                        size: 768,
                        distance: "Cosine",
                    },
                    hnsw_config: {
                        m: 16,
                        ef_construct: 200
                    },
                    quantization_config: {
                        scalar: {
                            type: "int8",
                            quantile: 0.99,
                            always_ram: true
                        }
                    },
                });

                console.log(`[Qdrant] Collection ${collection} created with advanced config`);
            }
        }

    } catch (error) {
        console.error("[Qdrant] Error initializing collection:", error.message);
        throw error;
    }
}

export async function upsert(content, payload, collection) {
    try {
        const collectionExists = await client.getCollection(collection);

        if (!collectionExists) {
            console.log(`[Qdrant] Collection ${collection} does not exist`);
            return;
        }

        const pointId = randomUUID();
        const embeddingContent = await generateEmbedding(content);
        await client.upsert(collection, {
            points: [
                {
                    id: pointId,
                    vector: embeddingContent,
                    payload: payload
                }
            ]
        });

        console.log(`[Qdrant] Data inserted successfully with ID: ${pointId}`);
    } catch (error) {
        console.error("[Qdrant] Error inserting data:", error.message);
        throw error;
    }
}

export async function deleteAllCollection() {
    try {
        for (const collection of Object.values(master_collections)) {
            const collectionExists = await client.collectionExists(collection);
            if (collectionExists) {
                console.log(`[Qdrant] Deleting collection: ${collection}`);
                await client.deleteCollection(collection);
                console.log(`[Qdrant] Collection ${collection} deleted successfully`);
            }
        }
    } catch (error) {
        console.error("[Qdrant] Error deleting collection:", error.message);
        throw error;
    }
}

export async function search(collection, query, filter, limit) {
    try {
        const collectionExists = await client.getCollection(collection);

        if (!collectionExists) {
            console.log(`[Qdrant] Collection ${collection} does not exist`);
            return;
        }

        const searchParams = {
            vector: await generateEmbedding(query),
            limit: limit,
            with_payload: true,
            params: {
                hnsw_ef: 128,
                exact: false,
            },
            score_threshold: 0.25,
        };

        // Only add filter if it's defined and not empty
        if (filter && Object.keys(filter).length > 0) {
            searchParams.filter = filter;
        }

        const result = await client.search(collection, searchParams);

        console.log(`[Qdrant] Search result: ${result.length}`);
        return result;
    } catch (error) {
        console.error("[Qdrant] Error searching data:", error.message);
        throw error;
    }
}

