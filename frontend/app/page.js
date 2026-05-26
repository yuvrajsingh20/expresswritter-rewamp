"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import './(auth)/landing.css';
import servicesData from '@/data/services_data.json';

const fmt = n => typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : n;

// Static data removed in favor of dynamic fetching

const WRITERS = [
  { n: 'Dr. Amara Singh', av: 'AS', c: '#0d9488', spec: 'SOP · MBA Admissions', exp: '9 yrs · 340 orders', rate: 4.98, price: '₹7,999+', badge: 'Elite', tags: ['PhD Stanford', 'Wharton MBA', 'Top 1%'] },
  { n: 'Marcus Webb', av: 'MW', c: '#3b82f6', spec: 'Content · SEO', exp: '7 yrs · 520 orders', rate: 4.92, price: '₹0.60/word', badge: 'Top Writer', tags: ['SaaS', 'Fintech', 'B2B'] },
  { n: 'Sofía Ramírez', av: 'SR', c: '#a78bfa', spec: 'Thesis · Research', exp: '12 yrs · 180 orders', rate: 5.0, price: '₹18,000+', badge: 'PhD', tags: ['Sciences', 'APA/MLA', 'LaTeX'] },
  { n: 'James Chen', av: 'JC', c: '#f59e0b', spec: 'Resume · LinkedIn', exp: '6 yrs · 680 orders', rate: 4.95, price: '₹2,499+', badge: 'Top Writer', tags: ['Tech', 'FAANG', 'Executive'] },
  { n: 'Priya Mehta', av: 'PM', c: '#22c55e', spec: 'Visa SOP · LOR', exp: '5 yrs · 410 orders', rate: 4.96, price: '₹3,999+', badge: 'Verified', tags: ['Canada', 'Australia', 'UK'] },
  { n: 'Daniel Okonkwo', av: 'DO', c: '#f43f5e', spec: 'Business Proposals', exp: '10 yrs · 220 orders', rate: 4.94, price: '₹6,999+', badge: 'Elite', tags: ['VC Pitches', 'RFPs', 'Strategy'] },
];

const FEATURES = [
  { icon: '🛡️', t: 'Plagiarism-Free Guarantee', d: 'Turnitin-style report included on every delivery. 100% original or full re-draft.' },
  { icon: '🔒', t: 'NDA-Protected', d: 'Every writer signs a confidentiality agreement. Your work is yours, forever.' },
  { icon: '⚡', t: 'Express Delivery', d: '24-hour rush option available on most services. Late = free service credits, no questions.' },
  { icon: '🔄', t: 'Unlimited Revisions', d: 'Revise until you\'re satisfied. We don\'t close orders until you say so.' },
  { icon: '💬', t: 'Direct Writer Chat', d: 'Talk to your writer 1-on-1 inside our messaging platform. No middlemen.' },
  { icon: '🤝', t: 'Satisfaction Promise', d: 'Not happy after revisions? We will assign a new expert writer to re-draft it for free.' },
];


const TESTIMONIALS = [
  { q: 'My SOP went from rejections to Stanford, Wharton, and LBS admits in one cycle. The writer understood my engineering background and translated it into a story admissions actually wanted to read.', n: 'Meera Krishnan', r: "Admitted Stanford MBA '26", c: '#0d9488' },
  { q: "I’ve worked with three other content agencies. Xpresswriters is the first one where I didn’t have to rewrite half the draft. They actually researched our space.", n: 'Daniel Park', r: 'Marketing Director, FinTech SaaS', c: '#3b82f6' },
  { q: 'My Canadian visa was rejected twice. The appeal SOP from Priya got me approved in 3 weeks. I genuinely cannot recommend this service enough — they saved my career path.', n: 'Aditi Kapoor', r: 'Software Engineer, Toronto', c: '#a78bfa' },
];

