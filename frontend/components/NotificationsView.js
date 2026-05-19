"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { getNotificationLink } from "@/lib/notifications/links";

export default function Notifications({ userName = "User", isMobile, onNavigate }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

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
//test 0
  const markAllRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Categorize notifications based on type
  const tabs = useMemo(() => [
    { id: 'all', label: 'All', icon: '📬' },
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'system', label: 'System', icon: '⚙️' }
  ], []);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    
    const typeMap = {
      orders: ['new_order', 'assignment', 'status', 'order_cancelled', 'revision', 'new_job'],
      messages: ['message'],
      payments: ['payment_received', 'payment_confirmed', 'payout'],
      system: ['ticket', 'system']
    };
    
    const allowedTypes = typeMap[activeTab] || [];
    return notifications.filter(n => allowedTypes.includes(n.type));
  }, [notifications, activeTab]);

  const getCategoryBadge = (type) => {
    const categoryMap = {
      'new_order': { label: 'Order', color: '#3b82f6' },
      'assignment': { label: 'Order', color: '#3b82f6' },
      'status': { label: 'Order', color: '#3b82f6' },
      'order_cancelled': { label: 'Order', color: '#ef4444' },
      'revision': { label: 'Order', color: '#f59e0b' },
      'new_job': { label: 'Order', color: '#3b82f6' },
      'message': { label: 'Message', color: '#8b5cf6' },
      'payment_received': { label: 'Payment', color: '#22c55e' },
      'payment_confirmed': { label: 'Payment', color: '#22c55e' },
      'payout': { label: 'Payment', color: '#f59e0b' },
      'ticket': { label: 'Support', color: '#ec4899' },
      'system': { label: 'System', color: '#6b7280' }
    };
    return categoryMap[type] || { label: 'Other', color: '#6b7280' };
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

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 20,
              border: '1px solid',
              borderColor: activeTab === tab.id ? 'var(--teal)' : 'var(--border2)',
              background: activeTab === tab.id ? 'rgba(13,148,136,0.1)' : 'transparent',
              color: activeTab === tab.id ? 'var(--teal-light)' : 'var(--text-muted)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.id !== 'all' && (
              <span style={{
                background: 'var(--surface2)',
                padding: '2px 6px',
                borderRadius: 10,
                fontSize: 10,
                color: 'var(--text-dim)'
              }}>
                {notifications.filter(n => {
                  const typeMap = {
                    orders: ['new_order', 'assignment', 'status', 'order_cancelled', 'revision', 'new_job'],
                    messages: ['message'],
                    payments: ['payment_received', 'payment_confirmed', 'payout'],
                    system: ['ticket', 'system']
                  };
                  return typeMap[tab.id]?.includes(n.type);
                }).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2, var(--border))', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-dim)' }}>Loading notifications...</div>
        ) : filteredNotifications.length > 0 ? filteredNotifications.map((n, i) => {
          const badge = getCategoryBadge(n.type);
          return (
            <div key={n.id} style={{
              display: 'flex',
              gap: 16,
              padding: isMobile ? '16px' : '20px 24px',
              background: n.read ? 'transparent' : 'rgba(13,148,136,0.04)',
              borderBottom: i < filteredNotifications.length - 1 ? '1px solid var(--border2, var(--border))' : 'none',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(128,128,128,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(13,148,136,0.04)'}
            >
              <div
                onClick={() => {
                  const userRole = session?.user?.role || 'STUDENT';
                  const resolvedLink = getNotificationLink(n.link, n.entityType, n.entityId, userRole);
                  
                  if (onNavigate) {
                    onNavigate(resolvedLink || n.link);
                  }
                }}
                style={{ display: 'flex', gap: 16, width: '100%' }}
              >
                {!n.read && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--teal)' }} />}
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {n.icon || '🔔'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ fontSize: 15, fontWeight: n.read ? 400 : 600, color: 'var(--text)' }}>{n.title}</h3>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 10,
                        background: `${badge.color}20`,
                        color: badge.color
                      }}>
                        {badge.label}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''} {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>{n.msg}</p>
                  {n.link && <span style={{ fontSize: 12, color: 'var(--teal-light)', fontWeight: 600 }}>View Details →</span>}
                </div>
              </div>
            </div>
          );
        }) : (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
            <div style={{ color: 'var(--text-muted)' }}>No notifications in this category.</div>
          </div>
        )}
      </div>
    </div>
  );
}