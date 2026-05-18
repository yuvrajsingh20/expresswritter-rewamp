"use client";
import React, { useState, useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { Pill, Btn, Card, CardHeader, SectionHeader, SubTabs, SaveBar, Toggle, StatusDot, showToast } from "./admin-shared";

// ── SECTION 5: WRITER MANAGEMENT ──
export function AdminWriters({ freelancers = [], isMobile }) {
  const [mainTab, setMainTab] = React.useState('Writers');
  const [tab, setTab] = useState('All Writers');
  const [selected, setSelected] = useState(null);
  const [localFreelancers, setLocalFreelancers] = useState(freelancers);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [saved, setSaved] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [rejectionModal, setRejectionModal] = useState({ open: false, id: null });
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    setLocalFreelancers(freelancers);
  }, [freelancers]);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const handleUpdate = async (id, data) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/freelancers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        save();
        setLocalFreelancers(prev => prev.map(f => f.id === id ? {
          ...f,
          freelancerProfile: { ...f.freelancerProfile, ...data }
        } : f));
        setLoadingId(null);
        return true;
      }
      setLoadingId(null);
      return false;
    } catch (err) {
      console.error(err);
      setLoadingId(null);
      return false;
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    const ok = await handleUpdate(rejectionModal.id, { status: 'Rejected', rejectionReason });
    if (ok) {
      setRejectionModal({ open: false, id: null });
      setRejectionReason('');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    let data = {};
    if (bulkAction === 'Suspend') data = { status: 'Suspended' };
    else if (bulkAction === 'Approve') data = { status: 'Active', isVerified: true };
    else if (bulkAction === 'Deactivate') data = { status: 'Inactive' };

    let successCount = 0;
    for (const id of selectedIds) {
      const ok = await handleUpdate(id, data);
      if (ok) successCount++;
    }
    showToast(`Bulk action applied to ${successCount} writers.`);
    setSelectedIds([]);
    setBulkAction('');
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(w => w.id));
  };

  const toggleSelect = (e, id) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const WRITERS = localFreelancers.map(f => ({
    id: f.id,
    name: f.name,
    avatar: f.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    email: f.email,
    country: f.freelancerProfile?.country || 'N/A',
    skills: f.freelancerProfile?.skills || [],
    rating: f.freelancerProfile?.rating || 0,
    orders: f.freelancerProfile?.projectsCompleted || 0,
    revenue: f.freelancerProfile?.totalEarnings || 0,
    status: f.freelancerProfile?.status || 'Active',
    verified: f.freelancerProfile?.isVerified || false,
    kycDone: f.freelancerProfile?.kycDone || false,
    joined: new Date(f.freelancerProfile?.createdAt || Date.now()).toLocaleDateString(),
    availability: f.freelancerProfile?.availability ?? true,
    compliance: f.freelancerProfile?.kycDone ? 'Compliant' : 'KYC Pending',
    onTimeRate: f.freelancerProfile?.onTimeRate || 0,
    responseTime: f.freelancerProfile?.responseTime || 'N/A',
    earnings: f.freelancerProfile?.totalEarnings || 0,
    payMethod: f.freelancerProfile?.preferredPaymentMethod || 'N/A',
    currency: f.freelancerProfile?.currency || 'USD',
    education: f.freelancerProfile?.education || 'N/A',
    experience: f.freelancerProfile?.experience || 0,
    resumeUrl: f.freelancerProfile?.resumeUrl || '',
    bio: f.freelancerProfile?.bio || '',
    linkedinUrl: f.freelancerProfile?.linkedinUrl || '',
    portfolioUrl: f.freelancerProfile?.portfolioUrl || '',
    age: f.freelancerProfile?.age || 'N/A',
    gender: f.freelancerProfile?.gender || 'N/A'
  }));

  const STATUS_COLOR = { Active: 'var(--green)', Inactive: 'var(--text-dim)', 'Pending Approval': 'var(--amber)', Suspended: 'var(--red)', Rejected: 'var(--red)' };
  const COMPLIANCE_COLOR = { Compliant: 'var(--green)', 'KYC Pending': 'var(--amber)', 'Under Review': 'var(--amber)', 'Non-Compliant': 'var(--red)' };

  const filtered = tab === 'All Writers' ? WRITERS :
    tab === 'Active' ? WRITERS.filter(w => w.status === 'Active') :
      tab === 'Pending' ? WRITERS.filter(w => w.status === 'Pending Approval') :
        tab === 'Inactive' ? WRITERS.filter(w => w.status === 'Inactive') : WRITERS;

  const selected_w = WRITERS.find(w => w.id === selected);

  return (
    <div>
      <SectionHeader
        title="Writer Management"
        subtitle="Onboard, verify, manage KPIs, monitor chats, and message writers."
        action={<Btn onClick={() => {
          import('./admin-shared').then(m => m.showToast('Invite link copied to clipboard! Share it with writers.'));
        }}>+ Invite Writer</Btn>}
      />

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {['Writers', 'Eagle Eye', 'Direct Chat'].map(t => (
          <button key={t} onClick={() => setMainTab(t)} style={{
            padding: '8px 18px', border: 'none', borderBottom: `2px solid ${mainTab === t ? 'var(--teal)' : 'transparent'}`,
            background: 'transparent', color: mainTab === t ? 'var(--teal-light)' : 'var(--text-muted)',
            fontFamily: 'var(--font)', fontSize: 13, fontWeight: mainTab === t ? 700 : 400, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            {t === 'Eagle Eye' ? '🦅' : t === 'Direct Chat' ? '💬' : '✍️'} {t}
          </button>
        ))}
      </div>

      {mainTab === 'Eagle Eye' && <EagleEyePanel isMobile={isMobile} />}
      {mainTab === 'Direct Chat' && <DirectChatPanel freelancers={WRITERS} isMobile={isMobile} />}
      {mainTab !== 'Writers' ? null : (
        <div>
          <SubTabs tabs={['All Writers', 'Active', 'Pending', 'Inactive']} active={tab} onChange={t => { setTab(t); setSelected(null); }} />

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, height: isMobile ? 'auto' : 'calc(100vh - 340px)', minHeight: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Select All ({filtered.length})</span>
              </div>
              {selectedIds.length > 0 && (
                <div style={{ display: 'flex', gap: 8, animation: 'fadeIn .2s ease' }}>
                  <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} style={{ background: 'var(--surface3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 8px', borderRadius: 6, fontSize: 12 }}>
                    <option value="">Bulk Action...</option>
                    <option value="Approve">Approve & Verify</option>
                    <option value="Suspend">Suspend Accounts</option>
                    <option value="Deactivate">Deactivate</option>
                  </select>
                  <Btn small onClick={handleBulkAction} disabled={!bulkAction}>Apply</Btn>
                </div>
              )}
            </div>
            <div style={{ width: isMobile ? (selected ? '0%' : '100%') : (selected ? 340 : '100%'), display: isMobile && selected ? 'none' : 'flex', maxWidth: selected ? 'none' : 1200, flexShrink: 0, flexDirection: 'column', gap: 8, overflowY: 'auto', transition: 'width .3s' }}>
              {filtered.map(w => (
                <div key={w.id} onClick={() => setSelected(w.id === selected ? null : w.id)} style={{
                  background: selected === w.id ? 'linear-gradient(135deg, rgba(13,148,136,0.15), rgba(15,118,110,0.05))' : 'var(--surface2)',
                  border: `1px solid ${selected === w.id ? 'var(--teal)' : 'var(--border)'}`,
                  boxShadow: selected === w.id ? '0 4px 12px rgba(0,0,0,0.2), 0 0 0 1px var(--teal)' : 'none',
                  borderRadius: 12, padding: '16px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input type="checkbox" checked={selectedIds.includes(w.id)} onChange={(e) => toggleSelect(e, w.id)} style={{ cursor: 'pointer', accentColor: 'var(--teal)' }} />
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, var(--teal), #0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{w.avatar}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{w.name}</span>
                        {w.verified && <span style={{ fontSize: 12, color: 'var(--teal-light)' }}>✓</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Pill label={w.status} color={STATUS_COLOR[w.status]} />
                        <Pill label={w.compliance} color={COMPLIANCE_COLOR[w.compliance]} />
                        <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 4 }}>{w.country} · ★ {w.rating}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal-light)' }}>{w.orders} orders</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>${w.revenue.toLocaleString()} total</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selected_w && (
              <div style={{ flex: 1, overflowY: 'auto', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, animation: 'slideLeft .25s ease' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'flex-start', gap: 14 }}>
                  {isMobile && (
                    <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: 'var(--teal-light)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4, padding: 0, marginBottom: 8 }}>
                      ← Back to List
                    </button>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,var(--teal),#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff', flexShrink: 0 }}>{selected_w.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{selected_w.name}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                        <Pill label={selected_w.status} color={STATUS_COLOR[selected_w.status]} />
                        <Pill label={selected_w.compliance} color={COMPLIANCE_COLOR[selected_w.compliance]} />
                        {selected_w.badge !== '—' && <Pill label={selected_w.badge} color="var(--gold)" />}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{selected_w.email} · {selected_w.country} · Joined {selected_w.joined}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, justifyContent: isMobile ? 'flex-start' : 'flex-end', marginTop: isMobile ? '8px' : '0' }}>
                    {selected_w.status === 'Pending Approval' && (
                      <>
                        <Btn small onClick={() => handleUpdate(selected_w.id, { status: 'Active', isVerified: true })} loading={loadingId === selected_w.id}>
                          {loadingId === selected_w.id ? '...' : '✓ Approve'}
                        </Btn>
                        <Btn small variant="danger" onClick={() => setRejectionModal({ open: true, id: selected_w.id })} disabled={loadingId === selected_w.id}>
                          ✗ Reject
                        </Btn>
                      </>
                    )}
                    {selected_w.status === 'Active' && <Btn small variant="danger" onClick={() => handleUpdate(selected_w.id, { status: 'Inactive' })} loading={loadingId === selected_w.id}>Deactivate</Btn>}
                    {selected_w.status === 'Inactive' && <Btn small onClick={() => handleUpdate(selected_w.id, { status: 'Active' })} loading={loadingId === selected_w.id}>Activate</Btn>}
                    <Btn small variant="outline" onClick={() => setMainTab('Direct Chat')}>Message</Btn>
                    <button onClick={() => setSelected(null)} style={{ background: 'var(--surface3)', border: '1px solid var(--border)', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', marginLeft: 4 }} aria-label="Close details">
                      ✕
                    </button>
                  </div>
                </div>

                <div style={{ padding: 16, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                  <Card>
                    <CardHeader title="KPI / KRA" />
                    <div style={{ padding: 12 }}>
                      {[
                        { label: 'On-Time Delivery', val: `${selected_w.onTimeRate}%`, target: '≥ 95%', ok: selected_w.onTimeRate >= 95 },
                        { label: 'Avg Rating', val: selected_w.rating, target: '≥ 4.8', ok: selected_w.rating >= 4.8 },
                        { label: 'Response Time', val: selected_w.responseTime, target: '< 4h', ok: true },
                        { label: 'Revision Rate', val: '8%', target: '≤ 15%', ok: true },
                        { label: 'Orders Completed', val: selected_w.orders, target: '—', ok: true },
                      ].map(k => (
                        <div key={k.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{k.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: k.ok ? 'var(--green)' : 'var(--red)' }}>{k.val}</span>
                            <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Target: {k.target}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <CardHeader title="Verification & Compliance" />
                    <div style={{ padding: 12 }}>
                      {/* Application Details */}
                      <div style={{ marginBottom: 16, padding: '12px', background: 'var(--surface3)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, color: 'var(--teal-light)', marginBottom: 8, fontWeight: 700, letterSpacing: '0.05em' }}>APPLICATION DETAILS</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>Qualification</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{selected_w.education}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>Experience</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{selected_w.experience} years</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>Age / Gender</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{selected_w.age} / {selected_w.gender}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>Bio</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{selected_w.bio || 'No bio provided'}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                          {selected_w.resumeUrl && (
                            <a href={selected_w.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-light)', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, background: 'rgba(13,148,136,0.1)', padding: '4px 8px', borderRadius: 4 }}>
                              📄 Resume ↗
                            </a>
                          )}
                          {selected_w.linkedinUrl && (
                            <a href={selected_w.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, background: 'rgba(0,119,181,0.1)', padding: '4px 8px', borderRadius: 4 }}>
                              🔗 LinkedIn ↗
                            </a>
                          )}
                          {selected_w.portfolioUrl && (
                            <a href={selected_w.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, background: 'rgba(212,181,60,0.1)', padding: '4px 8px', borderRadius: 4 }}>
                              🎨 Portfolio ↗
                            </a>
                          )}
                        </div>
                      </div>

                      {[
                        { label: 'Identity Verified', done: selected_w.verified },
                        { label: 'KYC Submitted', done: selected_w.kycDone },
                        { label: 'Writing Assessment Passed', done: selected_w.orders > 0 },
                        { label: 'NDA Signed', done: selected_w.verified },
                        { label: 'Tax Info Submitted', done: selected_w.kycDone },
                      ].map(v => (
                        <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ color: v.done ? 'var(--green)' : 'var(--amber)', fontSize: 14 }}>{v.done ? '✓' : '○'}</span>
                          <span style={{ fontSize: 12, color: v.done ? 'var(--text)' : 'var(--text-muted)' }}>{v.label}</span>
                          {!v.done && <Btn small variant="ghost" onClick={() => {
                            import('./admin-shared').then(m => m.showToast(`Request for ${v.label} sent to ${selected_w.name}.`));
                          }} style={{ marginLeft: 'auto', fontSize: 10 }}>Request</Btn>}
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <CardHeader title="Payment Settings" />
                    <div style={{ padding: 12 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8, marginBottom: 10 }}>
                        {[['Method', selected_w.payMethod], ['Currency', selected_w.currency], ['Total Earned', `$${selected_w.earnings.toLocaleString()}`], ['Platform Share', '30%']].map(([k, v]) => (
                          <div key={k} style={{ background: 'var(--surface3)', borderRadius: 6, padding: '8px 10px' }}>
                            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>{k}</div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <Toggle label="Immediate payout on delivery" value={false} onChange={() => {
                        import('./admin-shared').then(m => m.showToast('Payment settings saved.'));
                      }} />
                      <Toggle label="Auto-approve orders" value={selected_w.status === 'Active'} onChange={() => {
                        handleUpdate(selected_w.id, { status: selected_w.status === 'Active' ? 'Inactive' : 'Active' });
                      }} />
                    </div>
                  </Card>

                  <Card>
                    <CardHeader title="Skills & Services" />
                    <div style={{ padding: 12 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                        {selected_w.skills.map(s => <Pill key={s} label={s} color="var(--teal)" />)}
                      </div>
                      <Toggle label="Available for new orders" value={selected_w.availability} onChange={(val) => {
                        handleUpdate(selected_w.id, { availability: val });
                      }} />
                      <Toggle label="Featured in marketplace" value={false} onChange={() => {
                        import('./admin-shared').then(m => m.showToast('Writer badge updated.'));
                      }} />
                      <Toggle label="Eligible for urgent orders" value={selected_w.rating >= 4.9} onChange={() => {
                        import('./admin-shared').then(m => m.showToast('Eligibility settings saved.'));
                      }} />
                      <SaveBar onSave={save} saved={saved} />
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {rejectionModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 400, animation: 'fadeUp .2s ease' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Reject Writer Application</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Please provide a reason for rejection. This will be shown to the writer.</p>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. Insufficient experience in technical writing..."
              style={{ width: '100%', height: 100, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, color: 'var(--text)', fontSize: 13, marginBottom: 20, outline: 'none', resize: 'none' }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="outline" onClick={() => setRejectionModal({ open: false, id: null })}>Cancel</Btn>
              <Btn variant="danger" onClick={handleReject} disabled={!rejectionReason.trim() || loadingId !== null}>
                {loadingId !== null ? 'Rejecting...' : 'Reject Application'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function EagleEyePanel({ isMobile }) {
  const [flagged, setFlagged] = React.useState([]);
  const [live, setLive] = React.useState([]);
  React.useEffect(() => {
    const s = getSocket();
    s.emit('join_chat', { role: 'ADMIN', userId: 'admin' });
    s.on('flagged_message', (d) => setFlagged(p => [d, ...p].slice(0, 50)));
    s.on('monitor_message', (d) => setLive(p => [{ ...d, ts: new Date() }, ...p].slice(0, 100)));
    return () => {
      s.off('flagged_message');
      s.off('monitor_message');
    };
  }, []);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, height: isMobile ? 'auto' : 'calc(100vh - 320px)' }}>
      <div style={{ background: 'var(--surface2)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.06)' }}>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13, color: '#ef4444' }}>Blocked Messages</div><div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Content filter violations</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#ef4444', fontWeight: 600 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} /> LIVE</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {flagged.length === 0 ? <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13, marginTop: 40 }}>Monitoring... No violations detected</div>
            : flagged.map((m, i) => (
              <div key={i} style={{ background: 'var(--surface3)', borderLeft: '3px solid #ef4444', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444' }}>BLOCKED</span>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>XW-{String(m.projectId || '').slice(-5).toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 6, fontStyle: 'italic' }}>"{m.content}"</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {m.reasons && m.reasons.phone && <span style={{ fontSize: 10, color: '#ef4444' }}>Phone</span>}
                  {m.reasons && m.reasons.email && <span style={{ fontSize: 10, color: '#ef4444' }}>Email</span>}
                  {m.reasons && m.reasons.link && <span style={{ fontSize: 10, color: '#ef4444' }}>Link</span>}
                </div>
              </div>
            ))}
        </div>
      </div>
      <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13 }}>Live Message Stream</div><div style={{ fontSize: 10, color: 'var(--text-dim)' }}>All CLIENT_CHAT traffic</div></div>
          <div style={{ fontSize: 11, color: 'var(--teal-light)', fontWeight: 600 }}>{live.length} msgs</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {live.length === 0 ? <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13, marginTop: 40 }}>Listening for messages...</div>
            : live.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 10px', background: 'var(--surface3)', borderRadius: 7 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--teal-light)' }}>{m.senderRole} XW-{String(m.projectId || '').slice(-5).toUpperCase()}</span>
                    <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>{m.ts && m.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.content}</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export function DirectChatPanel({ freelancers, isMobile }) {
  const [activeId, setActiveId] = React.useState(null);
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState([]);
  const [adminId, setAdminId] = React.useState(null);
  const endRef = React.useRef(null);
  React.useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(s => { if (s && s.user && s.user.id) setAdminId(s.user.id); });
    const s = getSocket();
    s.on('receive_message', (data) => {
      if (data.chatType === 'ADMIN_CHAT') setMessages(p => p.some(m => m.id === data.id) ? p : [...p, { id: data.id, content: data.content, from: 'them', time: new Date(data.timestamp) }]);
    });
    return () => s.off('receive_message');
  }, []);
  React.useEffect(() => {
    if (!activeId || !adminId) return;
    setMessages([]);
    fetch('/api/messages?senderId=' + adminId + '&receiverId=' + activeId + '&type=ADMIN_CHAT').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setMessages(data.map(m => ({ id: m.id, content: m.content, from: m.senderId === adminId ? 'me' : 'them', time: new Date(m.createdAt) })));
    });
    getSocket().emit('join_chat', { userId: adminId, role: 'ADMIN' });
  }, [activeId, adminId]);
  React.useEffect(() => { if (endRef.current) endRef.current.parentElement.scrollTop = 99999; }, [messages.length]);
  const send = async () => {
    if (!input.trim() || !adminId || !activeId) return;
    const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: input, chatType: 'ADMIN_CHAT', receiverId: activeId }) });
    if (res.ok) {
      const saved = await res.json();
      getSocket().emit('send_message', { id: saved.id, content: saved.content, senderId: adminId, receiverId: activeId, senderRole: 'ADMIN', chatType: 'ADMIN_CHAT' });
      setMessages(p => [...p, { id: saved.id, content: saved.content, from: 'me', time: new Date() }]);
      setInput('');
    }
  };
  const active = freelancers ? freelancers.find(f => f.id === activeId) : null;
  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: isMobile ? 'auto' : 'calc(100vh - 320px)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ width: isMobile ? '100%' : 240, borderRight: isMobile ? 'none' : '1px solid var(--border)', borderBottom: isMobile ? '1px solid var(--border)' : 'none', background: 'var(--surface2)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 13 }}>Writers</div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {(freelancers || []).map(f => (
            <div key={f.id} onClick={() => setActiveId(f.id)} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', background: activeId === f.id ? 'rgba(13,148,136,0.1)' : 'transparent', borderLeft: '3px solid ' + (activeId === f.id ? 'var(--teal)' : 'transparent'), display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,var(--teal),#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: '#fff', flexShrink: 0 }}>{(f.name || 'W')[0]}</div>
              <div style={{ minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div><div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{f.status}</div></div>
            </div>
          ))}
        </div>
      </div>
      {active ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,var(--teal),#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: '#fff' }}>{(active.name || 'W')[0]}</div>
            <div><div style={{ fontWeight: 600, fontSize: 13 }}>{active.name}</div><div style={{ fontSize: 10, color: 'var(--teal-light)' }}>Admin to Writer - ADMIN_CHAT</div></div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13, marginTop: 30 }}>No messages yet.</div>}
            {messages.map((m, i) => (
              <div key={m.id || i} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '65%', padding: '9px 13px', borderRadius: m.from === 'me' ? '10px 10px 2px 10px' : '10px 10px 10px 2px', background: m.from === 'me' ? 'linear-gradient(135deg,#ef4444,#b91c1c)' : 'var(--surface2)', border: '1px solid var(--border)', fontSize: 13, color: m.from === 'me' ? '#fff' : 'var(--text)' }}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} placeholder={'Message ' + active.name + '...'} style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, padding: '9px 13px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)' }} />
            <button onClick={send} style={{ padding: '9px 18px', borderRadius: 7, background: 'linear-gradient(135deg,#ef4444,#b91c1c)', border: 'none', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Send</button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: 13 }}>Select a writer to start a private conversation</div>
      )}
    </div>
  );
}