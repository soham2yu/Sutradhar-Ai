/**
 * React hook for browser-native speech recognition (Web Speech API).
 *
 * Works in Chrome and Edge. Provides real-time transcription with
 * buffered sentence output suitable for sending to the analyze endpoint.
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SpeechRecognitionResult {
  /** The final transcribed text of a completed sentence/phrase. */
  finalText: string;
  /** Interim text being actively spoken (not yet finalized). */
  interimText: string;
  /** Whether the mic is currently listening. */
  isListening: boolean;
  /** Whether the browser supports speech recognition. */
  isSupported: boolean;
  /** Any error message. */
  error: string | null;
  /** Start listening. */
  start: () => void;
  /** Stop listening. */
  stop: () => void;
}

// Web Speech API types (not in standard TS lib)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export function useSpeechRecognition(
  onSentenceComplete: (text: string) => void
): SpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const onSentenceCompleteRef = useRef(onSentenceComplete);

  // Keep the callback ref up to date
  onSentenceCompleteRef.current = onSentenceComplete;

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError("Speech recognition not supported. Use Chrome or Edge.");
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (final) {
        setFinalText(final);
        setInterimText("");
        onSentenceCompleteRef.current(final.trim());
      } else {
        setInterimText(interim);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech") {
        // Ignore no-speech errors, they're normal during pauses
        return;
      }
      if (event.error === "aborted") {
        return;
      }
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      // Auto-restart if we're supposed to be listening
      if (recognitionRef.current?._shouldListen) {
        try {
          recognition.start();
        } catch {
          // Ignore errors on restart
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        // Ignore
      }
    };
  }, []);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    setInterimText("");
    try {
      recognitionRef.current._shouldListen = true;
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current._shouldListen = false;
    try {
      recognitionRef.current.stop();
    } catch {
      // Ignore
    }
    setIsListening(false);
    setInterimText("");
  }, []);

  return {
    finalText,
    interimText,
    isListening,
    isSupported,
    error,
    start,
    stop,
  };
}
