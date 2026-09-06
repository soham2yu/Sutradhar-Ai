from fastapi import APIRouter
from fastapi.responses import Response
import edge_tts
import io

router = APIRouter()

@router.get("/")
async def get_tts(text: str, voice: str = "en-US-AriaNeural"):
    """
    Generate natural human speech from text using Edge TTS.
    """
    communicate = edge_tts.Communicate(text, voice)
    audio_data = io.BytesIO()
    
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data.write(chunk["data"])
            
    return Response(content=audio_data.getvalue(), media_type="audio/mpeg")
