
import logging
import json
import os
import psycopg2
from datetime import datetime, timezone

from app.ai.schemas import IncidentAnalysis
from app.models.incident import IncidentState, TranscriptEntry

logger = logging.getLogger(__name__)

# Parse Postgres connection string from .env
# Remove the '+asyncpg' dialect tag for psycopg2
raw_url = os.environ.get("DATABASE_URL", "")
PG_URL = raw_url.replace("+asyncpg", "") if raw_url.startswith("postgres") else None


class IncidentService:
    """Postgres-backed incident store and state manager."""

    def __init__(self):
        self._incidents = {}
        if PG_URL:
            self._load_from_db()
        else:
            logger.warning("No DATABASE_URL found. Running fully in-memory.")

    def _get_conn(self):
        return psycopg2.connect(PG_URL)

    def _load_from_db(self):
        try:
            with self._get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT id, state_json FROM incidents")
                    for row in cur.fetchall():
                        try:
                            incident_dict = json.loads(row[1])
                            self._incidents[row[0]] = IncidentState.model_validate(incident_dict)
                        except Exception as e:
                            logger.error("Failed to load incident %s from db: %s", row[0], e)
            logger.info("Loaded %d incidents from database", len(self._incidents))
        except Exception as e:
            logger.error("Database connection failed during boot: %s", e)

    def _save_to_db(self, incident: IncidentState):
        if not PG_URL:
            return
        try:
            with self._get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        INSERT INTO incidents (id, state_json, updated_at) 
                        VALUES (%s, %s, %s)
                        ON CONFLICT (id) DO UPDATE SET 
                            state_json = EXCLUDED.state_json, 
                            updated_at = EXCLUDED.updated_at
                        """,
                        (incident.id, incident.model_dump_json(), incident.updated_at)
                    )
                conn.commit()
        except Exception as e:
            logger.error("Failed to save to database: %s", e)

    def create_incident(self, incident_id: str, title: str = "", admin_id: str = None, is_particle_text_enabled: bool = False) -> IncidentState:
        """Create a new incident or return existing one."""
        if incident_id in self._incidents:
            logger.info("Incident %s already exists, returning existing", incident_id)
            return self._incidents[incident_id]

        incident = IncidentState(
            id=incident_id,
            title=title or f"Incident {incident_id}",
            admin_id=admin_id,
            is_particle_text_enabled=is_particle_text_enabled
        )
        self._incidents[incident_id] = incident
        self._save_to_db(incident)
        logger.info("Created incident %s", incident_id)
        return incident

    def get_incident(self, incident_id: str) -> IncidentState | None:
        """Get the current state of an incident."""
        return self._incidents.get(incident_id)

    def list_incidents(self) -> list[IncidentState]:
        """List all incidents."""
        return list(self._incidents.values())

    def append_transcript(
        self, incident_id: str, entries: list[TranscriptEntry]
    ) -> IncidentState:
        """
        Append transcript entries to an incident.
        Creates the incident if it doesn"t exist.
        Also extracts and adds new participants.
        """
        incident = self._incidents.get(incident_id)
        if not incident:
            incident = self.create_incident(incident_id)

        incident.transcript.extend(entries)

        # Track participants
        for entry in entries:
            if entry.speaker not in incident.participants:
                incident.participants.append(entry.speaker)

        incident.updated_at = datetime.now(timezone.utc).isoformat()
        self._save_to_db(incident)
        logger.info(
            "Appended %d transcript entries to incident %s",
            len(entries),
            incident_id,
        )
        return incident

    def merge_analysis(
        self, incident_id: str, analysis: IncidentAnalysis
    ) -> IncidentState:
        """
        Merge new analysis results into existing incident state.
        This is ADDITIVE - new facts, hypotheses, etc. are appended
        to the existing lists. This preserves the full history of
        analysis as the incident evolves.
        """
        incident = self._incidents.get(incident_id)
        if not incident:
            incident = self.create_incident(incident_id)

        for new_topic in analysis.topics:
            existing_topic = next((t for t in incident.topics if t.id == new_topic.id), None)
            if existing_topic:
                existing_topic.facts.extend(new_topic.facts)
                existing_topic.hypotheses.extend(new_topic.hypotheses)
                existing_topic.conflicts.extend(new_topic.conflicts)
                existing_topic.actions.extend(new_topic.actions)
                for p in new_topic.participants:
                    if p not in existing_topic.participants:
                        existing_topic.participants.append(p)
            else:
                incident.topics.append(new_topic)

        incident.decisions.extend(analysis.decisions)
        incident.timeline.extend(analysis.timeline)
        incident.risks.extend(analysis.risks)

        # Update the latest AI response if present
        if analysis.ai_response:
            incident.ai_response = analysis.ai_response

        incident.updated_at = datetime.now(timezone.utc).isoformat()
        
        # Persist the merged state
        self._save_to_db(incident)

        logger.info(
            "Merged analysis into incident %s: +%d topics, +%d decisions, +%d timeline, +%d risks",
            incident_id,
            len(analysis.topics),
            len(analysis.decisions),
            len(analysis.timeline),
            len(analysis.risks),
        )
        return incident


# Module-level singleton
incident_service = IncidentService()

