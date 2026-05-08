"use client";
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#09090b', 
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif',
      textAlign: 'center',
      padding: '0 20px'
    }}>
      <div style={{ 
        fontSize: '120px', 
        fontWeight: '900', 
        background: 'linear-gradient(to bottom, #ef4444, #b91c1c)', 
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent',
        lineHeight: 1,
        marginBottom: '20px'
      }}>
        500
      </div>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>System Error</h1>
      <p style={{ color: '#71717a', maxWidth: '400px', marginBottom: '32px', lineHeight: '1.6' }}>
        Something went wrong on our end. We've been notified and are working to fix it.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={() => reset()}
          style={{ 
            padding: '12px 24px', 
            background: '#27272a', 
            color: '#fff', 
            borderRadius: '8px', 
            border: '1px solid #3f3f46',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
        <a href="/" style={{ 
          padding: '12px 24px', 
          background: '#14b8a6', 
          color: '#fff', 
          borderRadius: '8px', 
          textDecoration: 'none', 
          fontWeight: '600'
        }}>
          Go Home
        </a>
      </div>
    </div>
  );
}
