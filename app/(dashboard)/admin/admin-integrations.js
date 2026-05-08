"use client";
import React, { useState, useEffect } from "react";
import { SectionHeader, StatusDot, Card, Pill, Toggle, Btn } from "./admin-shared";
// ── SECTION 1: API INTEGRATIONS ──

export function AdminIntegrations() {
  const [keys, setKeys] = React.useState({
    google_client: '', google_secret: '', google_maps: '',
    stripe_pub: '', stripe_secret: '', razorpay_key: '', razorpay_secret: '',
    whatsapp_token: '', whatsapp_phone_id: '', whatsapp_verify: '',
    make_api: '', make_webhook: '',
    openai: '', claude: '', gemini: '',
    sendgrid: '', twilio_sid: '', twilio_token: '',
  });
  const [enabled, setEnabled] = React.useState({ google: true, stripe: true, razorpay: false, whatsapp: true, make: false, openai: true, claude: true, gemini: false, sendgrid: true, twilio: false });
  const [saved, setSaved] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [revealed, setRevealed] = React.useState({});

  useEffect(() => {
    fetch('/api/admin/config/integrations')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setKeys(data.keys || keys);
          setEnabled(data.enabled || enabled);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const mask = (v) => v ? '••••••••' + v.slice(-4) : '';
  const toggleReveal = (k) => setRevealed(r => ({ ...r, [k]: !r[k] }));
  
  const save = () => {
    setSaved(true);
    fetch('/api/admin/config/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys, enabled })
    }).finally(() => {
      setTimeout(() => setSaved(false), 2500);
    });
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>Loading integration settings...</div>;

  const groups = [
    {
      label: 'Google Suite', icon: '🔍', color: '#4285f4', desc: 'Google OAuth, Analytics, Maps, Drive',
      integrationKey: 'google',
      fields: [
        { key: 'google_client', label: 'Client ID', placeholder: 'GOCSPX-...' },
        { key: 'google_secret', label: 'Client Secret', placeholder: 'GOCSPX-...', secret: true },
        { key: 'google_maps', label: 'Maps API Key', placeholder: 'AIza...', secret: true },
      ],
      features: ['OAuth Sign-In', 'Analytics Tracking', 'Maps Geocoding', 'Drive Integration'],
    },
    {
      label: 'Stripe', icon: '💳', color: '#635bff', desc: 'Global card payments, subscriptions, invoicing',
      integrationKey: 'stripe',
      fields: [
        { key: 'stripe_pub', label: 'Publishable Key', placeholder: 'pk_live_...' },
        { key: 'stripe_secret', label: 'Secret Key', placeholder: 'sk_live_...', secret: true },
      ],
      features: ['Card Payments', 'Subscriptions', 'Invoices', 'Webhooks'],
    },
    {
      label: 'Razorpay', icon: '🏦', color: '#528ff0', desc: 'India & South Asia payments, UPI, wallets',
      integrationKey: 'razorpay',
      fields: [
        { key: 'razorpay_key', label: 'Key ID', placeholder: 'rzp_live_...' },
        { key: 'razorpay_secret', label: 'Key Secret', placeholder: 'Secret...', secret: true },
      ],
      features: ['UPI Payments', 'Net Banking', 'Wallets', 'Subscriptions'],
    },
    {
      label: 'WhatsApp Business', icon: '💬', color: '#25d366', desc: 'WhatsApp Cloud API for notifications & AI agent',
      integrationKey: 'whatsapp',
      fields: [
        { key: 'whatsapp_token', label: 'Access Token', placeholder: 'EAABx...', secret: true },
        { key: 'whatsapp_phone_id', label: 'Phone Number ID', placeholder: '1234567890' },
        { key: 'whatsapp_verify', label: 'Webhook Verify Token', placeholder: 'xw_verify_...', secret: true },
      ],
      features: ['Order Notifications', 'AI Chat Agent', 'Ticket Escalation', 'OTP Delivery'],
    },
    {
      label: 'Make.com (Zapier alt.)', icon: '⚡', color: '#6d4ef7', desc: 'Workflow automation and app integrations',
      integrationKey: 'make',
      fields: [
        { key: 'make_api', label: 'API Token', placeholder: 'make_...', secret: true },
        { key: 'make_webhook', label: 'Incoming Webhook URL', placeholder: 'https://hook.eu1.make.com/...' },
      ],
      features: ['Order Automations', 'Email Sequences', 'CRM Sync', 'Multi-step Workflows'],
    },
    {
      label: 'OpenAI (ChatGPT)', icon: '🤖', color: '#10a37f', desc: 'GPT-4o for AI chat, ticket triage, content suggestions',
      integrationKey: 'openai',
      fields: [{ key: 'openai', label: 'API Key', placeholder: 'sk-...', secret: true }],
      features: ['Ticket Triage', 'Chat Suggestions', 'Content Review', 'Writer Scoring'],
    },
    {
      label: 'Claude (Anthropic)', icon: '🧠', color: '#d97757', desc: 'Claude Haiku/Sonnet for quality analysis & escalation',
      integrationKey: 'claude',
      fields: [{ key: 'claude', label: 'API Key', placeholder: 'sk-ant-...', secret: true }],
      features: ['Quality Analysis', 'Escalation Drafts', 'Plagiarism Logic', 'SOP Scoring'],
    },
    {
      label: 'Gemini (Google AI)', icon: '✨', color: '#4285f4', desc: 'Google Gemini for multilingual AI and voice',
      integrationKey: 'gemini',
      fields: [{ key: 'gemini', label: 'API Key', placeholder: 'AIza...', secret: true }],
      features: ['Multilingual Support', 'Voice Responses', 'Document Analysis', 'Translation'],
    },
    {
      label: 'SendGrid', icon: '📧', color: '#1a82e2', desc: 'Transactional email, campaigns, analytics',
      integrationKey: 'sendgrid',
      fields: [{ key: 'sendgrid', label: 'API Key', placeholder: 'SG....', secret: true }],
      features: ['Order Emails', 'Ticket Notifications', 'Marketing Campaigns', 'Email Analytics'],
    },
    {
      label: 'Twilio', icon: '📞', color: '#f22f46', desc: 'SMS, voice calls, AI voice agent for escalation',
      integrationKey: 'twilio',
      fields: [
        { key: 'twilio_sid', label: 'Account SID', placeholder: 'ACxxxxxxxx' },
        { key: 'twilio_token', label: 'Auth Token', placeholder: 'xxxxxxxx', secret: true },
      ],
      features: ['SMS Alerts', 'AI Voice Calls', 'OTP Verification', 'Call Escalation'],
    },
  ];

  const categories = [
    { label: 'Payments', color: '#22c55e', icon: '💳', items: ['Stripe', 'Razorpay'] },
    { label: 'Google Suite', color: '#4285f4', icon: '🔍', items: ['Google Suite'] },
    { label: 'Communication', color: '#25d366', icon: '💬', items: ['WhatsApp Business', 'SendGrid', 'Twilio'] },
    { label: 'AI / LLM', color: '#d97757', icon: '🤖', items: ['OpenAI (ChatGPT)', 'Claude (Anthropic)', 'Gemini (Google AI)'] },
    { label: 'Automation', color: '#6d4ef7', icon: '⚡', items: ['Make.com (Zapier alt.)'] },
  ];

  const [activeGroup, setActiveGroup] = React.useState(null);

  return (
    <div>
      <SectionHeader title="API Integrations" subtitle="Connect third-party services. All credentials are AES-256 encrypted at rest." />

      {/* Category overview */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <div key={cat.label} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>{cat.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: cat.color }}>{cat.label}</span>
            <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{cat.items.length} apps</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <StatusDot active={true} /> {Object.values(enabled).filter(Boolean).length} connected
        </div>
      </div>

      {/* Integration cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {groups.map(g => {
          const isOpen = activeGroup === g.label;
          const isOn = enabled[g.integrationKey];
          return (
            <Card key={g.label} style={{ overflow: 'hidden' }}>
              <div onClick={() => setActiveGroup(isOpen ? null : g.label)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${g.color}18`, border: `1px solid ${g.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{g.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{g.label}</span>
                    {isOn ? <Pill label="Connected" color="#22c55e" /> : <Pill label="Disabled" color="#6b7280" />}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div onClick={e => { e.stopPropagation(); setEnabled(en => ({ ...en, [g.integrationKey]: !en[g.integrationKey] })); }}>
                    <Toggle value={isOn} onChange={() => {}} />
                  </div>
                  <span style={{ color: 'var(--text-dim)', fontSize: 14, transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>▾</span>
                </div>
              </div>

              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '16px', animation: 'fadeUp .25s ease' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>Credentials</div>
                      {g.fields.map(f => (
                        <div key={f.key} style={{ marginBottom: 12 }}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input type={f.secret && !revealed[f.key] ? 'password' : 'text'} value={keys[f.key]} onChange={e => setKeys(k => ({ ...k, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ flex: 1, background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', color: 'var(--text)', fontSize: 12, outline: 'none', fontFamily: 'var(--mono)' }} />
                            {f.secret && <button onClick={() => toggleReveal(f.key)} style={{ padding: '0 10px', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>{revealed[f.key] ? '🙈' : '👁'}</button>}
                          </div>
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <Btn small onClick={save}>{saved ? '✓ Saved' : 'Save Keys'}</Btn>
                        <Btn small variant="outline">Test Connection</Btn>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>Enabled Features</div>
                      {g.features.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ color: isOn ? 'var(--teal)' : 'var(--text-dim)', fontSize: 12 }}>{isOn ? '✓' : '○'}</span>
                          <span style={{ fontSize: 12, color: isOn ? 'var(--text)' : 'var(--text-dim)' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}


