"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import io from 'socket.io-client';

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      for (const id of unreadIds) {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
      }
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  if (!session) return null;

  return (
    <div style={{ position: 'relative', zIndex: 9999 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)'
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
          background: 'rgba(30, 41, 59, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 0, 0, 0.2)' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#fff' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ fontSize: 12, color: 'var(--teal, #0d9488)', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>
            )}
          </div>
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim, #9ca3af)', fontSize: 13 }}>No notifications</div>
            ) : (
              notifications.slice(0, 5).map(n => {
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
                      <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: '#fff', marginBottom: 2 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-dim, #9ca3af)' }}>{n.msg}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-dim, #9ca3af)', marginTop: 4 }}>
                        {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {n.link && (
                        <Link href={n.link} style={{ fontSize: 11, color: 'var(--teal, #0d9488)', marginTop: 4, display: 'inline-block' }}>View Details →</Link>
                      )}
                    </div>
                    {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal, #0d9488)', alignSelf: 'center' }} />}
                  </div>
                );
              })
            )}
          </div>
          <div style={{ padding: '8px', borderTop: '1px solid var(--border, #e5e7eb)', textAlign: 'center', background: 'var(--surface2, #f9fafb)' }}>
            <Link href={`/${session.user.role.toLowerCase()}?tab=notifications`} style={{ fontSize: 12, color: 'var(--teal, #0d9488)', textDecoration: 'none', fontWeight: 500 }}>
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
