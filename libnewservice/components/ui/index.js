'use client';

import React from 'react';

/* ────────── Button ────────── */
export function Btn({ children, variant = 'primary', onClick, small, disabled, type, style: s = {} }) {
  const base = {
    fontFamily: 'var(--font)',
    cursor: disabled ? 'default' : 'pointer',
    border: 'none',
    borderRadius: 6,
    fontWeight: 600,
    transition: 'all .2s',
    opacity: disabled ? 0.5 : 1,
  };
  const variants = {
    primary: { background: 'var(--teal)', color: '#fff',                    padding: small ? '5px 12px' : '9px 18px', fontSize: small ? 12 : 13 },
    outline: { background: 'transparent', color: 'var(--text-muted)',        border: '1px solid var(--border)',           padding: small ? '5px 12px' : '9px 18px', fontSize: small ? 12 : 13 },
    danger:  { background: 'rgba(244,63,94,0.12)', color: 'var(--red)',      border: '1px solid rgba(244,63,94,0.2)',      padding: small ? '5px 12px' : '9px 18px', fontSize: small ? 12 : 13 },
    ghost:   { background: 'transparent', color: 'var(--text-muted)',                                                       padding: small ? '5px 12px' : '9px 18px', fontSize: small ? 12 : 13 },
  };
  return (
    <button type={type || 'button'} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...s }}>
      {children}
    </button>
  );
}

/* ────────── Card ────────── */
export function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, right }) {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span
        style={{
          fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--text-muted)',
        }}
      >
        {title}
      </span>
      {right}
    </div>
  );
}

/* ────────── Pill ────────── */
export function Pill({ label, color = 'var(--teal)', bg }) {
  return (
    <span
      style={{
        fontSize: 10, fontWeight: 700,
        padding: '2px 8px', borderRadius: 100,
        background: bg || `${color}18`,
        color,
        border: `1px solid ${color}30`,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

/* ────────── Toggle ────────── */
export function Toggle({ value, onChange, disabled }) {
  return (
    <div
      onClick={() => !disabled && onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 11, position: 'relative',
        cursor: disabled ? 'default' : 'pointer',
        background: value ? 'var(--teal)' : 'var(--surface4)',
        transition: 'background .25s', flexShrink: 0,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <div
        style={{
          position: 'absolute', top: 3, left: value ? 21 : 3,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff', transition: 'left .25s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      />
    </div>
  );
}

/* ────────── Input / Select / Textarea ────────── */
export function Input({ label, value, onChange, placeholder, type = 'text', mono, sublabel }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label
          style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
            color: 'var(--text-muted)', display: 'block',
            marginBottom: 6, textTransform: 'uppercase',
          }}
        >
          {label}
        </label>
      )}
      {sublabel && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}>{sublabel}</div>}
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', background: 'var(--surface3)',
          border: '1px solid var(--border)', borderRadius: 6,
          padding: '9px 12px', color: 'var(--text)',
          fontSize: 13, outline: 'none',
          fontFamily: mono ? 'var(--mono)' : 'var(--font)',
        }}
      />
    </div>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label
          style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
            color: 'var(--text-muted)', display: 'block',
            marginBottom: 6, textTransform: 'uppercase',
          }}
        >
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        style={{
          width: '100%', background: 'var(--surface3)',
          border: '1px solid var(--border)', borderRadius: 6,
          padding: '9px 12px', color: 'var(--text)',
          fontSize: 13, outline: 'none', cursor: 'pointer',
        }}
      >
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Textarea({ label, value, onChange, rows = 4, defaultValue }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label
          style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
            color: 'var(--text-muted)', display: 'block',
            marginBottom: 6, textTransform: 'uppercase',
          }}
        >
          {label}
        </label>
      )}
      <textarea
        defaultValue={defaultValue}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        rows={rows}
        style={{
          width: '100%', background: 'var(--surface3)',
          border: '1px solid var(--border)', borderRadius: 6,
          padding: '9px 12px', color: 'var(--text)',
          fontSize: 13, fontFamily: 'var(--font)',
          outline: 'none', resize: 'vertical', lineHeight: 1.6,
        }}
      />
    </div>
  );
}

/* ────────── Section header + sub-tabs ────────── */
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 24, gap: 16,
      }}
    >
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{title}</h2>
        {subtitle && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 560 }}>{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function SubTabs({ tabs, active, onChange }) {
  return (
    <div
      style={{
        display: 'flex', gap: 2, marginBottom: 20,
        borderBottom: '1px solid var(--border)',
      }}
    >
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          style={{
            padding: '8px 16px', border: 'none',
            borderBottom: `2px solid ${active === t ? 'var(--teal)' : 'transparent'}`,
            background: 'transparent',
            color: active === t ? 'var(--teal-light)' : 'var(--text-muted)',
            fontSize: 13, fontWeight: active === t ? 600 : 400,
            cursor: 'pointer', fontFamily: 'var(--font)',
            transition: 'all .2s', marginBottom: -1,
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
