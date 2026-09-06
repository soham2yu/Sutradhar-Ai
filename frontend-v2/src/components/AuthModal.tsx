"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogIn, Mail, Lock, Sparkles, AlertCircle, ArrowRight } from "lucide-react";

export default function AuthModal({ onCancel }: { onCancel?: () => void }) {
  const { loginWithGoogle, loginWithEmail, signupWithEmail, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password);
      }
    } catch (err) {
      const error = err as Error;
      console.error(error);
      setError(error.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-3xl z-[100] flex items-center justify-center animate-fade-in p-4">
      {/* Background Ambience for Auth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-white/[0.02] border border-white/10 rounded-3xl p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Glow Effects */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

        
        
        {/* Grid Pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-light tracking-widest text-white uppercase">
                {isLogin ? "Authenticate" : "Create Account"}
              </h2>
              <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase mt-1">Secure Neural Link</p>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400 text-xs shadow-lg animate-slide-up">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 mb-8">
            <div>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl pl-12 pr-4 py-4 text-xs tracking-widest uppercase text-white outline-none transition-all placeholder:text-white/20 shadow-inner"
                />
              </div>
            </div>
            
            <div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl pl-12 pr-4 py-4 text-xs tracking-widest uppercase text-white outline-none transition-all placeholder:text-white/20 shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black hover:bg-gray-200 rounded-xl transition-all font-bold tracking-[0.15em] text-xs uppercase disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.15)] mt-4"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Establish Link" : "Register Credentials"} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 py-2 mb-6 text-white/20">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold">OR</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={loginWithGoogle}
              disabled={loading || isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all font-semibold tracking-widest text-xs uppercase text-white/80"
            >
              <LogIn className="w-4 h-4" />
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              disabled={loading || isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-4 bg-transparent hover:bg-white/5 border border-transparent rounded-xl transition-all font-semibold tracking-widest text-[10px] uppercase text-white/40 hover:text-white/80"
            >
              {isLogin ? "Need an account? Register" : "Already have an account? Sign In"}
            </button>
          </div>

          {onCancel && (
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="text-[10px] text-white/30 hover:text-red-400 tracking-[0.2em] uppercase transition-colors"
              >
                Abort & Return
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
