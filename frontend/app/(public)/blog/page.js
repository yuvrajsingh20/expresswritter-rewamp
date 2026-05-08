"use client";
import React from 'react';

export default function BlogPage() {
  const POSTS = [
    { title: "How to Write a Winning SOP for Ivy League Schools", date: "May 04, 2026", category: "Academic", readTime: "5 min" },
    { title: "Top 10 Technical Writing Trends in 2026", date: "May 01, 2026", category: "Technology", readTime: "8 min" },
    { title: "The Ultimate Guide to Thesis Structuring", date: "Apr 28, 2026", category: "Education", readTime: "12 min" },
  ];

  return (
    <div style={{ background: '#fff', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
      <section style={{ padding: '80px 20px', textAlign: 'center', background: '#f8fafc' }}>
        <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '16px' }}>Insights & Resources</h1>
        <p style={{ color: '#64748b', fontSize: '18px' }}>Expert tips on academic writing, research, and professional growth.</p>
      </section>

      <section style={{ padding: '80px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
          {POSTS.map((p, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }}>
              <div style={{ width: '100%', height: '200px', background: '#f1f5f9', borderRadius: '16px' }} />
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#14b8a6', textTransform: 'uppercase' }}>{p.category}</span>
                  <span style={{ fontSize: '12px', color: '#94a8b3' }}>• {p.readTime} read</span>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', lineHeight: '1.4', marginBottom: '12px', transition: 'color 0.2s' }}>{p.title}</h2>
                <div style={{ fontSize: '14px', color: '#64748b' }}>{p.date}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
