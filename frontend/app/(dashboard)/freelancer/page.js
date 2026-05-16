"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./theme.css";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useChat } from "@/hooks/useChat";
import io from 'socket.io-client';
import Notifications from "@/components/NotificationsView";
import NotificationBell from "@/components/NotificationBell";
import servicesData from '@/data/services_data.json';


/* ═══════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════ */
// Replaced with dynamic userProfile from App component

const STATUS_META = {
  'Finding Writer': { color: '#3b82f6', bg: 'rgba(59,130,246,.12)', dot: '#3b82f6', rank: 0 },
  'Writer Assigned': { color: '#8b5cf6', bg: 'rgba(139,92,246,.12)', dot: '#8b5cf6', rank: 1 },
  'In Progress': { color: '#0d9488', bg: 'rgba(13,148,136,.12)', dot: '#0d9488', rank: 2 },
  'Under Review': { color: '#8b5cf6', bg: 'rgba(139,92,246,.12)', dot: '#8b5cf6', rank: 3 },
  'Quality Check': { color: '#f59e0b', bg: 'rgba(245,158,11,.12)', dot: '#f59e0b', rank: 4 },
  'Revision Requested': { color: '#f43f5e', bg: 'rgba(244,63,94,.12)', dot: '#f43f5e', rank: 5 },
  'Delivered': { color: '#22c55e', bg: 'rgba(34,197,94,.12)', dot: '#22c55e', rank: 6 },
  'Closed': { color: '#334e4c', bg: 'rgba(51,78,76,.1)', dot: '#334e4c', rank: 7 }
};

const ALL_STATUSES = ['Finding Writer', 'Writer Assigned', 'In Progress', 'Under Review', 'Quality Check', 'Revision Requested', 'Delivered'];

// Replaced with dynamic projects from App component


// Replaced with dynamic earnings data from API


/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function SecurityBadge({ label, icon, color }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 4, background: `${color}12`, border: `1px solid ${color}30`, fontSize: 10, fontWeight: 600, color }}>
      <span>{icon}</span>{label}
    </div>);

}

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
function Sidebar({ active, setActive, orders = [], userName = "Writer" }) {
  const totalUnread = orders.reduce((a, o) => a + (o.unreadMsgs || 0), 0);
  const nav = [
    { id: 'overview', icon: '⊞', label: 'Overview' },
    { id: 'orders', icon: '💬', label: 'Active Chat', badge: orders.filter((o) => ['Finding Writer', 'Writer Assigned', 'In Progress', 'Revision Requested', 'Quality Check'].includes(o.status)).length },
    { id: 'all-orders', icon: '📋', label: 'Orders List' },
    { id: 'earnings', icon: '💰', label: 'Earnings' },
    { id: 'profile', icon: '👤', label: 'My Profile' }
  ];

  return (
    <div style={{ width: 210, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff' }}>X</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', letterSpacing: '-0.01em' }}>Xpresswriters</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Writer Studio</div>
          </div>
        </Link>
      </div>

      {/* Writer card */}
      <div style={{ padding: '14px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar initials={userName.split(' ').map(n => n[0]).join('').toUpperCase()} size={38} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <span style={{ fontSize: 10, color: 'var(--gold)' }}>★ 4.95</span>
            <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 100, background: 'rgba(13,148,136,0.15)', color: 'var(--teal-light)', fontWeight: 600 }}>Pro</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {nav.map((item) =>
          <button key={item.id} onClick={() => setActive(item.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, fontWeight: active === item.id ? 600 : 400, marginBottom: 2, transition: 'all .2s', position: 'relative',
            background: active === item.id ? 'rgba(13,148,136,0.14)' : 'transparent',
            color: active === item.id ? 'var(--teal-light)' : 'var(--text-muted)'
          }}>
            {active === item.id && <div style={{ position: 'absolute', left: 0, top: '18%', bottom: '18%', width: 3, borderRadius: 2, background: 'var(--teal)' }} />}
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
            {item.badge > 0 && <span style={{ background: 'var(--red)', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 100, padding: '1px 5px', minWidth: 16, textAlign: 'center' }}>{item.badge}</span>}
          </button>
        )}
      </nav>

      {/* Bottom links */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
        <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .2s', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
          <span>🚪</span> Logout</button>
      </div>
    </div>);
}

/* ═══════════════════════════════════════════════
   ORDER STRIP
═══════════════════════════════════════════════ */
function OrderStrip({ order, isActive, onClick }) {
  const m = STATUS_META[order.status];
  const isUrgent = order.deliveryType === 'urgent';
  const daysLeft = order.status === 'Delivered' ? null : Math.ceil((new Date(order.due) - new Date()) / 86400000);

  return (
    <div onClick={onClick} style={{
      padding: '0', cursor: 'pointer', borderRadius: 8,
      borderWidth: '1px', borderStyle: 'solid',
      borderColor: isActive ? 'var(--teal)' : 'var(--border)',
      background: isActive ? 'rgba(13,148,136,0.06)' : 'var(--surface2)',
      transition: 'all .2s', overflow: 'hidden', flexShrink: 0,
      boxShadow: isActive ? '0 0 0 1px rgba(13,148,136,0.2)' : 'none'
    }}
      onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(13,148,136,0.3)'; e.currentTarget.style.background = 'var(--surface3)'; } }}
      onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface2)'; } }}>

      {/* Accent top bar = status color */}
      <div style={{ height: 2, background: m.color, opacity: 0.7 }} />

      <div style={{ padding: '16px 18px', fontFamily: "\"Google Sans\"", borderRadius: "0px" }}>
        {/* Row 1: invoice + badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.04em', fontWeight: 500 }}>{order.displayId}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            {isUrgent && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: 'rgba(244,63,94,0.12)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)', letterSpacing: '0.05em' }}>⚡ URGENT</span>}
            {!isUrgent && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.15)' }}>📅 {order.due.split(',')[0]}</span>}
            {order.hasNDA && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 100, background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>🔒 NDA</span>}
          </div>
        </div>

        {/* Row 2: service name + client */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, lineHeight: 1.4 }}>{order.service}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 14, height: 14, borderRadius: 4, background: 'rgba(13,148,136,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'var(--teal-light)' }}>🛡</span>
                {order.client}
              </span>
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>·</span>
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{order.words.toLocaleString()} words · ${order.price}</span>
          </div>
        </div>

        {/* Row 3: status + messages + due */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <StatusPill status={order.status} small />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {order.unreadMsgs > 0 &&
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(13,148,136,0.18)', color: 'var(--teal-light)', animation: 'pulse 2s infinite' }}>
                💬 {order.unreadMsgs} new
              </span>
            }
            {daysLeft !== null &&
              <span style={{ fontSize: 10, color: daysLeft <= 1 ? 'var(--red)' : daysLeft <= 3 ? 'var(--amber)' : 'var(--text-dim)', fontWeight: daysLeft <= 3 ? 600 : 400 }}>
                {daysLeft <= 0 ? 'Overdue' : daysLeft === 1 ? 'Due tomorrow' : `${daysLeft}d left`}
              </span>
            }
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, borderRadius: 2, background: 'var(--surface4)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${order.progress}%`, background: `linear-gradient(90deg,${m.color},${m.color}aa)`, borderRadius: 2, transition: 'width .6s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Progress</span>
          <span style={{ fontSize: 10, color: m.color, fontWeight: 600 }}>{order.progress}%</span>
        </div>
      </div>
    </div>);

}

