"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, User, Clock, AlertTriangle, FileText, LayoutDashboard, Calendar } from 'lucide-react';
import { IncidentState } from '@/types';

export default function IncidentDetailArchive({ params }: { params: { id: string } }) {
  const [incident, setIncident] = useState<IncidentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'transcript' | 'facts' | 'hypotheses' | 'actions'>('all');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/incidents/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setIncident(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050914] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-[#050914] text-white flex flex-col items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-red-500/50 mb-4" />
        <h1 className="text-2xl font-light uppercase tracking-widest text-white/80">Record Not Found</h1>
        <Link href="/archive" className="mt-8 text-xs uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors">
          Return to Archive
        </Link>
      </div>
    );
  }

  const allFacts = incident.topics?.flatMap(t => t.facts) || [];
  const allHypotheses = incident.topics?.flatMap(t => t.hypotheses) || [];
  const allActions = incident.topics?.flatMap(t => t.actions) || [];
  const transcript = incident.transcript || [];

  const filterText = (text: string) => !search || text.toLowerCase().includes(search.toLowerCase());

  const filteredFacts = allFacts.filter(f => filterText(f.statement) || filterText(f.speaker));
  const filteredHypotheses = allHypotheses.filter(h => filterText(h.statement) || filterText(h.speaker));
  const filteredActions = allActions.filter(a => filterText(a.description) || (a.owner && filterText(a.owner)));
  const filteredTranscript = transcript.filter(t => filterText(t.text) || filterText(t.speaker));

  return (
    <main className="min-h-screen bg-[#050914] text-white p-8 md:p-16 custom-scroll">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8 mb-12">
          <div>
            <Link href="/archive" className="inline-flex items-center text-white/40 hover:text-white mb-6 transition-colors uppercase tracking-widest text-xs font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Records
            </Link>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight flex items-center gap-4">
              SESSION <span className="text-white/40 font-mono">{incident.id}</span>
            </h1>
            <div className="flex items-center gap-6 mt-6 text-xs font-mono text-white/40 uppercase tracking-widest">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(incident.created_at).toLocaleDateString()}</div>
              <div className="flex items-center gap-2"><User className="w-4 h-4" /> {incident.participants?.length || 0} Participants</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {transcript.length} Intercepts</div>
            </div>
          </div>
          
          <div className="w-full md:w-96">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input 
                type="text" 
                placeholder="Global search..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>
        </header>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-4 custom-scroll">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'transcript', label: `Transcript (${filteredTranscript.length})` },
            { id: 'facts', label: `Facts (${filteredFacts.length})` },
            { id: 'hypotheses', label: `Hypotheses (${filteredHypotheses.length})` },
            { id: 'actions', label: `Actions (${filteredActions.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'transcript' | 'facts' | 'hypotheses' | 'actions')}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-white text-black' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Transcript Column */}
          {(activeTab === 'all' || activeTab === 'transcript') && (
            <section className={activeTab === 'transcript' ? 'lg:col-span-2' : ''}>
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-6 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Raw Transcript
              </h2>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-4 max-h-[800px] overflow-y-auto custom-scroll">
                {filteredTranscript.length > 0 ? filteredTranscript.map((t, i) => (
                  <div key={i} className="flex gap-4 text-sm font-light">
                    <span className="text-white/30 font-mono text-xs mt-0.5 min-w-[80px]">{t.timestamp}</span>
                    <span className="text-blue-400 font-mono text-xs uppercase mt-0.5 min-w-[100px]">[{t.speaker}]</span>
                    <span className="text-white/90 leading-relaxed">{t.text}</span>
                  </div>
                )) : (
                  <div className="text-white/30 text-sm italic py-8 text-center">No transcript intercepts found.</div>
                )}
              </div>
            </section>
          )}

          {/* Intelligence Column */}
          {(activeTab === 'all' || activeTab !== 'transcript') && (
            <div className={`space-y-8 ${activeTab !== 'all' ? 'lg:col-span-2' : ''}`}>
              
              {(activeTab === 'all' || activeTab === 'facts') && (
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-green-500/70 mb-6 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Verified Facts
                  </h2>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scroll pr-4">
                    {filteredFacts.length > 0 ? filteredFacts.map((f, i) => (
                      <div key={i} className="bg-white/5 border-l border-green-500/50 p-4 rounded-r-xl">
                        <div className="text-green-400 font-mono text-[10px] mb-2 uppercase">Identified by {f.speaker}</div>
                        <div className="text-white/90 text-sm font-light leading-relaxed">{f.statement}</div>
                      </div>
                    )) : (
                      <div className="text-white/30 text-sm italic border border-white/5 rounded-xl p-6 text-center">No facts found.</div>
                    )}
                  </div>
                </section>
              )}

              {(activeTab === 'all' || activeTab === 'hypotheses') && (
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-blue-500/70 mb-6 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Active Hypotheses
                  </h2>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scroll pr-4">
                    {filteredHypotheses.length > 0 ? filteredHypotheses.map((h, i) => (
                      <div key={i} className="bg-white/5 border-l border-blue-500/50 p-4 rounded-r-xl">
                        <div className="text-blue-400 font-mono text-[10px] mb-2 uppercase">Proposed by {h.speaker}</div>
                        <div className="text-white/90 text-sm font-light leading-relaxed">{h.statement}</div>
                      </div>
                    )) : (
                      <div className="text-white/30 text-sm italic border border-white/5 rounded-xl p-6 text-center">No hypotheses found.</div>
                    )}
                  </div>
                </section>
              )}

              {(activeTab === 'all' || activeTab === 'actions') && (
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-white/70 mb-6 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Decisions & Actions
                  </h2>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scroll pr-4">
                    {filteredActions.length > 0 ? filteredActions.map((a, i) => (
                      <div key={i} className="bg-white/5 border-l border-white/30 p-4 rounded-r-xl flex items-start gap-4">
                        <div className="bg-white/10 text-white/60 font-mono text-[10px] uppercase px-2 py-1 rounded whitespace-nowrap">
                          {a.owner || 'UNASSIGNED'}
                        </div>
                        <div className="text-white/90 text-sm font-light leading-relaxed mt-0.5">{a.description}</div>
                      </div>
                    )) : (
                      <div className="text-white/30 text-sm italic border border-white/5 rounded-xl p-6 text-center">No actions found.</div>
                    )}
                  </div>
                </section>
              )}

            </div>
          )}

        </div>
      </div>
    </main>
  );
}
