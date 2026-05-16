export default function DashboardLoading() {
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0b' }}>
      {/* Skeleton Sidebar */}
      <div style={{ width: 220, background: '#121224', borderRight: '1px solid rgba(255,255,255,0.07)', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#0d9488,#0f766e)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff' }}>E</div>
          <div>
            <div style={{ width: 80, height: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 4 }} />
            <div style={{ width: 50, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
          </div>
        </div>
        <div style={{ width: '100%', height: 40, background: 'rgba(13,148,136,0.14)', borderRadius: 7, marginBottom: 8 }} />
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ width: '100%', height: 40, background: 'rgba(255,255,255,0.03)', borderRadius: 7, marginBottom: 8 }} />
        ))}
      </div>

      {/* Skeleton Content */}
      <div style={{ flex: 1, padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ width: 200, height: 24, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ background: '#121224', borderRadius: 8, padding: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: 60, height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 10 }} />
              <div style={{ width: 100, height: 28, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
            </div>
          ))}
        </div>

        <div style={{ width: '60%', height: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 16 }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 70, background: '#121224', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}