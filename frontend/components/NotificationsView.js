"use client";
import React, { useState, useEffect } from "react";

export default function Notifications({ userName = "User", isMobile }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch notifications:", err);
        setLoading(false);
      });
  }, []);

  const markAllRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <div style={{ padding: isMobile ? '16px 20px' : '32px 36px', overflowY: 'auto', height: '100%', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: isMobile ? 16 : 0, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Notifications Center</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Stay updated with your orders and account activity.</p>
        </div>
        <button
          onClick={markAllRead}
          style={{ background: 'none', border: '1px solid var(--border2, var(--border))', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          Mark all as read
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2, var(--border))', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-dim)' }}>Loading notifications...</div>
        ) : notifications.length > 0 ? notifications.map((n, i) => (
          <div key={n.id} style={{
            display: 'flex',
            gap: 16,
            padding: isMobile ? '16px' : '20px 24px',
            background: n.read ? 'transparent' : 'rgba(13,148,136,0.04)',
            borderBottom: i < notifications.length - 1 ? '1px solid var(--border2, var(--border))' : 'none',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(128,128,128,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(13,148,136,0.04)'}
          >
            {!n.read && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--teal)' }} />}
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {n.icon || '🔔'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <h3 style={{ fontSize: 15, fontWeight: n.read ? 400 : 600, color: 'var(--text)' }}>{n.title}</h3>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''} {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>{n.msg}</p>
            </div>
          </div>
        )) : (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
            <div style={{ color: 'var(--text-muted)' }}>You're all caught up! No new notifications.</div>
          </div>
        )}
      </div>
    </div>
  );
}
