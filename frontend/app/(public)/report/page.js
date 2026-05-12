"use client";
import React, { useState } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import '@/app/(auth)/landing.css';
import Link from 'next/link';

export default function ReportPage() {
  const [view, setView] = useState('plagiarism');

  return (
    <div className="landing-page-container">
      <PublicNavbar />
      <style dangerouslySetInnerHTML={{ __html: `
        .report-wrap{max-width:1200px;margin:120px auto 0;padding:36px 32px 80px}
        .report-head{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:20px;margin-bottom:30px}
        .report-head h1{font-size:30px;font-weight:700;letter-spacing:-0.02em;margin-bottom:6px}
        .score-grid-report{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:26px}
        .score-card-report{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:24px 26px}
        .report-tabs{display:flex;gap:4px;padding:4px;background:var(--surface);border:1px solid var(--border);border-radius:9px;margin-bottom:20px;width:fit-content}
        .report-tab{padding:9px 16px;border-radius:6px;border:none;background:transparent;color:var(--text-muted);font-size:12.5px;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s}
        .report-tab.active-tab{background:var(--teal);color:#fff}
        .doc-content-grid{display:grid;grid-template-columns:1fr 320px;gap:20px}
        .doc-viewer{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:32px;font-size:14px;line-height:1.85;font-weight:300}
        .highlight-match{background:rgba(244,63,94,0.18);border-bottom:2px solid rgba(244,63,94,0.5)}
        .highlight-ai{background:rgba(167,139,250,0.18);border-bottom:2px dashed rgba(167,139,250,0.5)}
        @media (max-width:920px){.doc-content-grid{grid-template-columns:1fr}.score-grid-report{grid-template-columns:1fr}}
      ` }} />

      <div className="report-wrap">
        <div className="report-head">
          <div>
            <div style={{fontSize:11, color:'var(--text-dim)', fontFamily:'monospace', marginBottom:8}}>INV-XW-48039 · LinkedIn Profile Rewrite</div>
            <h1>Originality Report</h1>
            <p style={{fontSize:13, color:'var(--text-muted)'}}>Generated Apr 22, 2026 · 750 words · Writer: Marcus Webb</p>
          </div>
          <div style={{display:'flex', gap:10}}>
            <button className="btn-outline-teal" style={{padding:'10px 16px', fontSize:13}}>Download PDF</button>
            <Link href="/login" className="btn-teal" style={{padding:'10px 16px', fontSize:13, textDecoration:'none'}}>Back to Order</Link>
          </div>
        </div>

        <div className="score-grid-report">
          <div className="score-card-report">
            <div style={{fontSize:11, fontWeight:700, color:'var(--text-muted)', marginBottom:12}}>🔍 PLAGIARISM SCORE</div>
            <div style={{fontSize:32, fontWeight:700, color:'var(--green)'}}>4%</div>
            <div style={{fontSize:12, color:'var(--text-muted)', marginTop:8}}>✓ Excellent — Original work with 2 minor phrase matches.</div>
          </div>
          <div className="score-card-report">
            <div style={{fontSize:11, fontWeight:700, color:'var(--text-muted)', marginBottom:12}}>🤖 AI DETECTION</div>
            <div style={{fontSize:32, fontWeight:700, color:'var(--green)'}}>8%</div>
            <div style={{fontSize:12, color:'var(--text-muted)', marginTop:8}}>✓ Human-written cadence confirmed across 5 detectors.</div>
          </div>
          <div className="score-card-report">
            <div style={{fontSize:11, fontWeight:700, color:'var(--text-muted)', marginBottom:12}}>✨ EDITORIAL QUALITY</div>
            <div style={{fontSize:32, fontWeight:700, color:'var(--teal-light)'}}>92</div>
            <div style={{fontSize:12, color:'var(--text-muted)', marginTop:8}}>Exceptional flow and tone. Grade 9 reading level.</div>
          </div>
        </div>

        <div className="report-tabs">
          <button className={`report-tab ${view === 'plagiarism' ? 'active-tab' : ''}`} onClick={() => setView('plagiarism')}>Plagiarism View</button>
          <button className={`report-tab ${view === 'ai' ? 'active-tab' : ''}`} onClick={() => setView('ai')}>AI Detection View</button>
          <button className={`report-tab ${view === 'clean' ? 'active-tab' : ''}`} onClick={() => setView('clean')}>Clean View</button>
        </div>

        <div className="doc-content-grid">
          <div className="doc-viewer">
            <p><strong>Senior Operations Leader · 14 Years Building High-Performance Teams Across APAC</strong></p>
            <p>
              I've spent my career at the intersection of supply chain, fintech, and people leadership — turning fragmented operations into engines of compounding growth. 
              <span className={view === 'ai' ? 'highlight-ai' : ''}> My approach combines rigorous data analysis with a deep belief that the right team, properly resourced, can outperform any playbook.</span>
            </p>
            <p>
              At <span className={view === 'plagiarism' ? 'highlight-match' : ''}>Razorpay, I led the merchant operations function from 80 to 340 people</span> across three countries, cutting onboarding time 4× while raising NPS from 31 to 68. 
              Before that, at Flipkart, I built the last-mile escalation cell that handled 14,000 tickets a week.
            </p>
            <p>
              <span className={view === 'ai' ? 'highlight-ai' : ''}>What I bring to a leadership conversation isn't another framework. It's a track record of taking ambiguous, under-resourced operations problems and turning them into measurable, repeatable systems</span> 
              — usually within 90 days, almost always with the existing team.
            </p>
          </div>
          <aside>
            <div style={{background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:18}}>
              <h4 style={{fontSize:13, marginBottom:12}}>Document Stats</h4>
              <div style={{fontSize:12, display:'grid', gap:8, color:'var(--text-muted)'}}>
                <div style={{display:'flex', justifyContent:'space-between'}}><span>Words</span><strong style={{color:'var(--text)'}}>624</strong></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span>Passive Voice</span><strong style={{color:'var(--green)'}}>3%</strong></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span>Readability</span><strong style={{color:'var(--text)'}}>Grade 10</strong></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
