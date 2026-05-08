"use client";
import React from 'react';
import { useParams } from 'next/navigation';

export default function WriterProfile() {
  const params = useParams();
  const slug = params.slug;

  // Mock data - in a real app, this would be fetched from the database
  const writer = {
    name: "Dr. Amara Singh",
    avatar: "AS",
    title: "Premium Academic Expert",
    rating: 4.98,
    reviews: 124,
    orders: 312,
    onTime: "100%",
    bio: "Specializing in SOPs and PhD-level research papers. Over 8 years of experience in academic writing with a focus on Engineering and Life Sciences.",
    skills: ["SOP Writing", "Thesis Writing", "Research Analysis", "Editing"],
    verified: true,
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '80px 20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
          {/* Sidebar Info */}
          <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', textAlign: 'center', height: 'fit-content', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: '800', color: '#fff' }}>
              {writer.avatar}
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>{writer.name}</h1>
            <div style={{ color: '#14b8a6', fontWeight: '700', fontSize: '14px', marginBottom: '16px' }}>{writer.title}</div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
              <span style={{ fontSize: '18px' }}>⭐</span>
              <span style={{ fontWeight: '800', fontSize: '18px' }}>{writer.rating}</span>
              <span style={{ color: '#94a8b3' }}>({writer.reviews} reviews)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'left', marginBottom: '32px' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Orders</div>
                <div style={{ fontSize: '18px', fontWeight: '800' }}>{writer.orders}+</div>
              </div>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>On-Time</div>
                <div style={{ fontSize: '18px', fontWeight: '800' }}>{writer.onTime}</div>
              </div>
            </div>

            <button style={{ width: '100%', padding: '16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              Hire This Writer <span>→</span>
            </button>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>About Me</h2>
              <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '16px' }}>{writer.bio}</p>
              
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '32px', marginBottom: '16px' }}>Expertise & Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {writer.skills.map(s => (
                  <span key={s} style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', borderRadius: '100px', fontSize: '13px', fontWeight: '600' }}>{s}</span>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Recent Feedback</h2>
              {[1, 2].map(i => (
                <div key={i} style={{ marginBottom: '24px', borderBottom: i === 1 ? '1px solid #f1f5f9' : 'none', paddingBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>{"⭐".repeat(5)}</div>
                    <div style={{ fontSize: '12px', color: '#94a8b3' }}>2 weeks ago</div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#475569', fontStyle: 'italic' }}>"Excellent quality and delivered way before the deadline. Highly recommend for any academic SOP work."</p>
                  <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>- Verified Customer (ORD-9821)</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
