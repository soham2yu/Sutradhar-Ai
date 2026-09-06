"use client";

import { useState, useRef, useEffect } from "react";

interface UseWebSpeechProps {
  isActive: boolean;
  onSentenceComplete: (text: string) => void;
}

export function useWebSpeech({ isActive, onSentenceComplete }: UseWebSpeechProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const onSentenceCompleteRef = useRef(onSentenceComplete);

  useEffect(() => {
    onSentenceCompleteRef.current = onSentenceComplete;
  }, [onSentenceComplete]);

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
        // Use continuous=false to force Chrome to yield final sentences whenever the user pauses.
        // The onend handler will automatically restart it to keep listening indefinitely.
        recognition.continuous = false; 
        recognition.interimResults = false; 
        recognition.lang = "en-IN";

        recognition.onstart = () => {
          console.log("🟢 Speech Recognition STARTED successfully!");
        };

        recognition.onresult = (event: any) => {
          const text = event.results[event.results.length - 1][0].transcript;
          if (text && text.trim()) {
            console.log("🎯 Final Sentence Captured:", text.trim());
            onSentenceCompleteRef.current(text.trim());
          }
        };

        recognition.onerror = (event: any) => {
          console.error("🔴 Speech Recognition Error:", event.error, event.message);
        };

        recognition.onend = () => {
          console.log("🟡 Speech Recognition ENDED. Restarting instantly...");
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // Ignore already started errors
            }
          }
        };

        recognitionRef.current = recognition;
      }

      // Start immediately (no setTimeout) to satisfy user-gesture requirement if possible
      try {
         console.log("⏳ Attempting to start Speech Recognition...");
         recognitionRef.current.start();
         setIsListening(true);
      } catch(e) {
         console.error("Failed immediate start", e);
      }
      
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
