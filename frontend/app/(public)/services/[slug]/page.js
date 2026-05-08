"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

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

  if (loading) return <div style={{ padding: 100, textAlign: 'center' }}>Loading service details...</div>;
  if (!service) return <div style={{ padding: 100, textAlign: 'center' }}>Service not found.</div>;

  return (
    <div style={{ background: '#fff', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
      <section style={{ padding: '100px 20px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '24px' }}>{service.name}</h1>
        <p style={{ fontSize: '20px', opacity: 0.8, maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>{service.description}</p>
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <a href="/order" style={{ padding: '16px 32px', background: '#14b8a6', color: '#fff', borderRadius: '12px', fontWeight: '700', textDecoration: 'none' }}>Order Now (Starts at ₹{service.basePrice})</a>
          <a href="/pricing" style={{ padding: '16px 32px', border: '1px solid #475569', color: '#fff', borderRadius: '12px', fontWeight: '700', textDecoration: 'none' }}>View Detailed Pricing</a>
        </div>
      </section>

      <section style={{ padding: '80px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '24px' }}>What's Included?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {service.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '24px', height: '24px', background: '#f0fdfa', color: '#14b8a6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800' }}>✓</div>
                  <span style={{ fontSize: '16px', fontWeight: '500' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: '#f8fafc', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Need a custom quote?</h3>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>Every project is unique. If you have specific requirements or a massive project, get in touch with our experts for a tailored solution.</p>
            <a href="/contact" style={{ color: '#14b8a6', fontWeight: '700', textDecoration: 'none' }}>Speak to a Consultant →</a>
          </div>
        </div>
      </section>
    </div>
  );
}
