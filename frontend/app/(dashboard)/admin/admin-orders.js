"use client";
import React, { useState } from "react";
import { Pill, Btn, SectionHeader, Table } from "./admin-shared";
import { EagleEyePanel, DirectChatPanel } from "./admin-writers";
import { useChat } from "@/hooks/useChat";
import { useSession } from "next-auth/react";

export function AdminOrders({ projects = [], freelancers = [], setProjects }) {
  const [mainTab, setMainTab] = useState('Order Assignments');
  const [loading, setLoading] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkWriterId, setBulkWriterId] = useState('');
  const { data: session } = useSession();

  // Filter projects that need assignment (status is CREATED or UNASSIGNED)
  const unassignedProjects = projects.filter(p => p.status === 'CREATED' || p.status === 'UNASSIGNED');
  
  const handleAssign = async (projectId, writerId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerId: writerId, status: 'ASSIGNED' })
      });
      if (res.ok) {
        // Update local state instead of reload for smoother experience
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, freelancerId: writerId, status: 'ASSIGNED', freelancer: freelancers.find(f => f.id === writerId) } : p));
        return true;
      } else {
        alert("Failed to assign writer");
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
      const success = await handleAssign(id, bulkWriterId);
      if (success) successCount++;
    }
    alert(`Successfully assigned ${successCount} orders.`);
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
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, animation: 'fadeIn .3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
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
                  {freelancers.filter(f => (f.freelancerProfile?.status || 'Active') === 'Active').map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
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
                    {freelancers.filter(f => (f.freelancerProfile?.status || 'Active') === 'Active').map(f => (
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
            />
          ) : (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 40, marginBottom: 16 }}>Active Projects Overview</h3>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AdminProjectChatView({ project, freelancers, onClose, userId }) {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Project #{project.id.slice(-6).toUpperCase()} Chat Feed</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Student: {project.student?.name} | Writer: {project.freelancer?.name}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={collabId} onChange={e => setCollabId(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 12, outline: 'none' }}>
            <option value="">Select Writer to Add...</option>
            {freelancers.filter(f => (f.freelancerProfile?.status || 'Active') === 'Active').map(f => (
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
