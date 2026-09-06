"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Database, Clock } from 'lucide-react';
import { IncidentState } from '@/types';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';

export default function ArchivePage() {
  const [incidents, setIncidents] = useState<IncidentState[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/incidents/user/${user.uid}`)
      .then(res => res.json())
      .then(data => {
        // Sort by most recent
        const sorted = data.sort((a: IncidentState, b: IncidentState) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        setIncidents(sorted);
        setLoading(false);
      })
      .catch(e => {
        console.error("Failed to load archive", e);
        setLoading(false);
      });
  }, [user]);

  if (authLoading) {
    return <div className="min-h-screen bg-[#050914] flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <main className="min-h-screen bg-[#050914] text-white p-8 md:p-16">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex justify-between items-end border-b border-white/10 pb-8">
          <div>
            <Link href="/dashboard" className="inline-flex items-center text-white/40 hover:text-white mb-6 transition-colors uppercase tracking-widest text-xs font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" /> Return to Commander
            </Link>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight">Intelligence Archive</h1>
            <p className="text-white/40 mt-2">Historical record of all Sutradhar incident sessions.</p>
          </div>
          <div className="hidden md:flex gap-4 text-xs tracking-widest uppercase text-white/40">
            <div className="flex items-center gap-2"><Database className="w-4 h-4" /> {incidents.length} Records</div>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incidents.map((incident) => {
              const factCount = incident.topics?.reduce((acc, t) => acc + (t.facts?.length || 0), 0) || 0;
              const hypothesisCount = incident.topics?.reduce((acc, t) => acc + (t.hypotheses?.length || 0), 0) || 0;
              const actionCount = incident.topics?.reduce((acc, t) => acc + (t.actions?.length || 0), 0) || 0;
              const transcriptCount = incident.transcript?.length || 0;

              return (
                <Link href={`/archive/${incident.id}`} key={incident.id}>
                  <div className="group bg-black/40 border border-white/10 hover:border-white/30 hover:bg-white/5 rounded-3xl p-6 transition-all cursor-pointer backdrop-blur-xl relative overflow-hidden">
                    
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
                    
                    <div className="relative">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-bold mb-1">Session</div>
                          <div className="text-xl font-light tracking-widest text-white/90 font-mono">{incident.id}</div>
                        </div>
                        <div className="flex -space-x-2">
                          {incident.participants?.slice(0, 3).map((p, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-black flex items-center justify-center text-[10px] font-bold text-white/80" title={p}>
                              {p.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {incident.participants && incident.participants.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-black flex items-center justify-center text-[10px] font-bold text-white/40">
                              +{incident.participants.length - 3}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <div className="text-white/30 text-[9px] uppercase tracking-widest mb-1">Intercepts</div>
                          <div className="text-2xl font-light text-white/80">{transcriptCount}</div>
                        </div>
                        <div>
                          <div className="text-white/30 text-[9px] uppercase tracking-widest mb-1">Axioms</div>
                          <div className="text-2xl font-light text-green-500/80">{factCount}</div>
                        </div>
                        <div>
                          <div className="text-white/30 text-[9px] uppercase tracking-widest mb-1">Postulations</div>
                          <div className="text-2xl font-light text-blue-500/80">{hypothesisCount}</div>
                        </div>
                        <div>
                          <div className="text-white/30 text-[9px] uppercase tracking-widest mb-1">Actions</div>
                          <div className="text-2xl font-light text-white/60">{actionCount}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {new Date(incident.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
