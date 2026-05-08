"use client";
import React from 'react';

export default function AboutPage() {
  return (
    <div style={{ background: '#fff', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
      {/* Hero Section */}
      <section style={{ padding: '100px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '24px', letterSpacing: '-0.02em' }}>We write your success story.</h1>
        <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
          Xpresswriters is a premier platform connecting elite academic and professional writers with students and agencies worldwide.
        </p>
      </section>

      {/* Mission Section */}
      <section style={{ padding: '80px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '20px' }}>Our Mission</h2>
            <p style={{ color: '#475569', fontSize: '16px', lineHeight: '1.8', marginBottom: '20px' }}>
              To bridge the gap between complex requirements and high-quality content delivery. We believe every student and professional deserves access to expert writing assistance that is both reliable and affordable.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#14b8a6' }}>500+</div>
                <div style={{ fontSize: '14px', color: '#94a8b3' }}>Expert Writers</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#14b8a6' }}>10k+</div>
                <div style={{ fontSize: '14px', color: '#94a8b3' }}>Projects Delivered</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#14b8a6' }}>99%</div>
                <div style={{ fontSize: '14px', color: '#94a8b3' }}>Client Satisfaction</div>
              </div>
            </div>
          </div>
          <div style={{ background: '#e2e8f0', height: '400px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a8b3', fontSize: '14px' }}>
             [Mission Illustration Placeholder]
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section style={{ padding: '80px 20px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '40px' }}>Meet the Visionaries</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9', margin: '0 auto 20px' }} />
                <div style={{ fontWeight: '700', fontSize: '18px' }}>Executive Member</div>
                <div style={{ fontSize: '14px', color: '#14b8a6', fontWeight: '600', marginBottom: '12px' }}>Role Title</div>
                <p style={{ fontSize: '13px', color: '#64748b' }}>Passionate about transforming the writing industry with technology.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
