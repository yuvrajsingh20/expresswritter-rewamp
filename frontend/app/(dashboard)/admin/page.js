"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./theme.css";
import { AdminIntegrations } from "./admin-integrations";
import { AdminTickets } from "./admin-tickets";
import { AdminPayments } from "./admin-payments";
import { AdminWriters } from "./admin-writers";
import { AdminSettings } from "./admin-settings";
import { AdminCurrency } from "./admin-payments";
import { AdminUsers, AdminWorkflow, AdminTheme } from "./admin-settings";
import { AdminOrders } from "./admin-orders";
import { AdminAnalytics } from "./admin-analytics";
import { AdminRefunds } from "./admin-refunds";
import { AdminPromos } from "./admin-promos";
import Notifications from "@/components/NotificationsView";
import NotificationBell from "@/components/NotificationBell";
import { Toggle, SectionHeader, Card, CardHeader, Pill, StatusDot, Btn, Input, Select, Table, SubTabs, SaveBar } from "./admin-shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";



/* ── NAV ITEMS ── */
const NAV = [
  { id: 'overview', label: 'Overview', icon: '⊞', group: 'Main' },
  { id: 'orders', label: 'Order Requests', icon: '📥', group: 'Main' },
  { id: 'analytics', label: 'Analytics & ROI', icon: '📈', group: 'Main' },
  { id: 'integrations', label: 'API Integrations', icon: '🔌', group: 'Platform' },
  { id: 'tickets', label: 'Ticketing', icon: '🎫', group: 'Platform' },
  { id: 'payments', label: 'Payments', icon: '💰', group: 'Platform' },
  { id: 'refunds', label: 'Refund Claims', icon: '↩️', group: 'Platform' },
  { id: 'promos', label: 'Promo Engine', icon: '🏷️', group: 'Platform' },
  { id: 'currency', label: 'Currency Settings', icon: '💱', group: 'Platform' },
  { id: 'writers', label: 'Writer Management', icon: '✍️', group: 'People' },
  { id: 'users', label: 'User Management', icon: '👤', group: 'People' },
  { id: 'audit', label: 'Audit Logs', icon: '📜', group: 'System' },
  { id: 'seo', label: 'SEO & Marketing', icon: '🔍', group: 'System' },
  { id: 'workflow', label: 'Order Workflow', icon: '⟳', group: 'System' },
  { id: 'theme', label: 'Theme & Appearance', icon: '🎨', group: 'System' }];


