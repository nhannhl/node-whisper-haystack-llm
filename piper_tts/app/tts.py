import os
import io
import wave
from piper import PiperVoice

MODEL_PATH = os.getenv("PIPER_MODEL")
CONFIG_PATH = os.getenv("PIPER_CONFIG")

if not MODEL_PATH or not CONFIG_PATH:
    raise RuntimeError("Missing PIPER_MODEL or PIPER_CONFIG")

voice = PiperVoice.load(MODEL_PATH, CONFIG_PATH)

def synthesize(text: str) -> bytes:
    if not text.strip():
        raise ValueError("Empty text")

    # Ghi WAV vào memory buffer
    wav_io = io.BytesIO()
    with wave.open(wav_io, "wb") as wav_file:
        voice.synthesize_wav(text, wav_file)
    
    wav_io.seek(0)
    return wav_io.read()
