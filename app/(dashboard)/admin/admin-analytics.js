"use client";
import React, { useMemo } from "react";
import { Card, CardHeader, Pill, Select } from "./admin-shared";

export function AdminAnalytics({ projects = [], freelancersCount = 0 }) {
  const stats = useMemo(() => {
    const totalRevenue = projects.reduce((acc, p) => acc + (p.amount || 0), 0);
    const avgOrderValue = projects.length ? (totalRevenue / projects.length).toFixed(0) : 0;
    
    // Service distribution
    const services = {};
    projects.forEach(p => {
      services[p.serviceType] = (services[p.serviceType] || 0) + 1;
    });
    
    const serviceShare = Object.entries(services).map(([label, count]) => ({
      label,
      val: ((count / projects.length) * 100).toFixed(0),
      color: label.includes('SOP') ? 'var(--teal)' : label.includes('Thesis') ? 'var(--amber)' : 'var(--green)'
    })).sort((a,b) => b.val - a.val).slice(0, 4);

    return { totalRevenue, avgOrderValue, serviceShare };
  }, [projects]);

  // Monthly trends (Last 6 months)
  const revenueTrends = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const last6 = [];
    for(let i=5; i>=0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mLabel = months[d.getMonth()];
      const rev = projects.filter(p => {
        const pd = new Date(p.createdAt);
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
      }).reduce((acc, p) => acc + (p.amount || 0), 0);
      last6.push({ month: mLabel, revenue: rev });
    }
    return last6;
  }, [projects]);
  
  const metrics = [
    { label: 'Total Revenue', val: `₹${stats.totalRevenue.toLocaleString()}`, trend: '+12%', sub: 'Lifetime sales' },
    { label: 'Avg Order Value', val: `₹${stats.avgOrderValue}`, trend: '+5%', sub: 'Per transaction' },
    { label: 'Order Volume', val: projects.length, trend: '+18%', sub: 'Completed orders' },
    { label: 'Active Writers', val: freelancersCount || '0', trend: '+2', sub: 'Verified specialists' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Business Intelligence</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Real-time platform performance and revenue analytics.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>{m.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{m.val}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: m.trend.startsWith('+') ? 'var(--green)' : 'var(--red)' }}>{m.trend}</span>
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{m.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28 }}>
        <Card>
          <CardHeader title="Revenue Trends" right={<Pill label="Real-time" color="var(--teal)" />} />
          <div style={{ padding: 24, height: 300, display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            {revenueTrends.map((t, i) => {
              const maxRev = Math.max(...revenueTrends.map(x => x.revenue), 1000);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: '100%', background: 'linear-gradient(to top, var(--teal), var(--teal-light))', borderRadius: '4px 4px 0 0', height: `${(t.revenue / maxRev) * 100}%`, minHeight: 4, transition: 'height 1s ease', opacity: 0.8 }} />
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{t.month}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Service Share" />
          <div style={{ padding: 20 }}>
            {stats.serviceShare.length > 0 ? stats.serviceShare.map((s, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{s.label || 'Other'}</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{s.val}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.val}%`, background: s.color }} />
                </div>
              </div>
            )) : <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>No data available</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
