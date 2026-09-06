"use client";
import { useState, useRef, useEffect } from "react";
import type { IAgoraRTCClient, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";

interface UseAgoraSessionProps {
  isActive: boolean;
  channelName: string;
  onSentenceComplete: (text: string) => void;
}

export function useAgoraSession({ isActive, channelName, onSentenceComplete }: UseAgoraSessionProps) {
  const [isListening, setIsListening] = useState(false);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const recognitionRef = useRef<any>(null);
  const onSentenceCompleteRef = useRef(onSentenceComplete);

  useEffect(() => {
    onSentenceCompleteRef.current = onSentenceComplete;
  }, [onSentenceComplete]);

  const connectionStateRef = useRef<'IDLE'|'JOINING'|'JOINED'>('IDLE');

  // Handle Agora RTC connection for Voice Transmission
  useEffect(() => {
    if (!isActive || !channelName) {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.leave();
        clientRef.current = null;
      }
      connectionStateRef.current = 'IDLE';
      return;
    }

    const initAgora = async () => {
      if (connectionStateRef.current !== 'IDLE') return;
      connectionStateRef.current = 'JOINING';

      try {
        const uid = Math.floor(Math.random() * 1000000);
        
        // Fetch token from our FastAPI backend
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const res = await fetch(`${backendUrl}/api/agora/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel_name: channelName, uid })
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.detail || "Failed to fetch Agora token");
        }
        
        const data = await res.json();
        
        const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
        
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        // Auto-subscribe to other users so everyone can hear each other
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        });

        await client.join(data.app_id, channelName, data.token, uid);
        
        // Create and publish local microphone track
        const localAudio = await AgoraRTC.createMicrophoneAudioTrack();
        localAudioTrackRef.current = localAudio;
        await client.publish([localAudio]);

        console.log("Joined Agora Channel:", channelName);
        connectionStateRef.current = 'JOINED';
      } catch (err) {
        console.error("Failed to initialize Agora RTC", err);
        connectionStateRef.current = 'IDLE';
      }
    };

    initAgora();

    return () => {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.leave();
        clientRef.current = null;
      }
      connectionStateRef.current = 'IDLE';
    };
  }, [isActive, channelName]);

  // Handle Local Speech-to-Text for the AI Backend (Hybrid approach)
  useEffect(() => {
    if (!isActive) {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.error("Speech Recognition API not supported in this browser.");
        return;
      }

      if (!recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false; 
        recognition.interimResults = false; 
        recognition.lang = "en-IN"; // English (India) to match user locale preference if needed, or en-US

        recognition.onresult = (event: any) => {
          const text = event.results[event.results.length - 1][0].transcript;
          if (text && text.trim()) {
            onSentenceCompleteRef.current(text.trim());
          }
        };

        recognition.onend = () => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {}
          }
        };

        recognitionRef.current = recognition;
      }

      try {
         recognitionRef.current.start();
         setIsListening(true);
      } catch(e) { }
      
    } catch (e) {
      console.error("Failed to start speech recognition", e);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
    };
  }, [isActive]);

  return { isListening };
}