/* ── OVERVIEW ── */
function AdminOverview({ setSection, projects = [], freelancers = [], isMobile, displayCurrency, setDisplayCurrency, config, dataLoading }) {
  const baseCurrency = config?.baseCurrency || 'USD';
  const baseCurrencyConfig = config?.currencies?.find(c => c.currency === baseCurrency) || { rate: 1, symbol: '$' };
  const currentDisplayConfig = config?.currencies?.find(c => c.currency === displayCurrency) || baseCurrencyConfig;

  const baseSymbol = currentDisplayConfig.symbol || '$';
  const multiplier = (currentDisplayConfig.rate || 1) / (baseCurrencyConfig.rate || 1);

  const [recentNotifications, setRecentNotifications] = React.useState([]);
  const [notificationsLoading, setNotificationsLoading] = React.useState(true);

  React.useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    setNotificationsLoading(true);
    
    fetch('/api/notifications', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRecentNotifications(data.slice(0, 6));
      })
      .catch(err => {
        if (err.name !== 'AbortError') console.error("Failed to fetch notifications:", err);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setNotificationsLoading(false);
      });
      
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  const stats = React.useMemo(() => [
    { label: 'Total Orders', val: projects.length, sub: 'All time', color: 'var(--teal-light)', icon: '📋' },
    { label: 'Active Projects', val: projects.filter(p => p.status !== 'COMPLETED' && p.status !== 'CANCELLED').length, sub: 'Requiring attention', color: 'var(--green)', icon: '⚡' },
    { label: 'Monthly Revenue', val: `${baseSymbol}${(projects.reduce((acc, p) => acc + (p.basePrice || 0), 0) * multiplier).toLocaleString()}`, sub: 'Total volume', color: 'var(--gold)', icon: '💰' },
    { label: 'Total Writers', val: freelancers.length, sub: 'Approved partners', color: 'var(--amber)', icon: '✍️' },
    { label: 'Recent Logs', val: projects.reduce((acc, p) => acc + (p._count?.logs || 0), 0), sub: 'Actions tracked', color: 'var(--red)', icon: '📜' },
    { label: 'Avg Project Val', val: `${baseSymbol}${projects.length ? ((projects.reduce((acc, p) => acc + (p.basePrice || 0), 0) / projects.length) * multiplier).toFixed(0) : 0}`, sub: 'Platform-wide', color: '#f472b6', icon: '★' }
  ], [projects, freelancers, baseSymbol, multiplier]);

  const loadingSkeletons = (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
      {[1,2,3,4,5,6].map(i => (
        <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '18px 18px', animation: 'pulse 2s infinite' }}>
          <div style={{ height: 10, width: '60%', background: 'var(--surface3)', borderRadius: 4, marginBottom: 10 }} />
          <div style={{ height: 30, width: '80%', background: 'var(--surface3)', borderRadius: 4, marginBottom: 3 }} />
          <div style={{ height: 11, width: '40%', background: 'var(--surface3)', borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );

  const quickLinks = [
    { id: 'integrations', label: 'API Integrations', icon: '🔌', desc: 'Manage external services' },
    { id: 'tickets', label: 'Ticketing System', icon: '🎫', desc: 'Customer support' },
    { id: 'payments', label: 'Payments', icon: '💳', desc: 'Revenue & Payouts' },
    { id: 'writers', label: 'Writer Management', icon: '✍️', desc: 'Manage your talent' },
    { id: 'workflow', label: 'Order Workflow', icon: '⟳', desc: 'System processes' },
    { id: 'theme', label: 'Theme Settings', icon: '🎨', desc: 'UI Customization' },
    { id: 'users', label: 'User Management', icon: '👤', desc: 'Admin & Customer accounts' },
    { id: 'currency', label: 'Currency', icon: '💱', desc: 'Regional settings' }
  ];

  // Logs replaced with notifications

  if (dataLoading) {
    return (
      <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ height: 22, width: 200, background: 'var(--surface3)', borderRadius: 4, marginBottom: 4 }} />
          <div style={{ height: 13, width: 300, background: 'var(--surface3)', borderRadius: 4 }} />
        </div>
        {loadingSkeletons}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
          <div>
            <div style={{ height: 15, width: 150, background: 'var(--surface3)', borderRadius: 4, marginBottom: 14 }} />
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
              {[1,2,3,4].map(i => <div key={i} style={{ height: 80, background: 'var(--surface2)', borderRadius: 8 }} />)}
            </div>
          </div>
          <div>
            <div style={{ height: 15, width: 150, background: 'var(--surface3)', borderRadius: 4, marginBottom: 14 }} />
            <div style={{ height: 200, background: 'var(--surface2)', borderRadius: 8 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Admin Overview</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Platform health at a glance. All systems operational.</p>
        </div>
        <div style={{ minWidth: 150 }}>
          <Select
            value={displayCurrency}
            onChange={setDisplayCurrency}
            options={(config?.currencies || []).map(c => ({ label: `View in ${c.currency}`, value: c.currency }))}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, marginBottom: 24 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>Database Connection: Active</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>PostgreSQL Connected ✓  Prisma Client Ready ✓</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>Real-time synchronization enabled</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {stats.map((s, i) =>
          <div key={i} style={{ background: `linear-gradient(135deg, var(--surface2) 60%, ${s.color}0d 100%)`, border: `1px solid ${s.color}22`, borderRadius: 8, padding: '18px 18px', animation: `fadeUp .3s ease ${i * .06}s both`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -18, right: -18, width: 72, height: 72, borderRadius: '50%', background: `radial-gradient(circle, ${s.color}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{s.label}</span>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: s.color, marginBottom: 3, letterSpacing: '-0.02em' }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{s.sub}</div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Quick Access</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
            {quickLinks.map((ql) =>
              <div key={ql.id} onClick={() => setSection(ql.id)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', cursor: 'pointer', transition: 'all .2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(13,148,136,0.4)'; e.currentTarget.style.background = 'var(--surface3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface2)'; }}>
                <div style={{ fontSize: 18, marginBottom: 6 }}>{ql.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{ql.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{ql.desc}</div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>System Activity</h2>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            {recentNotifications.length > 0 ? recentNotifications.map((item, i) =>
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < recentNotifications.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', background: item.read ? 'transparent' : 'rgba(13,148,136,0.04)' }} onClick={() => setSection('notifications')}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: `rgba(13,148,136,0.14)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{item.icon || '🔔'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: item.read ? 400 : 600 }}>{item.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.msg}</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>No recent activity logs.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SIDEBAR ── */
function AdminSidebar({ active, setActive, dark }) {
  const groups = [...new Set(NAV.map((n) => n.group))];

  return (
    <div style={{ width: 224, flexShrink: 0, background: dark ? 'linear-gradient(180deg,#0d0d1c 0%,#0a1520 60%,#0d0d1c 100%)' : 'linear-gradient(180deg,#ffffff 0%,#f4f8ff 100%)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Logo */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 10 }}>
          <div style={{ width: 30, height: 30, background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', borderRadius: "7px 0px 0px 7px" }}>X</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', letterSpacing: '-0.01em' }}>Xpresswriters</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin Panel</div>
          </div>
        </Link>
        {/* Admin badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 6 }}>
          <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg,#ef4444,#b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', padding: "0px 0px 0.896362px", borderRadius: "6px 1.91333px 11.8633px 6px" }}>SA</div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: "14px" }}>Super Admin</div>
            <div style={{ color: "rgb(255, 255, 255)", fontSize: "11px" }}>Full access</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {groups.map((group) =>
          <div key={group} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', padding: '0 8px', marginBottom: 4 }}>{group}</div>
            {NAV.filter((n) => n.group === group).map((item) =>
              <button key={item.id} onClick={() => setActive(item.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 7,
                border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13,
                fontWeight: active === item.id ? 600 : 400, marginBottom: 1, transition: 'all .2s', position: 'relative',
                background: active === item.id ? 'linear-gradient(90deg,rgba(13,148,136,0.18) 0%,rgba(13,148,136,0.05) 100%)' : 'transparent',
                color: active === item.id ? 'var(--teal-light)' : 'var(--text-muted)'
              }}>
                {active === item.id && <div style={{ position: 'absolute', left: 0, top: '18%', bottom: '18%', width: 3, borderRadius: 2, background: 'var(--teal)' }} />}
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Bottom links */}
      <div style={{ padding: '10px 10px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ fontSize: 11, color: 'var(--text-dim)', textDecoration: 'none', padding: '5px 8px', borderRadius: 5, transition: 'color .2s', display: 'block', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}>
          🚪 Logout
        </button>
      </div>
    </div>);

}

/* ── TOPBAR ── */
function AdminTopbar({ section, dark, setDark, isMobile, setSidebarOpen, setSection }) {
  const item = NAV.find((n) => n.id === section) || { label: 'Overview', icon: '⊞' };
  const [togHov, setTogHov] = useState(false);
  return (
    <div style={{ height: 52, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: isMobile ? '0 16px' : '0 28px', gap: 14, flexShrink: 0, background: dark ? 'linear-gradient(90deg,#0d0d1c 0%,#0f1a20 50%,#0d0d1c 100%)' : 'linear-gradient(90deg,#ffffff 0%,#f4f8ff 50%,#ffffff 100%)' }}>
      {isMobile && (
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 24, cursor: 'pointer' }}>
          ☰
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <span style={{ fontSize: 16 }}>{item.icon}</span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</span>
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>/ Admin</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px' }}>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>⌘</span>
          <input placeholder="Search admin..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 12, width: 130 }} />
        </div>
        {/* Theme toggle */}
        <button
          onMouseEnter={() => setTogHov(true)}
          onMouseLeave={() => setTogHov(false)}
          onClick={() => setDark(d => !d)}
          title={dark ? 'Switch to Light' : 'Switch to Dark'}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100,
            border: `1px solid ${togHov ? 'var(--teal)' : 'var(--border)'}`,
            background: dark
              ? (togHov ? 'rgba(13,148,136,0.12)' : 'rgba(255,255,255,0.04)')
              : (togHov ? 'rgba(13,148,136,0.08)' : 'rgba(0,0,0,0.04)'),
            cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .25s',
          }}>
          {/* Track */}
          <div style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', background: dark ? 'var(--teal)' : '#d1d5db', transition: 'background .3s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 3, left: dark ? 19 : 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left .3s', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>{dark ? '🌙 Dark' : '☀️ Light'}</span>
        </button>

        {/* Notification bell */}
        <NotificationBell />
        {/* Admin avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#ef4444,#b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 10, color: '#fff' }}>SA</div>
          <span style={{ fontSize: 12, fontWeight: 500 }}>Admin</span>
        </div>
      </div>
    </div>);

}

/* ── APP ── */
export default function App() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [section, setSection] = useState('overview');
  const [dark, setDark] = useState(true);
  const [projects, setProjects] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [config, setConfig] = useState(null);
  const [displayCurrency, setDisplayCurrency] = useState('USD');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/login");
    }
  }, [status, session, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'notifications') {
      setSection('notifications');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('orderId')) {
      setSection('projects');
      // Clean up orderId from URL after reading
      window.history.replaceState({}, '', `${window.location.pathname}?tab=projects`);
    } else {
      const savedSection = localStorage.getItem('xw_admin_section');
      if (savedSection) setSection(savedSection);
    }
    const savedDark = localStorage.getItem('xw_admin_dark');
    if (savedDark !== null) setDark(savedDark !== 'false');

    const fetchData = async () => {
      setDataLoading(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const [projRes, freeRes, confRes] = await Promise.all([
          fetch('/api/projects', { signal: controller.signal }),
          fetch('/api/admin/freelancers', { signal: controller.signal }),
          fetch('/api/admin/config/currency', { signal: controller.signal })
        ]);
        
        clearTimeout(timeoutId);
        
        const [projData, freeData] = await Promise.all([projRes.json(), freeRes.json()]);
        setProjects(Array.isArray(projData) ? projData : []);
        setFreelancers(Array.isArray(freeData) ? freeData : []);
        if (confRes.ok) {
          const confData = await confRes.json();
          setConfig(confData);
          setDisplayCurrency(confData?.baseCurrency || 'USD');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Data fetch error:", err);
        }
      } finally {
        setLoading(false);
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => { localStorage.setItem('xw_admin_section', section); }, [section]);

  useEffect(() => {
    localStorage.setItem('xw_admin_dark', dark);
    const r = document.documentElement.style;
    if (dark) {
      r.setProperty('--bg', '#09090f'); r.setProperty('--surface', '#0d0d1c');
      r.setProperty('--surface2', '#121224'); r.setProperty('--surface3', '#181830');
      r.setProperty('--surface4', '#1e1e3a'); r.setProperty('--border', 'rgba(255,255,255,0.07)');
      r.setProperty('--text', '#eefcfb'); r.setProperty('--text-muted', '#6b9e9a');
      r.setProperty('--text-dim', '#2e4d4a');
    } else {
      r.setProperty('--bg', '#f4f6f9'); r.setProperty('--surface', '#ffffff');
      r.setProperty('--surface2', '#f0f2f7'); r.setProperty('--surface3', '#e6eaf2');
      r.setProperty('--surface4', '#dde1ee'); r.setProperty('--border', 'rgba(0,0,0,0.08)');
      r.setProperty('--text', '#0f1923'); r.setProperty('--text-muted', '#4a6670');
      r.setProperty('--text-dim', '#94a8b3');
    }
  }, [dark]);

  const views = useMemo(() => ({
    overview: <AdminOverview setSection={setSection} projects={projects} freelancers={freelancers} isMobile={isMobile} displayCurrency={displayCurrency} setDisplayCurrency={setDisplayCurrency} config={config} dataLoading={dataLoading} />,
    orders: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}><AdminOrders projects={projects} freelancers={freelancers} setProjects={setProjects} isMobile={isMobile} /></div>,
    integrations: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}><AdminIntegrations /></div>,
    tickets: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}><AdminTickets /></div>,
    payments: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}><AdminPayments projects={projects} displayCurrency={displayCurrency} setDisplayCurrency={setDisplayCurrency} config={config} /></div>,
    refunds: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}><AdminRefunds /></div>,
    promos: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}><AdminPromos /></div>,
    analytics: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}><AdminAnalytics projects={projects} freelancersCount={freelancers.length} /></div>,
    currency: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}><AdminCurrency /></div>,
    writers: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}><AdminWriters freelancers={freelancers} isMobile={isMobile} /></div>,
    users: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}><AdminUsers /></div>,
    audit: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}><AdminAudit /></div>,
    seo: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}><AdminSEO /></div>,
    workflow: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}><AdminWorkflow /></div>,
    theme: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}><AdminTheme /></div>,
    notifications: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}><Notifications userName="Admin" isMobile={isMobile} /></div>
  }), [section, projects, freelancers, isMobile, displayCurrency, setDisplayCurrency, config, dataLoading]);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
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
        <AdminSidebar active={section} setActive={(id) => { setSection(id); if (isMobile) setSidebarOpen(false); }} dark={dark} />
      </div>

      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
        />
      )}

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: dark ? 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(13,148,136,0.07) 0%, transparent 70%), var(--bg)' : 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(13,148,136,0.05) 0%, transparent 70%), var(--bg)' }}>
        <AdminTopbar section={section} dark={dark} setDark={setDark} isMobile={isMobile} setSidebarOpen={setSidebarOpen} setSection={setSection} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {views[section] || views.overview}
        </div>
      </main>
    </div>);

}

