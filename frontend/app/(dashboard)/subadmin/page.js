"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/dashboard/Sidebar';
import ProjectTable from '@/components/dashboard/ProjectTable';
import { 
  Users, Briefcase, MessageSquare, 
  Search, Bell, Filter, Clock,
  ChevronRight, Calendar, UserPlus,
  ArrowUpRight
} from 'lucide-react';

export default function SubAdminDashboard() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        const res = await fetch('/api/projects', { signal: controller.signal });
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name !== 'AbortError') console.error("Failed to fetch projects:", error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const stats = useMemo(() => [
    { label: 'Pending Assignment', value: projects.filter(p => p.status === 'CREATED').length || '12', icon: UserPlus, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Drafts', value: projects.filter(p => p.status === 'ASSIGNED').length || '28', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Urgent Replies', value: '5', icon: MessageSquare, color: 'text-rose-600', bg: 'bg-rose-50' },
  ], [projects]);

  if (loading) {
    return (
      <div className="flex bg-[#f8fafc] min-h-screen">
        <div className="w-64 bg-white border-r border-slate-200 p-6">
          <div className="w-10 h-10 bg-[#002D5B] rounded-lg mb-8" />
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}
          </div>
        </div>
        <div className="flex-1 p-10">
          <div className="h-8 w-48 bg-slate-200 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-3 gap-6 mb-8">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
              <div className="h-4 w-24 bg-slate-100 rounded mb-4" />
              <div className="h-8 w-16 bg-slate-100 rounded" />
            </div>)}
          </div>
          <div className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <Sidebar role="SUB_ADMIN" />
      
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* SubAdmin Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-10 sticky top-0 z-10 transition-all">
          <div className="flex items-center gap-6">
            <h1 className="text-sm font-bold text-slate-800">Team Management</h1>
            <div className="h-6 w-[1px] bg-slate-100" />
            <div className="flex items-center gap-2 text-slate-400">
               <Calendar size={14} />
               <span className="text-[10px] font-bold uppercase tracking-wider">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="p-2.5 bg-slate-50 border border-slate-100 text-slate-400 hover:text-blue-600 rounded-lg transition-all">
               <Bell size={18} />
            </button>
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px]">SA</div>
               <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest hidden sm:block">Manager Access</p>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-10 max-w-7xl mx-auto w-full space-y-6 md:space-y-10">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Team Overview</h2>
            <p className="text-slate-400 text-sm font-medium">Monitoring active drafting cycles and resource allocation.</p>
          </div>

          {/* Compact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="card-subtle p-6 flex items-center gap-5">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} flex items-center justify-center rounded-xl`}>
                   <stat.icon size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-extrabold text-slate-900 leading-none">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Project List Area */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-bold text-slate-800">Managed Project Log</h3>
                <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                   <button className="px-4 py-2 text-[10px] font-bold text-blue-600 bg-blue-50 rounded-md">All Streams</button>
                   <button className="px-4 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600">Pending</button>
                </div>
              </div>
              <ProjectTable projects={projects} loading={loading} role="SUB_ADMIN" />
            </div>

            {/* Manager Toolkit Area */}
            <div className="space-y-6">
               <h3 className="text-lg font-bold text-slate-800 px-1">Manager Toolkit</h3>
               <div className="card-subtle p-6 space-y-8">
                  <div className="space-y-4">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">System Health</p>
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <div className="flex justify-between text-[11px] font-bold text-slate-700">
                             <span>Assignment Rate</span>
                             <span>84%</span>
                           </div>
                           <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 w-[84%] transition-all duration-1000" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between text-[11px] font-bold text-slate-700">
                             <span>QA Completion</span>
                             <span>92%</span>
                           </div>
                           <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 w-[92%] transition-all duration-1000" />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4 border-t border-slate-50 pt-8">
                     <button className="w-full btn-primary py-3">
                        <UserPlus size={16} /> Broadcast New Slot
                     </button>
                     <button className="w-full btn-outline py-3">
                        Generate Team Audit
                     </button>
                  </div>
               </div>

               <div className="card-subtle p-6 bg-blue-600 text-white group cursor-pointer overflow-hidden relative">
                  <div className="relative z-10">
                    <h4 className="text-base font-bold mb-2">Live Chat Hub</h4>
                    <p className="text-white/70 text-xs mb-6">3 writers are waiting for project clarification.</p>
                    <div className="inline-flex items-center gap-2 text-xs font-bold bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all">
                      Open Communication Pane <ArrowUpRight size={14} />
                    </div>
                  </div>
                  <MessageSquare className="absolute bottom-[-20px] right-[-20px] text-white/5 w-32 h-32 transform rotate-12" />
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
