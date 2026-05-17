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

  // Helper to color-code status badges
  const getStatusBadge = (status) => {
    const config = {
      'CREATED': { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', label: 'ORDER PLACED' },
      'ASSIGNED': { bg: 'rgba(14,165,233,0.1)', color: '#0ea5e9', label: 'ASSIGNED' },
      'IN_PROGRESS': { bg: 'rgba(13,148,136,0.1)', color: 'var(--teal-light)', label: 'IN PROGRESS' },
      'REVISION': { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'REVISION IN PROGRESS' },
      'REVIEW': { bg: 'rgba(167,139,250,0.1)', color: '#a78bfa', label: 'QUALITY REVIEW' },
      'QUALITY_CHECK': { bg: 'rgba(167,139,250,0.1)', color: '#a78bfa', label: 'QUALITY CHECK' },
      'UNDER_REVIEW': { bg: 'rgba(167,139,250,0.1)', color: '#a78bfa', label: 'UNDER REVIEW' },
      'COMPLETED': { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', label: 'DELIVERED' },
      'DELIVERED': { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', label: 'DELIVERED' },
    };
    const item = config[status] || { bg: 'rgba(13,148,136,0.1)', color: 'var(--teal-light)', label: status };
    return (
      <span style={{ padding: '6px 14px', borderRadius: 100, background: item.bg, color: item.color, fontSize: 11, fontWeight: 800, letterSpacing: '0.05em' }}>
        {item.label}
      </span>
    );
  };

  // Helper to get step-specific status messages
  const getStepDesc = (stepLabel, active, done) => {
    if (active) {
      switch (stepLabel) {
        case 'Order Placed': return 'Your payment is verified and your project is initialising.';
        case 'Writer Assigned': return 'An expert writer has been reserved for your order.';
        case 'In Progress': return 'Our domain expert is actively drafting your document.';
        case 'Quality Check': return 'Editor is running plagiarism, grammar, and AI scans.';
        case 'Delivered': return 'Your final premium files are ready for download.';
        default: return 'Active step.';
      }
    }
    if (done) return 'Completed successfully.';
    return 'Pending step.';
  };

  return (
    <div className="landing-page-container">
      <PublicNavbar />
      <style dangerouslySetInnerHTML={{ __html: `
        .track-wrap{max-width:760px;margin:140px auto 0;padding:0 24px 100px}
        .track-hero{text-align:center;margin-bottom:44px}
        .track-hero h1{font-size:42px;font-weight:900;letter-spacing:-0.03em;margin-bottom:12px;background:linear-gradient(135deg,var(--text),var(--teal-light));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .track-form-box{background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:40px;box-shadow:0 30px 60px rgba(0,0,0,0.2)}
        .track-input-row{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
        .track-input-row input{padding:14px 16px;background:var(--surface2);border:1px solid var(--border);border-radius:12px;color:var(--text);font-family:var(--font);font-size:14px;outline:none;transition:all 0.2s}
        .track-input-row input:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(13,148,136,0.15)}
        
        .timeline-container{display:flex;flex-direction:column;gap:4px}
        .timeline-step{display:grid;grid-template-columns:44px 1fr auto;gap:20px;padding-bottom:32px;position:relative}
        .timeline-step:not(:last-child)::before{content:'';position:absolute;left:21px;top:44px;bottom:0;width:2px;background:var(--border)}
        
        .timeline-dot{width:44px;height:44px;border-radius:50%;border:2px solid var(--border);background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;z-index:2;color:var(--text-dim);transition:all 0.3s}
        
        .step-done .timeline-dot{border-color:var(--teal);background:rgba(13,148,136,0.1);color:var(--teal-light)}
        .step-active .timeline-dot{border-color:var(--teal);background:var(--teal);color:#fff;box-shadow:0 0 15px var(--teal)}
        
        .step-done::before{background:var(--teal) !important}
        
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(13,148,136,0.4); }
          100% { box-shadow: 0 0 0 8px rgba(13,148,136,0); }
        }
        .step-active .timeline-dot {
          animation: pulseGlow 1.5s infinite;
        }
        
        @media (max-width:600px){.track-input-row{grid-template-columns:1fr}}
        .error-msg{padding:14px;background:rgba(244,63,94,0.08);border:1px solid rgba(244,63,94,0.15);color:#f43f5e;border-radius:12px;font-size:13px;margin-bottom:24px;text-align:center;font-weight:500}
      ` }} />

      <div className="track-wrap">
        <div className="track-hero">
          <h1>Track your order</h1>
          <p style={{color:'var(--text-muted)', fontSize:16, fontWeight:300}}>View real-time status, writer logs, and estimated timelines.</p>
        </div>

        {error && <div className="error-msg">⚠️ {error}</div>}

        {!orderData ? (
          <div className="track-form-box">
            <form onSubmit={handleTrack}>
              <div className="track-input-row">
                <div style={{display:'grid', gap:8}}>
                  <label style={{fontSize:11.5, fontWeight:700, letterSpacing:'0.05em', color:'var(--text-dim)', textTransform:'uppercase'}}>Invoice / Order ID</label>
                  <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="e.g. XW-A8291" required />
                </div>
                <div style={{display:'grid', gap:8}}>
                  <label style={{fontSize:11.5, fontWeight:700, letterSpacing:'0.05em', color:'var(--text-dim)', textTransform:'uppercase'}}>Checkout Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required />
                </div>
              </div>
              <button className="btn-teal" type="submit" disabled={loading} style={{width:'100%', padding:'15px', borderRadius:12, marginTop:10, opacity: loading ? 0.6 : 1, fontSize:14, fontWeight:600}}>
                {loading ? 'Consulting system...' : 'Access Dashboard →'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{animation:'fadeIn 0.3s ease'}}>
            <div style={{background:'var(--surface)', border:'1px solid var(--border)', borderRadius:24, padding:30, display:'flex', justifyContent:'space-between', alignItems: 'center', marginBottom:20, flexWrap:'wrap', gap:20, boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}}>
              <div>
                <div style={{fontSize:11, color:'var(--text-muted)', fontFamily:'var(--mono)', letterSpacing:'0.05em', fontWeight:700}}>{orderData.id}</div>
                <h2 style={{fontSize:22, fontWeight:800, letterSpacing:'-0.02em', margin:'6px 0'}}>{orderData.service}</h2>
                <p style={{fontSize:13.5, color:'var(--text-muted)', fontWeight:300}}>
                  Estimated Delivery: <strong style={{color:'var(--text)', fontWeight:600}}>{orderData.eta ? new Date(orderData.eta).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'TBD'}</strong>
                </p>
              </div>
              {getStatusBadge(orderData.status)}
            </div>

            <div style={{background:'var(--surface)', border:'1px solid var(--border)', borderRadius:24, padding:40, boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32}}>
                <h3 style={{fontSize:18, fontWeight:800, letterSpacing:'-0.02em'}}>Order Timeline</h3>
                <span style={{fontSize:12, color:'var(--text-muted)'}}>Writer: <strong style={{color:'var(--teal-light)'}}>{orderData.writer}</strong></span>
              </div>
              
              <div className="timeline-container">
                {orderData.timeline.map((s, i) => (
                  <div key={i} className={`timeline-step ${s.done ? 'step-done' : ''} ${s.active ? 'step-active' : ''}`}>
                    <div className="timeline-dot">{s.done ? '✓' : i + 1}</div>
                    <div>
                      <h4 style={{fontSize:14.5, fontWeight:700, color: s.active ? 'var(--teal-light)' : (s.done ? 'var(--text)' : 'var(--text-dim)'), marginBottom:4}}>{s.label}</h4>
                      <p style={{fontSize:12.5, color:'var(--text-muted)', fontWeight:300}}>
                        {getStepDesc(s.label, s.active, s.done)}
                      </p>
                    </div>
                    <div style={{fontSize:12, color:'var(--text-dim)', textAlign:'right', fontFamily:'var(--mono)'}}>
                      {s.date !== 'Pending' ? new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button className="btn-outline-teal" onClick={() => setOrderData(null)} style={{marginTop:24, padding:'12px 24px', borderRadius:12, fontSize:13, fontWeight:600}}>
              ← Track Another Order
            </button>
          </div>
        )}
      </div>
      <PublicFooter />
    </div>
  );
}
