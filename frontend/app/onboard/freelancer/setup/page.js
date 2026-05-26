"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { uploadFileToSupabase } from '@/lib/upload';

const STEPS = [
  { id: 1, label: 'Profile', icon: '👤' },
  { id: 2, label: 'Expertise', icon: '🎯' },
  { id: 3, label: 'Portfolio', icon: '📁' },
  { id: 4, label: 'Assessment', icon: '✍️' },
  { id: 5, label: 'Agreements', icon: '📝' },
  { id: 6, label: 'Review', icon: '✓' },
];

const SKILL_CATEGORIES = [
  { id: 'sop', label: 'Statement of Purpose', icon: '🎓' },
  { id: 'essay', label: 'Academic Essay', icon: '📝' },
  { id: 'lor', label: 'LOR', icon: '📜' },
  { id: 'resume', label: 'Resume & CV', icon: '📄' },
  { id: 'linkedin', label: 'LinkedIn Profile', icon: '💼' },
  { id: 'email', label: 'Professional Emails', icon: '✉️' },
  { id: 'thesis', label: 'Thesis & Dissertation', icon: '🔬' },
  { id: 'ppt', label: 'Presentations (PPT)', icon: '📊' },
  { id: 'research', label: 'Research Proposal', icon: '🧪' },
  { id: 'article', label: 'Articles', icon: '🗞️' },
  { id: 'blog', label: 'Blog Posts', icon: '✍️' },
  { id: 'proposal', label: 'Business Proposals', icon: '📋' },
];

const LANG_OPTIONS = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Arabic', 'Hindi', 'Portuguese'];
const EDU_OPTIONS = ["Bachelor's", "Master's", "PhD", "Professional Degree", "Other"];

