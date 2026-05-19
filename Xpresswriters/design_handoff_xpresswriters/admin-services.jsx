// ── SECTION: SERVICE & PROMO MANAGEMENT ──

function AdminServices() {
  const [tab, setTab] = React.useState('Service Catalog');
  const [selectedService, setSelectedService] = React.useState(null);
  const [selectedPromo, setSelectedPromo] = React.useState(null);
  const [showCreateService, setShowCreateService] = React.useState(false);
  const [showCreatePromo, setShowCreatePromo] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Mock initial services
  const [services, setServices] = React.useState([
    { id: 'SVC-001', name: 'Academic Thesis & Dissertation', category: 'Academic', basePrice: 45, unit: '100 words', minTat: '5 Days', status: 'Active', rating: 4.96, popular: true, desc: 'In-depth comprehensive research writing, referencing and structural editing.' },
    { id: 'SVC-002', name: 'University Admission SOP', category: 'Admissions', basePrice: 89, unit: 'flat rate', minTat: '3 Days', status: 'Active', rating: 4.98, popular: true, desc: 'Statement of Purpose tailored for master programs, Ivy league colleges.' },
    { id: 'SVC-003', name: 'SEO Content & Blog Writing', category: 'SEO / Marketing', basePrice: 22, unit: '100 words', minTat: '24 Hours', status: 'Active', rating: 4.88, popular: false, desc: 'High-intent keyword rich content to elevate search visibility.' },
    { id: 'SVC-004', name: 'Executive Resume & CV', category: 'Career', basePrice: 120, unit: 'flat rate', minTat: '2 Days', status: 'Active', rating: 4.95, popular: false, desc: 'Professional level resume, ATS-optimized cover letter, and profile review.' },
    { id: 'SVC-005', name: 'Business Proposal & Plan', category: 'Business', basePrice: 180, unit: 'flat rate', minTat: '7 Days', status: 'Active', rating: 4.91, popular: false, desc: 'Pitch decks, feasibility studies, and detailed market research.' },
    { id: 'SVC-006', name: 'Technical Whitepapers', category: 'SEO / Marketing', basePrice: 65, unit: '100 words', minTat: '4 Days', status: 'Inactive', rating: 4.80, popular: false, desc: 'Niche technology briefs, blockchain papers, and industry guides.' }
  ]);

  // Mock initial promos
  const [promos, setPromos] = React.useState([
    { id: 'PRM-001', code: 'LAUNCH30', type: 'Percentage', value: 30, status: 'Active', usageCount: 452, maxUsage: 1000, expiry: '2026-12-31', minOrder: 50 },
    { id: 'PRM-002', code: 'SOPWELCOME', type: 'Flat Rate', value: 15, status: 'Active', usageCount: 231, maxUsage: 500, expiry: '2026-08-30', minOrder: 80 },
    { id: 'PRM-003', code: 'SEOVOLUME', type: 'Percentage', value: 15, status: 'Active', usageCount: 184, maxUsage: 250, expiry: '2026-06-15', minOrder: 300 },
    { id: 'PRM-004', code: 'EXECUTIVE25', type: 'Flat Rate', value: 25, status: 'Active', usageCount: 92, maxUsage: 150, expiry: '2026-10-10', minOrder: 100 },
    { id: 'PRM-005', code: 'SPRINGOFFER', type: 'Percentage', value: 10, status: 'Inactive', usageCount: 350, maxUsage: 350, expiry: '2026-05-01', minOrder: 0 }
  ]);

  const [newService, setNewService] = React.useState({
    name: '', category: 'Academic', basePrice: '', unit: '100 words', minTat: '3 Days', desc: '', popular: false
  });

  const [newPromo, setNewPromo] = React.useState({
    code: '', type: 'Percentage', value: '', minOrder: '', expiry: '', maxUsage: ''
  });

  const handleCreateService = () => {
    if (!newService.name || !newService.basePrice) return;
    const item = {
      id: `SVC-00${services.length + 1}`,
      name: newService.name,
      category: newService.category,
      basePrice: parseFloat(newService.basePrice),
      unit: newService.unit,
      minTat: newService.minTat,
      status: 'Active',
      rating: 5.0,
      popular: newService.popular,
      desc: newService.desc || 'No description provided.'
    };
    setServices([item, ...services]);
    setNewService({ name: '', category: 'Academic', basePrice: '', unit: '100 words', minTat: '3 Days', desc: '', popular: false });
    setShowCreateService(false);
    save();
  };

  const handleCreatePromo = () => {
    if (!newPromo.code || !newPromo.value) return;
    const item = {
      id: `PRM-00${promos.length + 1}`,
      code: newPromo.code.toUpperCase(),
      type: newPromo.type,
      value: parseFloat(newPromo.value),
      status: 'Active',
      usageCount: 0,
      maxUsage: newPromo.maxUsage ? parseInt(newPromo.maxUsage) : 500,
      expiry: newPromo.expiry || '2026-12-31',
      minOrder: newPromo.minOrder ? parseFloat(newPromo.minOrder) : 0
    };
    setPromos([item, ...promos]);
    setNewPromo({ code: '', type: 'Percentage', value: '', minOrder: '', expiry: '', maxUsage: '' });
    setShowCreatePromo(false);
    save();
  };

  const toggleServiceStatus = (id) => {
    setServices(services.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s));
    save();
  };

  const togglePromoStatus = (id) => {
    setPromos(promos.map(p => p.id === id ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p));
    save();
  };

  return (
    <div>
      <SectionHeader
        title="Service & Offer Engine"
        subtitle="Manage available writer offerings, structure pricing tiers, and configure promotional campaigns."
        action={
          tab === 'Service Catalog' ? (
            <Btn onClick={() => setShowCreateService(!showCreateService)}>
              {showCreateService ? '✕ Cancel' : '+ Add Service'}
            </Btn>
          ) : (
            <Btn onClick={() => setShowCreatePromo(!showCreatePromo)}>
              {showCreatePromo ? '✕ Cancel' : '+ New Promo'}
            </Btn>
          )
        }
      />

      <SubTabs
        tabs={['Service Catalog', 'Offers & Promos', 'Dynamic Pricing Tiers']}
        active={tab}
        onChange={(t) => {
          setTab(t);
          setSelectedService(null);
          setSelectedPromo(null);
        }}
      />

      {/* CREATE SERVICE DRAWER */}
      {showCreateService && tab === 'Service Catalog' && (
        <Card style={{ marginBottom: 20, padding: 16, border: '1px solid var(--border-teal)', animation: 'fadeUp .25s ease' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: 'var(--teal-light)' }}>Create New Professional Service</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Input label="Service Name" value={newService.name} onChange={v => setNewService({ ...newService, name: v })} placeholder="e.g. Cover Letter Optimization" />
            <Select label="Category" value={newService.category} onChange={v => setNewService({ ...newService, category: v })} options={['Academic', 'Admissions', 'SEO / Marketing', 'Career', 'Business']} />
            <Select label="Turnaround Time" value={newService.minTat} onChange={v => setNewService({ ...newService, minTat: v })} options={['24 Hours', '2 Days', '3 Days', '4 Days', '5 Days', '7 Days']} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 14, marginBottom: 14, alignItems: 'center' }}>
            <Input label="Base Price ($)" type="number" value={newService.basePrice} onChange={v => setNewService({ ...newService, basePrice: v })} placeholder="e.g. 50" />
            <Select label="Billing Unit" value={newService.unit} onChange={v => setNewService({ ...newService, unit: v })} options={['100 words', 'flat rate', 'per page']} />
            <div style={{ padding: '0 8px', marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input type="checkbox" checked={newService.popular} onChange={e => setNewService({ ...newService, popular: e.target.checked })} style={{ accentColor: 'var(--teal)' }} />
                Feature as Popular/Recommended
              </label>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Description</label>
            <textarea
              value={newService.desc}
              onChange={e => setNewService({ ...newService, desc: e.target.value })}
              placeholder="Brief summary of service coverage and inclusions..."
              style={{
                width: '100%',
                background: 'var(--surface3)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '9px 12px',
                color: 'var(--text)',
                fontSize: 13,
                outline: 'none',
                minHeight: 60,
                resize: 'vertical',
                fontFamily: 'var(--font)'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={handleCreateService}>Submit Service</Btn>
            <Btn variant="outline" onClick={() => setShowCreateService(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {/* CREATE PROMO DRAWER */}
      {showCreatePromo && tab === 'Offers & Promos' && (
        <Card style={{ marginBottom: 20, padding: 16, border: '1px solid var(--border-teal)', animation: 'fadeUp .25s ease' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: 'var(--teal-light)' }}>Issue Promo Coupon Code</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Input label="Coupon Code (Alphanumeric)" value={newPromo.code} onChange={v => setNewPromo({ ...newPromo, code: v })} placeholder="e.g. BLACKFRIDAY50" />
            <Select label="Discount Type" value={newPromo.type} onChange={v => setNewPromo({ ...newPromo, type: v })} options={['Percentage', 'Flat Rate']} />
            <Input label="Discount Value" type="number" value={newPromo.value} onChange={v => setNewPromo({ ...newPromo, value: v })} placeholder="e.g. 20 (for 20% or $20)" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Input label="Min Order Value ($)" type="number" value={newPromo.minOrder} onChange={v => setNewPromo({ ...newPromo, minOrder: v })} placeholder="e.g. 50 (or 0 for none)" />
            <Input label="Expiry Date" type="date" value={newPromo.expiry} onChange={v => setNewPromo({ ...newPromo, expiry: v })} />
            <Input label="Max Usages" type="number" value={newPromo.maxUsage} onChange={v => setNewPromo({ ...newPromo, maxUsage: v })} placeholder="e.g. 500" />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={handleCreatePromo}>Activate Coupon</Btn>
            <Btn variant="outline" onClick={() => setShowCreatePromo(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {/* SERVICE CATALOG TAB */}
      {tab === 'Service Catalog' && (
        <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 340px)', minHeight: 400 }}>
          {/* Service items */}
          <div style={{ flex: selectedService ? '0 0 380px' : '1', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', transition: 'all 0.3s' }}>
            {services.map(s => (
              <div
                key={s.id}
                onClick={() => setSelectedService(s.id === selectedService?.id ? null : s)}
                style={{
                  background: selectedService?.id === s.id ? 'rgba(13,148,136,0.06)' : 'var(--surface2)',
                  border: `1px solid ${selectedService?.id === s.id ? 'var(--teal)' : 'var(--border)'}`,
                  borderRadius: 8,
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all .2s'
                }}
                onMouseEnter={e => { if (selectedService?.id !== s.id) e.currentTarget.style.borderColor = 'rgba(13,148,136,0.3)'; }}
                onMouseLeave={e => { if (selectedService?.id !== s.id) e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginRight: 8 }}>{s.category}</span>
                    {s.popular && <span style={{ fontSize: 9, background: 'rgba(245,200,66,0.12)', color: 'var(--gold)', border: '1px solid rgba(245,200,66,0.22)', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>Popular</span>}
                  </div>
                  <Pill label={s.status} color={s.status === 'Active' ? 'var(--green)' : 'var(--text-dim)'} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>{s.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Rating: ★ {s.rating}</span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal-light)' }}>
                    ${s.basePrice} <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 400 }}>/ {s.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Service detail view */}
          {selectedService && (
            <div style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, overflowY: 'auto', display: 'flex', flexDirection: 'column', animation: 'slideLeft .25s ease' }}>
              <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--teal-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{selectedService.id} · {selectedService.category}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{selectedService.name}</div>
                  </div>
                  <Btn small variant="outline" onClick={() => toggleServiceStatus(selectedService.id)}>
                    {selectedService.status === 'Active' ? 'Disable' : 'Enable'}
                  </Btn>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{selectedService.desc}</p>
              </div>

              <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Card>
                  <CardHeader title="Pricing Parameters" />
                  <div style={{ padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Base Price</span>
                      <span style={{ fontWeight: 700 }}>${selectedService.basePrice}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Unit Dimension</span>
                      <span>{selectedService.unit}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Min Turnaround Time</span>
                      <span>{selectedService.minTat}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Average Writer Rating</span>
                      <span style={{ color: 'var(--gold)', fontWeight: 700 }}>★ {selectedService.rating}</span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <CardHeader title="Add-on Modifiers" />
                  <div style={{ padding: 12 }}>
                    <Toggle label="Urgent delivery (24h) surcharge" sublabel="+50% price multiplier" value={true} onChange={() => {}} />
                    <Toggle label="Elite Specialist Writer" sublabel="+30% price multiplier" value={true} onChange={() => {}} />
                    <Toggle label="Plagiarism PDF Verification report" sublabel="+$15 fixed fee add-on" value={false} onChange={() => {}} />
                  </div>
                </Card>
              </div>
              <div style={{ padding: '0 20px 20px', marginTop: 'auto' }}>
                <SaveBar onSave={save} saved={saved} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* OFFERS & PROMOS TAB */}
      {tab === 'Offers & Promos' && (
        <Card style={{ animation: 'fadeIn .3s ease' }}>
          <Table
            cols={['Coupon Code', 'Type', 'Value', 'Min Order', 'Max Usages', 'Usage Count', 'Expiry', 'Status', 'Actions']}
            rows={promos.map(p => [
              <span style={{ fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--teal-light)' }}>{p.code}</span>,
              <span>{p.type}</span>,
              <span style={{ fontWeight: 600 }}>{p.type === 'Percentage' ? `${p.value}%` : `$${p.value}`}</span>,
              <span style={{ color: 'var(--text-dim)' }}>${p.minOrder}</span>,
              <span style={{ color: 'var(--text-muted)' }}>{p.maxUsage}</span>,
              <span style={{ fontWeight: 600, color: p.usageCount >= p.maxUsage ? 'var(--red)' : 'var(--text)' }}>{p.usageCount}</span>,
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{p.expiry}</span>,
              <Pill label={p.status} color={p.status === 'Active' ? 'var(--green)' : 'var(--text-dim)'} />,
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn small variant="outline" onClick={() => togglePromoStatus(p.id)}>
                  {p.status === 'Active' ? 'Disable' : 'Enable'}
                </Btn>
              </div>
            ])}
          />
        </Card>
      )}

      {/* DYNAMIC PRICING TIERS TAB */}
      {tab === 'Dynamic Pricing Tiers' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, animation: 'fadeIn .3s ease' }}>
          <Card>
            <CardHeader title="Writer Level Price Ratios" />
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>Configure the price markup multiplier applied based on the tier of assigned writer specialist.</p>
              {[
                { level: 'Standard Specialist (Standard SOP / Essay)', multiplier: '1.0x (No surcharge)' },
                { level: 'Elite Specialist (Top 10% writers)', multiplier: '1.30x (30% markup)' },
                { level: 'Premium SME Expert (PhD / Academic Expert)', multiplier: '1.60x (60% markup)' },
                { level: 'Enterprise Lead QC Writer', multiplier: '2.00x (100% markup)' }
              ].map((w, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                  <span style={{ fontWeight: 600 }}>{w.level}</span>
                  <span style={{ color: 'var(--teal-light)', fontFamily: 'var(--mono)', fontWeight: 700 }}>{w.multiplier}</span>
                </div>
              ))}
              <div style={{ marginTop: 14 }}>
                <Toggle label="Automated tier-based down-shift" sublabel="Allow down-assigning writer if SLA is < 12h" value={false} onChange={() => {}} />
                <SaveBar onSave={save} saved={saved} />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Bulk Discount Thresholds" />
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>Set automated progressive discounts based on words or items in order size volume.</p>
              {[
                { range: '1,500 - 3,000 words', discount: '5% auto discount' },
                { range: '3,001 - 5,000 words', discount: '10% auto discount' },
                { range: '5,001 - 10,000 words', discount: '15% auto discount' },
                { range: '10,001+ words', discount: '20% auto discount' }
              ].map((w, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                  <span style={{ fontWeight: 600 }}>{w.range}</span>
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>{w.discount}</span>
                </div>
              ))}
              <div style={{ marginTop: 14 }}>
                <Toggle label="Enable progressive bulk discounting" value={true} onChange={() => {}} />
                <SaveBar onSave={save} saved={saved} />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { AdminServices });
