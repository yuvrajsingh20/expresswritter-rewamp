"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./theme.css";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useChat } from "@/hooks/useChat";




/* ═══════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════ */
const WRITER = { name: 'Dr. Amara Singh', avatar: 'AS', title: 'Senior Academic Writer', rating: 4.97, reviews: 312, badge: 'Top Writer', joined: 'Jan 2023', completedOrders: 312, earnings: 18940 };

const STATUS_META = {
  'New Order': { color: '#3b82f6', bg: 'rgba(59,130,246,.12)', dot: '#3b82f6', rank: 0 },
  'In Progress': { color: '#0d9488', bg: 'rgba(13,148,136,.12)', dot: '#0d9488', rank: 1 },
  'Under Review': { color: '#8b5cf6', bg: 'rgba(139,92,246,.12)', dot: '#8b5cf6', rank: 2 },
  'Revision': { color: '#f59e0b', bg: 'rgba(245,158,11,.12)', dot: '#f59e0b', rank: 3 },
  'Quality Check': { color: '#f59e0b', bg: 'rgba(245,158,11,.12)', dot: '#f59e0b', rank: 4 },
  'Delivered': { color: '#22c55e', bg: 'rgba(34,197,94,.12)', dot: '#22c55e', rank: 5 },
  'Closed': { color: '#334e4c', bg: 'rgba(51,78,76,.1)', dot: '#334e4c', rank: 6 }
};

const ALL_STATUSES = ['New Order', 'In Progress', 'Under Review', 'Revision', 'Quality Check', 'Delivered'];

