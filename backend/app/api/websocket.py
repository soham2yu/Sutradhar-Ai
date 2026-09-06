"""
WebSocket connection manager for real-time incident updates.

Manages per-incident WebSocket connections and broadcasts
state updates to all connected dashboard clients.
"""

import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.incident_service import incident_service

logger = logging.getLogger(__name__)
router = APIRouter()


class ConnectionManager:
    """Manages WebSocket connections grouped by incident ID."""

    def __init__(self):
        self._connections: dict[str, list[WebSocket]] = {}

    async def connect(self, incident_id: str, websocket: WebSocket):
        await websocket.accept()
        if incident_id not in self._connections:
            self._connections[incident_id] = []
        self._connections[incident_id].append(websocket)
        logger.info(
            "WebSocket connected for incident %s (total: %d)",
            incident_id,
            len(self._connections[incident_id]),
        )

    def disconnect(self, incident_id: str, websocket: WebSocket):
        if incident_id in self._connections:
            try:
                self._connections[incident_id].remove(websocket)
            except ValueError:
                pass
            if not self._connections[incident_id]:
                del self._connections[incident_id]
        logger.info("WebSocket disconnected for incident %s", incident_id)

    async def broadcast_incident_state(self, incident_id: str):
        """Broadcast the full current incident state to all connected clients."""
        if incident_id not in self._connections:
            return

        incident = incident_service.get_incident(incident_id)
        if not incident:
            return

        data = {
            "type": "incident_update",
            "incident": incident.model_dump(),
        }

        disconnected = []
        for ws in self._connections[incident_id]:
            try:
                await ws.send_json(data)
            except Exception:
                disconnected.append(ws)

        for ws in disconnected:
            self.disconnect(incident_id, ws)

        if self._connections.get(incident_id):
            logger.info(
                "Broadcast incident state to %d clients for %s",
                len(self._connections[incident_id]),
                incident_id,
            )


# Module-level singleton
manager = ConnectionManager()


@router.websocket("/ws/{incident_id}")
async def websocket_endpoint(websocket: WebSocket, incident_id: str):
    """
    WebSocket endpoint for real-time incident updates.

    Clients connect here to receive live updates whenever the incident
    state changes (new transcript, new analysis results, etc.).
    """
    await manager.connect(incident_id, websocket)

    # Send initial state on connect
    await manager.broadcast_incident_state(incident_id)

    try:
        while True:
            # Keep connection alive; receive any client messages
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(incident_id, websocket)
