"use client";
import React, { useState, useEffect, useMemo } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import '@/app/(auth)/landing.css';
import Link from 'next/link';

/* ─── DATA ─── */
const CATEGORIES = [
  { id: 'all', label: 'All Services', icon: '✨' },
  { id: 'Academic', label: 'Academic', icon: '🎓' },
  { id: 'Visa', label: 'Visa & Immigration', icon: '🛂' },
  { id: 'Career', label: 'Career & Business', icon: '💼' },
  { id: 'Creative', label: 'Creative & Other', icon: '✍️' },
];

const CATALOG = [
  {
    id: 'sop-masters',
    name: 'Statement of Purpose',
    cat: 'Academic',
    icon: '🎓',
    tagline: 'Admission-ready SOPs for Bachelors, Masters, MBA & PhD',
    delivery: '3-5 days',
    desc: 'Our flagship service. We match you with a writer who has graduated from or worked in your target field to ensure your technical achievements are communicated with authority.',
    variants: [
      { id: 'sop-std', label: 'Standard SOP (1,000 words)', words: '1,000', delivery: '5 days', price: 4499, fast: 1500, addon: 1200 },
      { id: 'sop-pro', label: 'Premium SOP (1,500 words)', words: '1,500', delivery: '4 days', price: 6499, fast: 2000, addon: 1500 },
    ]
  },
  {
    id: 'visa-sop',
    name: 'Visa SOP & Appeals',
    cat: 'Visa',
    icon: '🛂',
    tagline: 'Country-specific Visa SOPs · Rejection appeals',
    delivery: '2-4 days',
    desc: 'Specialized writing for student, visitor, and work visas. We focus on ties to home country, financial capacity, and intent to return.',
    variants: [
      { id: 'visa-std', label: 'Student Visa SOP', words: '1,200', delivery: '3 days', price: 3999, fast: 1200, addon: 1000 },
      { id: 'visa-appeal', label: 'Rejection Appeal Letter', words: '1,500', delivery: '4 days', price: 5499, fast: 1800, addon: 1200 },
    ]
  },
  {
    id: 'resume-cv',
    name: 'Resume & CV',
    cat: 'Career',
    icon: '💼',
    tagline: 'ATS-optimized resumes for every industry',
    delivery: '2-3 days',
    desc: 'Get past the bots. We use industry-standard keywords and clean, professional formatting to highlight your impact.',
    variants: [
      { id: 'resume-std', label: 'Professional Resume', words: '2 pages', delivery: '3 days', price: 1999, fast: 800, ats: 500 },
      { id: 'resume-exec', label: 'Executive CV', words: '3-4 pages', delivery: '5 days', price: 4999, fast: 1500, ats: 800 },
    ]
  },
  // More products can be added here
];

const fmt = n => typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : n;

/* ─── COMPONENTS ─── */

function Btn({ children, onClick, variant = 'primary', size = 'md', icon, disabled, full }) {
  const [hov, setHov] = useState(false);
  const v = {
    primary: { bg: hov ? '#0f766e' : 'var(--teal)', c: '#fff', b: 'transparent' },
    outline: { bg: hov ? 'rgba(13,148,136,0.08)' : 'transparent', c: 'var(--text)', b: hov ? 'var(--teal)' : 'var(--border)' },
    ghost: { bg: hov ? 'var(--surface2)' : 'transparent', c: 'var(--text-muted)', b: 'transparent' },
    gold: { bg: hov ? '#d4b53c' : 'var(--gold)', c: '#0a0a14', b: 'transparent' },
  }[variant];
  const s = { sm: { p: '7px 12px', f: 11.5 }, md: { p: '10px 18px', f: 13 }, lg: { p: '14px 26px', f: 14 } }[size];
  return (
    <button 
      onClick={onClick} 
      onMouseEnter={() => setHov(true)} 
      onMouseLeave={() => setHov(false)} 
      disabled={disabled} 
      style={{
        padding: s.p, borderRadius: 7, border: `1.5px solid ${v.b}`, background: v.bg, color: v.c, 
        fontSize: s.f, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', 
        display: full ? 'flex' : 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, 
        transition: 'all .15s', opacity: disabled ? 0.5 : 1, width: full ? '100%' : 'auto'
      }}
    >
      {icon && <span>{icon}</span>}{children}
    </button>
  );
}

