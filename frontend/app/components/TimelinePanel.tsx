'use client';

import { TimelineEvent } from '@/lib/types';

interface Props {
  events: TimelineEvent[];
}

export default function TimelinePanel({ events }: Props) {
  const typeColors: Record<string, string> = {
    observation: 'bg-blue-500',
    action: 'bg-green-500',
    decision: 'bg-purple-500',
    escalation: 'bg-red-500',
  };

  return (
    <div className="bg-incident-card border border-incident-border rounded-lg p-4">
      <div className="flex items-center mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-incident-text">Timeline</h2>
        <span className="bg-incident-border text-incident-muted rounded-full px-2 py-0.5 text-xs ml-2">
          {events.length}
        </span>
      </div>
      
      <div className="relative pl-4 space-y-4">
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-incident-border"></div>
        
        {events.length === 0 ? (
          <div className="text-incident-muted text-sm italic">No events recorded</div>
        ) : (
          events.map((event, idx) => (
            <div key={idx} className="relative">
              <div className={`absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-incident-card ${typeColors[event.event_type.toLowerCase()] || 'bg-gray-500'}`}></div>
              <div className="text-xs text-incident-muted mb-0.5">
                {event.timestamp}
              </div>
              <div className="text-sm text-incident-text">
                {event.event}
              </div>
              <div className="text-xs text-incident-muted mt-0.5">
                — {event.speaker}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
