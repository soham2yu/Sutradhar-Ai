"use client";

import Link from 'next/link';

export default function ManifestoPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8 md:p-16 font-sans selection:bg-white selection:text-black">
      <nav className="w-full flex justify-between items-center mb-24">
        <Link href="/" className="text-white text-xs font-bold tracking-[0.3em] flex items-center gap-4 hover:opacity-70 transition-opacity">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
          SUTRADHAR
        </Link>
        <div className="flex items-center gap-12 text-white/50 text-[10px] font-medium tracking-[0.2em] uppercase">
          <span className="text-white">Manifesto</span>
          <Link href="/archive" className="hover:text-white transition-colors">Archive</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto space-y-24 pb-32">
        <header>
          <h1 className="text-5xl md:text-7xl font-black tracking-[-0.04em] uppercase mb-8 leading-tight">
            The Death of <br/><span className="text-white/30">Manual Intelligence.</span>
          </h1>
          <p className="text-xl md:text-2xl font-light text-white/60 leading-relaxed max-w-2xl">
            In crisis, communication fragments. Context is lost. Decisions are buried in noise. Sutradhar replaces the human scribe with an omnipresent cognitive architecture.
          </p>
        </header>

        <section className="space-y-8">
          <h2 className="text-xs tracking-[0.4em] uppercase font-bold text-blue-500">I. The Observer</h2>
          <p className="text-2xl font-light leading-relaxed text-white/80">
            A system that listens without fatigue. It captures every utterance, translating chaotic verbal exchange into structured, permanent knowledge in real-time.
          </p>
        </section>

        <section className="space-y-8">
          <h2 className="text-xs tracking-[0.4em] uppercase font-bold text-blue-500">II. The Synthesizer</h2>
          <p className="text-2xl font-light leading-relaxed text-white/80">
            Facts are verified. Hypotheses are tracked. Actions are assigned. The cognitive engine does not just record; it understands the semantic weight of every statement, dynamically building a shared reality.
          </p>
        </section>

        <section className="space-y-8 border-t border-white/10 pt-24">
          <h2 className="text-4xl font-black tracking-[-0.04em] uppercase mb-8">Ready to initiate?</h2>
          <Link href="/" className="inline-block bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] px-12 py-5 rounded-full hover:scale-105 transition-all duration-500">
            Launch Platform
          </Link>
        </section>
      </div>
    </main>
  );
}
