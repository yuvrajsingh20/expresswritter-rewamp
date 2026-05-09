"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./theme.css";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useChat } from "@/hooks/useChat";
import servicesData from '@/data/services_data.json';
import Wallet from "./student-wallet";
import Notifications from "./student-notifications";



/* ── DATA ── */
/* ── HARD-CODED DATA REMOVED ── */

/* ── STATUS ── */
const STATUS_COLORS = {
  'Finding Writer': { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', dot: '#3b82f6' },
  'Writer Assigned': { bg: 'rgba(124,58,237,0.12)', color: '#a78bfa', dot: '#7c3aed' },
  'In Progress': { bg: 'rgba(13,148,136,0.15)', color: '#2dd4bf', dot: '#0d9488' },
  'Under Review': { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', dot: '#f59e0b' },
  'Quality Check': { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', dot: '#f59e0b' },
  'Delivered': { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', dot: '#22c55e' },
  'Revision Requested': { bg: 'rgba(244,63,94,0.12)', color: '#fb7185', dot: '#f43f5e' },
};

/* ── SIDEBAR ── */
function Sidebar({ active, setActive, unreadCount = 0, userName = "Student" }) {
  const nav = [
    { id: 'overview', icon: '⊞', label: 'Overview' },
    { id: 'new-order', icon: '📝', label: 'New Order' },
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

/* ── OVERVIEW ── */
function Overview({ setActive, setSelectedOrder, projects = [], writers = [], userName = "Student" }) {
  const stats = [
    { label: 'Active Orders', val: projects.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length, icon: '⚡', color: 'var(--teal)', sub: 'In progress' },
    { label: 'Completed', val: projects.filter(o => o.status === 'COMPLETED').length, icon: '✓', color: 'var(--green)', sub: 'All time' },
    { label: 'Wallet Balance', val: `₹0`, icon: '💳', color: 'var(--gold)', sub: 'Available credits' },
    { label: 'Saved Writers', val: writers.length, icon: '✍️', color: '#f472b6', sub: 'Favorites' },
  ];

  const activeOrders = projects.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').map(o => {
    let displayStatus = 'In Progress';
    let progress = 50;
    if (o.status === 'CREATED') { displayStatus = 'Finding Writer'; progress = 10; }
    else if (o.status === 'ASSIGNED') { displayStatus = 'Writer Assigned'; progress = 20; }
    else if (o.status === 'REVISION') { displayStatus = 'Revision Requested'; progress = 80; }
    else if (o.status === 'QUALITY_CHECK') { displayStatus = 'Quality Check'; progress = 90; }
    else if (o.status === 'UNDER_REVIEW') { displayStatus = 'Under Review'; progress = 75; }
    
    return {
      id: o.id,
      service: o.serviceType || o.title,
      writer: o.freelancer?.name || 'Assigning...',
      status: displayStatus,
      progress,
      due: o.deadline ? new Date(o.deadline).toLocaleDateString() : 'N/A'
    };
  });

  const recentLogs = projects.flatMap(p => (p.logs || []).map(l => ({ ...l, projectTitle: p.title }))).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 4);

  return (
    <div style={{ padding: '32px 36px', overflowY: 'auto', height: '100%', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Good day, {userName.split(' ')[0]} 👋</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Here's what's happening with your orders today.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
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
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{p.serviceType || p.title}</div>
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
          {recentLogs.length > 0 ? recentLogs.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < recentLogs.length - 1 ? '1px solid var(--border2)' : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `rgba(13,148,136,0.18)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>📜</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13, color: 'var(--text)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.action}</span>
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Project: {item.projectTitle}</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-dim)', flexShrink: 0 }}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
  const sc = STATUS_COLORS[order.status] || STATUS_COLORS['In Progress'];
  const TRACK = ['Order Placed', 'Writer Assigned', 'In Progress', 'Quality Check', 'Delivered'];
  const stepIdx = order.status === 'Delivered' ? 4 : (order.status === 'Quality Check' || order.status === 'Under Review' || order.status === 'Revision Requested') ? 3 : order.status === 'In Progress' ? 2 : order.status === 'Writer Assigned' ? 1 : 0;

  return (
    <div onClick={onClick} style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 10, padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(13,148,136,0.4)'; e.currentTarget.style.background = 'var(--surface2)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--surface)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{order.service}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.id} · with {order.writer}</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: sc.bg, color: sc.color }}>
          <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: sc.dot, marginRight: 5, verticalAlign: 'middle' }} />
          {order.status}
        </span>
      </div>

      {/* Mini track */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 10 }}>
        {TRACK.map((step, i) => (
          <React.Fragment key={i}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: i <= stepIdx ? 'var(--teal)' : 'var(--surface3)', border: `2px solid ${i <= stepIdx ? 'var(--teal)' : 'var(--border2)'}`, flexShrink: 0, transition: 'all 0.3s' }} />
            {i < TRACK.length - 1 && <div style={{ flex: 1, height: 2, background: i < stepIdx ? 'var(--teal)' : 'var(--surface3)', transition: 'background 0.3s' }} />}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Due: <span style={{ color: 'var(--text)' }}>{order.due}</span></div>
        <div style={{ width: 100, height: 4, borderRadius: 2, background: 'var(--surface3)', overflow: 'hidden' }}>
          <div style={{ width: `${order.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--teal), var(--teal-light))', borderRadius: 2, transition: 'width 0.5s' }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--teal-light)', fontWeight: 600 }}>{order.progress}%</div>
      </div>
    </div>
  );
}

/* ── ORDERS ── */
function Orders({ selectedOrder, setSelectedOrder, projects = [], setActive }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const filters = ['All', 'Active', 'Delivered', 'Revision'];
  
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [ticketError, setTicketError] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
  
  const MAPPED_ORDERS = projects.map(p => {
    let displayStatus = 'In Progress';
    let progress = 50;
    if (p.status === 'CREATED') { displayStatus = 'Finding Writer'; progress = 10; }
    else if (p.status === 'ASSIGNED') { displayStatus = 'Writer Assigned'; progress = 20; }
    else if (p.status === 'REVISION') { displayStatus = 'Revision Requested'; progress = 80; }
    else if (p.status === 'COMPLETED') { displayStatus = 'Delivered'; progress = 100; }
    else if (p.status === 'QUALITY_CHECK') { displayStatus = 'Quality Check'; progress = 90; }
    else if (p.status === 'UNDER_REVIEW') { displayStatus = 'Under Review'; progress = 75; }

    return {
      id: p.id,
      service: p.serviceType || p.title,
      writer: p.freelancer?.name || 'Unassigned',
      status: displayStatus,
      due: p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A',
      price: p.amount || 0,
      words: 1000, // Dummy
      submitted: new Date(p.createdAt).toLocaleDateString(),
      progress
    };
  });

  const filtered = MAPPED_ORDERS.filter(o => {
    const matchesFilter = filter === 'All' ? true :
      filter === 'Active' ? !['Delivered', 'Revision Requested'].includes(o.status) :
      filter === 'Delivered' ? o.status === 'Delivered' :
      filter === 'Revision' ? o.status === 'Revision Requested' : true;
    
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || 
                          o.service.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ padding: '32px 36px', overflowY: 'auto', height: '100%', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>My Orders</h1>
        <button onClick={() => setActive('new-order')} style={{ background: 'var(--teal)', color: '#fff', padding: '9px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>+ New Order</button>
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: 6, border: '1px solid', fontFamily: 'var(--font)', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
            borderColor: filter === f ? 'var(--teal)' : 'var(--border2)',
            background: filter === f ? 'rgba(13,148,136,0.15)' : 'transparent',
            color: filter === f ? 'var(--teal-light)' : 'var(--text-muted)',
            fontWeight: filter === f ? 600 : 400,
          }}>{f}</button>
        ))}
        <div style={{ marginLeft: 'auto', background: 'var(--surface2)', borderRadius: 6, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8, width: 240, border: '1px solid var(--border2)' }}>
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
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 0.8fr 0.7fr 0.6fr', padding: '10px 20px', borderBottom: '1px solid var(--border2)', background: 'var(--surface2)' }}>
          {['Order', 'Service', 'Writer', 'Status', 'Due', 'Price'].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>{h}</div>
          ))}
        </div>
        {filtered.map((order, i) => {
          const sc = STATUS_COLORS[order.status] || STATUS_COLORS['In Progress'];
          const isSelected = selectedOrder === order.id;
          return (
            <div key={order.id} onClick={() => setSelectedOrder(isSelected ? null : order.id)} style={{
              display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 0.8fr 0.7fr 0.6fr',
              padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border2)' : 'none',
              cursor: 'pointer', transition: 'background 0.15s',
              background: isSelected ? 'rgba(13,148,136,0.08)' : 'transparent',
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-light)' }}>{order.id}</div>
              <div style={{ fontSize: 13, paddingRight: 12 }}>{order.service}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{order.writer.split(' ').slice(0,2).join(' ')}</div>
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
      {selectedOrder && (() => {
        const o = MAPPED_ORDERS.find(x => x.id === selectedOrder);
        if (!o) return null;
        const sc = STATUS_COLORS[o.status] || STATUS_COLORS['In Progress'];
        const TRACK = ['Order Placed', 'Writer Assigned', 'In Progress', 'Quality Check', 'Delivered'];
        const stepIdx = o.status === 'Delivered' ? 4 : 2;
        return (
          <div style={{ marginTop: 20, background: 'var(--surface)', border: '1px solid rgba(13,148,136,0.3)', borderRadius: 10, padding: 24, animation: 'fadeUp 0.25s ease' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{o.service}</h3>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{o.id} · Submitted {o.submitted} · {o.words.toLocaleString()} words</div>
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

            <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '24px 0', borderTop: '1px solid var(--border2)' }}>
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
                  <button style={{ padding: '6px 14px', borderRadius: 6, background: '#22c55e', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Download Work ↓</button>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={{ flex: 1, padding: '10px', borderRadius: 6, background: 'transparent', border: '1px solid rgba(34,197,94,0.3)', color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}>Rate Writer ★</button>
                  <button style={{ flex: 1, padding: '10px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Request Revision</button>
                  <button style={{ flex: 1, padding: '10px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Reorder Item 🔄</button>
                </div>
              </div>
            )}

            {o.status !== 'Delivered' && (
               <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowTicketModal(true)} style={{ fontSize: 12, color: '#fb7185', background: 'none', border: 'none', cursor: 'pointer' }}>Report Issue / Request Refund</button>
               </div>
            )}
          </div>
        );
      })()}

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
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Report Issue / Request Refund</h3>
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
    </div>
  );
}

/* ── MESSAGES ── */
function Messages({ projects = [], userId }) {
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [input, setInput] = useState('');
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

  useEffect(() => {
    if (endRef.current) {
      endRef.current.parentElement.scrollTop = endRef.current.parentElement.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
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
      <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid var(--border2)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border2)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Messages</h2>
          <div style={{ background: 'var(--surface2)', borderRadius: 6, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>🔍</span>
            <input placeholder="Search orders..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13, width: '100%' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {projects.map(p => (
            <div key={p.id} onClick={() => setActiveProjectId(p.id)} style={{
              padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border2)', transition: 'background 0.15s',
              background: activeProjectId === p.id ? 'rgba(13,148,136,0.1)' : 'transparent',
              borderLeft: activeProjectId === p.id ? '3px solid var(--teal)' : '3px solid transparent',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, var(--teal), #0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {(p.freelancer?.name || 'W').split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.serviceType || p.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{p.freelancer?.name || 'Awaiting assignment'}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>#{p.id.slice(-6)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {activeProject ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, var(--teal), #0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff' }}>
              {(activeProject.freelancer?.name || 'W').split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{activeProject.freelancer?.name || 'Your Writer'}</div>
              <div style={{ fontSize: 12, color: 'var(--teal-light)' }}>● Active · {activeProject.serviceType || activeProject.title}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 6, background: 'rgba(13,148,136,0.1)', border: '1px solid var(--border)', color: 'var(--teal-light)' }}>#{activeProject.id.slice(-6)}</div>
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
              const isMe = msg.senderId === userId;
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', animation: 'fadeIn 0.2s ease' }}>
                  {!isMe && (
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--teal), #0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', marginRight: 8, flexShrink: 0, alignSelf: 'flex-end' }}>
                      {(msg.senderName || 'W').split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                  )}
                  <div style={{ maxWidth: '65%' }}>
                    <div style={{ padding: '10px 14px', borderRadius: isMe ? '10px 10px 2px 10px' : '10px 10px 10px 2px', background: isMe ? 'var(--teal)' : 'var(--surface2)', fontSize: 13, lineHeight: 1.55, color: isMe ? '#fff' : 'var(--text)' }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                      {msg.createdAt instanceof Date ? msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border2)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={`Message your writer...`}
              rows={1}
              style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'var(--font)', lineHeight: 1.5 }}
            />
            <button onClick={handleSend} style={{ background: 'var(--teal)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: 8, cursor: 'pointer', fontSize: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>Select a project to view chat</div>
      )}
    </div>
  );
}

/* ── WRITERS ── */
function SavedWriters({ setActive, writers = [] }) {
  return (
    <div style={{ padding: '32px 36px', overflowY: 'auto', height: '100%', animation: 'fadeIn 0.3s ease' }}>
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
function Settings() {
  const [saved, setSaved] = useState(false);
  return (
    <div style={{ padding: '32px 36px', overflowY: 'auto', height: '100%', animation: 'fadeIn 0.3s ease' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28 }}>Account Settings</h1>
      <div style={{ maxWidth: 560 }}>
        {[
          { label: 'Full Name', val: 'Meera Krishnan' },
          { label: 'Email', val: 'meera@example.com' },
          { label: 'Phone', val: '+1 (415) 555-0182' },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>{f.label.toUpperCase()}</label>
            <input defaultValue={f.val} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none' }} />
          </div>
        ))}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 12 }}>NOTIFICATIONS</div>
          {['Email me on order updates', 'Email me on new messages', 'Email me on delivery'].map(opt => (
            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer', fontSize: 14, color: 'var(--text)' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--teal)', width: 14, height: 14 }} />
              {opt}
            </label>
          ))}
        </div>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 16 }}>TEAM & COLLABORATION</div>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 10, padding: 20, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Team Accounts</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Invite colleagues to collaborate on orders.</div>
              </div>
              <button style={{ padding: '6px 14px', borderRadius: 6, background: 'var(--teal)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600 }}>+ Invite Member</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 100, background: 'var(--teal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>MK</div>
              <span style={{ fontSize: 13 }}>Meera Krishnan (Owner)</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)' }}>Full Access</span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Agency plan required for more than 2 members. <span style={{ color: 'var(--teal-light)', cursor: 'pointer' }}>Upgrade Now</span></p>
        </div>
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }} style={{ padding: '10px 24px', borderRadius: 6, background: saved ? 'var(--green)' : 'var(--teal)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'background 0.3s' }}>
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

/* ── NEW ORDER ── */
function NewOrder({ setActive }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ category: '', turnaround: '72h', wordCount: 500, details: '', deadline: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const SERVICES = useMemo(() => {
    return Object.values(servicesData.individualServices).flat().map(s => {
      const priceNum = typeof s.price === 'string' 
        ? parseFloat(s.price.replace(/[^\d.]/g, '')) 
        : (s.price || 0);
      return { ...s, price: priceNum || 0, icon: '📄', label: s.name, desc: s.description };
    });
  }, []);

  const turnaroundOptions = [
    { label: '12 Hours', id: '12h', price: '+80%', badge: 'Rush' },
    { label: '24 Hours', id: '24h', price: '+40%', badge: 'Express' },
    { label: '72 Hours', id: '72h', price: 'Standard', badge: '' },
    { label: '7 Days', id: '7d', price: '-10%', badge: 'Economy' },
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const selectedService = SERVICES.find(s => s.label === form.category);
      if (!selectedService) throw new Error("Service not selected");

      let multiplier = 1;
      if (form.turnaround === '12h') multiplier = 1.8;
      else if (form.turnaround === '24h') multiplier = 1.4;
      else if (form.turnaround === '7d') multiplier = 0.9;
      
      const finalAmount = Math.round((form.wordCount / 100) * 12 * multiplier);
      const amountToCharge = selectedService.price > 0 ? selectedService.price : finalAmount;

      const projectRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${selectedService.name} Order`,
          description: form.details,
          deadline: form.deadline || new Date(Date.now() + 72*3600*1000).toISOString(),
          serviceType: selectedService.id,
          amount: amountToCharge,
          attachments: []
        }),
      });
      
      if (!projectRes.ok) throw new Error('Failed to create project');
      const project = await projectRes.json();

      const paymentRes = await fetch('/api/payments/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountToCharge,
          projectId: project.id
        }),
      });
      
      if (!paymentRes.ok) throw new Error('Failed to initiate payment');
      const order = await paymentRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: order.amount,
        currency: "INR",
        name: "Xpresswriters",
        description: `Payment for ${selectedService.name}`,
        order_id: order.id,
        handler: async (response) => {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              projectId: project.id
            }),
          });

          if (verifyRes.ok) {
            setSubmitted(true);
            setTimeout(() => {
              setActive('orders');
            }, 3000);
          }
        },
        prefill: {
          name: "Student Name",
          email: "student@example.com",
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
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '32px 36px', overflowY: 'auto', height: '100%', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
            <h3 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Order Placed!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 28 }}>Your order has been received. We're matching you with the perfect writer.</p>
            <button onClick={() => setActive('orders')} style={{ padding: '12px 24px', borderRadius: 6, background: 'var(--teal)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>View My Orders</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 36 }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? 'var(--teal)' : 'var(--surface3)', transition: 'background 0.3s' }} />
              ))}
            </div>
            
            {step === 1 && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                <h3 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>What do you need?</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>Select a service category to begin</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                  {SERVICES.map((svc, i) => (
                    <div key={i} onClick={() => setForm(f => ({ ...f, category: svc.label }))} style={{
                      padding: '20px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'flex-start', gap: 14,
                      background: form.category === svc.label ? 'rgba(13,148,136,0.15)' : 'var(--surface)',
                      border: `1.5px solid ${form.category === svc.label ? 'var(--teal)' : 'var(--border2)'}`,
                    }}>
                      <span style={{ fontSize: 24 }}>{svc.icon}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: form.category === svc.label ? 'var(--teal-light)' : 'var(--text)', marginBottom: 4 }}>{svc.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{svc.desc}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)', marginTop: 8 }}>₹{svc.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button style={{ padding: '12px 32px', borderRadius: 6, background: 'var(--teal)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: form.category ? 1 : 0.5 }} disabled={!form.category} onClick={() => setStep(2)}>Continue →</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                <h3 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Order details</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>Tell us more so we can match the perfect writer</p>
                
                <div style={{ marginBottom: 28 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', display: 'block', marginBottom: 12 }}>TURNAROUND TIME</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {turnaroundOptions.map(t => (
                      <div key={t.id} onClick={() => setForm(f => ({ ...f, turnaround: t.id }))} style={{
                        padding: '16px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                        background: form.turnaround === t.id ? 'rgba(13,148,136,0.15)' : 'var(--surface)',
                        border: `1.5px solid ${form.turnaround === t.id ? 'var(--teal)' : 'var(--border2)'}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 15, fontWeight: form.turnaround === t.id ? 600 : 400, color: form.turnaround === t.id ? 'var(--text)' : 'var(--text)' }}>{t.label}</span>
                          {t.badge && <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 100, background: 'rgba(13,148,136,0.2)', color: 'var(--teal-light)' }}>{t.badge}</span>}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>{t.price}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', display: 'block', marginBottom: 12 }}>APPROXIMATE WORD COUNT: <span style={{ color: 'var(--teal-light)' }}>{form.wordCount.toLocaleString()}</span></label>
                  <input type="range" min={100} max={10000} step={100} value={form.wordCount} onChange={e => setForm(f => ({ ...f, wordCount: +e.target.value }))} style={{ width: '100%', accentColor: 'var(--teal)', cursor: 'pointer' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}><span>100</span><span>10,000</span></div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', display: 'block', marginBottom: 12 }}>BRIEF / REQUIREMENTS</label>
                  <textarea value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} placeholder="Describe what you need. The more detail, the better the match..." style={{ width: '100%', height: 120, background: 'var(--surface)', border: '1.5px solid var(--border2)', borderRadius: 10, padding: '16px', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)', resize: 'vertical', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button style={{ padding: '12px 24px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }} onClick={() => setStep(1)}>← Back</button>
                  <button style={{ padding: '12px 32px', borderRadius: 6, background: 'var(--teal)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }} onClick={() => setStep(3)}>Continue →</button>
                </div>
              </div>
            )}

            {step === 3 && (() => {
              const selectedService = SERVICES.find(s => s.label === form.category);
              let multiplier = 1;
              if (form.turnaround === '12h') multiplier = 1.8;
              else if (form.turnaround === '24h') multiplier = 1.4;
              else if (form.turnaround === '7d') multiplier = 0.9;
              
              const finalAmount = Math.round((form.wordCount / 100) * 12 * multiplier);
              const amountToCharge = selectedService?.price > 0 ? selectedService.price : finalAmount;

              return (
                <div style={{ animation: 'fadeUp 0.3s ease' }}>
                  <h3 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Confirm & pay</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>Review your order summary</p>

                  <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 28, marginBottom: 28, border: '1px solid var(--border2)' }}>
                    {[
                      { label: 'Service', val: form.category },
                      { label: 'Word Count', val: `${form.wordCount.toLocaleString()} words` },
                      { label: 'Turnaround', val: turnaroundOptions.find(t => t.id === form.turnaround)?.label },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--surface3)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: 15 }}>{row.label}</span>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{row.val}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 600 }}>Total Price</span>
                      <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--teal-light)' }}>₹{amountToCharge}</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.3)', borderRadius: 10, padding: '16px 20px', marginBottom: 32 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--teal-light)', marginBottom: 6 }}>🔄 Revision Policy</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>Unlimited revisions within 7 days of delivery. We guarantee satisfaction — or a full refund.</div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button style={{ padding: '12px 24px', borderRadius: 6, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }} onClick={() => setStep(2)}>← Back</button>
                    <button style={{ padding: '12px 32px', borderRadius: 6, background: 'var(--teal)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }} onClick={handleSubmit} disabled={submitting}>
                      {submitting ? '⏳ Processing...' : '🔒 Place Order'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

/* ── APP ── */
export default function App() {
  const [active, setActive] = useState('overview');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [projects, setProjects] = useState([]);
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const savedTab = localStorage.getItem('xw_dash_tab');
    if (savedTab) setActive(savedTab);

    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch projects error:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchWriters = async () => {
      try {
        const res = await fetch('/api/writers');
        const data = await res.json();
        setWriters(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch writers error:", err);
      }
    };

    fetchProjects();
    fetchWriters();
  }, []);

  useEffect(() => { localStorage.setItem('xw_dash_tab', active); }, [active]);

  const userName = session?.user?.name || "Student";
  const unreadCount = 0;

  const content = {
    overview: <Overview setActive={setActive} setSelectedOrder={setSelectedOrder} projects={projects} writers={writers} userName={userName} />,
    'new-order': <NewOrder setActive={setActive} />,
    orders: <Orders selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} projects={projects} setActive={setActive} />,
    wallet: <Wallet projects={projects} userName={userName} />,
    messages: <Messages projects={projects} userId={session?.user?.id} />,
    notifications: <Notifications userName={userName} />,
    writers: <SavedWriters setActive={setActive} writers={writers} />,
    settings: <Settings />,
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar active={active} setActive={setActive} unreadCount={unreadCount} userName={userName} />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{ height: 52, borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 36px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <span style={{ fontSize: 18 }}>🔔</span>
              <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', border: '2px solid var(--bg)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, var(--teal), #0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, color: '#fff' }}>{userName.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{userName.split(' ')[0]}</span>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {content[active]}
        </div>
      </main>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}


