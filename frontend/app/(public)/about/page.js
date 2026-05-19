"use client";
import React from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import '@/app/(auth)/landing.css';

export default function AboutPage() {
  return (
    <div className="landing-page-container">
      <PublicNavbar />
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-section{padding:140px 32px 60px;text-align:center;background:radial-gradient(60% 100% at 50% 0%,rgba(13,148,136,0.18),transparent);border-bottom:1px solid var(--border);position:relative;overflow:hidden}
        .hero-section::before{content:'';position:absolute;inset:0;background:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><path d="M0 0h60v60H0z" fill="none"/><path d="M0 30h60M30 0v60" stroke="%23ffffff08" stroke-width="1"/></svg>');opacity:0.4;pointer-events:none}
        .hero-section > *{position:relative;z-index:1}
        .eyebrow-tag{display:inline-block;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--teal-light);padding:4px 12px;border-radius:5px;background:rgba(13,148,136,0.15);border:1px solid rgba(13,148,136,0.3);margin-bottom:18px}
        .hero-section h1{font-size:56px;font-weight:700;letter-spacing:-0.03em;line-height:1.05;margin-bottom:18px;max-width:880px;margin-left:auto;margin-right:auto}
        .hero-section h1 .accent-text{background:linear-gradient(135deg,var(--teal-light),#22d3ee);-webkit-background-clip:text;background-clip:text;color:transparent}
        .hero-section p{font-size:17px;color:var(--text-muted);max-width:620px;margin:0 auto;font-weight:300;line-height:1.6}
        .stats-grid{max-width:1080px;margin:60px auto 0;padding:0 32px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
        .stat-item{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px 22px}
        .stat-number{font-size:34px;font-weight:700;letter-spacing:-0.02em;color:var(--teal-light);margin-bottom:4px}
        .stat-label{font-size:12.5px;color:var(--text-muted);font-weight:500}
        .page-section{max-width:1080px;margin:96px auto;padding:0 32px}
        .section-header{text-align:center;margin-bottom:48px}
        .section-header h2{font-size:32px;font-weight:700;letter-spacing:-0.02em;margin-bottom:10px}
        .section-header p{font-size:14px;color:var(--text-muted);max-width:540px;margin:0 auto;font-weight:300}
        .story-container{display:grid;grid-template-columns:1.1fr 1fr;gap:60px;align-items:center}
        .story-container p{font-size:14.5px;color:var(--text-muted);line-height:1.8;margin-bottom:14px;font-weight:300}
        .story-container strong{color:var(--text);font-weight:600}
        .story-image{aspect-ratio:4/5;background:linear-gradient(135deg,rgba(13,148,136,0.2),rgba(13,148,136,0.05));border-radius:14px;border:1px solid var(--border);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:80px;color:rgba(13,148,136,0.3)}
        .story-image::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent,transparent 14px,rgba(255,255,255,0.02) 14px,rgba(255,255,255,0.02) 28px)}
        .values-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
        .value-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:26px 24px;transition:all .15s}
        .value-card:hover{border-color:var(--teal);transform:translateY(-2px)}
        .value-icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:14px}
        .value-card h3{font-size:15px;font-weight:700;margin-bottom:6px}
        .value-card p{font-size:13px;color:var(--text-muted);font-weight:300;line-height:1.6}
        .team-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
        .team-member{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:22px 20px;text-align:center;transition:all .15s}
        .team-member:hover{border-color:var(--teal)}
        .member-avatar{width:72px;height:72px;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:22px;color:#fff;letter-spacing:-0.02em}
        .team-member h4{font-size:14.5px;font-weight:700;margin-bottom:2px}
        .team-member .member-role{font-size:12px;color:var(--teal-light);font-weight:500;margin-bottom:10px}
        .team-member p{font-size:11.5px;color:var(--text-muted);font-weight:300;line-height:1.6}
        .contact-section{background:linear-gradient(180deg,transparent,rgba(13,148,136,0.04));padding-top:60px}
        .contact-grid-container{display:grid;grid-template-columns:1.1fr 1fr;gap:48px}
        .contact-channels{display:flex;flex-direction:column;gap:12px}
        .contact-channel{display:flex;align-items:center;gap:16px;padding:18px 22px;background:var(--surface);border:1px solid var(--border);border-radius:11px;text-decoration:none;color:var(--text);transition:all .15s}
        .contact-channel:hover{border-color:var(--teal);transform:translateX(2px)}
        .channel-icon{width:46px;height:46px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
        .channel-info{flex:1;min-width:0}
        .channel-info h4{font-size:14px;font-weight:700;margin-bottom:2px}
        .channel-info .channel-value{font-size:12.5px;color:var(--text-muted);font-weight:300}
        .channel-metadata{font-size:10.5px;color:var(--text-dim);font-weight:600;letter-spacing:0.05em;text-transform:uppercase}
        .contact-form{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:30px 32px}
        .contact-form h3{font-size:18px;font-weight:700;letter-spacing:-0.01em;margin-bottom:6px}
        .contact-form > p{font-size:12.5px;color:var(--text-muted);font-weight:300;margin-bottom:22px}
        .form-field{margin-bottom:14px}
        .form-field label{display:block;font-size:11.5px;font-weight:600;color:var(--text-muted);margin-bottom:6px;letter-spacing:0.02em}
        .form-field input,.form-field select,.form-field textarea{width:100%;padding:11px 13px;background:var(--surface2);border:1px solid var(--border);border-radius:7px;color:var(--text);font-size:13px;font-family:var(--font);outline:none;transition:border .15s}
        .form-field input:focus,.form-field select:focus,.form-field textarea:focus{border-color:var(--teal)}
        .form-field textarea{resize:vertical;min-height:100px}
        .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .submit-button{width:100%;padding:13px;border-radius:8px;background:var(--teal);color:#fff;border:none;font-weight:600;font-size:13px;cursor:pointer;font-family:var(--font);transition:background .15s;display:flex;align-items:center;justify-content:center;gap:7px}
        .submit-button:hover{background:var(--teal-dark)}
        .locations-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px}
        .location-card{background:var(--surface);border:1px solid var(--border);border-radius:11px;padding:20px 22px}
        .location-card .flag-icon{font-size:24px;margin-bottom:8px}
        .location-card h4{font-size:13.5px;font-weight:700;margin-bottom:4px}
        .location-card p{font-size:11.5px;color:var(--text-muted);font-weight:300;line-height:1.6}
        .success-message{display:none;padding:14px 16px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:8px;color:var(--green);font-size:13px;font-weight:500;margin-bottom:14px}
        .success-message.show{display:flex;align-items:center;gap:9px;animation:fadeInAnimation .25s}
        @keyframes fadeInAnimation{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
        @media (max-width:780px){.story-container,.contact-grid-container{grid-template-columns:1fr}.values-grid,.team-grid,.stats-grid,.locations-grid{grid-template-columns:1fr 1fr}.hero-section h1{font-size:36px}}
      ` }} />

      <div className="hero-section">
        <span className="eyebrow-tag">Our Story</span>
        <h1>Words that change lives, written by <span className="accent-text">humans who care</span>.</h1>
        <p>Xpresswriters started in a Mumbai college library in 2021, born from a simple frustration: students with brilliant ideas were being judged on writing alone. Today we're the network of 850+ vetted experts behind 47,000 admissions, careers, and businesses worldwide.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-item"><div className="stat-number">47,200+</div><div className="stat-label">Orders delivered</div></div>
        <div className="stat-item"><div className="stat-number">850</div><div className="stat-label">Vetted writers</div></div>
        <div className="stat-item"><div className="stat-number">4.92★</div><div className="stat-label">Avg. rating</div></div>
        <div className="stat-item"><div className="stat-number">96%</div><div className="stat-label">On-time delivery</div></div>
      </div>

      <div className="page-section">
        <div className="section-header"><h2>Why we exist</h2><p>To level the playing field — so good ideas aren't lost to bad writing.</p></div>
        <div className="story-container">
          <div>
            <p><strong>It started with a Statement of Purpose.</strong> Aarav, our founder, watched his roommate — a brilliant biotech student — get rejected from a dream PhD program because his SOP, in his second language, didn't communicate his research half as well as he could in person.</p>
            <p>He started editing applications for friends. Friends told friends. Within a year, 200 students had come through. Then a writer in Bangalore offered to help. Then ten more.</p>
            <p>Today, <strong>Xpresswriters</strong> is what happens when you put that small-team obsession with the brief, the deadline, and the human story at the centre of every order — and connect 850 of the world's best freelance writers around it.</p>
            <p>We're not the cheapest. We're not the biggest. <strong>We're the ones who give a damn about your draft.</strong></p>
          </div>
          <div className="story-image">📖</div>
        </div>
      </div>

      <div className="page-section">
        <div className="section-header"><h2>What we stand for</h2><p>Five principles, no exceptions.</p></div>
        <div className="values-grid">
          <div className="value-card"><div className="value-icon" style={{background:'rgba(13,148,136,0.15)',color:'var(--teal-light)'}}>🤝</div><h3>Humans, not algorithms</h3><p>Every word is written by a vetted human writer. AI is a tool, never a substitute.</p></div>
          <div className="value-card"><div className="value-icon" style={{background:'rgba(245,158,11,0.15)',color:'var(--amber)'}}>⚡</div><h3>On time, every time</h3><p>96% on-time rate. If we're late without prior agreement, we credit your wallet with 100% of the value — automatically.</p></div>
          <div className="value-card"><div className="value-icon" style={{background:'rgba(167,139,250,0.15)',color:'var(--violet)'}}>🔒</div><h3>Your privacy is sacred</h3><p>No data sold. No work resold. NDAs available on request. GDPR + DPDP compliant.</p></div>
          <div className="value-card"><div className="value-icon" style={{background:'rgba(34,197,94,0.15)',color:'var(--green)'}}>✓</div><h3>100% Original Guarantee</h3><p>Every draft scanned for plagiarism and AI. Under 10% similarity guaranteed or we do a full rework.</p></div>
          <div className="value-card"><div className="value-icon" style={{background:'rgba(244,63,94,0.15)',color:'var(--red)'}}>💼</div><h3>Fair pay for writers</h3><p>70% of every order goes to the writer. No exploitative race-to-the-bottom marketplace.</p></div>
          <div className="value-card"><div className="value-icon" style={{background:'rgba(59,130,246,0.15)',color:'var(--blue)'}}>🌍</div><h3>Global, local feel</h3><p>Writers in 38 countries, support in 6 languages, prices in your currency.</p></div>
        </div>
      </div>

      <div className="page-section">
        <div className="section-header"><h2>The team behind the network</h2><p>Tiny, full-stack, obsessed with craft.</p></div>
        <div className="team-grid">
          <div className="team-member"><div className="member-avatar" style={{background:'linear-gradient(135deg,#0d9488,#0f766e)'}}>AS</div><h4>Aarav Sharma</h4><div className="member-role">Founder &amp; CEO</div><p>Ex-IIT Bombay, helped 200+ apps before this was a company.</p></div>
          <div className="team-member"><div className="member-avatar" style={{background:'linear-gradient(135deg,#a78bfa,#7c3aed)'}}>PM</div><h4>Priya Menon</h4><div className="member-role">Head of Writers</div><p>PhD English, formerly senior editor at HarperCollins India.</p></div>
          <div className="team-member"><div className="member-avatar" style={{background:'linear-gradient(135deg,#f59e0b,#d97706)'}}>RK</div><h4>Rohan Kapoor</h4><div className="member-role">CTO</div><p>Built CRM at Razorpay. Loves Postgres, hates clutter.</p></div>
          <div className="team-member"><div className="member-avatar" style={{background:'linear-gradient(135deg,#22c55e,#15803d)'}}>SN</div><h4>Sara Nair</h4><div className="member-role">Head of Customer</div><p>15 years in EdTech ops. Answers your tickets at 3 AM if needed.</p></div>
        </div>
      </div>

      <div className="page-section contact-section" id="contact">
        <div className="section-header"><h2>Get in touch</h2><p>We reply to every message — usually within an hour during business hours, always within 24.</p></div>
        <div className="contact-grid-container">
          <div>
            <div className="contact-channels">
              <a href="mailto:admin@expresswriter.in" className="contact-channel">
                <div className="channel-icon" style={{background:'rgba(13,148,136,0.15)',color:'var(--teal-light)'}}>✉️</div>
                <div className="channel-info"><h4>Email Support</h4><div className="channel-value">admin@expresswriter.in</div></div>
                <span className="channel-metadata">~1h reply</span>
              </a>
              <a href="#" className="contact-channel">
                <div className="channel-icon" style={{background:'rgba(34,197,94,0.15)',color:'var(--green)'}}>💬</div>
                <div className="channel-info"><h4>WhatsApp</h4><div className="channel-value">+91 98765 43210</div></div>
                <span className="channel-metadata">24/7</span>
              </a>
              <a href="#" className="contact-channel">
                <div className="channel-icon" style={{background:'rgba(167,139,250,0.15)',color:'var(--violet)'}}>💭</div>
                <div className="channel-info"><h4>Live Chat</h4><div className="channel-value">Click the bubble at bottom-right</div></div>
                <span className="channel-metadata">live</span>
              </a>
              <a href="tel:+918888000111" className="contact-channel">
                <div className="channel-icon" style={{background:'rgba(245,158,11,0.15)',color:'var(--amber)'}}>📞</div>
                <div className="channel-info"><h4>Phone (India)</h4><div className="channel-value">+91 88880 00111 · 9 AM – 9 PM IST</div></div>
                <span className="channel-metadata">Mon-Sat</span>
              </a>
              <a href="mailto:admin@expresswriter.in" className="contact-channel">
                <div className="channel-icon" style={{background:'rgba(59,130,246,0.15)',color:'var(--blue)'}}>🏢</div>
                <div className="channel-info"><h4>Enterprise &amp; Bulk Orders</h4><div className="channel-value">admin@expresswriter.in</div></div>
                <span className="channel-metadata">Custom</span>
              </a>
            </div>
          </div>
          <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert('Message sent! We will reply within 1 hour.'); e.target.reset(); }}>
            <h3>Send us a note</h3>
            <p>Sales, partnerships, press, or just to say hi.</p>
            <div className="form-row">
              <div className="form-field"><label>Name</label><input required placeholder="Your full name"/></div>
              <div className="form-field"><label>Email</label><input type="email" required placeholder="you@email.com"/></div>
            </div>
            <div className="form-field"><label>I'm asking about</label>
              <select>
                <option>General question</option>
                <option>Custom enterprise quote</option>
                <option>Partnership / Affiliate</option>
                <option>Press &amp; Media</option>
                <option>Writer applications</option>
                <option>Refund or order issue</option>
              </select>
            </div>
            <div className="form-field"><label>Message</label><textarea required placeholder="Tell us a bit about what you need…"></textarea></div>
            <button className="submit-button" type="submit">Send message →</button>
          </form>
        </div>

        <div className="locations-grid">
          <div className="location-card"><div className="flag-icon">🇮🇳</div><h4>Mumbai HQ</h4><p>Floor 7, Phoenix Marketcity<br/>Kurla West, Mumbai 400070</p></div>
          <div className="location-card"><div className="flag-icon">🇬🇧</div><h4>London Office</h4><p>21 Soho Square<br/>London W1D 3QP, UK</p></div>
          <div className="location-card"><div className="flag-icon">🇺🇸</div><h4>San Francisco</h4><p>548 Market St #38291<br/>San Francisco, CA 94104</p></div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
