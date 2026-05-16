"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import io from 'socket.io-client';
import { getNotificationLink, resolveNotificationLink } from '@/lib/notifications/links';

export default function NotificationBell({ onNavigate }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');

  const filteredNotifs = useMemo(() => {
    if (filter === 'all') return notifications.slice(0, 10);
    const typeMap = {
      orders: ['new_order', 'assignment', 'status', 'order_cancelled', 'revision', 'new_job'],
      messages: ['message'],
      payments: ['payment_received', 'payment_confirmed', 'payout']
    };
    return notifications.filter(n => typeMap[filter]?.includes(n.type)).slice(0, 10);
  }, [notifications, filter]);

  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (session?.user?.id) {
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
      socket.emit('join_chat', { userId: session.user.id, role: session.user.role });

      socket.on('new_notification', (data) => {
        // Optimistically add it
        setNotifications(prev => [{
          id: Date.now().toString(),
          ...data,
          read: false,
          createdAt: new Date().toISOString()
        }, ...prev]);
        setUnreadCount(c => c + 1);
      });

      // Poll as fallback
      const interval = setInterval(fetchNotifications, 30000);

      return () => {
        socket.disconnect();
        clearInterval(interval);
      };
    }
  }, [session?.user?.id]);

  const markAsRead = async (id) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      // Send single request - backend marks ALL unread as read
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

const handleNotificationClickWithEntity = (notification) => {
    const { link, entityType, entityId, type } = notification;
    const userRole = session?.user?.role || 'STUDENT';
    
    // Use new resolver for entity-based links, fallback to legacy link parsing
    const resolvedLink = getNotificationLink(link, entityType, entityId, userRole);
    const targetLink = resolvedLink || link;
    
    if (onNavigate && targetLink) {
      onNavigate(targetLink);
    } else if (targetLink) {
      router.push(targetLink);
    }
    
    setOpen(false);
  };

  if (status === 'loading') {
    return (
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8, cursor: 'wait' }}>
        <span style={{ fontSize: 18, animation: 'pulse 2s infinite' }}>🔔</span>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div style={{ position: 'relative', zIndex: 9999 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          color: 'var(--text)'
        }}
      >
        <span style={{ fontSize: 20 }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -2,
            right: -2,
            background: '#ef4444',
            color: '#fff',
            fontSize: 10,
            fontWeight: 'bold',
            borderRadius: 10,
            padding: '2px 6px',
            minWidth: 18,
            textAlign: 'center'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 48,
          right: 0,
          width: 320,
          background: 'var(--surface)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ fontSize: 12, color: 'var(--teal-light, #0d9488)', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>
            )}
          </div>
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: 4, padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
            {['all', 'orders', 'messages', 'payments'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  borderRadius: 12,
                  border: 'none',
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: filter === f ? 'var(--teal)' : 'var(--surface2)',
                  color: filter === f ? '#fff' : 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {filteredNotifs.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim, #9ca3af)', fontSize: 13 }}>No notifications</div>
            ) : (
              filteredNotifs.map(n => {
                return (
                  <div key={n.id}
                    onClick={() => { if (!n.read) markAsRead(n.id); }}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: n.read ? 'transparent' : 'rgba(13, 148, 136, 0.1)',
                      display: 'flex',
                      gap: 12,
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ fontSize: 20 }}>{n.icon || '🔔'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: 'var(--text)', marginBottom: 2 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted, #9ca3af)' }}>{n.msg}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-dim, #9ca3af)', marginTop: 4 }}>
                        {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {n.link && (
                        <button 
                          onClick={() => handleNotificationClickWithEntity(n)}
                          style={{ fontSize: 11, color: 'var(--teal-light, #0d9488)', marginTop: 4, display: 'inline-block', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                        >
                          View Details →
                        </button>
                      )}
                    </div>
                    {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal, #0d9488)', alignSelf: 'center' }} />}
                  </div>
                );
              })
            )}
          </div>
          <div style={{ padding: '8px', borderTop: '1px solid var(--border, #e5e7eb)', textAlign: 'center', background: 'var(--surface2, #f9fafb)' }}>
            {onNavigate ? (
              <button
                onClick={() => { onNavigate('?tab=notifications'); setOpen(false); }}
                style={{ fontSize: 12, color: 'var(--teal, #0d9488)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
              >
                View all notifications
              </button>
            ) : (
              <Link href={`/${session.user.role.toLowerCase()}?tab=notifications`} style={{ fontSize: 12, color: 'var(--teal, #0d9488)', textDecoration: 'none', fontWeight: 500 }}>
                View all notifications
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
