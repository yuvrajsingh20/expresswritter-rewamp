"use client";
import React from 'react';
import Link from 'next/link';

export default function PublicFooter() {
  return (
    <>
      {/* Trust band */}
      <div style={{ padding: '40px 32px', background: 'linear-gradient(135deg,rgba(13,148,136,0.06),transparent)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24, textAlign: 'center' }}>
          {[
            ['🔒', '100% Confidential', 'NDA-grade privacy on every order'],
            ['🎓', 'PhD-level writers', '340+ verified domain experts'],
            ['↻', 'Unlimited revisions', '2 free revisions on every plan'],
            ['🤝', 'No-Risk Revisions', 'Unlimited edits within 7 days']
          ].map(([i, t, d]) => (
            <div key={t}><div style={{ fontSize: 28, marginBottom: 7 }}>{i}</div><div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{t}</div><div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 300 }}>{d}</div></div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)', paddingTop: 60, paddingBottom: 30 }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 32px', display: 'flex', flexWrap: 'wrap', gap: 60, justifyContent: 'space-between', marginBottom: 60 }}>
          <div style={{ maxWidth: 300 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--text)', marginBottom: 20 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg,var(--teal),#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff' }}>X</div>
              <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>Xpresswriters</span>
            </Link>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24, fontWeight: 300 }}>Premium content writing services connecting freelance experts with customers worldwide. Confidential, plagiarism-free, on-time.</p>
            <div style={{ display: 'flex', gap: 14, color: 'var(--text-dim)', fontSize: 14 }}>
              <span style={{ cursor: 'pointer' }}>𝕏</span>
              <span style={{ cursor: 'pointer' }}>in</span>
              <span style={{ cursor: 'pointer' }}>📸</span>
              <span style={{ cursor: 'pointer' }}>✉</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 80, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 20 }}>PRODUCT</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Link href="/services" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>All Services</Link>
                <Link href="/pricing" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Pricing</Link>
                <Link href="/track" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Track Order</Link>
                <Link href="/register?role=freelancer" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Become a Writer</Link>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 20 }}>COMPANY</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Link href="/about" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>About</Link>
                <Link href="/contact" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Contact</Link>
                <Link href="/faq" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Help Center</Link>
                <Link href="/samples" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Samples</Link>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 20 }}>LEGAL</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <a href="/legal#terms" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</a>
                <a href="/legal#privacy" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
                <a href="/legal#refund" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Refund Policy</a>
                <a href="/legal#cookie" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, padding: '24px 32px 0' }}>
          <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 20, alignItems: 'center' }}>
            <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>© 2024 Xpresswriters Pvt Ltd. All rights reserved. Made with care in India.</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>GSTIN: 27AABCX1234X125 - CIN: U72200MH2023PTC123456</div>
          </div>
        </div>
      </footer>
    </>
  );
}

