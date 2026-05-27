"use client";
import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function PublicNavbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const onLogin = () => router.push('/login');

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,20,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--text)' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,var(--teal),#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff' }}>X</div>
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>Xpresswriters</span>
      </Link>
      <div className="nav-links" style={{ display: 'flex', gap: 18, marginLeft: 28 }}>
        {[
          ['Services', '/services'],
          ['Track Order', '/track'],
          ['Help', '/help'],
          ['About', '/about']
        ].map(([l, h]) => (
          <Link key={l} href={h} style={{ fontSize: 13.5, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500, padding: '6px 0' }}>{l}</Link>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {session ? (
          <Link href={`/${session.user.role.toLowerCase()}`} style={{ padding: '8px 18px', borderRadius: 7, background: 'var(--teal)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Dashboard</Link>
        ) : (
          <>
            <button onClick={onLogin} style={{ padding: '8px 16px', borderRadius: 7, border: '1.5px solid transparent', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>Sign In</button>
            <button onClick={onLogin} style={{ padding: '8px 20px', borderRadius: 7, border: '1.5px solid var(--teal)', background: 'var(--teal)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>Order Now</button>
          </>
        )}
      </div>
    </nav>
  );
}
