"use client";
import React, { useState } from "react";

export default function Wallet({ projects = [], userName = "Student", isMobile }) {
  const [amount, setAmount] = useState(500);
  
  // In a real app, this would be fetched from the User model
  const balance = 0; 
  
  const transactions = projects
    .filter(p => p.amount > 0)
    .map(p => ({
      id: `TX-${p.id.slice(-6)}`,
      date: new Date(p.createdAt).toLocaleDateString(),
      type: 'Order Payment',
      amount: p.amount,
      status: 'Completed',
      orderId: p.id
    }));

  return (
    <div style={{ padding: isMobile ? '16px 20px' : '32px 36px', overflowY: 'auto', height: '100%', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Wallet & Credits</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Manage your balance, top up credits, and view transaction history.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Balance Card */}
        <div style={{ 
          background: 'linear-gradient(135deg, var(--teal), #0f766e)', 
          borderRadius: 16, 
          padding: isMobile ? 20 : 32, 
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.4)'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: 14, fontWeight: 500, opacity: 0.9, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Balance</div>
            <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 24, letterSpacing: '-0.02em' }}>₹{balance.toLocaleString()}</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ 
                background: '#fff', 
                color: 'var(--teal)', 
                border: 'none', 
                padding: '10px 20px', 
                borderRadius: 8, 
                fontWeight: 700, 
                fontSize: 13, 
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                + Top Up Credits
              </button>
              <button style={{ 
                background: 'rgba(255,255,255,0.15)', 
                color: '#fff', 
                border: '1px solid rgba(255,255,255,0.3)', 
                padding: '10px 20px', 
                borderRadius: 8, 
                fontWeight: 600, 
                fontSize: 13, 
                cursor: 'pointer'
              }}>
                Redeem Code
              </button>
            </div>
          </div>
          {/* Abstract circles for design */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', zIndex: 1 }} />
          <div style={{ position: 'absolute', bottom: -20, left: '20%', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', zIndex: 1 }} />
        </div>

        {/* Quick Top-up */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Quick Top-up</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[500, 1000, 2500, 5000].map(val => (
              <button 
                key={val} 
                onClick={() => setAmount(val)}
                style={{
                  padding: '12px',
                  borderRadius: 8,
                  border: '1px solid',
                  borderColor: amount === val ? 'var(--teal)' : 'var(--border2)',
                  background: amount === val ? 'rgba(13,148,136,0.1)' : 'transparent',
                  color: amount === val ? 'var(--teal-light)' : 'var(--text)',
                  fontWeight: amount === val ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: 14,
                  transition: 'all 0.2s'
                }}
              >
                ₹{val.toLocaleString()}
              </button>
            ))}
          </div>
          <button style={{ 
            width: '100%', 
            padding: '12px', 
            borderRadius: 8, 
            background: 'var(--teal)', 
            border: 'none', 
            color: '#fff', 
            fontWeight: 700, 
            fontSize: 14, 
            cursor: 'pointer' 
          }}>
            Pay ₹{amount.toLocaleString()}
          </button>
          <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-dim)', textAlign: 'center' }}>
            Secure payment powered by Cashfree. Credits never expire.
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Transaction History</h2>
          <button style={{ background: 'none', border: 'none', color: 'var(--teal-light)', fontSize: 13, cursor: 'pointer' }}>Download All Invoices</button>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 12, overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 0.5fr', padding: '12px 20px', background: 'var(--surface2)', borderBottom: '1px solid var(--border2)', minWidth: 600 }}>
            {['ID', 'Date', 'Description', 'Amount', 'Invoice'].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
            ))}
          </div>
          {transactions.length > 0 ? transactions.map((tx, i) => (
            <div key={tx.id} style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr 1fr 1fr 0.5fr', 
              padding: '16px 20px', 
              minWidth: 600,
              borderBottom: i < transactions.length - 1 ? '1px solid var(--border2)' : 'none',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{tx.id}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{tx.date}</div>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{tx.type}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>₹{tx.amount.toLocaleString()}</div>
              <div>
                <button style={{ 
                  background: 'none', 
                  border: '1px solid var(--border2)', 
                  borderRadius: 4, 
                  padding: '4px 8px', 
                  fontSize: 11, 
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}>PDF ↓</button>
              </div>
            </div>
          )) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
              No transactions yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
