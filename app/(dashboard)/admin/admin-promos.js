"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, Table, Btn, Pill, Input, Select } from "./admin-shared";

export function AdminPromos() {
  const [showCreate, setShowCreate] = useState(false);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPromo, setNewPromo] = useState({ code: '', type: 'PERCENTAGE', value: '', minOrderValue: '', usageLimit: '', expiryDate: '' });

  const fetchPromos = () => {
    setLoading(true);
    fetch('/api/admin/promos')
      .then(res => res.json())
      .then(data => {
        setPromos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleCreate = () => {
    fetch('/api/admin/promos', {
      method: 'POST',
      body: JSON.stringify(newPromo),
      headers: { 'Content-Type': 'application/json' }
    }).then(() => {
      setShowCreate(false);
      fetchPromos();
    });
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Promo & Discounts</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage coupon codes, seasonal offers, and referral bonuses.</p>
        </div>
        <Btn onClick={() => setShowCreate(true)}>+ Create New Code</Btn>
      </div>

      {showCreate && (
        <Card style={{ marginBottom: 24, border: '1px solid var(--teal)' }}>
          <CardHeader title="Create Discount Code" right={<Btn variant="outline" small onClick={() => setShowCreate(false)}>×</Btn>} />
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Input label="Coupon Code" placeholder="e.g. SAVE25" value={newPromo.code} onChange={v => setNewPromo({...newPromo, code: v})} />
            <Select label="Discount Type" value={newPromo.type} options={['PERCENTAGE', 'FIXED']} onChange={v => setNewPromo({...newPromo, type: v})} />
            <Input label="Value" placeholder="e.g. 25" value={newPromo.value} onChange={v => setNewPromo({...newPromo, value: v})} />
            <Input label="Min. Order Value" placeholder="₹0" value={newPromo.minOrderValue} onChange={v => setNewPromo({...newPromo, minOrderValue: v})} />
            <Input label="Usage Limit" placeholder="Unlimited" value={newPromo.usageLimit} onChange={v => setNewPromo({...newPromo, usageLimit: v})} />
            <Input label="Expiry Date" type="date" value={newPromo.expiryDate} onChange={v => setNewPromo({...newPromo, expiryDate: v})} />
          </div>
          <div style={{ padding: '0 20px 20px', display: 'flex', gap: 12 }}>
            <Btn onClick={handleCreate}>Save Promo Code</Btn>
            <Btn variant="outline" onClick={() => setShowCreate(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      <Card>
        <Table
          cols={['Coupon Code', 'Type', 'Value', 'Usage', 'Status', 'Actions']}
          rows={promos.map(c => [
            <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>{c.code}</span>,
            c.type,
            c.type === 'PERCENTAGE' ? `${c.value}%` : `₹${c.value}`,
            `${c.usageCount}/${c.usageLimit || '∞'}`,
            <Pill label={c.isActive ? 'Active' : 'Inactive'} color={c.isActive ? 'var(--green)' : 'var(--text-dim)'} />,
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="outline" small>Edit</Btn>
              <Btn variant="outline" small style={{ color: 'var(--red)' }}>Disable</Btn>
            </div>
          ])}
        />
        {loading && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim)' }}>Loading active campaigns...</div>}
        {!loading && promos.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>No promo codes found.</div>}
      </Card>
    </div>
  );
}