/* ═══════════════════════════════════════════════
   CHAT THREAD MESSAGE
═══════════════════════════════════════════════ */
function ChatMessage({ msg, writerName = 'Writer' }) {
  const isWriter = msg.from === 'writer';
  const isAdmin = msg.from === 'admin';
  const getInitials = (name) => {
    if (typeof name !== 'string' || !name) return '?';
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const initials = isWriter ? getInitials(writerName) : isAdmin ? 'AD' : getInitials(msg.alias || 'Client');

  // System / status messages — centered pill
  if (msg.type === 'system' || msg.type === 'status' || msg.isSystem) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', background: 'var(--surface3)', padding: '4px 14px', borderRadius: 100, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--teal)', fontSize: 12 }}>🔒</span>
          {msg.content || msg.text}
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, opacity: 0.6 }}>{msg.time}</span>
        </div>
      </div>
    );
  }

  const hasText = !!(msg.content || msg.text);
  const hasAttachments = Array.isArray(msg.attachments) && msg.attachments.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isWriter ? 'flex-end' : 'flex-start', gap: 2, padding: '2px 0' }}>
      {/* Name label */}
      {!isWriter && (
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 34, display: 'flex', alignItems: 'center', gap: 4 }}>
          {isAdmin ? (
            <><span>🛡</span><span style={{ fontWeight: 700, color: 'var(--teal-light)' }}>Master Admin</span> <span style={{ opacity: 0.5 }}>· Supervisor</span></>
          ) : (
            <><span>🛡</span>{msg.alias || 'Client'} <span style={{ opacity: 0.5 }}>· Protected</span></>
          )}
        </div>
      )}

      {/* Bubble row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: isWriter ? 'row-reverse' : 'row' }}>
        {/* Avatar */}
        <div style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0,
          background: isWriter ? 'linear-gradient(135deg,#0d9488,#0f766e)' : isAdmin ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg,#1e1e35,#2a2a4a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 9, color: '#fff', letterSpacing: '-0.01em'
        }}>{initials}</div>

        {/* Bubble */}
        <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {hasText && (
            <div style={{
              padding: '9px 13px',
              borderRadius: isWriter ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
              background: isWriter ? 'var(--teal)' : 'var(--surface3)',
              color: isWriter ? '#fff' : 'var(--text)',
              fontSize: 13, lineHeight: 1.55,
              border: isWriter ? 'none' : '1px solid var(--border)',
              wordBreak: 'break-word'
            }}>
              {msg.content || msg.text}
            </div>
          )}

          {hasAttachments && msg.attachments.map((file, idx) => {
            if (!file || !file.url) return null;
            const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.url);
            return (
              <a key={idx} href={file.url} download={file.name} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10,
                background: isWriter ? 'rgba(13,148,136,0.12)' : 'var(--surface3)',
                border: `1px solid ${isWriter ? 'rgba(13,148,136,0.3)' : 'var(--border)'}`,
                textDecoration: 'none', color: 'inherit'
              }}>
                {isImg
                  ? <img src={file.url} alt="img" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--surface4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📄</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name || 'File'}</div>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>{isImg ? 'Image' : 'Document'} · open ↗</div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Timestamp */}
      <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--mono)', marginLeft: isWriter ? 0 : 34, marginRight: isWriter ? 34 : 0, marginTop: 1 }}>
        {msg.time}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ORDER DETAIL / CHAT PANEL
