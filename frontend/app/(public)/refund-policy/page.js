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
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>1. Pre-Delivery Refund Eligibility</h2>
            <p>Monetary refunds or service credits are only eligible if requested before work is completed and delivered. A full refund is guaranteed if we are unable to assign a qualified writer to your order, or if the order is cancelled within 1 hour of placement before writer assignment.</p>
          </section>
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>2. Post-Delivery Policy (All Sales Are Final)</h2>
            <p><strong>We do not offer refunds after any draft or finalized document has been delivered to your dashboard.</strong> Once files are generated and delivered by the writer, the service has been rendered, and all payments are non-refundable. However, we stand behind our work quality with our No-Risk Revisions policy.</p>
          </section>
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>3. No-Risk Revisions Guarantee</h2>
            <p>If you are not satisfied with the quality of the delivered work, you are entitled to unlimited revisions within the original scope of your order for up to 7 days. If the revisions are still not to your liking, you can request a writer re-assignment, and a new expert will re-draft your document at no additional cost.</p>
          </section>
        </>
      }
    />
  );
}
