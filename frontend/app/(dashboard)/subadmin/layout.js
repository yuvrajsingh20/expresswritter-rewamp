"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import NotificationBell from '@/components/NotificationBell';
import '../admin/theme.css';
import { AdminToastProvider } from '../admin/admin-shared';

const routePermissionMap = {
  '/subadmin/writers': 'freelancer:verify',
  '/subadmin/orders': 'order:read_assigned',
  '/subadmin/revenue': 'payment:view_metrics',
  '/subadmin/payment-links': 'payment:issue_links',
  '/subadmin/promos': 'promo:manage',
  '/subadmin/tickets': 'ticket:resolve',
};

const NAV = [
  { id: 'overview', label: 'Overview', icon: '⊞', path: '/subadmin' },
  { id: 'writers', label: 'Expert Workforce', icon: '✍️', path: '/subadmin/writers' },
  { id: 'orders', label: 'Order Logs', icon: '📥', path: '/subadmin/orders' },
  { id: 'revenue', label: 'Revenue Reports', icon: '💰', path: '/subadmin/revenue' },
  { id: 'payment-links', label: 'Payment Links', icon: '🔗', path: '/subadmin/payment-links' },
  { id: 'promos', label: 'Promo Engine', icon: '🏷️', path: '/subadmin/promos' },
  { id: 'tickets', label: 'Ticketing System', icon: '🎫', path: '/subadmin/tickets' },
];

function SubAdminSidebar({ active, setActive, pathname }) {
  return (
    <div style={{
      width: 224, flexShrink: 0,
      background: 'linear-gradient(180deg,#0d0d1c 0%,#0a1520 60%,#0d0d1c 100%)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', height: '100vh'
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
          const isActive = active === item.id || (item.path !== '/subadmin' && pathname.startsWith(item.path));
          return (
            <Link
              key={item.id}
              href={item.path}
              onClick={() => setActive(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 7,
                border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, textDecoration: 'none',
                fontWeight: isActive ? 600 : 400, marginBottom: 1, transition: 'all .2s', position: 'relative',
                background: isActive ? 'linear-gradient(90deg,rgba(13,148,136,0.18) 0%,rgba(13,148,136,0.05) 100%)' : 'transparent',
                color: isActive ? 'var(--teal-light)' : 'var(--text-muted)'
              }}
            >
              {isActive && <div style={{ position: 'absolute', left: 0, top: '18%', bottom: '18%', width: 3, borderRadius: 2, background: 'var(--teal)' }} />}
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
            </Link>
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

function SubAdminTopbar({ pathname, setActive, isMobile, setSidebarOpen }) {
  const getHeaderTitle = () => {
    if (pathname.includes('/writers')) return 'Expert Workforce';
    if (pathname.includes('/orders')) return 'Order Logs';
    if (pathname.includes('/revenue')) return 'Revenue Reports';
    if (pathname.includes('/payment-links')) return 'Payment Links';
    if (pathname.includes('/promos')) return 'Promo Engine';
    if (pathname.includes('/tickets')) return 'Ticketing System';
    return 'Team Overview';
  };

  const currentIcon = NAV.find(n => n.path !== '/subadmin' && pathname.startsWith(n.path));
  const icon = currentIcon?.icon || '⊞';

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
        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{getHeaderTitle()}</span>
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
              setActive('orders');
              const target = `/subadmin/orders${orderId ? `?orderId=${orderId}` : ''}`;
              window.location.href = target;
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

export default function SubAdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const match = NAV.find(n => n.path !== '/subadmin' && pathname.startsWith(n.path));
    setActiveSection(match?.id || 'overview');
  }, [pathname]);

  const requiredPermission = useMemo(() => {
    const match = Object.entries(routePermissionMap).find(([route]) => pathname.startsWith(route));
    return match ? match[1] : null;
  }, [pathname]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      if (session?.user?.role !== "SUB_ADMIN" && session?.user?.role !== "ADMIN") {
        router.push("/login");
        return;
      }
      if (requiredPermission && !session?.user?.permissions?.includes(requiredPermission)) {
        router.push("/subadmin/unauthorized");
      }
    }
  }, [status, session, router, requiredPermission]);

  const isAuthorized = status === "authenticated" &&
    (session?.user?.role === "SUB_ADMIN" || session?.user?.role === "ADMIN") &&
    (!requiredPermission || session?.user?.permissions?.includes(requiredPermission));

  const showUnauthorized = status === "authenticated" && !isAuthorized && pathname !== '/subadmin/unauthorized';

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

  const sidebarComponent = (
    <SubAdminSidebar active={activeSection} setActive={setActiveSection} pathname={pathname} />
  );

  return (
    <AdminToastProvider>
      <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        {isMobile ? (
          <>
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, zIndex: 1000,
              transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.3s ease', background: 'var(--surface)'
            }}>
              {sidebarComponent}
            </div>
            {sidebarOpen && (
              <div onClick={() => setSidebarOpen(false)}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
              />
            )}
          </>
        ) : (
          sidebarComponent
        )}

        <main style={{
          flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
          background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(13,148,136,0.07) 0%, transparent 70%), var(--bg)'
        }}>
          <SubAdminTopbar
            pathname={pathname}
            setActive={setActiveSection}
            isMobile={isMobile}
            setSidebarOpen={setSidebarOpen}
          />

          {showUnauthorized ? (
            <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
          ) : (
            <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
          )}
        </main>
      </div>
    </AdminToastProvider>
  );
}
