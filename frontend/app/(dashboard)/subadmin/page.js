"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import ProjectTable from '@/components/dashboard/ProjectTable';
import '../admin/theme.css';
import { AdminToastProvider } from '../admin/admin-shared';

// Import Admin components
import { AdminOrders } from '../admin/admin-orders';
import { AdminWriters } from '../admin/admin-writers';
import { AdminPayments } from '../admin/admin-payments';
import { AdminPaymentLinks } from '../admin/admin-payment-links';
import { AdminPromos } from '../admin/admin-promos';
import { AdminTickets } from '../admin/admin-tickets';

const routePermissionMap = {
  'writers': 'freelancer:verify',
  'orders': 'order:read_assigned',
  'revenue': 'payment:view_metrics',
  'payment-links': 'payment:issue_links',
  'promos': 'promo:manage',
  'tickets': 'ticket:resolve',
};

const NAV = [
  { id: 'overview', label: 'Overview', icon: '⊞' },
  { id: 'writers', label: 'Expert Workforce', icon: '✍️' },
  { id: 'orders', label: 'Order Logs', icon: '📥' },
  { id: 'revenue', label: 'Revenue Reports', icon: '💰' },
  { id: 'payment-links', label: 'Payment Links', icon: '🔗' },
  { id: 'promos', label: 'Promo Engine', icon: '🏷️' },
  { id: 'tickets', label: 'Ticketing System', icon: '🎫' },
];

