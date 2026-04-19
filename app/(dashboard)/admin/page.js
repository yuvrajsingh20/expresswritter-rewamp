"use client";
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import ProjectTable from '@/components/dashboard/ProjectTable';
import { 
  Users, Briefcase, TrendingUp, 
  Search, Bell, Plus, 
  BarChart3, Activity, PieChart,
  ChevronRight, ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const stats = [
    { label: 'Total Volume', value: '₹1.2M', growth: '+12.5%', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Projects', value: '42', growth: '+3', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Staff Online', value: '18', growth: 'Live', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Success Rate', value: '99.4%', growth: '+0.2%', icon: PieChart, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <Sidebar role="ADMIN" />
      
      <div className="flex-1 ml-64 flex flex-col">
        {/* Top Navigation */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="flex items-center gap-8">
            <h1 className="text-sm font-bold text-slate-800">System Overview</h1>
            <div className="relative hidden md:block w-72">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Search identifiers..." 
                 className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pl-12 pr-4 text-xs font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
               />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-[1px] bg-slate-100" />
            <div className="flex items-center gap-3">
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-slate-900">Yuvraj Singh</p>
                  <p className="text-[9px] font-medium text-slate-400">Master Admin</p>
               </div>
               <div className="w-10 h-10 bg-[#0a192f] rounded-lg flex items-center justify-center text-white font-bold text-xs">
                 YS
               </div>
            </div>
          </div>
        </header>

        <main className="p-10 max-w-7xl mx-auto w-full space-y-10">
          {/* Dashboard Summary Title */}
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Platform Pulse</h2>
            <p className="text-slate-400 text-sm font-medium">Real-time telemetry and operational metrics.</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="card-subtle p-8 space-y-6">
                <div className="flex justify-between items-start">
                   <div className={`w-12 h-12 ${stat.bg} ${stat.color} flex items-center justify-center rounded-xl`}>
                      <stat.icon size={22} />
                   </div>
                   <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${stat.growth.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                      {stat.growth}
                   </span>
                </div>
                <div>
                   <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{stat.label}</p>
                   <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Table Area */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-bold text-slate-800">Operational Queue</h3>
                <div className="flex gap-3">
                   <button className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">Export CSV</button>
                   <div className="w-[1px] h-4 bg-slate-200" />
                   <button className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest">Full Registry</button>
                </div>
              </div>
              <ProjectTable projects={projects} loading={loading} role="ADMIN" />
            </div>

            {/* Side Control Area */}
            <div className="space-y-8">
               <h3 className="text-lg font-bold text-slate-800 px-1">Quick Actions</h3>
               <div className="grid grid-cols-1 gap-4">
                  {[
                    { title: 'Add SubAdmin', desc: 'Board a new manager', icon: Users, path: '#' },
                    { title: 'New Freelancer', desc: 'Onboard writing expert', icon: Briefcase, path: '#' },
                    { title: 'System Reports', desc: 'Download pdf audit', icon: BarChart3, path: '#' },
                  ].map((item, i) => (
                    <button key={i} className="card-subtle p-6 flex items-center justify-between hover:bg-slate-50 transition-all group">
                       <div className="flex items-center gap-4 text-left">
                          <div className="w-10 h-10 bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 rounded-lg shadow-sm">
                             <item.icon size={18} />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-900">{item.title}</p>
                             <p className="text-[10px] font-medium text-slate-400">{item.desc}</p>
                          </div>
                       </div>
                       <ArrowRight size={16} className="text-slate-200 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
               </div>

               <div className="bg-[#0a192f] rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                  <TrendingUp className="text-blue-400 mb-6" size={32} />
                  <h3 className="text-xl font-bold mb-3">Institutional Scaling</h3>
                  <p className="text-slate-400 text-xs mb-8 leading-relaxed">Your current volume is up 40% this quarter. Consider adding more subject specialists to maintain throughput.</p>
                  <button className="w-full bg-blue-600 py-3 rounded-lg text-xs font-extrabold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40">
                     Recruitment Portal
                  </button>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