const ORDERS_DATA = [
{
  id: 'XW-48291', invoiceNum: 'INV-2024-0291', service: 'Statement of Purpose',
  client: 'Client #A204', clientCode: 'A204', deliveryType: 'urgent',
  due: 'Apr 24, 2026', submitted: 'Apr 20, 2026', words: 800, price: 144,
  status: 'In Progress', progress: 65, unreadMsgs: 2, hasNDA: true,
  brief: 'Stanford CS PhD SOP. Focus on computational linguistics research at NYU under Prof. Chen. Target supervisor: Prof. Manning. Tone: scholarly yet personal. 800 words max.',
  files: [{ name: 'Research_CV_2026.pdf', size: '1.2 MB', secure: true }, { name: 'Brief_Notes.docx', size: '240 KB', secure: false }],
  deliveredFiles: [],
  thread: [
  { type: 'system', text: 'Order XW-48291 created. Client identity protected.', time: 'Apr 20, 9:00 AM' },
  { from: 'client', alias: 'Client #A204', text: 'Hello! I\'m hoping to apply to Stanford CS PhD. I\'ve attached my CV and some notes about my research background.', time: 'Apr 20, 9:05 AM' },
  { from: 'writer', text: 'Hello! I\'ve reviewed your materials. Your computational linguistics research is impressive — that\'s a strong angle for Stanford. I\'ll start drafting and have a first version ready by tomorrow.', time: 'Apr 20, 10:12 AM' },
  { type: 'status', text: 'Status updated: New Order → In Progress', time: 'Apr 20, 10:12 AM' },
  { from: 'client', alias: 'Client #A204', text: 'That sounds great! Should I share anything else? I have a recommendation letter draft too if helpful.', time: 'Apr 20, 11:30 AM' },
  { from: 'writer', text: 'Yes, please share the LOR draft — it\'ll help me align the SOP narrative. Also, could you list 2-3 research topics you\'d most like to pursue at Stanford?', time: 'Apr 20, 12:04 PM' },
  { from: 'client', alias: 'Client #A204', text: 'I\'ve uploaded the LOR draft. My research interests are: (1) NLP for low-resource languages, (2) cross-lingual transfer learning, (3) human-computer interaction through language.', time: 'Apr 20, 2:18 PM' },
  { type: 'file', from: 'client', alias: 'Client #A204', fileName: 'LOR_Draft_Chen.pdf', size: '890 KB', time: 'Apr 20, 2:18 PM' },
  { from: 'writer', text: 'Perfect — these are exactly the right research directions for Prof. Manning\'s lab. I\'ve incorporated all three themes into a cohesive narrative. Draft ready for your review.', time: 'Apr 21, 9:40 AM' },
  { type: 'file', from: 'writer', fileName: 'SOP_Draft_v1_SECURE.pdf', size: '1.1 MB', watermarked: true, time: 'Apr 21, 9:41 AM' }]

},
{
  id: 'XW-47103', invoiceNum: 'INV-2024-0261', service: 'LinkedIn Profile Rewrite',
  client: 'Client #B118', clientCode: 'B118', deliveryType: 'timeline',
  due: 'Apr 22, 2026', submitted: 'Apr 19, 2026', words: 500, price: 75,
  status: 'Quality Check', progress: 90, unreadMsgs: 1, hasNDA: false,
  brief: 'Senior Product Manager at a FAANG company. Needs complete LinkedIn overhaul — headline, about, experience bullets. Target: VP/Director roles at Series B–D startups.',
  files: [{ name: 'Current_LinkedIn_Export.pdf', size: '540 KB', secure: false }],
  deliveredFiles: [{ name: 'LinkedIn_Rewrite_FINAL.docx', size: '320 KB', watermarked: true }],
  thread: [
  { type: 'system', text: 'Order XW-47103 created. Client identity protected.', time: 'Apr 19, 3:00 PM' },
  { from: 'client', alias: 'Client #B118', text: 'Hi! I need a complete LinkedIn overhaul. I\'m currently a Sr. PM at a top tech company, looking to move to VP/Director roles at startups.', time: 'Apr 19, 3:10 PM' },
  { from: 'writer', text: 'Great brief! I\'ve done a deep audit of your current profile. The headline is underselling you significantly. I\'ll rewrite with your target audience in mind.', time: 'Apr 19, 4:00 PM' },
  { type: 'status', text: 'Status updated: New Order → In Progress', time: 'Apr 19, 4:00 PM' },
  { from: 'writer', text: 'Your profile rewrite is ready. I\'ve optimised for 14 keywords relevant to startup VP/Director searches. The headline now leads with impact, not job title.', time: 'Apr 20, 10:00 AM' },
  { type: 'file', from: 'writer', fileName: 'LinkedIn_Rewrite_FINAL.docx', size: '320 KB', watermarked: true, time: 'Apr 20, 10:01 AM' },
  { type: 'status', text: 'Status updated: In Progress → Quality Check', time: 'Apr 20, 10:01 AM' },
  { from: 'client', alias: 'Client #B118', text: 'This is incredible! The headline is perfect. Just one small tweak — can we soften the tone in the About section slightly? It feels slightly aggressive.', time: 'Apr 20, 2:00 PM' }]

},
{
  id: 'XW-44302', invoiceNum: 'INV-2024-0234', service: 'Research Proposal — ML in Healthcare',
  client: 'Client #C056', clientCode: 'C056', deliveryType: 'timeline',
  due: 'Apr 28, 2026', submitted: 'Apr 18, 2026', words: 2000, price: 280,
  status: 'Revision', progress: 80, unreadMsgs: 3, hasNDA: true,
  brief: 'PhD research proposal for UCL. Topic: applying transformer models to early disease detection in NHS imaging data. Must follow UCL proposal format. 2000 words.',
  files: [{ name: 'UCL_Proposal_Guidelines.pdf', size: '2.1 MB', secure: false }, { name: 'Research_Context.docx', size: '890 KB', secure: false }],
  deliveredFiles: [{ name: 'Research_Proposal_v1_SECURE.pdf', size: '2.8 MB', watermarked: true }],
  thread: [
  { type: 'system', text: 'Order XW-44302 created. NDA active. Client identity protected.', time: 'Apr 18, 10:00 AM' },
  { from: 'client', alias: 'Client #C056', text: 'I need a research proposal for UCL PhD. My topic is transformer models for NHS imaging. The guidelines doc has the exact format required.', time: 'Apr 18, 10:20 AM' },
  { from: 'writer', text: 'Hello! I\'ve reviewed the UCL guidelines carefully. This is a strong research topic — very timely given NHS digital transformation. I\'ll structure it in 5 sections as required.', time: 'Apr 18, 11:00 AM' },
  { type: 'status', text: 'Status updated: New Order → In Progress', time: 'Apr 18, 11:00 AM' },
  { from: 'writer', text: 'First draft ready. I\'ve included a comprehensive literature review covering ViT, DeiT, and recent NHS imaging studies. The methodology section details the proposed transformer architecture.', time: 'Apr 20, 8:30 AM' },
  { type: 'file', from: 'writer', fileName: 'Research_Proposal_v1_SECURE.pdf', size: '2.8 MB', watermarked: true, time: 'Apr 20, 8:31 AM' },
  { type: 'status', text: 'Status updated: In Progress → Revision', time: 'Apr 21, 9:00 AM' },
  { from: 'client', alias: 'Client #C056', text: 'The proposal is very strong overall! Three revision points: (1) Section 3 methodology needs more detail on data preprocessing pipeline, (2) add a Gantt chart for timeline, (3) the bibliography needs APA 7th edition formatting.', time: 'Apr 21, 9:05 AM' },
  { from: 'client', alias: 'Client #C056', text: 'Also, could you strengthen the significance statement in the introduction? It needs to be more compelling for the committee.', time: 'Apr 21, 9:08 AM' },
  { from: 'client', alias: 'Client #C056', text: 'Happy to jump on a call if that helps clarify the methodology section.', time: 'Apr 21, 9:10 AM' }]

},
{
  id: 'XW-43109', invoiceNum: 'INV-2024-0219', service: 'Business Proposal — SaaS Startup',
  client: 'Client #D302', clientCode: 'D302', deliveryType: 'urgent',
  due: 'Apr 26, 2026', submitted: 'Apr 22, 2026', words: 1200, price: 240,
  status: 'New Order', progress: 0, unreadMsgs: 0, hasNDA: false,
  brief: 'Investor pitch document for B2B SaaS startup automating payroll for SMEs. Need: executive summary, problem/solution, market size, business model, team. Professional and compelling.',
  files: [{ name: 'Company_Deck_Draft.pdf', size: '3.4 MB', secure: false }],
  deliveredFiles: [],
  thread: [
  { type: 'system', text: 'Order XW-43109 created. Client identity protected.', time: 'Apr 22, 8:00 AM' },
  { from: 'client', alias: 'Client #D302', text: 'Hi! We\'re a B2B SaaS startup and need an investor-ready business proposal. I\'ve attached our rough deck for context. Urgent — needed by Thursday.', time: 'Apr 22, 8:15 AM' }]

},
{
  id: 'XW-41890', invoiceNum: 'INV-2024-0201', service: 'Academic Essay — Philosophy of Mind',
  client: 'Client #E741', clientCode: 'E741', deliveryType: 'timeline',
  due: 'Apr 15, 2026', submitted: 'Apr 10, 2026', words: 3000, price: 360,
  status: 'Delivered', progress: 100, unreadMsgs: 0, hasNDA: false,
  brief: '3000-word essay on functionalism vs biological naturalism (Searle). Include analysis of the Chinese Room argument. Harvard referencing. Masters level.',
  files: [{ name: 'Essay_Guidelines.pdf', size: '210 KB', secure: false }],
  deliveredFiles: [{ name: 'Philosophy_Essay_FINAL.pdf', size: '1.9 MB', watermarked: true }],
  thread: [
  { type: 'system', text: 'Order XW-41890 created. Client identity protected.', time: 'Apr 10, 2:00 PM' },
  { from: 'client', alias: 'Client #E741', text: 'Hi, I need a Masters-level philosophy essay on functionalism vs biological naturalism. The Chinese Room argument should be central.', time: 'Apr 10, 2:10 PM' },
  { from: 'writer', text: 'Excellent topic! Searle vs Dennett is one of the richest debates in philosophy of mind. I\'ll structure it as: (1) functionalism overview, (2) biological naturalism, (3) Chinese Room analysis, (4) critique and synthesis.', time: 'Apr 10, 3:00 PM' },
  { type: 'status', text: 'Status updated: New Order → In Progress', time: 'Apr 10, 3:00 PM' },
  { type: 'status', text: 'Status updated: In Progress → Quality Check', time: 'Apr 13, 9:00 AM' },
  { type: 'file', from: 'writer', fileName: 'Philosophy_Essay_FINAL.pdf', size: '1.9 MB', watermarked: true, time: 'Apr 13, 9:01 AM' },
  { type: 'status', text: 'Status updated: Quality Check → Delivered', time: 'Apr 14, 10:00 AM' },
  { from: 'client', alias: 'Client #E741', text: 'This is absolutely outstanding. The analysis of the Chinese Room is the best I\'ve read. My professor gave it an A. Thank you so much!', time: 'Apr 15, 4:00 PM' },
  { from: 'writer', text: 'Wonderful news! Thank you for trusting me with this — it was genuinely a pleasure to write. Best of luck with the rest of your programme! ⭐', time: 'Apr 15, 4:30 PM' }]

}];


