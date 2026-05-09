"use client";
import React, { useState, useEffect } from "react";
// ── SHARED ADMIN COMPONENTS ──
// Exports to window for cross-file use



export function Toggle({ value, onChange, label, sublabel, disabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{sublabel}</div>}
      </div>
      <div onClick={() => !disabled && onChange(!value)} style={{
        width: 40, height: 22, borderRadius: 11, position: 'relative', cursor: disabled ? 'default' : 'pointer',
        background: value ? 'var(--teal)' : 'var(--surface4)', transition: 'background .25s', flexShrink: 0,
        opacity: disabled ? 0.4 : 1,
      }}>
        <div style={{ position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
      </div>
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 560 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, style = {} }) {
  return <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, ...style }}>{children}</div>;
}

export function CardHeader({ title, right }) {
  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{title}</span>
      {right}
    </div>
  );
}

export function Pill({ label, color, bg }) {
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: bg || `${color}18`, color: color, border: `1px solid ${color}30`, whiteSpace: 'nowrap' }}>{label}</span>;
}

export function StatusDot({ active }) {
  return <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? 'var(--green)' : 'var(--red)', display: 'inline-block', marginRight: 5, animation: active ? 'pulse 2s infinite' : 'none' }} />;
}

export function Btn({ children, variant = 'primary', onClick, small, disabled, style: s = {} }) {
  const base = { fontFamily: 'var(--font)', cursor: disabled ? 'default' : 'pointer', border: 'none', borderRadius: 6, fontWeight: 600, transition: 'all .2s', opacity: disabled ? 0.5 : 1 };
  const variants = {
    primary: { background: 'var(--teal)', color: '#fff', padding: small ? '5px 12px' : '9px 18px', fontSize: small ? 12 : 13 },
    outline: { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: small ? '5px 12px' : '9px 18px', fontSize: small ? 12 : 13 },
    danger: { background: 'rgba(244,63,94,0.12)', color: 'var(--red)', border: '1px solid rgba(244,63,94,0.2)', padding: small ? '5px 12px' : '9px 18px', fontSize: small ? 12 : 13 },
    ghost: { background: 'transparent', color: 'var(--text-muted)', padding: small ? '5px 12px' : '9px 18px', fontSize: small ? 12 : 13 },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...s }}>{children}</button>;
}

export function Input({ label, value, onChange, placeholder, type = 'text', mono, sublabel }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>{label}</label>}
      {sublabel && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}>{sublabel}</div>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: mono ? 'var(--mono)' : 'var(--font)' }} />
    </div>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)', cursor: 'pointer' }}>
        {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
      </select>
    </div>
  );
}

export function Table({ cols, rows, onRowClick }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--surface3)' }}>
            {cols.map(c => <th key={c} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} onClick={() => onRowClick && onRowClick(row)} style={{ borderBottom: '1px solid var(--border)', cursor: onRowClick ? 'pointer' : 'default', transition: 'background .15s' }}
              onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = 'rgba(13,148,136,0.04)'; }}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {row.map((cell, j) => <td key={j} style={{ padding: '10px 14px', fontSize: 12, color: j === 0 ? 'var(--text)' : 'var(--text-muted)', verticalAlign: 'middle' }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SubTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)} style={{
          padding: '8px 16px', border: 'none', borderBottom: `2px solid ${active === t ? 'var(--teal)' : 'transparent'}`,
          background: 'transparent', color: active === t ? 'var(--teal-light)' : 'var(--text-muted)',
          fontSize: 13, fontWeight: active === t ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .2s', marginBottom: -1,
        }}>{t}</button>
      ))}
    </div>
  );
}

export function SaveBar({ onSave, saved }) {
  return (
    <div style={{ position: 'sticky', bottom: 0, left: 0, right: 0, padding: '12px 0 0', background: 'linear-gradient(to top, var(--bg) 70%, transparent)', display: 'flex', gap: 10, alignItems: 'center', marginTop: 20 }}>
      <Btn onClick={onSave} style={{ minWidth: 120 }}>{saved ? '✓ Saved!' : 'Save Changes'}</Btn>
      <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Changes are applied immediately after saving.</span>
    </div>
  );
}

// 
