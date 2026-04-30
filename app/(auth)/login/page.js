"use client";
import { useState, Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ChevronRight, Lock, 
  Mail, ShieldCheck, Zap, 
  Loader2, Eye, EyeOff
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified")) {
      setSuccess("Account verified successfully. You can now login.");
    }
    if (searchParams.get("registered")) {
      setSuccess("Account created. Please check your email to verify.");
    }
    if (searchParams.get("error")) {
      setError("Authentication failed. Please check your credentials.");
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
        setError(res.error === "EMAIL_NOT_VERIFIED" ? "Email verification required." : "Invalid access parameters.");
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError("Unexpected protocol error.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-12">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-black mx-auto flex items-center justify-center text-white text-2xl font-black">
           E
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-[900] tracking-tight italic uppercase text-black">Authorized Login.</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Secure Access Portal</p>
        </div>
      </div>

      <div className="space-y-8">
        <button
          onClick={() => { setSocialLoading('google'); signIn('google', { callbackUrl }); }}
          disabled={socialLoading === 'google'}
          className="w-full border border-slate-200 py-5 flex items-center justify-center gap-4 hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-[0.3em] rounded-none"
        >
          {socialLoading === 'google' ? <Loader2 className="animate-spin" size={16} /> : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="flex items-center gap-4">
           <div className="h-[1px] flex-1 bg-slate-100" />
           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Or Manual</span>
           <div className="h-[1px] flex-1 bg-slate-100" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 text-red-600 flex items-center gap-3">
              <Zap size={14} />
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 text-emerald-600 flex items-center gap-3">
              <ShieldCheck size={14} />
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">{success}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Identifier</label>
               <input
                 name="email"
                 type="email"
                 placeholder="NAME@INSTITUTION.COM"
                 required
                 className="w-full bg-slate-50 border border-slate-200 py-4 px-6 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none rounded-none"
               />
            </div>

            <div className="space-y-3">
               <div className="flex justify-between items-center px-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Key</label>
                 <button type="button" className="text-[10px] font-black text-slate-300 hover:text-black uppercase tracking-widest">Recovery</button>
               </div>
               <div className="relative group">
                 <input
                   name="password"
                   type={showPassword ? "text" : "password"}
                   placeholder="••••••••"
                   required
                   className="w-full bg-slate-50 border border-slate-200 py-4 px-6 pr-12 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none rounded-none"
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors"
                 >
                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                 </button>
               </div>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-black text-white py-5 font-black text-[10px] uppercase tracking-[0.4em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50 active:scale-[0.98] rounded-none"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Sign In Portal"}
          </button>

          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            New researcher?{" "}
            <Link href="/register" className="text-black border-b border-black/20 hover:border-black transition-all">
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
    <div className="flex min-h-screen bg-white font-sans">
      <div className="hidden lg:flex w-[45%] bg-black items-center justify-center relative overflow-hidden">
         <div className="relative z-10 p-24 space-y-10">
            <ShieldCheck size={48} className="text-white opacity-20" />
            <h2 className="text-6xl font-[900] text-white tracking-tighter leading-[0.9] uppercase italic">Institutional <br /> Quality <br /> Assurance.</h2>
            <p className="text-white/40 text-lg font-medium leading-relaxed max-w-sm italic">
               Securely access your academic workspace supported by elite subject specialists.
            </p>
         </div>
         {/* Decorative Blur */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
      </div>

      <div className="flex-1 flex items-center justify-center p-10 bg-[#fbfbfb]">
        <Suspense fallback={<Loader2 className="animate-spin text-black" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
