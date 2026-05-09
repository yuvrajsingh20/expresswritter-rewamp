"use client";
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, ArrowLeft, Check, 
  Upload, Calendar, FileText, CreditCard,
  ShieldCheck, Zap, Loader2, Info, X
} from 'lucide-react';

import servicesData from '@/data/services_data.json';

const SERVICES = Object.values(servicesData.individualServices).flat().map(s => {
  const priceNum = typeof s.price === 'string' 
    ? parseFloat(s.price.replace(/[^\d.]/g, '')) 
    : (s.price || 0);
  return { ...s, price: priceNum || 0 };
});

export default function NewOrderPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: '',
    deadline: '',
    description: '',
    attachments: [] // Stores {url, name}
  });

  useEffect(() => {
    const pending = sessionStorage.getItem('pendingProject');
    if (pending) {
      const data = JSON.parse(pending);
      setFormData(prev => ({
        ...prev,
        serviceId: data.serviceId,
        deadline: data.deadline,
        description: data.description
      }));
    }
  }, []);

  const selectedService = SERVICES.find(s => s.id === formData.serviceId);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const body = new FormData();
        body.append('file', file);
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body
        });
        
        if (!res.ok) throw new Error('Upload failed');
        return await res.json();
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...uploadedFiles]
      }));
    } catch (error) {
      console.error('File upload failure:', error);
      alert('Failed to upload one or more files.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const remoteAttachment = (url) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.url !== url)
    }));
  };

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
          deadline: formData.deadline, // Handled as string, backend will parse
          serviceType: selectedService.id,
          amount: selectedService.price,
          attachments: formData.attachments
        }),
      });
      
      if (!projectRes.ok) throw new Error('Failed to create project');
      const project = await projectRes.json();

      const paymentRes = await fetch('/api/payments/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedService.price,
          projectId: project.id
        }),
      });
      
      if (!paymentRes.ok) throw new Error('Failed to initiate payment');
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
        theme: { color: "#002D5B" },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert("Payment gateway not loaded. Please refresh.");
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-[#FBFBFB] min-h-screen text-[#111111] font-sans">
      <Sidebar role="STUDENT" />
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="flex-1 md:ml-64 flex flex-col">
        <header className="h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-8 sticky top-0 z-10 transition-all">
          <div className="flex items-center gap-4">
             <button onClick={() => router.back()} className="text-xs font-semibold text-slate-500 hover:text-[#0067B8] flex items-center gap-1 transition-colors">
               <ArrowLeft size={14} /> Back
             </button>
             <div className="h-4 w-px bg-slate-200" />
             <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${step === 1 ? 'text-[#0067B8]' : 'text-slate-400'}`}>01. Configure</span>
                <ChevronRight size={12} className="text-slate-300" />
                <span className={`text-[11px] font-bold uppercase tracking-wider ${step === 2 ? 'text-[#0067B8]' : 'text-slate-400'}`}>02. Review & Pay</span>
             </div>
          </div>
        </header>

        <main className="p-12 max-w-4xl mx-auto w-full">
          <div className="mb-12">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Create New Project</h1>
            <p className="text-sm text-slate-500">Provide the requirements and deadline for your academic document.</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-10"
              >
                {/* Service Selection */}
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Select Service Category</label>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {SERVICES.map((s) => (
                        <button 
                        key={s.id}
                        onClick={() => setFormData({ ...formData, serviceId: s.id })}
                        className={`p-6 text-left border rounded-sm transition-all ${
                            formData.serviceId === s.id 
                            ? 'border-[#0067B8] bg-blue-50/30' 
                            : 'border-[#E5E5E5] bg-white hover:border-slate-300'
                        }`}
                        >
                            <div className={`w-8 h-8 rounded-sm mb-4 flex items-center justify-center ${formData.serviceId === s.id ? 'bg-[#0067B8] text-white' : 'bg-slate-50 text-slate-400'}`}>
                                <FileText size={16} />
                            </div>
                            <h3 className="font-bold text-sm text-slate-900 mb-1">{s.name}</h3>
                            <p className="text-[11px] text-slate-500 mb-4">{s.description}</p>
                            <p className="text-lg font-bold text-slate-900">₹{s.price}</p>
                        </button>
                    ))}
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Delivery Deadline</label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#0067B8]" size={16} />
                        <input 
                          type="date" 
                          value={formData.deadline}
                          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                          className="input-professional pl-12 h-11"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Supporting Documents</label>
                       <input 
                         type="file" 
                         className="hidden" 
                         ref={fileInputRef} 
                         multiple 
                         onChange={handleFileUpload}
                       />
                       <button 
                         onClick={() => fileInputRef.current?.click()}
                         disabled={uploading}
                         className="w-full h-11 border border-[#CCCCCC] border-dashed rounded-sm bg-white hover:bg-slate-50 flex items-center justify-center px-4 cursor-pointer transition-all gap-2 group"
                       >
                          {uploading ? (
                            <Loader2 className="animate-spin text-[#0067B8]" size={14} />
                          ) : (
                            <Upload size={14} className="text-slate-400 group-hover:text-[#0067B8]" />
                          )}
                          <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600">
                            {uploading ? 'Uploading assets...' : 'Click to upload assets'}
                          </span>
                       </button>
                    </div>
                </div>

                {/* Attachment List */}
                {formData.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.attachments.map((file) => (
                      <div key={file.url} className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-sm text-[10px] font-bold text-slate-600 flex items-center gap-2">
                        <FileText size={12} />
                        <span className="max-w-[100px] truncate">{file.name}</span>
                        <div className="flex items-center gap-1.5 border-l border-slate-300 ml-1 pl-2">
                           <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0067B8]">
                             View
                           </a>
                           <button onClick={() => remoteAttachment(file.url)} className="text-slate-400 hover:text-red-500">
                             <X size={12} />
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Project Brief & Requirements</label>
                    <textarea 
                        rows={6}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detail your academic background and specific goals for this project..."
                        className="input-professional min-h-[150px] py-4 resize-none"
                    />
                </div>

                <div className="flex justify-end pt-8 border-t border-[#E5E5E5]">
                  <button 
                    disabled={!formData.serviceId || !formData.deadline || uploading}
                    onClick={() => setStep(2)}
                    className="btn-primary h-11 px-10 disabled:opacity-50"
                  >
                    Next Step <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="bg-white border border-[#E5E5E5] rounded-sm overflow-hidden">
                   <div className="p-8 border-b border-[#E5E5E5]">
                      <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Order Summary</h3>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Service Type</span>
                            <span className="font-semibold text-slate-900">{selectedService?.name}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Requested Deadline</span>
                            <span className="font-semibold text-slate-900">{formData.deadline}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Attachments</span>
                            <span className="font-semibold text-slate-900">{formData.attachments.length} files</span>
                         </div>
                         <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                            <span className="text-sm font-bold text-slate-900">Total Payable</span>
                            <span className="text-2xl font-bold text-[#002D5B]">₹{selectedService?.price}</span>
                         </div>
                      </div>
                   </div>

                   <div className="p-8 bg-slate-50/50 flex items-start gap-4">
                      <div className="p-2 bg-blue-100 text-[#0067B8] rounded-sm">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-slate-900 mb-1">Escrow Protocol Active</p>
                         <p className="text-[11px] text-slate-500 leading-relaxed max-w-md">Your payment will be held securely and only released to the writer after your review and approval of the final draft.</p>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-100 rounded-sm">
                   <Info size={16} className="text-amber-600 shrink-0" />
                   <p className="text-[11px] text-amber-800 font-medium">Once payment is authorized, a dedicated specialist will be auto-assigned to your project immediately.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-4">
                  <button 
                    onClick={handleCreateOrder}
                    disabled={loading}
                    className="flex-1 btn-primary h-12 gap-3 disabled:opacity-50"
                  >
                     {loading ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                     {loading ? 'Processing Payment...' : `Confirm & Pay ₹${selectedService?.price}`}
                  </button>
                  <button 
                    onClick={() => setStep(1)}
                    className="btn-outline px-8 h-12"
                  >
                     Modify Details
                  </button>
                </div>

                <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest">Secure 256-bit SSL Encrypted Payment</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
