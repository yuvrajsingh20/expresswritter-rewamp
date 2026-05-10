"use client";
import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { InputField, SocialBtn, Divider, PrimaryBtn } from "../auth-components";

function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Special character', pass: /[^A-Za-z0-9]/.test(password) }
  ];

  const score = checks.filter((c) => c.pass).length;
  const levels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'var(--red)', 'var(--amber)', 'var(--teal)', 'var(--green)'];
  return (
    <div style={{ marginTop: -8, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4].map((i) =>
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? colors[score] : 'var(--surface3)', transition: 'background .3s' }} />
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: colors[score], fontWeight: 600, transition: 'color .3s' }}>{score > 0 ? levels[score] : ''}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {checks.map((c) =>
          <span key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: c.pass ? 'var(--green)' : 'var(--text-dim)', transition: 'color .3s' }}>
            <span style={{ fontSize: 12 }}>{c.pass ? '✓' : '○'}</span>{c.label}
          </span>
        )}
      </div>
    </div>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role')?.toUpperCase() || 'STUDENT';
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(initialRole === 'FREELANCER' ? 'writer' : 'client');
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    agree: false,
    education: '',
    experience: '',
    resumeUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const ROLES = [
    { id: 'client', label: 'I need content', icon: '🧑‍💼', desc: 'Place orders and work with writers', color: 'var(--teal)' },
    { id: 'writer', label: 'I am a writer', icon: '✍️', desc: 'Apply to write and earn', color: '#8b5cf6' }
  ];

  const validateStep1 = () => {
    if (!role) return { role: 'Please select a role' };
    return {};
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.agree) e.agree = 'Please accept the terms to continue';
    
    if (role === 'writer') {
      if (!form.education.trim()) e.education = 'Qualification is required';
      if (!form.experience.trim()) e.experience = 'Experience is required';
      if (!form.resumeUrl.trim()) e.resumeUrl = 'Resume link is required';
    }
    
    return e;
  };

  const handleNext = async () => {
    if (step === 1) {
      const e = validateStep1();
      if (Object.keys(e).length) { setErrors(e); return; }
      setStep(2);
    } else {
      const e = validateStep2();
      if (Object.keys(e).length) { setErrors(e); return; }
      setLoading(true);
      
      try {
        const backendRole = role === 'writer' ? 'FREELANCER' : 'STUDENT';
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: backendRole,
            writerProfile: role === 'writer' ? {
              education: form.education,
              experience: form.experience,
              resumeUrl: form.resumeUrl,
              bio: "Writer application from registration form",
              domainId: "SOP" // Default domain
            } : undefined
          }),
        });

        if (res.ok) {
          setDone(true);
        } else {
          const data = await res.json();
          setErrors({ submit: data.message || "Something went wrong" });
        }
      } catch (err) {
        setErrors({ submit: "Failed to initialize account. Try again." });
      } finally {
        setLoading(false);
      }
    }
  };

  if (done) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', animation: 'fadeUp .4s ease', textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(13,148,136,0.12)', border: '2px solid var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 24, animation: 'checkPop .5s ease' }}>✓</div>
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em' }}>Account created!</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 360, marginBottom: 28 }}>
        {role === 'writer' ?
          'Your writer application is under review. We have received your qualification details and resume. We\'ll email you within 48 hours once approved. Then you can login and access your dashboard.' :
          'Welcome to Xpresswriters! Check your email to verify your account, then start placing orders.'}
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {role === 'writer' ? null : (
          <Link href={callbackUrl} style={{ background: 'var(--teal)', color: '#fff', padding: '12px 24px', borderRadius: 7, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Go to Dashboard →</Link>
        )}
        <Link href="/login" style={{ background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--text-muted)', padding: '12px 24px', borderRadius: 7, fontSize: 14, fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}>Sign In</Link>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 56px', maxWidth: 520, margin: '0 auto', width: '100%', animation: 'fadeUp .4s ease' }}>
      {/* Step progress */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
        {[1, 2].map((s) =>
          <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? 'var(--teal)' : 'var(--surface3)', transition: 'background .4s' }} />
        )}
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>Step {step} of 2</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
          {step === 1 ? 'Create your account' : 'Your details'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 300 }}>
          {step === 1 ? 'How will you be using Xpresswriters?' : 'Almost there — just a few more details.'}
        </p>
      </div>

      {errors.submit && (
        <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid var(--red)', padding: '12px', borderRadius: 7, color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>
          {errors.submit}
        </div>
      )}

      {step === 1 &&
        <div style={{ animation: 'fadeIn .3s ease' }}>
          {/* Google */}
          <SocialBtn icon="🔍" label="Sign up with Google" onClick={() => {}} />
          <Divider label="or choose your account type" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {ROLES.map((r) =>
              <div key={r.id} onClick={() => { setRole(r.id); setErrors({}); }} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 10, cursor: 'pointer', transition: 'all .2s',
                background: role === r.id ? 'rgba(13,148,136,0.1)' : 'var(--surface3)',
                border: `1.5px solid ${role === r.id ? 'var(--teal)' : 'var(--border)'}`
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: `${r.color}15`, border: `1px solid ${r.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{r.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2, color: 'var(--text)' }}>{r.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.desc}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${role === r.id ? 'var(--teal)' : 'var(--border)'}`, background: role === r.id ? 'var(--teal)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', flexShrink: 0 }}>
                  {role === r.id && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
              </div>
            )}
          </div>
          {errors.role && <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 12 }}>{errors.role}</div>}
          <PrimaryBtn onClick={handleNext}>Continue →</PrimaryBtn>
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--teal-light)', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>Sign in →</Link>
          </div>
        </div>
      }

      {step === 2 &&
        <div style={{ animation: 'fadeIn .3s ease' }}>
          <InputField label="Full Name" value={form.name} onChange={(v) => update('name', v)} placeholder="Dr. Amara Singh" icon="👤" error={errors.name} autoComplete="name" />
          <InputField label="Email Address" type="email" value={form.email} onChange={(v) => update('email', v)} placeholder="you@example.com" icon="✉️" error={errors.email} autoComplete="email" />
          
          {role === 'writer' && (
            <>
              <InputField label="Highest Qualification" value={form.education} onChange={(v) => update('education', v)} placeholder="e.g. Masters in English" icon="🎓" error={errors.education} />
              <InputField label="Experience (Years)" value={form.experience} onChange={(v) => update('experience', v)} placeholder="e.g. 5" icon="💼" error={errors.experience} type="number" />
              <InputField label="Resume Link / Portfolio" value={form.resumeUrl} onChange={(v) => update('resumeUrl', v)} placeholder="Link to your resume" icon="🔗" error={errors.resumeUrl} />
            </>
          )}

          <InputField label="Password" type="password" value={form.password} onChange={(v) => update('password', v)} placeholder="Create a strong password" error={errors.password} autoComplete="new-password" />
          <PasswordStrength password={form.password} />
          <InputField label="Confirm Password" type="password" value={form.confirmPassword} onChange={(v) => update('confirmPassword', v)} placeholder="Repeat password" error={errors.confirmPassword} autoComplete="new-password" />

          {/* Terms */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.agree} onChange={(e) => update('agree', e.target.checked)} style={{ accentColor: 'var(--teal)', marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                I agree to Xpresswriters' <span style={{ color: 'var(--teal-light)' }}>Terms of Service</span> and <span style={{ color: 'var(--teal-light)' }}>Privacy Policy</span>. I understand my data is encrypted and never shared.
              </span>
            </label>
            {errors.agree && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 5 }}>{errors.agree}</div>}
          </div>

          <PrimaryBtn onClick={handleNext} loading={loading}>
            {!loading && `Create ${role === 'writer' ? 'Writer' : 'Client'} Account →`}
          </PrimaryBtn>

          <button onClick={() => setStep(1)} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)', padding: '8px 0' }}>← Back</button>
        </div>
      }
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
