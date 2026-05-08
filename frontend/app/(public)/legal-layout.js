"use client";
import React from 'react';

export default function LegalPage({ title, content }) {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '80px 20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>{title}</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>Last Updated: May 2026</p>
        
        <div style={{ color: '#334155', lineHeight: '1.8', fontSize: '16px' }}>
          {content}
        </div>
      </div>
    </div>
  );
}

// Sub-pages will import this and provide content.
