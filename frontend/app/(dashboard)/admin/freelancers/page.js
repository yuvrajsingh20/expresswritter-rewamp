"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/dashboard/Sidebar';
import { motion } from 'framer-motion';
import { 
  Users, CreditCard, Send, Search, 
  MoreHorizontal, Zap, DollarSign, BellRing,
  MessageCircle, UserCheck
} from 'lucide-react';

const WorkforcePortal = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const res = await fetch('/api/admin/freelancers');
        const data = await res.json();
        setFreelancers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch freelancers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancers();
  }, []);

  return (
    <div className="flex bg-[#f8f9fa] min-h-screen text-[#1d1d1f]">
      <Sidebar role="ADMIN" />
      
      <main className="flex-1 md:ml-64 p-10 space-y-10 max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight italic">Workforce Control</h1>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2">Global Freelancer Management</p>
          </div>
          <div className="flex gap-4">
             <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black hover:bg-slate-50 transition-all flex items-center gap-2">
                <CreditCard size={18} /> MANAGE PAYOUTS
             </button>
             <button className="bg-[#0071e3] text-white px-8 py-3 rounded-2xl text-xs font-black tracking-widest shadow-2xl shadow-blue-200">
                ADD EXPERT +
             </button>
          </div>
        </header>

        <div className="bg-[#1d1d1f] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl group">
           <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                   <BellRing size={20} />
                </div>
                <h3 className="text-xl font-black italic tracking-tight">Broadcast Command</h3>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">Global reach: Current active workforce (24 Experts)</p>
              <div className="flex gap-4">
                 <input type="text" placeholder="Type an announcement to all experts..." className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-bold outline-none focus:bg-white/10 transition-all" />
                 <button className="bg-[#0071e3] px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
                    SEND ALL
                 </button>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: 'Active Experts', value: freelancers.length.toString(), icon: Users, color: 'text-blue-500' },
             { label: 'Pending Billings', value: '₹0', icon: DollarSign, color: 'text-green-500' },
             { label: 'Avg Quality', value: '5.0/5.0', icon: UserCheck, color: 'text-amber-500' }
           ].map((stat) => (
             <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-8 group hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-all">
                   <stat.icon size={28} className={stat.color} />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/30 border border-slate-50 overflow-hidden">
           <div className="p-10 border-b border-slate-50 flex justify-between items-center">
              <h4 className="font-black text-sm uppercase tracking-widest text-slate-400">Workforce Directory</h4>
              <div className="flex gap-3">
                 <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 border border-slate-100 rounded-xl">
                    <Search size={16} className="text-slate-400" />
                    <input type="text" placeholder="Search experts..." className="bg-transparent border-none focus:ring-0 text-xs font-bold w-48" />
                 </div>
              </div>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50/20 text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50">
                    <th className="px-12 py-6">Expert</th>
                    <th className="px-6 py-6 font-blue">Onboarding Status</th>
                    <th className="px-6 py-6">Earnings</th>
                    <th className="px-6 py-6 text-center">Tasks</th>
                    <th className="px-12 py-6 text-right">Eagle-Eye Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {freelancers.map((f) => (
                   <tr key={f.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="px-12 py-8">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#0071e3] text-white flex items-center justify-center font-black text-xs shadow-lg shadow-blue-100 italic">
                               {(f.name || 'U').split(' ').map(n=>n[0]).join('')}
                            </div>
                            <div>
                               <p className="text-sm font-black text-slate-900">{f.name}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase">{f.freelancerProfile?.skills?.join(', ') || 'Generalist'}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-8">
                         <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden mb-2 shadow-inner">
                            <div className={`h-full rounded-full ${f.freelancerProfile?.isVerified ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: f.freelancerProfile?.isVerified ? '100%' : '50%' }} />
                         </div>
                         <p className={`text-[9px] font-black uppercase tracking-tighter ${f.freelancerProfile?.isVerified ? 'text-green-600' : 'text-amber-600'}`}>
                           {f.freelancerProfile?.isVerified ? '100% VERIFIED' : 'PENDING REVIEW'}
                         </p>
                      </td>
                      <td className="px-6 py-8">
                         <p className="text-sm font-black text-slate-900">₹0</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Payout</p>
                      </td>
                      <td className="px-6 py-8 text-center">
                         <span className="bg-blue-50 text-[#0071e3] px-4 py-1.5 rounded-xl font-black text-xs border border-blue-100">{f.freelancerProfile?.totalProjects || 0}</span>
                      </td>
                      <td className="px-12 py-8 text-right">
                         <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                            <Link href={`/admin/chat?user=${f.id}`} className="p-3 bg-blue-50 text-[#0071e3] rounded-2xl hover:bg-[#0071e3] hover:text-white transition-all shadow-inner" title="Separate Chat">
                               <MessageCircle size={18} />
                            </Link>
                            <button className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200" title="Assign Helper Tasks">
                               <Zap size={18} />
                            </button>
                         </div>
                      </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </main>
    </div>
  );
};

export default WorkforcePortal;
