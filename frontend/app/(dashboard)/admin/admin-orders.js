"use client";
import React, { useState, useEffect } from "react";
import { Pill, Btn, SectionHeader, Table } from "./admin-shared";
import { EagleEyePanel, DirectChatPanel } from "./admin-writers";
import { useChat } from "@/hooks/useChat";
import { useSession } from "next-auth/react";

export function AdminOrders({ projects = [], freelancers = [], setProjects, isMobile }) {
  const [mainTab, setMainTab] = useState('Order Assignments');
  const [loading, setLoading] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkWriterId, setBulkWriterId] = useState('');
  const { data: session } = useSession();

  // Filter projects that need assignment (status is CREATED or UNASSIGNED)
  const unassignedProjects = projects.filter(p => p.status === 'CREATED' || p.status === 'UNASSIGNED');
  
  const handleAssign = async (projectId, writerId, silent = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerId: writerId, status: 'ASSIGNED' })
      });
      if (res.ok) {
        const project = projects.find(p => p.id === projectId);
        const writer = freelancers.find(f => f.id === writerId);
        const clientName = project?.student?.name || 'the client';
        const writerName = writer?.name || 'the writer';

        // Update local state instead of reload for smoother experience
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, freelancerId: writerId, status: 'ASSIGNED', freelancer: freelancers.find(f => f.id === writerId) } : p));
        
        if (!silent) alert(`Success! ${writerName} has been assigned to the order for ${clientName}.`);
        return true;
      } else {
        if (!silent) alert("Failed to assign writer");
        return false;
      }
    } catch (err) {
      console.error(err);
      alert("Error assigning writer.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAssign = async () => {
    if (!bulkWriterId || selectedIds.length === 0) return;
    setLoading(true);
    let successCount = 0;
    for (const id of selectedIds) {
      const success = await handleAssign(id, bulkWriterId, true);
      if (success) successCount++;
    }
    const writerName = freelancers.find(f => f.id === bulkWriterId)?.name || 'writer';
    alert(`Successfully assigned ${successCount} orders to ${writerName}.`);
    setSelectedIds([]);
    setBulkWriterId('');
    setLoading(false);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === unassignedProjects.length) setSelectedIds([]);
    else setSelectedIds(unassignedProjects.map(p => p.id));
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  return (
    <div>
      <SectionHeader
        title="Order & Assignment Management"
        subtitle="Review new order requests, manually assign writers, and monitor real-time communications."
      />

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {['Order Assignments', 'Eagle Eye', 'Direct Chat'].map(t => (
          <button key={t} onClick={() => setMainTab(t)} style={{
            padding: '8px 18px', border: 'none', borderBottom: `2px solid ${mainTab === t ? 'var(--teal)' : 'transparent'}`,
            background: 'transparent', color: mainTab === t ? 'var(--teal-light)' : 'var(--text-muted)',
            fontFamily: 'var(--font)', fontSize: 13, fontWeight: mainTab === t ? 700 : 400, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            {t === 'Eagle Eye' ? '🦅' : t === 'Direct Chat' ? '💬' : '📥'} {t}
          </button>
        ))}
      </div>

      {mainTab === 'Eagle Eye' && <EagleEyePanel />}
      {mainTab === 'Direct Chat' && <DirectChatPanel freelancers={freelancers} />}
      {mainTab === 'Order Assignments' && (
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: isMobile ? 12 : 20, animation: 'fadeIn .3s ease' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: isMobile ? 12 : 0, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>New Order Requests (Awaiting Assignment)</h3>
            {selectedIds.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeIn .2s ease', background: 'rgba(13,148,136,0.1)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--teal)' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal-light)' }}>{selectedIds.length} Selected</span>
                <select 
                  value={bulkWriterId}
                  onChange={e => setBulkWriterId(e.target.value)}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}
                >
                  <option value="">Bulk Assign to...</option>
                  {freelancers.filter(f => !['Suspended', 'Blocked'].includes(f.freelancerProfile?.status)).map(f => (
                    <option key={f.id} value={f.id}>{f.name} {f.freelancerProfile?.rating ? `(★ ${f.freelancerProfile.rating})` : '(New)'}</option>
                  ))}
                </select>
                <Btn small onClick={handleBulkAssign} disabled={!bulkWriterId || loading}>Apply Batch</Btn>
              </div>
            )}
          </div>

          {unassignedProjects.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>No new orders awaiting assignment.</div>
          ) : (
            <Table
              cols={[
                <input type="checkbox" checked={selectedIds.length === unassignedProjects.length && unassignedProjects.length > 0} onChange={toggleSelectAll} />,
                'Order ID', 'Service', 'Deadline', 'Client', 'Assign Writer'
              ]}
              rows={unassignedProjects.map(p => [
                <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} />,
                <span style={{ fontWeight: 600, color: 'var(--teal-light)' }}>#{p.id.slice(-6).toUpperCase()}</span>,
                <span style={{ fontSize: 13 }}>{p.title}</span>,
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A'}</span>,
                <span style={{ fontSize: 13 }}>{p.student?.name || 'Unknown'}</span>,
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select 
                    id={`writer-select-${p.id}`}
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px 10px', borderRadius: 6, fontSize: 12, outline: 'none' }}
                  >
                    <option value="">Select a Writer...</option>
                    {freelancers.filter(f => !['Suspended', 'Blocked'].includes(f.freelancerProfile?.status)).map(f => (
                      <option key={f.id} value={f.id}>{f.name} (★ {f.freelancerProfile?.rating || 'New'})</option>
                    ))}
                  </select>
                  <Btn small onClick={() => {
                    const sel = document.getElementById(`writer-select-${p.id}`);
                    if (sel.value) handleAssign(p.id, sel.value);
                    else alert("Please select a writer from the dropdown first.");
                  }} disabled={loading}>Assign</Btn>
                </div>
              ])}
            />
          )}
          
          {activeProject ? (
            <AdminProjectChatView 
              project={projects.find(p => p.id === activeProject)} 
              freelancers={freelancers} 
              onClose={() => setActiveProject(null)} 
              userId={session?.user?.id}
              isMobile={isMobile}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 20, marginTop: 40 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Active Projects Overview</h3>
                <Table
                    cols={['Order ID', 'Service', 'Status', 'Writer', 'Client', 'Action']}
                    rows={projects.filter(p => p.status !== 'CREATED' && p.status !== 'UNASSIGNED' && p.status !== 'COMPLETED' && p.status !== 'CANCELLED').map(p => [
                      <span style={{ fontWeight: 600, color: 'var(--text-dim)' }}>#{p.id.slice(-6).toUpperCase()}</span>,
                      <span style={{ fontSize: 13 }}>{p.title}</span>,
                      <Pill label={p.status} color="var(--teal)" />,
                      <span style={{ fontSize: 13 }}>{p.freelancer?.name || 'Unassigned'}</span>,
                      <span style={{ fontSize: 13 }}>{p.student?.name || 'Unknown'}</span>,
                      <Btn small variant="ghost" onClick={() => setActiveProject(p.id)}>Manage Chat</Btn>
                    ])}
                  />
              </div>
              <div>
                <AdminNotificationsFeed session={session} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AdminProjectChatView({ project, freelancers, onClose, userId, isMobile }) {
  const [collabId, setCollabId] = useState('');
  const [adding, setAdding] = useState(false);

  const { messages, loading, errorAlert } = useChat({
    projectId: project.id,
    userId: userId || 'admin',
    role: 'ADMIN',
    chatType: 'CLIENT_CHAT',
  });

  const handleAddCollaborator = async () => {
    if (!collabId) return;
    setAdding(true);
    const existingCollabs = project.collaborators ? project.collaborators.map(c => c.id) : [];
    if (existingCollabs.includes(collabId) || project.freelancerId === collabId) {
      alert("This writer is already on the project.");
      setAdding(false);
      return;
    }
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collaboratorIds: [...existingCollabs, collabId] })
      });
      if (res.ok) {
        const writerName = freelancers.find(f => f.id === collabId)?.name || 'A writer';
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: project.id,
            content: `${writerName} has joined as a collaborator.`,
            chatType: 'CLIENT_CHAT',
            isSystem: true
          })
        });
        alert("Collaborator added successfully!");
        window.location.reload();
      } else {
        alert("Failed to add collaborator.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginTop: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: isMobile ? 12 : 0, padding: isMobile ? '12px' : '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Project #{project.id.slice(-6).toUpperCase()} Chat Feed</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Student: {project.student?.name} | Writer: {project.freelancer?.name}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: 8, width: isMobile ? '100%' : 'auto' }}>
          <select value={collabId} onChange={e => setCollabId(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 12, outline: 'none', width: isMobile ? '100%' : 'auto' }}>
            <option value="">Select Writer to Add...</option>
            {freelancers.filter(f => !['Suspended', 'Blocked'].includes(f.freelancerProfile?.status)).map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <Btn small onClick={handleAddCollaborator} disabled={adding || !collabId}>+ Add Collaborator</Btn>
        </div>
      </div>
      
      {/* Messages */}
      <div style={{ padding: 20, height: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading && <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>Loading chat...</div>}
        {errorAlert && <div style={{ color: 'var(--red)', fontSize: 13 }}>{errorAlert}</div>}
        {!loading && messages.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>No messages in this project yet.</div>}
        {messages.map(msg => {
          const isWriter = msg.role === 'FREELANCER';
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isWriter ? 'flex-end' : 'flex-start' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
                {msg.senderId === project.freelancerId ? 'Lead Writer' : isWriter ? 'Collaborator' : 'Student'} · {msg.createdAt instanceof Date ? msg.createdAt.toLocaleTimeString() : ''}
              </div>
              <div style={{ padding: '10px 14px', borderRadius: isWriter ? '10px 10px 3px 10px' : '10px 10px 10px 3px', background: isWriter ? 'rgba(13,148,136,0.1)' : 'var(--surface3)', border: `1px solid ${isWriter ? 'var(--border-teal)' : 'var(--border)'}`, color: 'var(--text)', fontSize: 13, maxWidth: '75%' }}>
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminNotificationsFeed({ session }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // 20s
    return () => clearInterval(interval);
  }, [session]);

  const ICONS = {
    new_order: '📥', assignment: '✍️', new_job: '🎯',
    status: '📋', message: '💬', payout: '💰',
    ticket: '🎫', deadline: '⏰', completed: '✅',
    revision: '🔄', system: '🔔'
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>System Notifications (Live Feed)</h3>
        <span style={{ fontSize: 10, color: 'var(--teal-light)', background: 'rgba(13,148,136,0.1)', padding: '2px 6px', borderRadius: 10 }}>Auto-updates</span>
      </div>
      <div style={{ maxHeight: 400, overflowY: 'auto', padding: '10px 0' }}>
        {loading && <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-dim)' }}>Loading feed...</div>}
        {!loading && notifications.length === 0 && <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-dim)' }}>No recent notifications.</div>}
        {!loading && notifications.map(n => {
          const icon = n.icon || ICONS[n.type] || '🔔';
          return (
            <div key={n.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, background: n.read ? 'transparent' : 'rgba(13,148,136,0.05)' }}>
              <div style={{ fontSize: 16, marginTop: 2 }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.msg}</div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
                  {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} · {new Date(n.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
