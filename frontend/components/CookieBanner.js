"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setTimeout(() => setVisible(true), 2000);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };
  // test 1
  if (!visible) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '24px', 
      left: '24px', 
      right: '24px', 
      zIndex: 10000,
      animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        background: '#18181b', 
        color: '#fff', 
        padding: '20px 24px', 
        borderRadius: '16px', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid #27272a',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>Cookie Preferences</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa', lineHeight: '1.5' }}>
            We use cookies to improve your experience and analyze platform traffic. By clicking "Accept All", you consent to our use of cookies as described in our <Link href="/privacy" style={{ color: '#14b8a6', textDecoration: 'none' }}>Privacy Policy</Link>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setVisible(false)}
            style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #3f3f46', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            Decline
          </button>
          <button 
            onClick={accept}
            style={{ padding: '10px 24px', background: '#14b8a6', border: 'none', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
            Accept All
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
