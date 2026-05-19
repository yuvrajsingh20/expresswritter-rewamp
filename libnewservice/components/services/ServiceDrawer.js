'use client';

import { useState } from 'react';
import { Btn, Input, Select, Textarea, Pill } from '@/components/ui';

const DRAWER_TABS = ['Details', 'Variants & Pricing', 'Add-ons', 'SEO & FAQ'];

export default function ServiceDrawer({ service, onClose, onSave, onDelete }) {
  const [tab, setTab] = useState('Details');
  const [form, setForm] = useState({
    name: service.name,
    id: service.id,
    tagline: service.tagline,
    cat: service.cat,
    icon: service.icon,
  });

  const variants = [
    { l: 'For Bachelors', w: '1000 words', p: service.priceMin },
    { l: 'For Masters',   w: '1000 words', p: service.priceMin },
    { l: 'For Elite MBA', w: '1000 words', p: service.priceMax },
    { l: 'For PhD',       w: '1200 words', p: service.priceMax },
  ];

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 80, animation: 'fadeIn .2s ease',
        }}
      />
      <aside
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 'min(640px, 92vw)',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          zIndex: 90, display: 'flex', flexDirection: 'column',
          boxShadow: '-30px 0 60px rgba(0,0,0,0.6)',
          animation: 'slideLeft .25s cubic-bezier(.2,.9,.3,1.2)',
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: '22px 28px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'flex-start', gap: 14,
          }}
        >
          <div
            style={{
              width: 50, height: 50, borderRadius: 11,
              background: 'linear-gradient(135deg, rgba(13,148,136,0.25), rgba(13,148,136,0.08))',
              border: '1px solid rgba(13,148,136,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, flexShrink: 0,
            }}
          >
            {form.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em',
                color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4,
              }}
            >
              {service.cat} · {service.id}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 3 }}>
              {form.name}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 300 }}>
              Last updated {service.updated} · {service.orders} orders · {service.revenue} revenue
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            style={{
              width: 30, height: 30, borderRadius: 7,
              background: 'var(--surface2)', border: '1px solid var(--border)',
              color: 'var(--text)', cursor: 'pointer', fontSize: 13, flexShrink: 0,
            }}
          >
            ✕
          </button>
        </header>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
          <div
            style={{
              display: 'flex', gap: 2, padding: 3,
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 7, marginBottom: 20, width: 'fit-content',
            }}
          >
            {DRAWER_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '6px 13px', borderRadius: 5, border: 'none',
                  background: tab === t ? 'var(--teal)' : 'transparent',
                  color: tab === t ? '#fff' : 'var(--text-muted)',
                  fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'Details' && (
            <>
              <Input label="Service Name" value={form.name} onChange={(v) => set('name', v)} />
              <Input label="Service ID (Slug)" value={form.id} onChange={(v) => set('id', v)} mono />
              <Input
                label="Tagline (1 line)"
                value={form.tagline}
                onChange={(v) => set('tagline', v)}
                sublabel="Shown on product cards"
              />
              <Textarea
                label="Description"
                defaultValue="Crafted by PhD-level writers with admissions expertise. Includes thorough research on your target program, narrative arc, and 2 free revisions."
              />
              <Select
                label="Category"
                value={form.cat}
                onChange={(v) => set('cat', v)}
                options={['Academic', 'Visa', 'Career', 'Content', 'Business']}
              />
            </>
          )}

          {tab === 'Variants & Pricing' && (
            <>
              <div
                style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'var(--teal-light)', marginBottom: 12,
                }}
              >
                Variants ({service.variants})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {variants.map((v, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '11px 14px',
                      background: 'var(--surface2)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      display: 'grid',
                      gridTemplateColumns: '1fr 100px 100px 60px',
                      gap: 10, alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600 }}>{v.l}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{v.w}</div>
                    </div>
                    <input
                      defaultValue={v.p}
                      type="number"
                      style={{
                        background: 'var(--surface3)',
                        border: '1px solid var(--border)',
                        borderRadius: 5, padding: '5px 8px',
                        color: 'var(--text)', fontSize: 12,
                        fontFamily: 'var(--mono)', outline: 'none',
                      }}
                    />
                    <Pill label="Active" color="var(--green)" />
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <Btn small variant="ghost">✎</Btn>
                    </div>
                  </div>
                ))}
              </div>
              <Btn small variant="outline">+ Add Variant</Btn>
            </>
          )}

          {tab === 'Add-ons' && (
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Add-ons attached to this service: <strong style={{ color: 'var(--text)' }}>{service.addons}</strong>.
              <br />
              Manage the reusable add-on library at <a href="/services" style={{ color: 'var(--teal-light)' }}>Catalog → Add-ons</a>.
            </div>
          )}

          {tab === 'SEO & FAQ' && (
            <>
              <Input label="Meta Title" value={`${form.name} | Xpresswriters`} onChange={() => {}} />
              <Textarea
                label="Meta Description"
                defaultValue={`${form.tagline}. Crafted by professionals. Fast turnarounds & 2 free revisions.`}
              />
              <Input label="Primary Keyword" value={form.id.replace(/-/g, ' ')} onChange={() => {}} />
            </>
          )}
        </div>

        {/* Footer */}
        <footer
          style={{
            padding: '14px 28px', borderTop: '1px solid var(--border)',
            display: 'flex', gap: 10, background: 'var(--surface2)',
          }}
        >
          <Btn variant="danger" small onClick={onDelete}>🗑 Delete</Btn>
          <div style={{ flex: 1 }} />
          <Btn variant="outline" small onClick={onClose}>Cancel</Btn>
          <Btn small onClick={() => onSave(form)}>💾 Save & Publish</Btn>
        </footer>
      </aside>
    </>
  );
}
