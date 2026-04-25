"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Sidebar from '@/components/dashboard/Sidebar';
import { 
  MessageSquare, Search, Filter, 
  ChevronRight, Clock, User, 
  ExternalLink, Briefcase, Info
} from 'lucide-react';
import Link from 'next/link';

export default function FreelancerChatInbox() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (Array.isArray(data)) {
          // Filter projects that have chats or are active
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to fetch projects for chat:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex bg-[#FBFBFB] min-h-screen text-[#111111]">
      <Sidebar role="FREELANCER" />
      
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-8 shrink-0">
             <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Communication Hub</span>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Client Stream</span>
             </div>
          </header>

          <main className="flex-1 overflow-hidden flex flex-col p-8 space-y-6">
             <div className="flex justify-between items-end">
                <div>
                   <h1 className="text-2xl font-bold text-slate-900">Secure Inbox</h1>
                   <p className="text-sm text-slate-500 mt-1">Direct communication lines with your active students.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search by case or student..." 
                            className="h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-sm text-xs focus:ring-1 focus:ring-[#002D5B] outline-none w-64 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
             </div>

             <div className="flex-1 bg-white border border-[#E5E5E5] rounded-sm shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[#E5E5E5] bg-slate-50/50 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Active Thread</div>
                    <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case Type</div>
                    <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Activity</div>
                    <div className="col-span-2 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Action</div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="h-full flex items-center justify-center opacity-30">
                            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                        </div>
                    ) : filteredProjects.length > 0 ? (
                        filteredProjects.map((proj) => (
                            <Link 
                                key={proj.id}
                                href={`/freelancer/projects/${proj.id}`}
                                className="grid grid-cols-12 gap-4 items-center p-4 border-b border-slate-50 hover:bg-slate-50 transition-all group"
                            >
                                <div className="col-span-5 px-4 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#0067B8]/5 text-[#0067B8] rounded-sm flex items-center justify-center group-hover:bg-[#0067B8] group-hover:text-white transition-all">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">{proj.title}</h4>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Client ID: {proj.studentId.slice(-6).toUpperCase()}</p>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-sm text-[9px] font-bold uppercase tracking-wider">
                                        {proj.serviceType}
                                    </span>
                                </div>
                                <div className="col-span-3 flex items-center gap-2">
                                    <Clock size={12} className="text-slate-400" />
                                    <span className="text-[11px] text-slate-600 font-medium">Just now</span>
                                </div>
                                <div className="col-span-2 px-4 flex justify-end">
                                    <div className="h-8 px-4 bg-white border border-slate-200 rounded-sm text-[9px] font-bold uppercase tracking-widest text-[#002D5B] flex items-center gap-2 group-hover:bg-[#002D5B] group-hover:text-white transition-all">
                                        Open Chat <ExternalLink size={10} />
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                            <MessageSquare size={48} className="mb-4 text-slate-300" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Inbox Empty</h3>
                            <p className="text-xs mt-1 uppercase tracking-wider font-medium max-w-xs">No active conversation streams detected in your workspace.</p>
                        </div>
                    )}
                </div>
                
                <div className="p-6 bg-slate-50/50 border-t border-[#E5E5E5] flex items-center gap-4">
                    <Info size={16} className="text-[#0067B8]" />
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Communication is monitored to ensure quality and compliance with platform standards.</p>
                </div>
             </div>
          </main>
      </div>
    </div>
  );
}
