"use client";
import React, { useState, useEffect } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import '@/app/(auth)/landing.css';

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState('terms');

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setActiveTab(hash);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    
    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1) || 'terms';
      setActiveTab(newHash);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabClick = (e, tab) => {
    e.preventDefault();
    history.replaceState(null, '', '#' + tab);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="landing-page-container">
      <PublicNavbar />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .layout{display:grid;grid-template-columns:240px 1fr;gap:48px;max-width:1180px;margin:120px auto 0;padding:40px 32px 80px}
        .toc{position:sticky;top:100px;align-self:start;font-size:13px}
        .toc h4{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px}
        .toc ul{list-style:none;display:flex;flex-direction:column;gap:2px;padding:0}
        .toc a{display:block;padding:8px 12px;border-radius:6px;color:var(--text-muted);text-decoration:none;font-size:13px;transition:all .15s;cursor:pointer}
        .toc a:hover{background:var(--surface2);color:var(--text)}
        .toc a.active{background:rgba(13,148,136,0.15);color:var(--teal-light);font-weight:600}
        .doc{max-width:760px}
        .doc-hero{padding:20px 0 32px;border-bottom:1px solid var(--border);margin-bottom:32px}
        .doc-hero .eyebrow{display:inline-block;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--teal-light);padding:3px 9px;border-radius:4px;background:rgba(13,148,136,0.15);margin-bottom:12px}
        .doc-hero h1{font-size:36px;font-weight:700;letter-spacing:-0.02em;margin-bottom:8px;color:var(--text)}
        .doc-hero .meta{font-size:13px;color:var(--text-muted)}
        .doc section{display:none;animation:fade .25s ease}
        .doc section.active{display:block}
        @keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .doc section h2{font-size:22px;font-weight:700;letter-spacing:-0.01em;margin:32px 0 14px;color:var(--text)}
        .doc section h2:first-child{margin-top:0}
        .doc section h3{font-size:15px;font-weight:600;margin:22px 0 8px;color:var(--text)}
        .doc section p,.doc section li{font-size:14px;color:var(--text-muted);line-height:1.7;font-weight:300}
        .doc section p{margin-bottom:12px}
        .doc section ul,.doc section ol{padding-left:22px;margin-bottom:14px}
        .doc section li{margin-bottom:6px}
        .doc section strong{color:var(--text);font-weight:600}
        .callout{padding:16px 20px;border-radius:8px;background:rgba(13,148,136,0.06);border:1px solid rgba(13,148,136,0.2);margin:18px 0;font-size:13px}
        .callout.warn{background:rgba(245,158,11,0.06);border-color:rgba(245,158,11,0.2)}
        .callout strong{display:block;margin-bottom:4px;color:var(--text)}
        .doc table{width:100%;border-collapse:collapse;margin:14px 0;font-size:13px}
        .doc th,.doc td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--border2);color:var(--text-muted)}
        .doc th{font-weight:600;color:var(--text);background:var(--surface)}
        .print-bar{position:fixed;top:64px;left:0;right:0;z-index:900;padding:10px 32px;background:rgba(10,10,20,0.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end}
        .print-bar button{padding:6px 12px;border-radius:6px;background:var(--surface);border:1px solid var(--border);color:var(--text);font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font)}
        .print-bar button:hover{border-color:var(--teal)}
        @media print{nav,footer,.print-bar,.toc{display:none !important}.layout{display:block;padding:0;margin:0}.doc section{display:block !important}}
        @media (max-width:780px){.layout{grid-template-columns:1fr;padding:24px 16px 80px}.toc{display:none}}
      ` }} />

      <div className="print-bar">
        <button onClick={() => window.print()}>⎙ Print / Save as PDF</button>
      </div>

      <div className="layout">
        <aside className="toc">
          <h4>Legal Documents</h4>
          <ul id="toc-list">
            <li><a href="#terms" className={activeTab === 'terms' ? 'active' : ''} onClick={(e) => handleTabClick(e, 'terms')}>Terms of Service</a></li>
            <li><a href="#privacy" className={activeTab === 'privacy' ? 'active' : ''} onClick={(e) => handleTabClick(e, 'privacy')}>Privacy Policy</a></li>
            <li><a href="#refund" className={activeTab === 'refund' ? 'active' : ''} onClick={(e) => handleTabClick(e, 'refund')}>Refund Policy</a></li>
            <li><a href="#cookie" className={activeTab === 'cookie' ? 'active' : ''} onClick={(e) => handleTabClick(e, 'cookie')}>Cookie Policy</a></li>
            <li><a href="#dpa" className={activeTab === 'dpa' ? 'active' : ''} onClick={(e) => handleTabClick(e, 'dpa')}>Data Processing Addendum</a></li>
          </ul>
          <h4 style={{ marginTop: '24px' }}>Compliance</h4>
          <ul>
            <li><a href="#">GDPR Rights</a></li>
            <li><a href="#">DMCA Notice</a></li>
            <li><a href="#">Accessibility</a></li>
          </ul>
        </aside>

        <main className="doc">
          <section id="terms" className={activeTab === 'terms' ? 'active' : ''}>
            <div className="doc-hero">
              <span className="eyebrow">Legal</span>
              <h1>Terms of Service</h1>
              <div className="meta">Last updated April 28, 2026 · Effective May 1, 2026</div>
            </div>
            <h2>1. Agreement</h2>
            <p>These Terms of Service ("Terms") govern your access to and use of Xpresswriters' platform, websites, and services (collectively, the "Service"), operated by <strong>Xpresswriters Private Limited</strong> ("we", "us", "our"). By creating an account or placing an order, you agree to be bound by these Terms.</p>
            <h2>2. Eligibility</h2>
            <p>You must be at least <strong>18 years old</strong> and capable of forming a binding contract under applicable law. By using the Service, you represent that any content you submit is your original work or properly licensed.</p>
            <h2>3. Services Provided</h2>
            <p>Xpresswriters connects clients with independent freelance writers for content writing services including but not limited to Statements of Purpose, LORs, resumes, blogs, essays, visa letters, and similar editorial work. <strong>We do not provide work intended to deceive academic institutions or circumvent academic integrity rules.</strong> Drafts are intended as research, learning, or editorial assistance.</p>
            <h2>4. Account Responsibilities</h2>
            <ul>
              <li>Provide accurate, current information during registration</li>
              <li>Maintain the confidentiality of your password and MFA codes</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>You are responsible for all activity under your account</li>
            </ul>
            <h2>5. Orders, Payment, and Pricing</h2>
            <p>Prices are listed in Indian Rupees (INR) inclusive of applicable platform fees and exclusive of GST (18%) unless otherwise stated. Payment is processed at order placement via our payment partners (Razorpay, Stripe). All transactions are final at the point of charge, subject to our <a href="#refund" onClick={(e) => handleTabClick(e, 'refund')}>Refund Policy</a>.</p>
            <div className="callout"><strong>Rush orders</strong>Fast-track delivery options incur a surcharge of up to 50% and are non-cancellable once a writer has been assigned.</div>
            <h2>6. Intellectual Property</h2>
            <p>Upon full payment and release of funds, <strong>you receive a perpetual, worldwide license</strong> to use the deliverable for personal or commercial purposes. Xpresswriters retains the right to use anonymized excerpts for sample purposes only with explicit written consent.</p>
            <h2>7. Plagiarism &amp; AI Use</h2>
            <p>Every deliverable is scanned with industry-standard tools (Turnitin or equivalent + GPTZero) before release. We guarantee a similarity score below 10% and AI-generation score below 15% unless otherwise pre-agreed in writing. Reports are included with every order.</p>
            <h2>8. Revisions</h2>
            <p>Each order includes up to <strong>3 free revisions</strong> within 14 days of delivery. Substantial scope changes may incur additional fees clearly communicated before work resumes.</p>
            <h2>9. Prohibited Conduct</h2>
            <ul>
              <li>Submitting another party's confidential information without authorization</li>
              <li>Using the Service to facilitate fraud, harassment, or discrimination</li>
              <li>Attempting to reverse-engineer, scrape, or overload our infrastructure</li>
              <li>Contacting writers off-platform to circumvent payment</li>
            </ul>
            <h2>10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, our aggregate liability for any claim shall not exceed the amount paid by you for the specific order giving rise to the claim. We are not liable for indirect, consequential, or punitive damages.</p>
            <h2>11. Termination</h2>
            <p>We may suspend or terminate your account for material breach. You may close your account at any time from Settings → Account.</p>
            <h2>12. Governing Law &amp; Dispute Resolution</h2>
            <p>These Terms are governed by the laws of India. Any disputes shall be resolved by arbitration seated in <strong>Mumbai, Maharashtra</strong>, in accordance with the Arbitration and Conciliation Act, 1996.</p>
            <h2>13. Changes</h2>
            <p>We may update these Terms from time to time. Material changes will be notified via email at least 14 days before they take effect.</p>
            <h2>14. Contact</h2>
            <p>Legal inquiries: <a href="mailto:legal@xpresswriters.com">legal@xpresswriters.com</a> · Registered office: Xpresswriters Pvt Ltd, Floor 7, Phoenix Marketcity, Kurla West, Mumbai 400070, India.</p>
          </section>

          <section id="privacy" className={activeTab === 'privacy' ? 'active' : ''}>
            <div className="doc-hero">
              <span className="eyebrow">Privacy</span>
              <h1>Privacy Policy</h1>
              <div className="meta">Last updated April 28, 2026 · GDPR + DPDP Act compliant</div>
            </div>
            <h2>1. Who We Are</h2>
            <p>Xpresswriters Pvt Ltd is the <strong>data controller</strong> for personal data collected through our Service. Our Data Protection Officer can be reached at <a href="mailto:privacy@xpresswriters.com">privacy@xpresswriters.com</a>.</p>
            <h2>2. Information We Collect</h2>
            <table>
              <thead><tr><th>Category</th><th>Examples</th><th>Lawful basis</th></tr></thead>
              <tbody>
                <tr><td>Account</td><td>Name, email, phone, password hash</td><td>Contract</td></tr>
                <tr><td>Order</td><td>Brief, attachments, deadline, deliverables</td><td>Contract</td></tr>
                <tr><td>Payment</td><td>Card last-4, billing address</td><td>Contract, Legal</td></tr>
                <tr><td>Usage</td><td>IP, device, pages viewed, click events</td><td>Legitimate interest</td></tr>
                <tr><td>Communications</td><td>Chat messages, support tickets, calls</td><td>Contract, Consent</td></tr>
              </tbody>
            </table>
            <h2>3. How We Use Information</h2>
            <ul>
              <li>Fulfill orders and match you with appropriate writers</li>
              <li>Process payments and issue invoices</li>
              <li>Send transactional notifications and (with consent) marketing</li>
              <li>Detect fraud, abuse, and security threats</li>
              <li>Comply with tax, accounting, and law-enforcement obligations</li>
            </ul>
            <h2>4. Sharing &amp; Sub-processors</h2>
            <p>We share data only with vetted sub-processors: Supabase (hosting), Razorpay/Stripe (payments), Resend (transactional email), Cloudflare (CDN), AWS (storage). A current list is available at <a href="#">/subprocessors</a>.</p>
            <div className="callout warn"><strong>We never sell your data.</strong>We do not share order content with advertising networks. Writers see only the brief — not your full identity unless you choose to share it.</div>
            <h2>5. Your Rights</h2>
            <p>Under GDPR and India's DPDP Act, you may request:</p>
            <ul>
              <li><strong>Access</strong> — a copy of your personal data</li>
              <li><strong>Rectification</strong> — correction of inaccurate data</li>
              <li><strong>Erasure</strong> — deletion (subject to retention obligations)</li>
              <li><strong>Portability</strong> — export in a machine-readable format</li>
              <li><strong>Objection</strong> — opt out of marketing or profiling</li>
            </ul>
            <p>Submit requests via Settings → Privacy or email <a href="mailto:privacy@xpresswriters.com">privacy@xpresswriters.com</a>. We respond within 30 days.</p>
            <h2>6. Retention</h2>
            <p>Account data is retained while your account is active and for 7 years after closure (Indian tax law). Order content is kept for 3 years for revision/dispute purposes. Marketing-only data is deleted within 12 months of last engagement.</p>
            <h2>7. Security</h2>
            <p>All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We run quarterly penetration tests and maintain ISO 27001 controls. In the event of a breach affecting your data, we will notify you within 72 hours.</p>
            <h2>8. International Transfers</h2>
            <p>Our primary servers are in <strong>Mumbai (ap-south-1)</strong>. EU data is processed under Standard Contractual Clauses approved by the European Commission.</p>
            <h2>9. Children's Privacy</h2>
            <p>Our Service is not directed to children under 16. If we discover we have collected such data we will delete it promptly.</p>
          </section>

          <section id="refund" className={activeTab === 'refund' ? 'active' : ''}>
            <div className="doc-hero">
              <span className="eyebrow">Refunds</span>
              <h1>Refund Policy</h1>
              <div className="meta">Revisions Policy & Satisfaction Promise · Last updated April 28, 2026</div>
            </div>
            <h2>1. Pre-Delivery Refund Eligibility</h2>
            <p>Monetary refunds or pro-rated service credits are only eligible if requested before work is completed and delivered. A full refund is guaranteed if we are unable to assign a qualified writer to your order, or if the order is cancelled within 1 hour of placement before writer assignment.</p>
            <h2>2. Post-Delivery Policy (All Sales Are Final)</h2>
            <p><strong>We do not offer refunds after any draft or finalized document has been delivered to your dashboard.</strong> Once files are generated and delivered by the writer, the service has been rendered, and all payments are non-refundable.</p>
            <h2>3. No-Risk Revisions & Rework Guarantee</h2>
            <p>If you are not satisfied with the quality of the delivered work, you are entitled to unlimited revisions within the original scope of your order for up to 7 days. If the revisions are still not to your liking, you can request a writer re-assignment, and a new expert will re-draft your document at no additional cost.</p>
            <h2>4. Cancellations & Partial Credits (Pre-Delivery Only)</h2>
            <table>
              <thead><tr><th>Pre-Delivery Scenario</th><th>Eligible Credit/Refund</th></tr></thead>
              <tbody>
                <tr><td>Cancel within 1 hour of order placement (Writer not assigned)</td><td>100% Refund</td></tr>
                <tr><td>Cancel after writer assigned, before first draft starts</td><td>70% Wallet Credit</td></tr>
                <tr><td>Late delivery (without prior notification/agreement)</td><td>20% Wallet Credit</td></tr>
              </tbody>
            </table>
            <h2>5. How to Request Revisions or Pre-Delivery Support</h2>
            <ol>
              <li>Go to your <strong>Dashboard → Order → Request Revision</strong></li>
              <li>Input details of what changes are required</li>
              <li>Our team and writer will execute within <strong>24–48 hours</strong></li>
            </ol>
            <div className="callout"><strong>Wallet Credit Option</strong>Any eligible pre-delivery pro-rated cancellations issued to your Xpresswriters wallet are processed instantly.</div>
          </section>

          <section id="cookie" className={activeTab === 'cookie' ? 'active' : ''}>
            <div className="doc-hero">
              <span className="eyebrow">Cookies</span>
              <h1>Cookie Policy</h1>
              <div className="meta">Last updated April 28, 2026</div>
            </div>
            <h2>What Are Cookies</h2>
            <p>Cookies are small text files stored on your device by your browser. We also use similar technologies like localStorage and pixel tags.</p>
            <h2>Categories We Use</h2>
            <table>
              <thead><tr><th>Type</th><th>Purpose</th><th>Examples</th><th>Toggle</th></tr></thead>
              <tbody>
                <tr><td><strong>Strictly necessary</strong></td><td>Login, cart, security</td><td>session_id, csrf_token</td><td>Always on</td></tr>
                <tr><td>Functional</td><td>Remember preferences</td><td>theme, language</td><td>Optional</td></tr>
                <tr><td>Analytics</td><td>Understand usage</td><td>PostHog, Plausible</td><td>Optional</td></tr>
                <tr><td>Marketing</td><td>Ad attribution</td><td>Meta Pixel, Google Ads</td><td>Optional</td></tr>
              </tbody>
            </table>
            <h2>Managing Cookies</h2>
            <p>You can manage preferences via the cookie banner at the bottom of every page or in <strong>Settings → Privacy → Cookies</strong>. Disabling strictly-necessary cookies will break login and checkout.</p>
          </section>

          <section id="dpa" className={activeTab === 'dpa' ? 'active' : ''}>
            <div className="doc-hero">
              <span className="eyebrow">B2B</span>
              <h1>Data Processing Addendum</h1>
              <div className="meta">For enterprise customers · April 28, 2026</div>
            </div>
            <p>This DPA forms part of any agreement between Xpresswriters Pvt Ltd (Processor) and a Customer (Controller) where the Customer's personal data is processed via the Service. It incorporates the EU Standard Contractual Clauses (Module 2: Controller-to-Processor) by reference.</p>
            <h2>Sub-processors</h2>
            <p>Current sub-processors: AWS (hosting), Supabase (database), Razorpay/Stripe (payments), Resend (email), Cloudflare (CDN), Sentry (error monitoring). 30 days' notice given before adding new sub-processors.</p>
            <h2>Security Measures</h2>
            <p>SOC 2 Type II in progress · ISO 27001 controls · annual pen-tests · 24h breach notification SLA.</p>
            <p style={{ marginTop: '24px' }}>
              <a href="mailto:legal@xpresswriters.com" style={{ display: 'inline-block', padding: '10px 18px', background: 'var(--teal)', color: '#fff', borderRadius: '7px', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}>📄 Request signed DPA</a>
            </p>
          </section>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}
