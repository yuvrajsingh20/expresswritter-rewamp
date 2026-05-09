"use client";
import { useState } from "react";

export function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

export function SocialBtn({ icon, label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      padding: '11px 0', borderRadius: 7, border: `1px solid ${hov ? 'var(--teal)' : 'var(--border)'}`,
      background: hov ? 'rgba(13,148,136,0.06)' : 'var(--surface3)',
      color: 'var(--text)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
      fontFamily: 'var(--font)', transition: 'all .2s'
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>{label}
    </button>
  );
}

export function InputField({ label, type = 'text', value, onChange, placeholder, error, icon, trailing, autoComplete }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: focused ? 'var(--teal-light)' : 'var(--text-muted)', display: 'block', marginBottom: 7, textTransform: 'uppercase', transition: 'color .2s' }}>{label}</label>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && <span style={{ position: 'absolute', left: 12, fontSize: 16, color: focused ? 'var(--teal-light)' : 'var(--text-dim)', pointerEvents: 'none', transition: 'color .2s' }}>{icon}</span>}
        <input
          type={isPass && !show ? 'password' : isPass ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', background: 'var(--surface3)',
            border: `1.5px solid ${error ? 'var(--red)' : focused ? 'var(--teal)' : 'var(--border)'}`,
            borderRadius: 7, padding: `11px ${isPass || trailing ? '42px' : '14px'} 11px ${icon ? '40px' : '14px'}`,
            color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font)',
            transition: 'border-color .2s'
          }} />
        
        {isPass &&
        <button type="button" onClick={() => setShow((s) => !s)} style={{ position: 'absolute', right: 12, background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 16, padding: 0, display: 'flex', alignItems: 'center' }}>
            {show ? '🙈' : '👁'}
          </button>
        }
        {trailing && !isPass && <span style={{ position: 'absolute', right: 12, color: 'var(--text-dim)', fontSize: 14 }}>{trailing}</span>}
      </div>
      {error && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4, animation: 'fadeIn .2s ease' }}><span>⚠</span>{error}</div>}
    </div>
  );
}

export function PrimaryBtn({ children, onClick, loading, disabled, fullWidth = true, variant = 'primary' }) {
  const styles = {
    primary: { background: 'var(--teal)', color: '#fff' },
    outline: { background: 'transparent', color: 'var(--text-muted)', border: '1.5px solid var(--border)' }
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      ...(styles[variant] || styles.primary),
      width: fullWidth ? '100%' : 'auto',
      padding: '13px 24px', borderRadius: 7, border: 'none',
      fontSize: 15, fontWeight: 600, cursor: disabled || loading ? 'default' : 'pointer',
      fontFamily: 'var(--font)', transition: 'all .2s',
      opacity: disabled ? 0.5 : 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
    }}
    onMouseEnter={(e) => {if (!disabled && !loading && variant === 'primary') e.currentTarget.style.background = '#0f766e';}}
    onMouseLeave={(e) => {if (variant === 'primary') e.currentTarget.style.background = 'var(--teal)';}}>
      
      {loading && <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />}
      {children}
    </button>
  );
}
