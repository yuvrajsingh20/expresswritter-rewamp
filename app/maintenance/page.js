"use client";

export default function MaintenancePage() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#fff', 
      color: '#0f172a',
      fontFamily: 'Inter, sans-serif',
      textAlign: 'center',
      padding: '0 20px'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛠️</div>
      <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '16px' }}>Scheduled Maintenance</h1>
      <p style={{ color: '#64748b', maxWidth: '500px', marginBottom: '32px', lineHeight: '1.6', fontSize: '18px' }}>
        We're currently performing some scheduled maintenance to improve our platform. We'll be back online shortly.
      </p>
      <div style={{ padding: '16px 32px', background: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#14b8a6', textTransform: 'uppercase', marginBottom: '4px' }}>Estimated Uptime</div>
        <div style={{ fontSize: '20px', fontWeight: '800' }}>In about 45 minutes</div>
      </div>
      <p style={{ marginTop: '32px', fontSize: '14px', color: '#94a8b3' }}>Follow us on Twitter for real-time updates.</p>
    </div>
  );
}
