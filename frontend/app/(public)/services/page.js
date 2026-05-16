"use client";
import React from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';
import servicesData from '@/data/services_data.json';
import '@/app/(auth)/landing.css';

export default function ServicesPage() {
  const services = servicesData.services || [];

  return (
    <div className="landing-page-container">
      <PublicNavbar />
      <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font)' }}>
        <section style={{ padding: '160px 20px 80px', textAlign: 'center', background: 'radial-gradient(60% 100% at 50% 0%,rgba(13,148,136,0.15),transparent)', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontSize: '56px', fontWeight: '800', marginBottom: '18px', letterSpacing: '-0.03em' }}>Our Services</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '20px', maxWidth: '700px', margin: '0 auto', fontWeight: 300 }}>PhD-level writing and editing for every stage of your academic and professional journey.</p>
        </section>

        <section style={{ padding: '100px 32px', maxWidth: '1320px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {services.map((s, i) => (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>{s.icon || '📝'}</div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px', letterSpacing: '-0.01em' }}>{s.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', lineHeight: '1.6', marginBottom: '24px', flex: 1, fontWeight: 300 }}>{s.description}</p>
                
                <div style={{ marginBottom: '24px' }}>
                  {s.features?.slice(0, 3).map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-dim)' }}>
                      <span style={{ color: 'var(--teal-light)' }}>✓</span> {f}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border2)' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Starts at</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--teal-light)' }}>₹{s.basePrice || s.variants?.[0]?.price || '450'}</div>
                  </div>
                  <Link href={`/services/${s.slug || s.name.toLowerCase().replace(/ /g, '-')}`} style={{ padding: '10px 20px', borderRadius: '10px', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px', fontWeight: '600', textDecoration: 'none', transition: 'all 0.2s' }}>
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: '100px 32px', textAlign: 'center', background: 'rgba(13,148,136,0.03)', borderTop: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Don't see what you're looking for?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>We handle custom research projects, technical documentation, and complex editing tasks that aren't listed here.</p>
          <Link href="/contact" className="btn-teal" style={{ padding: '14px 40px', fontSize: '15px' }}>Get a Custom Quote</Link>
        </section>
      </div>
      <PublicFooter />
    </div>
  );
}
