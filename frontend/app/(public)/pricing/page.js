"use client";
import React, { useState, useEffect } from 'react';

export default function PricingPage() {
  const [service, setService] = useState('Academic Writing');
  const [deadline, setDeadline] = useState('7 Days');
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const RATES = {
    'Academic Writing': 450,
    'SOP Writing': 1200,
    'Resume/CV': 800,
    'Thesis/Research': 650,
    'Technical Article': 500,
  };

  const MULTIPLIERS = {
    '7 Days': 1,
    '3 Days': 1.5,
    '24 Hours': 2.2,
    '6 Hours': 3.5,
  };

  useEffect(() => {
    const base = RATES[service] || 450;
    const mult = MULTIPLIERS[deadline] || 1;
    setTotal(base * pages * mult);
  }, [service, deadline, pages]);

  return (
    <div style={{ background: '#fff', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
      <section style={{ padding: '80px 20px', textAlign: 'center', background: '#f8fafc' }}>
        <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '16px' }}>Transparent Pricing</h1>
        <p style={{ color: '#64748b', fontSize: '18px' }}>Calculate your project cost instantly with our smart estimator.</p>
      </section>

      <section style={{ padding: '80px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }}>
          {/* Calculator */}
          <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>Pricing Calculator</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '8px' }}>Select Service</label>
              <select 
                value={service} 
                onChange={(e) => setService(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '15px' }}
              >
                {Object.keys(RATES).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '8px' }}>Deadline</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {Object.keys(MULTIPLIERS).map(d => (
                  <button 
                    key={d}
                    onClick={() => setDeadline(d)}
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: deadline === d ? '2px solid #14b8a6' : '1px solid #e2e8f0',
                      background: deadline === d ? '#f0fdfa' : '#fff',
                      color: deadline === d ? '#0d9488' : '#64748b',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '8px' }}>Number of Pages (250 words/page)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => setPages(Math.max(1, pages - 1))} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff', fontSize: '20px', cursor: 'pointer' }}>-</button>
                <span style={{ fontSize: '20px', fontWeight: '800', width: '40px', textAlign: 'center' }}>{pages}</span>
                <button onClick={() => setPages(pages + 1)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff', fontSize: '20px', cursor: 'pointer' }}>+</button>
              </div>
            </div>

            <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Estimated Cost</div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a' }}>₹{total.toLocaleString()}</div>
              </div>
              <a href="/order" style={{ padding: '14px 28px', background: '#14b8a6', color: '#fff', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', boxShadow: '0 10px 15px -3px rgba(20, 184, 166, 0.3)' }}>
                Order Now →
              </a>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '24px' }}>Why choose Xpresswriters?</h2>
            {[
              { t: 'Plagiarism-Free', d: 'Every project is scanned with Turnitin for 100% originality.' },
              { t: 'Expert Writers', d: 'Only PhD and Master level writers handle your academic tasks.' },
              { t: 'Secure Payments', d: 'SSL encrypted transactions with industry leaders.' },
              { t: '24/7 Support', d: 'Human assistance available round the clock via chat.' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', background: '#f0fdfa', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14b8a6', fontSize: '20px', flexShrink: 0 }}>✓</div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{f.t}</h3>
                  <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
