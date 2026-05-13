"use client";
import Link from 'next/link';

export default function PublicFooter() {
  return (
    <>
      {/* Trust band */}
      <div style={{padding:'40px 32px',background:'linear-gradient(135deg,rgba(13,148,136,0.06),transparent)',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
        <div style={{maxWidth:1320,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:24,textAlign:'center'}}>
          {[['🔒','100% Confidential','NDA-grade privacy on every order'],['🎓','PhD-level writers','340+ verified domain experts'],['↻','Unlimited revisions','2 free revisions on every plan'],['💰','Money-back guarantee','Full refund within 14 days']].map(([i,t,d])=>(<div key={t}><div style={{fontSize:28,marginBottom:7}}>{i}</div><div style={{fontSize:13,fontWeight:700,marginBottom:3}}>{t}</div><div style={{fontSize:11.5,color:'var(--text-muted)',fontWeight:300}}>{d}</div></div>))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{padding:'40px 32px',textAlign:'center',color:'var(--text-dim)',fontSize:11.5}}>
        <div style={{marginBottom:6}}>© 2026 Xpresswriters Inc. · Made with care in Mumbai</div>
        <div style={{display:'flex',gap:18,justifyContent:'center',marginTop:10}}>
          <Link href="/dashboard" style={{color:'var(--text-muted)',textDecoration:'none'}}>Dashboard</Link>
          <Link href="/invoices" style={{color:'var(--text-muted)',textDecoration:'none'}}>Invoices</Link>
          <Link href="/notifications" style={{color:'var(--text-muted)',textDecoration:'none'}}>Notifications</Link>
          <Link href="/writer-onboarding" style={{color:'var(--text-muted)',textDecoration:'none'}}>Become a Writer</Link>
        </div>
      </footer>
    </>
  );
}
