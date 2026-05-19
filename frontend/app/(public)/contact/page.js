"use client";
import React from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import '@/app/(auth)/landing.css';

export default function ContactPage() {
  return (
    <div className="landing-page-container">
      <PublicNavbar />
      <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font)' }}>
        <section style={{ padding: '140px 20px 60px', textAlign: 'center', background: 'radial-gradient(60% 100% at 50% 0%,rgba(13,148,136,0.12),transparent)', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.02em' }}>Get in Touch</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto', fontWeight: 300 }}>Have a question? Our support team is here for you 24/7.</p>
        </section>

        <section style={{ padding: '80px 32px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '60px' }}>
            {/* Contact Form */}
            <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', letterSpacing: '-0.01em' }}>Send us a Message</h2>
              <form onSubmit={(e) => { e.preventDefault(); alert('Message received! We will get back to you shortly.'); e.target.reset(); }}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '10px', letterSpacing: '0.05em' }}>Name</label>
                  <input required placeholder="Your full name" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '10px', letterSpacing: '0.05em' }}>Email</label>
                  <input required type="email" placeholder="email@example.com" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '10px', letterSpacing: '0.05em' }}>Subject</label>
                  <select style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', outline: 'none' }}>
                    <option>General Inquiry</option>
                    <option>Order Support</option>
                    <option>Writer Application</option>
                    <option>Billing Issues</option>
                  </select>
                </div>
                <div style={{ marginBottom: '32px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '10px', letterSpacing: '0.05em' }}>Message</label>
                  <textarea required placeholder="How can we help?" rows={5} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', outline: 'none', resize: 'none' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: '16px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(13, 148, 136, 0.3)', transition: 'transform 0.2s' }}>
                  Send Message
                </button>
              </form>
            </div>

            {/* Info Side */}
            <div style={{ paddingTop: 10 }}>
              <div style={{ marginBottom: '48px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--teal-light)', marginBottom: '16px', letterSpacing: '0.1em' }}>Email Support</h3>
                <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>admin@expresswriter.in</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 300 }}>For billing and invoice related queries:<br/>admin@expresswriter.in</p>
              </div>

              <div style={{ marginBottom: '48px' }}>
                 <h3 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--teal-light)', marginBottom: '16px', letterSpacing: '0.1em' }}>Direct Contact</h3>
                 <a href="https://wa.me/918823830076" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 12, textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ width: 44, height: 44, background: 'rgba(34,197,94,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', fontSize: 20 }}>💬</div>
                    <div>
                      <p style={{ fontSize: '18px', fontWeight: '600' }}>+91 88238 30076</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>WhatsApp Support Available 24/7</p>
                    </div>
                 </a>
                 <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>
                   <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', animation: 'pulse 2s infinite' }} /> Active Support Online
                 </div>
               </div>

              <div>
                <h3 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--teal-light)', marginBottom: '16px', letterSpacing: '0.1em' }}>Registered Office</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7', fontWeight: 300 }}>
                  Space Time Plot 45, Second Floor,<br />
                  Scheme 78 Part-2, Vijay Nagar,<br />
                  Indore, Madhya Pradesh 452001, India
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <PublicFooter />
    </div>
  );
}

