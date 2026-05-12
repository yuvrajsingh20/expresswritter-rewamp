"use client";
import React, { useState, useEffect } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import '@/app/(auth)/landing.css';

export default function LegalPage() {
  const [activeSection, setActiveSection] = useState('terms');

  const sections = [
    { id: 'terms', label: 'Terms of Service' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'refund', label: 'Refund & Revision' },
    { id: 'writers', label: 'Writer Agreement' },
    { id: 'cookies', label: 'Cookie Policy' },
    { id: 'dmca', label: 'DMCA & IP' },
  ];

  return (
    <div className="landing-page-container">
      <PublicNavbar />
      <style dangerouslySetInnerHTML={{ __html: `
        .legal-layout{display:grid;grid-template-columns:240px 1fr;gap:48px;max-width:1180px;margin:120px auto 0;padding:40px 32px 80px}
        .legal-toc{position:sticky;top:100px;align-self:start;font-size:13px}
        .legal-toc h4{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px}
        .legal-toc ul{list-style:none;display:flex;flex-direction:column;gap:2px;padding:0}
        .legal-toc a{display:block;padding:8px 12px;border-radius:6px;color:var(--text-muted);text-decoration:none;font-size:13px;transition:all .15s;cursor:pointer}
        .legal-toc a:hover{background:var(--surface2);color:var(--text)}
        .legal-toc a.active-link{background:rgba(13,148,136,0.15);color:var(--teal-light);font-weight:600}
        .legal-doc{max-width:760px}
        .legal-hero{padding:20px 0 32px;border-bottom:1px solid var(--border);margin-bottom:32px}
        .legal-hero h1{font-size:32px;font-weight:700;margin-bottom:8px}
        .legal-hero p{font-size:14px;color:var(--text-muted)}
        .legal-section{margin-bottom:60px;line-height:1.7;color:var(--text-muted);font-weight:300;font-size:14.5px}
        .legal-section h2{font-size:22px;color:var(--text);font-weight:700;margin-bottom:18px;margin-top:40px}
        .legal-section h3{font-size:16px;color:var(--text);font-weight:600;margin-bottom:10px;margin-top:24px}
        .legal-section p{margin-bottom:16px}
        .legal-section ul{margin-bottom:16px;padding-left:20px}
        .legal-section li{margin-bottom:8px}
        @media (max-width:780px){.legal-layout{grid-template-columns:1fr}.legal-toc{display:none}}
      ` }} />

      <div className="legal-layout">
        <aside className="legal-toc">
          <h4>Legal Directory</h4>
          <ul>
            {sections.map(s => (
              <li key={s.id}>
                <a 
                  className={activeSection === s.id ? 'active-link' : ''}
                  onClick={() => {
                    setActiveSection(s.id);
                    document.getElementById(s.id).scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <main className="legal-doc">
          <div className="legal-hero">
            <h1>Legal Center</h1>
            <p>Last Updated: April 15, 2026. Standard agreements for clients, writers, and partners.</p>
          </div>

          <div id="terms" className="legal-section">
            <h2>Terms of Service</h2>
            <p>Welcome to Xpresswriters. By using our platform, you agree to these terms. Please read them carefully as they contain important information about your legal rights.</p>
            <h3>1. Account Registration</h3>
            <p>You must be at least 18 years old to create an account. You are responsible for all activity that occurs under your account. We reserve the right to suspend accounts that provide false information or violate our safety policies.</p>
            <h3>2. Service Delivery</h3>
            <p>We connect you with freelance writers. While we vet every writer, the final deliverable is a result of the collaboration between you and the writer. We guarantee that every document is scanned for plagiarism and AI before delivery.</p>
            <h3>3. Intellectual Property</h3>
            <p>Upon full payment, the ownership and copyright of the final deliverable are transferred to the client. The writer waives all moral rights to the work. Xpresswriters retains the right to use watermarked samples for portfolio purposes unless a non-disclosure agreement is in place.</p>
          </div>

          <div id="privacy" className="legal-section">
            <h2>Privacy Policy</h2>
            <p>Your privacy is not for sale. We collect only what we need to run the service and get you the best results.</p>
            <h3>Data Collection</h3>
            <p>We collect your email, name, and billing information for account management and invoicing. We also collect the project briefs you provide to share with your assigned writers.</p>
            <h3>Third Parties</h3>
            <p>We use Stripe and Razorpay for payments. They receive your payment details directly; we never see or store your credit card numbers on our servers.</p>
          </div>

          <div id="refund" className="legal-section">
            <h2>Refund &amp; Revision Policy</h2>
            <p>We stand by our work. If you're not satisfied, we'll make it right.</p>
            <h3>Revisions</h3>
            <p>Every order includes 3 rounds of free revisions within 14 days of delivery. Revisions must be within the original scope of the brief.</p>
            <h3>Refunds</h3>
            <p>Full refunds are issued if: (1) we cannot match you with a writer within 24 hours, (2) the writer misses the deadline without prior approval, or (3) the work fails a plagiarism check (over 10% similarity).</p>
          </div>

          {/* Additional sections can be populated as needed */}
          <div id="writers" className="legal-section">
            <h2>Writer Agreement</h2>
            <p>Standard terms for freelance partners on the Xpresswriters network.</p>
            <p>Writers agree to deliver 100% original, human-written content. Re-selling or re-using client work is strictly prohibited and results in immediate termination and forfeiture of pending earnings.</p>
          </div>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}
