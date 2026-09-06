import { useState, useEffect } from 'react';
import { Play, Square, ExternalLink, Activity, Database, CheckCircle } from 'lucide-react';
import { useWebSpeech } from './useWebSpeech';

function App() {
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<'IDLE' | 'LISTENING'>('IDLE');
  const [stats, setStats] = useState({ facts: 0, actions: 0, intercepts: 0 });
  const [isMeetTab, setIsMeetTab] = useState(false);
  const [meetTabId, setMeetTabId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab && activeTab.url && activeTab.url.includes("meet.google.com")) {
          setIsMeetTab(true);
          setMeetTabId(activeTab.id || null);
          
          chrome.tabs.query({}, (allTabs) => {
            const sutradharTab = allTabs.find(t => t.url && t.url.includes("localhost:3002"));
            if (sutradharTab && sutradharTab.url) {
              const url = new URL(sutradharTab.url);
              const id = url.searchParams.get("id");
              if (id) setIncidentId(id);
            }
          });
        }
      });
    }
  }, []);

  useWebSpeech({
    isActive: roomState === 'LISTENING' && !isMeetTab,
    onSentenceComplete: async (text) => {
      if (!incidentId || isMeetTab) return;
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
          chrome.runtime.sendMessage({
            action: "SEND_TRANSCRIPT",
            payload: {
              incident_id: incidentId,
              transcript: [{ speaker: "extension_user", timestamp: new Date().toLocaleTimeString(), text }]
            }
          });
        }
      } catch (e) { console.error(e); }
    }
  });

  const startSession = async () => {
    let activeId = incidentId;
    if (!activeId) {
      try {
        const generatedId = `E-${Math.floor(Math.random() * 10000)}`;
        await fetch(`http://localhost:8000/api/incidents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ incident_id: generatedId, title: `Meet Session ${generatedId}`, admin_id: "extension_user", is_particle_text_enabled: false })
        });
        setIncidentId(generatedId);
        activeId = generatedId;
      } catch (e) { return; }
    }

    if (isMeetTab && meetTabId && typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.sendMessage(meetTabId, { action: "START_MEET_CAPTURE", incidentId: activeId }, () => {
        if (chrome.runtime.lastError) console.error(chrome.runtime.lastError);
      });
    }
    setRoomState('LISTENING');
  };

  const stopSession = () => {
    if (isMeetTab && meetTabId && typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.sendMessage(meetTabId, { action: "STOP_MEET_CAPTURE" });
    }
    setRoomState('IDLE');
  };

  useEffect(() => {
    if (!incidentId || roomState === 'IDLE') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/incidents/${incidentId}`);
        const data = await res.json();
        const facts = data.topics?.reduce((acc: number, t: any) => acc + (t.facts?.length || 0), 0) || 0;
        const actions = data.topics?.reduce((acc: number, t: any) => acc + (t.actions?.length || 0), 0) || 0;
        setStats({ facts, actions, intercepts: data.transcript?.length || 0 });
      } catch (e) {}
    }, 2000);
    return () => clearInterval(interval);
  }, [incidentId, roomState]);

  return (
    <div className="w-full h-full flex flex-col p-6 font-sans">
      <header className="flex items-center justify-between mb-8">
        <div className="text-white text-[10px] font-bold tracking-[0.3em] flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${roomState === 'LISTENING' ? 'bg-blue-500 animate-pulse' : 'bg-white'}`} />
          SUTRADHAR {incidentId ? `// ${incidentId}` : ''}
        </div>
      </header>
      {roomState === 'IDLE' ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-fade-in">
          <div className="w-24 h-24 bg-blue-500/5 rounded-full flex items-center justify-center border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent opacity-50" />
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
          {isMeetTab && <div className="text-[10px] text-blue-400 text-center uppercase tracking-widest font-bold">Google Meet Detected</div>}
          <div className="w-full">
            <input 
              type="text" 
              placeholder="Incident ID (Optional)"
              value={incidentId || ''}
              onChange={(e) => setIncidentId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-xs text-center mb-4 focus:outline-none focus:border-blue-500/50"
            />
            <button onClick={startSession} className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all font-semibold tracking-widest text-xs uppercase flex items-center justify-center gap-2 text-white">
              <Play className="w-3 h-3" /> Connect AI to Meeting
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col animate-fade-in">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between h-24">
              <div className="text-white/40 text-[9px] uppercase tracking-widest flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500/70" /> Facts</div>
              <div className="text-3xl font-light text-white">{stats.facts.toString().padStart(2, '0')}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between h-24">
              <div className="text-white/40 text-[9px] uppercase tracking-widest flex items-center gap-1"><Database className="w-3 h-3 text-white/70" /> Actions</div>
              <div className="text-3xl font-light text-white">{stats.actions.toString().padStart(2, '0')}</div>
            </div>
          </div>
          <div className="text-center text-[10px] text-white/30 uppercase tracking-widest mb-8">
            {isMeetTab ? 'Reading Meet Captions...' : 'Microphone Active...'}
            <br />
            <span className="text-blue-400 mt-1 block">Intercepts: {stats.intercepts}</span>
          </div>
          <div className="mt-auto space-y-3">
            <a href={`http://localhost:3002/dashboard?id=${incidentId}`} target="_blank" rel="noreferrer" className="w-full py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl transition-all font-semibold tracking-widest text-[10px] uppercase flex items-center justify-center gap-2"><ExternalLink className="w-3 h-3" /> View Dashboard</a>
            <button onClick={stopSession} className="w-full py-3 bg-black/40 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/60 hover:text-red-400 rounded-xl transition-all font-semibold tracking-widest text-[10px] uppercase flex items-center justify-center gap-2"><Square className="w-3 h-3" /> Stop Session</button>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
