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
  Library, BookOpen, PenTool, Briefcase
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const SERVICES = [
  { id: 'SOP', name: 'Statement of Purpose', price: 2499, description: 'Academic & Professional SOPs' },
  { id: 'LOR', name: 'Letter of Recommendation', price: 1499, description: 'Mentor & Supervisor LORs' },
  { id: 'RESUME', name: 'Professional Resume', price: 1999, description: 'ATS-friendly & Multi-page' },
];

export default function LandingPage() {
  const router = useRouter();
  const [activeFlow, setActiveFlow] = useState(null); // 'STUDENT' or 'FREELANCER'
  const [studentStep, setStudentStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceId: '',
    deadline: '',
    description: '',
  });

  const selectedService = SERVICES.find(s => s.id === formData.serviceId);

  const handleStudentNext = () => {
    if (studentStep === 2) {
      sessionStorage.setItem('pendingProject', JSON.stringify({
        ...formData,
        serviceName: selectedService.name,
        price: selectedService.price
      }));
      router.push('/register?role=STUDENT&redirect=/student/new-order');
    } else {
      setStudentStep(2);
    }
  };

  return (
    <div className="bg-white min-h-screen text-[#0a192f] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="h-24 flex items-center justify-between px-10 md:px-20 sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-slate-50">
        <Link href="/" className="flex items-center gap-3">
           <div className="w-10 h-10 bg-[#0a192f] rounded-xl flex items-center justify-center text-white font-bold text-xl">E</div>
           <span className="text-2xl font-[900] tracking-tighter italic">Express Writer</span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-12">
          {['Services', 'How it Works', 'Pricing', 'About'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-black transition-colors">{item}</a>
          ))}
        </div>

        <div className="flex items-center gap-8">
           <Link href="/login" className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-black transition-colors">Login</Link>
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
                 className="bg-[#b89150] text-white px-14 py-6 rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-[#a67d40] transition-all flex items-center justify-center gap-4 shadow-3xl shadow-black/30 active:scale-95"
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
                  className="bg-[#0a192f] text-white px-14 py-6 rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-black transition-all flex items-center justify-center gap-4 shadow-3xl shadow-blue-900/10 active:scale-95"
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
              <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="absolute inset-4 md:inset-10 bg-white shadow-[0_100px_150px_rgba(0,0,0,0.2)] rounded-[4rem] z-20 flex flex-col border border-slate-100 overflow-hidden"
              >
                <div className="h-24 border-b border-slate-50 flex items-center justify-between px-12 bg-slate-50/30">
                   <div className="flex items-center gap-6">
                      <span className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-600">Phase 0{studentStep}</span>
                      <div className="w-40 h-[2px] bg-slate-100">
                        <div className={`h-full bg-blue-600 transition-all duration-500`} style={{ width: `${(studentStep/2)*100}%` }} />
                      </div>
                   </div>
                   <button onClick={() => { setActiveFlow(null); setStudentStep(1); }} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-black">Abort Flow.CLOSE</button>
                </div>
                
                <div className="flex-1 p-10 md:p-20 overflow-y-auto">
                  <div className="max-w-3xl mx-auto w-full space-y-20">
                    {studentStep === 1 ? (
                      <div className="space-y-16">
                        <div className="text-center space-y-4">
                           <h2 className="text-5xl font-[900] tracking-tighter uppercase italic leading-none">Choose Service.</h2>
                           <p className="text-slate-400 font-medium uppercase tracking-widest text-[10px]">Select the artifact required for your application stream</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                           {SERVICES.map(s => (
                             <div 
                               key={s.id}
                               onClick={() => setFormData({ ...formData, serviceId: s.id })}
                               className={`p-12 rounded-[3.5rem] border-4 cursor-pointer transition-all duration-500 flex flex-col items-center text-center gap-8 ${
                                 formData.serviceId === s.id ? 'border-blue-600 bg-white shadow-3xl shadow-blue-600/10' : 'border-slate-50 hover:bg-slate-50'
                               }`}
                             >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${formData.serviceId === s.id ? 'bg-blue-600 text-white rotate-6' : 'bg-slate-100 text-slate-300'}`}>
                                  {s.id === 'SOP' && <FileText size={24} />}
                                  {s.id === 'LOR' && <Target size={24} />}
                                  {s.id === 'RESUME' && <Users size={24} />}
                                </div>
                                <div>
                                  <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-2">{s.name}</h4>
                                  <p className="text-[10px] text-slate-400 font-bold italic opacity-0 transition-opacity group-hover:opacity-100">Config: Active</p>
                                </div>
                             </div>
                           ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-16">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 pb-12 border-b-2 border-slate-100">
                           <div className="space-y-4">
                              <h2 className="text-6xl font-[900] tracking-tighter italic uppercase leading-none text-[#0a192f]">Project Brief.</h2>
                              <p className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                                {selectedService.name} <Star size={10} fill="currentColor" /> Premium Stream
                              </p>
                           </div>
                           <div className="text-left md:text-right">
                              <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-300 mb-2">Protocol Value</p>
                              <p className="text-7xl font-[900] italic tracking-tighter text-blue-600 leading-none">₹{selectedService.price}</p>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                           <div className="space-y-6">
                              <label className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-400 ml-2">Temporal Deadline</label>
                              <input 
                                type="date" 
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                className="w-full bg-slate-50 border-2 border-transparent px-10 py-6 rounded-[2rem] font-black text-sm outline-none focus:bg-white focus:border-blue-600 transition-all shadow-sm"
                              />
                           </div>
                           <div className="space-y-6">
                              <label className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-400 ml-2">Contextual Briefing</label>
                              <textarea 
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="DETAILS ABOUT YOUR ACADEMIC GOALS..."
                                className="w-full bg-slate-50 border-2 border-transparent p-10 rounded-[2.5rem] font-black text-sm outline-none focus:bg-white focus:border-blue-600 transition-all shadow-sm resize-none leading-relaxed"
                              />
                           </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center pb-20">
                      <button 
                        onClick={handleStudentNext}
                        disabled={studentStep === 1 ? !formData.serviceId : !formData.deadline}
                        className="bg-[#0a192f] text-white px-24 py-8 rounded-full font-black text-xs uppercase tracking-[0.6em] hover:bg-black transition-all flex items-center gap-6 shadow-[0_30px_60px_rgba(0,0,0,0.3)] disabled:opacity-20 active:scale-95"
                      >
                        {studentStep === 1 ? 'NEXT SEQUENCE' : 'AUTHORIZE ACCOUNT'} <ChevronRight size={18} strokeWidth={4} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeFlow === 'FREELANCER' && (
              <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="absolute inset-4 md:inset-10 bg-[#0a192f] text-white shadow-[0_100px_150px_rgba(0,0,0,0.5)] rounded-[4rem] z-20 flex flex-col overflow-hidden"
              >
                <div className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-white/5">
                   <div className="flex items-center gap-6">
                      <span className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-400">Writer Onboarding</span>
                   </div>
                   <button onClick={() => setActiveFlow(null)} className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white">Exit Portal.X</button>
                </div>
                
                <div className="flex-1 p-10 md:p-20 overflow-y-auto flex flex-col items-center justify-center text-center">
                  <div className="max-w-3xl w-full space-y-16">
                    <div className="space-y-4">
                       <h2 className="text-6xl font-[900] tracking-tighter italic uppercase leading-none">Join the Elite.</h2>
                       <p className="text-white/40 font-medium uppercase tracking-[0.4em] text-[10px]">Select your primary writing domain to initiate verification</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       {[
                         { id: 'ACADEMIC', name: 'Academic Study', icon: <Library size={24} /> },
                         { id: 'TECHNICAL', name: 'Technical Docs', icon: <Laptop size={24} /> },
                         { id: 'CREATIVE', name: 'Creative Content', icon: <PenTool size={24} /> }
                       ].map(domain => (
                         <div 
                           key={domain.id}
                           className="p-12 rounded-[3.5rem] bg-white/5 border-2 border-transparent hover:border-blue-500 hover:bg-white/10 transition-all cursor-pointer group flex flex-col items-center gap-6"
                         >
                            <div className="w-16 h-16 rounded-2xl bg-white text-[#0a192f] flex items-center justify-center group-hover:rotate-12 transition-all">
                              {domain.icon}
                            </div>
                            <h4 className="font-black text-[10px] uppercase tracking-[0.2em]">{domain.name}</h4>
                         </div>
                       ))}
                    </div>

                    <div className="flex justify-center pt-10">
                      <Link 
                        href="/register?role=FREELANCER"
                        className="bg-white text-[#0a192f] px-24 py-8 rounded-full font-black text-xs uppercase tracking-[0.6em] hover:bg-blue-50 transition-all flex items-center gap-6 shadow-3xl shadow-white/5 active:scale-95"
                      >
                        CREATE WRITER PROFILE <ChevronRight size={18} strokeWidth={4} />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Trusted By Bar - Mockup Style */}
        <section className="py-24 px-10 border-b border-slate-50">
           <div className="max-w-7xl mx-auto flex flex-col items-center gap-16">
              <h4 className="text-[11px] font-black uppercase tracking-[0.8em] text-slate-300">Trusted by Thousands</h4>
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
                 <p className="text-blue-600 font-black uppercase tracking-[0.8em] text-[10px]">What we do</p>
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
                    <p className="text-blue-600 font-black uppercase tracking-[0.6em] text-[10px]">The Protocol</p>
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
                 <p className="text-blue-400 font-black uppercase tracking-[0.8em] text-[10px]">Investment</p>
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
                         <h4 className="font-black text-xs uppercase tracking-[0.4em] text-blue-300 mb-4">{plan.t}</h4>
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
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Quality Guarantee</p>
                 </div>
              </div>

              <div className="space-y-12">
                 <div className="space-y-6">
                    <p className="text-blue-600 font-black uppercase tracking-[0.6em] text-[10px]">The Ethos</p>
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
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">Institutional-Grade Academic Services</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-12">
               {['Expertise', 'Stream', 'Writers', 'Legal'].map(item => (
                 <div key={item} className="flex flex-col gap-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 mb-2">{item}</span>
                    <a href="#" className="text-xs font-bold uppercase tracking-[0.2em] hover:text-blue-400 transition-colors">Protocol</a>
                 </div>
               ))}
            </div>
         </div>
         
         <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 relative z-10">
            <p className="text-[9px] font-black uppercase tracking-[0.3em]">© 2026 Admino Education Hub. All Rights Reserved.</p>
            <div className="flex gap-8">
               {['Terms', 'Privacy', 'Security'].map(item => (
                 <a key={item} href="#" className="text-[9px] font-black uppercase tracking-[0.5em] hover:text-white transition-colors">{item}</a>
               ))}
            </div>
         </div>
         
         {/* Decorative Blur */}
         <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
      </footer>
    </div>
  );
}
