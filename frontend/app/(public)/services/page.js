"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '@/app/(auth)/landing.css';
import servicesData from '@/data/services_data.json';

const fmt = n => typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : n;

const CATEGORIES = servicesData.categories.map(c => ({
  id: c.id,
  label: c.name,
  icon: c.id === 'sop' ? '🎓' : c.id === 'lor' ? '📜' : c.id === 'resume' ? '💼' : c.id === 'visa_application' ? '🛂' : '📄'
}));

const CATALOG = Object.entries(servicesData.individualServices).flatMap(([catId, svcs]) => 
  svcs.map((s, idx) => {
    const basePrice = typeof s.price === 'string' ? parseInt(s.price.replace(/[^\d]/g, '')) || 2499 : s.price || 2499;
    return {
      id: s.id,
      cat: catId.charAt(0).toUpperCase() + catId.slice(1).replace('_', ' '),
      icon: catId === 'sop' ? '🎓' : catId === 'lor' ? '📜' : catId === 'resume' ? '💼' : catId === 'visa_application' ? '🛂' : '📄',
      name: s.name,
      tagline: s.description,
      desc: s.description,
      delivery: '3-5 days',
      variants: [
        { id: s.id + '_standard', label: 'Standard Tier', words: '500 words', delivery: '3-4 days', price: basePrice, fast: Math.round(basePrice * 0.4), addon: 499, custom: 799 },
        { id: s.id + '_premium', label: 'Premium Tier', words: '1000 words', delivery: '2-3 days', price: basePrice + 1500, fast: Math.round((basePrice + 1500) * 0.4), addon: 499, custom: 799, ats: catId === 'resume' ? 299 : undefined }
      ]
    };
  })
);

/* ─── BUTTONS ─── */
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
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} disabled={disabled} style={{ padding: s.p, borderRadius: 7, border: `1.5px solid ${v.b}`, background: v.bg, color: v.c, fontSize: s.f, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', display: full ? 'flex' : 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all .15s', opacity: disabled ? 0.5 : 1, width: full ? '100%' : 'auto' }}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

/* ─── NAVBAR ─── */
function Navbar({ cart, onCartClick, onLogin }) {
  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(10,10,20,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--text)' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,var(--teal),#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff' }}>X</div>
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>Xpresswriters</span>
      </Link>
      <div style={{ display: 'flex', gap: 18, marginLeft: 28 }}>
        {[
          ['Services', '/services', true],
          ['Track Order', '/track', false],
          ['Help', '/help', false],
          ['About', '/about', false]
        ].map(([l, h, act]) => (
          <a key={l} href={h} style={{ fontSize: 13.5, color: act ? 'var(--teal-light)' : 'var(--text-muted)', textDecoration: 'none', fontWeight: act ? 600 : 500, padding: '6px 0', borderBottom: act ? '2px solid var(--teal)' : '2px solid transparent' }}>{l}</a>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onCartClick} style={{ position: 'relative', width: 38, height: 38, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontSize: 16, fontFamily: 'var(--font)' }}>🛒
          {cart.length > 0 && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9, background: 'var(--teal)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)', animation: 'bounce .4s ease' }}>{cart.length}</span>}
        </button>
        <Btn variant="ghost" onClick={onLogin}>Sign In</Btn>
        <Btn variant="primary" onClick={onLogin}>Order Now</Btn>
      </div>
    </nav>
  );
}