═══════════════════════════════════════════════ */
function OrderChatPanel({ order, onClose, onStatusChange, onSend, userId, socket, userName, loading }) {
  const [input, setInput] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [typing, setTyping] = useState(false);
  const [tab, setTab] = useState('chat');
  const [chatAttachments, setChatAttachments] = useState([]);
  const [chatUploading, setChatUploading] = useState(false);
  const chatFileInputRef = useRef(null);
  const endRef = useRef();
  const inputRef = useRef();

  const handleDownload = (file) => {
    if (!file || !file.url) return;
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (endRef.current && endRef.current.parentElement) {
       endRef.current.parentElement.scrollTop = 99999;
    }
  }, [order.thread?.length]);

  useEffect(() => {
    const t = setTimeout(() => setTyping(false), 4000);
    return () => clearTimeout(t);
  }, [typing]);

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

  const handleSend = async () => {
    if (!input.trim() && chatAttachments.length === 0) return;
    const msgText = input;
    const attachments = chatAttachments;
    setInput('');
    setChatAttachments([]);
    
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: msgText,
          senderId: userId,
          senderRole: 'FREELANCER',
          chatType: 'CLIENT_CHAT',
          projectId: order.id,
          attachments: attachments
        })
      });
      
      const savedMessage = await res.json();
      if (!res.ok) {
        console.error('Send failed:', savedMessage);
        return;
      }
      onSend(order.id, { 
        id: savedMessage.id,
        type: 'text',
        from: 'writer',
        text: savedMessage.content,
        content: savedMessage.content,
        attachments: Array.isArray(savedMessage.attachments) ? savedMessage.attachments : [],
        time: new Date(savedMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: savedMessage.createdAt || new Date().toISOString()
      });

      if (socket) {
        socket.emit('send_message', {
          id: savedMessage.id,
          content: savedMessage.content,
          projectId: order.id,
          senderId: userId,
          senderRole: 'FREELANCER',
          chatType: 'CLIENT_CHAT',
          attachments: savedMessage.attachments,
          sender: { ...savedMessage.sender, role: 'FREELANCER' }
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const TIMELINE = ['Order Placed', 'Writer Assigned', 'In Progress', 'Quality Check', 'Delivered'];
  const stepIdx = order.status === 'Delivered' ? 4 : order.status === 'Quality Check' ? 3 : order.status === 'In Progress' || order.status === 'Under Review' || order.status === 'Revision' ? 2 : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'slideLeft .3s ease' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, background: 'var(--surface)' }}>
        <button onClick={onClose} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font)', flexShrink: 0 }}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.service}</span>
            <StatusPill status={order.status} small />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)' }}>{order.displayId}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>·</span>
            <span style={{ fontSize: 10, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ fontSize: 11 }}>🛡</span>{order.client}</span>
            {order.hasNDA && <SecurityBadge label="NDA Active" icon="🔒" color="#8b5cf6" />}
          </div>
        </div>
        {/* Status changer */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {order.status === 'Finding Writer' ? (
            <button onClick={() => onStatusChange(order.id, 'Writer Assigned')} style={{ background: 'var(--teal)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>Accept Assignment</button>
          ) : (
            <>
              <button onClick={() => setShowStatusMenu((s) => !s)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 6, background: 'var(--surface2)', border: `1px solid ${STATUS_META[order.status]?.color || 'var(--border)'}`, color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 500, transition: 'all .2s' }}>
                Update Status <span style={{ fontSize: 10 }}>▾</span>
              </button>
              {showStatusMenu &&
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px', zIndex: 100, minWidth: 180, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', animation: 'popIn .2s ease' }}>
                  {ALL_STATUSES.filter((s) => s !== order.status && s !== 'New Order').map((s) => {
                    const sm = STATUS_META[s];
                    return (
                      <div key={s} onClick={() => { onStatusChange(order.id, s); setShowStatusMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', transition: 'background .15s', fontSize: 12, fontWeight: 500, color: sm.color }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>

                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: sm.dot, flexShrink: 0 }} />
                        {s}
                      </div>);

                  })}
                </div>
              }
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        {[['chat', '💬 Chat'], ['brief', '📋 Brief'], ['files', '📁 Files'], ['timeline', '📍 Timeline']].map(([id, label]) =>
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '9px 16px', border: 'none', borderBottom: `2px solid ${tab === id ? 'var(--teal)' : 'transparent'}`,
            background: 'transparent', color: tab === id ? 'var(--teal-light)' : 'var(--text-muted)',
            fontSize: 12, fontWeight: tab === id ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .2s'
          }}>{label}</button>
        )}
      </div>

      {/* Tab content */}
      {tab === 'chat' &&
        <>
          {/* Messages */}
          <div className="scrollable" style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
            {/* Security banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 7, marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>🔐</span>
              <span style={{ fontSize: 11, color: '#a78bfa', lineHeight: 1.4 }}>This conversation is end-to-end encrypted. Client identity is anonymized. All files are watermarked & tracked.</span>
            </div>
            
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', gap: 10 }}>
                <div style={{ width: 16, height: 16, border: '2px solid var(--teal)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Loading secure conversation history...</span>
              </div>
            )}
            {(order.thread || []).map((msg, i) => <ChatMessage key={msg.id || i} msg={msg} writerName={userName} />)}
            {typing &&
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, animation: 'fadeIn .3s ease' }}>
                <Avatar initials={(order.clientCode || 'CL').slice(0, 2).toUpperCase()} size={26} gradient="linear-gradient(135deg,#1e1e35,#2a2a4a)" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '8px 12px', background: 'var(--surface3)', borderRadius: '10px 10px 10px 3px', border: '1px solid var(--border)' }}>
                  {[0, 1, 2].map((i) => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-dim)', display: 'inline-block', animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />)}
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{order.client} is typing...</span>
              </div>
          }
            <div ref={endRef} />
          </div>

          {/* Input area */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
            {order.status === 'New Order' ? (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 12, padding: '10px 0' }}>Chat is disabled until you accept the assignment.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                {chatAttachments.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '4px 0' }}>
                    {chatAttachments.map((file, idx) => (
                      <div key={idx} style={{ position: 'relative', width: 50, height: 50, borderRadius: 6, background: 'var(--surface3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {/\.(jpg|jpeg|png|webp|gif)$/i.test(file.url) ? (
                          <img src={file.url} alt="preview" style={{ width: '100%', height: '100%', borderRadius: 6, objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: 18 }}>📄</span>
                        )}
                        <button onClick={() => removeChatAttachment(file.url)} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--red)', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <textarea value={input} disabled={chatUploading} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder={chatUploading ? "Uploading..." : `Message ${order.client}...`} rows={1} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13, resize: 'none', fontFamily: 'var(--font)', lineHeight: 1.5, maxHeight: 80, overflowY: 'auto' }} />
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button 
                        onClick={() => chatFileInputRef.current?.click()}
                        disabled={chatUploading}
                        title="Attach file" 
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, padding: 2, borderRadius: 4, transition: 'color .2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--teal-light)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
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
                  </div>
                  <button onClick={handleSend} disabled={(!input.trim() && chatAttachments.length === 0) || chatUploading} style={{ width: 40, height: 40, borderRadius: 8, background: (input.trim() || chatAttachments.length > 0) && !chatUploading ? 'var(--teal)' : 'var(--surface3)', border: `1px solid ${(input.trim() || chatAttachments.length > 0) && !chatUploading ? 'var(--teal)' : 'var(--border)'}`, color: '#fff', fontSize: 18, cursor: (input.trim() || chatAttachments.length > 0) && !chatUploading ? 'pointer' : 'default', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                    {chatUploading ? "..." : "↑"}
                  </button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7 }}>
              <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>🔒 End-to-end encrypted · Client identity protected · Files auto-watermarked</span>
            </div>
          </div>
        </>
      }

      {tab === 'brief' &&
        <div className="scrollable" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal-light)', marginBottom: 8 }}>Project Brief</div>
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px', fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>{order.brief}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['Invoice', order.displayId], ['Words', `${order.words.toLocaleString()} words`], ['Price', `$${order.price}`], ['Due', order.due], ['Delivery', order.deliveryType === 'urgent' ? '⚡ Urgent' : '📅 Timeline'], ['NDA', order.hasNDA ? 'Active' : 'Not required']].map(([k, v]) =>
              <div key={k} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{v}</div>
              </div>
            )}
          </div>
        </div>
      }

      {tab === 'files' &&
        <div className="scrollable" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {[
            ['Initial Project Files', order.files], 
            ['Delivered Files', order.deliveredFiles],
            ['Chat Documents', (order.thread || []).reduce((acc, m) => [...acc, ...(m.attachments || [])], [])]
          ].map(([label, files]) => (
            <div key={label} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal-light)', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>{label}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: 9 }}>{files.length} ITEMS</span>
              </div>
              {files.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px dashed var(--border)', textAlign: 'center' }}>
                  No files in this category yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {files.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', transition: 'transform .2s, border-color .2s' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, border: '1px solid var(--border)' }}>
                        {/\.(jpg|jpeg|png|webp|gif)$/i.test(f.url) ? '🖼️' : '📄'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>{f.name}</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                          <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 500 }}>{f.size || 'DOCUMENT'}</span>
                          {f.watermarked && <SecurityBadge label="Watermarked" icon="🔒" color="#8b5cf6" />}
                          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-dim)' }} />
                          <span style={{ fontSize: 10, color: 'var(--teal-light)', cursor: 'pointer' }} onClick={() => handleDownload(f)}>Quick Preview</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDownload(f)}
                        title="Download File"
                        style={{ 
                          background: 'var(--teal)', border: 'none', color: '#fff', 
                          width: 32, height: 32, borderRadius: 8, fontSize: 14, cursor: 'pointer', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' 
                        }}
                      >
                        ↓
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div style={{ padding: '12px 14px', background: 'rgba(13,148,136,0.06)', border: '1px solid var(--border-teal)', borderRadius: 8, fontSize: 11, color: 'var(--teal-light)', lineHeight: 1.6 }}>
            🔒 All delivered files are automatically watermarked with the client's ID and a unique document hash. Unauthorized distribution is tracked.
          </div>
        </div>
      }

      {tab === 'timeline' &&
        <div className="scrollable" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal-light)', marginBottom: 16 }}>Order Timeline</div>
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: 'var(--border)', borderRadius: 2 }} />
            {TIMELINE.map((step, i) => {
            const done = i < stepIdx;const active = i === stepIdx;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -24, width: 16, height: 16, borderRadius: '50%', background: done ? 'var(--teal)' : active ? 'var(--teal)' : 'var(--surface3)', border: `2px solid ${done || active ? 'var(--teal)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 700, flexShrink: 0, zIndex: 1, top: 2 }}>{done ? '✓' : i + 1}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: done || active ? 600 : 400, color: done || active ? 'var(--text)' : 'var(--text-dim)' }}>{step}</div>
                    {active && <div style={{ fontSize: 11, color: 'var(--teal-light)', marginTop: 2 }}>Current stage</div>}
                  </div>
                </div>);

          })}
          </div>
        </div>
      }
    </div>);

}

const mapDBStatusToUI = (status) => {
  switch (status) {
    case 'CREATED': return 'Finding Writer';
    case 'ASSIGNED': return 'Writer Assigned';
    case 'IN_PROGRESS': return 'In Progress';
    case 'REVIEW':
    case 'UNDER_REVIEW': return 'Under Review';
    case 'QUALITY_CHECK': return 'Quality Check';
    case 'REVISION': return 'Revision Requested';
    case 'COMPLETED': return 'Delivered';
    case 'CLOSED': return 'Closed';
    default: return 'In Progress';
  }
};

// Build a flat lookup: serviceId -> service name, from the same JSON students use when ordering
const SERVICE_LABELS = Object.values(servicesData.individualServices)
  .flat()
  .reduce((acc, s) => { 
    acc[s.id.toLowerCase()] = s.name; 
    return acc; 
  }, {});

const getStandardServiceName = (p) => {
  const type = (p.serviceType || '').toLowerCase();
  if (SERVICE_LABELS[type]) return SERVICE_LABELS[type];
  
  // Fallback: Use title but clean it up
  let t = p.title || 'Writing Service';
  // Remove " Order" suffix if present
  t = t.replace(/ Order$/i, '');
  // Capitalize first letter of each word
  return t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

const mapProjectsToOrders = (rawProjects, userId) => {
  return (rawProjects || []).map(p => {
    const serviceLabel = getStandardServiceName(p);
    return {
      id: p.id,
      displayId: `XW-${p.id.slice(-5).toUpperCase()}`,
      service: serviceLabel,
      client: p.student?.name || `Client #${p.studentId?.slice(-4)}`,
      clientCode: p.studentId?.slice(-4) || '????',
      deliveryType: p.deadline && (new Date(p.deadline) - new Date()) < 86400000 * 2 ? 'urgent' : 'timeline',
      due: p.deadline ? new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date',
      submitted: new Date(p.createdAt).toLocaleDateString(),
      words: 0, 
      price: p.amount || 0,
      status: mapDBStatusToUI(p.status),
      progress: p.status === 'COMPLETED' ? 100 : (p.status === 'REVIEW' || p.status === 'QUALITY_CHECK') ? 90 : p.status === 'CREATED' ? 10 : 50,
      // Count messages not sent by this freelancer as "unread" (schema has no read field)
      unreadMsgs: (p.messages || []).filter(m => m.senderId !== userId && m.sender?.role === 'STUDENT').length || 0,
      hasNDA: p.hasNDA || false,
      brief: p.description || 'No brief provided.',
      files: (p.attachments || []).filter(a => a && !a.type),
      deliveredFiles: (p.attachments || []).filter(a => a && a.type === 'DELIVERY'),
      thread: (p.messages || [])
        .filter(m => !m.chatType || m.chatType === 'CLIENT_CHAT')
        .map(m => {
          const isWriterMsg = m.sender?.role === 'FREELANCER' || m.senderId === userId;
          const isAdminMsg = m.sender?.role === 'ADMIN';
          const rawTs = m.createdAt ? new Date(m.createdAt) : new Date();
          const time = isNaN(rawTs.getTime()) ? '' : rawTs.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            id: m.id,
            type: m.isSystem ? 'system' : (m.type || 'text'),
            from: isWriterMsg ? 'writer' : isAdminMsg ? 'admin' : 'client',
            alias: isWriterMsg ? (p.freelancer?.name || 'Writer') : isAdminMsg ? 'Master Admin' : (p.student?.name || `Client #${p.studentId?.slice(-4)}`),
            text: m.content || '',
            content: m.content || '',
            time,
            createdAt: m.createdAt || new Date().toISOString(),
            fileName: Array.isArray(m.attachments) && m.attachments[0] ? m.attachments[0].name : undefined,
            size: Array.isArray(m.attachments) && m.attachments[0] ? m.attachments[0].size : undefined,
            attachments: Array.isArray(m.attachments) ? m.attachments : [],
          };
        })
    };
  });
};