const FAQ = [
  { q: 'How is Xpresswriters different from other writing services?', a: "We’re a marketplace, not a content mill. You see the actual writer’s profile, ratings, and portfolio before you hire. Every order has a real human accountable to you — no anonymous teams, no rewrites by junior staff." },
  { q: 'Is the work AI-generated?', a: 'No. We\'re an AI-detection-friendly platform — every delivery passes GPTZero, Originality.ai, and Turnitin. Writers may use AI as a research tool, but the writing is human and original.' },
  { q: "What if I’m not happy with the draft?", a: "Unlimited free revisions within scope. If that still doesn’t work, you can request a writer change at no extra cost — we guarantee satisfaction before delivery." },
  { q: 'How fast can you deliver?', a: 'Most services have a 24-48 hour express option. A 1,500-word SOP can be turned around in 24 hours; complex thesis chapters need 5-10 days. Every product page shows exact timelines.' },
  { q: 'Do you guarantee admission / visa approval?', a: 'No ethical writing service can guarantee outcomes — those depend on your profile, target school, and a dozen other factors. What we guarantee is the highest-quality document we can produce for your case.' },
];

/* ─── BUTTONS ─── */
function Btn({ children, onClick, variant = 'primary', size = 'md', icon, disabled, full, className }) {
  const [hov, setHov] = useState(false);
  const v = {
    primary: { bg: hov ? '#0f766e' : 'var(--teal)', c: '#fff', b: 'transparent' },
    outline: { bg: hov ? 'rgba(13,148,136,0.08)' : 'transparent', c: 'var(--text)', b: hov ? 'var(--teal)' : 'var(--border)' },
    ghost: { bg: hov ? 'var(--surface2)' : 'transparent', c: 'var(--text-muted)', b: 'transparent' },
    gold: { bg: hov ? '#d4b53c' : 'var(--gold)', c: '#0a0a14', b: 'transparent' },
  }[variant];
  const s = { sm: { p: '7px 12px', f: 11.5 }, md: { p: '10px 18px', f: 13 }, lg: { p: '14px 26px', f: 14 } }[size];
  return (
    <button className={className} onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} disabled={disabled} style={{ padding: s.p, borderRadius: 7, border: `1.5px solid ${v.b}`, background: v.bg, color: v.c, fontSize: s.f, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', display: full ? 'flex' : 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all .15s', opacity: disabled ? 0.5 : 1, width: full ? '100%' : 'auto' }}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

/* ─── NAVBAR ─── */
function Navbar({ cart, onCartClick, onLogin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    ['Services', '/services', false],
    ['Track Order', '/track', false],
    ['Help', '/help', false],
    ['About', '/about', false]
  ];
  return (
    <>
      <nav className="navbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(10,10,20,0.85)', backdropFilter: 'none', borderBottom: '1px solid var(--border)', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--text)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,var(--teal),#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff' }}>X</div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>Xpresswriters</span>
        </Link>
        <div className="nav-links" style={{ display: 'flex', gap: 18, marginLeft: 28 }}>
          {links.map(([l, h, act]) => (
            <a key={l} href={h} style={{ fontSize: 13.5, color: act ? 'var(--teal-light)' : 'var(--text-muted)', textDecoration: 'none', fontWeight: act ? 600 : 500, padding: '6px 0', borderBottom: act ? '2px solid var(--teal)' : '2px solid transparent' }}>{l}</a>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onCartClick} style={{ position: 'relative', width: 38, height: 38, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontSize: 16, fontFamily: 'var(--font)' }}>🛒
            {cart.length > 0 && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9, background: 'var(--teal)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)', animation: 'bounce .4s ease' }}>{cart.length}</span>}
          </button>
          <div className="desktop-only"><Btn variant="ghost" onClick={onLogin}>Sign In</Btn></div>
          <Btn variant="primary" onClick={onLogin}>Order Now</Btn>
          <button className="mobile-only" onClick={() => setMenuOpen(!menuOpen)} style={{ width: 38, height: 38, borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontSize: 20, alignItems: 'center', justifyContent: 'center', padding: 0 }}>☰</button>
        </div>
      </nav>
      {menuOpen && (
        <div className="mobile-only" style={{ position: 'fixed', top: 66, left: 0, right: 0, background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 24px', zIndex: 999, flexDirection: 'column', gap: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', animation: 'fadeUp .2s ease' }}>
          {links.map(([l, h, act]) => (
            <a key={l} href={h} style={{ fontSize: 15, color: act ? 'var(--teal-light)' : 'var(--text)', textDecoration: 'none', fontWeight: 600 }}>{l}</a>
          ))}
          <div style={{ height: 1, background: 'var(--border2)' }} />
          <a href="#" onClick={(e) => { e.preventDefault(); onLogin(); }} style={{ fontSize: 15, color: 'var(--teal-light)', textDecoration: 'none', fontWeight: 600 }}>Sign In</a>
        </div>
      )}
    </>
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
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'none', zIndex: 1100, animation: 'fadeIn .2s ease' }} />
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
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'none', zIndex: 1100, animation: 'fadeIn .2s' }} />
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

