"use client";
import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Loader2 } from 'lucide-react';
import '@/app/(auth)/landing.css';

function CheckoutRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!sessionId) {
      router.push('/');
      return;
    }

    if (status === "unauthenticated") {
      // Redirect to login with a callback that routes back to student workspace checkout
      const callback = `/student?action=checkout&session_id=${sessionId}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callback)}`);
    } else if (status === "authenticated") {
      // Redirect directly to the student dashboard new-order workspace
      router.push(`/student?action=checkout&session_id=${sessionId}`);
    }
  }, [sessionId, status, router]);

  return (
    <div className="landing-page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="hero-bg">
        <div className="hero-grid" />
        <div className="hero-orb1" />
      </div>
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Loader2 className="animate-spin" size={44} style={{ color: 'var(--teal-light)', margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Verifying Secure Gateway</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Routing you to the premium checkout workspace...</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="landing-page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="animate-spin" size={44} style={{ color: 'var(--teal-light)' }} />
        </div>
      </div>
    }>
      <CheckoutRedirect />
    </Suspense>
  );
}
