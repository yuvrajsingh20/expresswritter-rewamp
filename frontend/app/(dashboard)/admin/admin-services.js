"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, Btn, Pill, Input, Select, SectionHeader } from "./admin-shared";
import servicesData from "@/data/services_data.json";

/* ── HELPERS & CONSTANTS ── */
const SERVICE_CATEGORIES = ['All', 'Academic', 'Visa', 'Career', 'Content', 'Business'];

function categoryColor(cat) {
  switch (cat) {
    case 'Academic': return 'var(--teal)';
    case 'Visa':     return '#a78bfa';
    case 'Career':   return '#3b82f6';
    case 'Content':  return '#f59e0b';
    case 'Business': return '#22c55e';
    default:         return 'var(--text-muted)';
  }
}

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/* ── SMALL TOGGLE COMPONENT ── */
export function ToggleMini({ value, onChange, disabled }) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && onChange) onChange(!value);
      }}
      style={{
        width: 36, height: 20, borderRadius: 10, position: 'relative',
        cursor: disabled ? 'default' : 'pointer',
        background: value ? 'var(--teal)' : 'var(--surface4)',
        transition: 'background .25s', flexShrink: 0,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <div
        style={{
          position: 'absolute', top: 3, left: value ? 19 : 3,
          width: 14, height: 14, borderRadius: '50%',
          background: '#fff', transition: 'left .25s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </div>
  );
}

/* ── NEW SERVICE MODAL ── */
function NewServiceModal({ onClose, onCreate }) {
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
      variants: 1,
      addons: 0,
      priceMin: 999,
      priceMax: 2999,
    });
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'none',
          zIndex: 9000,
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
          borderRadius: 14, zIndex: 9001,
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
              color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
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
        
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
            Service ID (auto)
          </label>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, padding: '9px 12px', background: 'var(--surface3)', borderRadius: 6, color: 'var(--text-muted)' }}>
            {id}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <div style={{ flex: 1 }} />
          <Btn type="submit" disabled={!name.trim()}>Create Service</Btn>
        </div>
      </form>
    </>
  );
}

/* ── SERVICE DRAWER ── */
const DRAWER_TABS = ['Details', 'Variants & Pricing', 'Add-ons', 'SEO & FAQ'];