/* ─── JOURNEY DIAGRAM ─── */
function Journey() {
  const steps = [
    { n: 1, t: 'Browse', d: 'Explore 16 services across 70+ variants', i: '🔍' },
    { n: 2, t: 'Customize', d: 'Pick variant, add fast-track & extras', i: '⚙️' },
    { n: 3, t: 'Cart', d: 'Bundle multiple services together', i: '🛒' },
    { n: 4, t: 'Sign Up', d: 'Create account or continue as guest', i: '🔐' },
    { n: 5, t: 'Brief', d: 'Share requirements & deadline', i: '📋' },
    { n: 6, t: 'Pay', d: 'Razorpay, Stripe, UPI — all secured', i: '💳' },
    { n: 7, t: 'Assigned', d: 'CRM auto-routes to best writer (≤30 min)', i: '🎯' },
    { n: 8, t: 'Deliver', d: 'Track progress, chat, approve, invoice', i: '✅' },
  ];
  return (
    <div id="how" style={{ padding: '56px 32px', maxWidth: 1320, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ display: 'inline-flex', padding: '4px 11px', borderRadius: 5, background: 'rgba(13,148,136,0.15)', marginBottom: 12, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--teal-light)' }}>End-to-End Journey</div>
        <h2 className="h2" style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>From browse to delivery in 8 steps</h2>
        <p className="lead" style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 300, maxWidth: 580, margin: '0 auto' }}>Frictionless ordering with automatic CRM integration — every order flows from website → checkout → writer assignment → delivery.</p>
      </div>
      <div className="journey-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {steps.map((s, i) => (<div key={s.n} style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 11, padding: '20px 18px', animation: `fadeUp .3s ease ${i * .05}s both` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,rgba(13,148,136,0.2),rgba(13,148,136,0.06))', border: '1px solid rgba(13,148,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{s.i}</div>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-dim)' }}>STEP {s.n}</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{s.t}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, fontWeight: 300 }}>{s.d}</div>
          {(i + 1) % 4 !== 0 && i < steps.length - 1 && <div style={{ position: 'absolute', right: -9, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, borderRadius: '50%', background: 'var(--bg)', border: '2px solid var(--teal)', color: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, zIndex: 2 }}>→</div>}
        </div>))}
      </div>
    </div>
  );
}

