import { deleteAllPointsInDocument } from "../services/qdrant_vector_db.service.js";
import { initializeCollection, deleteAllCollection } from "../services/qdrant_base.service.js";
import seed from "../db/seedings/index.seed.js";

export async function deleteAllPointsByDocument(req, res) {
    try {
        const name = req.params.name || null;
        await deleteAllPointsInDocument(name);
        res.json({ message: "All points deleted successfully" });
    } catch (error) {
        console.error("Error deleting points:", error);
        res.status(500).json({ error: "Failed to delete points" });
    }
}

export async function migrateCollection(req, res) {
    try {
        await deleteAllCollection();
        await initializeCollection();
        await seed();
        res.json({ message: "Collection migrated successfully" });
    } catch (error) {
        console.error("Error migrating collection:", error);
        res.status(500).json({ error: "Failed to migrate collection" });
    }
}

