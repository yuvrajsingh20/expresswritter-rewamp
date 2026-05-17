"use client";
import React, { useState } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import '@/app/(auth)/landing.css';
import Link from 'next/link';

export default function HelpPage() {
  const [activeCat, setActiveCat] = useState('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqs, setOpenFaqs] = useState({});

  const toggleFaq = (index) => {
    setOpenFaqs(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const categories = [
    { id: 'orders', label: '📋 Orders & Delivery', count: 14, icon: '📋' },
    { id: 'payments', label: '💳 Payments & Billing', count: 9, icon: '💳', color: 'var(--amber)' },
    { id: 'refunds', label: '💸 Revisions & Policies', count: 11, icon: '💸', color: 'var(--red)' },
    { id: 'account', label: '🔐 Account & Security', count: 12, icon: '🔐', color: 'var(--violet)' },
    { id: 'quality', label: '✓ Quality & Plagiarism', count: 8, icon: '✓', color: 'var(--green)' },
    { id: 'writers', label: '✍️ For Writers', count: 15, icon: '✍️', color: 'var(--blue)' },
    { id: 'samples', label: '📄 Samples & Pricing', count: 7, icon: '📄' },
  ];

  const faqs = {
    orders: [
      { q: "How do I place an order?", a: "Browse all services, pick a variant, add any optional fast-track or +500 words add-ons, then proceed to checkout. You'll write your brief during checkout, pay securely, and a matching writer is assigned within 30 minutes (or 5 minutes for fast-track orders)." },
      { q: "What's the typical turnaround time?", a: "Standard delivery is 3–5 business days for orders under 2,000 words. Fast-track (+50% surcharge) reduces this to 24–48 hours. Larger projects (thesis, books) follow a milestone-based schedule agreed during the brief." },
      { q: "Can I change my brief after ordering?", a: "Yes, until your writer accepts the order. Once accepted, small clarifications can be sent via in-app chat. Major scope changes may require a top-up payment — your writer will let you know upfront." },
      { q: "How will I know when my order is ready?", a: "You'll receive notifications via the platform, email, and (if enabled) WhatsApp. The status will move to Delivered on your dashboard, and you'll have 14 days to review before payment is auto-released." },
      { q: "Can I pick a specific writer?", a: "Yes — Pro members can request any writer they've worked with before from Dashboard → My Writers. Otherwise our matching algorithm assigns the best-fit writer based on subject expertise and current workload." },
      { q: "What file formats do you deliver in?", a: "By default: DOCX, PDF, and plain text. For LinkedIn or web content we also provide formatted HTML. Specify in your brief if you need anything else (Markdown, LaTeX, etc.)." },
    ],
    payments: [
      { q: "What payment methods do you accept?", a: "India: Razorpay handles UPI (GPay, PhonePe, Paytm), all major debit/credit cards, net-banking, and EMI on orders above ₹3,000. International: Stripe for cards, Apple Pay, Google Pay, and SEPA. Crypto via partner gateway for orders above $200." },
      { q: "Is GST included?", a: "All listed prices are exclusive of 18% GST as per Indian tax law. The full breakdown (subtotal + platform fee + GST) is shown at checkout, and a GST-compliant invoice is auto-generated." },
      { q: "Can I get an invoice with my company name?", a: "Yes. Add your company name and GSTIN in Settings → Billing before placing the order. All future invoices will use these details and you can claim input tax credit." },
      { q: "Do you support multiple currencies?", a: "Pricing is shown in INR by default. We auto-detect your country and show converted prices in USD, EUR, GBP, AUD, or CAD. The final charge is processed in your local currency by Stripe." },
    ],
    refunds: [
      { q: "What's your refund policy?", a: "Monetary refunds are only possible if we cannot match you with a qualified writer for your project. Once work has been completed and delivered, all sales are final and we do not offer refunds. However, we guarantee your satisfaction via our No-Risk Revisions policy." },
      { q: "How many revisions are included?", a: "Up to 3 free revisions within 14 days of delivery. After that, additional revisions are billed at the per-100-word rate of your service tier. Substantial scope changes are quoted separately." },
      { q: "How long do pre-delivery cancellations/refunds take?", a: "Pre-delivery cancellations are credited to your platform wallet instantly. Bank/card reversals for unassigned orders take 5–7 business days depending on your bank." },
      { q: "Can I cancel after the writer has started?", a: "Yes, but only before delivery. If a writer has already been assigned and started drafting, cancellations are eligible for a 70% pro-rated wallet credit to compensate the writer for their time. Once delivered, all sales are final." },
    ],
    account: [
      { q: "How do I reset my password?", a: "Go to Sign in → \"Forgot password\" — enter your email and we'll send a reset link. The link expires in 1 hour." },
      { q: "How do I enable two-factor authentication?", a: "In Settings → Security → Two-Factor Authentication. We support TOTP apps (Google Authenticator, Authy), SMS, and email codes. We strongly recommend an authenticator app over SMS." },
      { q: "How do I delete my account?", a: "Settings → Account → Delete account. We immediately suspend access and queue your data for deletion within 30 days (or longer where tax law requires retention). Active orders must be completed first." },
      { q: "Can I download all my data?", a: "Yes — Settings → Privacy → Export my data. You'll receive a ZIP with your profile, orders, messages, and invoices in JSON + DOCX formats within 24 hours." },
      { q: "What if I see a sign-in I didn't make?", a: "Immediately: Settings → Security → Active Sessions → \"Sign out everywhere\", then change your password. Contact security@xpresswriters.com and we'll audit your account." },
    ],
    quality: [
      { q: "Do you check for plagiarism?", a: "Yes — every order is scanned with Turnitin (or Copyscape for non-academic work). We guarantee under 10% similarity. The full report is attached to your delivery email." },
      { q: "Do you use AI to write?", a: "Our writers are human. AI tools may be used as research assistants, but every deliverable is written by the assigned writer and scanned with GPTZero + Originality.ai to keep AI-detection scores under 15%." },
      { q: "How are writers vetted?", a: "4-step gauntlet: degree verification → portfolio review → 90-minute skill test (writing + grammar + subject-matter) → 3 supervised paid trial orders. Only 8% of applicants pass." },
    ],
    writers: [
      { q: "How do I become a writer?", a: "Apply via our onboarding flow. You'll upload your portfolio, take a 90-min skill test, and complete 3 supervised trial orders before going live." },
      { q: "How much can I earn?", a: "Active writers earn ₹40,000–₹2,50,000/month depending on speciality and availability. Pay ranges from ₹0.80/word (entry) to ₹4.50/word (PhD/medical). Top earners take on 4–8 orders/week." },
      { q: "When are payouts processed?", a: "Weekly, every Monday — funds are released 7 days after order delivery (the client review window). Direct UPI/IMPS within India, Wise/PayPal internationally." },
      { q: "Can I choose which orders to take?", a: "Yes. Orders matching your speciality appear in your dashboard; you have 30 minutes to accept before they go to the next-best-fit writer. No penalty for declining." },
    ],
    samples: [
      { q: "Can I see sample work?", a: "Yes — every category has watermarked samples on its product page. Pro members get access to our private gallery of 500+ examples across SOPs, LORs, blogs, and visa documents." },
      { q: "Why is your pricing tiered by service?", a: "An MBA admissions essay requires different expertise than a blog post. We tier by speciality so you pay fair-market rates for the level of writer your project needs — no inflated \"premium tier\" tricks." },
    ],
  };

  const filteredFaqs = searchQuery 
    ? Object.values(faqs).flat().filter(item => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs[activeCat];

  return (
    <div className="landing-page-container">
      <PublicNavbar />
      <style dangerouslySetInnerHTML={{ __html: `
        .help-hero{padding:140px 32px 48px;text-align:center;background:radial-gradient(60% 80% at 50% 0%,rgba(13,148,136,0.15),transparent);border-bottom:1px solid var(--border)}
        .help-hero h1{font-size:42px;font-weight:700;letter-spacing:-0.02em;margin-bottom:10px}
        .help-hero p{font-size:15px;color:var(--text-muted);max-width:560px;margin:0 auto 28px;font-weight:300}
        .help-search{max-width:640px;margin:0 auto;position:relative}
        .help-search input{width:100%;padding:18px 22px 18px 52px;border-radius:12px;background:var(--surface);border:1px solid var(--border);color:var(--text);font-size:15px;outline:none;font-family:var(--font);transition:border .15s}
        .help-search input:focus{border-color:var(--teal)}
        .help-search .help-ico{position:absolute;left:20px;top:50%;transform:translateY(-50%);font-size:18px;color:var(--text-dim)}
        .help-shortcuts{max-width:1080px;margin:36px auto 0;padding:0 32px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
        .help-shortcut{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:18px 18px;text-decoration:none;color:var(--text);transition:all .15s;display:flex;flex-direction:column;gap:8px}
        .help-shortcut:hover{border-color:var(--teal);transform:translateY(-1px)}
        .shortcut-icon-box{width:38px;height:38px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px}
        .help-shortcut h3{font-size:13.5px;font-weight:700}
        .help-shortcut p{font-size:11.5px;color:var(--text-muted);font-weight:300;line-height:1.5}
        .help-main{max-width:1080px;margin:48px auto;padding:0 32px;display:grid;grid-template-columns:240px 1fr;gap:48px}
        .help-side{position:sticky;top:100px;align-self:start}
        .help-side h4{font-size:10.5px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px}
        .help-side a{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:6px;color:var(--text-muted);text-decoration:none;font-size:13px;transition:all .15s;margin-bottom:1px;cursor:pointer}
        .help-side a:hover, .help-side a.active{background:rgba(13,148,136,0.12);color:var(--teal-light)}
        .help-side a .help-count{margin-left:auto;font-size:10.5px;color:var(--text-dim);background:var(--surface);padding:2px 7px;border-radius:8px}
        .cat-title-box{display:flex;align-items:center;gap:12px;margin-bottom:6px}
        .cat-title-box .ico-box{width:36px;height:36px;border-radius:8px;background:rgba(13,148,136,0.15);color:var(--teal-light);display:flex;align-items:center;justify-content:center;font-size:16px}
        .cat-title-box h2{font-size:22px;font-weight:700;letter-spacing:-0.01em}
        .cat-subtitle{font-size:13px;color:var(--text-muted);margin-bottom:22px;font-weight:300}
        .faq-box{background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:30px}
        .faq-q{padding:16px 20px;border-bottom:1px solid var(--border2);cursor:pointer;display:flex;justify-content:space-between;align-items:flex-start;gap:14px;transition:background .15s}
        .faq-q:last-child{border-bottom:none}
        .faq-q:hover{background:var(--surface2)}
        .faq-q.open-q{background:var(--surface2)}
        .faq-q h3{font-size:14px;font-weight:600;flex:1}
        .faq-q .faq-arr{font-size:12px;color:var(--text-muted);transition:transform .2s;flex-shrink:0;margin-top:2px}
        .faq-q.open-q .faq-arr{transform:rotate(180deg);color:var(--teal-light)}
        .faq-a{max-height:0;overflow:hidden;transition:all .25s ease;padding:0 20px;font-size:13px;color:var(--text-muted);line-height:1.7;font-weight:300}
        .faq-q.open-q + .faq-a{max-height:600px;padding:0 20px 18px}
        .help-contact-cta{max-width:1080px;margin:0 auto 60px;padding:0 32px}
        .cta-box-gradient{background:linear-gradient(135deg,rgba(13,148,136,0.12),rgba(13,148,136,0.04));border:1px solid rgba(13,148,136,0.3);border-radius:14px;padding:36px 40px;display:flex;justify-content:space-between;align-items:center;gap:30px;flex-wrap:wrap}
        .cta-box-gradient h3{font-size:22px;font-weight:700;letter-spacing:-0.01em;margin-bottom:6px}
        .cta-box-gradient p{font-size:13px;color:var(--text-muted);font-weight:300}
        .cta-actions{display:flex;gap:10px}
        .help-btn{padding:11px 20px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:7px;transition:all .15s}
        .btn-primary-help{background:var(--teal);color:#fff;border:1px solid var(--teal)}
        .btn-primary-help:hover{background:var(--teal-dark)}
        .btn-outline-help{background:transparent;color:var(--text);border:1px solid var(--border)}
        .btn-outline-help:hover{border-color:var(--teal);color:var(--teal-light)}
        @media (max-width:780px){.help-main{grid-template-columns:1fr}.help-shortcuts{grid-template-columns:1fr 1fr}}
      ` }} />

      <div className="help-hero">
        <h1>How can we help?</h1>
        <p>Browse 80+ articles, ask the AI assistant, or talk to a human — we usually reply within an hour.</p>
        <div className="help-search">
          <span className="help-ico">🔍</span>
          <input 
            placeholder="Search e.g. 'change my password', 'refund', 'plagiarism report'…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="help-shortcuts">
        <Link href="/track" className="help-shortcut"><div className="shortcut-icon-box" style={{background:'rgba(13,148,136,0.15)',color:'var(--teal-light)'}}>📦</div><h3>Track an Order</h3><p>Check status without logging in</p></Link>
        <a onClick={() => setActiveCat('refunds')} className="help-shortcut" style={{cursor:'pointer'}}><div className="shortcut-icon-box" style={{background:'rgba(244,63,94,0.15)',color:'var(--red)'}}>💸</div><h3>Revisions &amp; Policies</h3><p>No-risk edits guarantee</p></a>
        <a onClick={() => setActiveCat('account')} className="help-shortcut" style={{cursor:'pointer'}}><div className="shortcut-icon-box" style={{background:'rgba(167,139,250,0.15)',color:'var(--violet)'}}>🔐</div><h3>Account &amp; Login</h3><p>Password, MFA, devices</p></a>
        <Link href="/about#contact" className="help-shortcut"><div className="shortcut-icon-box" style={{background:'rgba(34,197,94,0.15)',color:'var(--green)'}}>💬</div><h3>Contact Support</h3><p>Email, WhatsApp, or call</p></Link>
      </div>

      <div className="help-main">
        <aside className="help-side">
          <h4>Categories</h4>
          {categories.map(cat => (
            <a 
              key={cat.id} 
              className={activeCat === cat.id && !searchQuery ? 'active' : ''}
              onClick={() => { setActiveCat(cat.id); setSearchQuery(''); }}
            >
              {cat.label} <span className="help-count">{cat.count}</span>
            </a>
          ))}
          <h4 style={{marginTop:'24px'}}>Resources</h4>
          <Link href="/legal">⚖ Legal Documents</Link>
          <a href="#">📖 Writing Tips Blog</a>
          <a href="#">🎓 University Guides</a>
          <a href="#">🛠 API Docs</a>
        </aside>

        <main>
          <div className="cat-title-box">
            <div className="ico-box" style={{background: categories.find(c => c.id === activeCat)?.color ? categories.find(c => c.id === activeCat).color + '26' : 'rgba(13,148,136,0.15)', color: categories.find(c => c.id === activeCat)?.color || 'var(--teal-light)'}}>
              {categories.find(c => c.id === activeCat)?.icon || '📋'}
            </div>
            <h2>{searchQuery ? `Search results for "${searchQuery}"` : categories.find(c => c.id === activeCat)?.label.split(' ').slice(1).join(' ')}</h2>
          </div>
          <p className="cat-subtitle">{searchQuery ? `Found ${filteredFaqs.length} results` : `Everything about ${categories.find(c => c.id === activeCat)?.label.split(' ').slice(1).join(' ').toLowerCase()}.`}</p>
          
          <div className="faq-box">
            {filteredFaqs.length > 0 ? filteredFaqs.map((faq, idx) => (
              <React.Fragment key={idx}>
                <div 
                  className={`faq-q ${openFaqs[idx] ? 'open-q' : ''}`} 
                  onClick={() => toggleFaq(idx)}
                >
                  <h3>{faq.q}</h3>
                  <span className="faq-arr">▼</span>
                </div>
                <div className="faq-a">
                  <p dangerouslySetInnerHTML={{ __html: faq.a }} />
                </div>
              </React.Fragment>
            )) : (
              <div style={{padding:'40px', textAlign:'center', color:'var(--text-muted)'}}>No results found for your search.</div>
            )}
          </div>
        </main>
      </div>

      <div className="help-contact-cta">
        <div className="cta-box-gradient">
          <div>
            <h3>Still need help?</h3>
            <p>Our support team is online 24/7 and replies in under an hour on average.</p>
          </div>
          <div className="cta-actions">
            <Link href="/about#contact" className="help-btn btn-outline-help">📧 Email us</Link>
            <Link href="/about#contact" className="help-btn btn-primary-help">💬 Start live chat</Link>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
