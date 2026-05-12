"use client";
import Link from 'next/link';

export default function PublicNavbar() {
  return (
    <nav style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(13, 13, 26, 0.8)', backdropFilter: 'blur(10px)', zIndex: 100, borderBottom: '1px solid var(--border)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '32px'}}>
        <Link href="/" style={{fontWeight: 700, fontSize: 20, color: 'var(--text)', textDecoration: 'none'}}>Xpresswriters</Link>
        <div style={{display: 'flex', gap: '20px'}}>
          <Link href="/about" style={{color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, fontWeight: 500}}>About</Link>
          <Link href="/help" style={{color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, fontWeight: 500}}>Help</Link>
          <Link href="/legal" style={{color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, fontWeight: 500}}>Legal</Link>
          <Link href="/products" style={{color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, fontWeight: 500}}>Products</Link>
          <Link href="/report" style={{color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, fontWeight: 500}}>Report</Link>
          <Link href="/review" style={{color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, fontWeight: 500}}>Review</Link>
          <Link href="/track" style={{color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, fontWeight: 500}}>Track</Link>
        </div>
      </div>
      <div style={{display: 'flex', gap: '16px'}}>
        <Link href="/login" className="btn-outline-teal">Login</Link>
        <Link href="/login" className="btn-teal">Get Started</Link>
      </div>
    </nav>
  );
}
