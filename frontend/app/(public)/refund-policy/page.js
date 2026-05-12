"use client";
import LegalPage from '../legal-layout';

export const dynamic = 'force-dynamic';

export default function RefundPolicy() {
  return (
    <LegalPage 
      title="Refund Policy"
      content={
        <>
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>1. Eligibility for Refunds</h2>
            <p>Refunds may be requested if the delivered work does not meet the specified requirements, if a deadline is missed without prior notification, or if a duplicate payment was made.</p>
          </section>
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>2. Refund Process</h2>
            <p>To request a refund, please use the "Request Refund" button in your dashboard or contact support. All requests are reviewed by our admin team within 48 hours.</p>
          </section>
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>3. Partial Refunds</h2>
            <p>In cases where minor revisions are needed but the core requirements are met, we may offer a partial refund or service credits instead of a full reversal.</p>
          </section>
        </>
      }
    />
  );
}
