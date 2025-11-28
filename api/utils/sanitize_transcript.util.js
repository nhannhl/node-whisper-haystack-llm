/**
 * sanitize_transcript.util.js
 * ----------------------------------------------------------
 * Xử lý:
 *  - Xóa toàn bộ timecode + index
 *  - Xóa HTML & inline VTT tags
 *  - Xử lý EN / VI / JP
 *  - Loại trừ tiếng ồn ["music"], "[applause]"
 *  - Loại bỏ lặp lại progressive captions của YouTube
 *  - Loại dòng 1–2 chữ vô nghĩa
 *  - Chuẩn hoá dấu câu
 */
export function sanitizeTranscript(raw) {
  if (!raw) return "";
  let text = String(raw);

  /** 1) Remove WEBVTT header */
  text = text.replace(/^WEBVTT[\s\S]*?\n\n/i, "");

  /** 2) Remove VTT metadata lines */
  text = text.replace(/^(Kind|Language|Style|NOTE).*$/gmi, "");

  /** 3) Remove timestamps */
  text = text.replace(/\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}.*$/gm, "");

  /** 4) Remove cue numbers (VTT auto-index) */
  text = text.replace(/^\d+\s*$/gm, "");

  /** 5) Remove inline tags <c>, <00:00:02.080>, style tags */
  text = text.replace(/<[^>]+>/g, "");

  /** 6) Remove HTML tags */
  text = text.replace(/<\/?[^>]+>/g, "");

  /** 7) Remove invisible unicode */
  text = text.replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F]/g, "");

  /** 8) Remove control chars except newline */
  text = text.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, "");

  /** 9) Normalize multiple spaces */
  text = text.replace(/\s{2,}/g, " ");

  /** 10) Split to lines */
  let lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  /** 11) Remove noise words (music, applause, laughter, click...) */
  const noiseRegex =
    /^\[?(music|applause|laughter|background|noise|sound|click|typing)\]?$/i;
  lines = lines.filter((l) => !noiseRegex.test(l));

  /** 12) Remove short meaningless lines (1–2 words) */
  lines = lines.filter((l) => l.split(" ").length > 2);

  /** 13) Remove exact duplicate consecutive lines */
  const dedup = [];
  for (const line of lines) {
    if (dedup.length === 0 || dedup[dedup.length - 1] !== line) {
      dedup.push(line);
    }
  }
  lines = dedup;

  /** 14) Remove progressive captions duplicates  
   * EXAMPLE YOUTUBE:
   * "Gemini has"
   * "Gemini has been"
   * "Gemini has been multimodal since"
   * KEEP ONLY the last (longest) version.
   */
  const cleaned = [];
  for (let i = 0; i < lines.length; i++) {
    const curr = lines[i];
    const next = lines[i + 1];

    if (next && next.startsWith(curr) && next.length > curr.length) {
      // skip short progressive version
      continue;
    }

    cleaned.push(curr);
  }

  /** 15) Join as clean text */
  text = cleaned.join("\n");

  /** 16) Final trim */
  return text.trim();
}