const EARNINGS_DATA = [
{ month: 'Nov', amt: 1240 }, { month: 'Dec', amt: 1890 }, { month: 'Jan', amt: 2100 },
{ month: 'Feb', amt: 1750 }, { month: 'Mar', amt: 2480 }, { month: 'Apr', amt: 1980 }];


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
    { id: 'orders', icon: '📋', label: 'Orders', badge: orders.filter((o) => ['NEW', 'REVISION'].includes(o.status)).length },
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
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Link href="/student" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', padding: '6px 8px', borderRadius: 6, transition: 'all .2s', display: 'block' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--teal-light)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
          ← Client View</Link>
        <button style={{ width: '100%', padding: '8px 0', borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.color = 'var(--teal-light)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
          🔒 Change Status</button>
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
      border: `1px solid ${isActive ? 'var(--teal)' : 'var(--border)'}`,
      background: isActive ? 'rgba(13,148,136,0.06)' : 'var(--surface2)',
      transition: 'all .2s', overflow: 'hidden',
      boxShadow: isActive ? '0 0 0 1px rgba(13,148,136,0.2)' : 'none', borderColor: "var(--border)"
    }}
    onMouseEnter={(e) => {if (!isActive) {e.currentTarget.style.borderColor = 'rgba(13,148,136,0.3)';e.currentTarget.style.background = 'var(--surface3)';}}}
    onMouseLeave={(e) => {if (!isActive) {e.currentTarget.style.borderColor = 'var(--border)';e.currentTarget.style.background = 'var(--surface2)';}}}>
      
      {/* Accent top bar = status color */}
      <div style={{ height: 2, background: m.color, opacity: 0.7 }} />

      <div style={{ padding: '12px 14px', fontFamily: "\"Google Sans\"", borderRadius: "0px" }}>
        {/* Row 1: invoice + badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.04em', fontWeight: 500 }}>{order.invoiceNum}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            {isUrgent && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: 'rgba(244,63,94,0.12)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)', letterSpacing: '0.05em' }}>⚡ URGENT</span>}
            {!isUrgent && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.15)' }}>📅 {order.due.split(',')[0]}</span>}
            {order.hasNDA && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 100, background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>🔒 NDA</span>}
          </div>
        </div>

        {/* Row 2: service name + client */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.service}</div>
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
function ChatMessage({ msg, writerAvatar }) {
  if (msg.type === 'system') return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0', animation: 'fadeIn .3s ease' }}>
      <div style={{ fontSize: 10, color: 'var(--text-dim)', background: 'var(--surface3)', padding: '4px 12px', borderRadius: 100, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ color: 'var(--teal)', fontSize: 11 }}>🔒</span>{msg.text} · <span style={{ fontFamily: 'var(--mono)', fontSize: 9 }}>{msg.time}</span>
      </div>
    </div>);


  if (msg.type === 'status') return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0', animation: 'statusSlide .35s ease' }}>
      <div style={{ fontSize: 10, background: 'rgba(13,148,136,0.08)', border: '1px solid var(--border-teal)', padding: '5px 14px', borderRadius: 100, color: 'var(--teal-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11 }}>⟳</span>{msg.text} · <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)' }}>{msg.time}</span>
      </div>
    </div>);


  if (msg.type === 'file') {
    const isWriter = msg.from === 'writer';
    return (
      <div style={{ display: 'flex', justifyContent: isWriter ? 'flex-end' : 'flex-start', padding: '2px 0', animation: 'fadeIn .3s ease' }}>
        {!isWriter && <Avatar initials={msg.alias?.slice(-4) || 'C'} size={26} gradient="linear-gradient(135deg,#1e1e35,#2a2a4a)" />}
        <div style={{ maxWidth: '70%', marginLeft: !isWriter ? 8 : 0, marginRight: isWriter ? 0 : 0 }}>
          {!isWriter && <div style={{ fontSize: 9, color: 'var(--text-dim)', marginBottom: 3, marginLeft: 2, display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ fontSize: 10 }}>🛡</span>{msg.alias}</div>}
          <div style={{ background: isWriter ? 'rgba(13,148,136,0.1)' : 'var(--surface3)', border: `1px solid ${isWriter ? 'var(--border-teal)' : 'var(--border)'}`, borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 7, background: 'var(--surface4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>📄</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.fileName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{msg.size}</span>
                {msg.watermarked && <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 100, background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>🔒 Secured</span>}
              </div>
            </div>
            <button style={{ flexShrink: 0, background: 'var(--teal)', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: 5, fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600 }}>↓</button>
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 3, textAlign: isWriter ? 'right' : 'left', fontFamily: 'var(--mono)' }}>{msg.time}</div>
        </div>
        {isWriter && <Avatar initials={writerAvatar} size={26} style={{ marginLeft: 8 }} />}
      </div>);

  }

  const isWriter = msg.from === 'writer';
  return (
    <div style={{ display: 'flex', justifyContent: isWriter ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 7, padding: '2px 0', animation: 'fadeIn .3s ease' }}>
      {!isWriter && <Avatar initials={msg.alias?.slice(-4) || 'C'} size={26} gradient="linear-gradient(135deg,#1e1e35,#2a2a4a)" />}
      <div style={{ maxWidth: '68%' }}>
        {!isWriter && <div style={{ fontSize: 9, color: 'var(--text-dim)', marginBottom: 3, marginLeft: 2, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ fontSize: 10 }}>🛡</span>{msg.alias} <span style={{ color: 'var(--text-dim)', fontSize: 9 }}>· Identity Protected</span></div>}
        <div style={{ padding: '9px 13px', borderRadius: isWriter ? '10px 10px 3px 10px' : '10px 10px 10px 3px', background: isWriter ? 'var(--teal)' : 'var(--surface3)', color: isWriter ? '#fff' : 'var(--text)', fontSize: 13, lineHeight: 1.55, border: isWriter ? 'none' : '1px solid var(--border)' }}>
          {msg.text}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 3, textAlign: isWriter ? 'right' : 'left', fontFamily: 'var(--mono)' }}>{msg.time}</div>
      </div>
      {isWriter && <Avatar initials={writerAvatar} size={26} />}
    </div>);

}

