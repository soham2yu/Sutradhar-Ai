'use client';

import { Conflict } from '@/lib/types';

interface Props {
  conflicts: Conflict[];
}

export default function ConflictsPanel({ conflicts }: Props) {
  return (
    <div className="bg-incident-card border border-incident-border rounded-lg p-4">
      <div className="flex items-center mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-red-500">⚡ Conflicts</h2>
        <span className="bg-incident-border text-incident-muted rounded-full px-2 py-0.5 text-xs ml-2">
          {conflicts.length}
        </span>
      </div>
      <div className="space-y-4">
        {conflicts.length === 0 ? (
          <div className="text-incident-muted text-sm italic">No conflicts identified</div>
        ) : (
          conflicts.map((conflict, idx) => (
            <div key={idx} className="border-b border-incident-border last:border-0 pb-4">
              <div className="text-incident-text text-sm font-medium mb-3">
                {conflict.description}
              </div>
              <div className="grid grid-cols-2 gap-3 relative">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500/20 text-red-500 text-xs font-bold px-2 rounded-full border border-red-500/30 z-10">
                  VS
                </div>
                {conflict.statements.map((stmt, sIdx) => (
                  <div key={sIdx} className="bg-incident-border/30 p-2 rounded text-xs border border-incident-border/50">
                    <div className="text-incident-muted mb-1 flex justify-between">
                      <span className="font-semibold">{stmt.speaker}</span>
                      <span>{stmt.timestamp}</span>
                    </div>
                    <div className="text-incident-text italic">
                      "{stmt.statement}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