// ── EXISTING PAGE.JS COMPONENTS THAT WE KEEP ── //
function Hero() {
  const { data: session } = useSession();
  const router = useRouter();
  const [counts, setCounts] = useState({ orders: 0, writers: 0, rating: 0 });
  useEffect(() => {
    const dur = 1600; const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setCounts({ orders: Math.floor(12400 * e), writers: Math.floor(1200 * e), rating: (4.9 * e).toFixed(1) });
      if (p < 1) requestAnimationFrame(tick);
    };
    tick();
  }, []);
  return (
    <section className="hero-section" style={{ position: 'relative', minHeight: '82vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div className="hero-bg">
        <div className="hero-grid" />
        <div className="hero-orb1" />
        <div className="hero-orb2" />
      </div>
      <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 920 }}>
        <div className="fade-up eyebrow" style={{ justifyContent: 'center' }}>India's most-trusted writing marketplace</div>
        <h1 className="h1 fade-up" style={{ marginBottom: 24, animationDelay: '.05s' }}>
          Words that work. <br />
          Writers who <span className="shimmer">deliver.</span>
        </h1>
        <p className="lead fade-up" style={{ margin: '0 auto 36px', fontSize: 18, animationDelay: '.1s' }}>
          Connect with 1,200+ vetted freelance writers across 12 service categories — from SOPs and resumes to thesis chapters and B2B content. Plagiarism-free, NDA-protected, on time.
        </p>
        <div className="fade-up" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '.15s' }}>
          <button onClick={() => {
            if (session) {
              router.push(`/${session.user.role.toLowerCase()}`);
            } else {
              document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
            }
          }} className="btn-teal">Browse Services →</button>
          {!session && <Link className="btn-outline-teal" href="/login">Sign in / Sign up</Link>}
        </div>

        <div className="hero-stats fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32, marginTop: 72, maxWidth: 760, marginLeft: 'auto', marginRight: 'auto', animationDelay: '.2s' }}>
          {[
            { k: counts.orders.toLocaleString() + '+', l: 'Orders delivered' },
            { k: counts.writers.toLocaleString() + '+', l: 'Vetted writers' },
            { k: counts.rating + '/5', l: 'Avg. rating' },
            { k: '98%', l: 'On-time rate' },
          ].map((s, i) => (<div key={i}>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--teal-light)' }}>{s.k}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500, letterSpacing: '0.03em' }}>{s.l}</div>
          </div>))}
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = ['🎓 University of Cambridge applicants', '💼 Goldman Sachs alumni', '✈️ Canadian Embassy approved', '📚 Stanford GSB admits', '🚀 Y Combinator founders', '🏆 Fulbright scholars', '🌍 IELTS 8+ holders', '💎 LinkedIn Top Voices'];
  const doubled = [...items, ...items];
  return (
    <section style={{ padding: '40px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div style={{ textAlign: 'center', marginBottom: 18, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Trusted by professionals at</div>
      <div className="marquee">
        <div className="marquee-track">{doubled.map((it, i) => <div key={i} style={{ fontSize: 13.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 500 }}>{it}</div>)}</div>
        <div className="marquee-track" aria-hidden>{doubled.map((it, i) => <div key={i} style={{ fontSize: 13.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 500 }}>{it}</div>)}</div>
      </div>
    </section>);
}

function WritersMarketplace() {
  return (
    <section className="section" id="writers">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>The marketplace</div>
          <h2 className="h2" style={{ marginBottom: 14 }}>Hand-picked writers, <span className="gradient-text">real portfolios</span></h2>
          <p className="lead">Every writer is verified: PhD or 5+ years of professional experience, English fluency tested, sample work reviewed, NDA signed.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
          {WRITERS.map((w, i) => (<div key={i} className="card" style={{ padding: '22px 20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 54, height: 54, borderRadius: '50%', background: w.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#fff', flexShrink: 0, boxShadow: `0 0 0 3px ${w.c}25` }}>{w.av}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{w.n}</span>
                  <span style={{ fontSize: 11, color: '#fbbf24' }}>✓</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--teal-light)', fontWeight: 500 }}>{w.spec}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{w.exp}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14, flex: 1, alignContent: 'flex-start' }}>
              {w.tags.map((t, j) => <span key={j} style={{ padding: '3px 8px', borderRadius: 4, background: 'var(--surface2)', border: '1px solid var(--border2)', fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 500 }}>{t}</span>)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border2)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>⭐ {w.rate}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{w.badge}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-light)' }}>{w.price}</div>
                <Link href="/login" style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none' }}>Hire →</Link>
              </div>
            </div>
          </div>))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <Link className="btn-outline-teal" href="/login">Browse 1,200+ writers →</Link>
        </div>
      </div>
    </section>);
}

