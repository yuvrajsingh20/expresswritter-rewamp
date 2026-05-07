"use client";
import React, { useState, useEffect } from "react";
import { Pill, Btn, Card, CardHeader, SectionHeader, SubTabs, SaveBar, Toggle, Table } from "./admin-shared";
// ── SECTIONS 3 & 4: PAYMENTS, REVENUE, CURRENCY ──

export function AdminPayments({ projects = [] }) {
  const [tab, setTab] = React.useState('Overview');
  const [saved, setSaved] = React.useState(false);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, invRes] = await Promise.all([
        fetch('/api/admin/payments'),
        fetch('/api/admin/invoices')
      ]);
      if (ordRes.ok) setOrders(await ordRes.json());
      if (invRes.ok) setInvoices(await invRes.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const TRANSACTIONS = orders.map(o => ({
    id: o.razorpayId || `ORD-${o.id.slice(-4).toUpperCase()}`,
    client: o.student?.name || 'N/A',
    service: o.project?.serviceType || 'N/A',
    amount: o.amount || 0,
    currency: 'INR',
    gateway: 'Razorpay',
    status: o.paymentStatus === 'PAID' ? 'Paid' : 'Pending',
    date: new Date(o.createdAt).toLocaleDateString(),
    writerPayout: (o.amount || 0) * 0.7
  }));

  const PAYOUTS = invoices.map(i => ({
    writer: i.freelancer?.name || 'N/A',
    amount: i.amount,
    currency: 'INR',
    method: 'Razorpay',
    status: i.status === 'PAID' ? 'Paid' : 'Pending',
    date: new Date(i.createdAt).toLocaleDateString(),
    orders: 1
  }));

  const totalRevenue = orders.reduce((acc, o) => acc + (o.amount || 0), 0);
  const monthlyRevenueTotal = orders.filter(o => new Date(o.createdAt).getMonth() === new Date().getMonth()).reduce((acc, o) => acc + (o.amount || 0), 0);
  const pendingPayouts = orders.filter(o => o.paymentStatus !== 'PAID').reduce((acc, o) => acc + (o.amount || 0), 0) * 0.7;

  const STATUS_COLOR = { Paid: 'var(--green)', Pending: 'var(--amber)', Refunded: 'var(--red)', Scheduled: '#3b82f6', Processing: 'var(--teal)' };

  const GATEWAY_SPLIT = [
    { name: 'Stripe', pct: 68, color: '#635bff', amt: '$18,240' },
    { name: 'Razorpay', pct: 28, color: '#528ff0', amt: '$7,520' },
    { name: 'Other', pct: 4, color: 'var(--text-dim)', amt: '$1,080' },
  ];

  const monthlyRevenue = [1240, 1890, 2100, 1750, 2480, 2680];
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const maxRev = Math.max(...monthlyRevenue);

  return (
    <div>
      <SectionHeader title="Payment & Revenue" subtitle="Track transactions, manage payouts and analyse revenue across all gateways." />
      <SubTabs tabs={['Overview', 'Transactions', 'Writer Payouts', 'Accounts']} active={tab} onChange={setTab} />

      {tab === 'Overview' && (
        <div style={{ animation: 'fadeIn .3s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Total Revenue', val: `$${totalRevenue.toLocaleString()}`, sub: 'All time', color: 'var(--teal-light)' },
              { label: 'This Month', val: `$${monthlyRevenueTotal.toLocaleString()}`, sub: 'Current Month', color: 'var(--green)' },
              { label: 'Pending Payouts', val: `$${pendingPayouts.toLocaleString()}`, sub: 'Estimated', color: 'var(--amber)' },
              { label: 'Platform Margin', val: '30%', sub: 'Avg. take rate', color: '#8b5cf6' },
            ].map(s => (
              <Card key={s.label} style={{ padding: '18px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color, marginBottom: 3, letterSpacing: '-0.02em' }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{s.sub}</div>
              </Card>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
            <Card>
              <CardHeader title="Monthly Revenue" />
              <div style={{ padding: '20px', display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
                {monthlyRevenue.map((v, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div style={{ fontSize: 10, color: 'var(--teal-light)', fontWeight: 600 }}>${(v / 1000).toFixed(1)}k</div>
                    <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: 'linear-gradient(180deg,var(--teal),rgba(13,148,136,0.3))', height: `${(v / maxRev) * 90}px`, transition: 'height .5s ease', minHeight: 4 }} />
                    <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{months[i]}</div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <CardHeader title="Gateway Split" />
              <div style={{ padding: '16px' }}>
                {GATEWAY_SPLIT.map(g => (
                  <div key={g.name} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{g.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{g.amt} ({g.pct}%)</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--surface3)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${g.pct}%`, background: g.color, borderRadius: 3, transition: 'width .6s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'Transactions' && (
        <Card style={{ animation: 'fadeIn .3s ease' }}>
          <CardHeader title="All Transactions" right={<Btn small variant="outline">Export CSV</Btn>} />
          <Table
            cols={['Transaction ID', 'Client', 'Service', 'Amount', 'Gateway', 'Status', 'Date', 'Writer Payout']}
            rows={TRANSACTIONS.map(t => [
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{t.id}</span>,
              t.client,
              t.service,
              `${t.amount} ${t.currency}`,
              t.gateway,
              <Pill label={t.status} color={STATUS_COLOR[t.status]} />,
              t.date,
              t.writerPayout ? `$${t.writerPayout}` : '—',
            ])}
          />
        </Card>
      )}

      {tab === 'Writer Payouts' && (
        <div style={{ animation: 'fadeIn .3s ease' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <Btn>Run Payouts Now</Btn>
            <Btn variant="outline">Schedule Payouts</Btn>
            <Btn variant="outline">Export</Btn>
          </div>
          <Card>
            <CardHeader title="Upcoming & Recent Payouts" />
            <Table
              cols={['Writer', 'Amount', 'Currency', 'Method', 'Orders', 'Status', 'Date']}
              rows={PAYOUTS.map(p => [
                p.writer,
                `$${p.amount.toLocaleString()}`,
                p.currency,
                p.method,
                p.orders,
                <Pill label={p.status} color={STATUS_COLOR[p.status]} />,
                p.date,
              ])}
            />
          </Card>
          <div style={{ marginTop: 16 }}>
            <Card>
              <CardHeader title="Payout Settings" />
              <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Select label="Payout Frequency" value="Monthly" onChange={() => {}} options={['Weekly', 'Bi-weekly', 'Monthly', 'On Request']} />
                <Select label="Payout Day" value="1" onChange={() => {}} options={['1', '5', '10', '15', '20', '25']} />
                <Input label="Minimum Payout Threshold ($)" value="50" onChange={() => {}} placeholder="50" />
                <Select label="Default Method" value="Bank Transfer" onChange={() => {}} options={['Bank Transfer', 'PayPal', 'Razorpay', 'Wire Transfer']} />
              </div>
              <div style={{ padding: '0 16px 16px' }}>
                <Toggle label="Auto-approve payouts under threshold" sublabel="Payouts above threshold require manual approval" value={true} onChange={() => {}} />
                <Toggle label="Send payout confirmation emails" value={true} onChange={() => {}} />
                <SaveBar onSave={save} saved={saved} />
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'Accounts' && (
        <div style={{ animation: 'fadeIn .3s ease', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card>
            <CardHeader title="Platform Accounts" />
            <div style={{ padding: 16 }}>
              {[
                { label: 'Stripe Balance', val: '$4,210.00', sub: 'Available for payout', color: '#635bff' },
                { label: 'Razorpay Balance', val: '₹1,24,890', sub: 'INR settlement', color: '#528ff0' },
                { label: 'Platform Revenue', val: '$8,052', sub: 'Commission earned', color: 'var(--teal)' },
                { label: 'Refunds Issued', val: '$340', sub: 'This month', color: 'var(--red)' },
              ].map(a => (
                <div key={a.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{a.sub}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: a.color }}>{a.val}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="Tax & Compliance" />
            <div style={{ padding: 16 }}>
              <Toggle label="GST/VAT Collection" sublabel="Auto-apply applicable tax by region" value={true} onChange={() => {}} />
              <Toggle label="Generate Invoices Automatically" value={true} onChange={() => {}} />
              <Toggle label="Send Tax Receipts to Clients" value={false} onChange={() => {}} />
              <Input label="GST Number" value="27AXXXX1234X1Z5" onChange={() => {}} mono />
              <Input label="Company PAN" value="AXXXX1234X" onChange={() => {}} mono />
              <SaveBar onSave={save} saved={saved} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ── CURRENCY SETTINGS ── */
export function AdminCurrency() {
  const [saved, setSaved] = React.useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const CURRENCIES = [
    { region: 'India', currency: 'INR', symbol: '₹', gateway: 'Razorpay', rate: 83.2, writerMin: 5000, enabled: true },
    { region: 'United Kingdom', currency: 'GBP', symbol: '£', gateway: 'Stripe', rate: 0.79, writerMin: 50, enabled: true },
    { region: 'United States', currency: 'USD', symbol: '$', gateway: 'Stripe', rate: 1.0, writerMin: 50, enabled: true },
    { region: 'European Union', currency: 'EUR', symbol: '€', gateway: 'Stripe', rate: 0.92, writerMin: 50, enabled: true },
    { region: 'Canada', currency: 'CAD', symbol: 'CA$', gateway: 'Stripe', rate: 1.37, writerMin: 65, enabled: false },
    { region: 'Australia', currency: 'AUD', symbol: 'AU$', gateway: 'Stripe', rate: 1.53, writerMin: 75, enabled: false },
    { region: 'UAE', currency: 'AED', symbol: 'د.إ', gateway: 'Stripe', rate: 3.67, writerMin: 180, enabled: true },
    { region: 'Nigeria', currency: 'NGN', symbol: '₦', gateway: 'Stripe', rate: 1620, writerMin: 80000, enabled: false },
  ];
  const [currencies, setCurrencies] = React.useState(CURRENCIES);

  return (
    <div>
      <SectionHeader title="Currency Settings" subtitle="Configure currency display and payouts per writer location. Exchange rates auto-update daily from Open Exchange Rates API." />

      <Card style={{ marginBottom: 20 }}>
        <CardHeader title="Base Currency" right={<Pill label="Auto-refresh daily" color="var(--teal)" />} />
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <Select label="Platform Base Currency" value="USD" onChange={() => {}} options={['USD', 'GBP', 'EUR', 'INR']} />
          <Input label="Exchange Rate API Key" value="oxr_..." onChange={() => {}} mono />
          <Select label="Rate Update Frequency" value="Daily" onChange={() => {}} options={['Hourly', 'Daily', 'Weekly', 'Manual']} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Currency by Writer Region" right={<span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Writer's payout reflects their local currency</span>} />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface3)' }}>
                {['Region', 'Currency', 'Exchange Rate (to USD)', 'Payment Gateway', 'Min Payout', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currencies.map((c, i) => (
                <tr key={c.region} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>{c.region}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--teal-light)', fontWeight: 600 }}>{c.symbol} {c.currency}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <input type="number" value={c.rate} step="0.01" onChange={e => setCurrencies(cs => cs.map((x, j) => j === i ? { ...x, rate: +e.target.value } : x))} style={{ width: 90, background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 5, padding: '4px 8px', color: 'var(--text)', fontSize: 12, fontFamily: 'var(--mono)', outline: 'none' }} />
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{c.gateway}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{c.symbol}{c.writerMin.toLocaleString()}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <Pill label={c.enabled ? 'Active' : 'Disabled'} color={c.enabled ? 'var(--green)' : 'var(--text-dim)'} />
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn small variant={c.enabled ? 'danger' : 'outline'} onClick={() => setCurrencies(cs => cs.map((x, j) => j === i ? { ...x, enabled: !x.enabled } : x))}>
                        {c.enabled ? 'Disable' : 'Enable'}
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: 16 }}>
          <Toggle label="Show prices in writer's local currency" sublabel="Writers see their earnings in their home currency on the dashboard" value={true} onChange={() => {}} />
          <Toggle label="Auto-convert client payments to base currency" sublabel="Stripe/Razorpay handle FX conversion automatically" value={true} onChange={() => {}} />
          <SaveBar onSave={save} saved={saved} />
        </div>
      </Card>
    </div>
  );
}


