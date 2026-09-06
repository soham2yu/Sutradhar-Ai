"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { listIncidents } from "@/lib/api";
import { IncidentState } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [incidentId, setIncidentId] = useState("");
  const [title, setTitle] = useState("");
  const [incidents, setIncidents] = useState<IncidentState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listIncidents()
      .then(setIncidents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentId.trim()) return;
    const id = incidentId.trim();
    const t = title.trim() || `Incident ${id}`;
    router.push(`/incident/${encodeURIComponent(id)}?title=${encodeURIComponent(t)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0A0D14]">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-xl space-y-10 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            EchoSphere Voice AI Hackathon 2026
          </div>
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
            Sutradhar
          </h1>
          <p className="text-incident-muted text-lg max-w-md mx-auto">
            An AI that joins your incident call, listens, thinks, and keeps everyone aligned in real-time.
          </p>
        </div>

        {/* Create Form */}
        <form
          onSubmit={handleCreate}
          className="bg-[#131826]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">New Incident Room</h2>
              <p className="text-sm text-gray-400">Create a real-time voice intelligence room</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Incident ID
              </label>
              <input
                type="text"
                value={incidentId}
                onChange={(e) => setIncidentId(e.target.value)}
                placeholder="e.g. INC-404"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Incident Title <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Database Connection Exhaustion"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group"
          >
            Launch Incident Room
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </form>

        {/* Existing Incidents */}
        {!loading && incidents.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider px-2">Active Rooms</h3>
            <div className="grid gap-3">
              {incidents.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => router.push(`/incident/${encodeURIComponent(inc.id)}`)}
                  className="w-full text-left bg-[#131826]/60 backdrop-blur-md border border-white/5 rounded-xl px-5 py-4 hover:bg-[#131826] hover:border-blue-500/30 transition-all group flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-white font-medium group-hover:text-blue-400 transition-colors">
                        {inc.id}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        {inc.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {inc.title || `Incident ${inc.id}`}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md">{inc.transcript.length} logs</span>
                    <span className="text-xs text-gray-500">{inc.participants.length} users</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
