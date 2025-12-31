from fastapi import FastAPI, Response
from pydantic import BaseModel
from app.tts import synthesize

app = FastAPI()

class TTSRequest(BaseModel):
    text: str

@app.post("/tts")
def tts(req: TTSRequest):
    audio = synthesize(req.text)
    return Response(content=audio, media_type="audio/wav")
