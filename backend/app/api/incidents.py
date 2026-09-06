"""
Incident management endpoints.

GET  /api/incidents           — List all incidents
POST /api/incidents           — Create a new incident
GET  /api/incidents/{id}      — Get full incident state
"""

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.models.incident import IncidentState
from app.services.incident_service import incident_service

logger = logging.getLogger(__name__)
router = APIRouter()


class CreateIncidentRequest(BaseModel):
    """Request body for creating a new incident."""

    incident_id: str = Field(description="Unique incident identifier")
    title: str = Field(default="", description="Human-readable incident title")
    admin_id: str | None = Field(default=None, description="The user creating the room")
    is_particle_text_enabled: bool = Field(default=False, description="Initial particle mode")


class CreateIncidentResponse(BaseModel):
    """Response after creating an incident."""

    incident_id: str
    message: str


@router.get("/incidents", response_model=list[IncidentState])
async def list_incidents() -> list[IncidentState]:
    """List all active incidents."""
    return incident_service.list_incidents()

@router.get("/incidents/user/{admin_id}", response_model=list[IncidentState])
async def get_user_incidents(admin_id: str) -> list[IncidentState]:
    """Get all incidents created by a specific user."""
    incidents = incident_service.list_incidents()
    return [i for i in incidents if i.admin_id == admin_id]


@router.post("/incidents", response_model=CreateIncidentResponse)
async def create_incident(request: CreateIncidentRequest) -> CreateIncidentResponse:
    """Create a new incident."""
    incident = incident_service.create_incident(
        incident_id=request.incident_id,
        title=request.title,
        admin_id=request.admin_id,
        is_particle_text_enabled=request.is_particle_text_enabled
    )
    return CreateIncidentResponse(
        incident_id=incident.id,
        message=f"Incident {incident.id} created",
    )


@router.get("/incidents/{incident_id}", response_model=IncidentState)
async def get_incident(incident_id: str) -> IncidentState:
    """Get the full current state of an incident."""
    incident = incident_service.get_incident(incident_id)
    if not incident:
        raise HTTPException(
            status_code=404,
            detail=f"Incident {incident_id} not found",
        )
    return incident

class UpdateSettingsRequest(BaseModel):
    is_particle_text_enabled: bool

@router.patch("/incidents/{incident_id}/settings")
async def update_settings(incident_id: str, request: UpdateSettingsRequest):
    """Update settings for an incident."""
    incident = incident_service.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident.is_particle_text_enabled = request.is_particle_text_enabled
    incident_service._save_to_db(incident)
    
    from app.api.websocket import manager as ws_manager
    await ws_manager.broadcast_incident_state(incident_id)
    
    return {"message": "Settings updated", "is_particle_text_enabled": incident.is_particle_text_enabled}