/* ── ADMIN AUDIT ── */
function AdminAudit() {
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/admin/audit')
      .then(res => res.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <SectionHeader title="System Audit Logs" subtitle="Security trail of all administrative actions." />
      <Card>
        <Table
          cols={['Administrator', 'Action Performed', 'IP Address', 'Timestamp']}
          rows={logs.map(l => [
            <span style={{ fontWeight: 600 }}>{l.userName || 'System'}</span>,
            l.action,
            <code style={{ fontSize: 11, color: 'var(--text-dim)' }}>{l.ipAddress || '---'}</code>,
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(l.createdAt).toLocaleString()}</span>
          ])}
        />
        {loading && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim)' }}>Loading audit trail...</div>}
        {!loading && logs.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>No logs found.</div>}
      </Card>
    </div>
  );
}

/* ── ADMIN SEO ── */
function AdminSEO() {
  const [config, setConfig] = React.useState({ title: '', desc: '', keywords: '' });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/admin/seo')
      .then(res => res.json())
      .then(data => {
        setConfig(data || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = () => {
    setSaving(true);
    fetch('/api/admin/seo', {
      method: 'POST',
      body: JSON.stringify(config),
      headers: { 'Content-Type': 'application/json' }
    }).finally(() => {
      setSaving(false);
    });
  };

  if (loading) return <div style={{ padding: 40, color: 'var(--text-dim)' }}>Loading settings...</div>;

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <SectionHeader title="SEO & Marketing Settings" subtitle="Manage meta tags, indexing, and analytics scripts." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card>
          <CardHeader title="Global Meta Tags" />
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Default Page Title" value={config.title} onChange={v => setConfig({ ...config, title: v })} />
            <Input label="Meta Description" value={config.desc} onChange={v => setConfig({ ...config, desc: v })} />
            <Input label="Keywords" value={config.keywords} onChange={v => setConfig({ ...config, keywords: v })} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Indexing & Robots" />
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Toggle label="Enable Search Engine Indexing (Robots.txt)" value={config.indexing} onChange={v => setConfig({ ...config, indexing: v })} />
            <Toggle label="Generate Sitemap daily" value={config.sitemap} onChange={v => setConfig({ ...config, sitemap: v })} />
            <Btn variant="outline" small>Force Sitemap Regeneration</Btn>
          </div>
        </Card>
      </div>
      <SaveBar show={true} onSave={save} saved={saving} />
    </div>
  );
}
