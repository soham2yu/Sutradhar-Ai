from sqlalchemy import Column, String, Text, DateTime
from app.db.database import Base
import datetime

class IncidentRecord(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # We will store the entire Pydantic IncidentState as a JSON string for simplicity 
    # and fast iteration, instead of creating 15 relational tables for Topics/Facts/Actions.
    state_json = Column(Text, default="{}")