/* ═══════════════════════════════════════════════
   ORDER DETAIL / CHAT PANEL
═══════════════════════════════════════════════ */
function OrderChatPanel({ order, onClose, onStatusChange, userId }) {
  const [input, setInput] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [tab, setTab] = useState('chat');
  const endRef = useRef();

  const { messages, loading, errorAlert, sendMessage } = useChat({
    projectId: order.id,
    userId,
    role: 'FREELANCER',
    chatType: 'CLIENT_CHAT',
  });

  useEffect(() => {
    if (endRef.current) endRef.current.parentElement.scrollTop = 99999;
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
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
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)' }}>{order.invoiceNum}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>·</span>
            <span style={{ fontSize: 10, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ fontSize: 11 }}>🛡</span>{order.client}</span>
            {order.hasNDA && <SecurityBadge label="NDA Active" icon="🔒" color="#8b5cf6" />}
          </div>
        </div>
        {/* Status changer */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {order.status === 'New Order' ? (
            <button onClick={() => onStatusChange(order.id, 'In Progress')} style={{ background: 'var(--teal)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>Accept Assignment</button>
          ) : (
            <>
              <button onClick={() => setShowStatusMenu((s) => !s)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 6, background: 'var(--surface2)', border: `1px solid ${STATUS_META[order.status]?.color}44`, color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 500, transition: 'all .2s' }}>
                Update Status <span style={{ fontSize: 10 }}>▾</span>
              </button>
              {showStatusMenu &&
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px', zIndex: 100, minWidth: 180, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', animation: 'popIn .2s ease' }}>
                  {ALL_STATUSES.filter((s) => s !== order.status && s !== 'New Order').map((s) => {
                  const sm = STATUS_META[s];
                  return (
                    <div key={s} onClick={() => {onStatusChange(order.id, s);setShowStatusMenu(false);}} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', transition: 'background .15s', fontSize: 12, fontWeight: 500, color: sm.color }}
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
            {/* Assignment Banner */}
            {order.status === 'New Order' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'rgba(13,148,136,0.06)', border: '1px solid var(--border-teal)', borderRadius: 8, marginBottom: 10, animation: 'slideDown .3s ease' }}>
                <span style={{ fontSize: 24 }}>📥</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal-light)', marginBottom: 4 }}>You have been assigned to this order</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Review the brief and files. Accept the assignment above to unlock chat and begin working.</div>
                </div>
              </div>
            )}
            {/* Security banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 7, marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>🔐</span>
              <span style={{ fontSize: 11, color: '#a78bfa', lineHeight: 1.4 }}>This conversation is end-to-end encrypted. Client identity is anonymized. All files are watermarked &amp; tracked.</span>
            </div>
            {errorAlert && (
              <div style={{ padding: '8px 12px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 7, color: '#fb7185', fontSize: 12 }}>⚠️ {errorAlert}</div>
            )}
            {loading && <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 12 }}>Loading messages...</div>}
            {!loading && messages.length === 0 && order.status !== 'New Order' && <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 12, marginTop: 20 }}>No messages yet. Say hello!</div>}
            {messages.map((msg) => {
              if (msg.isSystem) return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: 'center' }}>
                  <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 100, background: 'var(--surface2)', color: 'var(--text-dim)', border: '1px solid var(--border)' }}>🔒 {msg.content}</span>
                </div>
              );
              return <ChatMessage key={msg.id} msg={{ from: msg.senderId === userId ? 'writer' : 'client', text: msg.content, time: msg.createdAt instanceof Date ? msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '' }} writerAvatar={WRITER.avatar} />;
            })}
            <div ref={endRef} />
          </div>

          {/* Input area */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
            {order.status === 'New Order' ? (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 12, padding: '10px 0' }}>Chat is disabled until you accept the assignment.</div>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => {if (e.key === 'Enter' && !e.shiftKey) {e.preventDefault();handleSend();}}} placeholder={`Message ${order.client}...`} rows={1} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13, resize: 'none', fontFamily: 'var(--font)', lineHeight: 1.5, maxHeight: 80, overflowY: 'auto' }} />
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button title="Attach file" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, padding: 2, borderRadius: 4, transition: 'color .2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--teal-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                    📎</button>
                  </div>
                </div>
                <button onClick={handleSend} disabled={!input.trim()} style={{ width: 40, height: 40, borderRadius: 8, background: input.trim() ? 'var(--teal)' : 'var(--surface3)', border: `1px solid ${input.trim() ? 'var(--teal)' : 'var(--border)'}`, color: '#fff', fontSize: 18, cursor: input.trim() ? 'pointer' : 'default', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>↑</button>
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
            {[['Invoice', order.invoiceNum], ['Words', `${order.words.toLocaleString()} words`], ['Price', `$${order.price}`], ['Due', order.due], ['Delivery', order.deliveryType === 'urgent' ? '⚡ Urgent' : '📅 Timeline'], ['NDA', order.hasNDA ? 'Active' : 'Not required']].map(([k, v]) =>
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
          {[['Client Files', order.files], ['Delivered Files', order.deliveredFiles]].map(([label, files]) =>
        <div key={label} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal-light)', marginBottom: 10 }}>{label} ({files.length})</div>
              {files.length === 0 ? <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '12px 0' }}>No files yet</div> : files.map((f, i) =>
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, padding: '10px 12px', marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>📄</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{f.size}</span>
                      {f.watermarked && <SecurityBadge label="Watermarked" icon="🔒" color="#8b5cf6" />}
                      {f.secure && <SecurityBadge label="Secured" icon="🛡" color="#0d9488" />}
                    </div>
                  </div>
                  <button style={{ background: 'var(--surface3)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '5px 10px', borderRadius: 5, fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font)' }}>↓</button>
                </div>
          )}
            </div>
        )}
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
              const done = i < stepIdx; const active = i === stepIdx;
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

function OrdersView({ projects = [], userId }) {
  const [activeOrder, setActiveOrder] = useState(null);
  const [filter, setFilter] = useState('All');

  const MAPPED_ORDERS = projects.map(p => ({
    id: p.id,
    invoiceNum: `INV-${p.id.slice(-4).toUpperCase()}`,
    service: p.serviceType || p.title,
    client: p.student?.name || 'Client',
    clientCode: p.student?.id?.slice(-4) || 'XXXX',
    deliveryType: 'timeline',
    due: p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A',
    submitted: new Date(p.createdAt).toLocaleDateString(),
    words: 1000,
    price: (p.amount || 0) * 0.7, // Writer gets 70%
    status: p.status === 'COMPLETED' ? 'Delivered' : p.status === 'REVISION' ? 'Revision' : (p.status === 'ASSIGNED' || p.status === 'CREATED') ? 'New Order' : 'In Progress',
    progress: p.status === 'COMPLETED' ? 100 : 50,
    unreadMsgs: 0,
    hasNDA: true,
    brief: p.description || "No description provided.",
    files: [],
    deliveredFiles: [],
    thread: (p.logs || []).map(l => ({ type: 'system', text: l.action, time: new Date(l.timestamp).toLocaleString() }))
  }));

  const filterTabs = [
    { id: 'All', label: 'All', count: MAPPED_ORDERS.length },
    { id: 'Active', label: 'Active', count: MAPPED_ORDERS.filter((o) => ['New Order', 'In Progress', 'Under Review'].includes(o.status)).length },
    { id: 'Revision', label: 'Revision', count: MAPPED_ORDERS.filter((o) => o.status === 'Revision').length },
    { id: 'Delivered', label: 'Delivered', count: MAPPED_ORDERS.filter((o) => o.status === 'Delivered').length }
  ];


  const filtered = MAPPED_ORDERS.filter((o) => {
    if (filter === 'All') return true;
    if (filter === 'Active') return ['New Order', 'In Progress', 'Under Review'].includes(o.status);
    if (filter === 'Revision') return o.status === 'Revision';
    if (filter === 'Delivered') return o.status === 'Delivered';
    return true;
  });

  const handleStatusChange = async (id, newStatus) => {
    const dbStatus = newStatus === 'In Progress' ? 'IN_PROGRESS' : newStatus === 'Delivered' ? 'COMPLETED' : newStatus === 'Revision' ? 'REVISION' : newStatus === 'Quality Check' ? 'QUALITY_CHECK' : newStatus === 'Under Review' ? 'UNDER_REVIEW' : newStatus;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: dbStatus })
      });
      if (res.ok) {
        if (newStatus === 'In Progress') {
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
        window.location.reload();
      } else {
        console.error("Failed to update status");
      }
    } catch(err) {
      console.error(err);
    }
  };

  const selectedOrder = MAPPED_ORDERS.find((o) => o.id === activeOrder);

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
            <OrderStrip key={order.id} order={order} isActive={activeOrder === order.id} onClick={() => { setActiveOrder(order.id === activeOrder ? null : order.id); }} />
          )}
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)', fontSize: 13 }}>No orders in this category</div>}
        </div>
      </div>

      {/* Chat / Detail panel */}
      {selectedOrder ?
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <OrderChatPanel order={selectedOrder} onClose={() => setActiveOrder(null)} onStatusChange={handleStatusChange} userId={userId} />
        </div> :

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: 'var(--text-dim)' }}>
          <div style={{ fontSize: 48, opacity: .3 }}>💬</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Select an order to open the chat</div>
          <div style={{ fontSize: 12, opacity: .6 }}>All conversations are end-to-end encrypted</div>
        </div>
      }
    </div>);
}

