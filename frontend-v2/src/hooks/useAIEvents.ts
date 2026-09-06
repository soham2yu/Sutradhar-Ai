import { useState, useEffect, useRef } from 'react';
import { IncidentState } from '@/types'; // We'll create this

export function useAIEvents(incidentId: string, isActive: boolean) {
  const [state, setState] = useState<IncidentState | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;
    
    if (!isActive) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    const connectWs = () => {
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) return;

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const wsUrl = backendUrl.replace(/^http/, 'ws');
      const ws = new WebSocket(`${wsUrl}/api/ws/${incidentId}`);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'incident_update') {
            setState(data.incident);
          } else {
            setState(data); // Fallback
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

      ws.onclose = () => {
        clearInterval(pingInterval);
        wsRef.current = null;
        // Auto-reconnect if we are still supposed to be active
        if (isActive) {
          console.log("WebSocket dropped, reconnecting in 3s...");
          reconnectTimer = setTimeout(connectWs, 3000);
        }
      };
    };

    connectWs();

    return () => {
      clearTimeout(reconnectTimer);
      // Keep connection alive unless isActive turns false
    };
  }, [incidentId, isActive]);

  return { state };
}
