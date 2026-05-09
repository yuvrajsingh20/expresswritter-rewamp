"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { InputField, PrimaryBtn } from "../auth-components";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new pass, 4=done
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((r) => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleSendOtp = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setResendTimer(60);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp]; next[i] = v.slice(-1); setOtp(next);
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) { setError('Enter the 6-digit code'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(3);
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPass = async () => {
    if (!newPass || newPass.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPass !== confirmPass) { setError('Passwords do not match'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join(''), newPassword: newPass }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(4);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const stepMeta = [
    { title: 'Reset your password', sub: 'Enter your email and we\'ll send a verification code.' },
    { title: 'Check your email', sub: `We sent a 6-digit code to ${email || 'your email'}.` },
    { title: 'Create new password', sub: 'Choose a strong password for your account.' },
    { title: 'Password reset!', sub: 'Your password has been updated successfully.' }
  ];

  const meta = stepMeta[step - 1];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 56px', maxWidth: 480, margin: '0 auto', width: '100%', animation: 'fadeUp .4s ease' }}>
      {/* Back */}
      {step < 4 &&
        <button onClick={() => step === 1 ? router.push('/login') : setStep((s) => s - 1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, marginBottom: 32, padding: 0, alignSelf: 'flex-start' }}>
          <span>←</span> {step === 1 ? 'Back to sign in' : 'Back'}
        </button>
      }

      {/* Step indicator */}
      {step < 4 &&
        <div style={{ display: 'flex', gap: 5, marginBottom: 32 }}>
          {[1, 2, 3].map((s) =>
            <div key={s} style={{ flex: 1, height: 2, borderRadius: 1, background: s <= step ? 'var(--teal)' : 'var(--surface3)', transition: 'background .4s' }} />
          )}
        </div>
      }

      {/* Icon */}
      <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(13,148,136,0.1)', border: '1px solid var(--border-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 22 }}>
        {step === 1 ? '✉️' : step === 2 ? '🔢' : step === 3 ? '🔐' : '✅'}
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>{meta.title}</h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 28, fontWeight: 300 }}>{meta.sub}</p>

      {/* Step 1: Email */}
      {step === 1 &&
        <>
          <InputField label="Email Address" type="email" value={email} onChange={(v) => { setEmail(v); setError(''); }} placeholder="you@example.com" icon="✉️" error={error} />
          <PrimaryBtn onClick={handleSendOtp} loading={loading}>{!loading && 'Send Verification Code →'}</PrimaryBtn>
        </>
      }

      {/* Step 2: OTP */}
      {step === 2 &&
        <>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>6-Digit Code</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {otp.map((digit, i) =>
                <input key={i} ref={(el) => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKey(i, e)}
                  style={{
                    width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700,
                    background: 'var(--surface3)', border: `1.5px solid ${digit ? 'var(--teal)' : 'var(--border)'}`,
                    borderRadius: 8, color: 'var(--text)', outline: 'none', fontFamily: 'var(--font)',
                    transition: 'border-color .2s'
                  }} />
              )}
            </div>
            {error && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 10, textAlign: 'center' }}>{error}</div>}
          </div>

          {/* Resend */}
          <div style={{ textAlign: 'center', marginBottom: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            Didn't receive it?{' '}
            {resendTimer > 0 ?
              <span style={{ color: 'var(--text-dim)' }}>Resend in {resendTimer}s</span> :
              <button onClick={() => { setResendTimer(60); }} style={{ background: 'none', border: 'none', color: 'var(--teal-light)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600 }}>Resend code</button>
            }
          </div>

          <PrimaryBtn onClick={handleVerifyOtp} loading={loading}>{!loading && 'Verify Code →'}</PrimaryBtn>
        </>
      }

      {/* Step 3: New password */}
      {step === 3 &&
        <>
          <InputField label="New Password" type="password" value={newPass} onChange={(v) => { setNewPass(v); setError(''); }} placeholder="Create a strong password" />
          <InputField label="Confirm Password" type="password" value={confirmPass} onChange={(v) => { setConfirmPass(v); setError(''); }} placeholder="Repeat new password" />
          {error && <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 12, marginTop: -8 }}>{error}</div>}
          <PrimaryBtn onClick={handleResetPass} loading={loading}>{!loading && 'Reset Password →'}</PrimaryBtn>
        </>
      }

      {/* Step 4: Success */}
      {step === 4 &&
        <div style={{ textAlign: 'center', animation: 'fadeUp .4s ease' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 20px', animation: 'checkPop .5s ease' }}>✓</div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 28 }}>Your password has been reset. You can now sign in with your new password.</p>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <PrimaryBtn>Sign In Now →</PrimaryBtn>
          </Link>
        </div>
      }

      {step < 4 &&
        <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, color: 'var(--text-dim)' }}>
          <span>🔒</span> Secured with 256-bit TLS · Code expires in 10 minutes
        </div>
      }
    </div>
  );
}