/* ─── FEATURES (Why us) ─── */
function Features() {
  return (
    <section className="section" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="container">
        <div className="section-head">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>Why Xpresswriters</div>
          <h2 className="h2" style={{ marginBottom: 14 }}>The fine print, <span className="gradient-text">in your favor</span></h2>
          <p className="lead">Six promises we put in writing. If we break one, the order is on us.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
          {FEATURES.map((f, i) => (<div key={i} style={{ padding: '24px 22px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 9, background: 'rgba(13,148,136,0.15)', border: '1px solid rgba(13,148,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{f.icon}</div>
            <div>
              <h3 className="h3" style={{ fontSize: 15, marginBottom: 6 }}>{f.t}</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 300, lineHeight: 1.6 }}>{f.d}</p>
            </div>
          </div>))}
        </div>
      </div>
    </section>);
}

/* ─── LIVE DASHBOARD PREVIEW ─── */
function DashboardPreview() {
  return (
    <section className="section">
      <div className="container dash-preview-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 48, alignItems: 'center' }}>
        <div>
          <div className="eyebrow">Your Command Center</div>
          <h2 className="h2" style={{ marginBottom: 18 }}>A real dashboard. <span className="gradient-text">Not an inbox.</span></h2>
          <p className="lead" style={{ marginBottom: 24 }}>Track every order, message every writer, download every invoice, manage every revision — all in one place. Live notifications, real-time status, transparent everything.</p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 28 }}>
            {['Live order tracking with milestones', 'Direct chat with your writer (1-on-1, no agents)', 'Invoices & receipts ready for tax filing', 'Notification center · Mobile-first design'].map((x, i) => (<li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, color: 'var(--text)' }}><span style={{ color: 'var(--teal-light)', fontWeight: 700, flexShrink: 0 }}>✓</span>{x}</li>))}
          </ul>
          <Link className="btn-teal" href="/login">See live demo →</Link>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {['#f43f5e', '#f59e0b', '#22c55e'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: 5, background: c }} />)}
            <div style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--text-dim)' }}>dashboard.xpresswriters.com</div>
          </div>
          {/* Stat tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
            {[
              { l: 'Active', v: '2', c: 'var(--teal-light)' },
              { l: 'Completed', v: '18', c: 'var(--green)' },
              { l: 'Spent', v: '$1.2k', c: 'var(--text)' },
            ].map((s, i) => (<div key={i} style={{ padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, fontWeight: 500, letterSpacing: '0.04em' }}>{s.l.toUpperCase()}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.c }}>{s.v}</div>
            </div>))}
          </div>
          {/* Live order strip */}
          <div style={{ padding: '14px 16px', background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.3)', borderRadius: 8, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>SOP — Stanford GSB</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>INV-2024-0184 · Dr. Amara Singh</div>
              </div>
              <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(13,148,136,0.2)', color: 'var(--teal-light)', fontSize: 10, fontWeight: 600 }}>In Progress</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--surface3)', overflow: 'hidden' }}><div style={{ width: '72%', height: '100%', background: 'linear-gradient(90deg,var(--teal),var(--teal-light))' }} /></div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 6, fontWeight: 600 }}>72% · 2 days remaining</div>
          </div>
          {/* Notification row */}
          <div style={{ padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--teal-light)', animation: 'pulse 2s ease infinite', flexShrink: 0 }} />
            <div style={{ fontSize: 11.5, flex: 1 }}><strong style={{ fontWeight: 600 }}>Marcus Webb</strong> <span style={{ color: 'var(--text-muted)' }}>sent you a new draft — Blog Post</span></div>
            <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>2m</span>
          </div>
        </div>
      </div>
    </section>);
}

/* ─── TESTIMONIALS ─── */
function Testimonials() {
  const [active, setActive] = useState(0);
  useEffect(() => { const t = setInterval(() => setActive(a => (a + 1) % TESTIMONIALS.length), 6000); return () => clearInterval(t); }, []);
  return (
    <section className="section" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="container">
        <div className="section-head">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>Real stories</div>
          <h2 className="h2" style={{ marginBottom: 14 }}>Work that <span className="gradient-text">moves careers</span></h2>
        </div>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          {TESTIMONIALS.map((t, i) => (<div key={i} style={{ display: i === active ? 'block' : 'none', textAlign: 'center', animation: 'fadeUp .5s ease both' }}>
            <div style={{ fontSize: 32, color: 'var(--teal)', marginBottom: 14, lineHeight: 1 }}>"</div>
            <p style={{ fontSize: 18, lineHeight: 1.6, fontWeight: 300, color: 'var(--text)', marginBottom: 26 }}>{t.q}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: t.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 14 }}>{t.n.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{t.n}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.r}</div>
              </div>
            </div>
          </div>))}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 36 }}>
            {TESTIMONIALS.map((_, i) => (<button key={i} onClick={() => setActive(i)} style={{ width: i === active ? 28 : 8, height: 8, borderRadius: 4, border: 'none', background: i === active ? 'var(--teal)' : 'var(--border)', cursor: 'pointer', transition: 'all .3s' }} />))}
          </div>
        </div>
      </div>
    </section>);
}

