"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ChevronRight, ArrowLeft, Lock, 
  Mail, ShieldCheck, Zap, 
  Loader2, ArrowRight
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/student";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError("Invalid credentials. Please verify your access parameters.");
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError("An unexpected authentication error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-10 group">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-[#0a192f] rounded-[1.25rem] mx-auto flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-blue-900/20 group-hover:scale-105 transition-transform">
           E
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0a192f]">Welcome Back</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Authorized Access Only</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
            <Zap size={16} />
            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Email Identifier</label>
             <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  name="email"
                  type="email"
                  placeholder="name@university.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                />
             </div>
          </div>

          <div className="space-y-2">
             <div className="flex justify-between items-center px-1">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Security Key</label>
               <button type="button" className="text-[10px] font-bold text-blue-600 hover:underline tracking-widest">Recovery</button>
             </div>
             <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                />
             </div>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-[#0a192f] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#112240] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/10 active:scale-[0.98] disabled:opacity-50 group/btn"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              Sign In <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="flex items-center gap-4 py-2">
           <div className="h-[1px] flex-1 bg-slate-100" />
           <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Secured Protocol</span>
           <div className="h-[1px] flex-1 bg-slate-100" />
        </div>

        <p className="text-center text-xs text-slate-400 font-medium">
          New researcher?{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:underline transition-all">
            Initialize Account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Visual/Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#0a192f] items-center justify-center relative overflow-hidden">
         <div className="relative z-10 p-20 space-y-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white">
               <ShieldCheck size={32} />
            </div>
            <h2 className="text-5xl font-extrabold text-white tracking-tight leading-tight">Precision in every <br /> academic draft.</h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
               Our institutional framework ensures your academic trajectory is supported by world-class subject writing expertise.
            </p>
         </div>
         {/* Decorative Gradients */}
         <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-10">
        <Suspense fallback={<Loader2 className="animate-spin" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
