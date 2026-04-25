"use client";
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { motion } from 'framer-motion';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import { 
  ChevronRight, Search, Filter, 
  Clock, CheckCircle2, MoreHorizontal,
  Loader2, Plus, Box, ExternalLink,
  Calendar, FileText, AlertCircle
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

  const getStatusConfig = (status) => {
    const configs = {
      CREATED: { label: 'Awaiting Payment', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      ASSIGNED: { label: 'Specialist Assigned', color: 'bg-blue-50 text-[#0067B8] border-blue-200' },
      IN_PROGRESS: { label: 'In Progress', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      REVIEW: { label: 'In Review', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      REVISION: { label: 'Revision', color: 'bg-red-50 text-red-700 border-red-200' },
      COMPLETED: { label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    };
    return configs[status] || { label: status, color: 'bg-slate-50 text-slate-600 border-slate-200' };
  };

  return (
    <div className="flex bg-[#FBFBFB] min-h-screen text-[#111111] font-sans">
      <Sidebar role="STUDENT" />
      
      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-8 sticky top-0 z-10 transition-all">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
             <span>Portal</span>
             <ChevronRight size={14} className="text-slate-300" />
             <span className="text-slate-900">Project History</span>
          </div>
          <Link href="/student/new-order" className="btn-primary h-9 px-4 text-xs">
             <Plus size={14} /> New Project
          </Link>
        </header>

        <main className="p-10 max-w-7xl mx-auto w-full space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Your Projects</h1>
              <p className="text-sm text-slate-500 mt-1">Track progress, chat with specialists, and manage drafts.</p>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80 h-10 border border-[#CCCCCC] rounded-sm bg-white overflow-hidden group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search projects..."
                  className="w-full h-full bg-transparent border-none pl-10 pr-4 text-sm font-medium focus:ring-0 placeholder:text-slate-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="h-10 px-4 border border-[#CCCCCC] rounded-sm hover:bg-white hover:border-slate-400 transition-all">
                <Filter size={14} className="text-slate-600" />
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#E5E5E5] rounded-sm shadow-sm overflow-hidden min-h-[400px]">
             {loading ? (
                <div className="py-40 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-[#0067B8]" size={28} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reading registry...</p>
                </div>
             ) : filteredProjects.length > 0 ? (
                <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-slate-50/50 border-b border-[#E5E5E5] text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <th className="px-8 py-5">General Details</th>
                       <th className="px-8 py-5">Current Status</th>
                       <th className="px-8 py-5">Delivery Deadline</th>
                       <th className="px-8 py-5 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-[#E5E5E5]">
                     {filteredProjects.map((project) => (
                       <tr key={project.id} className="hover:bg-slate-50/30 transition-all group">
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-5">
                               <div className="w-10 h-10 bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 rounded-sm">
                                  <FileText size={18} />
                               </div>
                               <div>
                                  <Link href={`/student/orders/${project.id}`} className="text-sm font-bold text-slate-900 hover:text-[#0067B8] transition-colors block mb-0.5">
                                    {project.title}
                                  </Link>
                                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Ref: {project.id.slice(-6).toUpperCase()}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 border rounded-full text-[10px] font-bold ${getStatusConfig(project.status).color}`}>
                               <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                               {getStatusConfig(project.status).label}
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-slate-600">
                               <Calendar size={14} className="opacity-40" />
                               <p className="text-xs font-semibold">{new Date(project.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <Link href={`/student/orders/${project.id}`} className="inline-flex items-center gap-2 text-xs font-bold text-[#0067B8] hover:underline">
                               Open Project <ChevronRight size={14} />
                            </Link>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                </table>
             ) : (
                <div className="py-40 flex flex-col items-center justify-center text-center px-10">
                   <div className="w-16 h-16 bg-slate-50 flex items-center justify-center text-slate-200 rounded-sm mb-6">
                      <Box size={32} />
                   </div>
                   <h3 className="text-sm font-bold text-slate-900 mb-2">No projects found.</h3>
                   <p className="text-xs text-slate-400 mb-8 max-w-xs mx-auto italic">Start by initializing a new sequence for your academic credentials.</p>
                   <Link href="/student/new-order" className="btn-primary py-3 px-8">
                      Create Project
                   </Link>
                </div>
             )}
          </div>

          {!loading && filteredProjects.length > 0 && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-sm">
               <AlertCircle size={16} className="text-[#0067B8]" />
               <p className="text-[11px] text-[#002D5B] font-medium uppercase tracking-wider">Note: Drafts are held in secure escrow review for 24h before final archival.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
