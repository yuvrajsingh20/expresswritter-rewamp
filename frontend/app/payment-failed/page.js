"use client";
import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCcw, Headset } from 'lucide-react';

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'The transaction could not be completed securely.';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a192f', fontFamily: 'var(--font), Inter, sans-serif' }}>
      {/* Background Orbs */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0) 70%)', filter: 'blur(60px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(15, 118, 110, 0.1) 0%, rgba(15, 118, 110, 0) 70%)', filter: 'blur(60px)' }}></div>
      </div>

      <div style={{ 
        position: 'relative', zIndex: 1,
        background: 'rgba(255, 255, 255, 0.03)', 
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '48px 40px', 
        borderRadius: '24px', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
        maxWidth: '460px', 
        width: '100%', 
        textAlign: 'center' 
      }}>
        <div style={{ width: '88px', height: '88px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <XCircle size={44} color="#ef4444" />
        </div>
        
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '12px', letterSpacing: '-0.02em' }}>Payment Failed</h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', marginBottom: '36px' }}>
          {reason}
          <br/>
          <span style={{ display: 'block', marginTop: '8px' }}>No charges were made to your account. Please try again or use a different payment method.</span>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <button 
            onClick={() => router.push('/student')}
            style={{ 
              padding: '14px', background: '#ef4444', color: '#fff', borderRadius: '12px', 
              fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', 
              transition: 'all 0.2s', boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(239, 68, 68, 0.39)'; }}
          >
            <RefreshCcw size={16} /> Return to Dashboard
          </button>
          
          <button 
            onClick={() => router.back()}
            style={{ 
              padding: '14px', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', 
              borderRadius: '12px', fontWeight: '600', fontSize: '14px', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.1)', 
              cursor: 'pointer', transition: 'all 0.2s' 
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
        
        <div style={{ marginTop: '36px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748b' }}>
          <Headset size={14} />
          <span style={{ fontSize: '12px' }}>Need help? <a href="#" style={{ color: '#38bdf8', textDecoration: 'none' }}>Contact Support</a></span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a192f', color: '#fff' }}>Loading...</div>}>
      <PaymentFailedContent />
    </Suspense>
  );
}
