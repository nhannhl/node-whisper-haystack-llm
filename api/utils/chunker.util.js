import { encoding_for_model } from "@dqbd/tiktoken";

const MIN_TOKENS = 150;
const MAX_TOKENS = 250;
const OVERLAP_TOKENS = 40;

const enc = encoding_for_model("gpt-3.5-turbo");

export function countTokens(text) {
  if (typeof text !== "string") text = String(text ?? "");
  return enc.encode(text).length;
}

export function splitSentences(text) {
  if (typeof text !== "string") text = String(text ?? "");

  return text
    // Nhật
    .replace(/([。！？])/g, "$1\n")
    // Anh / Việt
    .replace(/([.!?])\s+/g, "$1\n")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function chunkText(text) {
  console.log("[Chunker] Starting chunkText()");

  if (!text) throw new Error("chunkText() received empty input");
  if (typeof text !== "string") text = String(text);

  const sentences = splitSentences(text);
  const chunks = [];

  let currentChunk = "";
  let tokenCount = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const t = countTokens(sentence);

    // Câu quá dài → cắt nhỏ
    if (t > MAX_TOKENS) {
      console.warn("[Chunker] Long sentence, force split:", sentence.slice(0, 80) + "...");
      const forced = splitLongSentence(sentence);
      for (const f of forced) {
        chunks.push(f);
      }
      continue;
    }

    // Nếu thêm câu này vào sẽ vượt MAX_TOKENS → finalize chunk hiện tại
    if (tokenCount + t > MAX_TOKENS) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }

      const overlap = applyOverlap(currentChunk);

      currentChunk = String(overlap || "") + String(sentence) + " ";
      tokenCount = countTokens(currentChunk);
    } else {
      currentChunk = String(currentChunk) + String(sentence) + " ";
      tokenCount += t;
    }
  }

  if (currentChunk.trim()) chunks.push(currentChunk.trim());

  return chunks;
}

function applyOverlap(text) {
  if (!text) return "";

  text = String(text);

  const tokens = enc.encode(text);

  if (tokens.length <= OVERLAP_TOKENS) {
    return text.trim() + " ";
  }

  const sliceTokens = tokens.slice(tokens.length - OVERLAP_TOKENS);

  let decoded;

  try {
    decoded = enc.decode(sliceTokens);
  } catch (e) {
    console.warn("[Chunker] decode error:", e.message);
    return "";
  }

  // ---- FIX: force decoded to string safely ----
  if (typeof decoded !== "string") {
    try {
      decoded = Buffer.from(decoded).toString("utf8");
    } catch (e) {
      decoded = String(decoded);
    }
  }

  // ---- FIX: sanitized string (remove control chars) ----
  decoded = decoded.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");

  return decoded.trim() + " ";
}

function splitLongSentence(sentence) {
  if (typeof sentence !== "string") sentence = String(sentence ?? "");

  const parts = sentence.split(/(\s+)/); // giữ khoảng trắng
  const chunks = [];
  let curr = "";
  let count = 0;

  for (const part of parts) {
    const t = countTokens(part);

    if (count + t > MAX_TOKENS) {
      if (curr.trim()) chunks.push(curr.trim());
      curr = part;
      count = t;
    } else {
      curr += part;
      count += t;
    }
  }

  if (curr.trim()) chunks.push(curr.trim());
  return chunks;
}

export default {
  chunkText,
  splitSentences,
  countTokens,
};
