export interface Fact {
  speaker: string;
  timestamp: string;
  statement: string;
  confidence: string;
}

export interface Hypothesis {
  speaker: string;
  timestamp: string;
  statement: string;
  supporting_evidence: string[];
  status: string;
}

export interface Conflict {
  description: string;
  statements: { speaker: string; timestamp: string; statement: string }[];
  status: string;
}

export interface Decision {
  speaker: string;
  timestamp: string;
  statement: string;
  status: string;
}

export interface Action {
  description: string;
  owner: string | null;
  status: string;
  priority: string;
  speaker: string;
  timestamp: string;
}

export interface Topic {
  id: string;
  title: string;
  summary: string;
  participant_ids: string[];
  facts: Fact[];
  hypotheses: Hypothesis[];
  conflicts: Conflict[];
  actions: Action[];
}

export interface TimelineEvent {
  timestamp: string;
  event: string;
  speaker: string;
  event_type: string;
}

export interface Risk {
  description: string;
  severity: string;
  status: string;
  speaker: string | null;
  timestamp: string | null;
}

export interface TranscriptEntry {
  speaker: string;
  timestamp: string;
  text: string;
}

export interface IncidentState {
  id: string;
  title: string;
  status: string;
  severity: string;
  participants: string[];
  topics: Topic[];
  decisions: Decision[];
  timeline: TimelineEvent[];
  risks: Risk[];
  transcript: TranscriptEntry[];
  ai_response?: string;
  created_at: string;
  updated_at: string;
  is_particle_text_enabled?: boolean;
}