export default function ProductsPage() {
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [openProd, setOpenProd] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('xw_cart');
    if (savedCart) try { setCart(JSON.parse(savedCart)); } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('xw_cart', JSON.stringify(cart));
  }, [cart]);

  const filtered = useMemo(() => CATALOG.filter(p => {
    if (activeCat !== 'all' && p.cat !== activeCat) return false;
    if (search && !`${p.name} ${p.tagline} ${p.cat}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [activeCat, search]);

  const addToCart = (item) => {
    setCart(c => [...c, item]);
    setOpenProd(null);
    setCartOpen(true);
  };

  return (
    <div className="landing-page-container">
      <PublicNavbar />
      <style dangerouslySetInnerHTML={{ __html: `
        .products-hero{padding:140px 32px 36px;maxWidth:1320px;margin:0 auto;position:relative}
        .products-hero h1{fontSize:48px;fontWeight:700;letterSpacing:-0.03em;lineHeight:1.05;maxWidth:820px;marginBottom:14px}
        .products-hero p{fontSize:16px;color:var(--text-muted);fontWeight:300;maxWidth:680px;lineHeight:1.6}
        .filter-bar{position:sticky;top:69px;zIndex:30;background:rgba(10,10,20,0.95);backdropFilter:blur(20px);borderBottom:1px solid var(--border);padding:14px 32px}
        .catalog-grid{display:grid;gridTemplateColumns:repeat(auto-fill,minmax(280px,1fr));gap:14px;padding:28px 32px 60px;maxWidth:1320px;margin:0 auto}
        .product-card{background:var(--surface);border:1px solid var(--border);borderRadius:12px;padding:22px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden}
        .product-card:hover{borderColor:var(--teal);transform:translateY(-2px);boxShadow:0 12px 32px rgba(13,148,136,0.15)}
        .drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.65);backdropFilter:blur(6px);zIndex:1000}
        .drawer{position:fixed;top:0;right:0;bottom:0;width:min(620px,92vw);background:var(--surface);borderLeft:1px solid var(--border);zIndex:1001;display:flex;flexDirection:column;boxShadow:-30px 0 60px rgba(0,0,0,0.6);animation:slideIn 0.3s ease-out}
        @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
      ` }} />

      <div className="products-hero">
        <h1>Premium content writing.<br/><span className="gradient-text">Delivered on your timeline.</span></h1>
        <p>From admissions SOPs to executive resumes, scholarship essays to LinkedIn rewrites — pick a service, choose your variant, add to cart. Same-day fast-track available across every category.</p>
      </div>

      <div className="filter-bar">
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 5, padding: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button 
                key={c.id} 
                onClick={() => setActiveCat(c.id)} 
                style={{
                  padding: '7px 13px', borderRadius: 6, border: 'none', background: activeCat === c.id ? 'var(--teal)' : 'transparent', 
                  color: activeCat === c.id ? '#fff' : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', 
                  display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all .15s'
                }}
              >
                <span>{c.icon}</span>{c.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontSize: 13 }}>🔍</span>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search services..." 
              style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 7, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 12.5, outline: 'none', fontFamily: 'var(--font)' }}
            />
          </div>
        </div>
      </div>

      <div className="catalog-grid">
        {filtered.map(p => (
          <div key={p.id} className="product-card" onClick={() => setOpenProd(p)}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>{p.icon}</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 5 }}>{p.name}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>{p.tagline}</p>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--teal-light)' }}>{fmt(p.variants[0].price)}</div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 8 }}>{p.delivery} delivery</div>
          </div>
        ))}
      </div>

      {openProd && (
        <>
          <div className="drawer-overlay" onClick={() => setOpenProd(null)} />
          <div className="drawer">
            <div style={{ padding: 24, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <h2>{openProd.name}</h2>
              <button onClick={() => setOpenProd(null)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
              <p style={{ marginBottom: 20, color: 'var(--text-muted)' }}>{openProd.desc}</p>
              <h4>Select Variant</h4>
              <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                {openProd.variants.map(v => (
                  <div key={v.id} style={{ padding: 16, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{v.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.words} words · {v.delivery}</div>
                    </div>
                    <Btn onClick={() => addToCart({ prod: openProd, variant: v, total: v.price })}>Add {fmt(v.price)}</Btn>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {cartOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setCartOpen(false)} />
          <div className="drawer" style={{ width: 'min(480px, 92vw)' }}>
            <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <h3>Your Cart ({cart.length})</h3>
              <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
              {cart.map((item, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border2)', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.prod.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.variant.label}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--teal-light)' }}>{fmt(item.total)}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: 20, background: 'var(--surface2)', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, fontSize: 18, fontWeight: 700 }}>
                <span>Total</span>
                <span>{fmt(cart.reduce((s, i) => s + i.total, 0))}</span>
              </div>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Btn full size="lg">Proceed to Checkout →</Btn>
              </Link>
            </div>
          </div>
        </>
      )}

      <PublicFooter />
    </div>
  );
}