function OrdersView({ projects = [], userId, isMobile, userName, socket }) {
  const [orders, setOrders] = useState(() => mapProjectsToOrders(projects, userId));

  // When projects changes (e.g. socket adds a client message to App state),
  // MERGE threads instead of replacing — preserving optimistically added writer messages
  useEffect(() => {
    setOrders(prev => {
      const fresh = mapProjectsToOrders(projects, userId);
      if (prev.length === 0) return fresh;
      return fresh.map(freshOrder => {
        const existing = prev.find(o => o.id === freshOrder.id);
        if (!existing) return freshOrder;
        // Merge threads: keep all messages, deduplicate by id
        const mergedThread = [...freshOrder.thread];
        for (const msg of existing.thread) {
          if (!msg.id || !mergedThread.some(m => m.id === msg.id)) {
            mergedThread.push(msg);
          }
        }
        // Sort by createdAt timestamp
        mergedThread.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return { ...freshOrder, thread: mergedThread, status: existing.status };
      });
    });
  }, [projects, userId]);

  // Also handle incoming client messages directly via socket for instant rendering
  useEffect(() => {
    if (!socket) return;
    const handler = (data) => {
      if (data.chatType !== 'CLIENT_CHAT') return;
      if (data.senderId === userId) return; // already added optimistically
      setOrders(prev => prev.map(o => {
        if (o.id !== data.projectId) return o;
        if (o.thread.some(m => m.id === data.id)) return o; // dedupe
        const newMsg = {
          id: data.id || `tmp-${Date.now()}`,
          type: 'text',
          from: data.senderRole === 'ADMIN' ? 'admin' : 'client',
          alias: data.senderRole === 'ADMIN' ? 'Master Admin' : o.client,
          text: data.content,
          content: data.content,
          attachments: Array.isArray(data.attachments) ? data.attachments : [],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: data.timestamp || new Date().toISOString(),
        };
        return { ...o, thread: [...o.thread, newMsg], unreadMsgs: o.unreadMsgs + 1 };
      }));
    };
    socket.on('receive_message', handler);
    return () => socket.off('receive_message', handler);
  }, [socket, userId]);

  const [activeOrder, setActiveOrder] = useState(null);
  const [fetchingThread, setFetchingThread] = useState(false);
  const [fetchingDetail, setFetchingDetail] = useState(false);

  // Fetch full history and project details when an order is opened
  useEffect(() => {
    if (!activeOrder) return;
    
    const fetchFullData = async () => {
      setFetchingThread(true);
      setFetchingDetail(true);
      
      try {
        // Fetch project detail and messages in parallel
        const [msgRes, detailRes] = await Promise.all([
          fetch(`/api/messages?projectId=${activeOrder}&type=CLIENT_CHAT`),
          fetch(`/api/projects/${activeOrder}`)
        ]);
        
        const [msgs, detail] = await Promise.all([msgRes.json(), detailRes.json()]);

        if (Array.isArray(msgs)) {
          // Normalise to UI shape
          const fullThread = msgs.map(m => {
            const isWriterMsg = m.sender?.role === 'FREELANCER' || m.senderId === userId;
            const isAdminMsg = m.sender?.role === 'ADMIN';
            const rawTs = m.createdAt ? new Date(m.createdAt) : new Date();
            const time = isNaN(rawTs.getTime()) ? '' : rawTs.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return {
              id: m.id,
              type: m.isSystem ? 'system' : (m.type || 'text'),
              from: isWriterMsg ? 'writer' : isAdminMsg ? 'admin' : 'client',
              alias: isWriterMsg ? (userName || 'Writer') : isAdminMsg ? 'Master Admin' : 'Client',
              text: m.content || '',
              content: m.content || '',
              time,
              createdAt: m.createdAt || new Date().toISOString(),
              attachments: Array.isArray(m.attachments) ? m.attachments : [],
            };
          });
          
          setOrders(prev => prev.map(o => {
            if (o.id !== activeOrder) return o;
            return { 
              ...o, 
              thread: fullThread, 
              unreadMsgs: 0,
              // Merge in heavy details fetched on-demand
              brief: detail.description || o.brief,
              files: (detail.attachments || []).filter(a => a && !a.type),
              deliveredFiles: (detail.attachments || []).filter(a => a && a.type === 'DELIVERY')
            };
          }));
        }
      } catch (err) {
        console.error("Failed to fetch full order data:", err);
      } finally {
        setFetchingThread(false);
        setFetchingDetail(false);
      }
    };

    fetchFullData();
  }, [activeOrder, userId, userName]);

  const [filter, setFilter] = useState('All');

  const filterTabs = [
  { id: 'All', label: 'All', count: orders.length },
  { id: 'Active', label: 'Active', count: orders.filter((o) => ['Finding Writer', 'Writer Assigned', 'In Progress', 'Under Review', 'Quality Check'].includes(o.status)).length },
  { id: 'Revision', label: 'Revision', count: orders.filter((o) => o.status === 'Revision Requested').length },
  { id: 'Delivered', label: 'Delivered', count: orders.filter((o) => o.status === 'Delivered').length }];

  const filtered = orders.filter((o) => {
    if (filter === 'All') return true;
    if (filter === 'Active') return ['Finding Writer', 'Writer Assigned', 'In Progress', 'Under Review', 'Quality Check'].includes(o.status);
    if (filter === 'Revision') return o.status === 'Revision Requested';
    if (filter === 'Delivered') return o.status === 'Delivered';
    return true;
  });

  const handleStatusChange = async (id, newStatus) => {
    const dbStatus = 
      newStatus === 'Finding Writer' ? 'CREATED' :
      newStatus === 'Writer Assigned' ? 'ASSIGNED' :
      newStatus === 'In Progress' ? 'IN_PROGRESS' : 
      newStatus === 'Delivered' ? 'COMPLETED' : 
      newStatus === 'Revision Requested' ? 'REVISION' : 
      newStatus === 'Under Review' ? 'REVIEW' : 
      newStatus === 'Quality Check' ? 'QUALITY_CHECK' : 
      newStatus;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: dbStatus })
      });
      if (res.ok) {
        if (newStatus === 'Writer Assigned') {
          await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: id,
              content: "Hello! I am your assigned expert writer for this project. I've reviewed your brief and will begin working on it immediately. Please feel free to share any additional details or requirements here.",
              chatType: 'CLIENT_CHAT'
            })
          });
        }
        if (socket) socket.emit('status_update', { projectId: id, status: dbStatus });
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      } else {
        console.error("Failed to update status");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = (id, msg) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== id) return o;
      return { ...o, thread: [...o.thread, msg] };
    }));
  };

  const selectedOrder = orders.find((o) => o.id === activeOrder);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Orders list panel */}
      <div style={{ width: activeOrder ? 340 : 540, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', borderRight: activeOrder ? '1px solid var(--border)' : 'none', transition: 'width .3s ease' }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Orders</h2>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ background: 'var(--surface2)', borderRadius: 6, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>🔍</span>
                <input placeholder="Search orders..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 12, width: 120 }} />
              </div>
            </div>
          </div>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {filterTabs.map((t) =>
            <button key={t.id} onClick={() => setFilter(t.id)} style={{
              padding: '5px 12px', borderRadius: 6, border: '1px solid', fontFamily: 'var(--font)', fontSize: 12, cursor: 'pointer', transition: 'all .2s',
              borderColor: filter === t.id ? 'var(--teal)' : 'var(--border)',
              background: filter === t.id ? 'rgba(13,148,136,0.12)' : 'transparent',
              color: filter === t.id ? 'var(--teal-light)' : 'var(--text-muted)',
              fontWeight: filter === t.id ? 600 : 400
            }}>
                {t.label} {t.count > 0 && <span style={{ fontSize: 10, opacity: .7 }}>({t.count})</span>}
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="scrollable" style={{ flex: 1, padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
          {filtered.map((order) =>
          <OrderStrip key={order.id} order={order} isActive={activeOrder === order.id} onClick={() => {setActiveOrder(order.id === activeOrder ? null : order.id);setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, unreadMsgs: 0 } : o));}} />
          )}
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)', fontSize: 13 }}>No orders in this category</div>}
        </div>
      </div>

      {/* Chat / Detail panel */}
      {selectedOrder ?
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <OrderChatPanel order={selectedOrder} onClose={() => setActiveOrder(null)} onStatusChange={handleStatusChange} onSend={handleSend} userId={userId} socket={socket} userName={userName} loading={fetchingThread} />
        </div> :

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: 'var(--text-dim)' }}>
          <div style={{ fontSize: 48, opacity: .3 }}>💬</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Select an order to open the chat</div>
          <div style={{ fontSize: 12, opacity: .6 }}>All conversations are end-to-end encrypted</div>
        </div>
      }
    </div>);

}

