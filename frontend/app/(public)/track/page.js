"use client";
import React, { useState } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import '@/app/(auth)/landing.css';

export default function TrackPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/track?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to find order');
      }
      
      setOrderData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page-container">
      <PublicNavbar />
      <style dangerouslySetInnerHTML={{ __html: `
        .track-wrap{max-width:880px;margin:120px auto 0;padding:48px 32px 80px}
        .track-hero{text-align:center;margin-bottom:36px}
        .track-form-box{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:32px;margin-bottom:32px}
        .track-input-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
        .timeline-step{display:grid;grid-template-columns:38px 1fr auto;gap:16px;padding-bottom:24px;position:relative}
        .timeline-step:not(:last-child)::before{content:'';position:absolute;left:18px;top:38px;bottom:0;width:2px;background:var(--border2)}
        .timeline-dot{width:38px;height:38px;border-radius:50%;border:2px solid var(--border2);background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:14px;z-index:2}
        .step-done .timeline-dot{border-color:var(--teal);background:rgba(13,148,136,0.15);color:var(--teal-light)}
        .step-active .timeline-dot{border-color:var(--teal);background:var(--teal);color:#fff}
        @media (max-width:600px){.track-input-row{grid-template-columns:1fr}}
        .error-msg{padding:12px;background:rgba(244,63,94,0.1);border:1px solid rgba(244,63,94,0.2);color:#f43f5e;border-radius:8px;font-size:12.5,margin-bottom:20px;text-align:center}
      ` }} />

      <div className="track-wrap">
        <div className="track-hero">
          <h1>Track your order</h1>
          <p style={{color:'var(--text-muted)'}}>Enter your Order ID and email to see live progress.</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {!orderData ? (
          <div className="track-form-box">
            <form onSubmit={handleTrack}>
              <div className="track-input-row">
                <div style={{display:'grid', gap:6}}>
                  <label style={{fontSize:11, fontWeight:600, color:'var(--text-muted)'}}>Invoice / Order ID</label>
                  <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="e.g. XW-12345678" style={{padding:12, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)'}} required />
                </div>
                <div style={{display:'grid', gap:6}}>
                  <label style={{fontSize:11, fontWeight:600, color:'var(--text-muted)'}}>Email used at checkout</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={{padding:12, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)'}} required />
                </div>
              </div>
              <button className="btn-teal" type="submit" disabled={loading} style={{width:'100%', padding:14, marginTop:10, opacity: loading ? 0.6 : 1}}>
                {loading ? 'Finding order...' : 'Track Order →'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{animation:'fadeIn 0.3s ease'}}>
            <div style={{background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:26, display:'flex', justifyContent:'space-between', alignItems: 'center', marginBottom:20, flexWrap:'wrap', gap:20}}>
              <div>
                <div style={{fontSize:11, color:'var(--text-dim)', fontFamily:'monospace'}}>{orderData.id}</div>
                <h2 style={{fontSize:20, margin:'4px 0'}}>{orderData.service}</h2>
                <p style={{fontSize:13, color:'var(--text-muted)'}}>Estimated delivery: {orderData.eta ? new Date(orderData.eta).toLocaleDateString() : 'TBD'}</p>
              </div>
              <div style={{padding:'7px 14px', borderRadius:7, background:'rgba(13,148,136,0.1)', color:'var(--teal-light)', fontSize:11, fontWeight:700}}>{orderData.status}</div>
            </div>

            <div style={{background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:32}}>
              <h3 style={{marginBottom:24}}>Order Timeline</h3>
              <div className="timeline-container">
                {orderData.timeline.map((s, i) => (
                  <div key={i} className={`timeline-step ${s.done ? 'step-done' : ''} ${s.active ? 'step-active' : ''}`}>
                    <div className="timeline-dot">{s.done ? '✓' : i + 1}</div>
                    <div>
                      <h4 style={{fontSize:14, fontWeight:600, color: s.active ? 'var(--teal-light)' : (s.done ? 'var(--text)' : 'var(--text-dim)')}}>{s.label}</h4>
                      <p style={{fontSize:12, color:'var(--text-muted)'}}>
                        {s.active ? 'Our experts are currently working on your document.' : (s.done ? 'Completed' : 'Upcoming step')}
                      </p>
                    </div>
                    <div style={{fontSize:11, color:'var(--text-dim)'}}>{s.date !== 'Pending' ? new Date(s.date).toLocaleDateString() : 'Pending'}</div>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn-outline-teal" onClick={() => setOrderData(null)} style={{marginTop:20, padding:'10px 20px'}}>Track another order</button>
          </div>
        )}
      </div>
      <PublicFooter />
    </div>
  );
}
