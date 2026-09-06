"use client";

import Link from 'next/link';

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen bg-black text-white p-8 md:p-16 font-sans selection:bg-white selection:text-black">
      <nav className="w-full flex justify-between items-center mb-24">
        <Link href="/" className="text-white text-xs font-bold tracking-[0.3em] flex items-center gap-4 hover:opacity-70 transition-opacity">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
          SUTRADHAR
        </Link>
        <div className="flex items-center gap-12 text-white/50 text-[10px] font-medium tracking-[0.2em] uppercase">
          <Link href="/manifesto" className="hover:text-white transition-colors">Manifesto</Link>
          <span className="text-white">Architecture</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto pb-32">
        <header className="mb-24">
          <h1 className="text-5xl md:text-7xl font-black tracking-[-0.04em] uppercase mb-8 leading-tight">
            System <br/><span className="text-white/30">Architecture.</span>
          </h1>
          <p className="text-xl font-light text-white/60 max-w-2xl">
            Sutradhar operates on a high-throughput, low-latency pipeline designed for real-time cognitive synthesis.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border border-white/10 p-8 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="text-blue-500 font-mono text-xs mb-6">01 // INGESTION</div>
            <h3 className="text-2xl font-bold uppercase tracking-[-0.02em] mb-4">Web Speech API</h3>
            <p className="text-white/50 font-light text-sm leading-relaxed">
              Discrete, high-fidelity audio capture utilizing native browser engines. Streams directly into the client-side buffer for zero-latency UI rendering before payload dispatch.
            </p>
          </div>

          <div className="border border-white/10 p-8 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="text-blue-500 font-mono text-xs mb-6">02 // SYNTHESIS</div>
            <h3 className="text-2xl font-bold uppercase tracking-[-0.02em] mb-4">Gemini Neural Engine</h3>
            <p className="text-white/50 font-light text-sm leading-relaxed">
              Real-time semantic extraction. Transcripts are analyzed dynamically against an evolving context window, transforming unstructured text into structured JSON arrays of facts and hypotheses.
            </p>
          </div>

          <div className="border border-white/10 p-8 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="text-blue-500 font-mono text-xs mb-6">03 // DISTRIBUTION</div>
            <h3 className="text-2xl font-bold uppercase tracking-[-0.02em] mb-4">FastAPI WebSockets</h3>
            <p className="text-white/50 font-light text-sm leading-relaxed">
              Asynchronous pub/sub architecture. Processed intelligence is instantly broadcasted to all connected instances, keeping distributed incident teams perfectly synchronized.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
