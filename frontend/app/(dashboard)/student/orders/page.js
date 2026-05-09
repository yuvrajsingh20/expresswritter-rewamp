"use client";
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import { 
  ChevronRight, Search, Filter, 
  Clock, CheckCircle2, MoreHorizontal,
  Loader2, Plus, Box, ExternalLink,
  Calendar, FileText, AlertCircle, Zap,
  CreditCard, ArrowUpRight
} from 'lucide-react';

export default function StudentOrdersPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [session]);

  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusConfig = (project) => {
    const status = project.status;
    const isPaid = project.orders?.some(o => o.paymentStatus === 'PAID');

    if (status === 'CREATED' && isPaid) {
      return { label: 'Paid - Awaiting Expert', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
    }

    const configs = {
      CREATED: { label: 'Awaiting Payment', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: CreditCard },
      AWAITING_PAYMENT: { label: 'Awaiting Payment', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: CreditCard },
      PENDING_PAYMENT: { label: 'Awaiting Payment', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: CreditCard },
      ASSIGNED: { label: 'Expert Assigned', color: 'bg-blue-50 text-[#0067B8] border-blue-200', icon: Zap },
      IN_PROGRESS: { label: 'In Progress', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: PlayCircle },
      REVIEW: { label: 'Review Stage', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Search },
      REVISION: { label: 'Revision', color: 'bg-red-50 text-red-700 border-red-200', icon: AlertCircle },
      COMPLETED: { label: 'Finalized', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    };
    return configs[status] || { label: status, color: 'bg-slate-50 text-slate-600 border-slate-200', icon: Box };
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex bg-[#FBFBFB] min-h-screen text-[#111111] font-sans">
      <Sidebar role="STUDENT" />
      
      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Modern Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5] flex items-center justify-between px-10 shrink-0 z-20">
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Order Repository</h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               <span>Management</span>
               <ChevronRight size={12} className="text-slate-300" />
               <span className="text-[#0067B8]">Project History</span>
            </div>
          </div>
          <Link href="/student/new-order" className="group h-11 px-6 bg-[#002D5B] text-white rounded-lg flex items-center gap-3 font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-blue-900/10 active:scale-95">
             <Plus size={16} /> NEW INITIATIVE
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-10 space-y-10 bg-slate-50/30">
          {/* Dashboard Stats / Hero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-[#002D5B] rounded-2xl p-6 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                  <Zap size={80} />
                </div>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Active Projects</p>
                <p className="text-3xl font-black">{projects.filter(p => p.status !== 'COMPLETED').length}</p>
             </div>
             <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Delivered</p>
                <p className="text-3xl font-black text-slate-900">{projects.filter(p => p.status === 'COMPLETED').length}</p>
             </div>
             <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Investment Node</p>
                <p className="text-3xl font-black text-slate-900">₹{projects.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}</p>
             </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative w-full md:w-[480px] group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0067B8] transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search project stream..."
                className="w-full h-14 bg-white border border-[#E5E5E5] rounded-xl pl-14 pr-6 text-xs font-bold focus:ring-4 focus:ring-blue-50 focus:border-[#0067B8] outline-none transition-all shadow-sm placeholder:text-slate-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
               <button className="h-14 px-6 bg-white border border-[#E5E5E5] rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                 <Filter size={16} /> Filter Nodes
               </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-[#E5E5E5] rounded-3xl shadow-sm overflow-hidden">
             {loading ? (
                <div className="py-40 flex flex-col items-center justify-center gap-6">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-[#002D5B] rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-wider animate-pulse">Syncing Database...</p>
                </div>
             ) : filteredProjects.length > 0 ? (
                <motion.table 
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="w-full text-left"
                >
                   <thead>
                     <tr className="bg-slate-50/50 border-b border-[#E5E5E5] text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <th className="px-10 py-6">Project Parameters</th>
                       <th className="px-10 py-6">Operational Status</th>
                       <th className="px-10 py-6">Deadline Vector</th>
                       <th className="px-10 py-6 text-right">Access Console</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {filteredProjects.map((project) => {
                       const config = getStatusConfig(project);
                       const StatusIcon = config.icon;
                       return (
                        <motion.tr 
                          variants={item}
                          key={project.id} 
                          className="hover:bg-slate-50/50 transition-all group cursor-pointer"
                        >
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 rounded-2xl group-hover:bg-blue-50 group-hover:text-[#0067B8] group-hover:border-blue-100 transition-all shadow-sm">
                                   <FileText size={24} />
                                </div>
                                <div>
                                   <Link href={`/student/orders/${project.id}`} className="text-sm font-black text-slate-900 group-hover:text-[#0067B8] transition-colors block mb-1">
                                     {project.title}
                                   </Link>
                                   <div className="flex items-center gap-2">
                                     <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">ID: {project.id.slice(-6).toUpperCase()}</span>
                                     <span className="text-[9px] font-black text-[#0067B8] uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">₹{project.amount}</span>
                                   </div>
                                </div>
                             </div>
                          </td>
                          <td className="px-10 py-8">
                             <div className={`inline-flex items-center gap-2.5 px-4 py-2 border rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm transition-all ${config.color}`}>
                                <StatusIcon size={14} className="opacity-70" />
                                {config.label}
                             </div>
                          </td>
                          <td className="px-10 py-8">
                             <div className="flex flex-col gap-1">
                               <div className="flex items-center gap-2 text-slate-600">
                                  <Calendar size={14} className="text-slate-300" />
                                  <p className="text-xs font-bold">{new Date(project.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                               </div>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">T-MINUS CALCULATED</p>
                             </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                             <Link href={`/student/orders/${project.id}`} className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-[#E5E5E5] text-slate-400 hover:text-[#0067B8] hover:border-[#0067B8] hover:bg-blue-50 hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                                <ArrowUpRight size={20} />
                             </Link>
                          </td>
                        </motion.tr>
                       );
                     })}
                   </tbody>
                </motion.table>
             ) : (
                <div className="py-48 flex flex-col items-center justify-center text-center px-10 space-y-8">
                   <div className="w-24 h-24 bg-slate-50 flex items-center justify-center text-slate-200 rounded-3xl mb-2 relative overflow-hidden">
                      <Box size={40} />
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent animate-pulse" />
                   </div>
                   <div className="space-y-3">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Empty Repository</h3>
                      <p className="text-sm text-slate-400 max-w-xs mx-auto font-medium leading-relaxed italic">No project nodes detected in your session. Begin a new academic sequence to populate this view.</p>
                   </div>
                   <Link href="/student/new-order" className="h-14 px-10 bg-[#002D5B] text-white rounded-xl flex items-center gap-3 font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-blue-900/20 active:scale-95">
                      INITIALIZE FIRST DRAFT
                   </Link>
                </div>
             )}
          </div>

          {!loading && filteredProjects.length > 0 && (
            <div className="flex items-center gap-4 p-6 bg-[#002D5B] text-white rounded-3xl shadow-xl shadow-blue-900/10 relative overflow-hidden">
               <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} className="text-blue-200" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Security & Integrity Protocol</p>
                  <p className="text-xs font-medium text-blue-50/80 mt-1">All academic streams are encrypted. Drafts are held in secure escrow for 24h post-delivery for your review.</p>
               </div>
               <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12">
                 <Lock size={120} />
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Missing Lucide icons from imports
import { PlayCircle, ShieldCheck, Lock } from 'lucide-react';
