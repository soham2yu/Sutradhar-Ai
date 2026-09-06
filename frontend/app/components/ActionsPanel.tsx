'use client';
import React, { useState } from 'react';
import { Action, Decision } from '@/lib/types';

interface Props {
  actions: Action[];
  decisions: Decision[];
}

export default function ActionsPanel({ actions, decisions }: Props) {
  const [syncingState, setSyncingState] = useState<Record<number, string>>({});

  const handleSync = async (idx: number, action: Action, platform: 'jira' | 'slack') => {
    setSyncingState(prev => ({ ...prev, [idx]: platform }));
    try {
      const endpoint = platform === 'jira' ? '/api/jira/sync' : '/api/slack/notify';
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${endpoint}`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_description: action.description,
          owner: action.owner,
          priority: action.priority,
          incident_id: 'current'
        })
      });
      // Simulate success briefly
      setTimeout(() => {
        setSyncingState(prev => ({ ...prev, [idx]: `${platform}-done` }));
      }, 500);
    } catch (e) {
      console.error(e);
      setSyncingState(prev => ({ ...prev, [idx]: '' }));
    }
  };

  const priorityColors: Record<string, string> = {
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  return (
    <div className="bg-incident-card border border-incident-border rounded-lg p-4 space-y-6">
      {/* Decisions Section */}
      <div>
        <div className="flex items-center mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-400">Decisions</h2>
          <span className="bg-incident-border text-incident-muted rounded-full px-2 py-0.5 text-xs ml-2">
            {decisions.length}
          </span>
        </div>
        <div className="space-y-2">
          {decisions.length === 0 ? (
            <div className="text-incident-muted text-sm italic">No decisions recorded</div>
          ) : (
            decisions.map((decision, idx) => (
              <div key={idx} className="border-b border-incident-border last:border-0 pb-2">
                <div className="flex justify-between items-start">
                  <span className="text-incident-text text-sm">{decision.statement}</span>
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] border uppercase bg-purple-500/10 text-purple-400 border-purple-500/20 whitespace-nowrap">
                    {decision.status}
                  </span>
                </div>
                <div className="text-xs text-incident-muted mt-1">
                  {decision.speaker} - {decision.timestamp}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions Section */}
      <div>
        <div className="flex items-center mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-400">Action Items</h2>
          <span className="bg-incident-border text-incident-muted rounded-full px-2 py-0.5 text-xs ml-2">
            {actions.length}
          </span>
        </div>
        <div className="space-y-3">
          {actions.length === 0 ? (
            <div className="text-incident-muted text-sm italic">No action items</div>
          ) : (
            actions.map((action, idx) => (
              <div key={idx} className="border-b border-incident-border last:border-0 pb-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-incident-text text-sm font-medium">{action.description}</span>
                  <div className="flex items-center gap-1 ml-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] border uppercase whitespace-nowrap ${priorityColors[action.priority?.toLowerCase()] || priorityColors.low}`}>
                      {action.priority || 'Normal'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] border uppercase bg-blue-500/10 text-blue-400 border-blue-500/20 whitespace-nowrap">
                      {action.status}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-incident-muted flex justify-between items-center mt-2">
                  <span>Assigned to: <span className="text-incident-text">{action.owner || 'Unassigned'}</span></span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSync(idx, action, 'jira')}
                      disabled={syncingState[idx] === 'jira' || syncingState[idx] === 'jira-done'}
                      className="px-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                    >
                      {syncingState[idx] === 'jira' ? 'Syncing...' : syncingState[idx] === 'jira-done' ? '✓ Jira' : 'Jira'}
                    </button>
                    <button 
                      onClick={() => handleSync(idx, action, 'slack')}
                      disabled={syncingState[idx] === 'slack' || syncingState[idx] === 'slack-done'}
                      className="px-2 py-0.5 rounded border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                    >
                      {syncingState[idx] === 'slack' ? 'Sending...' : syncingState[idx] === 'slack-done' ? '✓ Slack' : 'Slack'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
