"use client";
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { motion } from 'framer-motion';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import { 
  ChevronRight, ArrowLeft, Search, Filter, 
  Clock, CheckCircle2, MoreHorizontal,
  Loader2, Plus, Box
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

    if (session?.user) fetchProjects();
  }, [session]);

  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status) => {
    const styles = {
      CREATED: 'text-black bg-white border-slate-200',
      ASSIGNED: 'text-black bg-slate-50 border-slate-200',
      IN_PROGRESS: 'text-black bg-white border-black',
      REVIEW: 'text-black bg-slate-100 border-slate-200',
      REVISION: 'text-black bg-white border-dashed border-black',
      COMPLETED: 'text-white bg-black border-black',
    };
    return styles[status] || 'text-slate-400 bg-white border-slate-100';
  };

  return (
    <div className="flex bg-white min-h-screen text-black">
      <Sidebar role="STUDENT" />
      
      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-10 transition-all">
          <div className="flex items-center gap-6">
             <Link href="/student" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] hover:text-black transition-colors">Return Terminal</Link>
             <ChevronRight size={14} className="text-slate-100" />
             <span className="text-[10px] font-black text-black uppercase tracking-[0.3em]">Project Archive</span>
          </div>
          <Link href="/student/new-order">
            <button className="btn-classy px-8 py-4">
               <Plus size={16} /> New Initialization
            </button>
          </Link>
        </header>

        <main className="p-10 max-w-7xl mx-auto w-full space-y-20">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-10">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4">Historical Registry</p>
              <h1 className="text-6xl font-black tracking-tighter italic">MY PROJECTS.</h1>
            </div>
            
            <div className="flex gap-4">
              <div className="relative border border-slate-100 bg-slate-50 px-6 py-4 w-80">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input 
                  type="text" 
                  placeholder="SEARCH ARCHIVE..."
                  className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest w-full placeholder:text-slate-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="px-6 border border-slate-100 hover:bg-black hover:text-white transition-all">
                <Filter size={14} />
              </button>
            </div>
          </div>

          <div className="border border-slate-100 overflow-hidden">
             {loading ? (
                <div className="py-40 flex flex-col items-center justify-center gap-6 bg-slate-50">
                    <Loader2 className="animate-spin text-black" size={32} strokeWidth={1} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Syncing Archives...</p>
                </div>
             ) : filteredProjects.length > 0 ? (
                <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                       <th className="px-10 py-6">Project Metadata</th>
                       <th className="px-10 py-6 text-center">Status Protocol</th>
                       <th className="px-10 py-6 text-center">ETD Parameter</th>
                       <th className="px-10 py-6 text-right">Interface</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 bg-white">
                     {filteredProjects.map((project) => (
                       <tr key={project.id} className="hover:bg-slate-50 transition-all group">
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-6">
                               <div className="w-12 h-12 bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-black group-hover:text-white transition-all">
                                  <Clock size={18} strokeWidth={1.5} />
                               </div>
                               <div>
                                  <p className="text-[11px] font-black text-black uppercase tracking-widest mb-1">{project.title}</p>
                                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">ID: {project.id.slice(-8).toUpperCase()}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-10 py-8 text-center">
                            <span className={`px-4 py-2 border text-[9px] font-black uppercase tracking-widest ${getStatusStyle(project.status)}`}>
                               {project.status}
                            </span>
                         </td>
                         <td className="px-10 py-8 text-center">
                            <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">{new Date(project.deadline).toLocaleDateString()}</p>
                            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Calculated Delivery</p>
                         </td>
                         <td className="px-10 py-8 text-right">
                            <Link href={`/student/orders/${project.id}`}>
                               <button className="btn-outline px-6 py-3 text-[9px]">
                                  View Track
                               </button>
                            </Link>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                </table>
             ) : (
                <div className="py-40 flex flex-col items-center justify-center text-center px-10 bg-slate-50">
                   <div className="w-20 h-20 bg-white border border-slate-100 flex items-center justify-center text-slate-200 mb-10">
                      <Box size={32} strokeWidth={1} />
                   </div>
                   <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 italic">No project streams detected in the registry.</h3>
                   <Link href="/student/new-order" className="btn-classy px-12 py-6">
                      Initialize First Project
                   </Link>
                </div>
             )}
          </div>
        </main>
      </div>
    </div>
  );
}
