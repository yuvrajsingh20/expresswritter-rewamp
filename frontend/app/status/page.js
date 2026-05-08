"use client";
import React, { useState, useEffect } from 'react';

export default function StatusPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setHealth(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 100, textAlign: 'center' }}>Checking systems...</div>;

  return (
    <div style={{ background: '#09090b', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif', padding: '80px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>Resolved - We experienced brief delays in email notifications. Our engineers have resolved the issue.</p>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.7; }
          100% { transform: scale(0.95); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
