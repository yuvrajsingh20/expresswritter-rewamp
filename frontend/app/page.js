"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import './(auth)/landing.css';

/* ─── DATA ─── */
const STATS = [
  { k: '12,400+', l: 'Orders Delivered' },
  { k: '1,200+', l: 'Vetted Writers' },
  { k: '4.9 / 5', l: 'Avg. Rating' },
  { k: '98%', l: 'On-Time Rate' },
];

const SERVICES = [
  { icon: '🎓', cat: 'Academic', name: 'Statement of Purpose', price: 'from ₹4,499', desc: 'Admission-ready SOPs for Bachelors, Masters, MBA & PhD', pop: true },
  { icon: '📝', cat: 'Academic', name: 'Personal Statement', price: 'from ₹2,499', desc: 'UK, EU & global admission essays' },
  { icon: '📜', cat: 'Academic', name: 'Letters of Recommendation', price: 'from ₹1,499', desc: 'Faculty, employer, supervisor LORs' },
  { icon: '🛂', cat: 'Visa', name: 'Visa SOP & Appeals', price: 'from ₹3,999', desc: 'Country-specific Visa SOPs · rejection appeals', pop: true },
  { icon: '✉️', cat: 'Visa', name: 'Invitation Letters', price: 'from ₹699', desc: 'Embassy-grade visit visa documents' },
  { icon: '💼', cat: 'Career', name: 'Resume & CV', price: 'from ₹1,999', desc: 'ATS-optimized resumes for every industry', pop: true },
  { icon: '💎', cat: 'Career', name: 'LinkedIn Profile', price: 'from ₹1,499', desc: 'Full rewrite with keyword strategy' },
  { icon: '📖', cat: 'Career', name: 'Cover Letters', price: 'from ₹899', desc: 'Tailored to each role and ATS-friendly' },
  { icon: '✍️', cat: 'Content', name: 'Blog & SEO Articles', price: 'from ₹0.50/word', desc: 'Long-form, SEO-optimized content' },
  { icon: '🧬', cat: 'Content', name: 'Thesis & Dissertation', price: 'from ₹15,000', desc: 'PhD-level research writing & editing' },
  { icon: '📊', cat: 'Business', name: 'Business Proposals', price: 'from ₹4,999', desc: 'Pitch decks, RFPs, investor proposals' },
  { icon: '📑', cat: 'Business', name: 'White Papers & Reports', price: 'from ₹0.80/word', desc: 'Authoritative B2B and research reports' },
  { icon: '🗽', cat: 'Visa', name: 'B1B2 Visa Support', price: '₹25,000', desc: 'Complete B1/B2 assistance including slot booking & mocks' },
  { icon: '📜', cat: 'Business', name: 'GMAT/GRE Waiver', price: '₹1,499', desc: 'Professional letters to waive standardized test requirements' },
  { icon: '💸', cat: 'Business', name: 'App Fee Waiver', price: '₹1,499', desc: 'Request application fee waivers professionally' },
  { icon: '🖋️', cat: 'Content', name: 'Media Write-up', price: 'TBD', desc: 'Professional write-ups for media, news, and magazines' },
  { icon: '🎓', cat: 'Academic', name: 'Scholarship Essay', price: 'TBD', desc: 'Compelling essays for securing university funding' },
  { icon: '✉️', cat: 'Career', name: 'Email Templates', price: '₹399', desc: 'Professional templates for networking and outreach' }
];

const STEPS = [
  { n: '01', t: 'Choose Service', d: 'Pick from 12 categories. Clear pricing, real timelines, no surprises.', icon: '🎯' },
  { n: '02', t: 'Brief Your Writer', d: 'Upload your requirements. Smart matching pairs you with a vetted expert.', icon: '📋' },
  { n: '03', t: 'Track in Real-Time', d: 'Watch progress, message your writer, request milestones from your dashboard.', icon: '📡' },
  { n: '04', t: 'Approve & Pay', d: 'Get unlimited revisions on your draft. Pay only when you\'re 100% happy.', icon: '✓' },
];

