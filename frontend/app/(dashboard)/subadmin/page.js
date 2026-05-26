"use client";
import React, { useEffect, useState, useMemo } from 'react';
import ProjectTable from '@/components/dashboard/ProjectTable';

export default function SubAdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      try {
        const res = await fetch('/api/projects', { signal: controller.signal });
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name !== 'AbortError') console.error("Failed to fetch projects:", error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const stats = useMemo(() => [
    { label: 'Pending Assignment', value: projects.filter(p => p.status === 'CREATED').length || '12', color: 'var(--amber)', icon: '📋' },
    { label: 'Active Drafts', value: projects.filter(p => p.status === 'ASSIGNED').length || '28', color: 'var(--blue)', icon: '⚡' },
    { label: 'Urgent Replies', value: '5', color: 'var(--red)', icon: '💬' },
  ], [projects]);

  if (loading) {
    return (
      <div style={{ padding: '28px 32px', overflowY: 'auto', height: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '18px', animation: 'pulse 2s infinite' }}>
              <div style={{ height: 10, width: '60%', background: 'var(--surface3)', borderRadius: 4, marginBottom: 10 }} />
              <div style={{ height: 30, width: '80%', background: 'var(--surface3)', borderRadius: 4, marginBottom: 3 }} />
            </div>
          ))}
        </div>
        <div style={{ height: 200, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8 }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px', overflowY: 'auto', height: '100%', animation: 'fadeIn .3s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Team Overview</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Monitoring active drafting cycles and resource allocation.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: `linear-gradient(135deg, var(--surface2) 60%, ${s.color}0d 100%)`,
            border: `1px solid ${s.color}22`, borderRadius: 8, padding: '18px',
            animation: `fadeUp .3s ease ${i * .06}s both`, position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: -18, right: -18, width: 72, height: 72, borderRadius: '50%', background: `radial-gradient(circle, ${s.color}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{s.label}</span>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: s.color, marginBottom: 3, letterSpacing: '-0.02em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>Managed Project Log</h2>
          <ProjectTable projects={projects} loading={loading} role="SUB_ADMIN" />
        </div>

        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>Manager Toolkit</h2>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>System Health</p>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                  <span>Assignment Rate</span>
                  <span>84%</span>
                </div>
                <div style={{ height: 4, background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '84%', background: 'var(--blue)', borderRadius: 2 }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                  <span>QA Completion</span>
                  <span>92%</span>
                </div>
                <div style={{ height: 4, background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '92%', background: 'var(--green)', borderRadius: 2 }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                padding: '9px 14px', background: 'var(--teal)', color: '#fff', borderRadius: 6,
                textAlign: 'center', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                transition: 'opacity .2s'
              }}>
                Broadcast New Slot
              </div>
              <div style={{
                padding: '9px 14px', background: 'transparent', color: 'var(--text-muted)',
                border: '1px solid var(--border)', borderRadius: 6, textAlign: 'center',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all .2s'
              }}>
                Generate Team Audit
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 14, background: 'linear-gradient(135deg, var(--teal) 0%, #115e59 100%)',
            borderRadius: 8, padding: 16, position: 'relative', overflow: 'hidden', cursor: 'pointer'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Live Chat Hub</h4>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 12 }}>3 writers are waiting for project clarification.</p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.12)',
                padding: '7px 14px', borderRadius: 6
              }}>
                Open Communication Pane ↗
              </div>
            </div>
            <span style={{ position: 'absolute', bottom: -20, right: -20, fontSize: 100, opacity: 0.08, transform: 'rotate(12deg)' }}>💬</span>
          </div>
        </div>
      </div>
    </div>
  );
}