function ServiceDrawer({ service, onClose, onSave, onDelete }) {
  const [tab, setTab] = useState('Details');
  const [form, setForm] = useState({
    name: service.name,
    id: service.slug || service.id,
    tagline: service.tagline,
    cat: service.category || service.cat || 'Academic',
    icon: service.icon,
  });

  const [addonPrice, setAddonPrice] = useState(service.addonPrice ?? 499);
  const [customisationPrice, setCustomisationPrice] = useState(service.customisationPrice ?? 799);

  const initialVariants = useMemo(() => {
    const list = service.variants || [];
    if (list.length > 0) {
      return list.map(v => ({
        label: v.label,
        words: v.words || v.wordCount || "1000 words",
        price: v.price || service.priceMin || 999,
        delivery: v.delivery || "5-7 days",
        fastTrackPrice: v.fastTrackPrice || 0,
        fastTrackDelivery: v.fastTrackDelivery || "24-48 hours",
        addonPrice: v.addonPrice || 0,
        customisation: v.customisation || "According to Requirements"
      }));
    }
    return [
      { label: 'For Bachelors', words: '1000 words', price: service.priceMin || 999, delivery: "5-7 days", fastTrackPrice: 499, fastTrackDelivery: "24-48 hours", addonPrice: 499, customisation: "According to Requirements" },
      { label: 'For Masters',   words: '1000 words', price: service.priceMin || 1999, delivery: "5-7 days", fastTrackPrice: 499, fastTrackDelivery: "24-48 hours", addonPrice: 499, customisation: "According to Requirements" },
      { label: 'For Elite MBA', words: '1000 words', price: service.priceMax || 2999, delivery: "5-7 days", fastTrackPrice: 499, fastTrackDelivery: "24-48 hours", addonPrice: 499, customisation: "According to Requirements" },
      { label: 'For PhD',       words: '1200 words', price: service.priceMax || 4999, delivery: "7-10 days", fastTrackPrice: 499, fastTrackDelivery: "24-48 hours", addonPrice: 499, customisation: "According to Requirements" },
    ];
  }, [service]);

  const [variants, setVariants] = useState(initialVariants);
  const [editingIndex, setEditingIndex] = useState(null);

  const addVariant = () => {
    setVariants(prev => [
      ...prev,
      {
        label: `New Variant ${prev.length + 1}`,
        words: "1000 words",
        price: 1999,
        delivery: "5-7 days",
        fastTrackPrice: 499,
        fastTrackDelivery: "24-48 hours",
        addonPrice: 499,
        customisation: "According to Requirements"
      }
    ]);
    setEditingIndex(variants.length);
  };

  const removeVariant = (index) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'none',
          zIndex: 8000,
        }}
      />
      <aside
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 'min(640px, 92vw)',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          zIndex: 8001, display: 'flex', flexDirection: 'column',
          boxShadow: '-30px 0 60px rgba(0,0,0,0.6)',
          animation: 'slideLeft 0.25s cubic-bezier(.2,.9,.3,1.1) both',
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
              {form.cat} · {form.id}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 3 }}>
              {form.name}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 300 }}>
              {service.ordersCount || 0} orders · {service.revenue || '₹0'} revenue
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            style={{
              width: 30, height: 30, borderRadius: 7,
              background: 'var(--surface2)', border: '1px solid var(--border)',
              color: 'var(--text)', cursor: 'pointer', fontSize: 13, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
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
                  fontFamily: 'var(--font)'
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
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                  Description
                </label>
                <textarea
                  style={{
                    width: '100%', background: 'var(--surface3)',
                    border: '1px solid var(--border)', borderRadius: 6,
                    padding: '9px 12px', color: 'var(--text)',
                    fontSize: 13, outline: 'none', resize: 'vertical',
                    minHeight: 100, fontFamily: 'var(--font)'
                  }}
                  defaultValue={service.description || "Crafted by PhD-level writers with admissions expertise. Includes thorough research on your program."}
                />
              </div>
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
                Variants ({variants.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {variants.map((v, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '14px',
                      background: 'var(--surface2)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    {editingIndex === i ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <Input label="Variant Label" value={v.label} onChange={(val) => {
                            setVariants(prev => prev.map((item, idx) => idx === i ? { ...item, label: val } : item));
                          }} />
                          <Input label="Word Count" value={v.words} onChange={(val) => {
                            setVariants(prev => prev.map((item, idx) => idx === i ? { ...item, words: val } : item));
                          }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                          <Input type="number" label="Price (₹)" value={String(v.price)} onChange={(val) => {
                            setVariants(prev => prev.map((item, idx) => idx === i ? { ...item, price: parseFloat(val) || 0 } : item));
                          }} />
                          <Input label="Delivery SLA" value={v.delivery} onChange={(val) => {
                            setVariants(prev => prev.map((item, idx) => idx === i ? { ...item, delivery: val } : item));
                          }} />
                          <Input type="number" label="Fast Track Price (₹)" value={String(v.fastTrackPrice)} onChange={(val) => {
                            setVariants(prev => prev.map((item, idx) => idx === i ? { ...item, fastTrackPrice: parseFloat(val) || 0 } : item));
                          }} />
                        </div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                          <Btn type="button" small variant="outline" onClick={() => removeVariant(i)} style={{ color: '#ef4444' }}>🗑 Delete</Btn>
                          <Btn type="button" small onClick={() => setEditingIndex(null)}>✓ Done</Btn>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px', gap: 10, alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{v.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.words} · {v.delivery}</div>
                        </div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: 'var(--teal-light)' }}>
                           ₹{v.price.toLocaleString('en-IN')}
                        </div>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <Btn type="button" small variant="ghost" onClick={() => setEditingIndex(i)} style={{ padding: '4px' }}>✎</Btn>
                          <Btn type="button" small variant="ghost" onClick={() => removeVariant(i)} style={{ padding: '4px', color: '#ef4444' }}>🗑</Btn>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Btn type="button" small variant="outline" onClick={addVariant}>+ Add Variant</Btn>
            </>
          )}
 
          {tab === 'Add-ons' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'var(--teal-light)', marginBottom: 4,
                }}
              >
                Service Add-ons & Customization Pricing
              </div>
              <Input
                type="number"
                label="Word Count Add-on Price (₹) [e.g. +500 Words]"
                value={String(addonPrice)}
                onChange={(val) => setAddonPrice(parseFloat(val) || 0)}
              />
              <Input
                type="number"
                label="Customization Request Surcharge (₹)"
                value={String(customisationPrice)}
                onChange={(val) => setCustomisationPrice(parseFloat(val) || 0)}
              />
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 4 }}>
                These are service-level options. When selected on the checkout page, they will dynamically calculate surcharges on top of the active variant chosen by the client.
              </p>
            </div>
          )}
 
          {tab === 'SEO & FAQ' && (
            <>
              <Input label="Meta Title" value={`${form.name} | Xpresswriters`} onChange={() => {}} />
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
                  Meta Description
                </label>
                <textarea
                  style={{
                    width: '100%', background: 'var(--surface3)',
                    border: '1px solid var(--border)', borderRadius: 6,
                    padding: '9px 12px', color: 'var(--text)',
                    fontSize: 13, outline: 'none', resize: 'vertical',
                    minHeight: 80, fontFamily: 'var(--font)'
                  }}
                  defaultValue={`${form.tagline || "Crafted by professionals"}. Fast turnarounds & 2 free revisions.`}
                />
              </div>
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
          <Btn type="button" small onClick={() => onSave({ ...form, variants, addonPrice, customisationPrice })}>💾 Save & Publish</Btn>
        </footer>
      </aside>
      
      <style>{`
        @keyframes slideLeft {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}

/* ── MAIN VIEW COMPONENT ── */
export function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');

  const fetchServices = () => {
    setLoading(true);
    fetch('/api/admin/services', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setServices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filtered = useMemo(
    () =>
      services.filter(
        (s) =>
          (catFilter === 'All' || s.category === catFilter) &&
          (s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.slug.toLowerCase().includes(search.toLowerCase())),
      ),
    [services, catFilter, search],
  );

  const toggleActive = (id, currentStatus) => {
    // Optimistic UI toggle
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !currentStatus } : s))
    );
    
    fetch(`/api/admin/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !currentStatus }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        if (!res.ok) fetchServices();
      })
      .catch(() => fetchServices());
  };

  const handleUpdate = (id, patch) => {
    fetch(`/api/admin/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: patch.name,
        slug: patch.id,
        tagline: patch.tagline,
        category: patch.cat,
        icon: patch.icon,
        variants: patch.variants,
        addonPrice: patch.addonPrice,
        customisationPrice: patch.customisationPrice,
      }),
      headers: { 'Content-Type': 'application/json' }
    }).then(() => {
      setSelected(null);
      fetchServices();
    });
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this service? This cannot be undone.")) {
      fetch(`/api/admin/services/${id}`, {
        method: 'DELETE'
      }).then(() => {
        setSelected(null);
        fetchServices();
      });
    }
  };

  const handleCreate = (newService) => {
    fetch('/api/admin/services', {
      method: 'POST',
      body: JSON.stringify({
        slug: newService.id,
        name: newService.name,
        category: newService.cat,
        icon: newService.icon,
        tagline: newService.tagline,
        priceMin: newService.priceMin,
        priceMax: newService.priceMax,
        variantsCount: newService.variants,
        addonsCount: newService.addons,
        ordersCount: 0,
        revenue: '₹0',
      }),
      headers: { 'Content-Type': 'application/json' }
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        alert("Failed to create service: " + (err.error || err.details || "Unknown error"));
        return;
      }
      setShowNew(false);
      fetchServices();
    }).catch((err) => {
      alert("Network error: " + err.message);
    });
  };

  const totalServices = services.length;
  const activeServices = services.filter((s) => s.isActive).length;
  const totalOrders = services.reduce((a, s) => a + (s.ordersCount || 0), 0);

  const stats = [
    { l: 'Total Services',  v: totalServices,                       c: 'var(--teal-light)', i: '📦' },
    { l: 'Active Services', v: activeServices,                       c: 'var(--green)',      i: '✓' },
    { l: 'Avg Variants',    v: services.length ? (services.reduce((a, s) => a + (s.variants?.length || s.variantsCount || 1), 0) / services.length).toFixed(1) : '1.0', c: 'var(--gold)', i: '⚙' },
    { l: 'Total Orders',    v: totalOrders.toLocaleString(),         c: '#f472b6',           i: '📈' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <SectionHeader
        title="Service Catalog & Products"
        subtitle="Manage services, descriptions, pricing variants, and add-ons. Control public availability instantly."
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="outline" small onClick={() => alert("Catalog metadata exported successfully!")}>📤 Export Catalog</Btn>
            <Btn small onClick={() => setShowNew(true)}>+ Add Service</Btn>
          </div>
        }
      />

      {/* Stats Cards */}
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

      {/* Filters Bar */}
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
      </div>

      {/* Catalog Table */}
      <Card style={{ overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '40px 1.2fr 110px 100px 90px 140px 110px 130px',
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
        
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>
            Loading catalog services...
          </div>
        ) : filtered.map((s) => (
          <div
            key={s.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 1.2fr 110px 100px 90px 140px 110px 130px',
              padding: '13px 18px', borderBottom: '1px solid var(--border)',
              alignItems: 'center', transition: 'background .15s',
              opacity: s.isActive ? 1 : 0.55,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(13,148,136,0.04)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ fontSize: 22 }}>{s.icon || '📦'}</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {s.tagline} <span style={{ color: 'var(--text-dim)' }}>· {s.slug}</span>
              </div>
            </div>
            <div>
              <Pill label={s.category || 'Academic'} color={categoryColor(s.category || 'Academic')} />
            </div>
            <div style={{ fontSize: 12 }}>{s.variants?.length || s.variantsCount || 1}</div>
            <div style={{ fontSize: 12 }}>{((s.addonPrice && s.addonPrice > 0 ? 1 : 0) + (s.customisationPrice && s.customisationPrice > 0 ? 1 : 0)) || 0}</div>
            <div style={{ fontSize: 12, textAlign: 'right', fontFamily: 'var(--mono)' }}>
              {(() => {
                const prices = s.variants?.length > 0
                  ? s.variants.map(v => typeof v.price === "string" ? parseFloat(v.price.replace(/[^0-9.]/g, '')) || 0 : v.price)
                  : [s.priceMin || s.basePrice || 0];
                const min = Math.min(...prices);
                const max = Math.max(...prices);

                return (
                  <>
                    ₹{min > 0 ? min.toLocaleString('en-IN') : 0}
                    {max > min && <span style={{ color: 'var(--text-dim)' }}>–{max.toLocaleString('en-IN')}</span>}
                  </>
                );
              })()}
            </div>
            <div style={{ fontSize: 12, textAlign: 'right' }}>
              {s.ordersCount || 0}
              <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>{s.revenue || '₹0'}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
              <ToggleMini value={s.isActive} onChange={() => toggleActive(s.id, s.isActive)} />
              <Btn small variant="outline" onClick={() => setSelected(s)}>✎</Btn>
            </div>
          </div>
        ))}
        
        {!loading && filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            No services match your filters.
          </div>
        )}
      </Card>

      {/* Details Drawer */}
      {selected && (
        <ServiceDrawer
          service={selected}
          onClose={() => setSelected(null)}
          onSave={(patch) => handleUpdate(selected.id, patch)}
          onDelete={() => handleDelete(selected.id)}
        />
      )}

      {/* Creation Modal */}
      {showNew && (
        <NewServiceModal
          onClose={() => setShowNew(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
