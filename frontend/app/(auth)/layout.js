import "./auth.css";

function Logo({ size = 1 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36 * size, height: 36 * size, borderRadius: 9 * size, background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17 * size, color: '#fff', flexShrink: 0 }}>X</div>
      <span style={{ fontWeight: 700, fontSize: 20 * size, letterSpacing: '-0.02em', color: 'var(--text)' }}>Xpresswriters</span>
    </div>
  );
}

function AuthPanel() {
  const features = [
    { icon: '✍️', text: '1,200+ vetted expert writers' },
    { icon: '⚡', text: 'Delivery in as fast as 12 hours' },
    { icon: '🔒', text: 'End-to-end encrypted conversations' },
    { icon: '🔄', text: 'Unlimited revisions, guaranteed' },
    { icon: '🌍', text: 'Writers in 40+ countries' }
  ];

  return (
    <div style={{
      width: 440, flexShrink: 0, background: 'linear-gradient(160deg,#0a0a18 0%,#0d1a20 60%,#091a18 100%)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '44px 44px', position: 'relative', overflow: 'hidden'
    }}>
      {/* Glow orbs */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(13,148,136,0.18) 0%,transparent 70%)', top: -100, left: '50%', transform: 'translateX(-50%)', animation: 'orbFloat 8s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(13,148,136,0.08) 0%,transparent 70%)', bottom: 50, right: -50, pointerEvents: 'none' }} />

      {/* Grid texture */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(13,148,136,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(13,148,136,0.04) 1px,transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Logo />
        <div style={{ marginTop: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--teal-light)', marginBottom: 16, margin: "0px 0px 7.98328px", width: "348px", lineHeight: "1.3", letterSpacing: "0.3px" }}>Why Xpresswriters?</div>
          <h2 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 12 }}>
            Expert content,<br />
            <span style={{ background: 'linear-gradient(135deg,var(--teal-light),var(--teal),var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% auto', animation: 'shimmer 4s linear infinite' }}>on your terms.</span>
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 36, fontWeight: 300, maxWidth: 320 }}>Join 48,000+ students and professionals who trust our writers for SOPs, resumes, theses and more.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {features.map((f, i) =>
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, animation: `slideRight .4s ease ${i * .07}s both` }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(13,148,136,0.12)', border: '1px solid var(--border-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{f.icon}</div>
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 400 }}>{f.text}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div style={{ position: 'relative', zIndex: 1, background: 'rgba(13,148,136,0.07)', border: '1px solid var(--border-teal)', borderRadius: 12, padding: '18px 20px' }}>
        <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.65, marginBottom: 12 }}>"My SOP got me into Stanford. The writer understood my story better than I did."</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,var(--teal),#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, color: '#fff' }}>MK</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Meera Krishnan</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Stanford MBA · Admitted 2025</div>
          </div>
          <div style={{ marginLeft: 'auto', color: 'var(--gold)', fontSize: 12, letterSpacing: 2 }}>★★★★★</div>
        </div>
      </div>
    </div>
  );
}

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <AuthPanel />
      <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', overflowY: 'auto', background: 'var(--bg)' }}>
        {children}
      </div>
    </div>
  );
}
