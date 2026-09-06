"use client";

import { IncidentState, Fact, Hypothesis, Action, Risk, TimelineEvent } from '@/types';
import { useState } from 'react';
import { ShieldAlert, Clock, Activity, CheckCircle, Database } from 'lucide-react';

export default function IntelligenceDashboard({ state }: { state: IncidentState | null }) {
  const [expandedSection, setExpandedSection] = useState<'facts' | 'hypotheses' | 'actions' | 'risks' | 'timeline' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const allFacts = state?.topics?.flatMap(t => t.facts) || [];
  const allHypotheses = state?.topics?.flatMap(t => t.hypotheses) || [];
  const allActions = state?.topics?.flatMap(t => t.actions) || [];
  const allRisks = state?.risks || [];
  const allTimeline = state?.timeline || [];

  const handleExpand = (section: 'facts' | 'hypotheses' | 'actions' | 'risks' | 'timeline') => {
    setExpandedSection(section);
    setSearchQuery('');
  };

  const closeExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSection(null);
  };

  const renderExpanded = () => {
    if (!expandedSection) return null;

    let title, data, renderer;
    if (expandedSection === 'facts') {
      title = 'Verified Facts';
      data = allFacts.filter(f => !searchQuery || f.statement.toLowerCase().includes(searchQuery.toLowerCase()) || f.speaker.toLowerCase().includes(searchQuery.toLowerCase()));
      renderer = (f: Fact, i: number) => (
        <div key={i} className="text-white/80 border-l-2 border-green-500/50 pl-4 py-2 text-sm bg-white/5 pr-4 rounded-r-lg flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-mono text-[10px]">[{f.speaker}]</span>
            <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded ${f.confidence === 'verified' ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/50'}`}>{f.confidence}</span>
          </div>
          <span className="text-white">{f.statement}</span>
        </div>
      );
    } else if (expandedSection === 'hypotheses') {
      title = 'Active Hypotheses';
      data = allHypotheses.filter(h => !searchQuery || h.statement.toLowerCase().includes(searchQuery.toLowerCase()) || h.speaker.toLowerCase().includes(searchQuery.toLowerCase()));
      renderer = (h: Hypothesis, i: number) => (
        <div key={i} className="text-white/80 border-l-2 border-blue-500/50 pl-4 py-2 text-sm bg-white/5 pr-4 rounded-r-lg flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-mono text-[10px]">[{h.speaker}]</span>
            <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded ${h.status === 'supported' ? 'bg-green-500/20 text-green-300' : h.status === 'refuted' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{h.status}</span>
          </div>
          <span className="text-white">{h.statement}</span>
        </div>
      );
    } else if (expandedSection === 'actions') {
      title = 'Decisions & Actions';
      data = allActions.filter(a => !searchQuery || a.description.toLowerCase().includes(searchQuery.toLowerCase()) || (a.owner && a.owner.toLowerCase().includes(searchQuery.toLowerCase())));
      renderer = (a: Action, i: number) => (
        <div key={i} className="text-white/80 border-l-2 border-white/50 pl-4 py-2 text-sm bg-white/5 pr-4 rounded-r-lg flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-white/40 font-mono uppercase text-[9px] bg-black/40 px-2 py-0.5 rounded">{a.owner || 'UNASSIGNED'}</span>
            <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded ${a.priority === 'critical' || a.priority === 'high' ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white/50'}`}>{a.priority} Priority</span>
            <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded ${a.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}`}>{a.status}</span>
          </div>
          <span className="text-white">{a.description}</span>
        </div>
      );
    } else if (expandedSection === 'risks') {
      title = 'Global Risks';
      data = allRisks.filter(r => !searchQuery || r.description.toLowerCase().includes(searchQuery.toLowerCase()));
      renderer = (r: Risk, i: number) => (
        <div key={i} className="text-white/80 border-l-2 border-red-500/50 pl-4 py-2 text-sm bg-white/5 pr-4 rounded-r-lg flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded ${r.severity === 'critical' ? 'bg-red-500/40 text-red-200' : 'bg-orange-500/20 text-orange-300'}`}>{r.severity} Risk</span>
            <span className="text-white/40 font-mono text-[9px]">{r.status}</span>
          </div>
          <span className="text-red-100">{r.description}</span>
        </div>
      );
    } else {
      title = 'Incident Timeline';
      data = allTimeline.filter(t => !searchQuery || t.event.toLowerCase().includes(searchQuery.toLowerCase()));
      renderer = (t: TimelineEvent, i: number) => (
        <div key={i} className="text-white/80 border-l-2 border-purple-500/50 pl-4 py-2 text-sm bg-white/5 pr-4 rounded-r-lg flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-mono text-[10px]">{t.timestamp}</span>
            <span className="text-white/40 text-[9px] uppercase tracking-wider">[{t.speaker}]</span>
            <span className="bg-purple-500/20 text-purple-300 text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded">{t.event_type}</span>
          </div>
          <span className="text-white">{t.event}</span>
        </div>
      );
    }

    return (
      <div className="fixed inset-y-8 right-8 w-[calc(50vw-2rem)] bg-black/80 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in pointer-events-auto">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-white text-lg font-light tracking-widest uppercase">{title}</h2>
          <button onClick={closeExpanded} className="text-white/50 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 border-b border-white/5 bg-black/40">
          <input 
            type="text" 
            placeholder="Search records..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scroll">
          {data.length > 0 ? data.map((item: any, i: number) => renderer(item, i)) : (
            <div className="text-white/30 text-sm italic">No records match your search.</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4 items-end animate-fade-in pointer-events-auto" style={{animationDelay: '0.2s'}}>
        {/* Minimized Widget: Facts */}
        <div onClick={() => handleExpand('facts')} className="w-80 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-green-500/50 hover:bg-white/5 transition-all flex items-center justify-between group">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-white/40 text-[9px] tracking-[0.3em] uppercase font-bold group-hover:text-green-500/70 transition-colors flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Verified Facts</h2>
            <div className="text-white/60 text-[9px] uppercase mt-1 truncate">{allFacts[allFacts.length-1]?.statement || 'No facts yet'}</div>
          </div>
          <div className="text-4xl font-black text-white tracking-tighter tabular-nums">{allFacts.length.toString().padStart(2, '0')}</div>
        </div>

        {/* Minimized Widget: Hypotheses */}
        <div onClick={() => handleExpand('hypotheses')} className="w-80 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-blue-500/50 hover:bg-white/5 transition-all flex items-center justify-between group">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-white/40 text-[9px] tracking-[0.3em] uppercase font-bold group-hover:text-blue-500/70 transition-colors flex items-center gap-1.5"><Activity className="w-3 h-3" /> Hypotheses</h2>
            <div className="text-white/60 text-[9px] uppercase mt-1 truncate">{allHypotheses[allHypotheses.length-1]?.statement || 'No hypotheses yet'}</div>
          </div>
          <div className="text-4xl font-black text-white tracking-tighter tabular-nums">{allHypotheses.length.toString().padStart(2, '0')}</div>
        </div>

        {/* Minimized Widget: Actions */}
        <div onClick={() => handleExpand('actions')} className="w-80 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-white/50 hover:bg-white/5 transition-all flex items-center justify-between group">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-white/40 text-[9px] tracking-[0.3em] uppercase font-bold group-hover:text-white/70 transition-colors flex items-center gap-1.5"><Database className="w-3 h-3" /> Actions</h2>
            <div className="text-white/60 text-[9px] uppercase mt-1 truncate">{allActions[allActions.length-1]?.description || 'No actions yet'}</div>
          </div>
          <div className="text-4xl font-black text-white tracking-tighter tabular-nums">{allActions.length.toString().padStart(2, '0')}</div>
        </div>

        {/* Minimized Widget: Risks */}
        <div onClick={() => handleExpand('risks')} className="w-80 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-red-500/50 hover:bg-white/5 transition-all flex items-center justify-between group">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-white/40 text-[9px] tracking-[0.3em] uppercase font-bold group-hover:text-red-500/70 transition-colors flex items-center gap-1.5"><ShieldAlert className="w-3 h-3" /> Critical Risks</h2>
            <div className="text-white/60 text-[9px] uppercase mt-1 truncate">{allRisks[allRisks.length-1]?.description || 'No risks identified'}</div>
          </div>
          <div className="text-4xl font-black text-white tracking-tighter tabular-nums">{allRisks.length.toString().padStart(2, '0')}</div>
        </div>

        {/* Minimized Widget: Timeline */}
        <div onClick={() => handleExpand('timeline')} className="w-80 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all flex items-center justify-between group">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-white/40 text-[9px] tracking-[0.3em] uppercase font-bold group-hover:text-purple-500/70 transition-colors flex items-center gap-1.5"><Clock className="w-3 h-3" /> Event Timeline</h2>
            <div className="text-white/60 text-[9px] uppercase mt-1 truncate">{allTimeline[allTimeline.length-1]?.event || 'No events recorded'}</div>
          </div>
          <div className="text-4xl font-black text-white tracking-tighter tabular-nums">{allTimeline.length.toString().padStart(2, '0')}</div>
        </div>
      </div>
      
      {renderExpanded()}
    </>
  );
}
