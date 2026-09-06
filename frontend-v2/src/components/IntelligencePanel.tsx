"use client";

import { IncidentState } from '@/types';
import { useState } from 'react';

export default function IntelligencePanel({ state }: { state: IncidentState | null }) {
  const [activeTab, setActiveTab] = useState<'FACTS' | 'HYPOTHESES' | 'ACTIONS'>('FACTS');

  if (!state) return null;

  // Aggregate from all topics
  const allFacts = state.topics.flatMap(t => t.facts);
  const allHypotheses = state.topics.flatMap(t => t.hypotheses);
  const allActions = state.topics.flatMap(t => t.actions);

  return (
    <div className="w-full max-w-5xl mx-auto backdrop-blur-xl bg-black/40 border border-white/10 rounded-t-3xl overflow-hidden pointer-events-auto">
      
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <TabButton 
          label="FACTS" 
          count={allFacts.length} 
          isActive={activeTab === 'FACTS'} 
          onClick={() => setActiveTab('FACTS')} 
        />
        <TabButton 
          label="HYPOTHESES" 
          count={allHypotheses.length} 
          isActive={activeTab === 'HYPOTHESES'} 
          onClick={() => setActiveTab('HYPOTHESES')} 
        />
        <TabButton 
          label="ACTIONS" 
          count={allActions.length} 
          isActive={activeTab === 'ACTIONS'} 
          onClick={() => setActiveTab('ACTIONS')} 
        />
      </div>

      {/* Content */}
      <div className="h-48 overflow-y-auto p-6 scroll-smooth">
        {activeTab === 'FACTS' && (
          <div className="space-y-3">
            {allFacts.length === 0 ? <EmptyState msg="Listening for facts..." /> : 
              allFacts.map((f, i) => (
                <div key={i} className="flex gap-4 items-start text-sm text-gray-300">
                  <span className="text-white/30 font-mono mt-0.5">0{i+1}</span>
                  <p className="leading-relaxed editorial-text">{f.statement}</p>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === 'HYPOTHESES' && (
          <div className="space-y-4">
            {allHypotheses.length === 0 ? <EmptyState msg="No hypotheses formed yet." /> : 
              allHypotheses.map((h, i) => (
                <div key={i} className="flex gap-4 items-start text-sm text-gray-300">
                  <span className="text-purple-400 font-mono mt-0.5">?</span>
                  <div>
                    <p className="leading-relaxed editorial-text mb-1">{h.statement}</p>
                    <span className="text-xs text-white/40 uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded-full">
                      Status: {h.status}
                    </span>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === 'ACTIONS' && (
          <div className="space-y-3">
            {allActions.length === 0 ? <EmptyState msg="No action items captured." /> : 
              allActions.map((a, i) => (
                <div key={i} className="flex gap-4 items-start text-sm text-gray-300">
                  <span className="text-blue-400 font-mono mt-0.5">→</span>
                  <div className="flex-1">
                    <p className="leading-relaxed editorial-text">{a.description}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-white/40">{a.owner || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ label, count, isActive, onClick }: { label: string, count: number, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 py-4 flex items-center justify-center gap-3 text-sm tracking-[0.15em] uppercase transition-all duration-300
        ${isActive ? 'text-white bg-white/5 border-b-2 border-white' : 'text-white/40 hover:text-white/70'}
      `}
    >
      {label}
      <span className="text-xs font-mono opacity-50">{count.toString().padStart(2, '0')}</span>
    </button>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-white/30 text-sm tracking-widest uppercase">
      {msg}
    </div>
  );
}
