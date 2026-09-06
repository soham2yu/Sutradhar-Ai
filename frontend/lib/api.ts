/**
 * API client for the Sutradhar backend.
 */

import { AnalyzeResponse, IncidentState, TranscriptEntry } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`API error ${res.status}: ${detail}`);
  }

  return res.json();
}

/** Create a new incident. */
export async function createIncident(
  incidentId: string,
  title: string
): Promise<{ incident_id: string; message: string }> {
  return fetchJSON("/api/incidents", {
    method: "POST",
    body: JSON.stringify({ incident_id: incidentId, title }),
  });
}

/** Get full incident state. */
export async function getIncident(
  incidentId: string
): Promise<IncidentState> {
  return fetchJSON(`/api/incidents/${encodeURIComponent(incidentId)}`);
}

/** List all incidents. */
export async function listIncidents(): Promise<IncidentState[]> {
  return fetchJSON("/api/incidents");
}

/** Analyze a transcript segment. */
export async function analyzeTranscript(
  incidentId: string,
  transcript: TranscriptEntry[]
): Promise<AnalyzeResponse> {
  return fetchJSON("/api/analyze", {
    method: "POST",
    body: JSON.stringify({ incident_id: incidentId, transcript }),
  });
}

/** Append transcript entries without analysis. */
export async function appendTranscript(
  incidentId: string,
  entries: TranscriptEntry[]
): Promise<{ incident_id: string; entries_added: number; total_entries: number }> {
  return fetchJSON(`/api/incidents/${encodeURIComponent(incidentId)}/transcript`, {
    method: "POST",
    body: JSON.stringify({ entries }),
  });
}
