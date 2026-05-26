"use client";
import React from 'react';
import { AdminTickets } from '../../admin/admin-tickets';

export default function SubAdminTicketsPage() {
  return (
    <div style={{ padding: '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Ticketing System</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage customer and writer support tickets</p>
      </div>
      <AdminTickets />
    </div>
  );
}