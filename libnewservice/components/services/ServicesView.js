'use client';

import { useMemo, useState } from 'react';
import {
  Btn, Card, Pill, Toggle, SectionHeader,
} from '@/components/ui';
import {
  INITIAL_SERVICES, SERVICE_CATEGORIES, categoryColor,
} from '@/lib/data';
import ServiceDrawer from './ServiceDrawer';
import NewServiceModal from './NewServiceModal';

export default function ServicesView() {
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');

  const filtered = useMemo(
    () =>
      services.filter(
        (s) =>
          (catFilter === 'All' || s.cat === catFilter) &&
          (s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.id.toLowerCase().includes(search.toLowerCase())),
      ),
    [services, catFilter, search],
  );

  const toggleActive = (id) =>
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));

  const updateService = (id, patch) =>
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const removeService = (id) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setSelected(null);
  };

  const addService = (svc) => {
    setServices((prev) => [{ ...svc }, ...prev]);
    setShowNew(false);
  };

  const totalServices = services.length;
  const activeServices = services.filter((s) => s.active).length;
  const totalOrders = services.reduce((a, s) => a + s.orders, 0);

  const stats = [
    { l: 'Total Services',  v: totalServices,                       c: 'var(--teal-light)', i: '📦' },
    { l: 'Active Services', v: activeServices,                       c: 'var(--green)',      i: '✓' },
    { l: 'Avg Variants',    v: (services.reduce((a, s) => a + s.variants, 0) / Math.max(services.length, 1)).toFixed(1), c: 'var(--gold)', i: '⚙' },
    { l: 'Total Orders',    v: totalOrders.toLocaleString(),         c: '#f472b6',           i: '📈' },
  ];

  return (
    <div>
      <SectionHeader
        title="Service & Product Management"
        subtitle="Edit services, pricing, and add-ons. Toggle services on/off to control public availability."
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="outline" small>📤 Export Catalog</Btn>
            <Btn small onClick={() => setShowNew(true)}>+ Add Service</Btn>
          </div>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {stats.map((s) => (
          <Card
            key={s.l}
            style={{
              padding: 16,
              background: `linear-gradient(135deg, var(--surface2) 60%, ${s.c}0d 100%)`,
              border: `1px solid ${s.c}22`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
                  color: 'var(--text-muted)', textTransform: 'uppercase',
                }}
              >
                {s.l}
              </span>
              <span style={{ fontSize: 14 }}>{s.i}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.c, letterSpacing: '-0.02em' }}>
              {s.v}
            </div>
          </Card>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex', gap: 4, padding: 3,
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 7,
          }}
        >
          {SERVICE_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              style={{
                padding: '5px 12px', borderRadius: 5, border: 'none',
                background: catFilter === c ? 'var(--teal)' : 'transparent',
                color: catFilter === c ? '#fff' : 'var(--text-muted)',
                fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search service name or ID…"
          style={{
            flex: 1, minWidth: 200, padding: '8px 12px',
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 7, color: 'var(--text)',
            fontSize: 12.5, outline: 'none', fontFamily: 'var(--font)',
          }}
        />
        <Btn variant="outline" small>⚙ Bulk edit ({filtered.length})</Btn>
      </div>

      {/* Catalog table */}
      <Card style={{ overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 110px 100px 90px 130px 110px 130px',
            padding: '11px 18px', background: 'var(--surface3)',
            borderBottom: '1px solid var(--border)',
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: 'var(--text-dim)',
          }}
        >
          <div></div>
          <div>Service</div>
          <div>Category</div>
          <div>Variants</div>
          <div>Add-ons</div>
          <div style={{ textAlign: 'right' }}>Price Range</div>
          <div style={{ textAlign: 'right' }}>Orders</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>
        {filtered.map((s) => (
          <div
            key={s.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 110px 100px 90px 130px 110px 130px',
              padding: '13px 18px', borderBottom: '1px solid var(--border)',
              alignItems: 'center', transition: 'background .15s',
              opacity: s.active ? 1 : 0.55,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(13,148,136,0.04)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {s.tagline} <span style={{ color: 'var(--text-dim)' }}>· {s.id}</span>
              </div>
            </div>
            <div>
              <Pill label={s.cat} color={categoryColor(s.cat)} />
            </div>
            <div style={{ fontSize: 12 }}>{s.variants}</div>
            <div style={{ fontSize: 12 }}>{s.addons}</div>
            <div style={{ fontSize: 12, textAlign: 'right', fontFamily: 'var(--mono)' }}>
              ₹{s.priceMin.toLocaleString('en-IN')}
              <span style={{ color: 'var(--text-dim)' }}>–{s.priceMax.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ fontSize: 12, textAlign: 'right' }}>
              {s.orders}
              <div style={{ fontSize: 10, color: 'var(--green)' }}>{s.revenue}</div>
            </div>
            <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
              <Toggle value={s.active} onChange={() => toggleActive(s.id)} />
              <Btn small variant="outline" onClick={() => setSelected(s)}>✎</Btn>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            No services match your filters.
          </div>
        )}
      </Card>

      {selected && (
        <ServiceDrawer
          service={selected}
          onClose={() => setSelected(null)}
          onSave={(patch) => {
            updateService(selected.id, patch);
            setSelected(null);
          }}
          onDelete={() => removeService(selected.id)}
        />
      )}

      {showNew && (
        <NewServiceModal
          onClose={() => setShowNew(false)}
          onCreate={addService}
        />
      )}
    </div>
  );
}