function AllOrdersList({ orders = [], isMobile }) {
  const [filter, setFilter] = useState('All');
  
  const filtered = orders.filter((o) => {
    if (filter === 'All') return true;
    if (filter === 'Active') return ['Finding Writer', 'Writer Assigned', 'In Progress', 'Under Review', 'Quality Check'].includes(o.status);
    if (filter === 'Revision') return o.status === 'Revision Requested';
    if (filter === 'Delivered') return o.status === 'Delivered';
    return o.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'CREATED': return '#3b82f6';
      case 'IN_PROGRESS': return '#0d9488';
      case 'REVIEW': return '#8b5cf6';
      case 'REVISION': return '#f59e0b';
      case 'COMPLETED': return '#22c55e';
      default: return '#6b7280';
    }
  };

  return (
    <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Orders Management</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Complete history of all assigned projects and their status.</p>
        </div>
      </div>

      <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.05em' }}>Order ID</th>
              <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.05em' }}>Service / Title</th>
              <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.05em' }}>Client</th>
              <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.05em' }}>Deadline</th>
              <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.05em' }}>Amount</th>
              <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.05em' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map((o) => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background .2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '16px 18px', fontWeight: 600, color: 'var(--teal-light)', fontFamily: 'var(--mono)', fontSize: 12 }}>{o.displayId}</td>
                <td style={{ padding: '16px 18px' }}>
                  <div style={{ fontWeight: 600 }}>{o.service}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{o.displayId}</div>
                </td>
                <td style={{ padding: '16px 18px' }}>{o.client}</td>
                <td style={{ padding: '16px 18px', color: 'var(--text-muted)' }}>{o.due}</td>
                <td style={{ padding: '16px 18px', fontWeight: 700 }}>${o.price}</td>
                <td style={{ padding: '16px 18px' }}>
                  <span style={{ 
                    padding: '3px 10px', borderRadius: 100, fontSize: 10, fontWeight: 700,
                    background: 'rgba(13,148,136,0.1)', color: 'var(--teal-light)',
                    border: '1px solid rgba(13,148,136,0.2)', textTransform: 'uppercase'
                  }}>
                    {o.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>No orders found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Overview({ setActive, projects = [], userName = "Writer", isMobile, session, userProfile }) {
  const [recentNotifications, setRecentNotifications] = useState([]);
  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRecentNotifications(data.slice(0, 5));
      })
      .catch(err => console.error("Failed to fetch notifications:", err));
  }, []);
  const active = projects.filter((o) => ['Finding Writer', 'Writer Assigned', 'In Progress', 'Under Review', 'Quality Check', 'Revision Requested'].includes(mapDBStatusToUI(o.status)));
  const earnings = projects.filter(o => o.status === 'COMPLETED').reduce((acc, p) => acc + (p.amount || 0), 0) * 0.7;
  
  // Calculate unread from real projects
  const unreadCount = projects.reduce((acc, p) => {
    return acc + (p.messages?.filter(m => !m.read && m.senderId !== session?.user?.id).length || 0);
  }, 0);

  const stats = [
    { label: 'Active Orders', val: active.length, icon: '⚡', color: 'var(--teal)', sub: 'Requires attention' },
    { label: 'Unread Messages', val: unreadCount, icon: '💬', color: 'var(--amber)', sub: 'From clients' },
    { label: 'Total Earnings', val: `$${earnings.toFixed(2)}`, icon: '💰', color: 'var(--green)', sub: 'All time' },
    { label: 'Avg Rating', val: (userProfile?.freelancerProfile?.rating || 5.0).toFixed(1), icon: '★', color: 'var(--gold)', sub: 'Top Writer' }];


  return (
    <div className="scrollable" style={{ padding: '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Welcome back, {userName.split(' ')[0]} 👋</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>You have {active.length} active orders.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        {stats.map((s, i) =>
          <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '18px 18px', animation: `fadeUp .3s ease ${i * .07}s both` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{s.label}</span>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, marginBottom: 3, letterSpacing: '-0.02em' }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{s.sub}</div>
          </div>
        )}
      </div>

      {/* Active orders */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>Active Orders</h2>
          <button onClick={() => setActive('orders')} style={{ fontSize: 12, color: 'var(--teal-light)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}>View all →</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {active.length > 0 ? active.slice(0, 3).map((order) => {
            const uiStatus = mapDBStatusToUI(order.status);
            return (
              <div key={order.id} onClick={() => setActive('orders')} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all .2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(13,148,136,0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}>

                <div style={{ width: 4, height: 40, borderRadius: 2, background: 'var(--teal)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getStandardServiceName(order)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{order.student?.name} · XW-{order.id.slice(-5).toUpperCase()}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <StatusPill status={uiStatus} small />
                </div>
              </div>);

          }) : (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim)', border: '1px dashed var(--border)', borderRadius: 8 }}>No active orders.</div>
          )}
        </div>
      </div>

      {/* Performance */}
      <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '18px 20px', marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Profile Performance</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 16 }}>
          {[['Profile Views', '1,248', '↑ 12% this week'], ['Order Response Rate', '98%', 'Within 2 hours'], ['On-Time Delivery', '100%', 'All-time record']].map(([k, v, s]) =>
            <div key={k} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--teal-light)', marginBottom: 2 }}>{v}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{k}</div>
              <div style={{ fontSize: 10, color: 'var(--green)' }}>{s}</div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Recent Activity</h2>
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          {recentNotifications.length > 0 ? recentNotifications.map((item, i) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < recentNotifications.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', background: item.read ? 'transparent' : 'rgba(13,148,136,0.04)' }} onClick={() => setActive('notifications')}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: `rgba(13,148,136,0.14)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{item.icon || '🔔'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: item.read ? 400 : 600 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.msg}</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )) : (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>No recent activity notifications.</div>
          )}
        </div>
      </div>
    </div>);
}