/* ─── PRODUCT CARD ─── */
function ProductCard({ prod, onOpen }) {
  const [hov, setHov] = useState(false);
  const items = prod.variants || prod.tiers || [];
  const minPrice = Math.min(...items.map(v => typeof v.price === 'number' ? v.price : Infinity).filter(p => isFinite(p)));
  return (
    <div onClick={() => onOpen(prod)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: hov ? 'var(--surface2)' : 'var(--surface)', border: `1px solid ${hov ? 'var(--teal)' : 'var(--border)'}`, borderRadius: 12, padding: '22px 22px 18px', cursor: 'pointer', transition: 'all .2s', position: 'relative', overflow: 'hidden',
      transform: hov ? 'translateY(-2px)' : 'translateY(0)',
      boxShadow: hov ? '0 12px 32px rgba(13,148,136,0.15)' : 'none',
      animation: 'fadeUp .3s ease both',
      height: '100%', display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: hov ? 3 : 0, background: 'linear-gradient(90deg,var(--teal),var(--teal-light))', transition: 'height .2s' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: 10, background: 'linear-gradient(135deg,rgba(13,148,136,0.2),rgba(13,148,136,0.05))', border: '1px solid rgba(13,148,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{prod.icon}</div>
        <span style={{ padding: '3px 9px', borderRadius: 4, background: 'var(--surface3)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{prod.cat}</span>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 5, lineHeight: 1.3 }}>{prod.name}</h3>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, fontWeight: 300, marginBottom: 14, minHeight: 36, flex: 1 }}>{prod.tagline}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Starting at</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--teal-light)', letterSpacing: '-0.02em' }}>{fmt(minPrice)}</span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        <span style={{ fontSize: 10.5, color: 'var(--text-dim)', padding: '2px 8px', background: 'var(--surface2)', borderRadius: 4 }}>⏱ {prod.delivery}</span>
        <span style={{ fontSize: 10.5, color: 'var(--text-dim)', padding: '2px 8px', background: 'var(--surface2)', borderRadius: 4 }}>{items.length} variants</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: 11.5, color: hov ? 'var(--teal-light)' : 'var(--text-muted)', fontWeight: 600, transition: 'color .15s' }}>View pricing matrix →</span>
      </div>
    </div>
  );
}

