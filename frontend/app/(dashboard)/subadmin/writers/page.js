"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AdminWriters } from '../../admin/admin-writers';

export default function SubAdminWritersPage() {
  const { data: session, status } = useSession();
  const [freelancers, setFreelancers] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "SUB_ADMIN") return;
    const fetchFreelancers = async () => {
      try {
        const res = await fetch('/api/admin/freelancers');
        if (res.ok) {
          const data = await res.json();
          setFreelancers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch freelancers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancers();
  }, [status, session]);

  if (loading) {
    return (
      <div style={{ padding: '28px 32px', height: '100%' }}>
        <div style={{ height: 22, width: 200, background: 'var(--surface3)', borderRadius: 4, marginBottom: 14 }} />
        <div style={{ height: 300, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, animation: 'pulse 2s infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Expert Workforce</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage and verify writer profiles</p>
      </div>
      <AdminWriters freelancers={freelancers} isMobile={isMobile} />
    </div>
  );
}