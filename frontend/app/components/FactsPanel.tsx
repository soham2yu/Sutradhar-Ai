'use client';

import { Fact } from '@/lib/types';

interface Props {
  facts: Fact[];
}

export default function FactsPanel({ facts }: Props) {
  const confidenceColors: Record<string, string> = {
    reported: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    verified: 'bg-green-500/10 text-green-400 border-green-500/20',
    disputed: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="bg-incident-card border border-incident-border rounded-lg p-4">
      <div className="flex items-center mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-green-500">✅ Facts</h2>
        <span className="bg-incident-border text-incident-muted rounded-full px-2 py-0.5 text-xs ml-2">
          {facts.length}
        </span>
      </div>
      <div className="space-y-3">
        {facts.length === 0 ? (
          <div className="text-incident-muted text-sm italic">No facts identified yet</div>
        ) : (
          facts.map((fact, idx) => (
            <div key={idx} className="border-b border-incident-border last:border-0 pb-3">
              <div className="flex justify-between items-start mb-1">
                <span className="text-incident-text text-sm font-medium">{fact.statement}</span>
                <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] border uppercase ${confidenceColors[fact.confidence.toLowerCase()] || confidenceColors.reported}`}>
                  {fact.confidence}
                </span>
              </div>
              <div className="text-xs text-incident-muted">
                {fact.speaker} • {fact.timestamp}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
