"""
Transcript management endpoints.

POST /api/incidents/{id}/transcript — Append transcript entries
GET  /api/incidents/{id}/transcript — Get raw transcript
"""

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.models.incident import TranscriptEntry
from app.services.incident_service import incident_service

logger = logging.getLogger(__name__)
router = APIRouter()


class TranscriptInput(BaseModel):
    """A single transcript entry."""

    speaker: str
    timestamp: str
    text: str


class AppendTranscriptRequest(BaseModel):
    """Request body for appending transcript entries."""

    entries: list[TranscriptInput] = Field(min_length=1)


class AppendTranscriptResponse(BaseModel):
    """Response after appending transcript entries."""

    incident_id: str
    entries_added: int
    total_entries: int
    message: str


@router.post(
    "/incidents/{incident_id}/transcript",
    response_model=AppendTranscriptResponse,
)
async def append_transcript(
    incident_id: str, request: AppendTranscriptRequest
) -> AppendTranscriptResponse:
    """Append transcript entries to an existing incident."""
    transcript_entries = [
        TranscriptEntry(
            speaker=e.speaker,
            timestamp=e.timestamp,
            text=e.text,
        )
        for e in request.entries
    ]

    incident = incident_service.append_transcript(incident_id, transcript_entries)

    return AppendTranscriptResponse(
        incident_id=incident_id,
        entries_added=len(request.entries),
        total_entries=len(incident.transcript),
        message=f"Added {len(request.entries)} transcript entries",
    )


@router.get(
    "/incidents/{incident_id}/transcript",
    response_model=list[TranscriptEntry],
)
async def get_transcript(incident_id: str) -> list[TranscriptEntry]:
    """Get the full raw transcript for an incident."""
    incident = incident_service.get_incident(incident_id)
    if not incident:
        raise HTTPException(
            status_code=404,
            detail=f"Incident {incident_id} not found",
        )
    return incident.transcript
