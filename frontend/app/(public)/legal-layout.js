"use client";
import React from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import '@/app/(auth)/landing.css';

export default function LegalPage({ title, content }) {
  return (
    <div className="landing-page-container">
      <PublicNavbar />
      <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', fontFamily: 'var(--font)' }}>
        <section style={{ padding: '140px 20px 80px', textAlign: 'center', background: 'radial-gradient(60% 100% at 50% 0%,rgba(13,148,136,0.12),transparent)', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.02em' }}>{title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 300 }}>Last Updated: May 2026</p>
        </section>

        <section style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 20px 100px' }}>
          <div style={{ background: 'var(--surface)', padding: '50px', borderRadius: '24px', border: '1px solid var(--border)', color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '15px', fontWeight: 300 }}>
            {content}
          </div>
        </section>
      </div>
      <PublicFooter />
    </div>
  );
}


// Sub-pages will import this and provide content.
