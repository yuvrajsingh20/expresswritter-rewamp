"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, ArrowLeft, Check, 
  Upload, Calendar, FileText, CreditCard,
  ShieldCheck, Zap, Loader2, Minus, Plus
} from 'lucide-react';

const SERVICES = [
  { id: 'SOP', name: 'Statement of Purpose', price: 2499, description: 'Academic & Professional SOPs' },
  { id: 'LOR', name: 'Letter of Recommendation', price: 1499, description: 'Mentor & Supervisor LORs' },
  { id: 'RESUME', name: 'Professional Resume', price: 1999, description: 'ATS-friendly & Multi-page' },
];

export default function NewOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: '',
    deadline: '',
    description: '',
    files: []
  });

  const selectedService = SERVICES.find(s => s.id === formData.serviceId);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const projectRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${selectedService.name} Order`,
          description: formData.description,
          deadline: new Date(formData.deadline),
          serviceType: selectedService.id
        }),
      });
      const project = await projectRes.json();

      const paymentRes = await fetch('/api/payments/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedService.price,
          projectId: project.id
        }),
      });
      const order = await paymentRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: order.amount,
        currency: "INR",
        name: "Express Writer",
        description: `Payment for ${selectedService.name}`,
        order_id: order.id,
        handler: async (response) => {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              projectId: project.id
            }),
          });

          if (verifyRes.ok) {
            router.push(`/student/orders/${project.id}?success=true`);
          }
        },
        prefill: {
          name: "Student Name",
          email: "student@example.com",
        },
        theme: { color: "#000000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Order creation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-white min-h-screen text-black">
      <Sidebar role="STUDENT" />
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-10 transition-all">
          <div className="flex items-center gap-6">
             <button onClick={() => router.back()} className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] hover:text-black transition-colors">Abort Process</button>
             <ChevronRight size={14} className="text-slate-100" />
             <span className="text-[10px] font-black text-black uppercase tracking-[0.3em]">Step {step === 1 ? '01_Configuration' : '02_Authorization'}</span>
          </div>
        </header>

        <main className="p-10 max-w-5xl mx-auto w-full space-y-20">
          <div className="mb-12">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4">Project Initialization</p>
            <h1 className="text-6xl font-black tracking-tighter mb-4 italic leading-tight uppercase">New Sequence.</h1>
            <p className="text-slate-500 text-sm font-medium max-w-2xl leading-relaxed whitespace-pre-line">
               {step === 1 ? 'Configure your academic artifact parameters.' : 'Authorize payment protocol to initialize the drafting stream.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-20"
              >
                {/* Service Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-slate-100 divide-x divide-slate-100">
                  {SERVICES.map((s) => (
                    <div 
                      key={s.id}
                      onClick={() => setFormData({ ...formData, serviceId: s.id })}
                      className={`p-10 cursor-pointer transition-all ${
                        formData.serviceId === s.id ? 'bg-black text-white scale-[1.02] z-10' : 'bg-white text-black hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-10 h-10 mb-8 flex items-center justify-center border ${formData.serviceId === s.id ? 'border-white/20' : 'border-black/5'}`}>
                        {s.id === 'SOP' && <FileText size={18} />}
                        {s.id === 'LOR' && <Check size={18} />}
                        {s.id === 'RESUME' && <Zap size={18} />}
                      </div>
                      <h3 className="font-black text-sm mb-2 uppercase tracking-widest">{s.name}</h3>
                      <p className={`text-[9px] font-bold uppercase tracking-widest mb-10 ${formData.serviceId === s.id ? 'text-white/40' : 'text-slate-400'}`}>{s.description}</p>
                      <p className="text-3xl font-black tracking-tighter italic">₹{s.price}</p>
                    </div>
                  ))}
                </div>

                {/* Form Fields */}
                <div className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 block">Delivery Deadline</label>
                      <div className="relative border border-slate-100 bg-slate-50 px-8 py-5">
                        <Calendar className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                          type="date" 
                          value={formData.deadline}
                          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                          className="w-full bg-transparent pl-10 text-[10px] font-black uppercase tracking-widest focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 block">Document Integrity</label>
                      <div className="border border-slate-100 bg-slate-50 px-8 py-5 flex items-center justify-between group cursor-pointer hover:bg-black hover:bg-white transition-all">
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-black">Drop contextual assets...</p>
                         <Upload className="text-slate-200 group-hover:text-black" size={16} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 block">Project Brief & Parameters</label>
                    <textarea 
                      rows={6}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="SHARE YOUR ACADEMIC TRAJECTORY AND PROJECT SPECIFICS..."
                      className="w-full bg-white border border-slate-100 p-8 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed focus:bg-slate-50 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-10 border-t border-slate-50">
                  <button 
                    disabled={!formData.serviceId || !formData.deadline}
                    onClick={() => setStep(2)}
                    className="btn-classy px-16 py-6 text-[10px]"
                  >
                    PROCEED TO AUTHORIZATION <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-slate-100">
                  {/* Summary Card */}
                  <div className="bg-white p-12 space-y-12 border-r border-slate-100">
                     <div>
                       <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 mb-8 border-b border-slate-50 pb-4">Configuration Audit</h3>
                       <div className="space-y-8">
                          <div className="flex justify-between items-center">
                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Selected Artifact</span>
                             <span className="text-xs font-black text-black uppercase tracking-widest">{selectedService.name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Temporal Deadline</span>
                             <span className="text-xs font-black text-black uppercase tracking-widest">{formData.deadline}</span>
                          </div>
                          <div className="pt-8 border-t border-slate-50 flex justify-between items-end">
                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Fiscal Total</span>
                             <span className="text-5xl font-black italic tracking-tighter">₹{selectedService.price}</span>
                          </div>
                       </div>
                     </div>

                     <div className="bg-slate-50 p-8 flex items-start gap-6 border border-slate-100">
                        <ShieldCheck className="text-black mt-1" size={20} />
                        <div>
                           <p className="text-[10px] font-black text-black mb-2 uppercase tracking-widest">Protocol: Escrow Protected</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-loose">Funds are locked in a neutral node until you authorize the final drafting release.</p>
                        </div>
                     </div>
                  </div>

                  {/* Payment Card */}
                  <div className="bg-black p-12 text-white flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-black tracking-tighter italic mb-8 uppercase">Authorization Gate.</h3>
                      <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mb-12 leading-relaxed">
                        Secure transaction interface. RSA-4096 encryption active. Your payment parameters are never cached.
                      </p>
                      
                      <div className="space-y-6 mb-12">
                        {[
                          'Verified Subject Specialist Assignment',
                          'Direct Inter-Role Messaging',
                          'Algorithmic Plagiarism Verification'
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-4">
                             <Check size={14} className="text-white/40" />
                             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <button 
                        onClick={handleCreateOrder}
                        disabled={loading}
                        className="w-full py-6 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] hover:bg-slate-200 transition-all flex items-center justify-center gap-4"
                      >
                         {loading ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={18} />}
                         {loading ? 'INITIALIZING PROTOCOL...' : `AUTHORIZE ₹${selectedService.price}`}
                      </button>
                      <button 
                        onClick={() => setStep(1)}
                        className="w-full text-white/20 text-[9px] font-black uppercase tracking-[0.5em] hover:text-white transition-colors"
                      >
                         MODIFY PARAMETERS.BACK
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
