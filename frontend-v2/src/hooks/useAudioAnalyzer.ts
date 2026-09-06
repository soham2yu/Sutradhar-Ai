import { useState, useEffect, useRef } from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */

export function useAudioAnalyzer(isActive: boolean) {
  const [amplitude, setAmplitude] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close();
      setAmplitude(0);
      return;
    }

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;

        const bufferLength = analyser.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        const update = () => {
          if (!analyserRef.current || !dataArrayRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
          
          // Calculate average amplitude
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArrayRef.current[i];
          }
          const avg = sum / bufferLength;
          // Normalize to 0-1 range
          setAmplitude(avg / 255);

          rafRef.current = requestAnimationFrame(update);
        };

        update();

      } catch (err) {
        console.error("Audio initialization failed:", err);
      }
    };

    initAudio();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [isActive]);

  return { amplitude };
}
