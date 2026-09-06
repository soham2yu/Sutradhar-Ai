import { useState, useEffect, useRef } from 'react';
import { IncidentState } from '@/types'; // We'll create this

export function useAIEvents(incidentId: string, isActive: boolean) {
  const [state, setState] = useState<IncidentState | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    if (!wsRef.current) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const wsUrl = backendUrl.replace(/^http/, 'ws');
      const ws = new WebSocket(`${wsUrl}/api/ws/${incidentId}`);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'incident_update') {
            setState(data.incident);
          } else {
            setState(data); // Fallback if it sends raw state
          }
        } catch (e) {
          console.error("Failed to parse AI state from WS:", e);
        }
      };

      wsRef.current = ws;

      // Keep connection alive on Render (ping every 30s)
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send("ping");
        }
      }, 30000);

      ws.addEventListener("close", () => {
        clearInterval(pingInterval);
      });
    }

    return () => {
      // Don't close aggressively on every render, only when isActive becomes false
    };
  }, [incidentId, isActive]);

  return { state };
}
