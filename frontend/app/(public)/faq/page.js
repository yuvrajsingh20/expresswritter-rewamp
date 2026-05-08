"use client";
import React, { useState } from 'react';

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
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '80px 20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '16px', color: '#0f172a' }}>Frequently Asked Questions</h1>
          <p style={{ color: '#64748b', fontSize: '18px', marginBottom: '32px' }}>Everything you need to know about Xpresswriters.</p>
          
          <div style={{ position: 'relative' }}>
            <input 
              placeholder="Search for answers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '16px 20px 16px 50px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
            />
            <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>🔍</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((f, i) => (
            <div key={i} style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '12px', color: '#0f172a' }}>{f.q}</h3>
              <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6' }}>{f.a}</p>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a8b3' }}>No results found for "{search}". Try another keyword.</div>
          )}
        </div>

        <div style={{ marginTop: '60px', textAlign: 'center', padding: '40px', background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', borderRadius: '24px', color: '#fff' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Still have questions?</h2>
          <p style={{ opacity: 0.9, marginBottom: '24px' }}>Our support team is available 24/7 to assist you with any inquiries.</p>
          <a href="/contact" style={{ display: 'inline-block', padding: '12px 32px', background: '#fff', color: '#0d9488', borderRadius: '100px', fontWeight: '700', textDecoration: 'none', transition: 'transform 0.2s' }}>
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
