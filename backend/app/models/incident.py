"""
Incident data models.

These models represent the persistent state of an incident,
separate from the AI analysis schemas.
"""

from datetime import datetime, timezone

from pydantic import BaseModel, Field

from app.ai.schemas import (
    Topic,
    Decision,
    Risk,
    TimelineEvent,
)


class TranscriptEntry(BaseModel):
    """A single utterance in the incident transcript."""

    speaker: str
    timestamp: str
    text: str


class IncidentState(BaseModel):
    """
    Full state of an incident, accumulating analysis results over time.

    Raw transcript is preserved separately from AI-generated intelligence
    so it remains available for audit/review.
    """

    id: str
    title: str = ""
    status: str = Field(
        default="investigating",
        description="investigating | identified | monitoring | resolved",
    )
    severity: str = Field(
        default="unknown",
        description="unknown | low | medium | high | critical",
    )
    participants: list[str] = Field(default_factory=list)

    admin_id: str | None = Field(default=None, description="The user ID of the person who created the room")
    is_particle_text_enabled: bool = Field(default=False, description="Whether Particle Text Mode is enabled for everyone")

    ai_response: str | None = Field(default=None, description="Latest AI response to the users")

    # Raw transcript — preserved for audit, never overwritten by AI
    transcript: list[TranscriptEntry] = Field(default_factory=list)

    # AI-extracted structured intelligence
    topics: list[Topic] = Field(default_factory=list)
    decisions: list[Decision] = Field(default_factory=list)
    timeline: list[TimelineEvent] = Field(default_factory=list)
    risks: list[Risk] = Field(default_factory=list)

    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    updated_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
