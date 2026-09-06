'use client';

import { useEffect, useRef } from 'react';
import { TranscriptEntry } from '@/lib/types';

interface Props {
  entries: TranscriptEntry[];
}

export default function LiveTranscript({ entries }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  // Simple hash for consistent colors
  const getColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['text-blue-400', 'text-green-400', 'text-yellow-400', 'text-purple-400', 'text-pink-400', 'text-indigo-400'];
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="bg-incident-card border border-incident-border rounded-lg p-4 flex flex-col h-full max-h-[500px]">
      <div className="flex items-center mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-incident-text">Live Transcript</h2>
        <span className="bg-incident-border text-incident-muted rounded-full px-2 py-0.5 text-xs ml-2">
          {entries.length}
        </span>
      </div>
      <div className="overflow-y-auto flex-1 space-y-2 pr-2">
        {entries.length === 0 ? (
          <div className="text-incident-muted text-sm italic">No entries yet...</div>
        ) : (
          entries.map((entry, idx) => (
            <div key={idx} className="text-sm border-b border-incident-border last:border-0 pb-2">
              <span className="text-xs text-incident-muted mr-2">[{entry.timestamp}]</span>
              <span className={`font-semibold mr-2 ${getColor(entry.speaker)}`}>{entry.speaker}:</span>
              <span className="text-incident-text">{entry.text}</span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
