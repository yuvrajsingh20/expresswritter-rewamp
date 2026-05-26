"use client";
import React from 'react';
import { AdminPromos } from '../../admin/admin-promos';

export default function SubAdminPromosPage() {
  return (
    <div style={{ padding: '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Promo Engine</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Create and manage promotional codes</p>
      </div>
      <AdminPromos />
    </div>
  );
}