"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, CheckCircle, Clock, 
  DollarSign, Star, Zap, ChevronRight,
  Filter, Download, ArrowUpRight
} from 'lucide-react';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import servicesData from '@/data/services_data.json';

const SERVICES = Object.values(servicesData.individualServices).flat();
const getServiceName = (id) => SERVICES.find(s => s.id === id)?.name || id;

export default function FreelancerDashboardClient({ session, profile }) {
  const [tasks, setTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' or 'AVAILABLE'
  const [newAssignmentNotification, setNewAssignmentNotification] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [activeRes, availableRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/projects/available')
      ]);
      
      const activeData = await activeRes.json();
      const availableData = await availableRes.json();

      if (Array.isArray(activeData)) setTasks(activeData);
      if (Array.isArray(availableData)) setAvailableTasks(availableData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile.isVerified) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [profile.isVerified]);

  useEffect(() => {
    if (session?.user?.id && profile.isVerified) {
      const socket = io();
      socket.emit('join_chat', { userId: session.user.id, role: 'FREELANCER' });
      
      socket.on('new_assignment', (data) => {
        setNewAssignmentNotification(data);
        fetchAllData(); // Refresh the list
      });
      
      return () => socket.disconnect();
    }
  }, [session?.user?.id, profile.isVerified]);

  const handleClaim = async (projectId) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerId: session.user.id, status: 'ASSIGNED' })
      });

      if (res.ok) {
        const claimedTask = availableTasks.find(t => t.id === projectId);
        setAvailableTasks(prev => prev.filter(t => t.id !== projectId));
        setTasks(prev => [{ ...claimedTask, status: 'ASSIGNED', freelancerId: session.user.id }, ...prev]);
        setActiveTab('ACTIVE');
      }
    } catch (error) {
      console.error("Failed to claim project:", error);
    }
  };

  if (!profile.isVerified) {
    return (
      <div className="flex-1 ml-64 flex flex-col bg-[#FBFBFB] min-h-screen text-[#111111]">
        <main className="flex-1 flex flex-col items-center justify-center p-10 max-w-2xl mx-auto text-center space-y-8">
           <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center shadow-xl shadow-amber-500/10 animate-bounce">
              <Clock size={48} />
           </div>
           <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 italic uppercase">Account Under Review.</h1>
              <p className="text-slate-500 font-medium leading-relaxed">
                Welcome to the elite panel, <span className="text-slate-900 font-bold">{session?.user?.name}</span>. Our administrators are currently verifying your credentials and expertise dossier.
              </p>
           </div>
           <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm w-full">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Protocol Timeline</p>
              <p className="text-lg font-bold text-slate-900">System clearance expected within <span className="text-blue-600 italic">24 Hours</span></p>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-300">You will receive an encrypted notification once verified.</p>
        </main>
      </div>
    );
  }

  const stats = [
    { title: 'Active Tasks', count: tasks.filter(t => t.status !== 'COMPLETED').length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Earnings', count: '₹0', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Avg Rating', count: profile.rating?.toFixed(1) || '5.0', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="flex-1 ml-64 flex flex-col bg-[#FBFBFB] min-h-screen text-[#111111]">
      <header className="h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-3">
           <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Workspace</span>
           <ChevronRight size={14} className="text-slate-300" />
           <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Expert Console</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-sm text-[10px] font-bold">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {profile.availability ? 'ONLINE & ACTIVE' : 'OFFLINE'}
           </div>
        </div>
      </header>

      <main className="p-10 max-w-7xl mx-auto w-full space-y-10">
        {/* Header Section */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {session?.user?.name || "Freelancer"}</h1>
            <p className="text-sm text-slate-500 mt-1">Here is what is happening with your projects today.</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 border border-[#CCCCCC] rounded-sm text-xs font-semibold hover:bg-white hover:border-slate-400 transition-all">
                <Clock size={14} /> Refresh Sync
             </button>
             <button className="flex items-center gap-2 px-6 py-2 bg-[#002D5B] text-white rounded-sm text-sm font-semibold hover:bg-[#001D3D] transition-all">
                Withdraw Funds
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {stats.map((stat) => (
             <div 
               key={stat.title}
               className="bg-white p-6 border border-[#E5E5E5] rounded-sm shadow-sm hover:border-slate-300 transition-all flex items-center gap-5"
             >
               <div className={`w-12 h-12 ${stat.bg} ${stat.color} flex items-center justify-center rounded-sm`}>
                  <stat.icon size={20} />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.count}</p>
               </div>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-6">
           {/* Task Queue */}
           <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                 <div className="flex gap-8">
                    <button 
                      onClick={() => setActiveTab('ACTIVE')}
                      className={`text-[11px] font-black uppercase tracking-widest pb-4 -mb-[17px] border-b-2 transition-all ${activeTab === 'ACTIVE' ? 'border-[#002D5B] text-[#002D5B]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                       Active Queue ({tasks.length})
                    </button>
                    <button 
                      onClick={() => setActiveTab('AVAILABLE')}
                      className={`text-[11px] font-black uppercase tracking-widest pb-4 -mb-[17px] border-b-2 transition-all ${activeTab === 'AVAILABLE' ? 'border-[#002D5B] text-[#002D5B]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                       Available Streams ({availableTasks.length})
                    </button>
                 </div>
              </div>

              <div className="space-y-4 pt-4">
                  {activeTab === 'ACTIVE' ? (
                    tasks.length > 0 ? tasks.map((task) => (
                      <div key={task.id} className="group bg-white p-6 border border-[#E5E5E5] rounded-sm hover:border-[#0067B8] transition-all shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-sm text-slate-400 group-hover:bg-[#0067B8]/5 group-hover:text-[#0067B8] transition-colors">
                             <Briefcase size={18} />
                          </div>
                          <div>
                             <div className="flex items-center gap-3">
                                <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                   task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                                   task.status === 'ASSIGNED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                  {task.status}
                                </span>
                             </div>
                             <div className="flex gap-4 mt-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getServiceName(task.serviceType)}</p>
                                <span className="text-[10px] text-slate-200">|</span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  <Clock size={10} /> INITIATED: {new Date(task.createdAt).toLocaleDateString()}
                                </p>
                                <span className="text-[10px] text-slate-200">|</span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  <Clock size={10} /> DL: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                                </p>
                             </div>
                          </div>
                        </div>
                        <a 
                          href={`/freelancer/projects/${task.id}`}
                          className="h-9 px-4 flex items-center gap-2 border border-[#E5E5E5] rounded-sm text-[10px] font-bold uppercase tracking-widest hover:border-[#0067B8] hover:text-[#0067B8] transition-all"
                        >
                          Manage <ChevronRight size={14} />
                        </a>
                      </div>
                    )) : (
                      <div className="bg-white border border-[#E5E5E5] border-dashed p-16 rounded-sm flex flex-col items-center justify-center text-center">
                         <div className="w-12 h-12 bg-slate-50 rounded-sm flex items-center justify-center mb-4 text-slate-300">
                            <Briefcase size={24} />
                         </div>
                         <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No assigned projects</p>
                         <p className="text-xs text-slate-300 mt-1 uppercase tracking-wider font-medium">Monitoring for new submissions...</p>
                      </div>
                    )
                  ) : (
                    availableTasks.length > 0 ? availableTasks.map((task) => (
                      <div key={task.id} className="group bg-white p-6 border border-[#E5E5E5] rounded-sm hover:border-[#0067B8] transition-all shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-10 h-10 bg-blue-50/50 flex items-center justify-center rounded-sm text-[#0067B8]">
                             <Zap size={18} />
                          </div>
                          <div>
                             <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                             <div className="flex gap-4 mt-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getServiceName(task.serviceType)}</p>
                                <span className="text-[10px] text-slate-200">|</span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  INITIATED: {new Date(task.createdAt).toLocaleDateString()}
                                </p>
                                <span className="text-[10px] text-slate-200">|</span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client: {task.student?.name}</p>
                             </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleClaim(task.id)}
                          className="h-9 px-6 bg-[#002D5B] text-white rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-[#001D3D] transition-all"
                        >
                          Claim Project
                        </button>
                      </div>
                    )) : (
                      <div className="bg-white border border-[#E5E5E5] border-dashed p-16 rounded-sm flex flex-col items-center justify-center text-center">
                         <div className="w-12 h-12 bg-slate-50 rounded-sm flex items-center justify-center mb-4 text-slate-300">
                            <Zap size={24} />
                         </div>
                         <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No available streams</p>
                         <p className="text-xs text-slate-300 mt-1 uppercase tracking-wider font-medium">All projects are currently under specialist management.</p>
                      </div>
                    )
                  )}
              </div>
           </div>

           {/* Sidebar Info Cards */}
           <div className="space-y-6">
              <div className="bg-[#002D5B] rounded-sm p-8 text-white flex flex-col justify-between shadow-lg relative overflow-hidden h-[380px]">
                 <div className="relative z-10">
                    <div className="w-10 h-10 bg-white/10 rounded-sm flex items-center justify-center mb-8">
                       <Zap className="text-blue-300" size={20} />
                    </div>
                    <h3 className="text-lg font-bold mb-3">Writer Guidelines</h3>
                    <p className="text-blue-100/60 text-xs leading-relaxed mb-8">Ensure all deliverables follow IEEE/APA academic formatting standards. 98% accuracy is required for ELITE status.</p>
                    
                    <div className="space-y-3">
                       <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-sm border border-white/5 hover:bg-white/10 transition-all group">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-100">Quality Checklist</span>
                          <ArrowUpRight size={14} className="text-blue-300 opacity-50 group-hover:opacity-100" />
                       </button>
                       <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-sm border border-white/5 hover:bg-white/10 transition-all group">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-100">Project Templates</span>
                          <Download size={14} className="text-blue-300 opacity-50 group-hover:opacity-100" />
                       </button>
                    </div>
                 </div>
              </div>

              {/* Verified Badge */}
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-sm flex items-center gap-4">
                 <div className="p-2 bg-emerald-500 text-white rounded-sm">
                    <CheckCircle size={18} />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Verified Identity</p>
                    <p className="text-[10px] text-emerald-700 font-medium">Full access to high-priority stream enabled.</p>
                 </div>
              </div>
           </div>
        </div>
      </main>

      {/* New Assignment Notification Modal */}
      <AnimatePresence>
        {newAssignmentNotification && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-12 right-12 z-[110]"
          >
            <div className="bg-[#002D5B] text-white p-6 rounded-2xl shadow-2xl border-t-4 border-blue-400 min-w-[340px] flex flex-col gap-4">
               <div className="flex items-start gap-4">
                 <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Zap size={24} className="text-blue-400" />
                 </div>
                 <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-1">New Allocation</h5>
                    <p className="text-sm font-bold text-slate-100">{newAssignmentNotification.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{newAssignmentNotification.projectName}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3 pt-2">
                 <a 
                   href={`/freelancer/projects/${newAssignmentNotification.projectId}`}
                   className="flex-1 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all"
                 >
                   Open Console
                 </a>
                 <button 
                   onClick={() => setNewAssignmentNotification(null)}
                   className="flex-1 h-10 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all"
                 >
                   Dismiss
                 </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
