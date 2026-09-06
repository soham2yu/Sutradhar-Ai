"""
Sutradhar — AI Incident Commander Backend

FastAPI entry point. Mounts all API routers and configures middleware.
"""

import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load .env before importing anything that reads env vars
load_dotenv()

from app.api import analysis, incidents, transcript, websocket, integrations, agora, tts  # noqa: E402

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "info").upper(),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Sutradhar",
    description=(
        "AI Incident Commander — real-time incident intelligence "
        "from voice and text transcripts."
    ),
    version="0.1.0",
)

# CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(analysis.router, prefix="/api", tags=["Analysis"])
app.include_router(incidents.router, prefix="/api", tags=["Incidents"])
app.include_router(transcript.router, prefix="/api", tags=["Transcript"])
app.include_router(websocket.router, prefix="/api", tags=["WebSocket"])
app.include_router(integrations.router, prefix="/api", tags=["Integrations"])
app.include_router(agora.router, prefix="/api/agora", tags=["Agora"])
app.include_router(tts.router, prefix="/api/tts", tags=["TTS"])


@app.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "service": "sutradhar-backend",
        "version": "0.1.0",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
        reload=True,
    )
