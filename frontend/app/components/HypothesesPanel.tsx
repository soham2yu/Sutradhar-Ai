'use client';

import { Hypothesis } from '@/lib/types';

interface Props {
  hypotheses: Hypothesis[];
}

export default function HypothesesPanel({ hypotheses }: Props) {
  const statusColors: Record<string, string> = {
    unverified: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    investigating: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    supported: 'bg-green-500/10 text-green-400 border-green-500/20',
    refuted: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="bg-incident-card border border-incident-border rounded-lg p-4">
      <div className="flex items-center mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-500">🔮 Hypotheses</h2>
        <span className="bg-incident-border text-incident-muted rounded-full px-2 py-0.5 text-xs ml-2">
          {hypotheses.length}
        </span>
      </div>
      <div className="space-y-3">
        {hypotheses.length === 0 ? (
          <div className="text-incident-muted text-sm italic">No hypotheses identified yet</div>
        ) : (
          hypotheses.map((hyp, idx) => (
            <div key={idx} className="border-b border-incident-border last:border-0 pb-3">
              <div className="flex justify-between items-start mb-1">
                <span className="text-incident-text text-sm font-medium">{hyp.statement}</span>
                <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] border uppercase whitespace-nowrap ${statusColors[hyp.status.toLowerCase()] || statusColors.unverified}`}>
                  {hyp.status}
                </span>
              </div>
              <div className="text-xs text-incident-muted mb-2">
                {hyp.speaker} • {hyp.timestamp}
              </div>
              {hyp.supporting_evidence && hyp.supporting_evidence.length > 0 && (
                <div className="text-xs bg-incident-border/50 p-2 rounded mt-2">
                  <span className="font-semibold text-incident-text mb-1 block">Evidence:</span>
                  <ul className="list-disc pl-4 space-y-1 text-incident-muted">
                    {hyp.supporting_evidence.map((evidence, eIdx) => (
                      <li key={eIdx}>{evidence}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
