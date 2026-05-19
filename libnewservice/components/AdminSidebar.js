'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  {
    group: 'Catalog',
    items: [
      { href: '/services', label: 'Service Management', icon: '🛠' },
      { href: '/offers',   label: 'Offers & Promos',    icon: '🎟' },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 224,
        flexShrink: 0,
        background: 'linear-gradient(180deg,#0d0d1c 0%,#0a1520 60%,#0d0d1c 100%)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
        <Link href="/services" style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
          <div
            style={{
              width: 30, height: 30, background: 'var(--teal)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, color: '#fff', borderRadius: 7,
            }}
          >
            X
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', letterSpacing: '-0.01em' }}>
              Xpresswriters
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Admin Panel
            </div>
          </div>
        </Link>

        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px', background: 'rgba(13,148,136,0.08)',
            border: '1px solid rgba(13,148,136,0.22)', borderRadius: 7,
          }}
        >
          <div
            style={{
              width: 24, height: 24, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--teal)', fontSize: 10, fontWeight: 700, color: '#fff',
            }}
          >
            SA
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 12.5 }}>Super Admin</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>Full access</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
        {NAV.map((g) => (
          <div key={g.group} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--text-dim)',
                padding: '4px 10px 8px',
              }}
            >
              {g.group}
            </div>
            {g.items.map((it) => {
              const active = pathname === it.href || pathname?.startsWith(it.href + '/');
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 7, marginBottom: 2,
                    background: active ? 'rgba(13,148,136,0.12)' : 'transparent',
                    color: active ? 'var(--teal-light)' : 'var(--text-muted)',
                    fontSize: 12.5, fontWeight: active ? 600 : 500,
                    border: active ? '1px solid rgba(13,148,136,0.25)' : '1px solid transparent',
                    transition: 'background .15s, color .15s',
                  }}
                >
                  <span style={{ fontSize: 14, width: 16, textAlign: 'center' }}>{it.icon}</span>
                  <span>{it.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: 14, borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text-dim)' }}>
        v0.1 · Next.js
      </div>
    </aside>
  );
}
