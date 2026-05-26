"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText, Clock, ExternalLink,
  MoreHorizontal, Eye, User,
  AlertCircle, Plus, Check, X, UserPlus, ChevronRight, ShieldCheck
} from 'lucide-react';
import { io } from 'socket.io-client';
import { Table, Pill, Btn, Card } from '@/app/(dashboard)/admin/admin-shared';

const ProjectTable = ({ projects = [], loading = false, role = 'ADMIN' }) => {
  const [assigningId, setAssigningId] = useState(null);
  const [freelancers, setFreelancers] = useState([]);

  useEffect(() => {
    if (role === 'ADMIN') {
      fetch('/api/admin/freelancers')
        .then(res => res.json())
        .then(data => setFreelancers(Array.isArray(data) ? data : []));
    }
  }, [role]);

  const handleAssign = async (projectId, freelancerId) => {
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerId })
      });
      if (res.ok) {
        const socket = io();
        socket.emit("admin_assigned_freelancer", {
          projectId,
          freelancerId,
          projectName: projects.find(p => p.id === projectId)?.title || "Academic Node"
        });

        alert("Success: Specialist mapped to project node.");
        window.location.reload();
      }
    } catch (error) {
      console.error("Assignment failed:", error);
    }
  };

  const handleCollaborator = async (projectId, freelancerId, action) => {
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerId, action })
      });
      if (res.ok) {
        alert(`Success: Collaborator ${action === 'ADD' ? 'added to' : 'removed from'} node.`);
        window.location.reload();
      }
    } catch (error) {
      console.error("Collaborator operation failed:", error);
    }
  };

  const getRolePrefix = () => {
    if (role === 'ADMIN') return '/admin/projects';
    if (role === 'SUB_ADMIN') return '/subadmin/projects';
    return '/student/orders';
  };

  if (loading) {
    return (
      <div style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '80px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '3px solid var(--surface3)',
          borderTopColor: 'var(--teal)',
          animation: 'spin .8s linear infinite'
        }} />
        <p style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          Aggregating stream data...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '80px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <div style={{
          width: 56,
          height: 56,
          background: 'var(--surface3)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          border: '1px solid var(--border)'
        }}>
          <AlertCircle size={28} style={{ color: 'var(--text-muted)' }} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
          No active projects found
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 300, margin: '0 auto' }}>
          All current requests and historical data will appear here once initialized.
        </p>
      </div>
    );
  }

  const handlePayout = async (project) => {
    const amount = prompt(`Enter payout amount for ${project.freelancer.name}:`);
    if (!amount || isNaN(amount)) return;

    const description = prompt("Enter payout description (optional):");

    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          freelancerId: project.freelancer.id,
          amount,
          description
        })
      });
      if (res.ok) {
        alert("Payout logged successfully.");
        window.location.reload();
      }
    } catch (error) {
      console.error("Payout failed:", error);
    }
  };

  return (
    <Card>
      <Table
        cols={['Service', 'Student', 'Purchase', 'Specialists (Team)', 'Operational Link']}
        rows={projects.map((project) => [
          // Cell 1: Service
          <div key={`srv-${project.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 32, 
              height: 32, 
              background: 'var(--surface3)', 
              borderRadius: 6, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--teal-light)', 
              border: '1px solid var(--border)',
              flexShrink: 0
            }}>
              <FileText size={16} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{project.title}</p>
              <p style={{ fontSize: 9, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>#{project.id.slice(-6).toUpperCase()}</p>
            </div>
          </div>,

          // Cell 2: Student
          <div key={`stu-${project.id}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              width: 24, 
              height: 24, 
              borderRadius: 6, 
              background: 'var(--surface3)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--text-muted)', 
              fontWeight: 700, 
              fontSize: 10, 
              border: '1px solid var(--border)',
              flexShrink: 0
            }}>
              {project.student?.name?.charAt(0) || <User size={10} />}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }} title={project.student?.name || 'Unknown'}>
              {project.student?.name || 'Unknown'}
            </div>
          </div>,

          // Cell 3: Purchase
          project.orders?.some(o => o.paymentStatus === 'PAID') ? (
            <Pill key={`pur-${project.id}`} label={`PAID: ₹${project.amount}`} color="var(--green)" />
          ) : (
            <Pill key={`pur-${project.id}`} label="PENDING" color="var(--amber)" />
          ),

          // Cell 4: Specialists (Team)
          <div key={`spec-${project.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Lead Writer */}
            {project.freelancer ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--teal-light)', fontWeight: 700, fontSize: 12 }}>
                  <ShieldCheck size={14} style={{ flexShrink: 0 }} /> {project.freelancer.name} <span style={{ opacity: 0.6, fontSize: 10, fontWeight: 400 }}>(Lead)</span>
                </div>
                {role === 'ADMIN' && (
                  <button
                    onClick={() => handlePayout(project)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--teal-light)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginLeft: 20,
                      textDecoration: 'underline'
                    }}
                  >
                    + ADD PAYOUT
                  </button>
                )}
              </div>
            ) : (
              <select
                onChange={(e) => handleAssign(project.id, e.target.value)}
                style={{
                  background: 'var(--surface3)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 6,
                  padding: '6px 10px',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: 140,
                  outline: 'none'
                }}
                defaultValue=""
              >
                <option value="" disabled style={{ background: 'var(--surface2)', color: 'var(--text-dim)' }}>➜ ALLOCATE LEAD</option>
                {freelancers.map(f => (
                  <option key={f.id} value={f.id} style={{ background: 'var(--surface2)', color: 'var(--text)' }}>{f.name}</option>
                ))}
              </select>
            )}

            {/* Collaborators */}
            {project.collaborators?.map(collab => (
              <div key={collab.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                gap: 8, 
                color: 'var(--text-muted)', 
                fontWeight: 600, 
                fontSize: 11, 
                background: 'var(--surface3)', 
                padding: '4px 8px', 
                borderRadius: 6, 
                border: '1px solid var(--border)' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={12} style={{ flexShrink: 0 }} /> {collab.name}
                </div>
                {role === 'ADMIN' && (
                  <button
                    onClick={() => handleCollaborator(project.id, collab.id, 'REMOVE')}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      padding: 0, 
                      color: 'var(--red)', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}

            {/* Add Collaborator Action */}
            {role === 'ADMIN' && project.freelancer && (
              <select
                onChange={(e) => {
                  if (e.target.value) handleCollaborator(project.id, e.target.value, 'ADD');
                }}
                style={{
                  background: 'var(--surface3)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 6,
                  padding: '4px 8px',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: 140,
                  outline: 'none'
                }}
                defaultValue=""
              >
                <option value="" disabled style={{ background: 'var(--surface2)', color: 'var(--text-dim)' }}>+ ADD WRITER</option>
                {freelancers
                  .filter(f => f.id !== project.freelancerId && !project.collaboratorIds?.includes(f.id))
                  .map(f => (
                    <option key={f.id} value={f.id} style={{ background: 'var(--surface2)', color: 'var(--text)' }}>{f.name}</option>
                  ))
                }
              </select>
            )}
          </div>,

          // Cell 5: Operational Link
          <div key={`lnk-${project.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
            <Link href={`${getRolePrefix()}/${project.id}`}>
              <Btn small>OPEN BRIDGE</Btn>
            </Link>
          </div>
        ])}
      />
    </Card>
  );
};

export default ProjectTable;