const WRITERS = [
  { n: 'Dr. Amara Singh', av: 'AS', c: '#0d9488', spec: 'SOP · MBA Admissions', exp: '9 yrs · 340 orders', rate: 4.98, price: '₹7,999+', badge: 'Elite', tags: ['PhD Stanford', 'Wharton MBA', 'Top 1%'] },
  { n: 'Marcus Webb', av: 'MW', c: '#3b82f6', spec: 'Content · SEO', exp: '7 yrs · 520 orders', rate: 4.92, price: '₹0.60/word', badge: 'Top Writer', tags: ['SaaS', 'Fintech', 'B2B'] },
  { n: 'Sofía Ramírez', av: 'SR', c: '#a78bfa', spec: 'Thesis · Research', exp: '12 yrs · 180 orders', rate: 5.0, price: '₹18,000+', badge: 'PhD', tags: ['Sciences', 'APA/MLA', 'LaTeX'] },
  { n: 'James Chen', av: 'JC', c: '#f59e0b', spec: 'Resume · LinkedIn', exp: '6 yrs · 680 orders', rate: 4.95, price: '₹2,499+', badge: 'Top Writer', tags: ['Tech', 'FAANG', 'Executive'] },
  { n: 'Priya Mehta', av: 'PM', c: '#22c55e', spec: 'Visa SOP · LOR', exp: '5 yrs · 410 orders', rate: 4.96, price: '₹3,999+', badge: 'Verified', tags: ['Canada', 'Australia', 'UK'] },
  { n: 'Daniel Okonkwo', av: 'DO', c: '#f43f5e', spec: 'Business Proposals', exp: '10 yrs · 220 orders', rate: 4.94, price: '₹6,999+', badge: 'Elite', tags: ['VC Pitches', 'RFPs', 'Strategy'] },
];

const FEATURES = [
  { icon: '🛡️', t: 'Plagiarism-Free Guarantee', d: 'Turnitin-style report included on every delivery. 100% original or refund.' },
  { icon: '🔒', t: 'NDA-Protected', d: 'Every writer signs a confidentiality agreement. Your work is yours, forever.' },
  { icon: '⚡', t: 'Express Delivery', d: '24-hour rush option available on most services. Late = full refund, no questions.' },
  { icon: '♾️', t: 'Unlimited Revisions', d: 'Revise until you\'re satisfied. We don\'t close orders until you say so.' },
  { icon: '💬', t: 'Direct Writer Chat', d: 'Talk to your writer 1-on-1 inside our messaging platform. No middlemen.' },
  { icon: '💸', t: 'Money-Back Promise', d: 'Not happy after revisions? Full refund within 7 days, no fine print.' },
];

const TESTIMONIALS = [
  { q: 'My SOP went from rejections to Stanford, Wharton, and LBS admits in one cycle. The writer understood my engineering background and translated it into a story admissions actually wanted to read.', n: 'Meera Krishnan', r: "Admitted Stanford MBA '26", c: '#0d9488' },
  { q: "I've worked with three other content agencies. Xpresswriters is the first one where I didn't have to rewrite half the draft. They actually researched our space.", n: 'Daniel Park', r: 'Marketing Director, FinTech SaaS', c: '#3b82f6' },
  { q: 'My Canadian visa was rejected twice. The appeal SOP from Priya got me approved in 3 weeks. I genuinely cannot recommend this service enough — they saved my career path.', n: 'Aditi Kapoor', r: 'Software Engineer, Toronto', c: '#a78bfa' },
];

const FAQ = [
  { q: 'How is Xpresswriters different from other writing services?', a: "We're a marketplace, not a content mill. You see the actual writer's profile, ratings, and portfolio before you hire. Every order has a real human accountable to you — no anonymous teams, no rewrites by junior staff." },
  { q: 'Is the work AI-generated?', a: 'No. We\'re an AI-detection-friendly platform — every delivery passes GPTZero, Originality.ai, and Turnitin. Writers may use AI as a research tool, but the writing is human and original.' },
  { q: "What if I'm not happy with the draft?", a: "Unlimited free revisions within scope. If that still doesn't work, you can request a writer change or a full refund within 7 days of delivery — no questions, no fine print." },
  { q: 'How fast can you deliver?', a: 'Most services have a 24-48 hour express option. A 1,500-word SOP can be turned around in 24 hours; complex thesis chapters need 5-10 days. Every product page shows exact timelines.' },
  { q: 'Do you guarantee admission / visa approval?', a: 'No ethical writing service can guarantee outcomes — those depend on your profile, target school, and a dozen other factors. What we guarantee is the highest-quality document we can produce for your case.' },
];