/* ═══════════════════════════════════════════════
   EARNINGS
═══════════════════════════════════════════════ */
function Earnings({ isMobile }) {
  const [data, setData] = useState({ balance: 0, totalEarned: 0, pending: 0, history: [], projects: [], currency: 'USD', symbol: '$' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/freelancer/earnings');
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (err) {
        console.error("Failed to fetch earnings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derive chart data from projects or fallback to static
  const chartData = data.projects && data.projects.length > 0
    ? data.projects.reduce((acc, p) => {
      const date = new Date(p.date);
      const month = date.toLocaleString('default', { month: 'short' });
      const existing = acc.find(d => d.month === month);
      if (existing) {
        existing.amt += p.amount;
      } else {
        acc.push({ month, amt: p.amount });
      }
      return acc;
    }, []).slice(-6)
    : [];

  const maxAmt = Math.max(...chartData.map((d) => d.amt)) || 1;

  const payouts = data.history || [];

  return (
    <div className="scrollable" style={{ padding: '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Earnings</h1>

      {/* Totals */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Earned', val: `${data.symbol}${data.totalEarned.toLocaleString()}`, sub: 'All time', color: 'var(--teal-light)' },
          { label: 'Available Balance', val: `${data.symbol}${data.balance.toLocaleString()}`, sub: 'Ready for payout', color: 'var(--green)' },
          { label: 'Pending Payout', val: `${data.symbol}${data.pending.toLocaleString()}`, sub: 'Processing', color: 'var(--amber)' }].
          map((s, i) =>
            <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '20px 20px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: s.color, letterSpacing: '-0.02em', marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{s.sub}</div>
            </div>
          )}
      </div>

      {/* Bar chart */}
      <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '20px 24px', marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>Monthly Earnings — Last 6 Months</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 140 }}>
          {chartData.map((d, i) =>
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal-light)' }}>{data.symbol}{(d.amt / 1000).toFixed(1)}k</div>
              <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: `linear-gradient(180deg,var(--teal),rgba(13,148,136,0.4))`, height: `${d.amt / maxAmt * 100}px`, transition: 'height .6s ease', minHeight: 4, position: 'relative' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'} />
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{d.month}</div>
            </div>
          )}
        </div>
      </div>

      {/* Payout history */}
      <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>Payout History</h3>
          <button style={{ fontSize: 12, color: 'var(--teal-light)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}>Request Payout</button>
        </div>
        {payouts.map((p, i) =>
          <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr 0.8fr', gap: isMobile ? 6 : 0, padding: '12px 18px', borderBottom: i < payouts.length - 1 ? '1px solid var(--border)' : 'none', alignItems: isMobile ? 'flex-start' : 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.date}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{data.symbol}{p.amount.toLocaleString()}</span>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{p.method}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: p.status === 'COMPLETED' || p.status === 'Paid' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: p.status === 'COMPLETED' || p.status === 'Paid' ? 'var(--green)' : 'var(--amber)', width: 'fit-content' }}>{p.status}</span>
          </div>
        )}
      </div>
    </div>);
}

/* ── PROFILE ── */
function Profile({ isMobile, profile, onUpdate }) {
  const [form, setForm] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    occupation: profile?.occupation || 'Freelancer',
    college: profile?.college || '',
    country: profile?.freelancerProfile?.country || '',
    currency: profile?.freelancerProfile?.currency || 'USD',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        occupation: profile.occupation || 'Freelancer',
        college: profile.college || '',
        country: profile.freelancerProfile?.country || '',
        currency: profile.freelancerProfile?.currency || 'USD',
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
    <div className="scrollable" style={{ padding: '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>My Profile</h1>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: 20, alignItems: 'start' }}>
        <div>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border-teal)', borderRadius: 8, padding: '20px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal-light)', marginBottom: 14 }}>Public Profile Preview</div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
              <Avatar initials={form.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'W'} size={56} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{form.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>{form.occupation}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--gold)' }}>★ 5.0</span>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>(0 reviews)</span>
                  <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 100, background: 'rgba(13,148,136,0.15)', color: 'var(--teal-light)', fontWeight: 600 }}>Top Writer</span>
                  {form.country && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {form.country}</span>}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Email</label>
              <input value={form.email} disabled style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text-dim)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)', cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Phone / WhatsApp</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Occupation / Title</label>
              <input value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)' }} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>College / Organization</label>
            <input value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Country</label>
              <input value={form.country} disabled style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text-dim)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)', cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Payout Currency</label>
              <input value={form.currency} disabled style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text-dim)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)', cursor: 'not-allowed' }} />
            </div>
          </div>
          <button onClick={handleSave} disabled={loading} style={{ padding: '9px 22px', borderRadius: 6, background: saved ? 'var(--green)' : 'var(--teal)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'background .3s' }}>
            {loading ? 'Saving...' : saved ? '✓ Saved!' : 'Save Profile'}
          </button>
        </div>
        <div>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '18px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal-light)', marginBottom: 14 }}>Writer Stats</div>
            {[['Response time', '< 2 hours'], ['On-time rate', '100%']].map(([k, v]) =>
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{k}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{v}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>);
}

