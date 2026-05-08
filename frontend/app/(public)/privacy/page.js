"use client";
import LegalPage from '../legal-layout';

export default function Privacy() {
  return (
    <LegalPage 
      title="Privacy Policy"
      content={
        <>
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>1. Information We Collect</h2>
            <p>At Xpresswriters, we collect information to provide better services to all our users. This includes your name, email address, payment information, and project details you provide during the order process.</p>
          </section>
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>2. How We Use Information</h2>
            <p>We use the information we collect to process your orders, communicate with you about your projects, and improve our writing services. We do not sell your personal information to third parties.</p>
          </section>
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>3. Data Security</h2>
            <p>We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.</p>
          </section>
        </>
      }
    />
  );
}
