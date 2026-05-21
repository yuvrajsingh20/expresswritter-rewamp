"use client";
import { useState, Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { InputField, SocialBtn, Divider, PrimaryBtn } from "../auth-components";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');

  const ROLES = [
    { id: 'client', label: 'Client', icon: '🧑‍💼', desc: 'Place orders' },
    { id: 'writer', label: 'Writer', icon: '✍️', desc: 'Manage work' }
  ];

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
    e?.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        role,
        callbackUrl,
      });

      if (res?.error) {
        if (res.error === "EMAIL_NOT_VERIFIED") {
          setError("Email verification required.");
        } else if (res.error === "ROLE_MISMATCH_STUDENT") {
          setError("You joined as a student, contact to admin");
        } else if (res.error === "ROLE_MISMATCH_WRITER") {
          setError("You joined as a writer, contact to admin");
        } else {
          setError("Invalid access parameters.");
        }
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px clamp(20px, 5vw, 56px)', maxWidth: 520, margin: '0 auto', width: '100%', animation: 'fadeUp .4s ease' }}>
      {/* Back button to landing page */}
      <div style={{ marginBottom: 24, alignSelf: 'flex-start' }}>
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 8,
          background: 'var(--surface3)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          fontSize: 12,
          fontWeight: 500,
          transition: 'all 0.2s ease',
          fontFamily: 'inherit'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text)';
          e.currentTarget.style.background = 'var(--surface4)';
          e.currentTarget.style.borderColor = 'var(--teal)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.background = 'var(--surface3)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
        >
          <span>←</span> Back to home
        </Link>
      </div>

      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Welcome back</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 300 }}>Sign in to your Xpresswriters account</p>
      </div>

      {/* Role selector */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase' }}>I am a</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {ROLES.map((r) =>
            <button key={r.id} onClick={(e) => { e.preventDefault(); setRole(r.id); }} style={{
              padding: '10px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'center', transition: 'all .2s',
              background: role === r.id ? 'rgba(13,148,136,0.12)' : 'var(--surface3)',
              border: `1.5px solid ${role === r.id ? 'var(--teal)' : 'var(--border)'}`,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'inherit',
              outline: 'none'
            }}>
              <div style={{ fontSize: 20, marginBottom: 3 }}>{r.icon}</div>
              <div style={{ fontSize: 13, fontWeight: role === r.id ? 700 : 500, color: role === r.id ? 'var(--teal-light)' : 'var(--text)' }}>{r.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>{r.desc}</div>
            </button>
          )}
        </div>
      </div>

      {/* Social logins */}
      <SocialBtn 
        icon={socialLoading === 'google' ? <Loader2 className="animate-spin" size={16} /> : "🔍"} 
        label="Continue with Google" 
        onClick={() => {
          setSocialLoading('google');
          const targetUrl = role === 'writer' ? '/onboard/freelancer/setup' : callbackUrl;
          signIn('google', { callbackUrl: targetUrl });
        }} 
      />
      
      <Divider label="or sign in with email" />

      {error && (
        <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid var(--red)', padding: '12px', borderRadius: 7, color: 'var(--red)', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚠</span>{error}
        </div>
      )}
      
      {success && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid var(--green)', padding: '12px', borderRadius: 7, color: 'var(--green)', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>✓</span>{success}
        </div>
      )}

      {/* Form */}
      <InputField label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" icon="✉️" autoComplete="email" />
      <InputField label="Password" type="password" value={password} onChange={setPassword} placeholder="Enter your password" autoComplete="current-password" />

      {/* Remember + Forgot */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, marginTop: -4 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}>
          <input type="checkbox" style={{ accentColor: 'var(--teal)', width: 14, height: 14 }} />
          Remember me
        </label>
        <Link href="/forgot" style={{ color: 'var(--teal-light)', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
      </div>

      <PrimaryBtn onClick={handleSubmit} loading={loading}>
        {!loading && 'Sign In Portal'}
      </PrimaryBtn>

      {/* Sign up link */}
      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
        Don't have an account?{' '}
        <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} style={{ color: 'var(--teal-light)', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>Create one →</Link>
      </div>

      {/* Security note */}
      <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, color: 'var(--text-dim)' }}>
        <span>🔒</span> Secured with 256-bit TLS encryption
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loader2 className="animate-spin text-white" />}>
      <LoginForm />
    </Suspense>
  );
}
