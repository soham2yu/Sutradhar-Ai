"use client";

import { useState, useRef, useEffect } from 'react';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';
import { useAIEvents } from '@/hooks/useAIEvents';
import { useAgoraSession } from '@/hooks/useAgoraSession';
import dynamic from 'next/dynamic';
import IntelligenceDashboard from '@/components/IntelligenceDashboard';
import ParticleTextOverlay from '@/components/ParticleTextOverlay';
import AIChatbox from '@/components/AIChatbox';
import { Square, Pause, Play, Users, LogOut, User, Activity } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import Link from 'next/link';

const OrbScene = dynamic(() => import('@/components/ParticleOrb/OrbScene'), { ssr: false });

export default function Home() {
  const searchParams = useSearchParams();
  const urlId = searchParams.get('id');
  
  const [appPhase, setAppPhase] = useState<'LANDING' | 'DASHBOARD'>('LANDING');
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(urlId);
  const [roomState, setRoomState] = useState<'IDLE' | 'LISTENING' | 'PAUSED'>('IDLE');
  const [isAgoraAILoading, setIsAgoraAILoading] = useState(false);

  const summonAgoraAI = async () => {
    setIsAgoraAILoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${backendUrl}/api/agora/start-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel_name: activeIncidentId })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        const errMsg = data.error || data.detail || JSON.stringify(data);
        alert('Failed to summon Agora AI: ' + errMsg);
      } else {
        alert('Agora Conversational AI has joined the channel!');
      }
    } catch (e) {
      alert('Error summoning Agora AI');
    }
    setIsAgoraAILoading(false);
  };
  
  const [enableTextIllusion, setEnableTextIllusion] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showGlobalLog, setShowGlobalLog] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isAudioExpanded, setIsAudioExpanded] = useState(false);
  const [audioSearch, setAudioSearch] = useState('');
  const { user, loading, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false);

  // Auto-join logic if URL ID is present
  useEffect(() => {
    if (urlId && !loading) {
      if (!user) {
        setShowAuthModal(true);
      } else if (!hasJoined) {
        setHasJoined(true);
        setAppPhase('DASHBOARD');
        setRoomState('LISTENING');
        // Silent join intercept
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            incident_id: urlId,
            transcript: [{
              speaker: user.displayName || user.email?.split('@')[0] || "Operator",
              timestamp: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
              text: "joined the session"
            }]
          })
        }).catch(() => {});
      }
    }
  }, [urlId, user, loading, hasJoined]);

  // Auth enforcement for anything other than LANDING
  useEffect(() => {
    if (!loading && !user && appPhase !== 'LANDING') {
      setShowAuthModal(true);
    }
  }, [user, loading, appPhase]);

  useEffect(() => {
    if (activeIncidentId && typeof window !== 'undefined') {
      setIsAdmin(localStorage.getItem(`admin_for_${activeIncidentId}`) === 'true');
    }
  }, [activeIncidentId]);
  
  // Visual audio bouncing
  const { amplitude } = useAudioAnalyzer(roomState === 'LISTENING');
  
  // Agora session for Voice transmission + Local STT
  useAgoraSession({
    isActive: roomState === 'LISTENING',
    channelName: activeIncidentId || '',
    onSentenceComplete: async (text) => {
      if (!activeIncidentId || !user) return;
      
      const entry = {
        speaker: user.displayName || user.email?.split('@')[0] || "Operator",
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        text
      };

      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            incident_id: activeIncidentId,
            transcript: [entry] 
          })
        });
      } catch (e) {
        console.error("Failed to send transcript", e);
      }
    }
  });

  // Connect to the FastAPI backend using the selected incident ID
  const { state: aiData } = useAIEvents(activeIncidentId || '', roomState !== 'IDLE');
  
  // Derived state for Orb
  const orbState = roomState === 'IDLE' ? 0 : (roomState === 'PAUSED' ? 3 : 2);

  const uiRef = useRef<HTMLDivElement>(null);

  const handleToggleParticleText = async () => {
    if (!activeIncidentId) return;
    const newVal = !(aiData?.is_particle_text_enabled ?? enableTextIllusion);
    setEnableTextIllusion(newVal); // optimistic
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/incidents/${activeIncidentId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_particle_text_enabled: newVal })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const togglePause = () => {
    if (roomState === 'LISTENING') setRoomState('PAUSED');
    else setRoomState('LISTENING');
  };

  const stopSession = () => {
    setRoomState('IDLE');
    window.location.href = '/'; 
  };

  const filteredTranscript = aiData?.transcript?.filter(t => t.text !== 'joined the session' && t.text !== 'left the session') || [];
  const latestTranscriptText = filteredTranscript.length > 0
    ? filteredTranscript[filteredTranscript.length - 1].text
    : "";

  const [displayText, setDisplayText] = useState("");
  const [showParticleText, setShowParticleText] = useState(true);
  const [activeTextSource, setActiveTextSource] = useState<'NONE' | 'USER' | 'AI'>('NONE');
  const isNormalEnabled = aiData?.is_particle_text_enabled ?? enableTextIllusion;

  // Update displayed text when transcript changes
  useEffect(() => {
    if (latestTranscriptText && isNormalEnabled) {
      setDisplayText(latestTranscriptText);
      setActiveTextSource('USER');
    }
  }, [latestTranscriptText, isNormalEnabled]);

  // Handle AI Response Text-To-Speech and Display
  useEffect(() => {
    if (aiData?.ai_response) {
      const responseText = aiData.ai_response;
      const audio = new Audio(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/tts?text=${encodeURIComponent(responseText)}`);
      
      let subtitleInterval: NodeJS.Timeout;

      let animationFrameId: number;

      // Synchronize Particle Text using full sentences to allow particles to assemble
      if (showParticleText) {
        // Split by punctuation to create sentence chunks, fallback to whole text if no punctuation
        const sentences = responseText.match(/[^.!?]+[.!?]+/g) || [responseText];
        const totalChars = responseText.length;
        
        let lastSentence = "";

        const syncSubtitles = () => {
          if (audio.duration) {
            const progress = audio.currentTime / audio.duration;
            const targetCharCount = progress * totalChars;
            
            // Find which sentence we are currently speaking based on character progression
            let charAccumulator = 0;
            let currentSentence = sentences[0];
            for (const sentence of sentences) {
              charAccumulator += sentence.length;
              if (targetCharCount <= charAccumulator) {
                currentSentence = sentence;
                break;
              }
            }
            
            // Only update state if the sentence changed to prevent React re-renders
            if (currentSentence !== lastSentence) {
              lastSentence = currentSentence;
              setDisplayText(currentSentence.trim());
              setActiveTextSource('AI');
            }
          }
          
          if (!audio.paused && !audio.ended) {
            animationFrameId = requestAnimationFrame(syncSubtitles);
          }
        };

        audio.onplay = () => {
          animationFrameId = requestAnimationFrame(syncSubtitles);
        };
        
        audio.onended = () => {
          setTimeout(() => setDisplayText(""), 2000);
        };
      }

      audio.play().catch(e => console.error("Audio playback failed", e));

      return () => {
        if (subtitleInterval) clearInterval(subtitleInterval);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        audio.pause();
      };
    }
  }, [aiData?.ai_response, showParticleText]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black font-sans selection:bg-white selection:text-black">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          0% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}} />

      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
        <OrbScene audioAmplitude={amplitude} aiState={orbState} isTextVisible={isTextVisible} />
      </div>

      {/* Particle Text Overlay — solid readable text with particle illusion */}
      {appPhase === 'DASHBOARD' && (
        <ParticleTextOverlay
          text={displayText}
          enabled={
            (isNormalEnabled && activeTextSource === 'USER') || 
            (showParticleText && activeTextSource === 'AI')
          }
          onVisibilityChange={setIsTextVisible}
        />
      )}

      {appPhase === 'LANDING' && (
        <div className="absolute inset-0 z-10 overflow-y-auto custom-scroll pointer-events-auto scroll-smooth">
          
          {/* SECTION 1: HERO */}
          <div className="min-h-screen w-full flex flex-col relative z-10">
            
            {/* Cinematic Readability Overlays */}
            
            <div className="absolute top-1/2 left-1/4 -translate-x-1/4 -translate-y-1/2 w-[800px] h-[6000px] bg-black/30 blur-[120px] rounded-full pointer-events-none z-0" />

            {/* Navigation */}
            <nav className="w-full flex justify-between items-center p-8 md:px-16 animate-fade-in relative z-10" style={{animationDelay: '0.5s'}}>
              <div className="text-white text-xs font-bold tracking-[0.3em] flex items-center gap-4">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                SUTRADHAR
              </div>
              <div className="flex items-center gap-12 text-white/50 text-[10px] font-medium tracking-[0.2em] uppercase hidden md:flex">
                <a href="/manifesto" className="hover:text-white transition-colors">Manifesto</a>
                <a href="/architecture" className="hover:text-white transition-colors">Architecture</a>
                {user ? (
                  <button onClick={logout} className="hover:text-white transition-colors flex items-center gap-2">
                    <LogOut className="w-3 h-3" /> Logout
                  </button>
                ) : (
                  <button onClick={() => setShowAuthModal(true)} className="hover:text-white transition-colors flex items-center gap-2">
                    <User className="w-3 h-3" /> Login
                  </button>
                )}
              </div>
            </nav>

            {/* Hero Content */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 relative z-10">
              <h1 className="text-white font-black leading-[0.8] tracking-[-0.04em] uppercase" style={{ fontSize: 'clamp(4rem, 14vw, 10rem)' }}>
                <div className="overflow-hidden pb-4"><div className="animate-slide-up" style={{animationDelay: '0.1s'}}>AUTONOMOUS</div></div>
                <div className="overflow-hidden pb-4"><div className="animate-slide-up" style={{animationDelay: '0.2s'}}>INTELLIGENCE<span className="text-blue-100">.</span></div></div>
              </h1>
              <p className="text-white/60 max-w-2xl mt-8 text-sm md:text-base leading-relaxed tracking-wide animate-fade-in" style={{animationDelay: '0.5s'}}>
                The AI copilot for high-stakes incident response. Sutradhar joins your war rooms, perfectly segregates chaotic multi-topic conversations, extracts critical facts, and summons conversational AI directly into the grid.
              </p>
              
              <div className="mt-12 ml-2 animate-fade-in" style={{animationDelay: '0.8s'}}>
                <a 
                  href="/dashboard"
                  className="inline-block group relative overflow-hidden bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] px-12 py-5 rounded-full hover:scale-105 transition-all duration-500"
                >
                  <span className="relative z-10">Initialize Platform</span>
                  <div className="absolute inset-0 h-full w-0 bg-blue-500 transition-all duration-500 ease-out group-hover:w-full z-0 group-hover:bg-blue-500"></div>
                </a>
              </div>
            </div>
            
            <div className="absolute bottom-10 left-8 md:left-16 flex items-center gap-16 text-white/30 text-[10px] font-mono tracking-[0.2em] animate-fade-in z-10" style={{animationDelay: '1.2s'}}>
              <div>V2.0.0 // PRODUCTION</div>
              <div className="hidden md:block">STATUS: OPTIMAL</div>
            </div>
            
            {/* Scroll Indicator */}
            <div className="absolute bottom-10 right-8 md:right-16 flex flex-col items-center gap-2 animate-fade-in z-10" style={{animationDelay: '2s'}}>
              <div className="text-white/30 text-[8px] tracking-[0.3em] uppercase rotate-90 origin-right mb-8">Scroll</div>
              <div className="w-px h-16 bg-gradient-to-b from-white/30 to-transparent"></div>
            </div>
          </div>

          {/* SECTION 2: THE NEURAL ENGINE */}
          <div className="min-h-screen w-full flex items-center px-8 md:px-16 lg:px-24 relative">
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-white/30 font-mono text-xs tracking-[0.3em] uppercase mb-4 flex items-center gap-3">
                  <span className="w-8 h-px bg-white/30"></span> System Architecture
                </h2>
                <h3 className="text-white text-4xl md:text-6xl font-bold tracking-tight mb-8">
                  Flawless Semantic <br/><span className="text-blue-400">Segregation.</span>
                </h3>
                <p className="text-white/50 text-sm md:text-base leading-relaxed mb-8">
                  Standard bots summarize entire meetings into one block of text. Sutradhar is different. It streams live audio data through a custom Gemini 3.5 pipeline, dynamically separating simultaneous conversations.
                </p>
                <p className="text-white/50 text-sm md:text-base leading-relaxed">
                  If 10 engineers are talking over each other about a database crash, a security breach, and lunch plans—Sutradhar ignores the lunch, and perfectly extracts the Risks, Facts, and Actions for both incidents independently.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* CARD 1: FACTS */}
                <div className="group relative bg-white/5 backdrop-blur-xl border border-white/30 rounded-3xl p-6 aspect-square flex flex-col justify-end hover:bg-white/10 transition-colors overflow-hidden">
                  <div className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-[150%] h-[150%] animate-[spin_60s_linear_infinite]">
                      <defs>
                        <linearGradient id="grad-green" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#166534" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="50" r="30" fill="none" stroke="url(#grad-green)" strokeWidth="0.5" strokeDasharray="2, 4" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="url(#grad-green)" strokeWidth="0.2" />
                      <path d="M20,50 Q35,20 50,50 T80,50" fill="none" stroke="url(#grad-green)" strokeWidth="1" />
                      <path d="M50,20 Q20,35 50,50 T50,80" fill="none" stroke="url(#grad-green)" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="2" fill="#4ade80" />
                      <circle cx="35" cy="35" r="1.5" fill="#4ade80" />
                      <circle cx="65" cy="65" r="1.5" fill="#4ade80" />
                      <circle cx="20" cy="50" r="1" fill="#4ade80" />
                      <circle cx="80" cy="50" r="1" fill="#4ade80" />
                    </svg>
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-green-400 font-mono text-xs uppercase mb-2">Extraction</h4>
                    <div className="text-white text-xl font-medium tracking-wide">Verified Facts</div>
                  </div>
                </div>

                {/* CARD 2: RISKS */}
                <div className="group relative bg-white/5 backdrop-blur-xl border border-white/30 rounded-3xl p-6 aspect-square flex flex-col justify-end hover:bg-white/10 transition-colors translate-y-8 overflow-hidden">
                  <div className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-[120%] h-[120%] animate-pulse">
                      <defs>
                        <radialGradient id="grad-red" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#f87171" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      <path d="M10,50 L30,50 L40,20 L60,80 L70,50 L90,50" fill="none" stroke="#f87171" strokeWidth="1" strokeLinejoin="round" />
                      <path d="M10,60 L35,60 L45,30 L55,90 L65,60 L90,60" fill="none" stroke="#f87171" strokeWidth="0.3" strokeLinejoin="round" opacity="0.5" />
                      <circle cx="50" cy="50" r="40" fill="url(#grad-red)" />
                    </svg>
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-red-400 font-mono text-xs uppercase mb-2">Detection</h4>
                    <div className="text-white text-xl font-medium tracking-wide">Critical Risks</div>
                  </div>
                </div>

                {/* CARD 3: ACTIONS */}
                <div className="group relative bg-white/5 backdrop-blur-xl border border-white/30 rounded-3xl p-6 aspect-square flex flex-col justify-end hover:bg-white/10 transition-colors overflow-hidden">
                  <div className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-[140%] h-[140%] animate-[spin_40s_linear_infinite_reverse]">
                      <defs>
                        <linearGradient id="grad-blue" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>
                      <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="url(#grad-blue)" strokeWidth="0.5" />
                      <polygon points="50,20 75,35 75,65 50,80 25,65 25,35" fill="none" stroke="url(#grad-blue)" strokeWidth="1" />
                      <line x1="50" y1="10" x2="50" y2="90" stroke="url(#grad-blue)" strokeWidth="0.2" />
                      <line x1="10" y1="30" x2="90" y2="70" stroke="url(#grad-blue)" strokeWidth="0.2" />
                      <line x1="10" y1="70" x2="90" y2="30" stroke="url(#grad-blue)" strokeWidth="0.2" />
                      <circle cx="50" cy="50" r="8" fill="none" stroke="#60a5fa" strokeWidth="1" />
                    </svg>
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-blue-400 font-mono text-xs uppercase mb-2">Resolution</h4>
                    <div className="text-white text-xl font-medium tracking-wide">Action Items</div>
                  </div>
                </div>

                {/* CARD 4: TIMELINE */}
                <div className="group relative bg-white/5 backdrop-blur-xl border border-white/30 rounded-3xl p-6 aspect-square flex flex-col justify-end hover:bg-white/10 transition-colors translate-y-8 overflow-hidden">
                  <div className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-[130%] h-[130%]">
                      <defs>
                        <linearGradient id="grad-purple" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.1" />
                          <stop offset="50%" stopColor="#c084fc" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#581c87" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>
                      <path d="M20,0 C40,40 20,60 40,100" fill="none" stroke="url(#grad-purple)" strokeWidth="0.5" />
                      <path d="M40,0 C60,40 40,60 60,100" fill="none" stroke="url(#grad-purple)" strokeWidth="1" />
                      <path d="M60,0 C80,40 60,60 80,100" fill="none" stroke="url(#grad-purple)" strokeWidth="0.5" />
                      <circle cx="48" cy="50" r="3" fill="#c084fc" />
                      <circle cx="52" cy="70" r="2" fill="#c084fc" />
                      <circle cx="48" cy="30" r="2" fill="#c084fc" />
                    </svg>
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-purple-400 font-mono text-xs uppercase mb-2">Chronology</h4>
                    <div className="text-white text-xl font-medium tracking-wide">Event Timeline</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: VOICE AI */}
          <div className="min-h-screen w-full flex items-center px-8 md:px-16 lg:px-24 relative">
            <div className="w-full max-w-7xl mx-auto flex flex-col items-center text-center">
              <h3 className="text-white text-5xl md:text-7xl font-black tracking-tighter mb-8 max-w-4xl">
                MEET <span className="text-blue-500">SUTRA.</span>
              </h3>
              <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-16">
                Don't just read the dashboard. Click <span className="text-white font-mono bg-white/10 px-2 py-1 rounded">Summon AI</span> and Sutra will join your Google Meet voice channel instantly. Ask her questions out loud, and watch as her neural voice renders perfectly synced particle text across your screen.
              </p>
              
              <a 
                href="/dashboard"
                className="inline-block group relative overflow-hidden bg-transparent border border-white/30 text-white font-bold uppercase tracking-[0.2em] text-[10px] px-16 py-6 rounded-full hover:border-white transition-all duration-500"
              >
                <span className="relative z-10">Deploy to War Room</span>
                <div className="absolute inset-0 h-full w-0 bg-white transition-all duration-500 ease-out group-hover:w-full z-0 group-hover:bg-white mix-blend-difference"></div>
              </a>
            </div>
          </div>

          {showAuthModal && <AuthModal onCancel={() => {
            setShowAuthModal(false);
            if (!user && appPhase !== 'LANDING') {
              setAppPhase('LANDING');
              setActiveIncidentId(null);
              window.history.pushState({}, '', '/');
            }
          }} />}
        </div>
      )}


      {/* DASHBOARD UI Layer */}
      {appPhase === 'DASHBOARD' && (
        <div ref={uiRef} className="absolute inset-0 z-10 pointer-events-none flex flex-col animate-fade-in" style={{animationDelay: '0s'}}>
          
          {/* Top Header */}
          <div className="w-full flex justify-between items-start p-8 md:px-12 pointer-events-auto">
            {/* Left Section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-6">
                <div className="text-white text-xs font-bold tracking-[0.3em] flex items-center gap-4">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  SUTRADHAR {activeIncidentId && <span className="text-white/50"> // {activeIncidentId}</span>}
                </div>
              </div>
              <Link 
                href="/architecture"
                className="text-left w-max text-[8px] uppercase tracking-[0.3em] font-bold text-white/30 hover:text-white transition-colors"
              >
                View Complete Architecture Log
              </Link>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center gap-6">
              {user ? (
                <>
                  <Link 
                    href="/dashboard"
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                  >
                    <Activity className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Dashboard</span>
                  </Link>
                  <span className="text-white/30 text-[10px] tracking-widest uppercase">|</span>
                  <span className="text-white/50 text-[10px] tracking-widest uppercase">
                    {user.email?.split('@')[0]}
                  </span>
                  <button 
                    onClick={logout}
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Logout</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Sign In</span>
                </button>
              )}
            </div>
            
            {roomState !== 'IDLE' && (
              <div className="flex flex-col items-end gap-4">
                <div className="flex items-center gap-8 bg-black/40 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md">
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    {roomState === 'LISTENING' ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    )}
                    <span className="text-white/70 text-[10px] tracking-[0.2em] uppercase font-bold">
                      {roomState === 'LISTENING' ? 'Live' : 'Paused'}
                    </span>
                  </div>
                  
                  <div className="w-px h-3 bg-white/10" />

                  {/* Participants */}
                  <div 
                    className="flex items-center gap-2 cursor-pointer group relative"
                    onMouseEnter={() => setShowParticipants(true)}
                    onMouseLeave={() => setShowParticipants(false)}
                  >
                    <Users className="w-3 h-3 text-white/40 group-hover:text-white transition-colors" />
                    <span className="text-white text-[10px] tracking-[0.2em] uppercase font-mono font-bold">
                      {aiData?.participants?.length || 1}
                    </span>

                    {showParticipants && aiData?.participants && (
                      <div className="absolute top-full right-0 mt-4 bg-black/90 border border-white/10 rounded-xl p-5 min-w-[240px] shadow-2xl backdrop-blur-xl">
                        <div className="text-[9px] text-white/30 uppercase tracking-[0.3em] mb-4 pb-3 border-b border-white/5 font-bold">Active Connections</div>
                        <div className="space-y-4">
                          {aiData.participants.map((p, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-[10px] font-bold uppercase">
                                {p.charAt(0)}
                              </div>
                              <span className="text-xs text-white/80 font-medium tracking-wide uppercase">{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-px h-3 bg-white/10" />
                  
                  {/* Share Code */}
                  <div className="flex items-center gap-2 cursor-pointer group" onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Room link copied to clipboard!');
                  }} title="Copy Room Link">
                    <span className="text-white/30 text-[10px] tracking-[0.2em] uppercase font-bold">Code:</span>
                    <span className="text-white/80 text-[10px] tracking-[0.2em] uppercase font-mono bg-white/5 px-2 py-1 rounded group-hover:bg-white group-hover:text-black transition-all">
                      {activeIncidentId}
                    </span>
                  </div>

                  {isAdmin && (
                    <>
                      <div className="w-px h-3 bg-white/10" />
                      <div className="flex items-center gap-2 cursor-pointer group" onClick={handleToggleParticleText} title="Toggle Particle Text">
                        <span className="text-white/30 text-[10px] tracking-[0.2em] uppercase font-bold">FX:</span>
                        <span className={`text-[10px] tracking-[0.2em] uppercase font-mono px-2 py-1 rounded transition-all ${
                          (aiData?.is_particle_text_enabled ?? enableTextIllusion) ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-white/5 text-white/50 border border-transparent hover:bg-white/10'
                        }`}>
                          {(aiData?.is_particle_text_enabled ?? enableTextIllusion) ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Controls */}
                <div className="flex gap-2 items-center">
                  <button 
                    onClick={summonAgoraAI} 
                    disabled={isAgoraAILoading}
                    className="px-4 py-2 bg-blue-600/40 hover:bg-blue-600/80 rounded-full border border-blue-500/50 text-white/90 text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer z-50 backdrop-blur-md whitespace-nowrap"
                    title="Summon Agora Conversational AI Agent"
                  >
                    {isAgoraAILoading ? 'Summoning...' : 'Summon Agora AI'}
                  </button>
                  <div className="w-px h-6 bg-white/10 mx-2" />
                  <button onClick={togglePause} className="p-3 bg-black/40 hover:bg-white/10 rounded-full border border-white/10 text-white/70 transition-all cursor-pointer z-50 backdrop-blur-md">
                    {roomState === 'LISTENING' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </button>
                  <button onClick={stopSession} className="p-3 bg-black/40 hover:bg-red-500/20 rounded-full border border-white/10 text-white/70 hover:text-red-400 transition-all cursor-pointer z-50 backdrop-blur-md">
                    <Square className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 flex px-8 md:px-12 pb-12 relative">
            <div className="w-1/3 min-w-[320px] h-full flex flex-col justify-end pb-8 pointer-events-auto">
              
              {/* Transcript */}
              {roomState !== 'IDLE' && (
                <div className={`transition-all duration-500 ease-out flex flex-col bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl ${
                  isAudioExpanded 
                    ? 'fixed inset-y-8 left-8 w-[calc(50vw-2rem)] z-50 h-[calc(100vh-4rem)]' 
                    : 'w-full max-w-md h-32 cursor-pointer hover:border-white/30'
                }`}
                onClick={() => !isAudioExpanded && setIsAudioExpanded(true)}
                >
                  <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-white/50 text-[10px] tracking-[0.3em] uppercase font-bold">Audio Stream</span>
                    </div>
                    {isAudioExpanded && (
                      <button onClick={(e) => { e.stopPropagation(); setIsAudioExpanded(false); }} className="text-white/40 hover:text-white text-sm px-2 py-1 bg-white/5 rounded">MINIMIZE &times;</button>
                    )}
                  </div>
                  
                  {isAudioExpanded && (
                    <div className="p-4 border-b border-white/5 bg-black/40">
                      <input 
                        type="text" 
                        placeholder="Search intercepts..." 
                        value={audioSearch}
                        onChange={e => setAudioSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-xs focus:outline-none focus:border-white/30"
                      />
                    </div>
                  )}

                  <div className={`flex-1 p-5 overflow-y-auto custom-scroll flex flex-col-reverse ${isAudioExpanded ? 'space-y-6' : 'space-y-2'}`}>
                    {filteredTranscript.length > 0 ? (
                      [...filteredTranscript]
                        .filter(t => !audioSearch || t.text.toLowerCase().includes(audioSearch.toLowerCase()) || t.speaker.toLowerCase().includes(audioSearch.toLowerCase()))
                        .reverse().map((t, i) => (
                        <div key={i} className="text-sm">
                          <span className="text-white/40 font-mono text-xs uppercase tracking-wider mr-3">{t.speaker}</span>
                          <span className={`leading-relaxed font-light ${isAudioExpanded ? 'text-white/90 text-sm' : 'text-white/70 text-xs truncate block'}`}>{t.text}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-white/20 text-xs text-center font-light mt-4 tracking-wide">Awaiting voice transmission...</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 w-full pointer-events-auto">
              <IntelligenceDashboard state={aiData} />
            </div>
          </div>
          
          {roomState !== 'IDLE' && activeIncidentId && (
            <AIChatbox 
              incidentId={activeIncidentId} 
              aiResponse={aiData?.ai_response} 
              showParticleText={showParticleText}
              onToggleParticleText={() => {
                setShowParticleText(!showParticleText);
                if (showParticleText) setDisplayText(""); // Clear it if turning off
              }}
            />
          )}
        </div>
        )}

        {/* Global Log Modal */}
        {showGlobalLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto bg-black/80 backdrop-blur-2xl p-8 animate-fade-in">
            <div className="bg-black border border-white/10 w-full max-w-5xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
              <div className="flex justify-between items-center p-8 border-b border-white/5">
                <h2 className="text-white text-xl font-light tracking-widest uppercase">Global Log Archive</h2>
                <button onClick={() => setShowGlobalLog(false)} className="text-white/50 hover:text-white text-2xl leading-none">&times;</button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scroll">
                
                {/* Transcripts */}
                <section>
                  <h3 className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.4em] mb-6">Raw Intercepts</h3>
                  <div className="space-y-4 bg-white/5 p-6 rounded-xl border border-white/5">
                    {aiData?.transcript?.map((t, i) => (
                      <div key={i} className="flex gap-4 text-xs font-mono">
                        <span className="text-white/40">{t.timestamp}</span>
                        <span className="text-blue-400">[{t.speaker}]</span>
                        <span className="text-white/80">{t.text}</span>
                      </div>
                    ))}
                    {!aiData?.transcript?.length && <div className="text-white/30 text-xs">No intercepts recorded.</div>}
                  </div>
                </section>

                {/* Facts */}
                <section>
                  <h3 className="text-[10px] text-green-500 font-bold uppercase tracking-[0.4em] mb-6">Verified Axioms</h3>
                  <div className="space-y-4 bg-white/5 p-6 rounded-xl border border-white/5">
                    {aiData?.topics?.flatMap(t => t.facts).map((f, i) => (
                      <div key={i} className="text-sm text-white/80 border-l border-green-500/50 pl-4 py-1">
                        <span className="text-green-400 font-mono text-[10px] mr-3">[{f.speaker}]</span>
                        {f.statement}
                      </div>
                    ))}
                    {!aiData?.topics?.flatMap(t => t.facts).length && <div className="text-white/30 text-xs">No axioms established.</div>}
                  </div>
                </section>

                {/* Hypotheses */}
                <section>
                  <h3 className="text-[10px] text-amber-500 font-bold uppercase tracking-[0.4em] mb-6">Active Postulations</h3>
                  <div className="space-y-4 bg-white/5 p-6 rounded-xl border border-white/5">
                    {aiData?.topics?.flatMap(t => t.hypotheses).map((h, i) => (
                      <div key={i} className="text-sm text-white/80 border-l border-amber-500/50 pl-4 py-1">
                        <span className="text-amber-400 font-mono text-[10px] mr-3">[{h.speaker}]</span>
                        {h.statement}
                      </div>
                    ))}
                    {!aiData?.topics?.flatMap(t => t.hypotheses).length && <div className="text-white/30 text-xs">No postulations active.</div>}
                  </div>
                </section>
                
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

