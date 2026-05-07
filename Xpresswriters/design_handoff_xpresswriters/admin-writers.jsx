// ── SECTION 5: WRITER MANAGEMENT ──

function AdminWriters() {
  const [tab, setTab] = React.useState('All Writers');
  const [selected, setSelected] = React.useState(null);
  const [saved, setSaved] = React.useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const WRITERS = [
    { id: 'WR-001', name: 'Dr. Amara Singh', avatar: 'AS', email: 'amara@xw.com', country: 'UK', skills: ['SOP', 'Thesis', 'Research'], rating: 4.97, orders: 312, revenue: 18940, status: 'Active', verified: true, kycDone: true, joined: 'Jan 2023', badge: 'Top Writer', compliance: 'Compliant', onTimeRate: 100, responseTime: '< 1h', earnings: 13200, payMethod: 'Bank Transfer', currency: 'GBP' },
    { id: 'WR-002', name: 'James Whitfield', avatar: 'JW', email: 'james@xw.com', country: 'USA', skills: ['Resume', 'LinkedIn', 'Email'], rating: 4.95, orders: 487, revenue: 29220, status: 'Active', verified: true, kycDone: true, joined: 'Mar 2022', badge: 'Elite', compliance: 'Compliant', onTimeRate: 99, responseTime: '< 2h', earnings: 20454, payMethod: 'PayPal', currency: 'USD' },
    { id: 'WR-003', name: 'Priya Nair', avatar: 'PN', email: 'priya@xw.com', country: 'India', skills: ['Blog', 'Article', 'SEO'], rating: 4.92, orders: 256, revenue: 12288, status: 'Active', verified: true, kycDone: false, joined: 'Jun 2023', badge: 'Rising Star', compliance: 'KYC Pending', onTimeRate: 97, responseTime: '< 3h', earnings: 8602, payMethod: 'Razorpay', currency: 'INR' },
    { id: 'WR-004', name: 'Marcus Chen', avatar: 'MC', email: 'marcus@xw.com', country: 'USA', skills: ['Proposal', 'PPT', 'Email'], rating: 4.98, orders: 198, revenue: 21780, status: 'Active', verified: true, kycDone: true, joined: 'Sep 2022', badge: 'Top Writer', compliance: 'Compliant', onTimeRate: 100, responseTime: '< 2h', earnings: 15246, payMethod: 'Wire', currency: 'USD' },
    { id: 'WR-005', name: 'Sophie Laurent', avatar: 'SL', email: 'sophie@xw.com', country: 'France', skills: ['Essay', 'LOR', 'Thesis'], rating: 4.91, orders: 341, revenue: 18952, status: 'Inactive', verified: true, kycDone: true, joined: 'Dec 2022', badge: 'Elite', compliance: 'Compliant', onTimeRate: 98, responseTime: '< 4h', earnings: 13267, payMethod: 'Stripe', currency: 'EUR' },
    { id: 'WR-006', name: 'Rahul Desai', avatar: 'RD', email: 'rahul@xw.com', country: 'India', skills: ['Research', 'Thesis', 'Article'], rating: 4.94, orders: 175, revenue: 9800, status: 'Pending Approval', verified: false, kycDone: false, joined: 'Apr 2026', badge: '—', compliance: 'Under Review', onTimeRate: 0, responseTime: '—', earnings: 0, payMethod: '—', currency: 'INR' },
  ];

  const STATUS_COLOR = { Active: 'var(--green)', Inactive: 'var(--text-dim)', 'Pending Approval': 'var(--amber)', Suspended: 'var(--red)' };
  const COMPLIANCE_COLOR = { Compliant: 'var(--green)', 'KYC Pending': 'var(--amber)', 'Under Review': 'var(--amber)', 'Non-Compliant': 'var(--red)' };

  const filtered = tab === 'All Writers' ? WRITERS :
    tab === 'Active' ? WRITERS.filter(w => w.status === 'Active') :
    tab === 'Pending' ? WRITERS.filter(w => w.status === 'Pending Approval') :
    tab === 'Inactive' ? WRITERS.filter(w => w.status === 'Inactive') : WRITERS;

  const selected_w = WRITERS.find(w => w.id === selected);

  return (
    <div>
      <SectionHeader
        title="Writer Management"
        subtitle="Onboard, verify, manage KPIs and control writer access across the platform."
        action={<Btn onClick={() => {}}>+ Invite Writer</Btn>}
      />
      <SubTabs tabs={['All Writers', 'Active', 'Pending', 'Inactive']} active={tab} onChange={t => { setTab(t); setSelected(null); }} />

      <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 340px)', minHeight: 400 }}>
        {/* Writer list */}
        <div style={{ width: selected ? 340 : '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', transition: 'width .3s' }}>
          {filtered.map(w => (
            <div key={w.id} onClick={() => setSelected(w.id === selected ? null : w.id)} style={{
              background: selected === w.id ? 'rgba(13,148,136,0.06)' : 'var(--surface2)',
              border: `1px solid ${selected === w.id ? 'var(--teal)' : 'var(--border)'}`,
              borderRadius: 8, padding: '12px 14px', cursor: 'pointer', transition: 'all .2s',
            }}
              onMouseEnter={e => { if (selected !== w.id) { e.currentTarget.style.borderColor = 'rgba(13,148,136,0.3)'; } }}
              onMouseLeave={e => { if (selected !== w.id) { e.currentTarget.style.borderColor = 'var(--border)'; } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,var(--teal),#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>{w.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{w.name}</span>
                    {w.verified && <span style={{ fontSize: 10, color: 'var(--teal-light)' }}>✓</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Pill label={w.status} color={STATUS_COLOR[w.status]} />
                    <Pill label={w.compliance} color={COMPLIANCE_COLOR[w.compliance]} />
                    <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{w.country} · ★ {w.rating}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal-light)' }}>{w.orders} orders</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>${w.revenue.toLocaleString()} total</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Writer detail */}
        {selected_w && (
          <div style={{ flex: 1, overflowY: 'auto', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, animation: 'slideLeft .25s ease' }}>
            {/* Header */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,var(--teal),#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff', flexShrink: 0 }}>{selected_w.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{selected_w.name}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                  <Pill label={selected_w.status} color={STATUS_COLOR[selected_w.status]} />
                  <Pill label={selected_w.compliance} color={COMPLIANCE_COLOR[selected_w.compliance]} />
                  {selected_w.badge !== '—' && <Pill label={selected_w.badge} color="var(--gold)" />}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{selected_w.email} · {selected_w.country} · Joined {selected_w.joined}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {selected_w.status === 'Pending Approval' && <Btn small onClick={save}>✓ Approve</Btn>}
                {selected_w.status === 'Active' && <Btn small variant="danger">Deactivate</Btn>}
                {selected_w.status === 'Inactive' && <Btn small>Activate</Btn>}
                <Btn small variant="outline">Message</Btn>
              </div>
            </div>

            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* KPI */}
              <Card>
                <CardHeader title="KPI / KRA" />
                <div style={{ padding: 12 }}>
                  {[
                    { label: 'On-Time Delivery', val: `${selected_w.onTimeRate}%`, target: '≥ 95%', ok: selected_w.onTimeRate >= 95 },
                    { label: 'Avg Rating', val: selected_w.rating, target: '≥ 4.8', ok: selected_w.rating >= 4.8 },
                    { label: 'Response Time', val: selected_w.responseTime, target: '< 4h', ok: true },
                    { label: 'Revision Rate', val: '8%', target: '≤ 15%', ok: true },
                    { label: 'Orders Completed', val: selected_w.orders, target: '—', ok: true },
                  ].map(k => (
                    <div key={k.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{k.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: k.ok ? 'var(--green)' : 'var(--red)' }}>{k.val}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Target: {k.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Verification & Compliance */}
              <Card>
                <CardHeader title="Verification & Compliance" />
                <div style={{ padding: 12 }}>
                  {[
                    { label: 'Identity Verified', done: selected_w.verified },
                    { label: 'KYC Submitted', done: selected_w.kycDone },
                    { label: 'Writing Assessment Passed', done: selected_w.orders > 0 },
                    { label: 'NDA Signed', done: selected_w.verified },
                    { label: 'Tax Info Submitted', done: selected_w.kycDone },
                    { label: 'Background Check', done: selected_w.verified },
                  ].map(v => (
                    <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: v.done ? 'var(--green)' : 'var(--amber)', fontSize: 14 }}>{v.done ? '✓' : '○'}</span>
                      <span style={{ fontSize: 12, color: v.done ? 'var(--text)' : 'var(--text-muted)' }}>{v.label}</span>
                      {!v.done && <Btn small variant="ghost" style={{ marginLeft: 'auto', fontSize: 10 }}>Request</Btn>}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Payment Settings */}
              <Card>
                <CardHeader title="Payment Settings" />
                <div style={{ padding: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    {[['Method', selected_w.payMethod], ['Currency', selected_w.currency], ['Total Earned', `$${selected_w.earnings.toLocaleString()}`], ['Platform Share', '30%']].map(([k, v]) => (
                      <div key={k} style={{ background: 'var(--surface3)', borderRadius: 6, padding: '8px 10px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>{k}</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <Toggle label="Immediate payout on delivery" value={false} onChange={() => {}} />
                  <Toggle label="Auto-approve orders" value={selected_w.status === 'Active'} onChange={() => {}} />
                </div>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader title="Skills & Services" />
                <div style={{ padding: 12 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {selected_w.skills.map(s => <Pill key={s} label={s} color="var(--teal)" />)}
                  </div>
                  <Toggle label="Available for new orders" value={selected_w.status === 'Active'} onChange={() => {}} />
                  <Toggle label="Featured in marketplace" value={selected_w.badge !== '—'} onChange={() => {}} />
                  <Toggle label="Eligible for urgent orders" value={selected_w.rating >= 4.9} onChange={() => {}} />
                  <SaveBar onSave={save} saved={saved} />
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { AdminWriters });
