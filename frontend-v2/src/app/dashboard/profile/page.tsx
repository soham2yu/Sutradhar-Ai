"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Image as ImageIcon, Save, AlertCircle, ArrowLeft, Shield, Activity, Key } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    
    try {
      await updateUserProfile(displayName, photoURL);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const error = err as Error;
      console.error(error);
      setError(error.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#050914] text-white p-8 md:p-16 font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        <header className="flex flex-col border-b border-white/10 pb-8 animate-fade-in">
          <Link href="/dashboard" className="inline-flex items-center text-white/40 hover:text-white mb-6 transition-colors uppercase tracking-widest text-xs font-semibold w-max">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
              <User className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">Operator Profile</h1>
              <p className="text-white/40 mt-2 text-sm tracking-wide">Configure your neural link identity and system preferences.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar / Stats */}
          <div className="md:col-span-1 space-y-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                {photoURL || user?.photoURL ? (
                  <img src={photoURL || user.photoURL || ""} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-white/20" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <User className="w-8 h-8 text-blue-400" />
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-white truncate w-32">{displayName || "Operator"}</div>
                  <div className="text-[10px] text-green-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Active
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs text-white/60">
                  <Shield className="w-4 h-4 text-white/30" /> Auth ID: {user.uid.substring(0, 8)}...
                </div>
                <div className="flex items-center gap-3 text-xs text-white/60">
                  <Activity className="w-4 h-4 text-white/30" /> Standard Clearance
                </div>
                {user.email && (
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <Key className="w-4 h-4 text-white/30" /> {user.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 space-y-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <h2 className="text-lg font-light tracking-widest uppercase mb-8 flex items-center gap-3 border-b border-white/5 pb-4">
                Identity Settings
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400 text-xs shadow-lg animate-slide-up">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs flex items-center gap-3 tracking-widest uppercase font-semibold shadow-lg animate-slide-up">
                  <Shield className="w-5 h-5" /> Profile successfully updated and synced across neural network.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div>
                  <label className="block text-white/50 text-[10px] tracking-[0.2em] uppercase mb-3">Display Name & Designation</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. SOHAM (DEVOPS)"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl pl-12 pr-4 py-4 text-xs tracking-widest uppercase text-white outline-none transition-all placeholder:text-white/20 shadow-inner"
                    />
                  </div>
                  <p className="text-[10px] text-white/30 mt-2 tracking-wide">This identifier will be attributed to your voice in all intelligence room transcripts.</p>
                </div>
                
                <div>
                  <label className="block text-white/50 text-[10px] tracking-[0.2em] uppercase mb-3">Avatar URL (Optional)</label>
                  <div className="relative group">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type="url"
                      placeholder="https://..."
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl pl-12 pr-4 py-4 text-xs tracking-widest text-white outline-none transition-all placeholder:text-white/20 shadow-inner"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-xl transition-all font-bold tracking-[0.15em] text-xs uppercase disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Configuration
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
