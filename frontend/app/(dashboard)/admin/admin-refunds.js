"use client";
import React, { useState, useEffect } from "react";
import { Table, Btn, Pill, Card, Select } from "./admin-shared";

export function AdminRefunds() {
  const [filter, setFilter] = useState('All');
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRefunds = () => {
    setLoading(true);
    fetch('/api/admin/refunds')
      .then(res => res.json())
      .then(data => {
        setRefunds(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const updateStatus = (id, status) => {
    fetch('/api/admin/refunds', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
      headers: { 'Content-Type': 'application/json' }
    }).then(fetchRefunds);
  };

  const filtered = refunds.filter(r => filter === 'All' || r.status === filter);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Refund Management</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Review and process dispute resolution requests.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Select value={filter} options={['All', 'PENDING', 'APPROVED', 'REJECTED']} onChange={(v) => setFilter(v)} />
        </div>
      </div>

      <Card>
        <Table
          cols={['Request ID', 'Order', 'Amount', 'Reason', 'Status', 'Actions']}
          rows={filtered.map(r => [
            <span style={{ fontWeight: 600, color: 'var(--teal-light)' }}>XW-{r.id.slice(-5).toUpperCase()}</span>,
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>XW-{r.orderId.slice(-5).toUpperCase()}</span>,
            <span style={{ fontWeight: 700 }}>₹{r.amount.toLocaleString()}</span>,
            <div style={{ maxWidth: 200, fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.reason}>{r.reason}</div>,
            <Pill label={r.status} color={r.status === 'PENDING' ? 'var(--amber)' : r.status === 'APPROVED' ? 'var(--green)' : 'var(--red)'} />,
            <div style={{ display: 'flex', gap: 8 }}>
              {r.status === 'PENDING' ? (
                <>
                  <Btn onClick={() => updateStatus(r.id, 'APPROVED')}>Approve</Btn>
                  <Btn variant="outline" onClick={() => updateStatus(r.id, 'REJECTED')}>Reject</Btn>
                </>
              ) : (
                <Btn variant="outline" onClick={() => {}}>View Details</Btn>
              )}
            </div>
          ])}
        />
        {loading && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim)' }}>Syncing with bank records...</div>}
        {!loading && filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>No refund requests found.</div>}
      </Card>
    </div>
  );
}
