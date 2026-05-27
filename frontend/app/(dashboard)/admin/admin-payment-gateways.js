"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, Toggle, SaveBar, useToast } from "./admin-shared";

export function AdminPaymentGateways() {
  const [config, setConfig] = useState({ razorpay: true, cashfree: true });
  const [originalConfig, setOriginalConfig] = useState({ razorpay: true, cashfree: true });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/admin/config/payments')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setConfig(data);
          setOriginalConfig(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/config/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setOriginalConfig(config);
        toast.show("Payment gateways updated successfully.", "success");
      } else {
        toast.show("Failed to update payment gateways.", "error");
      }
    } catch (err) {
      console.error(err);
      toast.show("Error saving payment gateways.", "error");
    }
  };

  if (loading) return <div>Loading...</div>;

  const isDirty = JSON.stringify(config) !== JSON.stringify(originalConfig);

  return (
    <div style={{ maxWidth: 600, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Payment Gateways</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Enable or disable payment methods for your users.</p>
      </div>

      <Card>
        <CardHeader title="Available Gateways" icon="💳" />
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Razorpay</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Accept payments via UPI, Cards, Netbanking using Razorpay.</div>
            </div>
            <Toggle checked={config.razorpay} onChange={(val) => setConfig(prev => ({ ...prev, razorpay: val }))} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Cashfree</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Accept payments via various modes using Cashfree.</div>
            </div>
            <Toggle checked={config.cashfree} onChange={(val) => setConfig(prev => ({ ...prev, cashfree: val }))} />
          </div>
        </div>
      </Card>

      <SaveBar show={isDirty} onSave={handleSave} onDiscard={() => setConfig(originalConfig)} />
    </div>
  );
}
