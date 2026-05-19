"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./theme.css";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import servicesData from '@/data/services_data.json';
import Wallet from "./student-wallet";
import io from 'socket.io-client';
import Notifications from "@/components/NotificationsView";
import NotificationBell from '@/components/NotificationBell';

const SERVICE_LABELS = Object.values(servicesData.individualServices)
  .flat()
  .reduce((acc, s) => {
    acc[s.id.toLowerCase()] = s.name;
    return acc;
  }, {});

const getStandardServiceName = (p) => {
  if (!p) return 'Writing Service';
  const type = (p.serviceType || '').toLowerCase();
  if (SERVICE_LABELS[type]) return SERVICE_LABELS[type];
  let t = p.title || 'Writing Service';
  t = t.replace(/ Order$/i, '');
  return t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};



/* ── DATA ── */
/* ── HARD-CODED DATA REMOVED ── */

/* ── STATUS ── */
const STATUS_META = {
  'New Order': { color: '#3b82f6', bg: 'rgba(59,130,246,.12)', dot: '#3b82f6', rank: 0 },
  'Finding Writer': { color: '#3b82f6', bg: 'rgba(59,130,246,.12)', dot: '#3b82f6', rank: 0 },
  'Writer Assigned': { color: '#8b5cf6', bg: 'rgba(139,92,246,.12)', dot: '#8b5cf6', rank: 1 },
  'In Progress': { color: '#0d9488', bg: 'rgba(13,148,136,.12)', dot: '#0d9488', rank: 2 },
  'Under Review': { color: '#8b5cf6', bg: 'rgba(139,92,246,.12)', dot: '#8b5cf6', rank: 3 },
  'Quality Check': { color: '#f59e0b', bg: 'rgba(245,158,11,.12)', dot: '#f59e0b', rank: 4 },
  'Revision Requested': { color: '#f43f5e', bg: 'rgba(244,63,94,.12)', dot: '#f43f5e', rank: 5 },
  'Delivered': { color: '#22c55e', bg: 'rgba(34,197,94,.12)', dot: '#22c55e', rank: 6 },
  'Closed': { color: '#334e4c', bg: 'rgba(51,78,76,.1)', dot: '#334e4c', rank: 7 }
};

function StatusPill({ status, small }) {
  const m = STATUS_META[status] || STATUS_META['In Progress'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: small ? '2px 8px' : '3px 10px', borderRadius: 100, background: m.bg, border: `1px solid ${m.color}22`, fontSize: small ? 10 : 11, fontWeight: 600, color: m.color, whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.dot, display: 'inline-block', animation: status === 'In Progress' ? 'pulse 2s infinite' : 'none' }} />
      {status}
    </span>);
}

function Avatar({ initials, size = 36, gradient }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, flexShrink: 0, background: gradient || 'linear-gradient(135deg,#0d9488,#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.38, color: '#fff', letterSpacing: '-0.01em' }}>
      {initials}
    </div>);
}

function OrderStrip({ order, isActive, onClick }) {
  const m = STATUS_META[order.status] || STATUS_META['In Progress'];
  const isUrgent = order.deliveryType === 'urgent';
  const daysLeft = order.status === 'Delivered' ? null : Math.ceil((new Date(order.due) - new Date()) / 86400000);

  return (
    <div onClick={onClick} style={{
      padding: '0', cursor: 'pointer', borderRadius: 8,
      borderWidth: '1px', borderStyle: 'solid',
      borderColor: isActive ? 'var(--teal)' : 'var(--border2)',
      background: isActive ? 'rgba(13,148,136,0.06)' : 'var(--surface2)',
      transition: 'all .2s', overflow: 'hidden', flexShrink: 0,
      marginBottom: 8,
      boxShadow: isActive ? '0 0 0 1px rgba(13,148,136,0.2)' : 'none'
    }}
      onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(13,148,136,0.3)'; e.currentTarget.style.background = 'var(--surface3)'; } }}
      onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--surface2)'; } }}>

      <div style={{ height: 2, background: m.color, opacity: 0.7 }} />

      <div style={{ padding: '12px 14px', fontFamily: "inherit" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.04em', fontWeight: 500 }}>{order.displayId}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            {isUrgent && <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 100, background: 'rgba(244,63,94,0.12)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)' }}>⚡ URGENT</span>}
            {!isUrgent && <span style={{ fontSize: 8, fontWeight: 600, padding: '1px 5px', borderRadius: 100, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.15)' }}>📅 {order.due.split(',')[0]}</span>}
          </div>
        </div>

        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, lineHeight: 1.3, color: isActive ? 'var(--teal-light)' : 'var(--text)' }}>{order.service}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <StatusPill status={order.status} small />
          {order.unreadMsgs > 0 &&
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 100, background: 'rgba(13,148,136,0.18)', color: 'var(--teal-light)' }}>
              💬 {order.unreadMsgs}
            </span>
          }
        </div>

        <div style={{ height: 2, borderRadius: 1, background: 'var(--surface3)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${order.progress}%`, background: m.color, transition: 'width .6s ease' }} />
        </div>
      </div>
    </div>);
}

function DeliveredPopup({ project, onClose, onAction }) {
  if (!project) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, width: '100%', maxWidth: 440, padding: 32, textAlign: 'center', animation: 'scaleUp 0.3s ease' }}>
        <div style={{ width: 64, height: 64, background: 'rgba(34,197,94,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px' }}>🎉</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Service Delivered!</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
          Great news! Your service <strong>"{getStandardServiceName(project)}"</strong> has been successfully delivered and is ready for your review.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => onAction('view')} style={{ width: '100%', padding: '12px', background: 'var(--teal)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>View Order & Files</button>
          <button onClick={() => onAction('ticket')} style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Raise Revision Ticket</button>
          <button onClick={onClose} style={{ width: '100%', padding: '8px', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer' }}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}

/* ── SIDEBAR ── */
function Sidebar({ active, setActive, unreadCount = 0, userName = "Student" }) {
  const nav = [
    { id: 'overview', icon: '⊞', label: 'Overview' },
    { id: 'new-order', icon: '📝', label: 'New Order' },
    { id: 'services', icon: '💎', label: 'Services Catalog' },
    { id: 'orders', icon: '📋', label: 'My Orders' },
    { id: 'wallet', icon: '💳', label: 'Wallet & Credits' },
    { id: 'messages', icon: '💬', label: 'Messages' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'writers', icon: '✍️', label: 'My Writers' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div style={{ width: 220, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border2)', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px', borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff' }}>X</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.01em' }}>Xpresswriters</span>
        </Link>
      </div>

      {/* User */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--teal), #0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>{userName.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{userName}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pro Member</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {nav.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 14, fontWeight: active === item.id ? 600 : 400, marginBottom: 2, transition: 'all 0.2s', position: 'relative',
            background: active === item.id ? 'rgba(13,148,136,0.15)' : 'transparent',
            color: active === item.id ? 'var(--teal-light)' : 'var(--text-muted)',
          }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
            {item.id === 'messages' && unreadCount > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--teal)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 100, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>{unreadCount}</span>
            )}
            {active === item.id && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, borderRadius: 2, background: 'var(--teal)' }} />}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border2)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', transition: 'color 0.2s', width: '100%', textAlign: 'left', fontFamily: 'var(--font)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );
}