/* ─── BECOME A WRITER CTA ─── */
function WriterCTA() {
  return (
    <section className="section">
      <div className="container">
        <div className="writer-cta-grid" style={{ padding: '48px 40px', borderRadius: 14, background: 'linear-gradient(135deg,rgba(13,148,136,0.12),rgba(13,148,136,0.04))', border: '1px solid rgba(13,148,136,0.3)', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 36, alignItems: 'center' }}>
          <div>
            <div className="eyebrow">For freelancers</div>
            <h2 className="h2" style={{ marginBottom: 14 }}>Write for clients who <span className="gradient-text">actually pay on time</span></h2>
            <p className="lead" style={{ marginBottom: 22 }}>Join 1,200+ writers earning ₹40,000-2,00,000/month. Set your own rates, work on what you love, get paid in 48 hours.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link className="btn-teal" href="/register?role=freelancer">Apply to write →</Link>
              <Link className="btn-outline-teal" href="/login">See writer dashboard</Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { k: '₹2L+', l: 'Top earner/mo' },
              { k: '48 hr', l: 'Payout time' },
              { k: '0%', l: 'Hidden fees' },
              { k: '1,200+', l: 'Active writers' },
            ].map((s, i) => (<div key={i} style={{ padding: '18px 18px', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 10 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--teal-light)', letterSpacing: '-0.02em' }}>{s.k}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>{s.l}</div>
            </div>))}
          </div>
        </div>
      </div>
    </section>);
}

/* ─── FAQ ─── */
function FAQSection() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section" id="faq">
      <div className="container" style={{ maxWidth: 820 }}>
        <div className="section-head">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>Common questions</div>
          <h2 className="h2">Questions, <span className="gradient-text">answered honestly</span></h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQ.map((f, i) => (<div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <button onClick={() => setOpen(open === i ? -1 : i)} style={{ width: '100%', padding: '18px 22px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600, textAlign: 'left' }}>
              {f.q}
              <span style={{ fontSize: 18, color: 'var(--teal-light)', transition: 'transform .2s', transform: open === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
            </button>
            {open === i && <div style={{ padding: '0 22px 20px', fontSize: 13.5, color: 'var(--text-muted)', fontWeight: 300, lineHeight: 1.7, animation: 'fadeUp .25s ease both' }}>{f.a}</div>}
          </div>))}
        </div>
      </div>
    </section>);
}

/* ─── FINAL CTA ─── */
function FinalCTA() {
  const { data: session } = useSession();
  const router = useRouter();
  return (
    <section style={{ padding: '120px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,rgba(13,148,136,0.18) 0%,transparent 60%)', pointerEvents: 'none' }} />
      <div className="container" style={{ maxWidth: 720, position: 'relative' }}>
        <h2 className="h1" style={{ fontSize: 'clamp(32px,4.5vw,56px)', marginBottom: 20 }}>Ready to <span className="gradient-text">work with a real writer?</span></h2>
        <p className="lead" style={{ margin: '0 auto 32px', fontSize: 17 }}>Pick a service, brief your writer, watch it come together. The first revision is on us either way.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => {
            if (session) {
              router.push(`/${session.user.role.toLowerCase()}`);
            } else {
              router.push('/login');
            }
          }} className="btn-teal" style={{ fontSize: 15, padding: '16px 32px' }}>Browse Services →</button>
          {!session && <Link className="btn-outline-teal" style={{ fontSize: 15, padding: '15px 30px' }} href="/login">Track an order</Link>}
        </div>
      </div>
    </section>);
}

