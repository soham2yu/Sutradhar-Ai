/**
 * React hook for managing incident state via WebSocket.
 *
 * Connects to the backend WebSocket for real-time updates and
 * provides methods to interact with the incident.
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { IncidentState, TranscriptEntry } from "./types";
import { analyzeTranscript, createIncident, getIncident } from "./api";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

interface UseIncidentResult {
  /** Current incident state (null if not loaded). */
  incident: IncidentState | null;
  /** Whether we're connected to the WebSocket. */
  isConnected: boolean;
  /** Whether an analysis is currently in progress. */
  isAnalyzing: boolean;
  /** Error message, if any. */
  error: string | null;
  /** Send a transcript segment for analysis. */
  sendTranscript: (entries: TranscriptEntry[]) => Promise<void>;
  /** Initialize/load the incident. */
  initIncident: (title?: string) => Promise<void>;
}

export function useIncident(incidentId: string): UseIncidentResult {
  const [incident, setIncident] = useState<IncidentState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect WebSocket
  useEffect(() => {
    if (!incidentId) return;

    function connect() {
      const ws = new WebSocket(`${WS_URL}/api/ws/${encodeURIComponent(incidentId)}`);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "incident_update" && data.incident) {
            setIncident(data.incident);
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Auto-reconnect after 2 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (wsRef.current === ws) {
            connect();
          }
        }, 2000);
      };

      ws.onerror = () => {
        setError("WebSocket connection error");
      };

      wsRef.current = ws;
    }

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on intentional close
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [incidentId]);

  const initIncident = useCallback(
    async (title?: string) => {
      try {
        await createIncident(incidentId, title || `Incident ${incidentId}`);
        const state = await getIncident(incidentId);
        setIncident(state);
      } catch (e: any) {
        setError(e.message);
      }
    },
    [incidentId]
  );

  const sendTranscript = useCallback(
    async (entries: TranscriptEntry[]) => {
      if (!incidentId || entries.length === 0) return;

      setIsAnalyzing(true);
      setError(null);

      try {
        await analyzeTranscript(incidentId, entries);
        // The WebSocket will push the updated state
      } catch (e: any) {
        setError(e.message);
        // Still try to fetch current state
        try {
          const state = await getIncident(incidentId);
          setIncident(state);
        } catch {
          // Ignore
        }
      } finally {
        setIsAnalyzing(false);
      }
    },
    [incidentId]
  );

  return {
    incident,
    isConnected,
    isAnalyzing,
    error,
    sendTranscript,
    initIncident,
  };
}