function SubAdminSidebar({ active, setActive }) {
  return (
    <div style={{
      width: 224, flexShrink: 0,
      background: 'linear-gradient(180deg,#0d0d1c 0%,#0a1520 60%,#0d0d1c 100%)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', height: '100%'
    }}>
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 10 }}>
          <div style={{ width: 30, height: 30, background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', borderRadius: '7px 0px 0px 7px' }}>X</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', letterSpacing: '-0.01em' }}>Xpresswriters</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Manager Portal</div>
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.15)', borderRadius: 6 }}>
          <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg,#0d9488,#115e59)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', borderRadius: '6px 1.91333px 11.8633px 6px' }}>M</div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>Operations</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 11 }}>Manager Access</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', padding: '0 8px', marginBottom: 6 }}>Main</div>
        {NAV.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 7,
                border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, textDecoration: 'none',
                fontWeight: isActive ? 600 : 400, marginBottom: 1, transition: 'all .2s', position: 'relative',
                background: isActive ? 'linear-gradient(90deg,rgba(13,148,136,0.18) 0%,rgba(13,148,136,0.05) 100%)' : 'transparent',
                color: isActive ? 'var(--teal-light)' : 'var(--text-muted)',
                textAlign: 'left'
              }}
            >
              {isActive && <div style={{ position: 'absolute', left: 0, top: '18%', bottom: '18%', width: 3, borderRadius: 2, background: 'var(--teal)' }} />}
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '10px 10px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
          style={{
            fontSize: 11, color: 'var(--text-dim)', textDecoration: 'none', padding: '5px 8px', borderRadius: 5,
            transition: 'color .2s', display: 'block', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%'
          }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

function SubAdminTopbar({ section, setActive, isMobile, setSidebarOpen, setActiveOrderId }) {
  const currentIcon = NAV.find(n => n.id === section);
  const icon = currentIcon?.icon || '⊞';
  const title = currentIcon?.label || 'Team Overview';

  return (
    <div style={{
      height: 52, borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: isMobile ? '0 16px' : '0 28px', gap: 14, flexShrink: 0,
      background: 'linear-gradient(90deg,#0d0d1c 0%,#0f1a20 50%,#0d0d1c 100%)'
    }}>
      {isMobile && (
        <button onClick={() => setSidebarOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 24, cursor: 'pointer' }}>
          ☰
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{title}</span>
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>/ Manager</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <NotificationBell
          onNavigate={(link) => {
            if (!link) return;
            const isLegacyOrder = link.includes('/orders/');
            const url = new URL(link, window.location.origin);
            const params = url.searchParams;
            let tab = params.get('tab');
            let orderId = params.get('orderId');
            if (isLegacyOrder) {
              orderId = link.split('/orders/')[1]?.split('?')[0];
              tab = 'orders';
            }
            if (tab === 'orders' || orderId) {
              if (orderId) setActiveOrderId(orderId);
              setActive('orders');
              window.history.pushState({}, '', `?tab=orders${orderId ? `&orderId=${orderId}` : ''}`);
            } else if (tab) {
              setActive(tab);
              window.history.pushState({}, '', `?tab=${tab}`);
            }
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'linear-gradient(135deg,#0d9488,#115e59)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 10, color: '#fff'
          }}>M</div>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>Manager</span>
        </div>
      </div>
    </div>
  );
}

function SubAdminOverview({ projects, loading }) {
  const stats = useMemo(() => [
    { label: 'Pending Assignment', value: projects.filter(p => p.status === 'CREATED').length, color: 'var(--amber)', icon: '📋' },
    { label: 'Active Drafts', value: projects.filter(p => p.status === 'ASSIGNED').length, color: 'var(--blue)', icon: '⚡' },
    { label: 'Urgent Replies', value: projects.length > 0 ? 0 : 0, color: 'var(--red)', icon: '💬' }, // Placeholder for now or actual calculation if available
  ], [projects]);

  if (loading) {
    return (
      <div style={{ padding: '28px 32px', overflowY: 'auto', height: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '18px', animation: 'pulse 2s infinite' }}>
              <div style={{ height: 10, width: '60%', background: 'var(--surface3)', borderRadius: 4, marginBottom: 10 }} />
              <div style={{ height: 30, width: '80%', background: 'var(--surface3)', borderRadius: 4, marginBottom: 3 }} />
            </div>
          ))}
        </div>
        <div style={{ height: 200, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8 }} />
      </div>
    );
  }

  const totalProjects = projects.length;
  const assignedProjects = projects.filter(p => p.status !== 'CREATED' && p.status !== 'CANCELLED').length;
  const assignmentRate = totalProjects ? Math.round((assignedProjects / totalProjects) * 100) : 0;

  const qaTotal = projects.filter(p => ['REVIEW', 'QUALITY_CHECK', 'COMPLETED'].includes(p.status)).length;
  const qaCompleted = projects.filter(p => p.status === 'COMPLETED').length;
  const qaRate = qaTotal ? Math.round((qaCompleted / qaTotal) * 100) : 0;

  return (
    <div style={{ padding: '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Team Overview</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Monitoring active drafting cycles and resource allocation.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: `linear-gradient(135deg, var(--surface2) 60%, ${s.color}0d 100%)`,
            border: `1px solid ${s.color}22`, borderRadius: 8, padding: '18px',
            animation: `fadeUp .3s ease ${i * .06}s both`, position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: -18, right: -18, width: 72, height: 72, borderRadius: '50%', background: `radial-gradient(circle, ${s.color}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{s.label}</span>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: s.color, marginBottom: 3, letterSpacing: '-0.02em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>Managed Project Log</h2>
          <ProjectTable projects={projects} loading={loading} role="SUB_ADMIN" />
        </div>

        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>Manager Toolkit</h2>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>System Health</p>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                  <span>Assignment Rate</span>
                  <span>{assignmentRate}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${assignmentRate}%`, background: 'var(--blue)', borderRadius: 2, transition: 'width 1s ease-in-out' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                  <span>QA Completion</span>
                  <span>{qaRate}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${qaRate}%`, background: 'var(--green)', borderRadius: 2, transition: 'width 1s ease-in-out' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                padding: '9px 14px', background: 'var(--teal)', color: '#fff', borderRadius: 6,
                textAlign: 'center', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                transition: 'opacity .2s'
              }}>
                Broadcast New Slot
              </div>
              <div style={{
                padding: '9px 14px', background: 'transparent', color: 'var(--text-muted)',
                border: '1px solid var(--border)', borderRadius: 6, textAlign: 'center',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all .2s'
              }}>
                Generate Team Audit
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 14, background: 'linear-gradient(135deg, var(--teal) 0%, #115e59 100%)',
            borderRadius: 8, padding: 16, position: 'relative', overflow: 'hidden', cursor: 'pointer'
          }} onClick={() => document.querySelector('[title="Ticketing System"]')?.click()}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Live Chat Hub</h4>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 12 }}>Check your active support tickets and chats.</p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.12)',
                padding: '7px 14px', borderRadius: 6
              }}>
                Open Communication Pane ↗
              </div>
            </div>
            <span style={{ position: 'absolute', bottom: -20, right: -20, fontSize: 100, opacity: 0.08, transform: 'rotate(12deg)' }}>💬</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function UnauthorizedView() {
  return (
    <div className="flex-1 flex items-center justify-center p-10 h-full">
      <div className="text-center max-w-md mx-auto mt-20">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3" style={{ color: 'var(--text)' }}>Access Restricted</h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          You do not have the required permissions to access this module.
          Please contact your administrator if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
}

export default function SubAdminApp() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [section, setSectionState] = useState('overview');
  
  // Data states
  const [projects, setProjects] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [config, setConfig] = useState(null);
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [activeOrderId, setActiveOrderId] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "SUB_ADMIN" && session?.user?.role !== "ADMIN") {
      router.push("/login");
    }
  }, [status, session, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab')) {
      setSectionState(params.get('tab'));
    }
    if (params.get('orderId')) {
      setActiveOrderId(params.get('orderId'));
      setSectionState('orders');
    }

    const fetchData = async () => {
      try {
        const [projRes, freeRes, confRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/admin/freelancers'),
          fetch('/api/admin/config/currency')
        ]);
        
        if (projRes.ok) {
          const projData = await projRes.json();
          setProjects(Array.isArray(projData) ? projData : []);
        }
        if (freeRes.ok) {
          const freeData = await freeRes.json();
          setFreelancers(Array.isArray(freeData) ? freeData : []);
        }
        if (confRes.ok) {
          const confData = await confRes.json();
          setConfig(confData);
          setDisplayCurrency(confData?.baseCurrency || 'USD');
        }
      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle popstate for back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const orderIdParam = params.get('orderId');
      
      if (tabParam) {
        setSectionState(tabParam);
      } else {
        setSectionState('overview');
      }
      
      if (orderIdParam) {
        setActiveOrderId(orderIdParam);
        setSectionState('orders');
      } else {
        setActiveOrderId(null);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setSection = (newSection) => {
    setSectionState(newSection);
    if (isMobile) setSidebarOpen(false);
    window.history.pushState({}, '', newSection === 'overview' ? '/subadmin' : `?tab=${newSection}`);
  };

  // Check permissions
  const requiredPermission = routePermissionMap[section];
  const isAuthorized = !requiredPermission || session?.user?.permissions?.includes(requiredPermission) || session?.user?.role === "ADMIN";

  const views = useMemo(() => ({
    overview: <SubAdminOverview projects={projects} loading={loading} />,
    orders: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Order Logs</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Track and manage project orders</p>
              </div>
              <AdminOrders projects={projects} freelancers={freelancers} setProjects={setProjects} isMobile={isMobile} activeOrderId={activeOrderId} onOrderViewed={() => setActiveOrderId(null)} />
            </div>,
    writers: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Expert Workforce</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage and verify writer profiles</p>
              </div>
              <AdminWriters freelancers={freelancers} isMobile={isMobile} />
             </div>,
    revenue: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Revenue Reports</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>View transaction history and revenue analytics</p>
              </div>
              <AdminPayments projects={projects} config={config} displayCurrency={displayCurrency} setDisplayCurrency={setDisplayCurrency} />
             </div>,
    'payment-links': <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
                        <div style={{ marginBottom: 24 }}>
                          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Payment Links</h1>
                          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Generate and manage payment links</p>
                        </div>
                        <AdminPaymentLinks />
                     </div>,
    promos: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Promo Engine</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Create and manage promo codes</p>
              </div>
              <AdminPromos />
            </div>,
    tickets: <div className="scrollable" style={{ padding: isMobile ? '16px' : '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Ticketing System</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage customer and writer support tickets</p>
              </div>
              <AdminTickets />
             </div>,
  }), [projects, freelancers, isMobile, config, displayCurrency, activeOrderId, loading]);

  // Set the CSS variables for the dark theme just in case they aren't loaded globally
  // We force dark mode for subadmin here since it seems to use the dark mode colors directly 
  // (or inherit them if we set them)
  useEffect(() => {
    const r = document.documentElement.style;
    // Dark mode vars
    r.setProperty('--bg', '#09090f'); r.setProperty('--surface', '#0d0d1c');
    r.setProperty('--surface2', '#121224'); r.setProperty('--surface3', '#181830');
    r.setProperty('--surface4', '#1e1e3a'); r.setProperty('--border', 'rgba(255,255,255,0.07)');
    r.setProperty('--text', '#eefcfb'); r.setProperty('--text-muted', '#6b9e9a');
    r.setProperty('--text-dim', '#2e4d4a');
  }, []);

  if (status === "loading") {
    return (
      <div style={{
        display: 'flex', width: '100vw', height: '100vh', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', color: 'var(--text)'
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid var(--surface3)',
          borderTopColor: 'var(--teal)',
          animation: 'spin .8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AdminToastProvider>
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
          <SubAdminSidebar active={section} setActive={setSection} />
        </div>

        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
          />
        )}

        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(13,148,136,0.07) 0%, transparent 70%), var(--bg)' }}>
          <SubAdminTopbar section={section} setActive={setSection} isMobile={isMobile} setSidebarOpen={setSidebarOpen} setActiveOrderId={setActiveOrderId} />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {!isAuthorized ? <UnauthorizedView /> : (views[section] || views.overview)}
          </div>
        </main>
      </div>
    </AdminToastProvider>
  );
}
