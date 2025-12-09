import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const WHISPER_URL = process.env.WHISPER_SERVICE_URL || "http://whisper:9000";
const FASTER_WHISPER_URL = process.env.FASTER_WHISPER_SERVICE_URL || "http://faster-whisper:9000";
const WHISPER_X_URL = process.env.WHISPER_X_SERVICE_URL || "http://whisper-x:9000";

/**
 * Sends an audio file to the Whisper service for transcription.
 * @param {string} filePath - The path to the audio file
 * @returns {string} - The transcribed text
 */
export async function sendToWhisper(filePath) {
  console.log("[Whisper] Start");
  console.time("whisper");

  const form = new FormData();
  form.append("audio_file", fs.createReadStream(filePath));

  const url = `${WHISPER_URL}/asr?task=transcribe&language=vi`;
  const response = await axios.post(url, form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  });

  console.timeEnd("whisper");
  console.log("[Whisper] Raw:", response.data);

  const data = response.data;

  if (data.text) return data.text;
  if (data.transcription) return data.transcription;
  if (data.result?.text) return data.result.text;
  if (typeof data === "string") return data;

  throw new Error("Whisper returned unexpected format: " + JSON.stringify(data));
}

export async function sendToFasterWhisper(filePath) {
  console.log("[Faster Whisper] Start");
  console.time("faster-whisper");

  const form = new FormData();
  form.append("audio_file", fs.createReadStream(filePath));

  const url = `${FASTER_WHISPER_URL}/asr?task=transcribe&output=json&vad_filter=true`;
  const response = await axios.post(url, form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  });

  console.timeEnd("faster-whisper");
  console.log("[Faster Whisper] Raw:", response.data);

  const data = response.data;

  return data;
}

export async function sendToWhisperX(filePath) {
  console.log("[Whisper X] Start");
  console.time("whisper-x");

  const form = new FormData();
  form.append("audio_file", fs.createReadStream(filePath));

  const url = `${WHISPER_X_URL}/asr?task=transcribe&output=json&vad_filter=true&diarize=true`;
  const response = await axios.post(url, form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  });

  console.timeEnd("whisper-x");
  console.log("[Whisper X] Raw:", response.data);

  const data = response.data;

  return data;
}