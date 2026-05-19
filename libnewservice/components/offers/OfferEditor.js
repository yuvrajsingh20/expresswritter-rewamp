'use client';

import { useState } from 'react';
import { Btn, Input, Select } from '@/components/ui';
import { OFFER_SCOPES, OFFER_KINDS } from '@/lib/data';

const EMPTY = {
  id: '',
  code: '',
  label: '',
  kind: 'percent',
  value: 10,
  status: 'active',
  uses: 0,
  cap: 100,
  expires: 'Dec 31, 2026',
  scope: 'All services',
  minOrder: 999,
};

export default function OfferEditor({ offer, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(offer ? { ...offer } : { ...EMPTY });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e?.preventDefault();
    if (!form.code.trim() || !form.label.trim()) return;
    const id = form.id || form.code.toUpperCase();
    onSave({
      ...form,
      id,
      code: form.code.toUpperCase(),
      value: form.kind === 'addon' ? form.value : Number(form.value) || 0,
      cap: Number(form.cap) || 0,
      minOrder: Number(form.minOrder) || 0,
    });
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 80,
        }}
      />
      <form
        onSubmit={submit}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 'min(560px, 92vw)',
          maxHeight: '88vh', overflowY: 'auto',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14, zIndex: 90,
          padding: '28px 30px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
              {offer ? 'Edit Offer' : 'Create Offer'}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Discounts, flat-off, or free add-ons. Codes are stored uppercase.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'var(--surface2)', border: '1px solid var(--border)',
              color: 'var(--text)', cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <Input
          label="Code"
          value={form.code}
          onChange={(v) => set('code', v.toUpperCase().replace(/\s+/g, ''))}
          placeholder="WELCOME15"
          mono
        />
        <Input
          label="Display Label"
          value={form.label}
          onChange={(v) => set('label', v)}
          placeholder="First Order 15% Off"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Select
            label="Type"
            value={form.kind}
            onChange={(v) => set('kind', v)}
            options={OFFER_KINDS}
          />
          <Input
            label={form.kind === 'percent' ? 'Discount %' : form.kind === 'flat' ? 'Flat ₹ Off' : 'Add-on Name'}
            value={form.value}
            onChange={(v) => set('value', v)}
            type={form.kind === 'addon' ? 'text' : 'number'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Input
            label="Usage Cap"
            value={form.cap}
            onChange={(v) => set('cap', v)}
            type="number"
          />
          <Input
            label="Min Order ₹"
            value={form.minOrder}
            onChange={(v) => set('minOrder', v)}
            type="number"
          />
        </div>

        <Select
          label="Scope"
          value={form.scope}
          onChange={(v) => set('scope', v)}
          options={OFFER_SCOPES}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Input
            label="Expires On"
            value={form.expires}
            onChange={(v) => set('expires', v)}
            placeholder="Dec 31, 2026"
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(v) => set('status', v)}
            options={[
              { value: 'active',  label: 'Active' },
              { value: 'paused',  label: 'Paused' },
              { value: 'expired', label: 'Expired' },
            ]}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
          {onDelete && (
            <Btn variant="danger" small onClick={onDelete}>🗑 Delete</Btn>
          )}
          <div style={{ flex: 1 }} />
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" disabled={!form.code.trim() || !form.label.trim()}>
            {offer ? '💾 Save Offer' : 'Create Offer'}
          </Btn>
        </div>
      </form>
    </>
  );
}