/* ─── PRODUCT DETAIL DRAWER ─── */
function ProductDrawer({ prod, onClose, onAdd }) {
  const [variant, setVariant] = useState(null);
  const [fast, setFast] = useState(false);
  const [addon, setAddon] = useState(false);
  const [custom, setCustom] = useState(false);
  useEffect(() => { setVariant(null); setFast(false); setAddon(false); setCustom(false); }, [prod]);
  if (!prod) return null;
  const items = prod.variants || prod.tiers || [];

  const compute = () => {
    if (!variant || typeof variant.price !== 'number') return null;
    let total = variant.price;
    let breakdown = [{ l: variant.label, v: variant.price }];
    if (fast && typeof variant.fast === 'number') { total += variant.fast; breakdown.push({ l: 'Fast track delivery', v: variant.fast }); }
    if (addon && typeof variant.addon === 'number') { total += variant.addon; breakdown.push({ l: '+500 words addon', v: variant.addon }); }
    if (custom && typeof variant.custom === 'number') { total += variant.custom; breakdown.push({ l: 'Customisation', v: variant.custom }); }
    if (variant.ats) { total += variant.ats; breakdown.push({ l: 'ATS Optimization', v: variant.ats }); }
    return { total, breakdown };
  };
  const calc = compute();

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 1100, animation: 'fadeIn .2s ease' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(620px,92vw)', background: 'var(--surface)', borderLeft: '1px solid var(--border)', zIndex: 1200, display: 'flex', flexDirection: 'column', animation: 'slideLeft .25s cubic-bezier(.2,.9,.3,1.2)', boxShadow: '-30px 0 60px rgba(0,0,0,0.6)' }}>
        <div style={{ padding: '22px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ width: 54, height: 54, borderRadius: 12, background: 'linear-gradient(135deg,rgba(13,148,136,0.25),rgba(13,148,136,0.08))', border: '1px solid rgba(13,148,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{prod.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: 'var(--surface3)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>{prod.cat}</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 5, lineHeight: 1.25 }}>{prod.name}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 300, lineHeight: 1.55 }}>{prod.tagline}</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 7, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font)', flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <p style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.65, marginBottom: 24, fontWeight: 300 }}>{prod.desc}</p>

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Choose your variant</div>
          <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
            {items.map(v => (
              <button key={v.id} onClick={() => setVariant(v)} style={{
                textAlign: 'left', padding: '14px 16px', borderRadius: 9, border: variant?.id === v.id ? '1.5px solid var(--teal)' : '1px solid var(--border)',
                background: variant?.id === v.id ? 'rgba(13,148,136,0.1)' : 'var(--surface2)',
                color: 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s',
                display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 7 }}>
                    {v.label}
                    {variant?.id === v.id && <span style={{ color: 'var(--teal-light)', fontSize: 13 }}>✓</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span>📝 {v.words}</span>
                    <span>⏱ {v.delivery}</span>
                    {v.revisions && <span>🔁 {v.revisions} revisions</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--teal-light)', letterSpacing: '-0.02em' }}>{typeof v.price === 'number' ? fmt(v.price) : v.price}</div>
                </div>
              </button>
            ))}
          </div>

          {variant && (<>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Customisations & Add-ons</div>
            <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
              {typeof variant.fast === 'number' && <AddonRow checked={fast} onChange={setFast} icon="⚡" label="Fast Track Delivery" sub="Get it 2-3× faster — same priority writer" price={variant.fast} />}
              {typeof variant.addon === 'number' && <AddonRow checked={addon} onChange={setAddon} icon="📝" label="+500 words content" sub="Add extra detail and depth" price={variant.addon} />}
              {typeof variant.custom === 'number' && <AddonRow checked={custom} onChange={setCustom} icon="✨" label="Customisation" sub="Tailor to specific requirements" price={variant.custom} />}
              {variant.ats && <div style={{ padding: '12px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 10 }}><span>🤖</span><div><div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>ATS Format</div>+₹{variant.ats} for ATS-optimized version</div></div>}
              {variant.note && <div style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 11.5, color: 'var(--amber)', lineHeight: 1.5 }}>ℹ {variant.note}</div>}
            </div>
          </>)}

          <div style={{ padding: '14px 16px', background: 'rgba(13,148,136,0.05)', border: '1px solid rgba(13,148,136,0.15)', borderRadius: 9, fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 5 }}>What's included</div>
            • Hand-crafted by domain expert writers · • 2 free revisions on most plans · • Plagiarism-free with originality report · • Full IP transferred to you · • In-app messaging with your writer
          </div>
        </div>

        {variant && calc && (<div style={{ borderTop: '1px solid var(--border)', padding: '18px 28px', background: 'var(--surface2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Total</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--teal-light)', letterSpacing: '-0.02em', lineHeight: 1 }}>{fmt(calc.total)}</div>
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-dim)', textAlign: 'right', lineHeight: 1.6 }}>
              {calc.breakdown.map(b => (<div key={b.l}>{b.l} <span style={{ color: 'var(--text-muted)' }}>{fmt(b.v)}</span></div>))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="lg" variant="outline" full onClick={() => { onAdd({ prod, variant, fast, addon, custom, total: calc.total }); }}>🛒 Add to Cart</Btn>
            <Btn size="lg" variant="primary" full onClick={() => { onAdd({ prod, variant, fast, addon, custom, total: calc.total }, true); }}>Buy Now →</Btn>
          </div>
        </div>)}
      </div>
    </>
  );
}

function AddonRow({ checked, onChange, icon, label, sub, price }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      textAlign: 'left', padding: '12px 14px', borderRadius: 8, border: checked ? '1.5px solid var(--teal)' : '1px solid var(--border)',
      background: checked ? 'rgba(13,148,136,0.1)' : 'var(--surface2)', color: 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s',
      display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: 12, alignItems: 'center'
    }}>
      <div style={{ width: 18, height: 18, borderRadius: 5, border: checked ? 'none' : '1.5px solid var(--text-dim)', background: checked ? 'var(--teal)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>{checked ? '✓' : ''}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 1 }}>{icon} {label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 300 }}>{sub}</div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal-light)' }}>+{fmt(price)}</div>
    </button>
  );
}