/* ─── HERO ─── */
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
    <section style={{ position: 'relative', minHeight: '82vh', padding: '80px 32px 100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
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

        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32, marginTop: 72, maxWidth: 760, marginLeft: 'auto', marginRight: 'auto', animationDelay: '.2s' }}>
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
    </section>);
}

/* ─── TRUST MARQUEE ─── */
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

/* ─── SERVICES GRID ─── */
function ServiceModal({ service, onClose }) {
  const router = useRouter();
  if (!service) return null;

  const handleOrder = () => {
    localStorage.setItem('pendingOrder', JSON.stringify({ category: service.name }));
    router.push('/login');
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, maxWidth: 500, width: '100%', position: 'relative', animation: 'fadeUp 0.3s ease' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 24, cursor: 'pointer' }}>&times;</button>
        <div style={{ width: 60, height: 60, borderRadius: 12, background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 20 }}>{service.icon}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal-light)', textTransform: 'uppercase', marginBottom: 8 }}>{service.cat}</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{service.name}</h2>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>{service.desc}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '16px', background: 'var(--surface2)', borderRadius: 12 }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Estimated Price</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--teal-light)' }}>{service.price}</span>
        </div>
        <button onClick={handleOrder} className="btn-teal" style={{ width: '100%', justifyContent: 'center' }}>Order this Service →</button>
      </div>
    </div>
  );
}

function Services() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedService, setSelectedService] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const cats = ['All', 'Academic', 'Visa', 'Career', 'Content', 'Business'];
  const [tab, setTab] = useState('All');
  const filtered = tab === 'All' ? SERVICES : SERVICES.filter(s => s.cat === tab);
  const displayServices = expanded ? filtered : filtered.slice(0, 12);
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>What we write</div>
          <h2 className="h2" style={{ marginBottom: 14 }}>Every type of content, <span className="gradient-text">crafted by experts</span></h2>
          <p className="lead">12 service categories, transparent pricing, real human writers — not AI. Browse below or jump to the catalog.</p>
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 36, flexWrap: 'wrap' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setTab(c)} style={{ padding: '8px 16px', borderRadius: 7, border: tab === c ? '1.5px solid var(--teal)' : '1.5px solid var(--border)', background: tab === c ? 'rgba(13,148,136,0.12)' : 'transparent', color: tab === c ? 'var(--teal-light)' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s' }}>{c}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {displayServices.map((s, i) => (
            <div key={i} onClick={() => {
              if (session) {
                router.push('/student?tab=new-order');
              } else {
                setSelectedService(s);
              }
            }} className="card" style={{ cursor: 'pointer', textDecoration: 'none', color: 'var(--text)', position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {s.pop && <div style={{ position: 'absolute', top: 14, right: 14, padding: '3px 8px', borderRadius: 4, background: 'rgba(13,148,136,0.15)', border: '1px solid rgba(13,148,136,0.3)', color: 'var(--teal-light)', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em' }}>POPULAR</div>}
              <div style={{ width: 42, height: 42, borderRadius: 9, background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{s.cat}</div>
              <h3 className="h3" style={{ fontSize: 16 }}>{s.name}</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 300, lineHeight: 1.55, flex: 1 }}>{s.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 12, borderTop: '1px solid var(--border2)' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-light)' }}>{s.price}</span>
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Details →</span>
              </div>
            </div>))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          {!expanded ? (
            <button className="btn-outline-teal" onClick={() => {
              if (session) {
                router.push('/student?tab=new-order');
              } else {
                setExpanded(true);
                const grid = document.querySelector('.section-head');
                if (grid) grid.scrollIntoView({ behavior: 'smooth' });
              }
            }}>View all {SERVICES.length} services & pricing ↓</button>
          ) : (
            <button className="btn-outline-teal" onClick={() => setExpanded(false)}>Show Less ↑</button>
          )}
        </div>
        <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />
      </div>
    </section>);
}

/* ─── HOW IT WORKS ─── */
function HowItWorks() {
  return (
    <section className="section" style={{ background: 'linear-gradient(180deg,transparent,rgba(13,148,136,0.04),transparent)' }} id="how">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>Process</div>
          <h2 className="h2" style={{ marginBottom: 14 }}>From brief to delivery in <span className="gradient-text">four clean steps</span></h2>
          <p className="lead">No back-and-forth emails, no opaque pricing, no surprises. Every step happens inside your dashboard.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, position: 'relative' }}>
          {STEPS.map((s, i) => (<div key={i} className="card" style={{ padding: '24px 22px', position: 'relative' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-dim)', marginBottom: 12 }}>STEP {s.n}</div>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>{s.icon}</div>
            <h3 className="h3" style={{ fontSize: 17, marginBottom: 8 }}>{s.t}</h3>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 300, lineHeight: 1.6 }}>{s.d}</p>
          </div>))}
        </div>
      </div>
    </section>);
}

