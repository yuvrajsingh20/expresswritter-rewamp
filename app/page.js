"use client";
import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, ArrowRight, Shield, 
  Zap, MessageSquare, Star, 
  CheckCircle2, PlayCircle, Globe
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen text-[#0a192f] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="h-20 border-b border-slate-100 flex items-center justify-between px-10 md:px-20 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-[#0a192f] rounded-lg flex items-center justify-center text-white font-bold text-lg">E</div>
           <span className="text-lg font-extrabold tracking-tight">Express Writer</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          {['Expertise', 'Process', 'Pricing', 'Testimonials'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">{item}</a>
          ))}
        </div>

        <div className="flex items-center gap-4">
           <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-black transition-colors">Sign In</Link>
           <Link href="/login" className="bg-[#0a192f] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#112240] transition-all shadow-lg shadow-blue-950/10 active:scale-95">
             Direct Onboard
           </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="relative pt-32 pb-44 px-10 md:px-20 overflow-hidden">
           <div className="max-w-4xl mx-auto text-center relative z-10">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-10 border border-blue-100/50">
                <Star size={12} fill="currentColor" /> Trusted by 5,000+ Students Globally
              </div>
              <h1 className="text-6xl md:text-8xl font-[900] tracking-tight leading-[1] mb-10 text-[#0a192f]">
                Your Academic <br /> <span className="text-blue-600">Trajectory,</span> Mastered.
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto mb-12">
                Elevate your university applications with precision-engineered Statement of Purpose and professional drafting services.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                 <Link href="/login" className="w-full sm:w-auto bg-[#0a192f] text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-[#112240] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-950/20 active:scale-95 group">
                   Initialize Project <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
                 <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-5 text-slate-500 font-bold hover:text-blue-600 transition-colors">
                    <PlayCircle size={24} /> View Methodology
                 </button>
              </div>
           </div>

           {/* Abstract Decoration */}
           <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-[120px]" />
        </section>

        {/* Trust Bar */}
        <section className="bg-slate-50 py-16 px-10 border-y border-slate-100 flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60">
           {['Harvard', 'Stanford', 'Oxford', 'MIT', 'Cambridge'].map(uni => (
             <span key={uni} className="text-2xl font-black text-slate-300 tracking-tighter grayscale hover:grayscale-0 transition-all cursor-default">{uni}</span>
           ))}
        </section>

        {/* CORE SERVICES */}
        <section id="expertise" className="py-40 px-10 md:px-20">
           <div className="max-w-7xl mx-auto space-y-24">
              <div className="flex flex-col md:flex-row justify-between items-end gap-10">
                 <div className="max-w-xl">
                    <p className="text-blue-600 font-bold uppercase tracking-[0.4em] text-[10px] mb-4">Functional Expertise</p>
                    <h2 className="text-5xl font-extrabold tracking-tight">Drafting perfection for every milestone.</h2>
                 </div>
                 <p className="max-w-xs text-slate-400 font-medium">Specialized writing nodes designed to translate your achievements into academic success.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 {[
                   { title: 'Statement of Purpose', desc: 'Crafting the narrative of your academic journey with narrative precision.', price: '2,499' },
                   { title: 'Letter of Recommendation', desc: 'Synthesizing professional endorsements into compelling character audits.', price: '1,499' },
                   { title: 'Resume Engineering', desc: 'Optimizing your professional profile for ATS compliance and impact.', price: '1,999' },
                 ].map((service, i) => (
                   <div key={i} className="group p-10 border border-slate-100 rounded-3xl hover:bg-[#0a192f] hover:text-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/20">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 flex items-center justify-center rounded-2xl mb-10 group-hover:bg-white/10 group-hover:text-white transition-colors">
                        {i === 0 ? <Zap size={24} /> : i === 1 ? <Shield size={24} /> : <Globe size={24} />}
                      </div>
                      <h3 className="text-2xl font-extrabold mb-4 tracking-tight">{service.title}</h3>
                      <p className="text-slate-400 group-hover:text-slate-300 font-medium mb-12 leading-relaxed">{service.desc}</p>
                      <div className="flex justify-between items-center pt-8 border-t border-slate-50 group-hover:border-white/10">
                         <span className="text-xs font-bold uppercase tracking-widest opacity-60">Starts at</span>
                         <span className="text-2xl font-black">₹{service.price}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* METHODOLOGY Section */}
        <section id="process" className="py-32 px-10 md:px-20 bg-[#f8fafc]">
           <div className="max-w-4xl mx-auto bg-[#0a192f] rounded-[2.5rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">Synchronized Workflow</h2>
              <div className="space-y-12">
                 {[
                   { step: '01', title: 'Deep Configuration', desc: 'Initialize your project with detailed academic context and specific target goals.' },
                   { step: '02', title: 'Expert Assignment', desc: 'Our algorithm matches your request with a domain-specific subject expert.' },
                   { step: '03', title: 'Collaborative Drafting', desc: 'Real-time communication with your writer ensures your voice is maintained.' },
                   { step: '04', title: 'Asset Release', desc: 'Receive your polished, high-integrity draft with a plagiarism certification.' },
                 ].map((item, i) => (
                   <div key={i} className="flex gap-8 group">
                      <span className="text-blue-400 font-black text-xl opacity-40 group-hover:opacity-100 transition-opacity">{item.step}</span>
                      <div>
                         <h4 className="text-xl font-bold mb-2 tracking-tight">{item.title}</h4>
                         <p className="text-slate-400 text-sm font-medium leading-relaxed">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <div className="absolute right-[-10%] bottom-[-10%] w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
           </div>
        </section>
      </main>

      <footer className="py-20 px-10 md:px-20 border-t border-slate-100">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-[#0a192f] rounded-lg flex items-center justify-center text-white font-bold text-sm">E</div>
             <span className="text-sm font-extrabold tracking-tight">Express Writer</span>
           </div>
           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">© 2026 Admino Education Hub. All Rights Reserved.</p>
           <div className="flex gap-8">
              {['Terms', 'Privacy', 'Support'].map(item => (
                <a key={item} href="#" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">{item}</a>
              ))}
           </div>
         </div>
      </footer>
    </div>
  );
}
