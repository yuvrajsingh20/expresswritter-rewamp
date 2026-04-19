"use client";
import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { motion } from 'framer-motion';
import { useSession } from "next-auth/react";
import { 
  Briefcase, CheckCircle, Clock, 
  DollarSign, Star, Zap, ChevronRight,
  Filter, Download
} from 'lucide-react';

export default function FreelancerDashboard() {
  const { data: session } = useSession();

  const stats = [
    { title: 'Active Tasks', count: 3, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Earnings', count: '$2,450', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Rating', count: '4.9', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const currentTasks = [
    { id: '#921', client: 'John Doe', type: 'SOP Writing', deadline: '24h left', status: 'Priority' },
    { id: '#884', client: 'Alice Smith', type: 'Resume Edit', deadline: '3 days left', status: 'In Review' },
  ];

  return (
    <div className="flex bg-[#f8f9fa] min-h-screen text-[#1d1d1f]">
      <Sidebar role="FREELANCER" />
      
      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2">
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Workspace</span>
             <ChevronRight size={14} className="text-slate-300" />
             <span className="text-xs font-black text-slate-800 uppercase tracking-widest italic">Expert Lab</span>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black border border-green-100 italic">
                <Zap size={10} strokeWidth={3} /> ONLINE
             </div>
          </div>
        </header>

        <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center"
          >
            <div>
              <h1 className="text-3xl font-black tracking-tight italic">Mission Control: {session?.user?.name || "Freelancer"}</h1>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2 px-1 tracking-tight">Focus on excellence • Global reach active</p>
            </div>
            <div className="flex gap-4">
               <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                  <Filter size={18} />
               </button>
               <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-300 hover:scale-105 transition-all">
                  WITHDRAW FUNDS
               </button>
            </div>
          </motion.div>

          {/* Productivity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {stats.map((stat, idx) => (
               <motion.div 
                 key={stat.title}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.1 }}
                 className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all cursor-default relative overflow-hidden"
               >
                 <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                    <p className="text-3xl font-black mb-2">{stat.count}</p>
                 </div>
                 <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.bg} rounded-full opacity-30 flex items-center justify-center pt-2 pl-2`}>
                    <stat.icon size={48} className={stat.color} />
                 </div>
               </motion.div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Task Queue */}
             <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-lg font-black tracking-tight italic">Active Task Queue</h3>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">3 items in priority</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {currentTasks.map((task) => (
                     <div key={task.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-lg transition-all border-l-4 border-l-blue-500">
                        <div className="flex justify-between items-start mb-6">
                           <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                              {task.status}
                           </div>
                           <p className="text-[10px] font-black text-slate-300">{task.id}</p>
                        </div>
                        <h4 className="text-xl font-black tracking-tight mb-1">{task.type}</h4>
                        <p className="text-xs font-semibold text-slate-500 mb-6">Client: {task.client}</p>
                        
                        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-50">
                           <div className="flex items-center gap-2 text-slate-400">
                              <Clock size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">{task.deadline}</span>
                           </div>
                        </div>
                        
                        <button className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                           VIEW ASSETS
                        </button>
                     </div>
                   ))}
                </div>
             </div>

             {/* Performance & Guidelines Card */}
             <div className="space-y-6">
                <div className="bg-[#1d1d1f] rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-2xl shadow-slate-300 relative overflow-hidden h-full">
                   <div className="relative z-10">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-10">
                         <Zap className="text-blue-400" size={24} />
                      </div>
                      <h3 className="text-xl font-black tracking-tight mb-4 italic">Pro Excellence Guide</h3>
                      <p className="text-slate-400 text-xs font-medium leading-relaxed mb-10">Ensure all SOPs follow current university standards. 95% pass rate required for Gold Status.</p>
                      
                      <div className="space-y-4">
                         <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <CheckCircle size={16} className="text-green-400" />
                            <p className="text-[10px] font-black uppercase tracking-widest tracking-tight">Pass Plagiarism Check</p>
                         </div>
                         <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <Download size={16} className="text-blue-400" />
                            <p className="text-[10px] font-black uppercase tracking-widest tracking-tight">Latest Template (v2.4)</p>
                         </div>
                      </div>
                   </div>
                   
                   <div className="absolute -right-10 -bottom-10 opacity-10">
                      <Briefcase size={200} />
                   </div>
                </div>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