/* ─── WRITERS MARKETPLACE ─── */
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
          {WRITERS.map((w, i) => (<div key={i} className="card" style={{ padding: '22px 20px' }}>
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
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
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 48, alignItems: 'center' }}>
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
        <div style={{ padding: '48px 40px', borderRadius: 14, background: 'linear-gradient(135deg,rgba(13,148,136,0.12),rgba(13,148,136,0.04))', border: '1px solid rgba(13,148,136,0.3)', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 36, alignItems: 'center' }}>
          <div>
            <div className="eyebrow">For freelancers</div>
            <h2 className="h2" style={{ marginBottom: 14 }}>Write for clients who <span className="gradient-text">actually pay on time</span></h2>
            <p className="lead" style={{ marginBottom: 22 }}>Join 1,200+ writers earning ₹40,000-2,00,000/month. Set your own rates, work on what you love, get paid in 48 hours.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link className="btn-teal" href="/login">Apply to write →</Link>
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
function Navbar() {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(13, 13, 26, 0.8)', backdropFilter: 'blur(10px)', zIndex: 100, borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: 20, color: 'var(--text)', textDecoration: 'none' }}>Xpresswriters</Link>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>About</Link>
          <Link href="/help" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>Help</Link>
          <Link href="/legal" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>Legal</Link>
          <Link href="/products" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>Products</Link>
          <Link href="/report" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>Report</Link>
          <Link href="/review" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>Review</Link>
          <Link href="/track" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>Track</Link>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link href="/login" className="btn-outline-teal">Login</Link>
        <Link href="/login" className="btn-teal">Get Started</Link>
      </div>
    </nav>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <>
      {/* Trust band */}
      <div style={{padding:'40px 32px',background:'linear-gradient(135deg,rgba(13,148,136,0.06),transparent)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
        <div style={{maxWidth:1320,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:24,textAlign:'center'}}>
          {[['🔒','100% Confidential','NDA-grade privacy on every order'],['🎓','PhD-level writers','340+ verified domain experts'],['↻','Unlimited revisions','2 free revisions on every plan'],['💰','Money-back guarantee','Full refund within 14 days']].map(([i,t,d])=>(<div key={t}><div style={{fontSize:28,marginBottom:7}}>{i}</div><div style={{fontSize:13,fontWeight:700,marginBottom:3}}>{t}</div><div style={{fontSize:11.5,color:'var(--text-muted)',fontWeight:300}}>{d}</div></div>))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{padding:'40px 32px',textAlign:'center',color:'var(--text-dim)',fontSize:11.5}}>
        <div style={{marginBottom:6}}>© 2026 Xpresswriters Inc. · Made with care in Mumbai</div>
        <div style={{display:'flex',gap:18,justifyContent:'center',marginTop:10}}>
          <Link href="/dashboard" style={{color:'var(--text-muted)',textDecoration:'none'}}>Dashboard</Link>
          <Link href="/invoices" style={{color:'var(--text-muted)',textDecoration:'none'}}>Invoices</Link>
          <Link href="/notifications" style={{color:'var(--text-muted)',textDecoration:'none'}}>Notifications</Link>
          <Link href="/writer-onboarding" style={{color:'var(--text-muted)',textDecoration:'none'}}>Become a Writer</Link>
        </div>
      </footer>
    </>
  );
}

/* ─── APP ─── */
export default function App() {
  return (
    <div className="landing-page-container">
      <Navbar />
      <Hero />
      <TrustBar />
      <Services />
      <HowItWorks />
      <WritersMarketplace />
      <Features />
      <DashboardPreview />
      <Testimonials />
      <WriterCTA />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>);
}
