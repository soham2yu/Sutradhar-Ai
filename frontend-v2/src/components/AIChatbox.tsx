"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";

export default function AIChatbox({ incidentId, aiResponse, showParticleText, onToggleParticleText }: { incidentId: string, aiResponse?: string, showParticleText?: boolean, onToggleParticleText?: () => void }) {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (aiResponse) {
      setMessages(prev => {
        // Prevent duplicate appending of the exact same message if React re-renders
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.role === 'ai' && lastMsg?.text === aiResponse) return prev;
        return [...prev, { role: 'ai', text: aiResponse }];
      });
    }
  }, [aiResponse]);

  const handleSend = async () => {
    if (!input.trim() || !incidentId || isSending) return;

    const userText = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsSending(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      await fetch(`${backendUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          incident_id: incidentId,
          transcript: [{
            speaker: "Operator",
            timestamp: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            text: `hey sutra, ${userText}` // Append trigger word to force AI response
          }] 
        })
      });
      // The AI response will come through the websocket and be spoken out loud, 
      // but we could also add it to the chat if we track it.
      // For now, the user gets visual and audio feedback via the main UI.
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 w-80 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 pointer-events-auto transition-all">
      <div className="p-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/70">Sutradhar AI</span>
        </div>
        <button 
          onClick={onToggleParticleText}
          className={`text-[9px] uppercase tracking-wider px-2 py-1 rounded transition-colors ${
            showParticleText ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-white/5 text-white/40 border border-white/10'
          }`}
        >
          {showParticleText ? 'Particle Text: ON' : 'Particle Text: OFF'}
        </button>
      </div>
      
      <div 
        ref={scrollRef}
        className="h-40 p-4 overflow-y-auto flex flex-col gap-3 custom-scroll"
      >
        {messages.length === 0 ? (
          <div className="text-white/30 text-[10px] text-center mt-8 uppercase tracking-widest">
            Ready for input...
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex flex-col gap-1 mb-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1.5 px-1">
                {m.role === 'ai' && <Bot className="w-3 h-3 text-blue-400" />}
                <span className="text-[9px] uppercase tracking-wider text-white/40">
                  {m.role === 'user' ? 'You' : 'Sutra'}
                </span>
              </div>
              <div className={`px-3 py-2 rounded-xl text-xs max-w-[85%] ${
                m.role === 'user' 
                  ? 'bg-blue-500/20 text-blue-100 border border-blue-500/30 rounded-br-sm' 
                  : 'bg-white/10 text-white/90 border border-white/5 rounded-bl-sm'
              }`}>
                {m.text}
              </div>
            </div>
          ))
        )}
        
        {isSending && (
          <div className="flex flex-col gap-1 items-start mb-2">
            <div className="flex items-center gap-1.5 px-1">
              <Bot className="w-3 h-3 text-blue-400 animate-pulse" />
              <span className="text-[9px] uppercase tracking-wider text-white/40">Sutra</span>
            </div>
            <div className="px-3 py-2 rounded-xl text-xs max-w-[85%] bg-white/10 text-white/50 border border-white/5 rounded-bl-sm flex gap-1">
              <span className="animate-bounce">.</span><span className="animate-bounce" style={{animationDelay: '0.2s'}}>.</span><span className="animate-bounce" style={{animationDelay: '0.4s'}}>.</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-2 border-t border-white/5 bg-black/40">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Sutradhar..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-3 pr-10 py-2 text-white text-xs focus:outline-none focus:border-white/30 transition-colors"
            disabled={isSending}
          />
          <button 
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white disabled:opacity-50 transition-colors"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
