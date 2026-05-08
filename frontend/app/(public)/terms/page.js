"use client";
import LegalPage from '../legal-layout';

export default function Terms() {
  return (
    <LegalPage 
      title="Terms of Service"
      content={
        <>
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>1. Service Provision</h2>
            <p>Xpresswriters provides professional writing and editing services. By placing an order, you agree to provide accurate information and compensate for the services rendered as per our pricing guidelines.</p>
          </section>
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>2. Intellectual Property</h2>
            <p>Upon full payment, the ownership of the delivered work is transferred to the customer. Xpresswriters retains no rights to the content once the transaction is complete.</p>
          </section>
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>3. User Conduct</h2>
            <p>Users must not use our services for any illegal or unethical purposes. We reserve the right to terminate service for users who violate these terms.</p>
          </section>
        </>
      }
    />
  );
}