function Overview({ setActive, setSelectedOrder, projects = [], writers = [], userName = "Student", isMobile, onNavigate }) {
  const [recentNotifications, setRecentNotifications] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    fetch('/api/notifications', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRecentNotifications(data.slice(0, 5));
      })
      .catch(err => {
        if (err.name !== 'AbortError') console.error("Failed to fetch notifications:", err);
      })
      .finally(() => clearTimeout(timeoutId));
    
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);
  
  const stats = useMemo(() => [
    { label: 'Active Orders', val: projects.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length, icon: '⚡', color: 'var(--teal)', sub: 'In progress' },
    { label: 'Completed', val: projects.filter(o => o.status === 'COMPLETED').length, icon: '✓', color: 'var(--green)', sub: 'All time' },
    { label: 'Wallet Balance', val: `₹0`, icon: '💳', color: 'var(--gold)', sub: 'Available credits' },
    { label: 'Saved Writers', val: writers.length, icon: '✍️', color: '#f472b6', sub: 'Favorites' },
  ], [projects, writers.length]);

  const activeOrders = useMemo(() => projects.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').map(o => {
    let displayStatus = 'In Progress';
    let progress = 50;
    if (o.status === 'CREATED') { displayStatus = 'Finding Writer'; progress = 10; }
    else if (o.status === 'ASSIGNED') { displayStatus = 'Writer Assigned'; progress = 20; }
    else if (o.status === 'REVISION') { displayStatus = 'Revision Requested'; progress = 80; }
    else if (o.status === 'QUALITY_CHECK') { displayStatus = 'Quality Check'; progress = 90; }
    else if (o.status === 'UNDER_REVIEW') { displayStatus = 'Under Review'; progress = 75; }

    return {
      id: o.id,
      service: getStandardServiceName(o),
      writer: o.freelancer?.name || 'Assigning...',
      status: displayStatus,
      progress,
      due: o.deadline ? new Date(o.deadline).toLocaleDateString() : 'N/A'
    };
  }), [projects]);

  // Logs replaced with notifications

  return (
    <div style={{ padding: '32px 36px', overflowY: 'auto', height: '100%', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Good day, {userName.split(' ')[0]} 👋</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Here's what's happening with your orders today.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <div key={i} onClick={() => s.label.includes('Wallet') && setActive('wallet')} style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 10, padding: '20px 20px', animation: `fadeUp 0.3s ease ${i * 0.06}s both`, cursor: s.label.includes('Wallet') ? 'pointer' : 'default' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{s.label}</span>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: s.color, marginBottom: 4, letterSpacing: '-0.02em' }}>{s.val}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{s.sub}</div>
              {s.label.includes('Wallet') && <span style={{ fontSize: 10, color: 'var(--teal-light)', fontWeight: 700 }}>TOP UP →</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Active orders */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Active Orders</h2>
            <button onClick={() => setActive('orders')} style={{ fontSize: 13, color: 'var(--teal-light)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}>View all →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeOrders.length > 0 ? activeOrders.map((order, i) => (
              <ActiveOrderCard key={order.id} order={order} onClick={() => { setActive('orders'); setSelectedOrder(order.id); }} />
            )) : (
              <div style={{ padding: 40, textAlign: 'center', border: '1px dashed var(--border2)', borderRadius: 10, color: 'var(--text-muted)' }}>
                No active orders found. <button onClick={() => setActive('new-order')} style={{ color: 'var(--teal-light)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 14 }}>Start your first order</button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Reorder */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Quick Reorder</h2>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 10, padding: 16 }}>
            {projects.filter(p => p.status === 'COMPLETED').slice(0, 2).map(p => (
              <div key={p.id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid var(--border2)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{getStandardServiceName(p)}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>₹{p.amount?.toLocaleString()}</span>
                  <button onClick={() => setActive('new-order')} style={{ padding: '4px 10px', borderRadius: 4, background: 'rgba(13,148,136,0.1)', border: '1px solid var(--teal)', color: 'var(--teal-light)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>REORDER</button>
                </div>
              </div>
            ))}
            {projects.filter(p => p.status === 'COMPLETED').length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', padding: '10px 0' }}>Completed orders will appear here for easy reordering.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Recent Activity</h2>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 10, overflow: 'hidden' }}>
          {recentNotifications.length > 0 ? recentNotifications.map((item, i) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < recentNotifications.length - 1 ? '1px solid var(--border2)' : 'none', cursor: 'pointer', background: item.read ? 'transparent' : 'rgba(13,148,136,0.04)' }} 
              onClick={() => {
                if (onNavigate && item.link) {
                  onNavigate(item.link);
                } else {
                  setActive('notifications');
                }
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `rgba(13,148,136,0.18)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{item.icon || '🔔'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13, color: 'var(--text)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: item.read ? 400 : 600 }}>{item.title}</span>
                <span style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.msg}</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-dim)', flexShrink: 0 }}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )) : (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim)' }}>No recent activity.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActiveOrderCard({ order, onClick }) {
  const sc = STATUS_META[order.status] || STATUS_META['In Progress'];
  const stepIdx = order.status === 'Delivered' ? 4 : (order.status === 'Quality Check' || order.status === 'Under Review' || order.status === 'Revision Requested') ? 3 : order.status === 'In Progress' ? 2 : (order.status === 'Writer Assigned' || order.status === 'ASSIGNED') ? 1 : 0;

  return (
    <div onClick={onClick} style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 10, padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(13,148,136,0.4)'; e.currentTarget.style.background = 'var(--surface2)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--surface)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{order.service}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.displayId} · with {order.writer}</div>
        </div>
        <StatusPill status={order.status} small />
      </div>

      {/* Mini track */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 10 }}>
        {['Placed', 'Assigned', 'In-Work', 'Review', 'Done'].map((step, i) => (
          <React.Fragment key={i}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: i <= stepIdx ? 'var(--teal)' : 'var(--surface3)', flexShrink: 0, transition: 'all 0.3s' }} />
            {i < 4 && <div style={{ flex: 1, height: 1, background: i < stepIdx ? 'var(--teal)' : 'var(--surface3)', transition: 'background 0.3s' }} />}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Due: <span style={{ color: 'var(--text)' }}>{order.due}</span></div>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--surface3)', overflow: 'hidden', margin: '0 16px' }}>
          <div style={{ width: `${order.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--teal), var(--teal-light))', borderRadius: 2, transition: 'width 0.5s' }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--teal-light)', fontWeight: 600 }}>{order.progress}%</div>
      </div>
    </div>
  );
}

/* ── ORDERS ── */
function Orders({ selectedOrder, setSelectedOrder, projects = [], setActive, isMobile }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const filters = ['All', 'Active', 'Delivered', 'Revision'];
  const detailRef = useRef(null);

  const [detailedProject, setDetailedProject] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (selectedOrder) {
      setLoadingDetails(true);
      fetch(`/api/projects/${selectedOrder}`)
        .then(res => res.json())
        .then(data => {
          setDetailedProject(data);
          setLoadingDetails(false);
        })
        .catch(() => setLoadingDetails(false));

      setTimeout(() => {
        if (detailRef.current) {
          detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } else {
      setDetailedProject(null);
    }
  }, [selectedOrder]);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [ticketError, setTicketError] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState(false);

  const MAPPED_ORDERS = useMemo(() => projects.map(p => {
    let displayStatus = 'In Progress';
    let progress = 50;
    if (p.status === 'CREATED') { displayStatus = 'Finding Writer'; progress = 10; }
    else if (p.status === 'ASSIGNED') { displayStatus = 'Writer Assigned'; progress = 20; }
    else if (p.status === 'REVISION') { displayStatus = 'Revision Requested'; progress = 80; }
    else if (p.status === 'COMPLETED') { displayStatus = 'Delivered'; progress = 100; }
    else if (p.status === 'REVIEW') { displayStatus = 'Under Review'; progress = 90; }
    else if (p.status === 'QUALITY_CHECK') { displayStatus = 'Quality Check'; progress = 95; }
    else if (p.status === 'UNDER_REVIEW') { displayStatus = 'Under Review'; progress = 90; }

    return {
      id: p.id,
      displayId: `XW-${p.id.slice(-5).toUpperCase()}`,
      service: getStandardServiceName(p),
      writer: p.freelancer?.name || 'Unassigned',
      status: displayStatus,
      due: p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A',
      price: p.amount || 0,
      words: 1000,
      submitted: new Date(p.createdAt).toLocaleDateString(),
      progress
    };
  }), [projects]);

  const o = selectedOrder ? MAPPED_ORDERS.find(x => x.id === selectedOrder) : null;
  const sc = o ? (STATUS_META[o.status] || STATUS_META['In Progress']) : null;
  const TRACK = ['Order Placed', 'Writer Assigned', 'In Progress', 'Quality Check', 'Delivered'];
  const stepIdx = o ? (o.status === 'Delivered' ? 4 : (o.status === 'Quality Check' || o.status === 'Under Review' || o.status === 'Revision Requested') ? 3 : o.status === 'In Progress' ? 2 : (o.status === 'Writer Assigned') ? 1 : 0) : 0;


  const handleDownloadWork = (project) => {
    const deliveryFiles = (project.attachments || []).filter(a => a.type === 'DELIVERY');
    if (deliveryFiles.length === 0) {
      alert("No delivery files found yet.");
      return;
    }
    deliveryFiles.forEach(f => {
      const link = document.createElement('a');
      link.href = f.url;
      link.download = f.name || 'delivered-work';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleReorder = async (project) => {
    // Find proper service name for NewOrder form pre-filling
    const allSvcs = Object.values(servicesData.individualServices).flat();
    const svc = allSvcs.find(s => s.id === project.serviceType) || allSvcs.find(s => s.name === project.serviceType);

    let fullDescription = project.description;
    if (!fullDescription) {
      try {
        const res = await fetch(`/api/projects/${project.id}`);
        const data = await res.json();
        fullDescription = data.description || '';
      } catch (err) {
        fullDescription = '';
      }
    }

    localStorage.setItem('pendingOrder', JSON.stringify({
      category: svc?.name || project.serviceType || project.title,
      details: `[REORDER] Original Order: XW-${project.id.slice(-5).toUpperCase()}\n\n${fullDescription}`,
      wordCount: 1000
    }));
    setActive('new-order');
    // We can't easily trigger the useEffect without a mount/refresh if already in new-order
    // But since we are changing tabs, it will mount.
  };

  const handleRatingSubmit = async () => {
    if (!selectedOrder) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${selectedOrder}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, ratingComment })
      });
      if (res.ok) {
        setRatingSuccess(true);
        // Refresh local projects state to show rating if needed (though not implemented in UI yet)
        setProjects(prev => prev.map(p => p.id === selectedOrder ? { ...p, rating, ratingComment } : p));
        setTimeout(() => {
          setShowRatingModal(false);
          setRatingSuccess(false);
        }, 2000);
      } else {
        alert("Failed to submit rating. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting rating.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTicket = async () => {
    setTicketError('');
    if (!ticketSubject || !ticketMessage) {
      setTicketError('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Order',
          subject: ticketSubject,
          description: ticketMessage,
          orderId: projects.find(p => p.id === selectedOrder)?.id,
          priority: 'Medium'
        })
      });
      if (res.ok) {
        setTicketSuccess(true);
        setTicketSubject('');
        setTicketMessage('');
      } else {
        setTicketError('Failed to create ticket');
      }
    } catch (err) {
      console.error(err);
      setTicketError('Error creating ticket');
    }
    setSubmitting(false);
  };

  const filtered = useMemo(() => MAPPED_ORDERS.filter(o => {
    const matchesFilter = filter === 'All' ? true :
      filter === 'Active' ? !['Delivered', 'Revision Requested'].includes(o.status) :
        filter === 'Delivered' ? o.status === 'Delivered' :
          filter === 'Revision' ? o.status === 'Revision Requested' : true;

    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.service.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  }), [MAPPED_ORDERS, filter, search]);

  return (
    <div style={{ padding: isMobile ? '16px 20px' : '32px 36px', overflowY: 'auto', height: '100%', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>My Orders</h1>
        <button onClick={() => setActive('new-order')} style={{ background: 'var(--teal)', color: '#fff', padding: '9px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>+ New Order</button>
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 12 : 8, marginBottom: 20, alignItems: isMobile ? 'stretch' : 'center' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? 4 : 0 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 16px', borderRadius: 6, border: '1px solid', fontFamily: 'var(--font)', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
              borderColor: filter === f ? 'var(--teal)' : 'var(--border2)',
              background: filter === f ? 'rgba(13,148,136,0.15)' : 'transparent',
              color: filter === f ? 'var(--teal-light)' : 'var(--text-muted)',
              fontWeight: filter === f ? 600 : 400,
              whiteSpace: 'nowrap',
            }}>{f}</button>
          ))}
        </div>
        <div style={{ marginLeft: isMobile ? '0' : 'auto', background: 'var(--surface2)', borderRadius: 6, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8, width: isMobile ? '100%' : 240, border: '1px solid var(--border2)' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>🔍</span>
          <input
            placeholder="Search by ID or service..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13, width: '100%' }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 10, overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 0.8fr 0.7fr 0.6fr', padding: '10px 20px', borderBottom: '1px solid var(--border2)', background: 'var(--surface2)', minWidth: 600 }}>
          {['Order', 'Service', 'Writer', 'Status', 'Due', 'Price'].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>{h}</div>
          ))}
        </div>
        {filtered.map((order, i) => {
          const sc = STATUS_META[order.status] || STATUS_META['In Progress'];
          const isSelected = selectedOrder === order.id;
          return (
            <div key={order.id} onClick={() => setSelectedOrder(isSelected ? null : order.id)} style={{
              display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 0.8fr 0.7fr 0.6fr', minWidth: 600,
              padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border2)' : 'none',
              cursor: 'pointer', transition: 'background 0.15s',
              background: isSelected ? 'rgba(13,148,136,0.08)' : 'transparent',
            }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-light)' }}>{order.displayId}</div>
              <div style={{ fontSize: 13, paddingRight: 12 }}>{order.service}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{order.writer.split(' ').slice(0, 2).join(' ')}</div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 100, background: sc.bg, color: sc.color }}>
                  {order.status}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{order.due.replace(', 2026', '')}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>${order.price}</div>
            </div>
          );
        })}
      </div>

      {/* Expanded detail */}
      {selectedOrder && o && (
        <div ref={detailRef} style={{ marginTop: 20, background: 'var(--surface)', border: '1px solid rgba(13,148,136,0.3)', borderRadius: 10, padding: 24, animation: 'fadeUp 0.25s ease' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{o.service}</h3>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{o.displayId} · Submitted {o.submitted} · {o.words.toLocaleString()} words</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 100, background: sc.bg, color: sc.color, display: 'block', marginBottom: 8 }}>{o.status}</span>
              <div style={{ fontSize: 14, fontWeight: 700 }}>₹{o.price.toLocaleString()}</div>
            </div>
          </div>
          {/* Track */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Order Tracking</div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {TRACK.map((step, i) => (
                <React.Fragment key={i}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, transition: 'all 0.3s', background: i <= stepIdx ? 'var(--teal)' : 'var(--surface3)', color: i <= stepIdx ? '#fff' : 'var(--text-dim)', border: `2px solid ${i <= stepIdx ? 'var(--teal)' : 'var(--border2)'}` }}>{i < stepIdx ? '✓' : i + 1}</div>
                    <div style={{ fontSize: 11, color: i <= stepIdx ? 'var(--text)' : 'var(--text-dim)', textAlign: 'center', maxWidth: 70, position: 'absolute', top: 40, width: 80 }}>{step}</div>
                  </div>
                  {i < TRACK.length - 1 && <div style={{ flex: 1, height: 2, background: i < stepIdx ? 'var(--teal)' : 'var(--surface3)', marginBottom: 0, transition: 'background 0.3s' }} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 32, padding: '24px 0', borderTop: '1px solid var(--border2)' }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Project Brief & Initial Files</h4>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, background: 'var(--surface2)', padding: 16, borderRadius: 10, marginBottom: 16 }}>
              {loadingDetails ? 'Loading brief...' : (detailedProject?.description || projects.find(p => p.id === o.id)?.description || 'No detailed brief provided.')}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {(detailedProject?.attachments || projects.find(p => p.id === o.id)?.attachments || []).map((file, idx) => (
                <a key={idx} href={file.url} download={file.name} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10,
                  background: 'var(--surface2)', border: '1px solid var(--border2)', textDecoration: 'none', color: 'inherit'
                }}>
                  {/\.(jpg|jpeg|png|webp|gif)$/i.test(file.url) ? '🖼️' : '📄'}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Initial Document</div>
                  </div>
                </a>
              ))}
              {(projects.find(p => p.id === o.id)?.attachments || []).length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>No files attached to this project.</div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24, padding: '24px 0', borderTop: '1px solid var(--border2)' }}>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Writer Information</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✍️</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{o.writer}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Top Rated Writer</div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Actions</h4>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setActive('messages')} style={{ padding: '9px 18px', borderRadius: 6, background: 'var(--teal)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>Message Writer</button>
                <button style={{ padding: '9px 18px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }}>Download Brief</button>
              </div>
            </div>
          </div>

          {o.status === 'Delivered' && (
            <div style={{ marginTop: 12, padding: 20, background: 'rgba(34,197,94,0.05)', borderRadius: 10, border: '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#4ade80' }}>✅ Content Ready for Download</div>
                <button onClick={() => handleDownloadWork(projects.find(p => p.id === o.id))} style={{ padding: '6px 14px', borderRadius: 6, background: '#22c55e', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Download Work ↓</button>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowRatingModal(true)} style={{ flex: 1, padding: '10px', borderRadius: 6, background: 'transparent', border: '1px solid rgba(34,197,94,0.3)', color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}>Rate Writer ★</button>
                <button onClick={() => { setTicketSubject(`Revision: ${o.displayId}`); setTicketMessage(`I would like to request a revision for order ${o.displayId}. Specific details: `); setShowTicketModal(true); }} style={{ flex: 1, padding: '10px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Request Revision</button>
                <button onClick={() => handleReorder(projects.find(p => p.id === o.id))} style={{ flex: 1, padding: '10px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Reorder Item 🔄</button>
              </div>
            </div>
          )}

          {o.status !== 'Delivered' && (
            <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
              <button onClick={() => { setTicketSubject(`Issue: ${o.displayId}`); setTicketMessage(`I am reporting an issue with order ${o.displayId}. Specific details: `); setShowTicketModal(true); }} style={{ fontSize: 12, color: '#fb7185', background: 'none', border: 'none', cursor: 'pointer' }}>Report Issue / Request Support</button>
            </div>
          )}
        </div>
      )}

      {/* Ticket Modal */}
      {showTicketModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--surface)', padding: 24, borderRadius: 12, width: 450, border: '1px solid var(--border2)', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            {ticketSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Ticket Created!</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Your support ticket has been created successfully. Our team will review it shortly.</p>
                <button
                  onClick={() => { setShowTicketModal(false); setTicketSuccess(false); setTicketError(''); }}
                  style={{ padding: '10px 24px', borderRadius: 8, background: 'var(--teal)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Report Issue / Request Support</h3>
                  <button
                    onClick={() => { setShowTicketModal(false); setTicketError(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24, padding: '0 4px', lineHeight: 1 }}
                    title="Close"
                  >
                    &times;
                  </button>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Our team will review your request and get back to you within 24 hours.</p>

                {ticketError && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '10px', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>
                    {ticketError}
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>Subject</label>
                  <input
                    value={ticketSubject}
                    onChange={e => setTicketSubject(e.target.value)}
                    placeholder="e.g., Formatting issue, Plagiarism check, etc."
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>Detailed Description</label>
                  <textarea
                    value={ticketMessage}
                    onChange={e => setTicketMessage(e.target.value)}
                    placeholder="Please describe your issue in detail..."
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 13, minHeight: 120, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    onClick={() => { setShowTicketModal(false); setTicketError(''); }}
                    style={{ padding: '10px 18px', borderRadius: 8, background: 'var(--surface3)', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTicket}
                    disabled={submitting}
                    style={{ padding: '10px 18px', borderRadius: 8, background: 'var(--teal)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--surface)', padding: 32, borderRadius: 16, width: 400, border: '1px solid var(--border2)', textAlign: 'center' }}>
            {ratingSuccess ? (
              <div>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🌟</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Thank You!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Your feedback helps us maintain high quality standards.</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Rate Your Writer</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>How was your experience with this order?</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setRating(star)} style={{ background: 'none', border: 'none', fontSize: 32, cursor: 'pointer', color: star <= rating ? '#fbbf24' : 'var(--border2)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>★</button>
                  ))}
                </div>
                <textarea value={ratingComment} onChange={e => setRatingComment(e.target.value)} placeholder="Optional: Share some details about the quality of work..." style={{ width: '100%', height: 100, background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '12px', color: 'var(--text)', fontSize: 14, marginBottom: 24, outline: 'none', resize: 'none' }} />
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setShowRatingModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleRatingSubmit} disabled={submitting} style={{ flex: 1, padding: '12px', borderRadius: 8, background: 'var(--teal)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{submitting ? '...' : 'Submit Rating'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── MESSAGES ── */
function Messages({ projects = [], userId, isMobile }) {
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [input, setInput] = useState('');
  const [chatAttachments, setChatAttachments] = useState([]);
  const [chatUploading, setChatUploading] = useState(false);
  const chatFileInputRef = useRef(null);
  const endRef = useRef(null);

  // Pick the first real project by default
  useEffect(() => {
    if (projects.length > 0 && !activeProjectId) {
      setActiveProjectId(projects[0].id);
    }
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const { messages, loading, errorAlert, sendMessage } = useChat({
    projectId: activeProjectId,
    userId,
    role: 'STUDENT',
    chatType: 'CLIENT_CHAT',
  });

  const handleChatFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setChatUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const body = new FormData();
        body.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body });
        if (!res.ok) throw new Error('Upload failed');
        return await res.json();
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setChatAttachments(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('Chat file upload failure:', error);
      alert("File upload failed. Please try again.");
    } finally {
      setChatUploading(false);
      if (chatFileInputRef.current) chatFileInputRef.current.value = '';
    }
  };

  const removeChatAttachment = (url) => {
    setChatAttachments(prev => prev.filter(a => a.url !== url));
  };

  useEffect(() => {
    if (endRef.current) {
      endRef.current.parentElement.scrollTop = endRef.current.parentElement.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim() && chatAttachments.length === 0) return;
    sendMessage(input, chatAttachments);
    setInput('');
    setChatAttachments([]);
  };

  if (projects.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12, color: 'var(--text-dim)' }}>
        <div style={{ fontSize: 40 }}>💬</div>
        <div style={{ fontSize: 14 }}>No active orders — messages will appear once a project is created.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', animation: 'fadeIn 0.3s ease' }}>
      {/* Project / conversation list */}
      <div style={{ width: isMobile ? '100%' : 280, flexShrink: 0, borderRight: isMobile ? 'none' : '1px solid var(--border2)', display: (isMobile && activeProjectId) ? 'none' : 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border2)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Messages</h2>
          <div style={{ background: 'var(--surface2)', borderRadius: 6, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>🔍</span>
            <input placeholder="Search orders..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13, width: '100%' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {projects.map(p => {
            const mapStatus = (s) => {
              switch (s) {
                case 'CREATED': return 'Finding Writer';
                case 'ASSIGNED': return 'Writer Assigned';
                case 'IN_PROGRESS': return 'In Progress';
                case 'REVIEW': return 'Under Review';
                case 'QUALITY_CHECK': return 'Quality Check';
                case 'REVISION': return 'Revision Requested';
                case 'COMPLETED': return 'Delivered';
                default: return 'In Progress';
              }
            };
            const orderObj = {
              id: p.id,
              displayId: `XW-${p.id.slice(-5).toUpperCase()}`,
              service: getStandardServiceName(p),
              status: mapStatus(p.status),
              due: p.deadline ? new Date(p.deadline).toLocaleDateString() : 'No Date',
              progress: p.status === 'COMPLETED' ? 100 : (p.status === 'REVIEW' || p.status === 'QUALITY_CHECK') ? 90 : p.status === 'CREATED' ? 10 : 50,
              unreadMsgs: p.messages?.filter(m => !m.read && m.senderId !== userId).length || 0,
              deliveryType: p.deadline && (new Date(p.deadline) - new Date()) < 86400000 * 2 ? 'urgent' : 'timeline',
            };
            return (
              <OrderStrip
                key={p.id}
                order={orderObj}
                isActive={activeProjectId === p.id}
                onClick={() => setActiveProjectId(p.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      {activeProject ? (
        <div style={{ flex: 1, display: (isMobile && !activeProjectId) ? 'none' : 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: isMobile ? '12px 16px' : '14px 24px', borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && (
              <button onClick={() => setActiveProjectId(null)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 18, cursor: 'pointer', padding: '0 4px 0 0' }}>
                ←
              </button>
            )}
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, var(--teal), #0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff' }}>
              {(activeProject.freelancer?.name || 'W').split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{activeProject.freelancer?.name || 'Your Writer'}</div>
              <div style={{ fontSize: 12, color: 'var(--teal-light)' }}>● Active · {activeProject.serviceType || activeProject.title}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 6, background: 'rgba(13,148,136,0.1)', border: '1px solid var(--border)', color: 'var(--teal-light)' }}>XW-{activeProject.id.slice(-5).toUpperCase()}</div>
            </div>
          </div>

          {/* Security notice */}
          <div style={{ padding: '8px 24px', background: 'rgba(139,92,246,0.05)', borderBottom: '1px solid rgba(139,92,246,0.1)', fontSize: 11, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🔒</span> End-to-end encrypted · Identity protected · Content moderated
          </div>

          {/* Error alert */}
          {errorAlert && (
            <div style={{ margin: '8px 24px', padding: '10px 14px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, color: '#fb7185', fontSize: 12 }}>
              ⚠️ {errorAlert}
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {loading && <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>Loading messages...</div>}
            {!loading && messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13, marginTop: 40 }}>No messages yet. Start the conversation!</div>
            )}
            {messages.map((msg, i) => {
              if (msg.isSystem) return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: 'center' }}>
                  <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 100, background: 'var(--surface2)', color: 'var(--text-dim)', border: '1px solid var(--border2)' }}>🔒 {msg.content}</span>
                </div>
              );
              const isMe = String(msg.senderId) === String(userId);
              const isAdmin = msg.senderRole === 'ADMIN';

              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', animation: 'fadeIn 0.2s ease' }}>
                  {!isMe && (
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, marginLeft: 36, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontWeight: 700 }}>{isAdmin ? 'Master Admin' : (msg.senderName || 'Writer')}</span>
                      {isAdmin && <span style={{ fontSize: 9, background: 'var(--teal)', color: '#fff', padding: '1px 5px', borderRadius: 4 }}>ADMIN</span>}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', width: '100%' }}>
                    {!isMe && (
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: isAdmin ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, var(--teal), #0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', marginRight: 8, flexShrink: 0 }}>
                        {isAdmin ? 'AD' : (msg.senderName || 'W').split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                    )}
                    <div style={{ maxWidth: '75%' }}>
                      <div style={{ padding: '10px 14px', borderRadius: isMe ? '10px 10px 2px 10px' : '10px 10px 10px 2px', background: isMe ? 'var(--teal)' : isAdmin ? 'rgba(239,68,68,0.1)' : 'var(--surface2)', border: isAdmin ? '1px solid rgba(239,68,68,0.2)' : '1px solid var(--border)', fontSize: 13, lineHeight: 1.55, color: isMe ? '#fff' : 'var(--text)' }}>
                        {msg.content}

                        {msg.attachments && msg.attachments.length > 0 && (
                          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {msg.attachments.map((file, idx) => {
                              const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.url);
                              return (
                                <a key={idx} href={file.url} download={file.name} target="_blank" rel="noopener noreferrer" style={{
                                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px', borderRadius: 6,
                                  background: isMe ? 'rgba(255,255,255,0.1)' : 'var(--surface3)',
                                  border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none', color: 'inherit'
                                }}>
                                  {isImg ? (
                                    <img src={file.url} alt="attachment" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                                  ) : (
                                    <span style={{ fontSize: 18 }}>📄</span>
                                  )}
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                                    <div style={{ fontSize: 9, opacity: 0.7 }}>DOCUMENT</div>
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                        {msg.createdAt instanceof Date ? msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border2)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chatAttachments.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingBottom: 10 }}>
                {chatAttachments.map((file, idx) => (
                  <div key={idx} style={{ position: 'relative', width: 60, height: 60, borderRadius: 8, background: 'var(--surface3)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/\.(jpg|jpeg|png|webp|gif)$/i.test(file.url) ? (
                      <img src={file.url} alt="preview" style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 20 }}>📄</span>
                    )}
                    <button onClick={() => removeChatAttachment(file.url)} style={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: '50%', background: 'var(--red)', border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={chatUploading ? "Uploading..." : `Message your writer...`}
                  disabled={chatUploading}
                  rows={1}
                  style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, padding: '10px 40px 10px 14px', color: 'var(--text)', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'var(--font)', lineHeight: 1.5 }}
                />
                <button
                  onClick={() => chatFileInputRef.current?.click()}
                  disabled={chatUploading}
                  style={{ position: 'absolute', right: 10, bottom: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)' }}
                >
                  📎
                </button>
                <input
                  type="file"
                  ref={chatFileInputRef}
                  style={{ display: 'none' }}
                  multiple
                  onChange={handleChatFileUpload}
                />
              </div>
              <button onClick={handleSend} disabled={(!input.trim() && chatAttachments.length === 0) || chatUploading} style={{ background: 'var(--teal)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: 8, cursor: 'pointer', fontSize: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (!input.trim() && chatAttachments.length === 0) || chatUploading ? 0.5 : 1 }}>
                {chatUploading ? "..." : "↑"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>Select a project to view chat</div>
      )}
    </div>
  );
}

/* ── WRITERS ── */
function SavedWriters({ setActive, writers = [], isMobile }) {
  return (
    <div style={{ padding: isMobile ? '16px 20px' : '32px 36px', overflowY: 'auto', height: '100%', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>My Writers</h1>
        <a href="index.html#writers" style={{ fontSize: 13, color: 'var(--teal-light)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none' }}>Browse more writers →</a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {writers.map((w, i) => {
          const badgeColors = { 'Top Writer': 'var(--teal)', 'Elite': 'var(--gold)', 'Rising Star': 'var(--green)' };
          return (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 10, padding: 20, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(13,148,136,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: 'linear-gradient(135deg, var(--teal), #0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff' }}>{w.avatar}</div>
                  {w.online && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', background: 'var(--green)', border: '2px solid var(--surface)' }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{w.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{w.specialty}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <span style={{ color: 'var(--gold)', fontSize: 13 }}>★ {w.rating}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>({w.reviews})</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: `${badgeColors[w.badge]}18`, color: badgeColors[w.badge] }}>{w.badge}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setActive('new-order')} style={{ flex: 1, padding: '8px 0', borderRadius: 6, background: 'var(--teal)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>New Order</button>
                <button style={{ flex: 1, padding: '8px 0', borderRadius: 6, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)' }}>Message</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── SETTINGS ── */
function Settings({ isMobile, profile, onUpdate }) {
  const [form, setForm] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    occupation: profile?.occupation || 'Student',
    college: profile?.college || '',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        occupation: profile.occupation || 'Student',
        college: profile.college || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        onUpdate();
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: isMobile ? '16px 20px' : '32px 36px', overflowY: 'auto', height: '100%', animation: 'fadeIn 0.3s ease' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28 }}>Account Settings</h1>
      <div style={{ maxWidth: 560 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>FULL NAME</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none' }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>EMAIL ADDRESS</label>
          <input value={form.email} disabled style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-dim)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none', cursor: 'not-allowed' }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>PHONE / WHATSAPP</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 ..." style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none' }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>CURRENT STATUS</label>
          <select value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none' }}>
            <option value="Student">Student</option>
            <option value="Working Professional">Working Professional</option>
            <option value="Freelancer">Freelancer</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>COLLEGE / ORGANIZATION</label>
          <input value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} placeholder="University Name" style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none' }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 12 }}>NOTIFICATIONS</div>
          {['Email me on order updates', 'Email me on new messages', 'Email me on delivery'].map(opt => (
            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer', fontSize: 14, color: 'var(--text)' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--teal)', width: 14, height: 14 }} />
              {opt}
            </label>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={loading || !form.name.trim() || !form.phone.trim()}
          style={{ padding: '10px 24px', borderRadius: 6, background: saved ? 'var(--green)' : 'var(--teal)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'background 0.3s', minWidth: 140, opacity: (loading || !form.name.trim() || !form.phone.trim()) ? 0.6 : 1 }}
        >
          {loading ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function ProfilePrompt({ onComplete }) {
  const [form, setForm] = useState({ phone: '', occupation: 'Student', college: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.phone) return;
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <style>{`
        @keyframes softPop {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      <div style={{ background: 'var(--surface)', borderRadius: 24, width: '100%', maxWidth: 440, padding: 36, border: '1px solid var(--border2)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', animation: 'softPop 0.4s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative' }}>
        <button
          onClick={() => onComplete()}
          style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24, padding: '0 4px', lineHeight: 1 }}
          title="Close"
        >
          &times;
        </button>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, var(--teal), #0f766e)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px', color: '#fff', boxShadow: '0 10px 20px rgba(13,148,136,0.2)' }}>✨</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>Complete Your Profile</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.5 }}>Welcome! Just a few more details to help us provide the best service for you.</p>
        </div>

        <div style={{ gap: 20, display: 'flex', flexDirection: 'column' }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8, letterSpacing: '0.08em' }}>WHATSAPP / PHONE</label>
            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '14px 18px', color: 'var(--text)', outline: 'none', fontSize: 14 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8, letterSpacing: '0.08em' }}>I AM A...</label>
            <div style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '14px 18px', color: 'var(--text)', fontSize: 14 }}>Student</div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8, letterSpacing: '0.08em' }}>COLLEGE / ORGANIZATION</label>
            <input
              value={form.college}
              onChange={e => setForm({ ...form, college: e.target.value })}
              placeholder="e.g. Delhi University"
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '14px 18px', color: 'var(--text)', outline: 'none', fontSize: 14 }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !form.phone}
            style={{ width: '100%', padding: '16px', borderRadius: 14, background: 'var(--teal)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 10, transition: 'all 0.3s', boxShadow: '0 4px 12px rgba(13,148,136,0.3)', opacity: (loading || !form.phone) ? 0.6 : 1 }}
          >
            {loading ? 'Saving...' : 'Get Started →'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ServicesCatalog({ setActive, setOrderForm, isMobile }) {
  const [tab, setTab] = useState('All');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services?type=catalog')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setServices(data.map(s => ({
            id: s.slug,
            name: s.name,
            description: s.description,
            price: `₹${(s.priceMin || s.basePrice || 2499).toLocaleString('en-IN')}`,
            priceMin: s.priceMin,
            priceMax: s.priceMax,
            cat: s.category,
            catId: s.category.toLowerCase(),
            icon: s.icon
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cats = ['All', 'Academic', 'Visa', 'Career', 'Content', 'Business'];

  const filtered = tab === 'All' ? services : services.filter(s => s.cat === tab);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', minHeight: 400 }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--teal)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 36px', overflowY: 'auto', height: '100%', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Services Catalog</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Explore our range of premium writing services, vetted by experts.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap', overflowX: 'auto', paddingBottom: 4 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setTab(c)} style={{
            padding: '8px 18px', borderRadius: 8, border: tab === c ? '1.5px solid var(--teal)' : '1.5px solid var(--border2)',
            background: tab === c ? 'rgba(13,148,136,0.12)' : 'var(--surface)',
            color: tab === c ? 'var(--teal-light)' : 'var(--text-muted)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
          }}>{c}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map((s, i) => (
          <div key={i} onClick={() => {
            setOrderForm(f => ({ ...f, category: s.name }));
            setActive('new-order');
          }} style={{
            background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 12, padding: 24, cursor: 'pointer',
            transition: 'all 0.25s', display: 'flex', flexDirection: 'column', gap: 12
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(13,148,136,0.4)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon || '📄'}</div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--teal-light)', textTransform: 'uppercase' }}>{s.cat}</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{s.name}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, flex: 1, margin: 0 }}>{s.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--border2)' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal-light)' }}>{s.price}</span>
              <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600 }}>ORDER NOW →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const fmt = n => typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : n;

function AddonRow({ checked, onChange, icon, label, sub, price }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      textAlign: 'left', padding: '12px 14px', borderRadius: 8, border: checked ? '1.5px solid var(--teal)' : '1px solid var(--border2)',
      background: checked ? 'rgba(13,148,136,0.1)' : 'var(--surface2)', color: 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s',
      display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: 12, alignItems: 'center'
    }}>
      <div style={{ width: 18, height: 18, borderRadius: 5, border: checked ? 'none' : '1.5px solid var(--text-dim)', background: checked ? 'var(--teal)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>{checked ? '✓' : ''}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 1 }}>{icon} {label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 300 }}>{sub}</div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal-light)' }}>+{fmt(price)}</div>
    </button>
  );
}

function NewOrder({ setActive, isMobile, onOrderCreated, form, setForm, userProfile }) {
  const { data: session } = useSession();
  const [step, setStep] = useState(form.category ? 2 : 1);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tab, setTab] = useState('All');
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [servicesList, setServicesList] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    fetch('/api/services?type=catalog')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const list = data.map(s => {
            const basePrice = s.priceMin || s.basePrice || 2499;
            
            let variants = s.variants || [];
            if (variants.length === 0) {
              // Fallback to standard / premium if no specific variants in dynamic API
              variants = [
                { id: s.slug + '_standard', label: 'Standard Tier', words: '500 words', delivery: '3-4 days', price: basePrice, fast: Math.round(basePrice * 0.4), addon: 499, custom: 799 },
                { id: s.slug + '_premium', label: 'Premium Tier', words: '1000 words', delivery: '2-3 days', price: basePrice + 1500, fast: Math.round((basePrice + 1500) * 0.4), addon: 499, custom: 799, ats: s.category.toLowerCase() === 'resume' || s.category.toLowerCase() === 'career' ? 299 : undefined }
              ];
            }

            return {
              id: s.slug,
              name: s.name,
              label: s.name,
              desc: s.description,
              description: s.description,
              cat: s.category,
              catId: s.category.toLowerCase(),
              icon: s.icon,
              price: `₹${basePrice.toLocaleString('en-IN')}`,
              variants: variants
            };
          });
          setServicesList(list);
        }
        setLoadingServices(false);
      })
      .catch(() => setLoadingServices(false));
  }, []);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const getServiceIcon = (catId) => {
    const icons = {
      sop: '🎓',
      lor: '📜',
      resume: '💼',
      essays: '📝',
      scholarship: '🏆',
      gmat_waiver: '📜',
      app_fee_waiver: '💸',
      linkedin: '💎',
      email_templates: '✉️',
      media_article: '🖋️',
      visa_application: '🛂'
    };
    return icons[catId] || '📄';
  };

  const allServices = servicesList;

  const cats = ['All', 'Academic', 'Visa', 'Career', 'Content', 'Business'];

  const filteredServices = tab === 'All' ? allServices : allServices.filter(s => s.cat === tab);

  useEffect(() => {
    const pending = localStorage.getItem('pendingOrder');
    if (pending) {
      try {
        const data = JSON.parse(pending);
        setForm(f => ({
          ...f,
          category: data.category || '',
          turnaround: data.turnaround || '72h',
          wordCount: data.wordCount || 500,
          details: data.details || '',
          deadline: data.deadline || ''
        }));
        setStep(2);
        localStorage.removeItem('pendingOrder');
      } catch (e) {
        console.error("Error parsing pending order", e);
      }
    }
  }, [setForm]);

  // Handle custom Admin Checkout Session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      if (sessionId) {
        const fetchCustomSession = async () => {
          try {
            const res = await fetch(`/api/checkout-sessions/${sessionId}`);
            if (!res.ok) throw new Error("Session not found");
            const sessionData = await res.json();
            
            const serviceNames = sessionData.services?.map(s => s.name).join(' & ') || 'Custom Package';
            setForm(f => ({
              ...f,
              category: serviceNames,
              details: `Custom Admin Checkout Session (${sessionId})`,
              isCustomSession: true,
              checkoutSessionId: sessionId,
              customPrice: sessionData.totalPrice,
              customServices: sessionData.services,
            }));
            setStep(3); // Go straight to confirmation step!
            
            // Clean up URL query parameters
            window.history.replaceState({}, '', window.location.pathname);
          } catch (err) {
            console.error("Error fetching custom session:", err);
          }
        };
        fetchCustomSession();
      }
    }
  }, [setForm]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const body = new FormData();
        body.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body });
        if (!res.ok) throw new Error('Upload failed');
        return await res.json();
      });
      const uploaded = await Promise.all(uploadPromises);
      setForm(f => ({ ...f, attachments: [...f.attachments, ...uploaded] }));
    } catch (error) {
      console.error('File upload failure:', error);
      alert("File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (url) => {
    setForm(f => ({ ...f, attachments: f.attachments.filter(a => a.url !== url) }));
  };

  const selectedService = allServices.find(s => s.label === form.category);
  const variants = selectedService?.variants || [];
  const variant = form.variant ? variants.find(v => v.id === form.variant) : variants[0];

  const computePricing = () => {
    if (form.isCustomSession) {
      return {
        total: form.customPrice || 0,
        breakdown: form.customServices?.map(s => ({
          l: `${s.name} (x${s.quantity})`,
          v: s.price * s.quantity
        })) || []
      };
    }
    if (!variant) return { total: 0, breakdown: [] };
    let total = variant.price;
    let breakdown = [{ l: variant.label, v: variant.price }];
    if (form.fast && typeof variant.fast === 'number') { total += variant.fast; breakdown.push({ l: 'Fast track delivery', v: variant.fast }); }
    if (form.addon && typeof variant.addon === 'number') { total += variant.addon; breakdown.push({ l: '+500 words addon', v: variant.addon }); }
    if (form.custom && typeof variant.custom === 'number') { total += variant.custom; breakdown.push({ l: 'Customisation', v: variant.custom }); }
    if (form.ats && variant.ats) { total += variant.ats; breakdown.push({ l: 'ATS Optimization', v: variant.ats }); }
    return { total, breakdown };
  };

  const pricing = computePricing();
  const baseAmount = pricing.total;
  const amountToCharge = appliedCoupon ? appliedCoupon.finalAmount : baseAmount;

  // Clear coupon code if the base price changes to prevent exploits
  useEffect(() => {
    if (appliedCoupon) {
      setAppliedCoupon(null);
      setCouponError('Price updated. Please re-apply coupon code.');
    }
  }, [baseAmount]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), amount: baseAmount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || 'Failed to apply coupon.');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data);
        setCouponError('');
      }
    } catch (err) {
      console.error(err);
      setCouponError('Error validating coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (!form.isCustomSession && !selectedService) throw new Error("Service not selected");

      let order;
      if (form.isCustomSession) {
        const paymentRes = await fetch('/api/payments/razorpay-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: form.checkoutSessionId,
            planKey: 'custom',
            planName: form.category || 'Custom Package',
            userId: session?.user?.id
          }),
        });

        if (!paymentRes.ok) {
          const errData = await paymentRes.json();
          throw new Error(errData.message || 'Failed to initiate payment');
        }
        order = await paymentRes.json();
      } else {
        const paymentRes = await fetch('/api/payments/razorpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amountToCharge,
            idempotencyKey,
            title: `${selectedService.name} Order`,
            description: form.details,
            deadline: form.deadline || new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
            serviceType: selectedService.id,
            attachments: form.attachments,
            couponCode: appliedCoupon ? appliedCoupon.code : undefined,
            baseAmount: baseAmount
          }),
        });

        if (!paymentRes.ok) {
          const errData = await paymentRes.json();
          throw new Error(errData.message || 'Failed to initiate payment');
        }
        order = await paymentRes.json();
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: order.amount,
        currency: "INR",
        name: "Xpresswriters",
        description: form.isCustomSession ? `Payment for Custom Session` : `Payment for ${selectedService.name}`,
        order_id: order.id,
        handler: async (response) => {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyRes.ok) {
            const { projectId } = await verifyRes.json();
            setSubmitted(true);
            if (onOrderCreated) onOrderCreated();
            setTimeout(() => {
              setActive('orders');
            }, 3000);
          }
        },
        prefill: {
          name: session?.user?.name || userProfile?.name || "Student",
          email: session?.user?.email || userProfile?.email || "",
          contact: userProfile?.phone || "",
        },
        theme: { color: "#0d9488" },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert("Payment gateway not loaded. Please refresh.");
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '32px 36px', overflowY: 'auto', height: '100%', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ maxWidth: step === 1 ? 1200 : 800, margin: '0 auto' }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Order Placed!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Your project has been created successfully. Redirecting you to your orders...</p>
            <div style={{ width: 40, height: 40, border: '3px solid var(--teal)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 40, justifyContent: 'center' }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{ width: 40, height: 4, borderRadius: 2, background: step >= s ? 'var(--teal)' : 'var(--border2)' }} />
              ))}
            </div>

            {step === 1 && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                  <h3 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>What do you need?</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Select a service category to begin your project</p>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {cats.map(c => (
                    <button key={c} onClick={() => setTab(c)} style={{
                      padding: '8px 18px', borderRadius: 8, border: tab === c ? '1.5px solid var(--teal)' : '1.5px solid var(--border2)',
                      background: tab === c ? 'rgba(13,148,136,0.12)' : 'var(--surface)',
                      color: tab === c ? 'var(--teal-light)' : 'var(--text-muted)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}>{c}</button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 40 }}>
                  {loadingServices ? (
                    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
                      <div style={{ width: 32, height: 32, border: '3px solid var(--teal)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    </div>
                  ) : filteredServices.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)', fontSize: 14 }}>
                      No active services found in this category.
                    </div>
                  ) : filteredServices.map((svc, i) => (
                    <div key={i} onClick={() => { setForm(f => ({ ...f, category: svc.label })); setStep(2); }} style={{
                      padding: '24px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.25s', display: 'flex', flexDirection: 'column', gap: 12,
                      background: form.category === svc.label ? 'rgba(13,148,136,0.15)' : 'var(--surface)',
                      border: `1.5px solid ${form.category === svc.label ? 'var(--teal)' : 'var(--border2)'}`,
                    }}
                      onMouseEnter={e => { if (form.category !== svc.label) e.currentTarget.style.borderColor = 'rgba(13,148,136,0.4)'; }}
                      onMouseLeave={e => { if (form.category !== svc.label) e.currentTarget.style.borderColor = 'var(--border2)'; }}
                    >
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{svc.icon || '📄'}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--teal-light)', textTransform: 'uppercase' }}>{svc.cat}</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: form.category === svc.label ? 'var(--teal-light)' : 'var(--text)', margin: 0 }}>{svc.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, flex: 1, margin: 0 }}>{svc.desc}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)', marginTop: 8 }}>{svc.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <button onClick={() => setStep(1)} style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text)', width: 32, height: 32, borderRadius: 8, cursor: 'pointer' }}>←</button>
                  <h3 style={{ fontSize: 26, fontWeight: 700 }}>Order details</h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>Tell us more so we can match the perfect writer</p>

                <div style={{ marginBottom: 28 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', display: 'block', marginBottom: 12 }}>CHOOSE YOUR VARIANT</label>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                    {variants.map(v => (
                      <div key={v.id} onClick={() => setForm(f => ({ ...f, variant: v.id }))} style={{
                        padding: '16px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                        background: form.variant === v.id || (!form.variant && variant.id === v.id) ? 'rgba(13,148,136,0.15)' : 'var(--surface)',
                        border: `1.5px solid ${form.variant === v.id || (!form.variant && variant.id === v.id) ? 'var(--teal)' : 'var(--border2)'}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 15, fontWeight: (form.variant === v.id || (!form.variant && variant.id === v.id)) ? 600 : 400, color: 'var(--text)' }}>{v.label}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal-light)' }}>{fmt(v.price)}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          <span>📝 {v.words}</span>
                          <span>⏱ {v.delivery}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', display: 'block', marginBottom: 12 }}>CUSTOMISATIONS & ADD-ONS</label>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                    {typeof variant.fast === 'number' && <AddonRow checked={form.fast} onChange={c => setForm(f => ({ ...f, fast: c }))} icon="⚡" label="Fast Track Delivery" sub="Get it 2-3× faster" price={variant.fast} />}
                    {typeof variant.addon === 'number' && <AddonRow checked={form.addon} onChange={c => setForm(f => ({ ...f, addon: c }))} icon="📝" label="+500 words content" sub="Add extra detail" price={variant.addon} />}
                    {typeof variant.custom === 'number' && <AddonRow checked={form.custom} onChange={c => setForm(f => ({ ...f, custom: c }))} icon="✨" label="Customisation" sub="Tailor to requirements" price={variant.custom} />}
                    {variant.ats && <AddonRow checked={form.ats} onChange={c => setForm(f => ({ ...f, ats: c }))} icon="🤖" label="ATS Format" sub="ATS-optimized version" price={variant.ats} />}
                  </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', display: 'block', marginBottom: 12 }}>BRIEF / REQUIREMENTS</label>
                  <textarea value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} placeholder="Describe what you need. The more detail, the better the match..." style={{ width: '100%', height: 120, background: 'var(--surface)', border: '1.5px solid var(--border2)', borderRadius: 10, padding: '16px', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)', resize: 'vertical', outline: 'none' }} />
                </div>

                <div style={{ marginBottom: 32 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', display: 'block', marginBottom: 12 }}>PROJECT FILES / BRIEF DOCUMENTS</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                    {form.attachments.map((file, idx) => (
                      <div key={idx} style={{ position: 'relative', width: 80, height: 80, borderRadius: 10, background: 'var(--surface2)', border: '1.5px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {/\.(jpg|jpeg|png|webp|gif)$/i.test(file.url) ? (
                          <img src={file.url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 24 }}>📄</div>
                            <div style={{ fontSize: 9, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: 60, padding: '0 5px' }}>{file.name}</div>
                          </div>
                        )}
                        <button onClick={() => removeAttachment(file.url)} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(239,68,68,0.9)', border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                      </div>
                    ))}
                    <label style={{ width: 80, height: 80, borderRadius: 10, border: '1.5px dashed var(--border2)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--teal)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                    >
                      <span style={{ fontSize: 20, color: 'var(--text-dim)' }}>+</span>
                      <span style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 4 }}>{uploading ? '...' : 'Upload'}</span>
                      <input type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
                    </label>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Upload any references, rubrics, or instructions for your writer (PDF, Word, or Images).</p>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button style={{ padding: '12px 24px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }} onClick={() => setStep(1)}>← Back</button>
                  <button style={{ padding: '12px 32px', borderRadius: 6, background: 'var(--teal)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: form.details.trim() ? 1 : 0.5 }} disabled={!form.details.trim()} onClick={() => setStep(3)}>Continue →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                <h3 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Confirm & pay</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>Review your order summary</p>

                <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 28, marginBottom: 28, border: '1px solid var(--border2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--surface3)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 15 }}>Service</span>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{form.category}</span>
                  </div>
                  {pricing.breakdown.map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--surface3)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: 15 }}>{row.l}</span>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{fmt(row.v)}</span>
                    </div>
                  ))}
                  {appliedCoupon && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--surface3)', color: 'var(--green)' }}>
                      <span style={{ fontSize: 15 }}>Discount ({appliedCoupon.code})</span>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>-{fmt(appliedCoupon.discountAmount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 600 }}>Total Price</span>
                    <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--teal-light)' }}>{fmt(amountToCharge)}</span>
                  </div>
                </div>

                {/* Promotional Coupon Section */}
                <div style={{ background: 'var(--surface)', borderRadius: 10, padding: '20px 28px', marginBottom: 28, border: '1px solid var(--border2)' }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>PROMOTIONAL COUPON</label>
                  
                  {appliedCoupon ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--green)', padding: '12px 16px', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>🎉</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                          Code <strong style={{ color: 'var(--green)' }}>{appliedCoupon.code}</strong> applied! Saved {fmt(appliedCoupon.discountAmount)}
                        </span>
                      </div>
                      <button 
                        onClick={handleRemoveCoupon} 
                        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 12, fontWeight: 600, textDecoration: 'underline' }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <input 
                          type="text" 
                          placeholder="Enter coupon code (e.g. SAVE25)" 
                          value={couponInput}
                          onChange={e => setCouponInput(e.target.value.toUpperCase())}
                          style={{
                            flex: 1,
                            background: 'var(--surface2)',
                            border: '1.5px solid var(--border2)',
                            borderRadius: 8,
                            padding: '10px 14px',
                            color: '#fff',
                            fontSize: 13,
                            fontFamily: 'var(--font)',
                            outline: 'none'
                          }}
                        />
                        <button 
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponInput.trim()}
                          style={{
                            background: 'var(--teal)',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            opacity: (!couponInput.trim() || couponLoading) ? 0.6 : 1
                          }}
                        >
                          {couponLoading ? 'Checking...' : 'Apply'}
                        </button>
                      </div>
                      
                      {couponError && (
                        <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 8, fontWeight: 500 }}>
                          ❌ {couponError}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.3)', borderRadius: 10, padding: '16px 20px', marginBottom: 32 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--teal-light)', marginBottom: 6 }}>🔄 Revision Policy</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>Unlimited revisions within 7 days of delivery. We guarantee satisfaction before final closure.</div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button style={{ padding: '12px 24px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }} onClick={() => setStep(2)}>← Back</button>
                  <button style={{ padding: '12px 32px', borderRadius: 6, background: 'var(--teal)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }} onClick={handleSubmit} disabled={submitting}>
                    {submitting ? '⏳ Processing...' : '🔒 Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── APP ── */
export default function App() {
  // Initialize active from URL immediately to prevent flash
  const [active, setActive] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const validTabs = ['overview', 'new-order', 'services', 'orders', 'wallet', 'messages', 'notifications', 'writers', 'settings'];
      if (tabParam && validTabs.includes(tabParam)) return tabParam;
      // Check for order deep link via query param (from notifications)
      if (params.get('orderId')) return 'orders';
      // Check for order deep link via path
      if (window.location.pathname.includes('/orders/')) return 'orders';
      if (window.location.pathname.includes('/messages')) return 'messages';
      const savedTab = localStorage.getItem('xw_dash_tab');
      if (savedTab && validTabs.includes(savedTab)) return savedTab;
    }
    return 'overview';
  });
  const [selectedOrder, setSelectedOrder] = useState(() => {
    if (typeof window !== 'undefined') {
      // Check query param first (from notification clicks)
      const params = new URLSearchParams(window.location.search);
      const orderIdParam = params.get('orderId');
      if (orderIdParam) {
        // Clean up orderId from URL so refresh doesn't re-select stale order
        const tabParam = params.get('tab');
        const newUrl = tabParam 
          ? `${window.location.pathname}?tab=${tabParam}` 
          : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        return orderIdParam;
      }
      
      // Check path for deep links
      if (window.location.pathname.includes('/orders/')) {
        return window.location.pathname.split('/orders/')[1] || null;
      }
    }
    return null;
  });
  const [projects, setProjects] = useState([]);
  const [writers, setWriters] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [deliveredProject, setDeliveredProject] = useState(null);
  const socketRef = useRef(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Auth guard — runs once session status is known
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      if (session?.user?.role !== 'STUDENT') {
        router.push('/login');
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const isCheckout = params.get('action') === 'checkout';
      const sessionId = params.get('session_id');
      const pending = localStorage.getItem('pendingOrder');

      if (isCheckout || pending) {
        setActive('new-order');
        if (pending) localStorage.removeItem('pendingOrder');
        if (isCheckout && !sessionId) window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [status, session?.user?.role, router]);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const t = p.get('tab');
      const orderId = p.get('orderId');
      if (t) setActive(t);
      if (orderId) setSelectedOrder(orderId);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [setSelectedOrder]);

  const fetchProjects = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const res = await fetch('/api/projects', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== 'AbortError') console.error("Fetch projects error:", err);
    }
  };

  const fetchProfile = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch('/api/user/profile', { signal: controller.signal });
      const data = await res.json();
      setUserProfile(data);
      if (data && !data.profileCompleted) {
        setShowProfilePrompt(true);
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error("Fetch profile error:", err);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const fetchWriters = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const res = await fetch('/api/writers', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const data = await res.json();
      setWriters(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== 'AbortError') console.error("Fetch writers error:", err);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProjects(), fetchWriters(), fetchProfile()]);
      } catch (err) {
        console.error("Student dashboard init error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Socket Logic
  useEffect(() => {
    if (session?.user?.id) {
      const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
      setSocket(s);
      socketRef.current = s;

      s.emit('join_chat', { userId: session.user.id, role: session.user.role });

      s.on('project_status_changed', (data) => {
        // Optimistic update
        setProjects(prev => prev.map(p => {
          if (p.id === data.projectId) {
            let updated = { ...p, status: data.status };
            if (data.freelancer) {
              updated.freelancer = data.freelancer;
              updated.freelancerId = data.freelancer.id;
            }
            if (data.status === 'COMPLETED' || data.status === 'REVIEW' || data.status === 'QUALITY_CHECK') {
              setDeliveredProject(updated);
            }
            return updated;
          }
          return p;
        }));
        
        // Background sync to fetch updated relations (e.g. freelancer details)
        fetch('/api/projects').then(r => r.json()).then(d => {
          if (Array.isArray(d)) setProjects(d);
        }).catch(err => console.error("Sync failed:", err));
      });

      s.on('new_notification', (data) => {
        // Re-fetch projects on certain notifications to ensure sync
        if (data.type === 'status' || data.type === 'assignment') {
          fetch('/api/projects').then(r => r.json()).then(d => {
            if (Array.isArray(d)) setProjects(d);
          });
        }
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (socket && projects.length > 0) {
      projects.forEach(p => {
        socket.emit('join_chat', { projectId: p.id, userId: session?.user?.id, role: session?.user?.role });
      });
    }
  }, [socket, projects, session?.user?.id, session?.user?.role]);

  // Persist tab to localStorage only — don't push to URL to avoid popstate loops
  useEffect(() => {
    localStorage.setItem('xw_dash_tab', active);
  }, [active]);

  const userName = useMemo(() => userProfile?.name || session?.user?.name || "Student", [userProfile, session]);
  const unreadCount = 0;

const [orderForm, setOrderForm] = useState(() => {
    if (typeof window !== 'undefined') {
      const pending = localStorage.getItem('pendingOrder');
      if (pending) {
        try {
          const item = JSON.parse(pending);
          return {
            category: item.category || item.prod?.name || '',
            variant: item.variant?.id || null,
            details: item.details || '',
            deadline: item.deadline || '',
            attachments: [],
            fast: item.fast || false,
            addon: item.addon || false,
            custom: item.custom || false,
            ats: item.variant?.ats ? true : false,
            turnaround: item.turnaround || '72h',
            wordCount: item.wordCount || 500
          };
        } catch (e) {
          console.error("Failed to parse pending order", e);
        }
      }
    }
    return { category: '', turnaround: '72h', wordCount: 500, details: '', deadline: '', attachments: [], variant: null, fast: false, addon: false, custom: false, ats: false };
  });

  const handleDeepLink = useCallback((link) => {
    if (!link) return;
    const validTabs = ['overview', 'new-order', 'services', 'orders', 'wallet', 'messages', 'notifications', 'writers', 'settings'];

    if (link.includes('/orders/')) {
      const parts = link.split('/orders/');
      const orderId = parts[1]?.split('?')[0];
      if (orderId) {
        setSelectedOrder(orderId);
        setActive('orders');
      }
    } else if (link.includes('/messages')) {
      setActive('messages');
    } else {
      // Parse ?tab= or bare tab name from path
      const urlObj = new URL(link, window.location.origin);
      const tabParam = urlObj.searchParams.get('tab');
      if (tabParam && validTabs.includes(tabParam)) {
        setActive(tabParam);
      }
    }
  }, []);

  const content = useMemo(() => ({
    overview: <Overview setActive={setActive} setSelectedOrder={setSelectedOrder} projects={projects} writers={writers} userName={userName} isMobile={isMobile} onNavigate={handleDeepLink} />,
    'new-order': <NewOrder setActive={setActive} isMobile={isMobile} onOrderCreated={fetchProjects} form={orderForm} setForm={setOrderForm} userProfile={userProfile} />,
    services: <ServicesCatalog setActive={setActive} setOrderForm={setOrderForm} isMobile={isMobile} />,
    orders: <Orders selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} projects={projects} setActive={setActive} isMobile={isMobile} />,
    wallet: <Wallet projects={projects} userName={userName} isMobile={isMobile} />,
    messages: <Messages projects={projects} userId={session?.user?.id} isMobile={isMobile} />,
    notifications: <Notifications userName={userName} isMobile={isMobile} onNavigate={handleDeepLink} />,
    writers: <SavedWriters setActive={setActive} writers={writers} isMobile={isMobile} />,
    settings: <Settings isMobile={isMobile} profile={userProfile} onUpdate={fetchProfile} />,
  }), [projects, writers, userName, isMobile, userProfile, selectedOrder, socket, handleDeepLink, session, orderForm]);

  if (status === "loading" || loading) {
    return (
      <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0b' }}>
        <div style={{ width: 220, background: '#121224', borderRight: '1px solid rgba(255,255,255,0.07)', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 24 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#0d9488,#0f766e)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff' }}>E</div>
            <div>
              <div style={{ width: 80, height: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 4 }} />
              <div style={{ width: 50, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ width: '100%', height: 40, background: 'rgba(13,148,136,0.14)', borderRadius: 7, marginBottom: 8 }} />
          {[1,2,3,4,5,6].map(i => <div key={i} style={{ width: '100%', height: 40, background: 'rgba(255,255,255,0.03)', borderRadius: 7, marginBottom: 8 }} />)}
        </div>
        <div style={{ flex: 1, padding: 32 }}>
          <div style={{ width: 200, height: 24, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 24 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ background: '#121224', borderRadius: 8, padding: 20 }}>
              <div style={{ width: 60, height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 10 }} />
              <div style={{ width: 100, height: 28, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
            </div>)}
          </div>
          <div style={{ width: '60%', height: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: 70, background: '#121224', borderRadius: 8 }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "STUDENT") {
    return null;
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {showProfilePrompt && <ProfilePrompt onComplete={() => setShowProfilePrompt(false)} />}
      {deliveredProject && (
        <DeliveredPopup
          project={deliveredProject}
          onClose={() => setDeliveredProject(null)}
          onAction={(type) => {
            if (type === 'view') {
              setActive('orders');
              setSelectedOrder(deliveredProject.id);
            } else if (type === 'ticket') {
              setActive('orders');
              setSelectedOrder(deliveredProject.id);
              // The ticket modal is in the Orders component, so we just set the order
            }
            setDeliveredProject(null);
          }}
        />
      )}
      <div style={isMobile ? {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 1000,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
        background: 'var(--surface)',
      } : {}}>
        <Sidebar active={active} setActive={(id) => { setActive(id); if (isMobile) setSidebarOpen(false); }} unreadCount={unreadCount} userName={userName} />
      </div>

      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
        />
      )}

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{ height: 52, borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'flex-end', padding: isMobile ? '0 16px' : '0 36px', flexShrink: 0 }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 24, cursor: 'pointer' }}>
              ☰
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <NotificationBell onNavigate={handleDeepLink} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal), #0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff' }}>{userName.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{userName.split(' ')[0]}</span>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {content[active]}
        </div>
      </main>
    </div>
  );
}


