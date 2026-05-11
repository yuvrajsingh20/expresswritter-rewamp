"use client";
import React, { useState, useEffect } from "react";
import { Pill, Btn, Card, CardHeader, SectionHeader, SubTabs, SaveBar, Toggle } from "./admin-shared";
// ── SECTION 2: TICKETING SYSTEM ──

export function AdminTickets() {
  const [tab, setTab] = useState('All Tickets');
  const [selected, setSelected] = useState(null);
  const [matrix, setMatrix] = useState({
    level1: { channel: 'email', delay: 15, aiDraft: true },
    level2: { channel: 'whatsapp', delay: 60, aiDraft: true },
    level3: { channel: 'voice', delay: 180, aiDraft: false },
  });

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/tickets')
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setTickets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch tickets:", err);
        setLoading(false);
      });
  }, []);

  const PRIORITY_COLORS = { High: 'var(--red)', Medium: 'var(--amber)', Low: 'var(--green)' };
  const STATUS_COLORS = { Open: '#3b82f6', 'In Progress': 'var(--teal)', Resolved: 'var(--green)' };
  const TYPE_COLORS = { Order: 'var(--teal)', Client: '#8b5cf6', Writer: 'var(--amber)' };

  const filtered = tab === 'All Tickets' ? tickets : tickets.filter(t =>
    tab === 'Orders' ? t.type === 'Order' :
    tab === 'Clients' ? t.type === 'Client' :
    tab === 'Writers' ? t.type === 'Writer' :
    tab === 'Open' ? t.status === 'Open' :
    tab === 'Resolved' ? t.status === 'Resolved' : true
  );

  const selectedTicket = tickets.find(t => t.id === selected);

  const [reply, setReply] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDraft, setAiDraft] = useState('');

  const generateAI = () => {
    setAiLoading(true);
    setTimeout(() => {
      setAiLoading(false);
      setAiDraft(`Dear ${selectedTicket?.client !== '—' ? 'valued client' : 'writer'},\n\nThank you for reaching out regarding "${selectedTicket?.subject}". We have reviewed your case and our support team is actively working on a resolution.\n\nExpected resolution: within 2 business hours. We appreciate your patience.\n\nWarm regards,\nXpresswriters Support`);
    }, 1400);
  };

  const updateTicket = async (id, data) => {
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (res.ok) {
        setTickets(tickets.map(t => t.id === id ? { ...t, ...data } : t));
      }
    } catch (err) {
      console.error("Failed to update ticket:", err);
    }
  };

  return (
    <div>
      <SectionHeader title="Ticketing System" subtitle="Unified support queue with AI-powered escalation matrix across email, WhatsApp and voice." />

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Open', val: tickets.filter(t => t.status === 'Open').length, color: '#3b82f6' },
          { label: 'In Progress', val: tickets.filter(t => t.status === 'In Progress').length, color: 'var(--teal)' },
          { label: 'Resolved Today', val: tickets.filter(t => t.status === 'Resolved').length, color: 'var(--green)' },
          { label: 'Escalated', val: tickets.filter(t => t.escalation !== 'None').length, color: 'var(--red)' },
          { label: 'Avg Resolution', val: '2.4h', color: 'var(--gold)' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, marginBottom: 2 }}>{loading ? '...' : s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 360px)', gap: 16, minHeight: 400 }}>
        {/* Ticket list */}
        <div style={{ width: selected ? 340 : '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0, transition: 'width .3s' }}>
          <SubTabs tabs={['All Tickets', 'Orders', 'Clients', 'Writers', 'Open', 'Resolved']} active={tab} onChange={t => { setTab(t); setSelected(null); }} />
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.map(t => (
              <div key={t.id} onClick={() => setSelected(t.id === selected ? null : t.id)} style={{
                padding: '12px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .15s',
                background: selected === t.id ? 'rgba(13,148,136,0.06)' : 'transparent',
                borderLeft: `3px solid ${selected === t.id ? 'var(--teal)' : 'transparent'}`,
              }}
                onMouseEnter={e => { if (selected !== t.id) e.currentTarget.style.background = 'var(--surface3)'; }}
                onMouseLeave={e => { if (selected !== t.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)' }}>{t.ticketId}</span>
                  <Pill label={t.type} color={TYPE_COLORS[t.type]} />
                  <Pill label={t.priority} color={PRIORITY_COLORS[t.priority]} />
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-dim)' }}>{t.created}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Pill label={t.status} color={STATUS_COLORS[t.status]} />
                  {t.escalation !== 'None' && <span style={{ fontSize: 10, color: 'var(--red)', fontWeight: 600 }}>🔺 {t.escalation}</span>}
                  <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 'auto' }}>AI: {t.aiStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket detail */}
        {selectedTicket && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', animation: 'slideLeft .25s ease' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{selectedTicket.subject}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)' }}>{selectedTicket.ticketId}</span>
                  <Pill label={selectedTicket.type} color={TYPE_COLORS[selectedTicket.type]} />
                  <Pill label={selectedTicket.priority} color={PRIORITY_COLORS[selectedTicket.priority]} />
                  <Pill label={selectedTicket.status} color={STATUS_COLORS[selectedTicket.status]} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn small variant="outline" onClick={() => updateTicket(selectedTicket.id, { status: 'In Progress' })}>In Progress</Btn>
                <Btn small variant="danger" onClick={() => updateTicket(selectedTicket.id, { escalation: 'Level 1' })}>Escalate</Btn>
                <Btn small onClick={() => updateTicket(selectedTicket.id, { status: 'Resolved' })}>Resolve</Btn>
              </div>
            </div>
            <div style={{ padding: '14px 16px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[['Client', selectedTicket.client], ['Writer', selectedTicket.writer], ['Escalation', selectedTicket.escalation], ['AI Status', selectedTicket.aiStatus]].map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--surface3)', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
              {/* AI Draft */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal-light)' }}>🤖 AI Response Draft</span>
                  <Btn small variant="ghost" onClick={generateAI}>{aiLoading ? '⏳ Generating...' : 'Generate'}</Btn>
                </div>
                {aiDraft && (
                  <div style={{ background: 'rgba(13,148,136,0.06)', border: '1px solid var(--border-teal)', borderRadius: 6, padding: '10px 12px', fontSize: 12, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap', animation: 'fadeUp .3s ease' }}>{aiDraft}</div>
                )}
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Reply</label>
                <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." rows={4} style={{ width: '100%', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13, fontFamily: 'var(--font)', outline: 'none', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn small onClick={() => setReply('')}>Send Reply</Btn>
                <Btn small variant="outline">Send via WhatsApp</Btn>
                <Btn small variant="outline">Trigger AI Call</Btn>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Escalation Matrix */}
      <div style={{ marginTop: 24 }}>
        <Card>
          <CardHeader title="AI Escalation Matrix" right={<Pill label="Active" color="var(--green)" />} />
          <div style={{ padding: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Automatic escalation triggers based on ticket age and priority. AI drafts and sends responses at each level.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { level: 'Level 1', icon: '📧', label: 'Email', key: 'level1', desc: 'First response — AI email draft', color: '#3b82f6' },
                { level: 'Level 2', icon: '💬', label: 'WhatsApp', key: 'level2', desc: 'No reply — WhatsApp AI agent', color: '#25d366' },
                { level: 'Level 3', icon: '📞', label: 'Voice Call', key: 'level3', desc: 'Critical — AI voice call via Twilio', color: 'var(--red)' },
              ].map(l => (
                <div key={l.level} style={{ background: 'var(--surface3)', borderRadius: 8, padding: '14px', border: `1px solid ${l.color}22` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 18 }}>{l.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: l.color }}>{l.level} — {l.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{l.desc}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 10, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Trigger after (minutes)</label>
                    <input type="number" value={matrix[l.key].delay} onChange={e => setMatrix(m => ({ ...m, [l.key]: { ...m[l.key], delay: +e.target.value } }))} style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5, padding: '6px 8px', color: 'var(--text)', fontSize: 12, fontFamily: 'var(--mono)', outline: 'none' }} />
                  </div>
                  <Toggle value={matrix[l.key].aiDraft} onChange={v => setMatrix(m => ({ ...m, [l.key]: { ...m[l.key], aiDraft: v } }))} label="AI Auto-Draft" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