function ProfilePrompt({ onComplete }) {
  const [form, setForm] = useState({ phone: '', occupation: 'Freelancer', college: '' });
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
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, var(--teal), #0f766e)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px', color: '#fff', boxShadow: '0 10px 20px rgba(13,148,136,0.2)' }}>🖋️</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>Welcome, Expert!</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.5 }}>Let's set up your writer profile so clients can know your expertise.</p>
        </div>
        <div style={{ gap: 20, display: 'flex', flexDirection: 'column' }}>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="WhatsApp / Phone" style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '14px 18px', color: 'var(--text)', outline: 'none', fontSize: 14 }} />
          <div style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '14px 18px', color: 'var(--text)', fontSize: 14 }}>Freelancer</div>
          <input value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} placeholder="University / Organization" style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '14px 18px', color: 'var(--text)', outline: 'none', fontSize: 14 }} />
          <button onClick={handleSubmit} disabled={loading || !form.phone} style={{ width: '100%', padding: '16px', borderRadius: 14, background: 'var(--teal)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 10, transition: 'all 0.3s' }}>{loading ? 'Saving...' : 'Start Writing →'}</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const { data: session } = useSession();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      setUserProfile(data);
      if (data && !data.profileCompleted) setShowProfilePrompt(true);
    } catch (err) { console.error(err); }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActive(tabParam);
    } else {
      const savedTab = localStorage.getItem('xw_writer_tab');
      if (savedTab) setActive(savedTab);
    }

    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const t = p.get('tab');
      if (t) setActive(t);
    };
    window.addEventListener('popstate', handlePopState);

    const fetchAll = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProjects(), fetchProfile()]);
      } catch (err) {
        console.error("Dashboard init error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('xw_writer_tab', active);
    const url = new URL(window.location);
    if (url.searchParams.get('tab') !== active) {
      url.searchParams.set('tab', active);
      window.history.pushState({}, '', url);
    }
  }, [active]);

  useEffect(() => {
    if (socket && projects.length > 0 && session?.user?.id) {
      projects.forEach(p => {
        socket.emit('join_chat', { projectId: p.id, role: session.user.role, userId: session.user.id });
      });
    }
  }, [socket, projects, session?.user?.id]);

  // Socket listener for real-time project refresh
  useEffect(() => {
    if (session?.user?.id) {
      const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
      setSocket(s);
      socketRef.current = s;
      s.emit('join_chat', { userId: session.user.id, role: session.user.role });

      s.on('receive_message', (data) => {
        if (data.chatType === 'CLIENT_CHAT') {
           // Skip messages sent by this freelancer — already added optimistically
           if (data.senderId === session?.user?.id) return;
           setProjects(prev => prev.map(p => {
             if (p.id === data.projectId) {
               const alreadyHas = p.messages?.some(m => m.id === data.id);
               if (alreadyHas) return p;
               // Attach sender.role so mapProjectsToOrders can determine 'client' direction
               const newMsg = {
                 ...data,
                 createdAt: data.timestamp || new Date().toISOString(),
                 sender: data.sender || { role: data.senderRole || 'STUDENT' }
               };
               return { ...p, messages: [...(p.messages || []), newMsg] };
             }
             return p;
           }));
        }
      });

      s.on('new_notification', (data) => {
        if (data.type === 'new_job' || data.type === 'assignment' || data.type === 'revision') {
          // Re-fetch projects to update dashboard instantly
          fetch('/api/projects')
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data)) setProjects(data);
            })
            .catch(err => console.error("Failed to re-fetch projects:", err));
        }
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [session?.user?.id]);

  const userName = userProfile?.name || session?.user?.name || "Writer";
  const views = {
    overview: <Overview setActive={setActive} projects={projects} userName={userName} isMobile={isMobile} session={session} userProfile={userProfile} />,
    orders: <OrdersView projects={projects} userId={session?.user?.id} isMobile={isMobile} userName={userName} socket={socket} />,
    'all-orders': <AllOrdersList orders={mapProjectsToOrders(projects, session?.user?.id)} isMobile={isMobile} />,
    earnings: <Earnings isMobile={isMobile} />,
    profile: <Profile isMobile={isMobile} profile={userProfile} onUpdate={fetchProfile} />,
    notifications: <Notifications userName={userName} isMobile={isMobile} />
  };

  const isVerified = userProfile?.freelancerProfile?.isVerified;
  const status = userProfile?.freelancerProfile?.status;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0b', color: '#fff' }}>
        <p style={{ fontSize: 14, fontWeight: 'bold', letterSpacing: '0.1em' }}>LOADING DASHBOARD...</p>
      </div>
    );
  }

  if (userProfile && status === 'Rejected') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0b', color: '#fff', padding: 20, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <span style={{ fontSize: 40 }}>✗</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, fontStyle: 'italic', marginBottom: 8, letterSpacing: '-0.02em', color: '#ef4444' }}>Application Rejected</h1>
        <p style={{ color: '#8e8e93', fontSize: 14, maxWidth: 450, marginBottom: 20, lineHeight: 1.5 }}>
          We appreciate your interest in Express Writer. After reviewing your profile, our team has decided not to proceed with your application at this time.
        </p>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px', maxWidth: 400, marginBottom: 32, textAlign: 'left' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Reason for Decision:</div>
          <p style={{ color: '#cecece', fontSize: 13, lineHeight: 1.6, fontStyle: 'italic' }}>
            "{userProfile.freelancerProfile.rejectionReason || 'Your application did not meet our current requirements.'}"
          </p>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ padding: '12px 32px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s' }}
        >
          Return to Login
        </button>
      </div>
    );
  }

  if (userProfile && isVerified === false) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0b', color: '#fff', padding: 20, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 40 }}>⏳</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, fontStyle: 'italic', marginBottom: 8, letterSpacing: '-0.02em' }}>Application Under Review</h1>
        <p style={{ color: '#8e8e93', fontSize: 14, maxWidth: 400, marginBottom: 24, lineHeight: 1.5 }}>
          Thank you for applying! Our team is reviewing your profile. This usually takes less than 24 hours. You will gain access to the dashboard once approved.
        </p>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s' }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {showProfilePrompt && <ProfilePrompt onComplete={() => setShowProfilePrompt(false)} />}
      <div style={isMobile ? { position: 'absolute', top: 0, left: 0, bottom: 0, zIndex: 1000, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease', background: 'var(--surface)' } : {}}>
        <Sidebar active={active} setActive={(id) => { setActive(id); if (isMobile) setSidebarOpen(false); }} orders={projects} userName={userName} />
      </div>
      {isMobile && sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} />}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <div style={{ height: 46, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'flex-end', padding: isMobile ? '0 16px' : '0 28px', flexShrink: 0, background: 'var(--surface)' }}>
          {isMobile && <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 24, cursor: 'pointer' }}>☰</button>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--teal-light)', background: 'rgba(13,148,136,0.08)', padding: '4px 10px', borderRadius: 100, border: '1px solid var(--border-teal)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s infinite' }} /> Available for orders</div>
            <NotificationBell />
            <Avatar initials={userName.split(' ').map(n => n[0]).join('').toUpperCase()} size={28} />
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>{views[active] || views.overview}</div>
      </main>
    </div>);
}
