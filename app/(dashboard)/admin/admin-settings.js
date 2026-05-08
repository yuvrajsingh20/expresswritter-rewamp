"use client";
import React, { useState, useEffect } from "react";
import { Pill, Btn, Card, CardHeader, SectionHeader, SubTabs, SaveBar, Toggle, Input, Select, Table, StatusDot } from "./admin-shared";
// ── SECTIONS 6, 7, 8: THEME, WORKFLOW, USERS ──

/* ── THEME SETTINGS ── */
export function AdminTheme() {
  const [theme, setTheme] = React.useState({
    bg: '#09090f', surface: '#101019', accent: '#0d9488',
    text: '#eefcfb', headingFont: 'Google Sans', bodyFont: 'Google Sans',
    buttonRadius: 6, cardRadius: 8, buttonStyle: 'filled',
    darkMode: true, compactDensity: false,
  });
  const [loading, setLoading] = React.useState(true);
  const [saved, setSaved] = React.useState(false);

  useEffect(() => {
    fetch('/api/admin/config/theme')
      .then(res => res.json())
      .then(data => {
        if (data) setTheme(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = () => {
    setSaved(true);
    fetch('/api/admin/config/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme)
    }).finally(() => {
      document.documentElement.style.setProperty('--teal', theme.accent);
      document.documentElement.style.setProperty('--bg', theme.bg);
      setTimeout(() => setSaved(false), 2500);
    });
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>Loading theme engine...</div>;

  const PRESETS = [
    { name: 'Teal Dark', bg: '#09090f', accent: '#0d9488' },
    { name: 'Violet Dark', bg: '#0d0d1a', accent: '#7c3aed' },
    { name: 'Crimson Dark', bg: '#0f090c', accent: '#e63946' },
    { name: 'Amber Dark', bg: '#0f0e09', accent: '#f59e0b' },
    { name: 'Slate Light', bg: '#f8f9fa', accent: '#0d9488' },
    { name: 'White Clean', bg: '#ffffff', accent: '#1a1a2e' },
  ];

  const FONTS = ['Google Sans', 'Inter', 'DM Sans', 'Helvetica Neue', 'Playfair Display', 'Sora', 'JetBrains Mono'];

  return (
    <div>
      <SectionHeader title="Theme & Appearance" subtitle="Customise the platform's visual identity — colors, typography, button styles and layout density." />

      {/* Presets */}
      <Card style={{ marginBottom: 20, padding: '16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>Quick Presets</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {PRESETS.map(p => (
            <div key={p.name} onClick={() => setTheme(t => ({ ...t, bg: p.bg, accent: p.accent }))} style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden', border: `2px solid ${theme.accent === p.accent && theme.bg === p.bg ? 'var(--teal)' : 'var(--border)'}`, transition: 'border-color .2s' }}>
              <div style={{ width: 80, height: 48, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 28, height: 14, borderRadius: 3, background: p.accent }} />
              </div>
              <div style={{ fontSize: 10, textAlign: 'center', padding: '4px 6px', color: 'var(--text-muted)', background: 'var(--surface3)' }}>{p.name}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Colors */}
        <Card>
          <CardHeader title="Colors" />
          <div style={{ padding: 16 }}>
            {[
              { label: 'Background', key: 'bg' },
              { label: 'Surface', key: 'surface' },
              { label: 'Accent / Primary', key: 'accent' },
              { label: 'Text Color', key: 'text' },
            ].map(c => (
              <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', flex: 1 }}>{c.label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: theme[c.key], border: '2px solid var(--border)', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                    <input type="color" value={theme[c.key]} onChange={e => setTheme(t => ({ ...t, [c.key]: e.target.value }))} style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', width: 70 }}>{theme[c.key]}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader title="Typography" />
          <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Heading Font</label>
              <select value={theme.headingFont} onChange={e => setTheme(t => ({ ...t, headingFont: e.target.value }))} style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13, fontFamily: theme.headingFont, outline: 'none', cursor: 'pointer' }}>
                {FONTS.map(f => <option key={f} style={{ fontFamily: f }}>{f}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Body Font</label>
              <select value={theme.bodyFont} onChange={e => setTheme(t => ({ ...t, bodyFont: e.target.value }))} style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13, fontFamily: theme.bodyFont, outline: 'none', cursor: 'pointer' }}>
                {FONTS.map(f => <option key={f} style={{ fontFamily: f }}>{f}</option>)}
              </select>
            </div>
            <div style={{ padding: '14px', background: 'var(--surface3)', borderRadius: 6, border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: theme.headingFont, fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Preview Heading</div>
              <div style={{ fontFamily: theme.bodyFont, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>This is body text preview in {theme.bodyFont}. Clear, legible and professional.</div>
            </div>
          </div>
        </Card>

        {/* Buttons & Shape */}
        <Card>
          <CardHeader title="Buttons & Shapes" />
          <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>Button Radius: {theme.buttonRadius}px</label>
              <input type="range" min={0} max={24} value={theme.buttonRadius} onChange={e => setTheme(t => ({ ...t, buttonRadius: +e.target.value }))} style={{ width: '100%', accentColor: 'var(--teal)', cursor: 'pointer' }} />
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                {['filled', 'outlined', 'ghost'].map(s => (
                  <button key={s} onClick={() => setTheme(t => ({ ...t, buttonStyle: s }))} style={{ padding: '8px 16px', borderRadius: theme.buttonRadius, border: `1.5px solid ${theme.accent}`, background: theme.buttonStyle === s ? theme.accent : 'transparent', color: theme.buttonStyle === s ? '#fff' : theme.accent, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 600, transition: 'all .2s' }}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>Card Radius: {theme.cardRadius}px</label>
              <input type="range" min={0} max={24} value={theme.cardRadius} onChange={e => setTheme(t => ({ ...t, cardRadius: +e.target.value }))} style={{ width: '100%', accentColor: 'var(--teal)', cursor: 'pointer' }} />
              <div style={{ marginTop: 12, height: 60, background: 'var(--surface3)', borderRadius: theme.cardRadius, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-muted)', transition: 'border-radius .3s' }}>Card preview</div>
            </div>
          </div>
        </Card>

        {/* Layout */}
        <Card>
          <CardHeader title="Layout & Display" />
          <div style={{ padding: 16 }}>
            <Toggle label="Dark Mode" sublabel="Toggle between dark and light theme" value={theme.darkMode} onChange={v => setTheme(t => ({ ...t, darkMode: v }))} />
            <Toggle label="Compact Density" sublabel="Reduce padding for more information density" value={theme.compactDensity} onChange={v => setTheme(t => ({ ...t, compactDensity: v }))} />
            <Toggle label="Sidebar Collapsed by Default" value={false} onChange={() => {}} />
            <Toggle label="Animated Transitions" value={true} onChange={() => {}} />
            <Toggle label="Show Writer Avatars" value={true} onChange={() => {}} />
            <SaveBar onSave={save} saved={saved} />
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── ORDER WORKFLOW MATRIX ── */
export function AdminWorkflow() {
  const [saved, setSaved] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [automations, setAutomations] = React.useState({
    autoAssign: true, autoEscalate: true, slaAlerts: true, clientNotify: true, writerNotify: true, aiQC: false,
  });

  useEffect(() => {
    fetch('/api/admin/config/workflow')
      .then(res => res.json())
      .then(data => {
        if (data) setAutomations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = () => {
    setSaved(true);
    fetch('/api/admin/config/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(automations)
    }).finally(() => {
      setTimeout(() => setSaved(false), 2500);
    });
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>Loading workflow engine...</div>;

  const STATUSES = [
    { id: 'new', label: 'New Order', color: '#3b82f6', icon: '📥', desc: 'Order received, awaiting writer assignment' },
    { id: 'assigned', label: 'Writer Assigned', color: '#8b5cf6', icon: '✍️', desc: 'Writer confirmed and started' },
    { id: 'progress', label: 'In Progress', color: '#0d9488', icon: '⚡', desc: 'Active writing underway' },
    { id: 'review', label: 'Under Review', color: '#f59e0b', icon: '🔍', desc: 'Writer internal quality review' },
    { id: 'quality', label: 'Quality Check', color: '#f59e0b', icon: '✅', desc: 'Platform QC team review' },
    { id: 'delivered', label: 'Delivered', color: '#22c55e', icon: '📦', desc: 'Content sent to client' },
    { id: 'revision', label: 'Revision', color: '#ef4444', icon: '🔄', desc: 'Client requested changes' },
    { id: 'closed', label: 'Closed', color: '#6b7280', icon: '🔒', desc: 'Order finalised and archived' },
  ];

  const TRANSITIONS = [
    { from: 'new', to: 'assigned', auto: true, trigger: 'Writer accepts order', sla: '2h' },
    { from: 'assigned', to: 'progress', auto: true, trigger: 'Writer begins writing', sla: '1h' },
    { from: 'progress', to: 'review', auto: false, trigger: 'Writer marks ready for review', sla: '—' },
    { from: 'review', to: 'quality', auto: true, trigger: 'Internal review passed', sla: '4h' },
    { from: 'quality', to: 'delivered', auto: false, trigger: 'QC team approves', sla: '—' },
    { from: 'delivered', to: 'revision', auto: false, trigger: 'Client requests revision', sla: '7d window' },
    { from: 'revision', to: 'progress', auto: true, trigger: 'Writer acknowledges revision', sla: '2h' },
    { from: 'delivered', to: 'closed', auto: true, trigger: 'Client approves or 14 days pass', sla: '14d' },
  ];

  return (
    <div>
      <SectionHeader title="Order Workflow Matrix" subtitle="Define how orders move through the platform. Configure status transitions, SLAs and automation triggers." />

      {/* Status nodes */}
      <Card style={{ marginBottom: 20, padding: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 16 }}>Status Pipeline</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
          {STATUSES.map((s, i) => (
            <React.Fragment key={s.id}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}18`, border: `2px solid ${s.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: s.color, textAlign: 'center', maxWidth: 64, lineHeight: 1.3 }}>{s.label}</div>
              </div>
              {i < STATUSES.length - 1 && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingBottom: 18, minWidth: 20 }}>
                  <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg,${STATUSES[i].color},${STATUSES[i+1].color})`, opacity: 0.4 }} />
                  <div style={{ color: 'var(--text-dim)', fontSize: 10, flexShrink: 0 }}>▸</div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Transition rules */}
      <Card style={{ marginBottom: 20 }}>
        <CardHeader title="Transition Rules & SLAs" right={<Btn small variant="outline">+ Add Rule</Btn>} />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface3)' }}>
              {['From', 'To', 'Trigger', 'SLA', 'Auto', 'Actions'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRANSITIONS.map((t, i) => {
              const fs = STATUSES.find(s => s.id === t.from);
              const ts = STATUSES.find(s => s.id === t.to);
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '9px 14px' }}><Pill label={fs?.label || t.from} color={fs?.color || 'var(--text-dim)'} /></td>
                  <td style={{ padding: '9px 14px' }}><Pill label={ts?.label || t.to} color={ts?.color || 'var(--text-dim)'} /></td>
                  <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{t.trigger}</td>
                  <td style={{ padding: '9px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>{t.sla}</td>
                  <td style={{ padding: '9px 14px' }}><Pill label={t.auto ? 'Auto' : 'Manual'} color={t.auto ? 'var(--green)' : 'var(--amber)'} /></td>
                  <td style={{ padding: '9px 14px' }}><Btn small variant="ghost">Edit</Btn></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Automations */}
      <Card>
        <CardHeader title="Workflow Automations" />
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div style={{ paddingRight: 16, borderRight: '1px solid var(--border)' }}>
            <Toggle label="Auto-assign writer on new order" sublabel="Matches writer by skill, rating and availability" value={automations.autoAssign} onChange={v => setAutomations(a => ({ ...a, autoAssign: v }))} />
            <Toggle label="Auto-escalate on SLA breach" sublabel="Triggers ticket + AI notification" value={automations.autoEscalate} onChange={v => setAutomations(a => ({ ...a, autoEscalate: v }))} />
            <Toggle label="SLA countdown alerts" sublabel="Warn writer 2h before deadline" value={automations.slaAlerts} onChange={v => setAutomations(a => ({ ...a, slaAlerts: v }))} />
          </div>
          <div style={{ paddingLeft: 16 }}>
            <Toggle label="Notify client on status change" value={automations.clientNotify} onChange={v => setAutomations(a => ({ ...a, clientNotify: v }))} />
            <Toggle label="Notify writer on new message" value={automations.writerNotify} onChange={v => setAutomations(a => ({ ...a, writerNotify: v }))} />
            <Toggle label="AI Quality Check before delivery" sublabel="Claude/GPT scans content for quality" value={automations.aiQC} onChange={v => setAutomations(a => ({ ...a, aiQC: v }))} />
          </div>
        </div>
        <div style={{ padding: '0 16px 16px' }}><SaveBar onSave={save} saved={saved} /></div>
      </Card>
    </div>
  );
}

/* ── USER MANAGEMENT ── */
export function AdminUsers() {
  const [tab, setTab] = React.useState('Users');
  const [showCreate, setShowCreate] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [newUser, setNewUser] = React.useState({ name: '', email: '', role: 'STUDENT', sendInvite: true });

  const ROLES = [
    { role: 'ADMIN', color: '#ef4444', perms: ['All access', 'Billing', 'User management', 'System settings'] },
    { role: 'SUB_ADMIN', color: '#f59e0b', perms: ['Tickets', 'Writer management', 'Order management', 'Reports'] },
    { role: 'FREELANCER', color: '#3b82f6', perms: ['Orders', 'Writer profiles', 'Quality review'] },
    { role: 'STUDENT', color: '#8b5cf6', perms: ['Projects', 'Payments', 'Basic profile'] },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleRoleUpdate = async (userId, role) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role })
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.role) return alert('Email and Role are required');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setShowCreate(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        setNewUser({ name: '', email: '', role: 'STUDENT', sendInvite: true });
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create user');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <SectionHeader
        title="User & Access Management"
        subtitle="Manage accounts, roles, permissions and login settings."
        action={<Btn onClick={() => setShowCreate(s => !s)}>{showCreate ? '✕ Cancel' : '+ Add User'}</Btn>}
      />
      <SubTabs tabs={['Users', 'Roles & Permissions', 'Login Settings', 'Audit Log']} active={tab} onChange={setTab} />

      {showCreate && (
        <Card style={{ marginBottom: 20, padding: 16, border: '1px solid var(--border-teal)', animation: 'fadeUp .25s ease' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: 'var(--teal-light)' }}>Create New Account</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <Input label="Full Name" value={newUser.name} onChange={v => setNewUser(u => ({ ...u, name: v }))} placeholder="Jane Smith" />
            <Input label="Email Address" value={newUser.email} onChange={v => setNewUser(u => ({ ...u, email: v }))} placeholder="jane@example.com" type="email" />
            <Select label="Role" value={newUser.role} onChange={v => setNewUser(u => ({ ...u, role: v }))} options={ROLES.map(r => r.role)} />
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14 }}>
            <Btn onClick={handleCreateUser}>Create User</Btn>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" checked={newUser.sendInvite} onChange={e => setNewUser(u => ({ ...u, sendInvite: e.target.checked }))} style={{ accentColor: 'var(--teal)' }} />
              Send email invitation
            </label>
          </div>
        </Card>
      )}

      {tab === 'Users' && (
        <Card style={{ animation: 'fadeIn .3s ease' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>Loading users...</div>
          ) : (
            <Table
              cols={['User', 'Email', 'Role', 'Status', 'Joined', 'Actions']}
              rows={users.map(u => [
                <span style={{ fontWeight: 600 }}>{u.name || 'No Name'}</span>,
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{u.email}</span>,
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Pill label={u.role} color={ROLES.find(r => r.role === u.role)?.color || 'var(--text-dim)'} />
                  <select 
                    value={u.role} 
                    onChange={(e) => handleRoleUpdate(u.id, e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: 10, cursor: 'pointer' }}
                  >
                    {ROLES.map(r => <option key={r.role} value={r.role}>{r.role}</option>)}
                  </select>
                </div>,
                <Pill label="Active" color="var(--green)" />,
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{new Date(u.createdAt).toLocaleDateString()}</span>,
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn small variant="ghost" onClick={() => handleDelete(u.id)}>Delete</Btn>
                </div>,
              ])}
            />
          )}
        </Card>
      )}

      {tab === 'Roles & Permissions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14, animation: 'fadeIn .3s ease' }}>
          {ROLES.map(r => (
            <Card key={r.role} style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.color }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>{r.role}</span>
              </div>
              {r.perms.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ color: r.color, fontSize: 12 }}>✓</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p}</span>
                </div>
              ))}
              <Btn small variant="outline" style={{ marginTop: 10, width: '100%' }}>Edit Permissions</Btn>
            </Card>
          ))}
        </div>
      )}

      {tab === 'Login Settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, animation: 'fadeIn .3s ease' }}>
          <Card>
            <CardHeader title="Authentication" />
            <div style={{ padding: 16 }}>
              <Toggle label="Require MFA for all admin users" sublabel="TOTP via Authenticator app or SMS" value={true} onChange={() => {}} />
              <Toggle label="Google SSO" sublabel="Allow admin login via Google OAuth" value={true} onChange={() => {}} />
              <Toggle label="IP Allowlist" sublabel="Restrict login to approved IP ranges" value={false} onChange={() => {}} />
              <Toggle label="Session timeout after inactivity" value={true} onChange={() => {}} />
              <Input label="Session Timeout (minutes)" value="30" onChange={() => {}} />
              <SaveBar onSave={save} saved={saved} />
            </div>
          </Card>
          <Card>
            <CardHeader title="Password Policy" />
            <div style={{ padding: 16 }}>
              <Toggle label="Enforce strong passwords" sublabel="Min 10 chars, uppercase, number, symbol" value={true} onChange={() => {}} />
              <Toggle label="Password expiry every 90 days" value={false} onChange={() => {}} />
              <Toggle label="Prevent password reuse (last 5)" value={true} onChange={() => {}} />
              <Toggle label="Lockout after 5 failed attempts" value={true} onChange={() => {}} />
              <Input label="Lockout Duration (minutes)" value="15" onChange={() => {}} />
              <SaveBar onSave={save} saved={saved} />
            </div>
          </Card>
        </div>
      )}

      {tab === 'Audit Log' && (
        <Card style={{ animation: 'fadeIn .3s ease' }}>
          <CardHeader title="Recent Admin Actions" right={<Btn small variant="outline">Export Log</Btn>} />
          <Table
            cols={['Time', 'User', 'Action', 'Target', 'IP']}
            rows={[
              ['2 min ago', 'Admin User', 'Updated escalation matrix', 'Ticketing System', '192.168.1.1'],
              ['1h ago', 'Sarah Mitchell', 'Approved writer WR-006', 'Rahul Desai', '10.0.0.4'],
              ['3h ago', 'Ravi Sharma', 'Ran writer payouts', 'Finance → 4 writers', '10.0.0.7'],
              ['5h ago', 'Admin User', 'Updated Stripe API keys', 'Integrations', '192.168.1.1'],
              ['1d ago', 'Nadia Kowalski', 'Resolved ticket TKT-1031', 'Ticketing System', '10.0.0.9'],
              ['1d ago', 'Admin User', 'Created user account', 'Nadia Kowalski', '192.168.1.1'],
            ].map(row => row.map((cell, i) => i === 0 ? <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>{cell}</span> : cell))}
          />
        </Card>
      )}
    </div>
  );
}


