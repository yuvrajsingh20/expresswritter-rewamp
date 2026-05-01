"use client";
import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ChevronRight, ShieldCheck, Zap } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role')?.toUpperCase() || 'STUDENT';
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: initialRole });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const redirectPath = searchParams.get('redirect') || '/dashboard';
        router.push(`/login?registered=true&callbackUrl=${encodeURIComponent(redirectPath)}`);
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to initialize account. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl space-y-12">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-black mx-auto flex items-center justify-center text-white text-2xl font-black">
           E
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-[900] tracking-tight italic uppercase text-black">Initialize Account.</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Access Protocol</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 p-10 md:p-16 shadow-[0_30px_80px_rgba(0,0,0,0.05)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-black" />
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 text-red-600 flex items-center gap-3">
              <Zap size={16} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          )}

          <div className="space-y-8">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                <input
                  type="text"
                  placeholder="E.G. ALEXANDER PIERCE"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 py-5 px-8 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none rounded-none"
                />
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Email</label>
                <input
                  type="email"
                  placeholder="EMAIL@INSTITUTION.COM"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 py-5 px-8 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none rounded-none"
                />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
                   <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 py-5 px-8 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none rounded-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-black transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                   </div>
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Role</label>
                   <select 
                     value={formData.role}
                     onChange={(e) => setFormData({...formData, role: e.target.value})}
                     className="w-full bg-slate-50 border border-slate-200 py-5 px-8 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none rounded-none appearance-none cursor-pointer"
                   >
                     <option value="STUDENT">STUDENT (ACADEMIC)</option>
                     <option value="FREELANCER">WRITER (EXPERT)</option>
                   </select>
                </div>
             </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-black text-white py-6 font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-4 shadow-2xl disabled:opacity-50 active:scale-[0.98] rounded-none"
          >
            {loading ? "INITIALIZING..." : "CREATE ACCOUNT"} <ChevronRight size={18} />
          </button>

          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Existing researcher?{" "}
            <Link href="/login" className="text-black border-b border-black/20 hover:border-black transition-all">
              Authorize Access
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#fbfbfb] flex items-center justify-center p-10 font-sans">
      <Suspense fallback={<div className="font-black text-[10px] uppercase tracking-[0.15em] text-slate-300 animate-pulse">Loading Protocol...</div>}>
        <RegisterForm />
      </Suspense>
      {/* Decorative Gradients */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-slate-100 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-slate-100 rounded-full blur-[120px] -z-10" />
    </div>
  );
}

