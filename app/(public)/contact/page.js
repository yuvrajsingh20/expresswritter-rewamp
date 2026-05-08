"use client";
import React from 'react';

export default function ContactPage() {
  return (
    <div style={{ background: '#fff', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
      <section style={{ padding: '80px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '16px' }}>Get in Touch</h1>
          <p style={{ color: '#64748b', fontSize: '18px' }}>Have a question? We're here to help you 24/7.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '50px' }}>
          {/* Contact Form */}
          <div style={{ background: '#f8fafc', padding: '40px', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Send us a Message</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Name</label>
                <input placeholder="Your full name" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Email</label>
                <input placeholder="email@example.com" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Subject</label>
              <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff' }}>
                <option>General Inquiry</option>
                <option>Order Support</option>
                <option>Writer Application</option>
                <option>Billing Issues</option>
              </select>
            </div>
            <div style={{ marginBottom: '30px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Message</label>
              <textarea placeholder="How can we help?" rows={5} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', resize: 'none' }} />
            </div>
            <button style={{ width: '100%', padding: '16px', background: '#14b8a6', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>
              Send Message
            </button>
          </div>

          {/* Info Side */}
          <div>
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Email Support</h3>
              <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '8px' }}>support@xpresswriters.com</p>
              <p style={{ color: '#64748b', fontSize: '15px' }}>billing@xpresswriters.com</p>
            </div>
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>WhatsApp Support</h3>
              <p style={{ color: '#64748b', fontSize: '15px' }}>+91 98765 43210</p>
              <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#dcfce7', color: '#166534', borderRadius: '100px', fontSize: '12px', fontWeight: '700' }}>
                <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }} /> Active Now
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Office Address</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6' }}>
                123 Creative Plaza, Sector 44,<br />
                Gurugram, Haryana, India - 122003
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
