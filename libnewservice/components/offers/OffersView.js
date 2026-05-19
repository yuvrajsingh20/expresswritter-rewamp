'use client';

import { useMemo, useState } from 'react';
import { Btn, Card, Pill, SectionHeader, SubTabs } from '@/components/ui';
import {
  INITIAL_OFFERS, offerStatusColor, offerKindGlyph,
} from '@/lib/data';
import OfferEditor from './OfferEditor';

const STATUS_TABS = ['All', 'Active', 'Paused', 'Expired'];

export default function OffersView() {
  const [offers, setOffers] = useState(INITIAL_OFFERS);
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // offer object or 'new'

  const filtered = useMemo(() => {
    const lc = search.toLowerCase();
    return offers.filter((o) => {
      const matchStatus =
        status === 'All' || o.status === status.toLowerCase();
      const matchSearch =
        !lc ||
        o.code.toLowerCase().includes(lc) ||
        o.label.toLowerCase().includes(lc);
      return matchStatus && matchSearch;
    });
  }, [offers, status, search]);

  const counts = {
    active:  offers.filter((o) => o.status === 'active').length,
    paused:  offers.filter((o) => o.status === 'paused').length,
    expired: offers.filter((o) => o.status === 'expired').length,
    redemptions: offers.reduce((a, o) => a + o.uses, 0),
  };

  const toggleStatus = (id) =>
    setOffers((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, status: o.status === 'active' ? 'paused' : o.status === 'paused' ? 'active' : o.status }
          : o,
      ),
    );

  const removeOffer = (id) =>
    setOffers((prev) => prev.filter((o) => o.id !== id));

  const upsertOffer = (offer) => {
    setOffers((prev) => {
      const i = prev.findIndex((o) => o.id === offer.id);
      if (i === -1) return [{ ...offer, uses: 0 }, ...prev];
      const next = [...prev];
      next[i] = { ...prev[i], ...offer };
      return next;
    });
    setEditing(null);
  };

  const stats = [
    { l: 'Active Offers',     v: counts.active,                    c: 'var(--green)',     i: '🎟' },
    { l: 'Paused',            v: counts.paused,                    c: 'var(--amber)',     i: '⏸' },
    { l: 'Expired',           v: counts.expired,                   c: 'var(--text-dim)',  i: '⌛' },
    { l: 'Total Redemptions', v: counts.redemptions.toLocaleString(), c: 'var(--teal-light)', i: '📈' },
  ];

  return (
    <div>
      <SectionHeader
        title="Offers & Promos"
        subtitle="Apply discounts, free add-ons, or bundle pricing. Codes are case-sensitive."
        action={<Btn small onClick={() => setEditing('new')}>+ Create Offer</Btn>}
      />

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

      <SubTabs tabs={STATUS_TABS} active={status} onChange={setStatus} />

      <div style={{ marginBottom: 16 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search code or offer name…"
          style={{
            width: '100%', padding: '9px 14px',
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 7, color: 'var(--text)',
            fontSize: 12.5, outline: 'none',
          }}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 12,
        }}
      >
        {filtered.map((o) => {
          const statusColor = offerStatusColor(o.status);
          return (
            <Card
              key={o.id}
              style={{
                padding: 16, position: 'relative', overflow: 'hidden',
                opacity: o.status === 'expired' ? 0.55 : 1,
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: statusColor }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{offerKindGlyph(o.kind)}</span>
                  <code
                    style={{
                      padding: '3px 9px', background: 'var(--surface3)',
                      border: '1px solid var(--border)', borderRadius: 5,
                      fontFamily: 'var(--mono)', fontSize: 11.5,
                      color: 'var(--teal-light)', fontWeight: 700, letterSpacing: '0.04em',
                    }}
                  >
                    {o.code}
                  </code>
                </div>
                <Pill label={o.status.toUpperCase()} color={statusColor} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 5 }}>{o.label}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 12 }}>
                {o.scope} · Min ₹{o.minOrder.toLocaleString('en-IN')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11 }}>
                <span style={{ color: 'var(--text-muted)' }}>Used</span>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                  {o.uses} / {o.cap}
                </span>
              </div>
              <div
                style={{
                  height: 4, borderRadius: 2,
                  background: 'var(--surface3)',
                  overflow: 'hidden', marginBottom: 12,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, (o.uses / Math.max(o.cap, 1)) * 100)}%`,
                    background: statusColor, borderRadius: 2,
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: 10, borderTop: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 10.5, color: 'var(--text-dim)' }}>Expires {o.expires}</span>
                <div style={{ display: 'flex', gap: 5 }}>
                  <Btn small variant="outline" onClick={() => setEditing(o)}>✎</Btn>
                  <Btn small variant="ghost" onClick={() => toggleStatus(o.id)} disabled={o.status === 'expired'}>
                    {o.status === 'active' ? '⏸' : '▶'}
                  </Btn>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13, gridColumn: '1 / -1' }}>
            No offers match your filters.
          </Card>
        )}
      </div>

      {editing && (
        <OfferEditor
          offer={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={upsertOffer}
          onDelete={editing !== 'new' ? () => { removeOffer(editing.id); setEditing(null); } : null}
        />
      )}
    </div>
  );
}
