"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, ArrowLeft, Check, 
  Target, Calendar, FileText, 
  ShieldCheck, Zap, Star 
} from 'lucide-react';

const SERVICES = [
  { id: 'SOP', name: 'Statement of Purpose', price: 2499, description: 'Academic & Professional SOPs' },
  { id: 'LOR', name: 'Letter of Recommendation', price: 1499, description: 'Mentor & Supervisor LORs' },
  { id: 'RESUME', name: 'Professional Resume', price: 1999, description: 'ATS-friendly & Multi-page' },
];

export default function StartProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceId: '',
    deadline: '',
    description: '',
  });

  const selectedService = SERVICES.find(s => s.id === formData.serviceId);

  const handleNextStep = () => {
    if (step === 2) {
      // Save draft to session storage
      sessionStorage.setItem('pendingProject', JSON.stringify({
        ...formData,
        serviceName: selectedService.name,
        price: selectedService.price
      }));
      // Redirect to register
      router.push('/register?role=STUDENT&redirect=/student/new-order');
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="bg-white min-h-screen text-[#0a192f] selection:bg-blue-100 selection:text-blue-900">
      {/* Mini-Nav */}
      <nav className="h-20 border-b border-slate-100 flex items-center justify-between px-10 md:px-20 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0a192f] rounded-lg flex items-center justify-center text-white font-bold text-lg">E</div>
          <span className="text-lg font-extrabold tracking-tight">Express Writer</span>
        </Link>
        <div className="flex items-center gap-4">
           {step > 1 && (
             <button onClick={() => setStep(step - 1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
               <ArrowLeft size={18} className="text-slate-400" />
             </button>
           )}
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Phase 0{step} <span className="mx-2">/</span> 02</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-10 py-24">
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-[900] tracking-tighter mb-6 italic uppercase leading-none">
            Initialize <br /> <span className="text-blue-600">Trajectory.</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-xl text-lg">
            {step === 1 
              ? "Select the academic artifact you wish to master." 
              : "Define the parameters of your project."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {SERVICES.map((s) => (
                <div 
                  key={s.id}
                  onClick={() => setFormData({ ...formData, serviceId: s.id })}
                  className={`p-10 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between aspect-square group ${
                    formData.serviceId === s.id 
                    ? 'border-blue-600 bg-blue-50 shadow-2xl shadow-blue-600/10' 
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    formData.serviceId === s.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-blue-600'
                  }`}>
                    {s.id === 'SOP' && <FileText size={20} />}
                    {s.id === 'LOR' && <Target size={20} />}
                    {s.id === 'RESUME' && <Zap size={20} />}
                  </div>
                  <div>
                    <h3 className="font-black text-sm mb-1 uppercase tracking-widest">{s.name}</h3>
                    <p className="text-xs font-bold text-slate-400 italic">Starting from ₹{s.price}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block pl-1">Target Deadline</label>
                  <input 
                    type="date" 
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 px-8 py-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
                <div className="bg-[#0a192f] p-8 rounded-[2rem] text-white flex items-center justify-between">
                   <div>
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 mb-2">Selected Config</p>
                     <p className="font-bold text-sm">{selectedService?.name}</p>
                   </div>
                   <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-blue-400">
                     <Check size={18} />
                   </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block pl-1">Contextual Brief</label>
                <textarea 
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us about your academic goals and specific requirements..."
                  className="w-full bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all leading-relaxed"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center">
           <div className="flex -space-x-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                   <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover grayscale opacity-60" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">+5k</div>
           </div>

           <button 
             disabled={step === 1 ? !formData.serviceId : !formData.deadline}
             onClick={handleNextStep}
             className="bg-[#0a192f] text-white px-12 py-5 rounded-xl font-bold hover:bg-black transition-all flex items-center gap-3 shadow-2xl shadow-blue-950/20 disabled:opacity-20 active:scale-95"
           >
             {step === 1 ? 'Next Sequence' : 'Finalize & Secure Account'} <ChevronRight size={18} />
           </button>
        </div>
      </main>
    </div>
  );
}
