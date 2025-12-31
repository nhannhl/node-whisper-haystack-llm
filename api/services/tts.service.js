import fs from "fs";
import path from "path";

const PIPER_TTS_URL = process.env.PIPER_TTS_URL || "http://piper_tts:8000";
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/**
 * Generate audio from text using Piper TTS
 * @param {string} text - Text to synthesize
 * @param {string} filename - Output filename (without extension)
 * @returns {Promise<string>} - Path to the generated audio file
 */
export async function generateAudio(text, filename) {
    const outputPath = path.join(UPLOAD_DIR, `${filename}.wav`);

    const response = await fetch(`${PIPER_TTS_URL}/tts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status} ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));

    return outputPath;
}
