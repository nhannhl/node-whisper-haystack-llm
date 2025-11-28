import crypto from "crypto";

export function createTranscriptHash(transcript) {
  return crypto.createHash("sha256").update(transcript, "utf-8").digest("hex");
}