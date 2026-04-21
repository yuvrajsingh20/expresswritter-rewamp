"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Users, Zap, ShieldCheck, 
  BarChart3, Globe, ChevronRight, 
  Star, MessageSquare, DollarSign 
} from 'lucide-react';

const FreelancerOnboarding = () => {
  return (
    <div className="bg-white min-h-screen text-[#0a192f] selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Mini-Nav */}
      <nav className="h-20 border-b border-slate-100 flex items-center justify-between px-10 md:px-20 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#0a192f] rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">E</div>
          <span className="text-lg font-extrabold tracking-tight">Express Writer</span>
        </Link>
        <Link href="/register?role=FREELANCER" className="text-sm font-bold text-slate-600 hover:text-black transition-colors">Apply Directly</Link>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-32 px-10 md:px-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-10 border border-slate-100">
            <Globe size={12} /> Join a Global Network of Experts
          </div>
          <h1 className="text-5xl md:text-7xl font-[900] tracking-tighter leading-[1] mb-10 text-[#0a192f]">
            Turn your <span className="text-blue-600">Expertise</span> <br /> Into Impact.
          </h1>
          <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto mb-12">
            Write for the world's most ambitious students. Elevate academic trajectories through precise, domain-specific drafting.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/register?role=FREELANCER" className="w-full sm:w-auto bg-[#0a192f] text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-950/20 active:scale-95">
              Start Earning Now <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Benefits Grid */}
      <section className="py-32 px-10 md:px-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { 
              icon: <DollarSign className="text-green-600" />, 
              title: "Premium Rates", 
              desc: "Highest payout ratios in the industry. Get rewarded for your elite command of language and domain expertise." 
            },
            { 
              icon: <ShieldCheck className="text-blue-600" />, 
              title: "Escrow Protection", 
              desc: "Never worry about payments. Funds are secured before you start writing and released upon project delivery." 
            },
            { 
              icon: <Zap className="text-orange-600" />, 
              title: "Dynamic Workflow", 
              desc: "Our matching algorithm connects you with projects that fit your specific academic background." 
            }
          ].map((item, i) => (
            <div key={i} className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <div className="w-14 h-14 bg-slate-50 flex items-center justify-center rounded-2xl mb-8">
                {item.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tighter italic uppercase">{item.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works - Stylized */}
      <section className="py-40 px-10 md:px-20 text-white bg-[#0a192f]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1">
            <h2 className="text-5xl font-black tracking-tighter mb-10 italic uppercase">Onboarding Protocol.</h2>
            <div className="space-y-12">
              {[
                { title: 'Identity Verification', desc: 'Secure verification of your academic credentials and writing samples.' },
                { title: 'Role Assignment', desc: 'Get tagged into specific domain nodes (STEM, Business, Humanities).' },
                { title: 'Project Stream', desc: 'Receive real-time invitations to projects matching your expertise.' },
              ].map((step, i) => (
                <div key={i} className="flex gap-8 group">
                  <span className="text-blue-400 font-black text-2xl opacity-40 group-hover:opacity-100 transition-all italic">0{i+1}</span>
                  <div>
                    <h4 className="text-xl font-bold mb-2 uppercase tracking-widest">{step.title}</h4>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 relative">
             <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-3xl">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/20">
                     <Star size={20} fill="white" className="text-white" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Elite Writer Panel</p>
                     <p className="text-lg font-bold tracking-tight">System Initialization</p>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="h-4 bg-white/10 rounded-full w-full" />
                   <div className="h-4 bg-white/10 rounded-full w-[80%]" />
                   <div className="h-4 bg-white/10 rounded-full w-[90%]" />
                </div>
             </div>
             {/* Decorative glow */}
             <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/20 rounded-full blur-[100px]" />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-10 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight mb-8">Ready to join the elite?</h2>
        <p className="text-slate-400 font-medium mb-12 max-w-xl mx-auto text-lg italic tracking-tight">Your next professional milestone begins here.</p>
        <Link href="/register?role=FREELANCER" className="inline-flex items-center gap-3 bg-[#0a192f] text-white px-16 py-6 rounded-2xl font-bold text-xl hover:bg-black shadow-2xl transition-all">
          Apply as Freelancer <ArrowRight size={20} />
        </Link>
      </section>
      
      {/* Footer */}
      <footer className="py-20 px-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0a192f] rounded-lg flex items-center justify-center text-white font-bold text-sm">E</div>
          <span className="text-sm font-extrabold tracking-tight">Express Writer</span>
        </div>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Built for Professionals.</p>
      </footer>
    </div>
  );
};

export default FreelancerOnboarding;

const ArrowRight = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
