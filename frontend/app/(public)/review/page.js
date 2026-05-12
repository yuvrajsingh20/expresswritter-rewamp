"use client";
import React, { useState } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import '@/app/(auth)/landing.css';
import Link from 'next/link';

export default function ReviewPage() {
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);

  const renderStars = (currentRating, onSetRating) => {
    return (
      <div style={{display:'flex', justifyContent:'center', gap:8, margin:'24px 0'}}>
        {[1, 2, 3, 4, 5].map(v => (
          <span 
            key={v} 
            onClick={() => onSetRating(v)}
            style={{fontSize:46, cursor:'pointer', color: v <= currentRating ? '#f5c842' : 'var(--surface3)', transition:'all .15s'}}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="landing-page-container">
      <PublicNavbar />
      <style dangerouslySetInnerHTML={{ __html: `
        .review-wrap{max-width:980px;margin:120px auto 0;padding:40px 32px 80px}
        .review-stepper{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:32px}
        .stepper-header{padding:16px 24px;border-bottom:1px solid var(--border);background:var(--surface2);display:flex;gap:32px}
        .step-indicator{font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:8px}
        .step-indicator.active-step{color:var(--text);font-weight:700}
        .step-num{width:24px;height:24px;border-radius:50%;background:var(--surface3);display:flex;align-items:center;justify-content:center;font-size:11px}
        .active-step .step-num{background:var(--teal);color:#fff}
        .step-content{padding:40px;min-height:400px}
        .review-tag{padding:8px 14px;border-radius:20px;background:var(--surface2);border:1px solid var(--border);color:var(--text-muted);font-size:12px;cursor:pointer}
        .review-tag:hover{border-color:var(--teal);color:var(--teal-light)}
        @media (max-width:820px){.review-grid{grid-template-columns:1fr}}
      ` }} />

      <div className="review-wrap">
        <div style={{marginBottom:30}}>
          <h1>How was your order with Marcus?</h1>
          <p style={{color:'var(--text-muted)'}}>Honest reviews help future clients find the right writer — and earn you ₹100 wallet credit.</p>
        </div>

        <div className="review-grid" style={{display:'grid', gridTemplateColumns:'1fr 320px', gap:24}}>
          <div className="review-stepper">
            <div className="stepper-header">
              <div className={`step-indicator ${step === 1 ? 'active-step' : ''}`}><span className="step-num">1</span> Rate</div>
              <div className={`step-indicator ${step === 2 ? 'active-step' : ''}`}><span className="step-num">2</span> Review</div>
              <div className={`step-indicator ${step === 3 ? 'active-step' : ''}`}><span className="step-num">3</span> Share</div>
            </div>

            <div className="step-content">
              {step === 1 && (
                <div style={{textAlign:'center'}}>
                  <h3>How would you rate this order?</h3>
                  <p style={{fontSize:13, color:'var(--text-muted)'}}>Tap the stars below — be honest!</p>
                  {renderStars(rating, setRating)}
                  <button className="btn-teal" disabled={rating === 0} onClick={() => setStep(2)} style={{padding:'12px 24px', fontSize:14}}>Continue →</button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3>What stood out?</h3>
                  <div style={{display:'flex', flexWrap:'wrap', gap:8, margin:'20px 0'}}>
                    {['✨ Exceeded expectations', '⚡ Lightning fast', '🎯 Nailed the brief', '💎 Beautiful writing', '🔍 Deep research'].map(t => (
                      <span key={t} className="review-tag">{t}</span>
                    ))}
                  </div>
                  <textarea placeholder="Tell us more about your experience..." style={{width:'100%', minHeight:150, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, color:'var(--text)', padding:16, marginBottom:20}}></textarea>
                  <div style={{display:'flex', gap:10}}>
                    <button className="btn-outline-teal" onClick={() => setStep(1)}>Back</button>
                    <button className="btn-teal" onClick={() => setStep(3)}>Continue →</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div style={{textAlign:'center'}}>
                  <h3>Review submitted!</h3>
                  <div style={{fontSize:60, margin:'30px 0'}}>🎉</div>
                  <p>Thanks for your feedback! ₹100 has been added to your wallet.</p>
                  <Link href="/login" className="btn-teal" style={{padding:'12px 24px', textDecoration:'none', marginTop:20, display:'inline-block'}}>Back to Dashboard</Link>
                </div>
              )}
            </div>
          </div>

          <aside>
            <div style={{background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:20}}>
              <h4 style={{fontSize:11, letterSpacing:'0.1em', marginBottom:14}}>REVIEWING</h4>
              <div style={{display:'flex', gap:12, alignItems:'center'}}>
                <div style={{width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#0d9488,#0f766e)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700}}>MW</div>
                <div>
                  <div style={{fontWeight:600, fontSize:13}}>Marcus Webb</div>
                  <div style={{fontSize:11, color:'var(--text-muted)'}}>MBA · Wharton · 11 yrs</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