function Overview({ setActive, projects = [], userName = "Writer" }) {
  const active = projects.filter((o) => o.status !== 'COMPLETED');
  const earnings = projects.filter(o => o.status === 'COMPLETED').reduce((acc, p) => acc + (p.amount || 0), 0) * 0.7;

  const stats = [
    { label: 'Active Orders', val: active.length, icon: '⚡', color: 'var(--teal)', sub: 'Requires attention' },
    { label: 'Unread Messages', val: 0, icon: '💬', color: 'var(--amber)', sub: 'From clients' },
    { label: 'Total Earnings', val: `$${earnings.toLocaleString()}`, icon: '💰', color: 'var(--green)', sub: 'All time' },
    { label: 'Avg Rating', val: '4.95', icon: '★', color: 'var(--gold)', sub: 'Top Writer' }];


  return (
    <div className="scrollable" style={{ padding: '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Welcome back, {userName.split(' ')[0]} 👋</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>You have {active.length} active orders.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
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
            return (
              <div key={order.id} onClick={() => setActive('orders')} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all .2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(13,148,136,0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}>

                <div style={{ width: 4, height: 40, borderRadius: 2, background: 'var(--teal)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.serviceType || order.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{order.student?.name} · {order.id}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <StatusPill status={order.status === 'CREATED' ? 'New Order' : 'In Progress'} small />
                </div>
              </div>);

          }) : (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim)', border: '1px dashed var(--border)', borderRadius: 8 }}>No active orders.</div>
          )}
        </div>
      </div>

      {/* Performance */}
      <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '18px 20px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Profile Performance</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[['Profile Views', '1,248', '↑ 12% this week'], ['Order Response Rate', '98%', 'Within 2 hours'], ['On-Time Delivery', '100%', 'All-time record']].map(([k, v, s]) =>
            <div key={k} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--teal-light)', marginBottom: 2 }}>{v}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{k}</div>
              <div style={{ fontSize: 10, color: 'var(--green)' }}>{s}</div>
            </div>
          )}
        </div>
      </div>
    </div>);
}

