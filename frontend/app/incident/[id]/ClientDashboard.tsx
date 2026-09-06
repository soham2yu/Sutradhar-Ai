"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useIncident } from "@/lib/useIncident";
import { useAgoraConversation } from "@/lib/useAgoraConversation";
import { TranscriptEntry } from "@/lib/types";
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";

const rtcClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

import IncidentHeader from "@/app/components/IncidentHeader";
import VoiceControl from "@/app/components/VoiceControl";
import LiveTranscript from "@/app/components/LiveTranscript";
import FactsPanel from "@/app/components/FactsPanel";
import HypothesesPanel from "@/app/components/HypothesesPanel";
import ConflictsPanel from "@/app/components/ConflictsPanel";
import ActionsPanel from "@/app/components/ActionsPanel";
import TimelinePanel from "@/app/components/TimelinePanel";
import IncidentSummary from "@/app/components/IncidentSummary";

function DashboardContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const incidentId = decodeURIComponent(params.id as string);
  const titleParam = searchParams.get("title") || "";

  const [speakerName, setSpeakerName] = useState("Engineer");
  const [initialized, setInitialized] = useState(false);

  const { incident, isConnected, isAnalyzing, error, sendTranscript, initIncident } =
    useIncident(incidentId);

  const bufferRef = useRef<TranscriptEntry[]>([]);
  const bufferTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!initialized && incidentId) {
      initIncident(titleParam || undefined).then(() => setInitialized(true));
    }
  }, [incidentId, titleParam, initialized, initIncident]);

  const flushBuffer = useCallback(() => {
    if (bufferRef.current.length > 0) {
      const entries = [...bufferRef.current];
      bufferRef.current = [];
      sendTranscript(entries);
    }
  }, [sendTranscript]);

  const {
    isListening,
    start,
    stop,
    error: speechError,
    isSupported,
    remoteUsers,
  } = useAgoraConversation({
    incidentId,
    onSentenceComplete: (text, speaker) => {
      const entry: TranscriptEntry = {
        speaker: speaker === "agent" ? "Sutradhar AI" : speakerName,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        text,
      };

      bufferRef.current.push(entry);

      if (bufferTimerRef.current) {
        clearTimeout(bufferTimerRef.current);
      }
      bufferTimerRef.current = setTimeout(() => {
        flushBuffer();
      }, 500);
    },
  });

  const handleToggleMic = useCallback(() => {
    if (isListening) {
      stop();
      setTimeout(flushBuffer, 500);
    } else {
      start();
    }
  }, [isListening, start, stop, flushBuffer]);

  return (
    <div className="min-h-screen p-4 max-w-[1600px] mx-auto">
      <IncidentHeader
        incidentId={incidentId}
        title={incident?.title || titleParam || "Loading..."}
        status={incident?.status || "investigating"}
        severity={incident?.severity || "medium"}
        participants={["Ada", speakerName]}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
        {/* Left Column - Voice & Raw Feed */}
        <div className="lg:col-span-1 space-y-4 flex flex-col h-[calc(100vh-100px)]">
          <VoiceControl
            isListening={isListening}
            onToggle={handleToggleMic}
            speakerName={speakerName}
            onSpeakerNameChange={setSpeakerName}
          />
          {(error || speechError) && (
            <div className="text-red-500 text-sm p-2 bg-red-900/20 rounded">
              {error || speechError}
            </div>
          )}
          <LiveTranscript entries={incident?.transcript || []} />
        </div>

        {/* Center Column - Investigation Topics */}
        <div className="lg:col-span-2 space-y-6 h-[calc(100vh-100px)] overflow-y-auto pr-2">
          {(!incident?.topics || incident.topics.length === 0) && (
            <div className="text-center text-incident-muted mt-20 border border-dashed border-incident-border p-10 rounded-xl">
              <div className="text-2xl mb-2">🧠</div>
              <p>Listening for investigation topics...</p>
              <p className="text-xs mt-2 opacity-60">Sutradhar will automatically group conversations into topics.</p>
            </div>
          )}
          
          {incident?.topics?.map((topic, idx) => (
            <div key={topic.id} className="border border-incident-border rounded-xl p-4 bg-black/40 shadow-lg relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${idx % 2 === 0 ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
              <h2 className="text-xl font-bold text-white mb-1 ml-2 uppercase tracking-wide">{topic.name}</h2>
              <div className="text-xs text-incident-muted mb-4 ml-2 pb-2 border-b border-incident-border/50">
                Participants: {topic.participants.join(", ")}
              </div>
              
              <div className="space-y-4 ml-2">
                <FactsPanel facts={topic.facts || []} />
                <HypothesesPanel hypotheses={topic.hypotheses || []} />
                <ConflictsPanel conflicts={topic.conflicts || []} />
                <ActionsPanel actions={topic.actions || []} decisions={[]} />
              </div>
            </div>
          ))}
        </div>

        {/* Right Column - Summary, Decisions & Timeline */}
        <div className="lg:col-span-1 space-y-4 h-[calc(100vh-100px)] overflow-y-auto pr-2">
          <IncidentSummary 
            risks={incident?.risks || []}
            factCount={incident?.topics?.reduce((acc, t) => acc + (t.facts?.length || 0), 0) || 0}
            hypothesisCount={incident?.topics?.reduce((acc, t) => acc + (t.hypotheses?.length || 0), 0) || 0}
            conflictCount={incident?.topics?.reduce((acc, t) => acc + (t.conflicts?.length || 0), 0) || 0}
            actionCount={incident?.topics?.reduce((acc, t) => acc + (t.actions?.length || 0), 0) || 0}
          />
          <ActionsPanel actions={[]} decisions={incident?.decisions || []} />
          <TimelinePanel events={incident?.timeline || []} />
        </div>
      </div>

      {/* DEBUG PANEL */}
      <div className="fixed bottom-4 right-4 bg-black/80 text-green-400 p-4 rounded text-xs font-mono z-50 pointer-events-none">
        <div>WebRTC Connected: {isConnected ? "YES" : "NO"}</div>
        <div>Agent Listening: {isListening ? "YES" : "NO"}</div>
        <div>Remote Users: {remoteUsers?.length || 0}</div>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  return (
    <AgoraRTCProvider client={rtcClient}>
      <DashboardContent />
    </AgoraRTCProvider>
  );
}
