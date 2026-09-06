/**
 * TypeScript types matching the backend Pydantic schemas.
 * Keep in sync with backend/app/ai/schemas.py and backend/app/models/incident.py
 */

export interface TranscriptEntry {
  speaker: string;
  timestamp: string;
  text: string;
}

export interface Fact {
  speaker: string;
  timestamp: string;
  statement: string;
  confidence: string; // reported | verified | disputed
}

export interface Hypothesis {
  speaker: string;
  timestamp: string;
  statement: string;
  supporting_evidence: string[];
  status: string; // unverified | investigating | supported | refuted
}

export interface Conflict {
  description: string;
  statements: { speaker: string; timestamp: string; statement: string }[];
  status: string; // unresolved | resolved
}

export interface Decision {
  speaker: string;
  timestamp: string;
  statement: string;
  status: string; // active | superseded | reverted
}

export interface Action {
  description: string;
  owner: string | null;
  status: string; // pending | in_progress | completed | blocked
  priority: string; // low | medium | high | critical
  speaker: string;
  timestamp: string;
}

export interface TimelineEvent {
  timestamp: string;
  event: string;
  speaker: string;
  event_type: string; // observation | action | decision | escalation
}

export interface Risk {
  description: string;
  severity: string; // low | medium | high | critical
  status: string; // open | mitigated | accepted
  speaker: string | null;
  timestamp: string | null;
}

export interface Topic {
  id: string;
  name: string;
  participants: string[];
  facts: Fact[];
  hypotheses: Hypothesis[];
  conflicts: Conflict[];
  actions: Action[];
}

export interface IncidentAnalysis {
  topics: Topic[];
  decisions: Decision[];
  timeline: TimelineEvent[];
  risks: Risk[];
}

export interface IncidentState {
  id: string;
  title: string;
  status: string;
  severity: string;
  participants: string[];
  transcript: TranscriptEntry[];
  topics: Topic[];
  decisions: Decision[];
  timeline: TimelineEvent[];
  risks: Risk[];
  created_at: string;
  updated_at: string;
}

export interface AnalyzeResponse {
  incident_id: string;
  analysis: IncidentAnalysis;
  transcript_length: number;
  message: string;
}