/* ═══════════════════════════════════════════════
   EARNINGS
═══════════════════════════════════════════════ */
function Earnings() {
  const maxAmt = Math.max(...EARNINGS_DATA.map((d) => d.amt));
  const payouts = [
  { date: 'Apr 1, 2026', amount: 1240, method: 'Bank Transfer', status: 'Paid' },
  { date: 'Mar 1, 2026', amount: 2480, method: 'Bank Transfer', status: 'Paid' },
  { date: 'Feb 1, 2026', amount: 1750, method: 'PayPal', status: 'Paid' },
  { date: 'Jan 1, 2026', amount: 2100, method: 'Bank Transfer', status: 'Paid' }];

  return (
    <div className="scrollable" style={{ padding: '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Earnings</h1>

      {/* Totals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {[
        { label: 'Total Earned', val: `$${WRITER.earnings.toLocaleString()}`, sub: 'All time', color: 'var(--teal-light)' },
        { label: 'This Month', val: '$1,980', sub: 'Apr 2026', color: 'var(--green)' },
        { label: 'Pending Payout', val: '$720', sub: 'Clears May 1', color: 'var(--amber)' }].
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
          {EARNINGS_DATA.map((d, i) =>
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal-light)' }}>${(d.amt / 1000).toFixed(1)}k</div>
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
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 0.8fr', padding: '12px 18px', borderBottom: i < payouts.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.date}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>${p.amount.toLocaleString()}</span>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{p.method}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'rgba(34,197,94,0.1)', color: 'var(--green)', width: 'fit-content' }}>{p.status}</span>
          </div>
        )}
      </div>
    </div>);

}

/* ═══════════════════════════════════════════════
   PROFILE
═══════════════════════════════════════════════ */
function Profile() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="scrollable" style={{ padding: '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>My Profile</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        <div>
          {/* Public profile preview */}
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border-teal)', borderRadius: 8, padding: '20px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal-light)', marginBottom: 14 }}>Public Profile Preview</div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
              <Avatar initials={WRITER.avatar} size={56} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{WRITER.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>{WRITER.title}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--gold)' }}>★ {WRITER.rating}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>({WRITER.reviews} reviews)</span>
                  <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 100, background: 'rgba(13,148,136,0.15)', color: 'var(--teal-light)', fontWeight: 600 }}>{WRITER.badge}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <SecurityBadge label="Identity Verified" icon="✓" color="#22c55e" />
              <SecurityBadge label="NDA Capable" icon="🔒" color="#8b5cf6" />
              <SecurityBadge label="Top 3%" icon="⭐" color="#f59e0b" />
            </div>
          </div>
          {/* Edit form */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            {[['Full Name', WRITER.name], ['Professional Title', WRITER.title], ['Email', 'amara.singh@xpresswriters.com'], ['Location', 'London, UK']].map(([k, v]) =>
            <div key={k}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>{k}</label>
                <input defaultValue={v} style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)' }} />
              </div>
            )}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Bio</label>
            <textarea defaultValue="PhD in English Literature with 8+ years of academic writing experience. I specialize in SOPs, research proposals, and dissertations, having helped 500+ students gain admission to top universities worldwide. Former university lecturer, published researcher." rows={4} style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)', resize: 'vertical', lineHeight: 1.6 }} />
          </div>
          <button onClick={() => {setSaved(true);setTimeout(() => setSaved(false), 2500);}} style={{ padding: '9px 22px', borderRadius: 6, background: saved ? 'var(--green)' : 'var(--teal)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'background .3s' }}>
            {saved ? '✓ Saved!' : 'Save Profile'}
          </button>
        </div>

        {/* Stats sidebar */}
        <div>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '18px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal-light)', marginBottom: 14 }}>Writer Stats</div>
            {[['Member since', WRITER.joined], ['Completed orders', WRITER.reviews], ['Total earned', `$${WRITER.earnings.toLocaleString()}`], ['Response time', '< 2 hours'], ['On-time rate', '100%']].map(([k, v]) =>
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{k}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{v}</span>
              </div>
            )}
          </div>
          <div style={{ background: 'rgba(13,148,136,0.06)', border: '1px solid var(--border-teal)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal-light)', marginBottom: 6 }}>🔒 Identity Protection</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>Your personal identity is never revealed to clients. You appear as "Expert Writer" until order completion. All communications are routed through Xpresswriters secure relay.</div>
          </div>
        </div>
      </div>
    </div>);

}

/* ═══════════════════════════════════════════════
   APP
═══════════════════════════════════════════════ */
export default function App() {
  const [active, setActive] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const savedTab = localStorage.getItem('xw_writer_tab');
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
    fetchProjects();
  }, []);

  useEffect(() => { localStorage.setItem('xw_writer_tab', active); }, [active]);

  const userName = session?.user?.name || "Writer";

  const views = {
    overview: <Overview setActive={setActive} projects={projects} userName={userName} />,
    orders: <OrdersView projects={projects} userId={session?.user?.id} />,
    earnings: <Earnings />,
    profile: <Profile />
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar active={active} setActive={setActive} orders={projects} userName={userName} />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        {/* Top bar */}
        <div style={{ height: 46, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 28px', flexShrink: 0, background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--teal-light)', background: 'rgba(13,148,136,0.08)', padding: '4px 10px', borderRadius: 100, border: '1px solid var(--border-teal)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Available for orders
            </div>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <span style={{ fontSize: 16 }}>🔔</span>
              <span style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', border: '2px solid var(--bg)' }} />
            </div>
            <Avatar initials={userName.split(' ').map(n => n[0]).join('').toUpperCase()} size={28} />
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {views[active] || views.overview}
        </div>
      </main>
    </div>);

}