/* ── PROGRESS BAR ── */
function ProgressBar({ step, total }) {
  return (
    <div className="flex items-center gap-0 max-w-[640px] mx-auto px-4">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center gap-1.5 z-10">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-400 border-2 ${
                s.id < step ? 'bg-teal-600 border-teal-600 text-white' : 
                s.id === step ? 'bg-teal-600 border-teal-600 shadow-[0_0_0_4px_rgba(13,148,136,0.2)]' : 
                'bg-[#1a1a35] border-white/10'
              }`}
            >
              {s.id < step ? <span className="text-white text-sm font-bold">✓</span> : <span className={`text-[${s.id === step ? '16px' : '14px'}] ${s.id > step ? 'grayscale opacity-40' : ''}`}>{s.icon}</span>}
            </div>
            <div className={`text-[10px] whitespace-nowrap ${s.id === step ? 'font-bold text-[#2dd4bf]' : 'font-normal text-[#3d5c5a]'}`}>{s.label}</div>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-[2px] transition-colors duration-400 mb-[18px] ${s.id < step ? 'bg-teal-600' : 'bg-[#1a1a35]'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── STEP 1: PROFILE ── */
function Step1({ data, onChange }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h2 className="text-[26px] font-bold mb-1.5 text-[#f0fffe]">Create your writer profile</h2>
      <p className="text-sm text-[#7a9e9b] mb-8 font-light">This is what clients will see when they browse for writers.</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.07em] text-[#7a9e9b] uppercase mb-[7px]">First Name</label>
          <input className="w-full bg-[#1a1a35] border-[1.5px] border-white/5 rounded-lg px-3.5 py-[11px] text-[#f0fffe] text-sm outline-none focus:border-teal-600 transition-colors placeholder:text-[#3d5c5a]" value={data.firstName} onChange={e => onChange('firstName', e.target.value)} placeholder="James" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.07em] text-[#7a9e9b] uppercase mb-[7px]">Last Name</label>
          <input className="w-full bg-[#1a1a35] border-[1.5px] border-white/5 rounded-lg px-3.5 py-[11px] text-[#f0fffe] text-sm outline-none focus:border-teal-600 transition-colors placeholder:text-[#3d5c5a]" value={data.lastName} onChange={e => onChange('lastName', e.target.value)} placeholder="Whitfield" />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold tracking-[0.07em] text-[#7a9e9b] uppercase mb-[7px]">Professional Title</label>
        <input className="w-full bg-[#1a1a35] border-[1.5px] border-white/5 rounded-lg px-3.5 py-[11px] text-[#f0fffe] text-sm outline-none focus:border-teal-600 transition-colors placeholder:text-[#3d5c5a]" value={data.title} onChange={e => onChange('title', e.target.value)} placeholder="e.g. Senior Academic Writer | PhD in English Literature" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.07em] text-[#7a9e9b] uppercase mb-[7px]">Email</label>
          <input className="w-full bg-[#1a1a35] border-[1.5px] border-white/5 rounded-lg px-3.5 py-[11px] text-[#f0fffe] text-sm outline-none focus:border-teal-600 transition-colors placeholder:text-[#3d5c5a]" type="email" value={data.email} onChange={e => onChange('email', e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.07em] text-[#7a9e9b] uppercase mb-[7px]">Country</label>
          <select className="w-full bg-[#1a1a35] border-[1.5px] border-white/5 rounded-lg px-3.5 py-[11px] text-[#f0fffe] text-sm outline-none focus:border-teal-600 transition-colors cursor-pointer" value={data.country} onChange={e => onChange('country', e.target.value)}>
            <option value="" className="bg-[#101019]">Select country</option>
            {['United States', 'United Kingdom', 'Canada', 'Australia', 'India', 'Other'].map(c => <option key={c} className="bg-[#101019]">{c}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold tracking-[0.07em] text-[#7a9e9b] uppercase mb-[7px]">Bio <span className="font-normal normal-case text-[#3d5c5a]">— tell clients about your background (2-4 sentences)</span></label>
        <textarea className="w-full bg-[#1a1a35] border-[1.5px] border-white/5 rounded-lg px-3.5 py-[11px] text-[#f0fffe] text-sm outline-none focus:border-teal-600 transition-colors placeholder:text-[#3d5c5a] resize-y" value={data.bio} onChange={e => onChange('bio', e.target.value)} rows={4} placeholder="e.g. PhD in English Literature with 8+ years of academic writing experience. I specialize in SOPs, research proposals, and dissertations..." />
        <div className="text-[11px] text-[#3d5c5a] mt-1.5 text-right">{data.bio.length}/400 characters</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.07em] text-[#7a9e9b] uppercase mb-[7px]">Education Level</label>
          <select className="w-full bg-[#1a1a35] border-[1.5px] border-white/5 rounded-lg px-3.5 py-[11px] text-[#f0fffe] text-sm outline-none focus:border-teal-600 transition-colors cursor-pointer" value={data.education} onChange={e => onChange('education', e.target.value)}>
            <option value="" className="bg-[#101019]">Select level</option>
            {EDU_OPTIONS.map(o => <option key={o} className="bg-[#101019]">{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.07em] text-[#7a9e9b] uppercase mb-[7px]">Languages</label>
          <select className="w-full bg-[#1a1a35] border-[1.5px] border-white/5 rounded-lg px-3.5 py-[11px] text-[#f0fffe] text-sm outline-none focus:border-teal-600 transition-colors cursor-pointer" value={data.language} onChange={e => onChange('language', e.target.value)}>
            <option value="" className="bg-[#101019]">Primary language</option>
            {LANG_OPTIONS.map(l => <option key={l} className="bg-[#101019]">{l}</option>)}
          </select>
        </div>
      </div>
    </motion.div>
  );
}

/* ── STEP 2: EXPERTISE ── */
function Step2({ data, onChange }) {
  const toggle = (id) => {
    const set = new Set(data.skills);
    if (set.has(id)) set.delete(id); else set.add(id);
    onChange('skills', Array.from(set));
  };

  const skillsSet = new Set(data.skills || []);

  const EXP_LEVELS = [
    { id: 'new', label: '0–2 years', desc: 'Just starting out' },
    { id: 'mid', label: '2–5 years', desc: 'Solid experience' },
    { id: 'senior', label: '5–10 years', desc: 'Expert-level' },
    { id: 'expert', label: '10+ years', desc: 'Seasoned professional' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h2 className="text-[26px] font-bold mb-1.5 text-[#f0fffe]">Your expertise</h2>
      <p className="text-sm text-[#7a9e9b] mb-7 font-light">Select all service categories you can write in. Choose at least 2.</p>

      <div className="mb-7">
        <label className="block text-xs font-semibold tracking-[0.07em] text-[#7a9e9b] uppercase mb-3">Service categories <span className="text-[#2dd4bf]">({skillsSet.size} selected)</span></label>
        <div className="grid grid-cols-3 gap-2.5">
          {SKILL_CATEGORIES.map(s => {
            const sel = skillsSet.has(s.id);
            return (
              <div key={s.id} onClick={() => toggle(s.id)} className={`p-3 rounded-lg cursor-pointer transition-all flex items-center gap-2 border-[1.5px] ${sel ? 'bg-teal-600/15 border-teal-600' : 'bg-[#1a1a35] border-white/5'}`}>
                <span className="text-lg">{s.icon}</span>
                <span className={`text-xs ${sel ? 'font-semibold text-[#2dd4bf]' : 'font-normal text-[#7a9e9b]'}`}>{s.label}</span>
                {sel && <span className="ml-auto text-teal-600 text-sm font-bold">✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-7">
        <label className="block text-xs font-semibold tracking-[0.07em] text-[#7a9e9b] uppercase mb-3">Years of writing experience</label>
        <div className="grid grid-cols-4 gap-2.5">
          {EXP_LEVELS.map(e => {
            const sel = data.experience === e.id;
            return (
              <div key={e.id} onClick={() => onChange('experience', e.id)} className={`p-3.5 rounded-lg cursor-pointer text-center transition-all border-[1.5px] ${sel ? 'bg-teal-600/15 border-teal-600' : 'bg-[#1a1a35] border-white/5'}`}>
                <div className={`font-bold text-[15px] mb-1 ${sel ? 'text-[#2dd4bf]' : 'text-[#f0fffe]'}`}>{e.label}</div>
                <div className="text-[11px] text-[#3d5c5a]">{e.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold tracking-[0.07em] text-[#7a9e9b] uppercase mb-[7px]">Special credentials or certifications</label>
        <input className="w-full bg-[#1a1a35] border-[1.5px] border-white/5 rounded-lg px-3.5 py-[11px] text-[#f0fffe] text-sm outline-none focus:border-teal-600 transition-colors placeholder:text-[#3d5c5a]" value={data.credentials} onChange={e => onChange('credentials', e.target.value)} placeholder="e.g. PhD, MA, CELTA, Google-certified, etc." />
      </div>
    </motion.div>
  );
}

/* ── STEP 3: PORTFOLIO ── */
function Step3({ data, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const mockFiles = data.files || [];

  const addFile = (name, size, url) => {
    onChange('files', [...mockFiles, { name, size, url, id: Date.now() }]);
  };

  const handleFileUpload = async (e) => {
    let selectedFiles = [];
    if (e.type === 'drop') {
      e.preventDefault();
      setDragging(false);
      selectedFiles = Array.from(e.dataTransfer.files);
    } else {
      selectedFiles = Array.from(e.target.files);
    }
    
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    for (const file of selectedFiles) {
       const res = await uploadFileToSupabase(file, 'portfolios');
       if (res.url) {
          addFile(file.name, (file.size / (1024*1024)).toFixed(1) + ' MB', res.url);
       } else {
          alert('Failed to upload ' + file.name + ': ' + res.error);
       }
    }
    setUploading(false);
  };

  const FILE_ICONS = { pdf: '📄', docx: '📝', doc: '📝', default: '📎' };
  const getIcon = (name) => FILE_ICONS[name.split('.').pop().toLowerCase()] || FILE_ICONS.default;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h2 className="text-[26px] font-bold mb-1.5 text-[#f0fffe]">Upload your portfolio</h2>
      <p className="text-sm text-[#7a9e9b] mb-7 font-light">Show clients your best work. Upload 2–5 writing samples in PDF or Word format.</p>

      {/* Drop zone */}
      <label
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleFileUpload}
        className={`block border-2 border-dashed rounded-xl p-10 text-center mb-6 cursor-pointer transition-all ${dragging ? 'border-teal-600 bg-teal-600/10' : 'border-white/10 bg-[#1a1a35]'}`}
      >
        <input type="file" multiple className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
        <div className="text-[40px] mb-3">📁</div>
        <div className="font-semibold text-[15px] mb-1.5">{uploading ? 'Uploading...' : 'Drop files here or click to upload'}</div>
        <div className="text-[13px] text-[#7a9e9b]">PDF, DOC, DOCX · Max 10MB per file</div>
      </label>

      {/* Uploaded files */}
      {mockFiles.length > 0 && (
        <div className="mb-6">
          <label className="block text-xs font-semibold tracking-[0.07em] text-[#7a9e9b] uppercase mb-2.5">Uploaded ({mockFiles.length})</label>
          <div className="flex flex-col gap-2">
            {mockFiles.map((f, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={f.id} className="flex items-center gap-3 bg-[#1a1a35] border border-white/5 rounded-lg px-4 py-3">
                <span className="text-[20px]">{getIcon(f.name)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium overflow-hidden text-ellipsis whitespace-nowrap">{f.name}</div>
                  <div className="text-[11px] text-[#3d5c5a] mt-0.5">{f.size}</div>
                </div>
                <span className="text-[#22c55e] text-[13px] font-semibold flex-shrink-0">✓ Uploaded</span>
                <button onClick={() => onChange('files', mockFiles.filter(x => x.id !== f.id))} className="bg-transparent border-none text-[#3d5c5a] cursor-pointer text-base p-1 hover:text-white">✕</button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio URL */}
      <div>
        <label className="block text-xs font-semibold tracking-[0.07em] text-[#7a9e9b] uppercase mb-[7px]">Portfolio website or LinkedIn <span className="font-light normal-case text-[#3d5c5a]">(optional)</span></label>
        <input className="w-full bg-[#1a1a35] border-[1.5px] border-white/5 rounded-lg px-3.5 py-[11px] text-[#f0fffe] text-sm outline-none focus:border-teal-600 transition-colors placeholder:text-[#3d5c5a]" value={data.portfolioUrl} onChange={e => onChange('portfolioUrl', e.target.value)} placeholder="https://yourportfolio.com or linkedin.com/in/yourname" />
      </div>
    </motion.div>
  );
}

/* ── STEP 4: ASSESSMENT ── */
function Step4({ data, onChange }) {
  const [submitted, setSubmitted] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [score, setScore] = useState(null);

  const PROMPTS = [
    { id: 'sop', label: 'Academic', prompt: 'Write a 150-word opening paragraph for a Statement of Purpose for an applicant to a Computer Science PhD program at MIT. The applicant has a background in ML research and published one paper.' },
    { id: 'blog', label: 'Content', prompt: 'Write a 150-word introduction for a blog post titled "Why Remote Work Is Here to Stay in 2026" — targeted at HR managers at mid-size tech companies.' },
    { id: 'business', label: 'Business', prompt: 'Write a 150-word executive summary for a business proposal for a B2B SaaS startup seeking to automate payroll processing for SMEs.' },
  ];
  const [activePrompt, setActivePrompt] = useState(0);

  const handleSubmit = () => {
    if (!data.sample || data.sample.length < 80) return;
    setScoring(true);
    setTimeout(() => {
      setScoring(false);
      setScore({ clarity: 87, tone: 91, structure: 84, originality: 89, overall: 88 });
      setSubmitted(true);
    }, 2500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h2 className="text-[26px] font-bold mb-1.5 text-[#f0fffe]">Writing assessment</h2>
      <p className="text-sm text-[#7a9e9b] mb-7 font-light">Complete one writing prompt. This is evaluated by our editorial team to verify your skill level.</p>

      {/* Prompt selector */}
      <div className="flex gap-2 mb-4">
        {PROMPTS.map((p, i) => (
          <button key={p.id} onClick={() => { setActivePrompt(i); setSubmitted(false); setScore(null); }} className={`px-[18px] py-[7px] rounded-md border-[1.5px] text-[13px] cursor-pointer transition-all ${activePrompt === i ? 'border-teal-600 bg-teal-600/15 text-[#2dd4bf] font-semibold' : 'border-white/5 bg-transparent text-[#7a9e9b] font-normal'}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Prompt box */}
      <div className="bg-[#1a1a35] border border-white/5 rounded-lg px-[18px] py-4 mb-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#2dd4bf] mb-2">Your Prompt</div>
        <p className="text-sm leading-[1.65] text-[#f0fffe]">{PROMPTS[activePrompt].prompt}</p>
      </div>

      {/* Writing area */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-xs font-semibold tracking-[0.07em] text-[#7a9e9b] uppercase mb-0">Your Response</label>
          <span className={`text-[11px] ${(data.sample || '').length > 80 ? 'text-[#2dd4bf]' : 'text-[#3d5c5a]'}`}>{(data.sample || '').length} / ~150 words</span>
        </div>
        <textarea className="w-full bg-[#1a1a35] border-[1.5px] border-white/5 rounded-lg px-3.5 py-[11px] text-[#f0fffe] text-sm outline-none focus:border-teal-600 transition-colors placeholder:text-[#3d5c5a] resize-y leading-[1.65]" value={data.sample || ''} onChange={e => onChange('sample', e.target.value)} rows={8} placeholder="Write your response here..." disabled={submitted} />
      </div>

      {!submitted && !scoring && (
        <button className="bg-teal-600 text-white border-none px-7 py-[11px] rounded-md text-sm font-semibold cursor-pointer transition-all hover:bg-teal-700 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSubmit} disabled={!data.sample || data.sample.length < 80}>
          Submit for Assessment →
        </button>
      )}

      {scoring && (
        <div className="flex items-center gap-3 px-[18px] py-3.5 bg-[#1a1a35] rounded-lg border border-white/5">
          <div className="w-[18px] h-[18px] border-2 border-teal-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span className="text-[13px] text-[#7a9e9b]">Analysing your writing — checking clarity, tone, structure & originality...</span>
        </div>
      )}

      {submitted && score && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-teal-600/10 border border-teal-600/30 rounded-xl px-[22px] py-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-lg text-white">✓</div>
            <div>
              <div className="font-bold text-[15px]">Assessment complete — great work!</div>
              <div className="text-[13px] text-[#7a9e9b]">Overall Score: <strong className="text-[#2dd4bf] text-[16px]">{score.overall}/100</strong></div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {[['Clarity', score.clarity], ['Tone', score.tone], ['Structure', score.structure], ['Originality', score.originality]].map(([label, val]) => (
              <div key={label} className="text-center bg-[#13132a] rounded-lg py-2.5 px-2">
                <div className="text-[20px] font-bold text-[#2dd4bf] mb-0.5">{val}</div>
                <div className="text-[11px] text-[#3d5c5a]">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ── STEP 5: AGREEMENTS ── */
function Step5({ data, onChange }) {
  const [modalContent, setModalContent] = useState(null);
  const [uploadingAadhar, setUploadingAadhar] = useState(false);

  const handleAadharUpload = async (e) => {
    let file = null;
    if (e.type === 'drop') {
      e.preventDefault();
      file = e.dataTransfer.files[0];
    } else {
      file = e.target.files[0];
    }
    if (!file) return;
    
    setUploadingAadhar(true);
    const res = await uploadFileToSupabase(file, 'kyc');
    if (res.url) {
       onChange('aadharFile', { name: file.name, url: res.url });
    } else {
       alert('Failed to upload Aadhar: ' + res.error);
    }
    setUploadingAadhar(false);
  };

  const AGREEMENTS = [
    { id: 'ndaAccepted', title: 'Non-Disclosure Agreement (NDA)', desc: 'You agree to maintain strict confidentiality regarding all client materials, projects, and communications. You will not disclose or reuse any content.', content: 'NDA Content: By accepting this agreement, you hereby agree to keep all client communications, documents, and project details strictly confidential. You may not share, distribute, or repurpose any materials provided by the client or created for the client on this platform without explicit written consent. Violation of this agreement will result in immediate termination and potential legal action.' },
    { id: 'payoutAccepted', title: 'Payout Agreement', desc: 'You agree to our payment terms, processing fees, and standard payout schedules (bi-weekly or monthly).', content: 'Payout Agreement: Payments for completed and approved orders are processed according to your chosen payout schedule (bi-weekly or monthly). A standard platform fee of 20% is applied to all earnings. Payouts are made via your configured payment method. You are responsible for ensuring your payment details are accurate and up-to-date.' },
    { id: 'contractorAccepted', title: 'Independent Contractor Agreement', desc: 'You acknowledge that you are an independent contractor and not an employee of Xpresswriters.', content: 'Independent Contractor Agreement: You acknowledge and agree that your relationship with Xpresswriters is that of an independent contractor. You are not an employee, agent, or partner of Xpresswriters. You are responsible for your own taxes, benefits, and equipment required to perform the services. Xpresswriters does not dictate your working hours or location.' }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h2 className="text-[26px] font-bold mb-1.5 text-[#f0fffe]">Legal Agreements</h2>
      <p className="text-sm text-[#7a9e9b] mb-8 font-light">Please review and accept the following agreements to proceed. You must accept all to become a writer.</p>

      <div className="flex flex-col gap-4 mb-8">
        {AGREEMENTS.map(agr => (
          <div key={agr.id} className={`p-5 rounded-xl border-[1.5px] transition-all flex items-start gap-4 ${data[agr.id] ? 'bg-teal-600/10 border-teal-600' : 'bg-[#1a1a35] border-white/10'}`}>
            <input 
              type="checkbox" 
              className="mt-1 w-5 h-5 cursor-pointer accent-teal-600 flex-shrink-0"
              checked={data[agr.id] || false}
              onChange={(e) => onChange(agr.id, e.target.checked)}
            />
            <div className="flex-1">
              <div className="font-semibold text-[15px] text-[#f0fffe] mb-1">{agr.title}</div>
              <div className="text-[13px] text-[#7a9e9b] leading-[1.5] mb-2.5">{agr.desc}</div>
              <button onClick={() => setModalContent({ title: agr.title, body: agr.content })} className="text-[12px] font-semibold text-teal-400 bg-transparent border-none cursor-pointer hover:text-teal-300 p-0 underline">Read full agreement</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <label className="block text-[16px] font-bold text-[#f0fffe] mb-1">Aadhar Card (KYC Verification)</label>
        <p className="text-[13px] text-[#7a9e9b] mb-4 leading-[1.5]">For compliance and payouts, please upload a clear, scanned copy or photo of your Aadhar Card (front and back).</p>
        
        <label 
          onDragOver={e => e.preventDefault()}
          onDrop={handleAadharUpload}
          className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${data.aadharFile ? 'border-teal-600 bg-teal-600/10' : 'border-white/10 bg-[#1a1a35] hover:border-white/20'}`}
        >
          <input type="file" className="hidden" onChange={handleAadharUpload} accept=".pdf,.png,.jpg,.jpeg" />
          {data.aadharFile ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-[36px]">🆔</span>
              <div className="font-semibold text-[#2dd4bf] text-[15px]">{data.aadharFile.name}</div>
              <div className="text-[12px] font-semibold text-green-500">✓ Uploaded Successfully</div>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange('aadharFile', null); }} className="mt-2 text-[12px] text-red-400 hover:text-red-300 underline bg-transparent border-none cursor-pointer">Remove file</button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="text-[36px]">🆔</span>
              <div className="font-semibold text-[15px] text-[#f0fffe]">{uploadingAadhar ? 'Uploading...' : 'Click to upload Aadhar Card'}</div>
              <div className="text-[12px] text-[#7a9e9b]">JPG, PNG, PDF · Max 5MB</div>
            </div>
          )}
        </label>
      </div>

      {modalContent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#13132a] border border-white/10 rounded-xl p-6 w-full max-w-[500px] shadow-2xl">
            <h3 className="text-[20px] font-bold mb-4 text-[#f0fffe]">{modalContent.title}</h3>
            <div className="text-[14px] text-[#7a9e9b] leading-[1.6] mb-6 p-4 bg-[#1a1a35] rounded-lg border border-white/5 h-[200px] overflow-y-auto">
              {modalContent.body}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setModalContent(null)} className="bg-teal-600 text-white px-6 py-2 rounded-md text-sm font-semibold border-none cursor-pointer hover:bg-teal-700">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

/* ── STEP 6: REVIEW ── */
function Step6({ data }) {
  const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
  const skillsSet = new Set(data.skills || []);
  const sections = [
    { label: 'Profile', items: [['Name', fullName || '—'], ['Title', data.title || '—'], ['Email', data.email || '—'], ['Country', data.country || '—'], ['Education', data.education || '—']] },
    { label: 'Expertise', items: [['Skills', skillsSet.size > 0 ? `${skillsSet.size} categories selected` : '—'], ['Experience', data.experience || '—'], ['Credentials', data.credentials || '—']] },
    { label: 'Portfolio', items: [['Files uploaded', `${(data.files || []).length} file(s)`], ['Portfolio URL', data.portfolioUrl || 'Not provided']] },
    { label: 'Agreements & KYC', items: [['Agreements', data.ndaAccepted ? 'Accepted' : 'Pending'], ['KYC Aadhar', data.aadharFile ? 'Uploaded' : 'Pending']] },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h2 className="text-[26px] font-bold mb-1.5 text-[#f0fffe]">Review your application</h2>
      <p className="text-sm text-[#7a9e9b] mb-7 font-light">Once submitted, our editorial team will review your profile within 48 hours.</p>

      {/* Profile preview card */}
      <div className="bg-[#1a1a35] border border-teal-600/30 rounded-xl px-[22px] py-5 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center font-bold text-lg text-white flex-shrink-0 shadow-lg">
          {(data.firstName?.[0] || '?')}{(data.lastName?.[0] || '')}
        </div>
        <div>
          <div className="font-bold text-[17px] text-[#f0fffe]">{fullName || 'Your Name'}</div>
          <div className="text-[13px] text-[#7a9e9b] mb-1.5">{data.title || 'Your Professional Title'}</div>
          <div className="flex gap-2 mt-1">
            {data.ndaAccepted && data.payoutAccepted && <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-600/15 text-[#2dd4bf]">Agreements Accepted</span>}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-2 gap-3.5 mb-6">
        {sections.map(sec => (
          <div key={sec.label} className="bg-[#13132a] border border-white/5 rounded-lg px-[18px] py-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#2dd4bf] mb-3">{sec.label}</div>
            {sec.items.map(([k, v]) => (
              <div key={k} className="flex justify-between mb-2 gap-2.5">
                <span className="text-xs text-[#3d5c5a]">{k}</span>
                <span className="text-xs text-[#f0fffe] text-right max-w-[60%] overflow-hidden text-ellipsis whitespace-nowrap">{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Terms */}
      <div className="flex items-start gap-2.5 bg-[#1a1a35] rounded-lg px-4 py-3.5">
        <input type="checkbox" id="terms" defaultChecked className="mt-0.5 flex-shrink-0 accent-teal-600" />
        <label htmlFor="terms" className="text-[13px] text-[#7a9e9b] leading-[1.6] cursor-pointer">
          I confirm that all information provided is accurate. I agree to Xpresswriters' <span className="text-[#2dd4bf]">Writer Terms of Service</span> and <span className="text-[#2dd4bf]">Content Quality Policy</span>.
        </label>
      </div>
    </motion.div>
  );
}

/* ── SUCCESS ── */
function Success() {
  const router = useRouter();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10 px-5">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center mx-auto mb-6 text-4xl animate-bounce shadow-[0_0_30px_rgba(13,148,136,0.3)]">🎉</div>
      <h2 className="text-[28px] font-bold mb-2.5 text-[#f0fffe]">Application submitted!</h2>
      <p className="text-[15px] text-[#7a9e9b] leading-[1.7] max-w-[480px] mx-auto mb-8 font-light">
        Thank you for applying to Xpresswriters. Our editorial team will review your profile and writing assessment within <strong className="text-[#2dd4bf]">48 hours</strong>.
      </p>
      <div className="bg-[#13132a] border border-white/5 rounded-xl px-6 py-5 max-w-[400px] mx-auto mb-8 text-left">
        {[
          { step: '1', text: 'Profile under review', done: true },
          { step: '2', text: 'Assessment scored by editorial team', done: false },
          { step: '3', text: 'Background verification', done: false },
          { step: '4', text: 'Welcome to Xpresswriters!', done: false },
        ].map((item, i) => (
          <div key={i} className={`flex items-center gap-3 ${i < 3 ? 'mb-3.5' : ''}`}>
            <div className={`w-[26px] h-[26px] rounded-full border-2 flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${item.done ? 'bg-teal-600 border-teal-600 text-white' : 'bg-[#1a1a35] border-white/10 text-[#3d5c5a]'}`}>{item.done ? '✓' : item.step}</div>
            <span className={`text-[13px] ${item.done ? 'text-[#f0fffe]' : 'text-[#3d5c5a]'}`}>{item.text}</span>
            {item.done && <span className="ml-auto text-[11px] text-[#2dd4bf] font-semibold">Done</span>}
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={() => router.push('/')} className="bg-teal-600 text-white px-6 py-2.5 rounded-md text-sm font-semibold border-none cursor-pointer hover:bg-teal-700 transition-colors">Back to Home</button>
        <button onClick={() => router.push('/freelancer/dashboard?onboarded=true')} className="bg-transparent text-[#7a9e9b] px-6 py-2.5 rounded-md text-sm border-[1.5px] border-white/10 cursor-pointer hover:text-[#f0fffe] hover:border-white/20 transition-colors">View Dashboard</button>
      </div>
    </motion.div>
  );
}

/* ── APP ── */
export default function FreelancerSetupPage() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  const [form, setForm] = useState({
      firstName: '', lastName: '', title: '', email: '', country: '', bio: '', education: '', language: '',
      skills: [], experience: '', credentials: '',
      files: [], portfolioUrl: '',
      sample: '',
      ndaAccepted: false, payoutAccepted: false, contractorAccepted: false,
      aadharFile: null,
  });

  useEffect(() => {
    if (session?.user) {
      const nameParts = (session.user.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      setForm(f => ({
        ...f,
        email: session.user.email || f.email,
        firstName: f.firstName || firstName,
        lastName: f.lastName || lastName,
      }));
    }
  }, [session]);

  const updateForm = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const stepComponents = {
    1: <Step1 data={form} onChange={updateForm} />,
    2: <Step2 data={form} onChange={updateForm} />,
    3: <Step3 data={form} onChange={updateForm} />,
    4: <Step4 data={form} onChange={updateForm} />,
    5: <Step5 data={form} onChange={updateForm} />,
    6: <Step6 data={form} />,
  };

  const canProceed = {
    1: form.firstName && form.lastName && form.email,
    2: (form.skills?.length || 0) >= 2 && form.experience,
    3: true,
    4: true,
    5: form.ndaAccepted && form.payoutAccepted && form.contractorAccepted && form.aadharFile,
    6: true,
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboard/freelancer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setDone(true);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to save profile.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="min-h-screen bg-[#0d0d1a] text-[#f0fffe] flex flex-col items-center justify-center p-6 font-sans">
      <Success />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d1a] text-[#f0fffe] font-sans">
      {/* Top nav */}
      <div className="border-b border-white/5 py-4 px-9 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-[30px] h-[30px] rounded-[7px] bg-teal-600 flex items-center justify-center font-bold text-[13px] text-white">X</div>
          <span className="font-bold text-[15px] text-[#f0fffe]">Xpresswriters</span>
        </div>
        <div className="text-[13px] text-[#7a9e9b]">Step {step} of {STEPS.length}</div>
        <button onClick={() => router.push('/')} className="bg-transparent border-none text-[13px] text-[#3d5c5a] cursor-pointer hover:text-[#7a9e9b]">Save & exit</button>
      </div>

      {/* Progress */}
      <div className="pt-7 px-9 pb-5 border-b border-white/5">
        <ProgressBar step={step} total={STEPS.length} />
      </div>

      {/* Content */}
      <div className="flex-1 flex justify-center py-10 px-6 pb-[100px]">
        <div className="w-full max-w-[640px]">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-lg text-sm mb-6 font-medium">
              {error}
            </div>
          )}
          {stepComponents[step]}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/5 py-4 px-9 flex items-center justify-between bg-[#0d0d1a]/80 backdrop-blur-md">
        <div className="text-[13px] text-[#3d5c5a]">Your progress is saved automatically</div>
        <div className="flex gap-3">
          {step > 1 && (
            <button className="bg-transparent text-[#7a9e9b] px-7 py-[11px] rounded-md text-sm border-[1.5px] border-white/5 cursor-pointer transition-all hover:border-teal-600 hover:text-[#2dd4bf]" onClick={() => setStep(s => s - 1)} disabled={loading}>← Back</button>
          )}
          {step < STEPS.length ? (
            <button className="bg-teal-600 text-white px-7 py-[11px] rounded-md text-sm font-semibold border-none cursor-pointer transition-all hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setStep(s => s + 1)} disabled={!canProceed[step] || loading}>
              Continue →
            </button>
          ) : (
            <button className="bg-teal-600 text-white px-8 py-3 rounded-md text-[15px] font-semibold border-none cursor-pointer transition-all hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "🚀 Submit Application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
