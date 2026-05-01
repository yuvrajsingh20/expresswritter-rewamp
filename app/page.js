"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ArrowRight, ShieldCheck, 
  Zap, MessageSquare, Star, 
  Globe, FileText, Target,
  Users, DollarSign, Calendar,
  GraduationCap, Feather, Laptop,
  Library, BookOpen, PenTool, Briefcase,
  Eye, EyeOff
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

const SERVICES = [
  { id: 'SOP', name: 'Statement of Purpose', price: 2499, description: 'Academic & Professional SOPs' },
  { id: 'LOR', name: 'Letter of Recommendation', price: 1499, description: 'Mentor & Supervisor LORs' },
  { id: 'RESUME', name: 'Professional Resume', price: 1999, description: 'ATS-friendly & Multi-page' },
];

export default function LandingPage() {
  const router = useRouter();
  const [activeFlow, setActiveFlow] = useState(null); // 'STUDENT' or 'FREELANCER'
  const [studentStep, setStudentStep] = useState(1);
  const [writerStep, setWriterStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceId: '',
    name: '',
    email: '',
    password: '',
  });

  const [writerFormData, setWriterFormData] = useState({
    domainId: '',
    experience: '',
    bio: '',
    education: '',
    resumeUrl: '',
    photoUrl: '',
    linkedinUrl: '',
    name: '',
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [showWriterPassword, setShowWriterPassword] = useState(false);

  const selectedService = SERVICES.find(s => s.id === formData.serviceId);

  const handleStudentNext = async () => {
    setIsSubmitting(true);
    setAuthError("");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "STUDENT",
          studentProfile: {
            targetService: formData.serviceId
          }
        }),
      });

      if (res.ok) {
        router.push('/login?registered=true&role=STUDENT');
      } else {
        const data = await res.json();
        setAuthError(data.message || "Signup failed");
      }
    } catch (err) {
      setAuthError("Connection error. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWriterSubmit = async () => {
    setIsSubmitting(true);
    setAuthError("");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: writerFormData.name,
          email: writerFormData.email,
          password: writerFormData.password,
          role: "FREELANCER",
          writerProfile: writerFormData
        }),
      });

      if (res.ok) {
        router.push('/login?registered=true&role=FREELANCER');
      } else {
        const data = await res.json();
        setAuthError(data.message || "Signup failed");
      }
    } catch (err) {
      setAuthError("Connection error. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen text-[#0a192f] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="h-24 flex items-center justify-between px-10 md:px-20 sticky top-0 bg-white/90 backdrop-blur-md z-[100] border-b border-slate-50">
        <Link href="/" className="flex items-center gap-3">
           <div className="w-10 h-10 bg-black flex items-center justify-center text-white font-bold text-xl">E</div>
           <span className="text-2xl font-[900] tracking-tighter italic uppercase text-black">Express Writer</span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-12">
          {['Services', 'How it Works', 'Pricing', 'About'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-[11px] font-black uppercase tracking-wider text-slate-400 hover:text-black transition-colors">{item}</a>
          ))}
        </div>

        <div className="flex items-center gap-8">
           <Link href="/login" className="bg-black text-white px-8 py-3.5 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all rounded-none">
              Authorized Login
           </Link>
        </div>
      </nav>

      <main>
        {/* 50/50 Dual Hero Section - Mockup Perfect */}
        <section className="relative min-h-[85vh] flex flex-col lg:flex-row items-stretch">
          
          {/* Student Side (Dark) */}
          <div className={`flex-1 relative transition-all duration-1000 p-12 md:p-24 flex flex-col items-center justify-center text-center bg-[#0a192f] text-white ${activeFlow === 'FREELANCER' ? 'lg:w-[30%] opacity-20' : 'lg:w-[50%]'}`}>
             <div className="max-w-md space-y-10 z-10">
               <div className="flex justify-center gap-6 opacity-30">
                  <Library size={48} strokeWidth={1.5} />
                  <GraduationCap size={48} strokeWidth={1.5} />
                  <BookOpen size={48} strokeWidth={1.5} />
               </div>
               
               <h1 className="text-5xl md:text-7xl font-[900] tracking-tighter leading-[0.9] uppercase italic">
                 Get Into <br /> Your Dream <br /> University
               </h1>
               
               <p className="text-white/50 font-medium text-lg max-w-sm mx-auto leading-relaxed">
                 Work with expert writers to craft compelling admissions essays, applications, and statements that stand out.
               </p>
               
               <button 
                 onClick={() => setActiveFlow('STUDENT')}
                 className="bg-[#b89150] text-white px-14 py-6 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#a67d40] transition-all flex items-center justify-center gap-4 shadow-3xl shadow-black/30 active:scale-95"
               >
                 Start My Project <ArrowRight size={18} strokeWidth={3} />
               </button>
             </div>
             
             {/* Decorative Elements */}
             <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none overflow-hidden">
                <div className="absolute -top-10 -left-10 w-96 h-96 border border-white rounded-full" />
                <div className="absolute -bottom-20 -right-20 w-80 h-80 border border-white rounded-full opacity-50" />
             </div>
          </div>

          {/* Writer Side (Light) */}
          <div className={`flex-1 relative transition-all duration-1000 p-12 md:p-24 flex flex-col items-center justify-center text-center bg-[#f0f7ff] ${activeFlow === 'STUDENT' ? 'lg:w-[30%] opacity-20' : 'lg:w-[50%]'}`}>
             <div className="max-w-md space-y-10 z-10">
                <div className="flex justify-center gap-8 opacity-20 text-[#0a192f]">
                   <Feather size={48} strokeWidth={1.5} />
                   <Laptop size={48} strokeWidth={1.5} />
                   <div className="flex flex-col items-center">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4,5].map(i => <Star key={i} size={10} fill="currentColor" />)}
                      </div>
                      <div className="w-10 h-6 bg-current rounded-sm opacity-50" />
                   </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-[900] tracking-tighter leading-[0.9] uppercase italic text-[#0a192f]">
                  Build Your <br /> Writing <br /> Career
                </h1>
                
                <p className="text-[#0a192f]/50 font-medium text-lg max-w-sm mx-auto leading-relaxed">
                  Join a prestigious community of professional writers, access premium projects, and grow your freelance business.
                </p>
                
                <button 
                  onClick={() => setActiveFlow('FREELANCER')}
                  className="bg-[#0a192f] text-white px-14 py-6 rounded-full font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-4 shadow-3xl shadow-blue-900/10 active:scale-95"
                >
                  Apply to Write <ArrowRight size={18} strokeWidth={3} />
                </button>
             </div>

             {/* Sketch Background - Using a subtle grid/pattern */}
             <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0a192f 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>

          {/* Student Flow Overlay - Modern Cinematic */}
          <AnimatePresence>
            {activeFlow === 'STUDENT' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => { setActiveFlow(null); setStudentStep(1); }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-4xl bg-white shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border border-white/10"
                >
                  {/* Minimal Header */}
                  <div className="h-20 border-b border-slate-100 flex items-center justify-between px-10 md:px-16 shrink-0 bg-white">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-bold text-sm">E</div>
                        <span className="text-lg font-[900] tracking-tighter italic uppercase text-black">Student Registration</span>
                     </div>
                     <button onClick={() => { setActiveFlow(null); setStudentStep(1); }} className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-black flex items-center gap-2 transition-colors">
                        Close <ChevronRight size={14} />
                     </button>
                  </div>
                  
                  <div className="p-10 md:p-16">
                     <div className="bg-white">
                        <div className="h-1 bg-black w-full mb-12" />
                        
                        <div className="space-y-12">
                           <div className="space-y-4 border-b border-slate-100 pb-10 text-center">
                              <h1 className="text-4xl font-[900] tracking-tight italic uppercase text-black leading-none">Create Your Account.</h1>
                              <p className="text-slate-500 font-medium tracking-tight text-sm uppercase">Join our academic platform to start your first project.</p>
                           </div>

                           <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
                              {/* Google Auth Integration */}
                              <button 
                                onClick={() => signIn('google', { callbackUrl: '/student' })}
                                className="w-full flex items-center justify-center gap-4 bg-white border border-slate-200 py-5 font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition-all rounded-none"
                              >
                                 <svg viewBox="0 0 24 24" className="w-5 h-5">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                 </svg>
                                 Continue with Google
                              </button>

                              <div className="relative flex items-center justify-center py-4">
                                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                                 <span className="relative bg-white px-4 text-[9px] font-black uppercase tracking-widest text-slate-300">Or Manual Registration</span>
                              </div>

                              <div className="space-y-4">
                                 <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Full Legal Name</label>
                                 <input 
                                   type="text" 
                                   value={formData.name}
                                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                   className="w-full bg-slate-50 border border-slate-200 px-8 py-5 font-bold text-sm outline-none focus:bg-white focus:border-black transition-all rounded-none"
                                   placeholder="E.G. ALEXANDER PIERCE"
                                 />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                                    <input 
                                      type="email" 
                                      value={formData.email}
                                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                      className="w-full bg-slate-50 border border-slate-200 px-8 py-5 font-bold text-sm outline-none focus:bg-white focus:border-black transition-all rounded-none"
                                      placeholder="EMAIL@INSTITUTION.COM"
                                    />
                                 </div>
                                 <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Secure Password</label>
                                    <input 
                                      type="password" 
                                      value={formData.password}
                                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                      className="w-full bg-slate-50 border border-slate-200 px-8 py-5 font-bold text-sm outline-none focus:bg-white focus:border-black transition-all rounded-none"
                                      placeholder="••••••••"
                                    />
                                 </div>
                              </div>
                           </div>

                           {authError && (
                              <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest text-center border border-red-100">
                                 {authError}
                              </div>
                           )}

                           <div className="pt-10 flex flex-col items-center gap-8 border-t border-slate-100">
                               <button 
                                 onClick={handleStudentNext}
                                 disabled={isSubmitting || !formData.email || !formData.name || !formData.password}
                                 className="w-full md:w-auto bg-black text-white px-24 py-6 font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl disabled:opacity-20 active:scale-95 rounded-none flex items-center justify-center gap-4"
                               >
                                 {isSubmitting ? 'CREATING ACCOUNT...' : 'REGISTER & CONTINUE'} <ChevronRight size={16} />
                               </button>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                                 Institutional Grade Encryption / Secure Data Protocols
                               </p>
                           </div>
                        </div>
                     </div>
                  </div>
                </motion.div>
              </div>
            )}
            {activeFlow === 'FREELANCER' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActiveFlow(null)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-5xl max-h-[90vh] bg-white shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-y-auto flex flex-col border border-white/10"
                >
                  {/* Minimal Header */}
                  <div className="h-20 border-b border-slate-100 flex items-center justify-between px-10 md:px-16 shrink-0 sticky top-0 bg-white z-10">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-bold text-sm">E</div>
                        <span className="text-lg font-[900] tracking-tighter italic uppercase text-black">Writer Application</span>
                     </div>
                     <button onClick={() => setActiveFlow(null)} className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-black flex items-center gap-2 transition-colors">
                        Close <ChevronRight size={14} />
                     </button>
                  </div>

                  <div className="flex-1 p-8 md:p-16">
                     <div className="bg-white">
                        {/* Form Banner */}
                        <div className="h-1 bg-black w-full mb-12" />
                        
                        <div className="space-y-12">
                           <div className="space-y-4 border-b border-slate-100 pb-10">
                              <h1 className="text-4xl font-[900] tracking-tight italic uppercase text-black leading-none">Professional Onboarding.</h1>
                              <p className="text-slate-500 font-medium tracking-tight text-sm uppercase">Complete your dossier to join our specialized writing panel.</p>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                              {/* Group 1: Identity */}
                              <div className="space-y-8">
                                 <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-l-4 border-blue-600 pl-4">Account Information</h4>
                                 
                                 <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Full Legal Name</label>
                                    <input 
                                       type="text"
                                       value={writerFormData.name}
                                       onChange={(e) => setWriterFormData({...writerFormData, name: e.target.value})}
                                       className="w-full bg-slate-50 border border-slate-200 px-6 py-4 font-bold text-sm outline-none focus:bg-white focus:border-black transition-all rounded-none"
                                       placeholder="E.G. ALEXANDER PIERCE"
                                    />
                                 </div>

                                 <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Professional Email</label>
                                    <input 
                                       type="email"
                                       value={writerFormData.email}
                                       onChange={(e) => setWriterFormData({...writerFormData, email: e.target.value})}
                                       className="w-full bg-slate-50 border border-slate-200 px-6 py-4 font-bold text-sm outline-none focus:bg-white focus:border-black transition-all rounded-none"
                                       placeholder="EMAIL@INSTITUTION.COM"
                                    />
                                 </div>

                                 <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Secure Password</label>
                                    <input 
                                       type="password"
                                       value={writerFormData.password}
                                       onChange={(e) => setWriterFormData({...writerFormData, password: e.target.value})}
                                       className="w-full bg-slate-50 border border-slate-200 px-6 py-4 font-bold text-sm outline-none focus:bg-white focus:border-black transition-all rounded-none"
                                       placeholder="MINIMUM 8 CHARACTERS"
                                    />
                                 </div>
                              </div>

                              {/* Group 2: Professional Details */}
                              <div className="space-y-8">
                                 <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-l-4 border-blue-600 pl-4">Expertise Profile</h4>
                                 
                                 <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Primary Domain</label>
                                    <select 
                                       value={writerFormData.domainId}
                                       onChange={(e) => setWriterFormData({...writerFormData, domainId: e.target.value})}
                                       className="w-full bg-slate-50 border border-slate-200 px-6 py-4 font-bold text-sm outline-none focus:bg-white focus:border-black transition-all rounded-none appearance-none"
                                    >
                                       <option value="">SELECT SPECIALIZATION...</option>
                                       <option value="ACADEMIC">ACADEMIC RESEARCH</option>
                                       <option value="TECHNICAL">TECHNICAL DOCUMENTATION</option>
                                       <option value="CREATIVE">CREATIVE & ADMISSIONS</option>
                                    </select>
                                 </div>

                                 <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Highest Qualification</label>
                                    <input 
                                       type="text"
                                       value={writerFormData.education}
                                       onChange={(e) => setWriterFormData({...writerFormData, education: e.target.value})}
                                       className="w-full bg-slate-50 border border-slate-200 px-6 py-4 font-bold text-sm outline-none focus:bg-white focus:border-black transition-all rounded-none"
                                       placeholder="E.G. PHD IN ASTROPHYSICS"
                                    />
                                 </div>

                                 <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Years of Experience</label>
                                    <select 
                                       value={writerFormData.experience}
                                       onChange={(e) => setWriterFormData({...writerFormData, experience: e.target.value})}
                                       className="w-full bg-slate-50 border border-slate-200 px-6 py-4 font-bold text-sm outline-none focus:bg-white focus:border-black transition-all rounded-none appearance-none"
                                    >
                                       <option value="">SELECT EXPERIENCE...</option>
                                       <option value="1">1-3 YEARS</option>
                                       <option value="4">4-7 YEARS</option>
                                       <option value="8">8+ YEARS</option>
                                    </select>
                                 </div>
                              </div>
                           </div>

                           {/* Verification Links */}
                           <div className="space-y-8 pt-6 border-t border-slate-100">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-l-4 border-blue-600 pl-4">Verification Artifacts</h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                 <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Resume / CV Link</label>
                                    <input 
                                       type="text"
                                       value={writerFormData.resumeUrl}
                                       onChange={(e) => setWriterFormData({...writerFormData, resumeUrl: e.target.value})}
                                       className="w-full bg-slate-50 border border-slate-200 px-6 py-4 font-bold text-sm outline-none focus:bg-white focus:border-black transition-all rounded-none"
                                       placeholder="DRIVE OR PORTFOLIO LINK"
                                    />
                                 </div>
                                 <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">LinkedIn Profile</label>
                                    <input 
                                       type="text"
                                       value={writerFormData.linkedinUrl}
                                       onChange={(e) => setWriterFormData({...writerFormData, linkedinUrl: e.target.value})}
                                       className="w-full bg-slate-50 border border-slate-200 px-6 py-4 font-bold text-sm outline-none focus:bg-white focus:border-black transition-all rounded-none"
                                       placeholder="LINKEDIN.COM/IN/USER"
                                    />
                                 </div>
                                 <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Professional Photo</label>
                                    <input 
                                       type="text"
                                       value={writerFormData.photoUrl}
                                       onChange={(e) => setWriterFormData({...writerFormData, photoUrl: e.target.value})}
                                       className="w-full bg-slate-50 border border-slate-200 px-6 py-4 font-bold text-sm outline-none focus:bg-white focus:border-black transition-all rounded-none"
                                       placeholder="IMAGE URL"
                                    />
                                 </div>
                              </div>
                           </div>

                           {authError && (
                              <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest text-center border border-red-100">
                                 {authError}
                              </div>
                           )}

                           <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-8">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-xs">
                                 By submitting this dossier, you agree to our institutional quality standards and non-disclosure protocols.
                               </p>
                               <button 
                                 onClick={handleWriterSubmit}
                                 disabled={isSubmitting || !writerFormData.email || !writerFormData.name || !writerFormData.domainId}
                                 className="bg-black text-white px-16 py-6 font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl disabled:opacity-20 active:scale-95 rounded-none shrink-0"
                               >
                                 {isSubmitting ? 'PROCESSING DOSSIER...' : 'SUBMIT APPLICATION'}
                               </button>
                           </div>
                        </div>
                     </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* Trusted By Bar - Mockup Style */}
        <section className="py-24 px-10 border-b border-slate-50">
           <div className="max-w-7xl mx-auto flex flex-col items-center gap-16">
              <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-300">Trusted by Thousands</h4>
              <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-20 grayscale">
                 {[
                   { name: 'UNIVERSITY OF MLOBORE', icon: <Library size={24} /> },
                   { name: 'VEEAN UNIVERSITY', icon: <GraduationCap size={24} /> },
                   { name: 'UNIVERSITY OF BROWN', icon: <Library size={24} /> },
                   { name: 'UNIVERSITY OF LAICHORD', icon: <GraduationCap size={24} /> },
                   { name: 'UNINSORN', icon: <GraduationCap size={24} /> }
                 ].map((uni, i) => (
                   <div key={i} className="flex items-center gap-4 group cursor-default">
                      {uni.icon}
                      <span className="text-xl font-black tracking-tighter">{uni.name}</span>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-40 px-10 md:px-24 bg-[#fbfbfb]">
           <div className="max-w-7xl mx-auto space-y-24">
              <div className="text-center space-y-6">
                 <p className="text-blue-600 font-black uppercase tracking-[0.15em] text-[10px]">What we do</p>
                 <h2 className="text-5xl md:text-6xl font-[900] tracking-tighter italic uppercase text-[#0a192f]">Specialized Domains.</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {[
                   { t: 'Admissions', d: 'SOPs, LORs, and Personal Statements for global universities.', i: GraduationCap, bg: 'bg-orange-50', c: 'text-orange-600' },
                   { t: 'Academic', d: 'Technical research papers, assignments, and thesis support.', i: Library, bg: 'bg-blue-50', c: 'text-blue-600' },
                   { t: 'Career', d: 'Professional resumes, CVs, and LinkedIn profile optimization.', i: Briefcase, bg: 'bg-emerald-50', c: 'text-emerald-600' },
                   { t: 'Technical', d: 'Documentation, whitepapers, and complex technical writing.', i: Laptop, bg: 'bg-indigo-50', c: 'text-indigo-600' }
                 ].map((service, i) => (
                   <div key={i} className="bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-xl transition-all border border-slate-100 group">
                      <div className={`w-14 h-14 ${service.bg} ${service.c} rounded-2xl mb-8 flex items-center justify-center group-hover:rotate-6 transition-transform`}>
                         <service.i size={24} />
                      </div>
                      <h4 className="font-[900] text-lg uppercase tracking-tight mb-4">{service.t}</h4>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed uppercase tracking-tighter italic">{service.d}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-40 px-10 md:px-24 bg-white">
           <div className="max-w-7xl mx-auto space-y-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                 <div className="space-y-8">
                    <p className="text-blue-600 font-black uppercase tracking-[0.15em] text-[10px]">The Protocol</p>
                    <h2 className="text-6xl font-[900] tracking-tighter italic uppercase text-[#0a192f] leading-[0.9]">High-Performance <br /> Workflow.</h2>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm italic">We sync elite writing talent with your milestones to ensure institutional-grade results.</p>
                 </div>
                 
                 <div className="space-y-12">
                    {[
                      { t: 'Strategic Briefing', d: 'Submit your requirements and academic context through our secure portal.' },
                      { t: 'Expert Matching', d: 'Our algorithm pairs you with a verified subject matter specialist in your niche.' },
                      { t: 'Real-time Drafting', d: 'Collaborate directly with your writer through integrated chat and feedback loops.' },
                      { t: 'Quality Protocol', d: 'Final verified draft delivered with full plagiarism clearance and quality audit.' }
                    ].map((step, i) => (
                      <div key={i} className="flex gap-10 group translate-x-0 hover:translate-x-4 transition-transform">
                         <div className="text-4xl font-[900] text-slate-100 italic">0{i+1}</div>
                         <div className="space-y-2">
                            <h4 className="font-black text-sm uppercase tracking-widest text-[#0a192f]">{step.t}</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-tight leading-relaxed max-w-md">{step.d}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-40 px-10 md:px-24 bg-[#0a192f] text-white overflow-hidden relative">
           <div className="max-w-7xl mx-auto space-y-24 relative z-10">
              <div className="text-center space-y-6">
                 <p className="text-blue-400 font-black uppercase tracking-[0.15em] text-[10px]">Investment</p>
                 <h2 className="text-5xl md:text-6xl font-[900] tracking-tighter italic uppercase">Transparent Pricing.</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { t: 'Standard', p: '2,499', d: 'Foundational content for standard applications.', features: ['Expert Writer', '1 Revision', 'Plagiarism Report'] },
                   { t: 'Premium', p: '4,999', d: 'High-stake documents for Ivy League tiers.', features: ['Subject specialist', 'Unlimited Revisions', 'Direct Chat', 'Priority Support'], featured: true },
                   { t: 'Institutional', p: '9,999', d: 'Bulk support and long-term academic partnerships.', features: ['Managerial support', 'Custom Workflows', 'Bulk Pricing', 'API Access'] }
                 ].map((plan, i) => (
                   <div key={i} className={`p-16 rounded-[4rem] flex flex-col items-center text-center space-y-10 transition-all ${plan.featured ? 'bg-blue-600 shadow-[0_50px_100px_rgba(37,99,235,0.3)] scale-105' : 'bg-white/5 border border-white/10'}`}>
                      <div>
                         <h4 className="font-black text-xs uppercase tracking-widest text-blue-300 mb-4">{plan.t}</h4>
                         <p className="text-6xl font-[900] italic tracking-tighter">₹{plan.p}</p>
                      </div>
                      <p className="text-white/40 text-xs font-bold italic uppercase leading-none">{plan.d}</p>
                      <div className="w-full h-[1px] bg-white/10" />
                      <ul className="space-y-4">
                         {plan.features.map(f => (
                           <li key={f} className="text-[10px] font-black uppercase tracking-widest text-white/60 flex items-center justify-center gap-3">
                              <ShieldCheck size={14} className="text-blue-400" /> {f}
                           </li>
                         ))}
                      </ul>
                      <button className={`w-full py-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${plan.featured ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-white/10 hover:bg-white/20'}`}>Select Protocol</button>
                   </div>
                 ))}
              </div>
           </div>
           
           {/* Decorative Elements */}
           <div className="absolute top-20 right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[150px]" />
           <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[150px]" />
        </section>

        {/* About Section */}
        <section id="about" className="py-40 px-10 md:px-24 bg-white">
           <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="relative">
                 <div className="aspect-square bg-slate-50 rounded-[4rem] overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-[#0a192f] opacity-5 font-[900] text-[20rem] tracking-tighter leading-none italic select-none">
                       EW
                    </div>
                    <div className="absolute inset-20 border-2 border-slate-100 rounded-[3rem] border-dashed" />
                 </div>
                 <div className="absolute -bottom-10 -right-10 bg-[#0a192f] p-12 rounded-[3.5rem] text-white shadow-2xl">
                    <p className="text-4xl font-[900] tracking-tighter italic">100%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Quality Guarantee</p>
                 </div>
              </div>

              <div className="space-y-12">
                 <div className="space-y-6">
                    <p className="text-blue-600 font-black uppercase tracking-[0.15em] text-[10px]">The Ethos</p>
                    <h2 className="text-6xl font-[900] tracking-tighter italic uppercase text-[#0a192f] leading-[0.9]">Bridging the <br /> Expertise Gap.</h2>
                 </div>
                 <p className="text-slate-400 text-lg font-medium leading-relaxed italic">Express Writer was built to eliminate the friction between elite academic talent and students pursuing global education goals. We are more than a marketplace; we are a specialized writing panel committed to institutional excellence.</p>
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-2">
                       <p className="text-3xl font-[900] text-[#0a192f]">12k+</p>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Drafts Delivered</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-3xl font-[900] text-[#0a192f]">500+</p>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Specialists</p>
                    </div>
                 </div>
                 <button className="bg-[#0a192f] text-white px-12 py-6 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-blue-900/10">Read Our Manifesto</button>
              </div>
           </div>
        </section>
      </main>

      {/* Modern High-End Footer */}
      <footer className="py-24 px-10 md:px-24 bg-[#0a192f] text-white overflow-hidden relative">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16 relative z-10">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white text-[#0a192f] rounded-xl flex items-center justify-center font-bold text-lg">E</div>
                <span className="text-2xl font-[900] tracking-tighter italic">Express Writer</span>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Institutional-Grade Academic Services</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-12">
               {['Expertise', 'Stream', 'Writers', 'Legal'].map(item => (
                 <div key={item} className="flex flex-col gap-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/20 mb-2">{item}</span>
                    <a href="#" className="text-xs font-bold uppercase tracking-widest hover:text-blue-400 transition-colors">Protocol</a>
                 </div>
               ))}
            </div>
         </div>
         
         <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 relative z-10">
            <p className="text-[9px] font-black uppercase tracking-wider">© 2026 Admino Education Hub. All Rights Reserved.</p>
            <div className="flex gap-8">
               {['Terms', 'Privacy', 'Security'].map(item => (
                 <a key={item} href="#" className="text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">{item}</a>
               ))}
            </div>
         </div>
         
         {/* Decorative Blur */}
         <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
      </footer>
    </div>
  );
}
