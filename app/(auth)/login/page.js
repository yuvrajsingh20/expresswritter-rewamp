"use client";
import { useState, Suspense, useEffect } from "react";
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
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // 'google' or null
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (searchParams.get("verified")) {
      setSuccess("Account verified successfully. You can now login.");
    }
    if (searchParams.get("registered")) {
      setSuccess("Account created. Please check your email to verify.");
    }
    if (searchParams.get("error")) {
      const err = searchParams.get("error");
      if (err === "VerificationFailed" || err === "InvalidToken") setError("Verification link invalid or expired.");
      else if (err === "OAuthAccountNotLinked") setError("An account with this email already exists with a different login method.");
      else setError("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

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
        if (res.error === "EMAIL_NOT_VERIFIED") {
          setError("Please verify your email address before logging in. Check your inbox.");
        } else {
          setError("Invalid credentials. Please verify your access parameters.");
        }
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

  const handleGoogleLogin = () => {
    setSocialLoading('google');
    signIn('google', { callbackUrl });
  };

  return (
    <div className="w-full max-w-sm space-y-8 group">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-[#0a192f] rounded-[1.25rem] mx-auto flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-blue-900/20 group-hover:scale-105 transition-transform">
           E
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0a192f]">Sign In</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Authorized Access Point</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Social Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={socialLoading === 'google'}
          className="w-full border-2 border-slate-100 hover:border-slate-200 py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-slate-50 relative overflow-hidden"
        >
          {socialLoading === 'google' ? (
            <Loader2 className="animate-spin text-slate-400" size={18} />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-bold text-slate-700 tracking-tight">Continue with Google</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-4 py-2">
           <div className="h-[1px] flex-1 bg-slate-100" />
           <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">OR</span>
           <div className="h-[1px] flex-1 bg-slate-100" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
              <Zap size={16} className="shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 text-emerald-600 animate-in fade-in slide-in-from-top-2">
              <ShieldCheck size={16} className="shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">{success}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Email Identifier</label>
               <div className="relative group/field">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-blue-600 transition-colors" size={16} />
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
               <div className="relative group/field">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-blue-600 transition-colors" size={16} />
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
            className="w-full bg-[#0a192f] text-white py-4 rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/10 active:scale-[0.98] disabled:opacity-50 group/btn"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                Sign In <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400 font-medium">
            New researcher?{" "}
            <Link href="/register" className="text-blue-600 font-bold hover:underline transition-all">
              Initialize Account
            </Link>
          </p>
        </form>
      </div>
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
            <h2 className="text-5xl font-extrabold text-white tracking-tight leading-tight uppercase italic">Precision in every <br /> academic draft.</h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md italic">
               Our institutional framework ensures your academic trajectory is supported by world-class subject writing expertise.
            </p>
         </div>
         {/* Decorative Gradients */}
         <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-10">
        <Suspense fallback={<Loader2 className="animate-spin text-blue-600" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
