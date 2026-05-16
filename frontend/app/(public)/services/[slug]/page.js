"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';
import '@/app/(auth)/landing.css';

export default function ServiceDetail() {
  const params = useParams();
  const slug = params.slug;
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/services/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setService(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>Loading service details...</div>;
  if (!service) return <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
    <h2>Service not found.</h2>
    <Link href="/" style={{ color: 'var(--teal-light)', marginTop: 20 }}>Return Home</Link>
  </div>;

  return (
    <div className="landing-page-container">
      <PublicNavbar />
      <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font)' }}>
        <section style={{ padding: '160px 20px 100px', background: 'radial-gradient(60% 100% at 50% 0%,rgba(13,148,136,0.15),transparent)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '56px', fontWeight: '800', marginBottom: '24px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{service.name}</h1>
            <p style={{ fontSize: '20px', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6', fontWeight: 300 }}>{service.description}</p>
            <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/" style={{ padding: '16px 36px', background: 'var(--teal)', color: '#fff', borderRadius: '14px', fontWeight: '700', textDecoration: 'none', boxShadow: '0 10px 20px rgba(13, 148, 136, 0.3)' }}>Order Now (Starts at ₹{service.basePrice})</Link>
              <Link href="/pricing" style={{ padding: '16px 36px', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', borderRadius: '14px', fontWeight: '700', textDecoration: 'none' }}>Detailed Pricing</Link>
            </div>
          </div>
        </section>

        <section style={{ padding: '100px 32px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '80px', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '32px', letterSpacing: '-0.02em' }}>What's Included?</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {service.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '28px', height: '28px', background: 'rgba(13,148,136,0.1)', color: 'var(--teal-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', flexShrink: 0 }}>✓</div>
                    <span style={{ fontSize: '17px', color: 'var(--text-muted)', fontWeight: 300 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ background: 'var(--surface)', padding: '48px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', letterSpacing: '-0.01em' }}>Need a custom quote?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7', marginBottom: '28px', fontWeight: 300 }}>Every project is unique. If you have specific requirements, complex data, or a large-scale project, our consultants are ready to help you build a custom plan.</p>
              <Link href="/contact" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--teal-light)', fontWeight: '700', textDecoration: 'none', fontSize: '16px' }}>
                Speak to a Consultant <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
      <PublicFooter />
    </div>
  );
}

