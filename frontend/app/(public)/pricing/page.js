import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import '@/app/(auth)/landing.css';

export default function PricingPage() {

  const [service, setService] = useState('Academic Writing');
  const [deadline, setDeadline] = useState('7 Days');
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const RATES = {
    'Academic Writing': 450,
    'SOP Writing': 1200,
    'Resume/CV': 800,
    'Thesis/Research': 650,
    'Technical Article': 500,
  };

  const MULTIPLIERS = {
    '7 Days': 1,
    '3 Days': 1.5,
    '24 Hours': 2.2,
    '6 Hours': 3.5,
  };

  useEffect(() => {
    const base = RATES[service] || 450;
    const mult = MULTIPLIERS[deadline] || 1;
    setTotal(base * pages * mult);
  }, [service, deadline, pages]);

  return (
    <div className="landing-page-container">
      <PublicNavbar />
      <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font)' }}>
        <section style={{ padding: '140px 20px 80px', textAlign: 'center', background: 'radial-gradient(60% 100% at 50% 0%,rgba(13,148,136,0.12),transparent)', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.02em' }}>Transparent Pricing</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto', fontWeight: 300 }}>Calculate your project cost instantly with our smart estimator.</p>
        </section>

        <section style={{ padding: '80px 32px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'start' }}>
            {/* Calculator */}
            <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', letterSpacing: '-0.01em' }}>Pricing Calculator</h2>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '10px', letterSpacing: '0.05em' }}>Select Service</label>
                <select 
                  value={service} 
                  onChange={(e) => setService(e.target.value)}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: '15px', outline: 'none' }}
                >
                  {Object.keys(RATES).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '10px', letterSpacing: '0.05em' }}>Deadline</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
                  {Object.keys(MULTIPLIERS).map(d => (
                    <button 
                      key={d}
                      onClick={() => setDeadline(d)}
                      style={{ 
                        padding: '12px', 
                        borderRadius: '10px', 
                        border: deadline === d ? '1.5px solid var(--teal)' : '1px solid var(--border)',
                        background: deadline === d ? 'rgba(13,148,136,0.15)' : 'var(--surface2)',
                        color: deadline === d ? 'var(--teal-light)' : 'var(--text-muted)',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '36px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '10px', letterSpacing: '0.05em' }}>Number of Pages (250 words/page)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <button onClick={() => setPages(Math.max(1, pages - 1))} style={{ width: '44px', height: '44px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: '20px', cursor: 'pointer' }}>-</button>
                  <span style={{ fontSize: '24px', fontWeight: '700', width: '40px', textAlign: 'center' }}>{pages}</span>
                  <button onClick={() => setPages(pages + 1)} style={{ width: '44px', height: '44px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: '20px', cursor: 'pointer' }}>+</button>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 4 }}>Estimated Cost</div>
                  <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.02em' }}>₹{total.toLocaleString()}</div>
                </div>
                <Link href="/" style={{ padding: '16px 32px', background: 'var(--teal)', color: '#fff', borderRadius: '14px', fontWeight: '700', textDecoration: 'none', boxShadow: '0 10px 20px rgba(13, 148, 136, 0.3)', transition: 'transform 0.2s' }}>
                  Order Now →
                </Link>
              </div>
            </div>

            <div style={{ paddingTop: 20 }}>
              <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '32px', letterSpacing: '-0.02em' }}>The Xpresswriters Promise</h2>
              {[
                { t: 'Plagiarism-Free Content', d: 'Every project is scanned with Turnitin for 100% originality. Reports provided on request.', i: '🛡️' },
                { t: 'Expert Human Writers', d: 'Only PhD and Master level writers handle your tasks. No AI-generated filler.', i: '🎓' },
                { t: 'Secure Transactions', d: 'SSL encrypted payments with Razorpay and Stripe for complete peace of mind.', i: '🔒' },
                { t: 'Round-the-clock Support', d: 'Human assistance available 24/7 via WhatsApp and live dashboard chat.', i: '💬' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
                  <div style={{ width: '52px', height: '52px', background: 'rgba(13,148,136,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-light)', fontSize: '24px', flexShrink: 0 }}>{f.i}</div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '6px' }}>{f.t}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', fontWeight: 300 }}>{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <PublicFooter />
    </div>
  );
}

