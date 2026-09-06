"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Database, Plus, Activity, User as UserIcon, LogOut, Terminal } from 'lucide-react';
import { IncidentState } from '@/types';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<IncidentState[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [joinCode, setJoinCode] = useState('');
  const [enableTextIllusion, setEnableTextIllusion] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

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
    return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" /></div>;
  }

  if (!user) {
    return <AuthModal />;
  }

  const handleStartNew = async () => {
    setIsStarting(true);
    try {
      const newId = `S-${Math.floor(Math.random() * 10000)}`;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: newId,
          title: `Session ${new Date().toISOString().split('T')[0]}`,
          admin_id: user.uid,
          is_particle_text_enabled: enableTextIllusion
        })
      });
      if (res.ok) {
        const data = await res.json();
        const actualId = data.incident_id || newId;
        if (typeof window !== 'undefined') {
          localStorage.setItem(`admin_for_${actualId}`, 'true');
        }
        router.push(`/?id=${actualId}`);
      } else {
        const err = await res.text();
        console.error("Failed to create room:", err);
        setIsStarting(false);
        alert("Failed to initialize room. See console for details.");
      }
    } catch (e) {
      console.error(e);
      setIsStarting(false);
      alert("Network error. Is the backend running?");
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      router.push(`/?id=${joinCode.trim()}`);
    }
  };

  const displayName = user.displayName || user.email?.split('@')[0] || 'Operator';

  return (
    <main className="min-h-screen bg-[#020617] text-white font-sans relative overflow-x-hidden selection:bg-cyan-500/30">
      
      {/* --- CYBERNETIC BACKGROUND EFFECTS --- */}
      {/* 1. Animated Grid */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: 'perspective(1000px) rotateX(60deg) scale(2) translateY(-10%)',
          transformOrigin: 'top center'
        }}
      />
      
      {/* 2. Global Glows */}
      <div className="absolute top-0 left-1/4 w-[1000px] h-[400px] bg-cyan-900/20 rounded-[100%] blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-1/4 w-[800px] h-[600px] bg-indigo-900/10 rounded-[100%] blur-[150px] pointer-events-none mix-blend-screen" />

      {/* 3. Radar Sweeper (CSS animation needed in global, but we use subtle translating gradient here) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.02] to-transparent w-full h-[200%] animate-[slide-down_10s_linear_infinite] pointer-events-none" />


      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12 relative z-10">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-cyan-900/30 pb-8 animate-fade-in gap-6 relative">
          <div className="absolute bottom-0 left-0 w-32 h-px bg-gradient-to-r from-cyan-400 to-transparent" />
          
          <div className="relative">
            
            <div className="flex items-center gap-4">
              <Terminal className="w-8 h-8 text-cyan-500/80" />
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Center</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3 mt-4 text-[10px] tracking-[0.2em] uppercase font-mono text-cyan-200/40">
              <span>[ OP-ID: {user.uid.substring(0, 8)} ]</span>
              <span className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
              <span>SYS.STATUS: <span className="text-cyan-400">OPTIMAL</span></span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-4 text-[10px] tracking-widest uppercase text-white/40 font-mono">
            <Link href="/dashboard/profile" className="flex items-center gap-3 bg-[#0a1128]/80 hover:bg-[#0f172a] p-2 pr-5 rounded-full border border-cyan-900/50 hover:border-cyan-500/50 transition-all cursor-pointer backdrop-blur-xl shadow-[0_0_20px_rgba(8,145,178,0.1)] group">
              <div className="relative">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-cyan-500/30 group-hover:border-cyan-400 transition-colors" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-cyan-950 flex items-center justify-center text-cyan-400 border border-cyan-800 group-hover:border-cyan-400 transition-colors">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-cyan-400 border-2 border-[#020617] rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
              </div>
              <div className="flex flex-col items-start px-2">
                <span className="text-white font-bold truncate max-w-[120px] tracking-widest">{displayName}</span>
                <span className="text-[8px] text-cyan-500 flex items-center gap-1"><div className="w-1 h-1 bg-cyan-500 rounded-full"/> Lvl-9 Authorized</span>
              </div>
            </Link>
            <div className="flex justify-end w-full pr-4">
              <button onClick={(e) => { e.preventDefault(); logout(); }} className="text-white/30 hover:text-red-400 transition-colors p-1 flex items-center gap-2" title="Logout">
                <LogOut className="w-3 h-3" /> <span className="text-[9px]">Terminate Session</span>
              </button>
            </div>
          </div>
        </header>


        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* --- CONTROLS PANEL (LEFT) --- */}
          <div className="xl:col-span-4 space-y-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="bg-gradient-to-b from-[#081229]/90 to-[#020617]/90 border border-cyan-900/40 rounded-2xl p-8 space-y-8 relative overflow-hidden backdrop-blur-2xl shadow-[0_0_40px_rgba(8,145,178,0.05)]">
              
              {/* Glass Reflection */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <h2 className="text-lg font-bold tracking-[0.2em] uppercase mb-1 flex items-center gap-3 text-white drop-shadow-md">
                  <span className="text-cyan-500">{"//"}</span> Deploy Instance
                </h2>
                <p className="text-cyan-200/40 text-[10px] font-mono tracking-widest uppercase mb-8">Initialize Secure Sandbox</p>
                
                <div className="flex items-center justify-between mb-8 bg-[#020617]/80 p-4 rounded-xl border border-cyan-900/30">
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-cyan-500" />
                    <div className="text-[10px] text-cyan-100/70 uppercase tracking-[0.2em] font-bold">Particle FX Engine</div>
                  </div>
                  <button 
                    onClick={() => setEnableTextIllusion(!enableTextIllusion)}
                    className={`w-10 h-5 rounded-full transition-all relative shadow-inner border ${enableTextIllusion ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-white/5 border-white/10'}`}
                  >
                    <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all shadow-[0_0_10px_rgba(34,211,238,0.8)] ${enableTextIllusion ? 'left-5.5 bg-cyan-400' : 'left-1 bg-white/30 shadow-none'}`} />
                  </button>
                </div>

                <button 
                  onClick={handleStartNew}
                  disabled={isStarting}
                  className="group relative w-full overflow-hidden rounded-xl bg-[#020617] disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-center gap-3 py-4 text-white font-black tracking-[0.2em] text-[11px] uppercase z-10 border border-white/20 rounded-xl shadow-[0_0_30px_rgba(8,145,178,0.4)] group-hover:shadow-[0_0_40px_rgba(8,145,178,0.8)] transition-all">
                    {isStarting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {isStarting ? 'Deploying...' : 'Initialize Room'}
                  </div>
                </button>
              </div>

              <div className="border-t border-cyan-900/30 pt-8 relative z-10">
                <h2 className="text-lg font-bold tracking-[0.2em] uppercase mb-1 flex items-center gap-3 text-white drop-shadow-md">
                  <span className="text-blue-500">{"//"}</span> Join Instance
                </h2>
                <p className="text-cyan-200/40 text-[10px] font-mono tracking-widest uppercase mb-6">Connect to active grid</p>
                <form onSubmit={handleJoin} className="flex flex-col gap-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="ENTER ACCESS CODE (e.g. S-1234)" 
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      className="w-full bg-[#020617]/80 border border-cyan-900/50 rounded-xl px-5 py-4 text-cyan-300 text-xs font-mono uppercase tracking-[0.2em] focus:outline-none focus:border-cyan-400/80 focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all placeholder:text-cyan-900/50"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-500/50 rounded-full animate-pulse" />
                  </div>
                  <button 
                    type="submit" 
                    disabled={!joinCode.trim()} 
                    className="w-full py-4 bg-transparent hover:bg-blue-500/10 text-blue-400 border border-blue-900 hover:border-blue-400 rounded-xl transition-all font-bold text-[11px] tracking-[0.2em] uppercase disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-blue-900"
                  >
                    Establish Link
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* --- HISTORY PANEL (RIGHT) --- */}
          <div className="xl:col-span-8 space-y-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold tracking-[0.3em] uppercase text-white drop-shadow-md">
                  Operational Archive
                </h2>
                <p className="text-cyan-200/40 text-[10px] font-mono tracking-widest uppercase mt-2">Historical Database</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase font-bold text-cyan-400 bg-cyan-950/30 px-4 py-2 rounded-lg border border-cyan-900/50 shadow-[0_0_15px_rgba(8,145,178,0.1)]">
                <Database className="w-3.5 h-3.5" /> 
                {incidents.length} RECORDS FOUND
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-32">
                <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_30px_rgba(34,211,238,0.5)]" />
              </div>
            ) : incidents.length === 0 ? (
              <div className="bg-gradient-to-br from-[#081229]/50 to-[#020617]/50 border border-cyan-900/30 rounded-3xl p-16 text-center relative overflow-hidden backdrop-blur-xl group">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-1000" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-2xl bg-cyan-950/50 flex items-center justify-center mb-8 border border-cyan-800/50 shadow-[0_0_30px_rgba(8,145,178,0.15)] transform rotate-45 group-hover:rotate-0 transition-transform duration-700 ease-out">
                    <Activity className="w-10 h-10 text-cyan-500 opacity-80 -rotate-45 group-hover:rotate-0 transition-transform duration-700" />
                  </div>
                  <h3 className="text-xl tracking-[0.3em] uppercase text-white font-bold drop-shadow-md">No Records Detected</h3>
                  <p className="text-xs mt-4 text-cyan-200/40 font-mono tracking-widest max-w-md mx-auto leading-relaxed uppercase">
                    Initialize a new secure room to begin capturing intelligence and building your operational history.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {incidents.map((incident, i) => {
                  const factCount = incident.topics?.reduce((acc, t) => acc + (t.facts?.length || 0), 0) || 0;
                  const actionCount = incident.topics?.reduce((acc, t) => acc + (t.actions?.length || 0), 0) || 0;
                  const riskCount = incident.topics?.reduce((acc, t) => acc + (t.risks?.length || 0), 0) || 0;
                  
                  return (
                    <Link 
                      href={`/archive/${incident.id}`} 
                      key={incident.id} 
                      className="block group animate-fade-in outline-none" 
                      style={{animationDelay: `${0.2 + (i * 0.05)}s`}}
                    >
                      <div className="bg-gradient-to-br from-[#081229]/80 to-[#020617]/80 hover:from-[#0f1f42]/90 hover:to-[#040b1e]/90 border border-cyan-900/40 hover:border-cyan-500/50 transition-all duration-300 rounded-2xl p-6 h-full flex flex-col cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(8,145,178,0.2)] relative overflow-hidden group-focus:border-cyan-400 group-focus:ring-2 ring-cyan-500/30">
                        
                        {/* Card Glow FX */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-600/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-colors pointer-events-none" />
                        
                        {/* Decorative Top Line */}
                        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-cyan-900/50 group-hover:via-cyan-400/80 to-transparent transition-colors duration-500" />
                        
                        <div className="relative z-10 flex justify-between items-start mb-10">
                          <h2 className="text-xl font-bold tracking-[0.15em] group-hover:text-cyan-300 text-white transition-colors uppercase pr-4 drop-shadow-sm truncate">
                            {incident.title || `Session ${incident.id}`}
                          </h2>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[8px] font-mono text-cyan-200/30 tracking-widest uppercase">ID</span>
                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-900/50 px-2 py-1 rounded shadow-inner">
                              {incident.id}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-8 relative z-10">
                          <div className="bg-[#020617]/80 border border-white/5 rounded-lg p-3 flex flex-col justify-center border-l-2 border-l-green-500/50 group-hover:border-l-green-400 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-1 h-1 rounded-full bg-green-500" />
                              <span className="text-[8px] font-bold text-white/40 tracking-widest uppercase">Facts</span>
                            </div>
                            <span className="text-2xl font-mono font-light text-green-400 tracking-tight drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]">
                              {factCount.toString().padStart(2, '0')}
                            </span>
                          </div>
                          
                          <div className="bg-[#020617]/80 border border-white/5 rounded-lg p-3 flex flex-col justify-center border-l-2 border-l-blue-500/50 group-hover:border-l-blue-400 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-1 h-1 rounded-full bg-blue-500" />
                              <span className="text-[8px] font-bold text-white/40 tracking-widest uppercase">Actions</span>
                            </div>
                            <span className="text-2xl font-mono font-light text-blue-400 tracking-tight drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]">
                              {actionCount.toString().padStart(2, '0')}
                            </span>
                          </div>

                          <div className="bg-[#020617]/80 border border-white/5 rounded-lg p-3 flex flex-col justify-center border-l-2 border-l-red-500/50 group-hover:border-l-red-400 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-1 h-1 rounded-full bg-red-500" />
                              <span className="text-[8px] font-bold text-white/40 tracking-widest uppercase">Risks</span>
                            </div>
                            <span className="text-2xl font-mono font-light text-red-400 tracking-tight drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]">
                              {riskCount.toString().padStart(2, '0')}
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto flex items-center justify-between text-[9px] font-mono tracking-widest uppercase border-t border-cyan-900/30 pt-4 relative z-10">
                          <span className="text-cyan-200/40">
                            {new Date(incident.updated_at).toLocaleDateString(undefined, {
                              year: 'numeric', month: '2-digit', day: '2-digit'
                            })} // {new Date(incident.updated_at).toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit'})}
                          </span>
                          <span className="text-cyan-500 font-bold group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                            Enter Archive <ArrowLeft className="w-3 h-3 rotate-180" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Global CSS animation for the scanner sweep */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-down {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(50%); }
        }
      `}} />
    </main>
  );
}