/* ─── NAVBAR ─── */
/* ─── APP COMBINED ─── */
export default function App() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [openProd, setOpenProd] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/services?type=catalog', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const list = data.map(s => {
            const basePrice = s.priceMin || s.basePrice || 2499;
            let variants = s.variants || [];
            if (variants.length === 0) {
              variants = [
                { id: (s.slug || s.id) + '_standard', label: 'Standard Tier', words: '500 words', delivery: '3-4 days', price: basePrice, fast: Math.round(basePrice * 0.4), addon: 499, custom: 799 },
                { id: (s.slug || s.id) + '_premium', label: 'Premium Tier', words: '1000 words', delivery: '2-3 days', price: basePrice + 1500, fast: Math.round((basePrice + 1500) * 0.4), addon: 499, custom: 799, ats: s.category?.toLowerCase() === 'resume' ? 299 : undefined }
              ];
            }
            return {
              id: s.slug || s.id,
              cat: s.category || 'Academic',
              icon: s.icon || '📄',
              name: s.name,
              tagline: s.tagline || s.description,
              desc: s.description,
              delivery: '3-5 days',
              variants
            };
          });
          setCatalog(list);
          const uniqueCats = [...new Set(list.map(s => s.cat))];
          setCategories(uniqueCats.map(c => ({
            id: c.toLowerCase(),
            label: c,
            icon: c.toLowerCase().includes('sop') ? '🎓' : c.toLowerCase().includes('lor') ? '📜' : c.toLowerCase().includes('resume') ? '💼' : '📄'
          })));
        }
      })
      .catch(err => console.error("Failed to load catalog:", err));
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('xw_cart');
      if (stored) setCart(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('xw_cart', JSON.stringify(cart));
  }, [cart]);

  const filtered = useMemo(() => catalog.filter(p => {
    if (activeCat !== 'all' && p.cat !== activeCat) return false;
    if (search && !`${p.name} ${p.tagline} ${p.cat}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [activeCat, search, catalog]);

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
      <Hero />
      <TrustBar />

      {/* Category bar */}
      <div id="services" style={{ position: 'sticky', top: 66, zIndex: 50, background: 'rgba(10,10,20,0.95)', backdropFilter: 'none', borderBottom: '1px solid var(--border)', padding: '14px 32px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 5, padding: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9, flexWrap: 'wrap' }}>
            <button onClick={() => setActiveCat('all')} style={{ padding: '7px 13px', borderRadius: 6, border: 'none', background: activeCat === 'all' ? 'var(--teal)' : 'transparent', color: activeCat === 'all' ? '#fff' : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all .15s' }}>All</button>
            {categories.map(c => (
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
      <div style={{ padding: '28px 32px 60px', maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <div><h2 className="h2" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{activeCat === 'all' ? 'All Services' : activeCat}</h2><div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{filtered.length} {filtered.length === 1 ? 'service' : 'services'} · All prices in INR</div></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {filtered.map(p => <ProductCard key={p.id} prod={p} onOpen={setOpenProd} />)}
        </div>
      </div>

            <Journey />
      <WritersMarketplace />
      <Features />
      <DashboardPreview />
      <Testimonials />
      <WriterCTA />
      <FAQSection />
      <FinalCTA />

      {/* Trust band */}
      <div style={{ padding: '40px 32px', background: 'linear-gradient(135deg,rgba(13,148,136,0.06),transparent)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="trust-band-grid" style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, textAlign: 'center' }}>
          {[
            ['🔒', '100% Confidential', 'NDA-grade privacy on every order'],
            ['🎓', 'PhD-level writers', '340+ verified domain experts'],
            ['↻', 'Unlimited revisions', '2 free revisions on every plan'],
            ['🤝', 'No-Risk Revisions', 'Unlimited edits within 7 days']
          ].map(([i, t, d]) => (
            <div key={t}><div style={{ fontSize: 28, marginBottom: 7 }}>{i}</div><div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{t}</div><div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 300 }}>{d}</div></div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)', paddingTop: 60, paddingBottom: 30 }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 32px', display: 'flex', flexWrap: 'wrap', gap: 60, justifyContent: 'space-between', marginBottom: 60 }}>
          <div style={{ maxWidth: 300 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--text)', marginBottom: 20 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg,var(--teal),#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff' }}>X</div>
              <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>Xpresswriters</span>
            </Link>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24, fontWeight: 300 }}>Premium content writing services connecting freelance experts with customers worldwide. Confidential, plagiarism-free, on-time.</p>
            <div style={{ display: 'flex', gap: 14, color: 'var(--text-dim)', fontSize: 14 }}>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>𝕏</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>in</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>📸</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>✉</a>
            </div>
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
                <a href="/samples" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Samples</a>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 20 }}>LEGAL</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <a href="/legal#terms" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</a>
                <a href="/legal#privacy" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
                <a href="/legal#refund" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Refund Policy</a>
                <a href="/legal#cookie" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Cookie Policy</a>
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
