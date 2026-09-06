"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRTCClient, useLocalMicrophoneTrack, usePublish, useJoin, useClientEvent } from "agora-rtc-react";

interface UseAgoraConversationProps {
  onSentenceComplete: (text: string, speaker: "user" | "agent") => void;
  incidentId: string;
}

export function useAgoraConversation({ onSentenceComplete, incidentId }: UseAgoraConversationProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const client = useRTCClient();
  const [rtmClient, setRtmClient] = useState<any>(null);
  
  const [connectionDetails, setConnectionDetails] = useState<{ token: string; uid: string; channel: string } | null>(null);
  
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(isReady);
  const { isConnected: joinSuccess } = useJoin(
    {
      appid: process.env.NEXT_PUBLIC_AGORA_APP_ID || "",
      channel: connectionDetails?.channel || "",
      token: connectionDetails?.token || "",
      uid: connectionDetails?.uid || "",
    },
    isReady && !!connectionDetails
  );

  useEffect(() => {
    if (client) {
      try {
        (client as any).setParameter?.("ENABLE_AUDIO_PTS", true);
      } catch (e) {}
    }
  }, [client]);

  usePublish([localMicrophoneTrack]);

  const processedMessageIds = useRef<Set<string>>(new Set());
  
  const onSentenceCompleteRef = useRef(onSentenceComplete);
  useEffect(() => {
    onSentenceCompleteRef.current = onSentenceComplete;
  }, [onSentenceComplete]);

  useEffect(() => {
    console.log("WebRTC state:", { isReady, joinSuccess, hasRtmClient: !!rtmClient });
    if (!isReady || !joinSuccess || !rtmClient) return;

    let cancelled = false;
    (async () => {
      try {
        // Since the user doesn't have a credit card for Agora Cloud,
        // we will use Chrome's built-in 100% free Web Speech API!
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        let recognition: any = null;

        if (SpeechRecognition) {
          recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = false;
          // Set language to Indian English - this handles "Hinglish" and outputs Latin alphabet!
          recognition.lang = 'en-IN';
          
          recognition.onresult = (event: any) => {
            const text = event.results[event.results.length - 1][0].transcript;
            
            // Send it to the local React state (Live Transcript panel)
            onSentenceCompleteRef.current(text, "user");
          };
          
          recognition.onerror = (e: any) => console.error("Speech API Error:", e.error);
          recognition.onend = () => {
            if (!cancelled) recognition.start(); // Keep listening!
          };
          
          recognition.start();
        } else {
          console.error("Web Speech API not supported in this browser.");
        }

      } catch (err) {
        console.error("Failed to start voice:", err);
      }
    })();

    return () => {
      cancelled = true;
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          // A bit hacky but it stops the current instance
          window.location.reload(); 
        }
      } catch {}
    };
  }, [isReady, joinSuccess, rtmClient, client, incidentId]);


  const start = useCallback(async () => {
    try {
      setError(null);
      
      const res = await fetch("/api/generate-agora-token");
      if (!res.ok) throw new Error("Failed to generate token");
      const data = await res.json();
      setConnectionDetails(data);
      
      const AgoraRTM = (await import("agora-rtm")).default;
      const rtm = new AgoraRTM.RTM(process.env.NEXT_PUBLIC_AGORA_APP_ID || "", data.uid);
      await rtm.login({ token: data.token });
      await rtm.subscribe(data.channel);
      setRtmClient(rtm);
      
      setIsReady(true);
      
      const inviteRes = await fetch("/api/invite-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requester_id: data.uid, channel_name: data.channel }),
      });
      if (!inviteRes.ok) throw new Error("Failed to invite agent");
      
      setIsListening(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setIsListening(false);
    }
  }, []);

  const stop = useCallback(async () => {
    setIsListening(false);
    setIsReady(false);
    if (rtmClient) {
      rtmClient.logout();
      setRtmClient(null);
    }
    
    if (connectionDetails) {
      fetch("/api/stop-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel_name: connectionDetails.channel }),
      }).catch(console.error);
    }
    setConnectionDetails(null);
  }, [rtmClient, connectionDetails]);

  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);

  useClientEvent(client, 'user-published', async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    if (mediaType === "audio") {
      user.audioTrack?.play();
    }
    setRemoteUsers(Array.from(client.remoteUsers));
  });

  useClientEvent(client, 'user-unpublished', (user, mediaType) => {
    if (mediaType === "audio") {
      user.audioTrack?.stop();
    }
    setRemoteUsers(Array.from(client.remoteUsers));
  });

  return { isListening, start, stop, error, isSupported: true, remoteUsers };
}
