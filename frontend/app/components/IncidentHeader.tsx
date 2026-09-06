'use client';

interface Props {
  incidentId: string;
  title: string;
  status: string;
  severity: string;
  participants: string[];
}

export default function IncidentHeader({ incidentId, title, status, severity, participants }: Props) {
  const statusColors: Record<string, string> = {
    investigating: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    identified: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    monitoring: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
  };

  return (
    <div className="bg-incident-card border border-incident-border rounded-lg p-4 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-incident-muted text-sm font-mono">{incidentId}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs border ${statusColors[status.toLowerCase()] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
            {status}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs border bg-red-500/10 text-red-500 border-red-500/20">
            {severity}
          </span>
        </div>
        <h1 className="text-xl font-bold text-incident-text">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {participants.map((p, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-incident-border flex items-center justify-center text-xs border-2 border-incident-card text-incident-text" title={p}>
              {p.substring(0, 2).toUpperCase()}
            </div>
          ))}
        </div>
        <span className="text-sm text-incident-muted ml-2">{participants.length} Participants</span>
      </div>
    </div>
  );
}
