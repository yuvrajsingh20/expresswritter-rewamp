'use client';

import { useState } from 'react';
import { Btn, Input, Select } from '@/components/ui';

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function NewServiceModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [cat, setCat] = useState('Academic');
  const [icon, setIcon] = useState('🎓');
  const [tagline, setTagline] = useState('');

  const id = slugify(name || 'new-service');

  const submit = (e) => {
    e?.preventDefault();
    if (!name.trim()) return;
    onCreate({
      id,
      name: name.trim(),
      cat,
      icon: icon || '✨',
      tagline: tagline.trim() || 'New service',
      variants: 1, addons: 0, active: true,
      orders: 0, revenue: '₹0', priceMin: 0, priceMax: 0,
      updated: 'Just now',
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
          width: 'min(540px, 92vw)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14, zIndex: 90,
          padding: '30px 32px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Create New Service
          </h3>
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

        <Input label="Service Name" value={name} onChange={setName} placeholder="e.g. IELTS Speaking Coach" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Select label="Category" value={cat} onChange={setCat} options={['Academic', 'Visa', 'Career', 'Content', 'Business']} />
          <Input label="Emoji Icon" value={icon} onChange={setIcon} placeholder="🎤" />
        </div>
        <Input label="Tagline" value={tagline} onChange={setTagline} placeholder="One-line product hook" />
        <Input label="Service ID (auto)" value={id} onChange={() => {}} mono />

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <div style={{ flex: 1 }} />
          <Btn type="submit" disabled={!name.trim()}>Create & Edit Variants →</Btn>
        </div>
      </form>
    </>
  );
}
