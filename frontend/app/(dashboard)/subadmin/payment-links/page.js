"use client";
import React from 'react';
import { AdminPaymentLinks } from '../../admin/admin-payment-links';

export default function SubAdminPaymentLinksPage() {
  return (
    <div style={{ padding: '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Payment Links</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Generate and manage payment links</p>
      </div>
      <AdminPaymentLinks />
    </div>
  );
}