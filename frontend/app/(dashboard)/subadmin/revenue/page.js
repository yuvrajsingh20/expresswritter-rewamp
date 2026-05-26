"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AdminPayments } from '../../admin/admin-payments';

export default function SubAdminRevenuePage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState([]);
  const [config, setConfig] = useState(null);
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "SUB_ADMIN") return;
    const fetchData = async () => {
      try {
        const [projRes, confRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/admin/config/currency')
        ]);
        if (projRes.ok) {
          const projData = await projRes.json();
          setProjects(Array.isArray(projData) ? projData : []);
        }
        if (confRes.ok) {
          const confData = await confRes.json();
          setConfig(confData);
          setDisplayCurrency(confData?.baseCurrency || 'USD');
        }
      } catch (err) {
        console.error("Failed to fetch revenue data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [status, session]);

  if (loading) {
    return (
      <div style={{ padding: '28px 32px', height: '100%' }}>
        <div style={{ height: 22, width: 200, background: 'var(--surface3)', borderRadius: 4, marginBottom: 14 }} />
        <div style={{ height: 300, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, animation: 'pulse 2s infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Revenue Reports</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>View transaction history and revenue analytics</p>
      </div>
      <AdminPayments 
        projects={projects} 
        config={config} 
        displayCurrency={displayCurrency} 
        setDisplayCurrency={setDisplayCurrency} 
      />
    </div>
  );
}