/* ─── CART DRAWER ─── */
function CartDrawer({ open, onClose, cart, setCart, onCheckout }) {
  if (!open) return null;
  const subtotal = cart.reduce((s, i) => s + i.total, 0);
  const fee = Math.round(subtotal * 0.05);
  const tax = Math.round((subtotal + fee) * 0.18);
  const total = subtotal + fee + tax;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1100, animation: 'fadeIn .2s' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(480px,92vw)', background: 'var(--surface)', borderLeft: '1px solid var(--border)', zIndex: 1200, display: 'flex', flexDirection: 'column', animation: 'slideLeft .25s cubic-bezier(.2,.9,.3,1.2)', boxShadow: '-30px 0 60px rgba(0,0,0,0.6)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><div style={{ fontSize: 17, fontWeight: 700 }}>Your Cart</div><div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{cart.length} {cart.length === 1 ? 'item' : 'items'}</div></div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 7, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font)' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: cart.length ? '12px 0' : '40px 24px' }}>
          {cart.length === 0 ? <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>🛒</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>Your cart is empty</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 18 }}>Browse our services to add items</div>
            <Btn variant="primary" onClick={onClose}>Browse Services</Btn>
          </div> : cart.map((item, i) => (<div key={i} style={{ padding: '16px 24px', borderBottom: '1px solid var(--border2)', display: 'flex', gap: 13 }}>
            <div style={{ width: 42, height: 42, borderRadius: 9, background: 'rgba(13,148,136,0.15)', border: '1px solid rgba(13,148,136,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{item.prod.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{item.prod.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 5 }}>{item.variant.label}</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
                {item.fast && <span style={{ fontSize: 9.5, padding: '1px 6px', borderRadius: 3, background: 'rgba(245,200,66,0.15)', color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.04em' }}>⚡ FAST TRACK</span>}
                {item.addon && <span style={{ fontSize: 9.5, padding: '1px 6px', borderRadius: 3, background: 'rgba(13,148,136,0.15)', color: 'var(--teal-light)', fontWeight: 600, letterSpacing: '0.04em' }}>+500 WORDS</span>}
                {item.custom && <span style={{ fontSize: 9.5, padding: '1px 6px', borderRadius: 3, background: 'rgba(167,139,250,0.15)', color: '#a78bfa', fontWeight: 600, letterSpacing: '0.04em' }}>✨ CUSTOM</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--teal-light)' }}>{fmt(item.total)}</div>
                <button onClick={() => setCart(cart.filter((_, idx) => idx !== i))} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font)' }}>Remove</button>
              </div>
            </div>
          </div>))}
        </div>
        {cart.length > 0 && <div style={{ padding: '18px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface2)' }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'grid', gap: 5, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span style={{ color: 'var(--text)' }}>{fmt(subtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Platform fee (5%)</span><span style={{ color: 'var(--text)' }}>{fmt(fee)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>GST (18%)</span><span style={{ color: 'var(--text)' }}>{fmt(tax)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 4, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}><span>Total</span><span style={{ color: 'var(--teal-light)' }}>{fmt(total)}</span></div>
          </div>
          <Btn variant="primary" size="lg" full onClick={onCheckout}>Proceed to Checkout →</Btn>
          <div style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--text-dim)', marginTop: 10 }}>🔒 Secured by Stripe & Razorpay · No login required to start</div>
        </div>}
      </div>
    </>
  );
}

export default function ServicesPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [openProd, setOpenProd] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('xw_cart');
      if (stored) setCart(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('xw_cart', JSON.stringify(cart));
  }, [cart]);

  const filtered = useMemo(() => CATALOG.filter(p => {
    if (activeCat !== 'all' && p.cat !== activeCat) return false;
    if (search && !`${p.name} ${p.tagline} ${p.cat}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [activeCat, search]);

  const addToCart = (item, buyNow) => {
    setCart(c => [...c, item]);
    setOpenProd(null);
    if (buyNow) { 
      if (session) {
        localStorage.setItem('pendingOrder', JSON.stringify(item));
        router.push('/student');
      } else {
        localStorage.setItem('pendingOrder', JSON.stringify(item));
        router.push('/login?callbackUrl=/student');
      }
    } else { 
      setCartOpen(true); 
    }
  };

  const handleLogin = () => {
    if (session) router.push(`/${session.user.role.toLowerCase()}`);
    else router.push('/login');
  };

  return (
    <div className="landing-page-container">
      <Navbar cart={cart} onCartClick={() => setCartOpen(true)} onLogin={handleLogin} />
      <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font)' }}>
        
        {/* Intro Banner */}
        <section style={{ padding: '160px 20px 80px', textAlign: 'center', background: 'radial-gradient(60% 100% at 50% 0%,rgba(13,148,136,0.15),transparent)', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontSize: '56px', fontWeight: '800', marginBottom: '18px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Our Writing Services</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '20px', maxWidth: '700px', margin: '0 auto', fontWeight: 300, lineHeight: 1.6 }}>
            PhD-level writing, editing, and strategy for every stage of your academic and career journey. Select a service to customize your timeline and place your order.
          </p>
        </section>

        {/* Sticky category bar */}
        <div style={{ position: 'sticky', top: 66, zIndex: 50, background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '14px 32px' }}>
          <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 5, padding: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9, flexWrap: 'wrap' }}>
              <button onClick={() => setActiveCat('all')} style={{ padding: '7px 13px', borderRadius: 6, border: 'none', background: activeCat === 'all' ? 'var(--teal)' : 'transparent', color: activeCat === 'all' ? '#fff' : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all .15s' }}>All</button>
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setActiveCat(c.label)} style={{ padding: '7px 13px', borderRadius: 6, border: 'none', background: activeCat === c.label ? 'var(--teal)' : 'transparent', color: activeCat === c.label ? '#fff' : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all .15s' }}>
                  <span>{c.icon}</span>{c.label}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontSize: 13, pointerEvents: 'none' }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services..." style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 7, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 12.5, outline: 'none', fontFamily: 'var(--font)' }} />
            </div>
          </div>
        </div>

        {/* Catalog grid */}
        <section style={{ padding: '40px 32px 100px', maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 className="h2" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{activeCat === 'all' ? 'All Services' : activeCat}</h2>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                {filtered.length} {filtered.length === 1 ? 'service' : 'services'} · Custom pricing matrix available
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filtered.map(p => <ProductCard key={p.id} prod={p} onOpen={setOpenProd} />)}
          </div>
        </section>

        {/* Custom Quote CTA */}
        <section style={{ padding: '80px 32px', textAlign: 'center', background: 'rgba(13,148,136,0.03)', borderTop: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Don't see what you're looking for?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px', fontSize: '15px', fontWeight: 300, lineHeight: 1.6 }}>
            We handle complex dissertations, technical reports, specialized resumes, and customized content schedules. Get in touch for a bespoke plan.
          </p>
          <Link href="/contact" className="btn-teal" style={{ padding: '14px 40px', fontSize: '15px', textDecoration: 'none', display: 'inline-block' }}>Get a Custom Quote</Link>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)', paddingTop: 60, paddingBottom: 30 }}>
          <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 32px', display: 'flex', flexWrap: 'wrap', gap: 60, justifyContent: 'space-between', marginBottom: 60 }}>
            <div style={{ maxWidth: 300 }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--text)', marginBottom: 20 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg,var(--teal),#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff' }}>X</div>
                <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>Xpresswriters</span>
              </Link>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24, fontWeight: 300 }}>Premium content writing services connecting freelance experts with customers worldwide. Confidential, plagiarism-free, on-time.</p>
            </div>

            <div style={{ display: 'flex', gap: 80, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 20 }}>PRODUCT</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <a href="/services" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>All Services</a>
                  <a href="/pricing" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Pricing</a>
                  <a href="/track" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Track Order</a>
                  <a href="/register?role=freelancer" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Become a Writer</a>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 20 }}>COMPANY</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <a href="/about" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>About</a>
                  <a href="/contact" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Contact</a>
                  <a href="/faq" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Help Center</a>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 20 }}>LEGAL</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <a href="/legal#terms" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</a>
                  <a href="/legal#privacy" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
                  <a href="/legal#refund" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Refund Policy</a>
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, padding: '24px 32px 0' }}>
            <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 20, alignItems: 'center' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>© 2024 Xpresswriters Pvt Ltd. All rights reserved. Made with care in India.</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>GSTIN: 27AABCX1234X125 - CIN: U72200MH2023PTC123456</div>
            </div>
          </div>
        </footer>

      </div>

      <ProductDrawer prod={openProd} onClose={() => setOpenProd(null)} onAdd={addToCart} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} setCart={setCart} onCheckout={() => { 
        setCartOpen(false); 
        if (cart.length > 0) {
          localStorage.setItem('pendingOrder', JSON.stringify(cart[0]));
        }
        if (session) {
          router.push('/student');
        } else {
          router.push('/login?callbackUrl=/student');
        }
      }} />
    </div>
  );
}
