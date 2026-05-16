"use client";
import React, { useState } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import '@/app/(auth)/landing.css';

export default function FAQPage() {
  const [search, setSearch] = useState('');
  
  const FAQS = [
    { q: "How do I place an order?", a: "Simply sign up, click on 'New Order', fill in your requirements, and make a payment. A dedicated writer will be assigned within hours." },
    { q: "Can I request revisions?", a: "Yes, we offer unlimited revisions within 7 days of delivery to ensure the content meets your exact expectations." },
    { q: "Is my personal information safe?", a: "Absolutely. We use bank-grade encryption and strict privacy protocols. Your details are never shared with writers or third parties." },
    { q: "What payment methods do you accept?", a: "We accept all major Credit/Debit cards, UPI, Net Banking, and Wallet credits via our secure payment partners." },
    { q: "How are writers assigned?", a: "Writers are matched based on their expertise, academic background, and current rating in the specific service category you request." },
  ];

  const filtered = FAQS.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="landing-page-container">
      <PublicNavbar />
      <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', fontFamily: 'var(--font)' }}>
        <section style={{ padding: '140px 20px 60px', textAlign: 'center', background: 'radial-gradient(60% 100% at 50% 0%,rgba(13,148,136,0.12),transparent)', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.02em' }}>Help Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto', fontWeight: 300, marginBottom: '32px' }}>Everything you need to know about Xpresswriters.</p>
          
          <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
            <input 
              placeholder="Search for answers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '16px 20px 16px 50px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', outline: 'none', fontSize: '16px' }} 
            />
            <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', opacity: 0.5 }}>🔍</span>
          </div>
        </section>

        <section style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px 100px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map((f, i) => (
              <div key={i} style={{ background: 'var(--surface)', padding: '26px 30px', borderRadius: '18px', border: '1px solid var(--border)', transition: 'border 0.2s' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '12px', letterSpacing: '-0.01em' }}>{f.q}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7', fontWeight: 300 }}>{f.a}</p>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)', fontSize: '15px' }}>
                No results found for "{search}". Try another keyword or contact support.
              </div>
            )}
          </div>

          <div style={{ marginTop: '80px', textAlign: 'center', padding: '50px 40px', background: 'linear-gradient(135deg, var(--teal) 0%, #0d9488 100%)', borderRadius: '28px', color: '#fff', boxShadow: '0 20px 40px rgba(13, 148, 136, 0.2)' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.02em' }}>Still have questions?</h2>
            <p style={{ opacity: 0.9, marginBottom: '28px', fontWeight: 300, fontSize: '15px' }}>Our support team is available 24/7 to assist you with any inquiries.</p>
            <a href="/contact" style={{ display: 'inline-block', padding: '14px 40px', background: '#fff', color: '#0d9488', borderRadius: '14px', fontWeight: '700', textDecoration: 'none', transition: 'transform 0.2s', fontSize: '15px' }}>
              Contact Support
            </a>
          </div>
        </section>
      </div>
      <PublicFooter />
    </div>
  );
}

