"use client";
import Link from 'next/link';

export default function NotFound() {
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
        background: 'linear-gradient(to bottom, #14b8a6, #0d9488)', 
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent',
        lineHeight: 1,
        marginBottom: '20px'
      }}>
        404
      </div>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Page Not Found</h1>
      <p style={{ color: '#71717a', maxWidth: '400px', marginBottom: '32px', lineHeight: '1.6' }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link href="/" style={{ 
        padding: '12px 24px', 
        background: '#14b8a6', 
        color: '#fff', 
        borderRadius: '8px', 
        textDecoration: 'none', 
        fontWeight: '600',
        transition: 'transform 0.2s',
      }}>
        Return Home
      </Link>
    </div>
  );
}
