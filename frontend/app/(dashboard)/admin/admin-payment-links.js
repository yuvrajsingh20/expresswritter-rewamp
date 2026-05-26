"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, Btn, Input } from "./admin-shared";
import { useSession } from "next-auth/react";

/* ─── HELPER FOR ICONS ─── */
const getServiceIcon = (catId) => {
  const icons = {
    sop: "🎓",
    lor: "📜",
    resume: "💼",
    essays: "📝",
    scholarship: "🏆",
    gmat_waiver: "📜",
    app_fee_waiver: "💸",
    linkedin: "💎",
    email_templates: "✉️",
    media_article: "🖋️",
    visa_application: "🛂",
  };
  return icons[catId] || "📄";
};

export function AdminPaymentLinks() {
  const { data: session } = useSession();

  /* ─── PACKAGE BUILDER STATE (Left Column) ─── */
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerEmail, setCustomerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleResetBuilder = () => {
    setSelectedItems([]);
    setCustomerEmail("");
    setGeneratedLink("");
    setCopied(false);
  };

  /* ─── CATALOG STATE (Right Column) ─── */
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");
  const [activeProduct, setActiveProduct] = useState(null); // Product selected for configuration

  /* ─── VARIANT CONFIGURATION STATE (Modal) ─── */
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [fastTrack, setFastTrack] = useState(false);

  const [catalogData, setCatalogData] = useState([]);
  const [categories, setCategories] = useState([{ id: "all", label: "All", icon: "✨" }]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  useEffect(() => {
    fetch('/api/services?type=catalog', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const list = data.map(s => {
            const basePrice = s.priceMin || s.basePrice || 2499;
            let variants = s.variants || [];
            if (variants.length === 0) {
              variants = [
                { id: (s.slug || s.id) + '_standard', label: 'Standard Tier', words: '500 words', delivery: '3-4 days', price: basePrice, fast: Math.round(basePrice * 0.4), addon: 499, custom: 799 },
                { id: (s.slug || s.id) + '_premium', label: 'Premium Tier', words: '1000 words', delivery: '2-3 days', price: basePrice + 1500, fast: Math.round((basePrice + 1500) * 0.4), addon: 499, custom: 799, ats: s.category?.toLowerCase() === 'resume' ? 299 : undefined }
              ];
            }
            return {
              ...s,
              id: s.slug || s.id,
              cat: s.category || 'Academic',
              icon: s.icon || getServiceIcon(s.category?.toLowerCase() || ''),
              name: s.name,
              description: s.description,
              variants
            };
          });
          setCatalogData(list);
          const uniqueCats = [...new Set(list.map(s => s.cat))];
          setCategories([
            { id: "all", label: "All", icon: "✨" },
            ...uniqueCats.map(c => ({
              id: c.toLowerCase(),
              label: c,
              icon: getServiceIcon(c.toLowerCase())
            }))
          ]);
        }
        setLoadingCatalog(false);
      })
      .catch(err => {
        console.error("Failed to load catalog:", err);
        setLoadingCatalog(false);
      });
  }, []);

  const filteredProducts = useMemo(() => {
    return catalogData.filter((p) => {
      if (activeCat !== "all" && p.cat?.toLowerCase() !== activeCat) return false;
      if (search && !`${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [activeCat, search, catalogData]);

  /* ─── PRODUCT SELECT ACTION ─── */
  const handleProductSelect = (product) => {
    setActiveProduct(product);
    const variants = product.variants || [];
    if (variants.length > 0) {
      setSelectedVariant(variants[0]);
    } else {
      setSelectedVariant(null);
    }
    setFastTrack(false);
  };

  /* ─── CALCULATE ITEM PRICE ON CONFIGURATION ─── */
  const currentConfigPrice = useMemo(() => {
    if (!activeProduct) return 0;
    const variants = activeProduct.variants || [];
    
    if (variants.length > 0 && selectedVariant) {
      let base = selectedVariant.price || 0;
      if (fastTrack && selectedVariant.fast) {
        base += selectedVariant.fast;
      }
      return base;
    } else {
      // Parse base price
      let base = 0;
      if (typeof activeProduct.price === "string") {
        const numeric = activeProduct.price.replace(/[^0-9.]/g, "");
        if (numeric) base = parseFloat(numeric);
      } else if (typeof activeProduct.price === "number") {
        base = activeProduct.price;
      }
      return base;
    }
  }, [activeProduct, selectedVariant, fastTrack]);

  /* ─── ADD TO PACKAGE DRAFT ─── */
  const handleAddToPackage = () => {
    if (!activeProduct) return;

    let itemName = activeProduct.name;
    let details = [];

    if (activeProduct.isCustom) {
      if (!activeProduct.name.trim()) {
        alert("Please enter a service name");
        return;
      }
      itemName = activeProduct.name;
      if (activeProduct.description) details.push(activeProduct.description);
    } else if (selectedVariant) {
      itemName += ` (${selectedVariant.label})`;
      if (fastTrack) {
        details.push("Fast-Track Delivery");
      }
    }

    const itemPrice = currentConfigPrice;

    setSelectedItems([
      ...selectedItems,
      {
        id: `${activeProduct.id || activeProduct.name}-${Date.now()}`,
        name: itemName,
        description: details.join(", "),
        price: itemPrice,
        quantity: 1,
      },
    ]);

    // Reset configuration panel
    setActiveProduct(null);
    setSelectedVariant(null);
    setFastTrack(false);
  };

  /* ─── INVOICE ADJUSTMENTS ─── */
  const handleRemoveItem = (id) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== id));
  };

  const handlePriceChange = (id, newPrice) => {
    setSelectedItems(
      selectedItems.map((item) => (item.id === id ? { ...item, price: parseFloat(newPrice) || 0 } : item))
    );
  };

  const handleQtyChange = (id, newQty) => {
    setSelectedItems(
      selectedItems.map((item) => (item.id === id ? { ...item, quantity: parseInt(newQty, 10) || 1 } : item))
    );
  };

  const grandTotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [selectedItems]);

  /* ─── GENERATE SESSION LINK ─── */
  const handleGenerateLink = async () => {
    if (selectedItems.length === 0) {
      alert("Please add at least one service to the package.");
      return;
    }

    setLoading(true);
    setGeneratedLink("");
    setCopied(false);

    try {
      const res = await fetch("/api/checkout-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          services: selectedItems.map((s) => ({
            name: s.name + (s.description ? ` - ${s.description}` : ""),
            price: s.price,
            quantity: s.quantity,
          })),
          totalPrice: grandTotal,
          createdBy: session?.user?.name || "Admin",
          userEmail: customerEmail,
        }),
      });

      if (!res.ok) throw new Error("Failed to create checkout session");

      const data = await res.json();
      setGeneratedLink(`${window.location.origin}/checkout?session_id=${data.id}`);
    } catch (error) {
      console.error(error);
      alert("Error generating direct checkout link");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 24, animation: "fadeIn 0.3s ease" }}>
      
      {/* ─── TOP BAR ─── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Direct Payment Links</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Create customized billing sessions visually from the platform catalog.
          </p>
        </div>
      </div>

      {/* ─── SPLIT VIEW WORKSPACE ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: 24, flex: 1, minHeight: 0 }}>
        
        {/* ─── LEFT COLUMN: PACKAGE BUILDER ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Builder Card */}
          <Card style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <CardHeader title="Package Builder" />
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, flex: 1, overflowY: "auto" }}>
              
              <Input
                label="Customer Email (Optional)"
                placeholder="client@example.com"
                value={customerEmail}
                onChange={setCustomerEmail}
              />

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Selected Items ({selectedItems.length})
                  </div>
                  {(selectedItems.length > 0 || customerEmail || generatedLink) && (
                    <button
                      onClick={handleResetBuilder}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        padding: 0,
                        transition: "color 0.15s"
                      }}
                      onMouseEnter={(e) => e.target.style.color = "#ef4444"}
                      onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
                    >
                      Clear All 🗑️
                    </button>
                  )}
                </div>

                {selectedItems.length === 0 ? (
                  <div style={{ padding: "40px 20px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: 8, color: "var(--text-dim)", fontSize: 13 }}>
                    No services selected yet.<br />
                    Select a service from the catalog or add a custom service to build this custom package.
                    <div style={{ marginTop: 16 }}>
                      <Btn variant="outline" onClick={() => setActiveProduct({ isCustom: true, id: "custom", name: "", description: "", price: 0 })}>
                        + Add Custom Service
                      </Btn>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {selectedItems.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          background: "var(--surface3)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          padding: "12px 14px",
                          position: "relative",
                        }}
                      >
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            background: "none",
                            border: "none",
                            color: "var(--red)",
                            fontSize: 14,
                            cursor: "pointer",
                          }}
                        >
                          ✕
                        </button>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", paddingRight: 24 }}>
                          {item.name}
                        </div>
                        {item.description && (
                          <div style={{ fontSize: 11, color: "var(--teal-light)", marginTop: 2, fontWeight: 500 }}>
                            {item.description}
                          </div>
                        )}

                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Price:</span>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handlePriceChange(item.id, e.target.value)}
                              style={{
                                width: "100%",
                                background: "var(--surface4)",
                                border: "1px solid var(--border)",
                                borderRadius: 4,
                                padding: "4px 8px",
                                color: "var(--text)",
                                fontSize: 12,
                                outline: "none",
                              }}
                            />
                          </div>
                          <div style={{ width: 80, display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Qty:</span>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQtyChange(item.id, e.target.value)}
                              style={{
                                width: "100%",
                                background: "var(--surface4)",
                                border: "1px solid var(--border)",
                                borderRadius: 4,
                                padding: "4px 6px",
                                color: "var(--text)",
                                fontSize: 12,
                                outline: "none",
                                textAlign: "center",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedItems.length > 0 && (
                  <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <Btn variant="outline" size="sm" onClick={() => setActiveProduct({ isCustom: true, id: "custom", name: "", description: "", price: 0 })}>
                      + Add Custom Service
                    </Btn>
                  </div>
                )}
              </div>
            </div>

            {/* Builder Footer */}
            <div
              style={{
                padding: 16,
                borderTop: "1px solid var(--border)",
                background: "var(--surface3)",
                borderRadius: "0 0 8px 8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase" }}>
                  Total Package Price
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--teal)" }}>
                  ₹{grandTotal.toLocaleString("en-IN")}
                </div>
              </div>
              <Btn onClick={handleGenerateLink} disabled={loading || selectedItems.length === 0}>
                {loading ? "Generating..." : "Generate Link"}
              </Btn>
            </div>
          </Card>

          {/* Generated Link Banner */}
          {generatedLink && (
            <Card style={{ background: "rgba(34,197,94,0.06)", border: "1px solid var(--green)", animation: "fadeIn 0.3s ease" }}>
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 24, color: "var(--green)" }}>✓</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Link Successfully Generated!</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Share this unique checkout link with the client.</div>
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--surface3)",
                    padding: 12,
                    borderRadius: 6,
                    fontSize: 12,
                    color: "var(--text)",
                    fontFamily: "var(--mono)",
                    wordBreak: "break-all",
                    border: "1px solid var(--border)",
                    marginBottom: 14,
                  }}
                >
                  {generatedLink}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <Btn variant="outline" style={{ flex: 1, borderColor: "var(--green)", color: "var(--green)" }} onClick={copyToClipboard}>
                    {copied ? "✓ Copied!" : "Copy Link"}
                  </Btn>
                  <Btn variant="outline" style={{ flex: 1, borderColor: "var(--text-muted)", color: "var(--text-muted)" }} onClick={handleResetBuilder}>
                    Create New
                  </Btn>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* ─── RIGHT COLUMN: CATALOG EXPLORER ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 0 }}>
          
          {/* Category Filter & Search Bar */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", fontSize: 14 }}>🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog..."
                style={{
                  width: "100%",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "9px 12px 9px 34px",
                  color: "var(--text)",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Category Badges Grid */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingBottom: 4 }}>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: "1px solid var(--border)",
                  background: activeCat === c.id ? "var(--teal)" : "var(--surface2)",
                  color: activeCat === c.id ? "#fff" : "var(--text-muted)",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all .15s",
                }}
              >
                <span>{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          {loadingCatalog ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading catalog...</div>
          ) : (
          <div style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, paddingRight: 4 }}>
            {filteredProducts.map((p) => {
              const startPrice = p.variants?.[0]?.price 
                || (typeof p.price === 'string' ? p.price : `₹${p.price}`);
              
              return (
                <div
                  key={p.id}
                  onClick={() => handleProductSelect(p)}
                  style={{
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 16,
                    cursor: "pointer",
                    transition: "all .2s",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--teal)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div>
                    <span style={{ fontSize: 24, display: "block", marginBottom: 8 }}>{p.icon}</span>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                      {p.name}
                    </h3>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {p.description}
                    </p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Starting price:</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--teal-light)" }}>
                      {typeof startPrice === "number" ? `₹${startPrice.toLocaleString("en-IN")}` : startPrice}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>

      {/* ─── MODAL OVERLAY: VARIANT SELECTION & CONFIGURATION ─── */}
      {activeProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "none",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              width: "min(500px, 100%)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
              animation: "toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{activeProduct.icon}</span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{activeProduct.name}</h3>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Configure details</span>
                </div>
              </div>
              <button
                onClick={() => setActiveProduct(null)}
                style={{ background: "none", border: "none", color: "var(--text)", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", maxHeight: "60vh" }}>
              {activeProduct.isCustom ? (
                <>
                  <Input 
                    label="Service Name *" 
                    placeholder="E.g. Custom Rush Content Editing" 
                    value={activeProduct.name} 
                    onChange={val => setActiveProduct({...activeProduct, name: val})} 
                  />
                  <Input 
                    label="Description (Optional)" 
                    placeholder="Specific details about this custom package" 
                    value={activeProduct.description} 
                    onChange={val => setActiveProduct({...activeProduct, description: val})} 
                  />
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                      Price (INR) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={activeProduct.price}
                      onChange={e => setActiveProduct({...activeProduct, price: parseFloat(e.target.value) || 0})}
                      style={{
                        width: "100%",
                        background: "var(--surface2)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        padding: "10px 14px",
                        color: "var(--text)",
                        fontSize: 14,
                        outline: "none",
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    {activeProduct.description}
                  </p>

                  {/* Dynamic Variants (Radio Pill List) */}
                  {activeProduct.variants && activeProduct.variants.length > 0 && (
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
                        Select Variant
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {activeProduct.variants.map((v, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedVariant(v)}
                            style={{
                              padding: "12px 14px",
                              borderRadius: 8,
                              border: `1.5px solid ${selectedVariant?.label === v.label ? "var(--teal)" : "var(--border)"}`,
                              background: selectedVariant?.label === v.label ? "rgba(13,148,136,0.06)" : "var(--surface2)",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              transition: "all .15s",
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{v.label}</div>
                              {v.words && <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{v.words}</span>}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: selectedVariant?.label === v.label ? "var(--teal-light)" : "var(--text-muted)" }}>
                              ₹{v.price.toLocaleString("en-IN")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fast Track Add-on */}
                  {selectedVariant && selectedVariant.fast && (
                    <div
                      onClick={() => setFastTrack(!fastTrack)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        background: fastTrack ? "rgba(13,148,136,0.06)" : "var(--surface2)",
                        border: `1.5px solid ${fastTrack ? "var(--teal)" : "var(--border)"}`,
                        borderRadius: 8,
                        cursor: "pointer",
                        transition: "all .15s",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>🚀 Fast-Track Delivery</div>
                        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
                          Deliver within {selectedVariant.delivery || "24-48 hours"}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: fastTrack ? "var(--teal-light)" : "var(--text-muted)" }}>
                        +₹{selectedVariant.fast}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", background: "var(--surface3)", borderRadius: "0 0 12px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", display: "block" }}>
                  Selected Price
                </span>
                <span style={{ fontSize: 20, fontWeight: 700, color: "var(--teal)" }}>
                  ₹{currentConfigPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn variant="outline" onClick={() => setActiveProduct(null)}>
                  Cancel
                </Btn>
                <Btn onClick={handleAddToPackage} disabled={activeProduct.isCustom && !activeProduct.name.trim()}>
                  Add to Package
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
