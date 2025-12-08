import crypto from "crypto";

/**
 * Create transcript hash
 * @param {string} transcript - The transcript string
 * @returns {string} - The hash of the transcript
 */
export function createTranscriptHash(transcript) {
  return crypto.createHash("sha256").update(transcript, "utf-8").digest("hex");
}

/**
 * Filter time transcript
 * @param {Object} transcript - The transcript object
 * @returns {Array} - The filtered transcript
 * Example: 
 * Input: 
 * {
 *   segments: [
 *     { text: "Hello", start: 0, end: 1 },
 *     { text: "world", start: 1, end: 2 },
 *     { text: "!", start: 2, end: 3 },
 *   ]
 * }
 * 
 * Output: 
 * [
 *   { text: "Hello world!", start: 0, end: 3 }
 * ]
 */
export function filterTimeTranscript(transcript) {
  if (!transcript || !transcript?.segments || !Array.isArray(transcript?.segments) || !transcript?.segments.length) return [];

  const segments = transcript.segments;
  const mergedSegments = [];

  const sentenceEndRegex = /[.?!]\s*$/;

  let currentSegment = null;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (!currentSegment) {
      currentSegment = {
        text: segment.text.trim(),
        start: segment.start,
        end: segment.end,
      };
    } else {
      const timeDiff = segment.start - currentSegment.end;
      const endsWithPunctuation = sentenceEndRegex.test(currentSegment.text);

      if (!endsWithPunctuation && timeDiff >= 0 && timeDiff <= 0.3) {
        currentSegment.text = currentSegment.text + ' ' + segment.text.trim();
        currentSegment.end = segment.end;
      } else {
        mergedSegments.push({
          text: currentSegment.text,
          start: currentSegment.start,
          end: currentSegment.end,
        });

        currentSegment = {
          text: segment.text.trim(),
          start: segment.start,
          end: segment.end,
        };
      }
    }
  }

  if (currentSegment) {
    mergedSegments.push({
      text: currentSegment.text,
      start: currentSegment.start,
      end: currentSegment.end,
    });
  }

  return mergedSegments;
};
