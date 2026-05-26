"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AdminOrders } from '../../admin/admin-orders';

export default function SubAdminOrdersPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "SUB_ADMIN") return;

    // Read orderId from URL deep link if present
    const params = new URLSearchParams(window.location.search);
    const oid = params.get('orderId');
    if (oid) {
      setActiveOrderId(oid);
    }

    const fetchData = async () => {
      try {
        const [projRes, freeRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/admin/freelancers')
        ]);
        if (projRes.ok) {
          const projData = await projRes.json();
          setProjects(Array.isArray(projData) ? projData : []);
        }
        if (freeRes.ok) {
          const freeData = await freeRes.json();
          setFreelancers(Array.isArray(freeData) ? freeData : []);
        }
      } catch (err) {
        console.error("Failed to fetch orders data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Order Logs</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Track and manage project orders</p>
      </div>
      <AdminOrders 
        projects={projects} 
        freelancers={freelancers} 
        setProjects={setProjects} 
        isMobile={isMobile} 
        activeOrderId={activeOrderId} 
        onOrderViewed={() => setActiveOrderId(null)} 
      />
    </div>
  );
}