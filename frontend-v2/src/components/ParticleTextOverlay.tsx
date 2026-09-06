"use client";

import { useEffect, useRef, useState } from "react";

interface ParticleTextOverlayProps {
  text: string;
  enabled: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  size: number;
  alpha: number;
  color: string;
  vx: number;
  vy: number;
  delay: number;
  arrived: boolean;
}

// Color palette matching the orb
const COLORS = [
  "59, 130, 246",   // blue-500
  "56, 189, 248",   // sky-400
  "34, 211, 238",   // cyan-400
  "16, 185, 129",   // emerald-500
  "99, 102, 241",   // indigo-400
  "147, 197, 253",  // blue-300
  "103, 232, 249",  // cyan-300
];

export default function ParticleTextOverlay({ text, enabled, onVisibilityChange }: ParticleTextOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<"idle" | "assembling" | "holding" | "dispersing">("idle");
  const phaseTimerRef = useRef<number>(0);
  const [displayText, setDisplayText] = useState("");

  // Extract text pixel positions from an offscreen canvas
  function getTextParticles(txt: string, canvasWidth: number, canvasHeight: number): Particle[] {
    const offscreen = document.createElement("canvas");
    offscreen.width = canvasWidth;
    offscreen.height = canvasHeight;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return [];

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Render solid white text
    ctx.fillStyle = "white";
    ctx.font = `bold ${Math.min(72, canvasWidth / 10)}px 'Inter', 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Word wrap
    const words = txt.split(" ");
    let line = "";
    const lines: string[] = [];
    const maxWidth = canvasWidth * 0.75;

    for (const word of words) {
      const testLine = line + word + " ";
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line.trim());
        line = word + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    const lineHeight = Math.min(72, canvasWidth / 10);
    const totalHeight = lines.length * lineHeight;
    const startY = (canvasHeight - totalHeight) / 2 + lineHeight / 2;

    lines.forEach((l, i) => {
      ctx.fillText(l, canvasWidth / 2, startY + i * lineHeight);
    });

    // Sample pixels
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
    const particles: Particle[] = [];
    const gap = 2; // Dense sampling for sharp, crisp text

    for (let y = 0; y < canvasHeight; y += gap) {
      for (let x = 0; x < canvasWidth; x += gap) {
        const idx = (y * canvasWidth + x) * 4;
        if (imageData[idx] > 128) {
          const color = COLORS[Math.floor(Math.random() * COLORS.length)];
          // Start from random positions scattered around
          const startX = x + (Math.random() - 0.5) * canvasWidth * 0.8;
          const startY2 = y + (Math.random() - 0.5) * canvasHeight * 0.8;

          particles.push({
            x: startX,
            y: startY2,
            originX: x,
            originY: y,
            size: 1.0 + Math.random() * 1.0,
            alpha: 0,
            color,
            vx: 0,
            vy: 0,
            delay: Math.random() * 0.5,
            arrived: false,
          });
        }
      }
    }

    return particles;
  }

  useEffect(() => {
    if (!text || !enabled) {
      phaseRef.current = "dispersing";
      return;
    }

    setDisplayText(text);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const particles = getTextParticles(text, canvas.width, canvas.height);
    particlesRef.current = particles;
    phaseRef.current = "assembling";
    phaseTimerRef.current = 0;
    if (onVisibilityChange) onVisibilityChange(true);
  }, [text, enabled, onVisibilityChange]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = performance.now();

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05); // delta in seconds, capped
      lastTime = time;

      // Handle canvas resize with DPR
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const targetW = rect.width * dpr;
      const targetH = rect.height * dpr;
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      if (particles.length === 0) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      phaseTimerRef.current += dt;
      const phase = phaseRef.current;

      let allGone = true;

      for (const p of particles) {
        if (phase === "assembling") {
          // Staggered arrival
          if (phaseTimerRef.current < p.delay) {
            // Not started yet - keep scattered
            p.alpha = Math.min(p.alpha + dt * 2, 0.3);
            allGone = false;
          } else {
            // Lerp toward origin
            const dx = p.originX - p.x;
            const dy = p.originY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0.5) {
              p.x += dx * dt * 5;
              p.y += dy * dt * 5;
              p.alpha = Math.min(p.alpha + dt * 3, 0.9);
              allGone = false;
            } else {
              p.x = p.originX;
              p.y = p.originY;
              p.alpha = Math.min(p.alpha + dt * 3, 0.85 + Math.random() * 0.15);
              p.arrived = true;
            }
          }
        } else if (phase === "holding") {
          // Very subtle float while holding — keep text sharp
          const t = phaseTimerRef.current;
          p.x = p.originX + Math.sin(t * 1.5 + p.originX * 0.1) * 0.15;
          p.y = p.originY + Math.cos(t * 2.0 + p.originY * 0.1) * 0.15;
          p.alpha = 0.85 + Math.sin(t * 3 + p.originX * 0.05) * 0.1;
        } else if (phase === "dispersing") {
          // Fly away
          p.vx += (Math.random() - 0.5) * dt * 200;
          p.vy += (Math.random() - 0.5) * dt * 200;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.alpha -= dt * 1.5;
          if (p.alpha > 0) allGone = false;
        }

        // Draw the particle dot
        if (p.alpha > 0.01) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color}, ${Math.max(0, p.alpha)})`;
          ctx.fill();

          // Add a subtle glow for brighter particles
          if (p.alpha > 0.5 && p.size > 1.5) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${p.alpha * 0.15})`;
            ctx.fill();
          }
        }
      }

      // Phase transitions
      if (phase === "assembling") {
        const arrivedCount = particles.filter((p) => p.arrived).length;
        if (arrivedCount > particles.length * 0.9) {
          phaseRef.current = "holding";
          phaseTimerRef.current = 0;
        }
      } else if (phase === "holding" && phaseTimerRef.current > 4) {
        phaseRef.current = "dispersing";
        phaseTimerRef.current = 0;
        // Give each particle a random velocity for dispersal
        for (const p of particles) {
          p.vx = (Math.random() - 0.5) * 150;
          p.vy = (Math.random() - 0.5) * 150;
        }
      } else if (phase === "dispersing" && allGone) {
        phaseRef.current = "idle";
        particlesRef.current = [];
        if (onVisibilityChange) onVisibilityChange(false);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [displayText, onVisibilityChange]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[5] pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
