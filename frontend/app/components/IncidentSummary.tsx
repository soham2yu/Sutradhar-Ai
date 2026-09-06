'use client';

import { Risk } from '@/lib/types';

interface Props {
  risks: Risk[];
  factCount: number;
  hypothesisCount: number;
  conflictCount: number;
  actionCount: number;
}

export default function IncidentSummary({ risks, factCount, hypothesisCount, conflictCount, actionCount }: Props) {
  const severityColors: Record<string, string> = {
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  return (
    <div className="bg-incident-card border border-incident-border rounded-lg p-4 space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 pb-4 border-b border-incident-border">
        <div className="text-center p-2 bg-incident-border/20 rounded">
          <div className="text-xs text-incident-muted uppercase mb-1">Facts</div>
          <div className="text-xl font-semibold text-green-500">{factCount}</div>
        </div>
        <div className="text-center p-2 bg-incident-border/20 rounded">
          <div className="text-xs text-incident-muted uppercase mb-1">Hypotheses</div>
          <div className="text-xl font-semibold text-amber-500">{hypothesisCount}</div>
        </div>
        <div className="text-center p-2 bg-incident-border/20 rounded">
          <div className="text-xs text-incident-muted uppercase mb-1">Conflicts</div>
          <div className="text-xl font-semibold text-red-500">{conflictCount}</div>
        </div>
        <div className="text-center p-2 bg-incident-border/20 rounded">
          <div className="text-xs text-incident-muted uppercase mb-1">Actions</div>
          <div className="text-xl font-semibold text-cyan-500">{actionCount}</div>
        </div>
      </div>

      {/* Risks */}
      <div>
        <div className="flex items-center mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-400">Identified Risks</h2>
          <span className="bg-incident-border text-incident-muted rounded-full px-2 py-0.5 text-xs ml-2">
            {risks.length}
          </span>
        </div>
        <div className="space-y-2">
          {risks.length === 0 ? (
            <div className="text-incident-muted text-sm italic">No risks identified</div>
          ) : (
            risks.map((risk, idx) => (
              <div key={idx} className="flex items-start justify-between bg-incident-border/20 p-2 rounded text-sm">
                <span className="text-incident-text">{risk.description}</span>
                <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] border uppercase whitespace-nowrap ${severityColors[risk.severity.toLowerCase()] || severityColors.medium}`}>
                  {risk.severity}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
