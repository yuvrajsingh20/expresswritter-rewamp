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

function OrderChatPanel({ order, onClose }) {
  const [tab, setTab] = useState('timeline');
  
  const TIMELINE = ['Order Placed', 'Writer Assigned', 'In Progress', 'Quality Check', 'Delivered'];
  const stepIdx = order.status === 'COMPLETED' ? 4 : order.status === 'ASSIGNED' ? 1 : 0;
  
  return (
    <div className="flex flex-col h-full bg-[#0d0d13] text-[#eefcfb]">
      {/* Header */}
      <div className="p-4 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-3">
        <button onClick={onClose} className="w-8 h-8 bg-[#161626] border border-[rgba(255,255,255,0.06)] rounded flex items-center justify-center text-[#6b9e9a]">
          ←
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm truncate">{order.title}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ 
              background: order.status === 'COMPLETED' ? 'rgba(34,197,94,0.12)' : 'rgba(13,148,136,0.12)',
              color: order.status === 'COMPLETED' ? '#22c55e' : '#0d9488'
            }}>{order.status}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#6b9e9a] mt-0.5">
            <span className="font-mono">{order.id}</span>
            <span>·</span>
            <span>Client: {order.student?.name || "N/A"}</span>
          </div>
        </div>
        <button className="h-8 px-4 bg-[#0d9488] text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-[#0f766e] transition-all">
          Accept Assignment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(255,255,255,0.06)] bg-[#101019]">
        {[['chat', '💬 Chat'], ['brief', '📋 Brief'], ['files', '📁 Files'], ['timeline', '📍 Timeline']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 text-xs font-medium transition-all border-b-2 ${tab === id ? 'border-[#0d9488] text-[#2dd4bf]' : 'border-transparent text-[#6b9e9a] hover:text-[#eefcfb]'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'timeline' && (
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#2dd4bf] mb-4">Order Timeline</h4>
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-[rgba(255,255,255,0.06)]" />
              {TIMELINE.map((step, i) => {
                const done = i < stepIdx;
                const active = i === stepIdx;
                return (
                  <div key={i} className="relative mb-6 last:mb-0">
                    <div className={`absolute -left-6 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${done ? 'bg-[#0d9488] text-white' : active ? 'bg-[#0d9488] text-white' : 'bg-[#161626] text-[#6b9e9a] border border-[rgba(255,255,255,0.06)]'}`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <div className="ml-2">
                      <div className={`text-xs font-medium ${done || active ? 'text-[#eefcfb]' : 'text-[#6b9e9a]'}`}>{step}</div>
                      {active && <div className="text-[10px] text-[#2dd4bf] mt-0.5">Current stage</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {tab === 'chat' && <div className="text-xs text-[#6b9e9a]">Chat content goes here...</div>}
        {tab === 'brief' && <div className="text-xs text-[#6b9e9a]">Brief content goes here...</div>}
        {tab === 'files' && <div className="text-xs text-[#6b9e9a]">Files content goes here...</div>}
      </div>
    </div>
  );
}

function OrderStrip({ order, isActive, onClick }) {
  // Fallback values to match design if data is missing
  const invoiceNum = order.id;
  const service = order.title || "Untitled Project";
  const client = order.student?.name || "Client #4204";
  const words = order.words || 800;
  const price = order.price || 144;
  const status = order.status || "New Order";
  const isUrgent = order.isUrgent || false;
  const hasNDA = order.hasNDA || true;
  const unreadMsgs = order.unreadMsgs || 0;
  const due = order.due || "Apr 24, 2026";

  const statusColors = {
    'New Order': { color: '#0d9488', bg: 'rgba(13,148,136,0.12)' },
    'In Progress': { color: '#0d9488', bg: 'rgba(13,148,136,0.12)' },
    'Quality Check': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    'Delivered': { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    'COMPLETED': { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    'ASSIGNED': { color: '#0d9488', bg: 'rgba(13,148,136,0.12)' },
  };

  const m = statusColors[status] || { color: '#6b9e9a', bg: 'rgba(255,255,255,0.06)' };

  return (
    <div onClick={onClick} className={`cursor-pointer rounded-lg border transition-all overflow-hidden mb-2 ${isActive ? 'border-[#0d9488] bg-[rgba(13,148,136,0.06)]' : 'border-[rgba(255,255,255,0.06)] bg-[#161626] hover:border-[rgba(13,148,136,0.3)] hover:bg-[#1c1c30]'}`}>
      <div style={{ height: 2, background: m.color, opacity: 0.7 }} />
      <div className="p-3">
        {/* Row 1 */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-[10px] text-[#6b9e9a] tracking-wider font-medium">{invoiceNum}</span>
          <div className="ml-auto flex items-center gap-1">
            {isUrgent && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[rgba(244,63,94,0.12)] text-[#f43f5e] border border-[rgba(244,63,94,0.2)] tracking-wider">⚡ URGENT</span>}
            {!isUrgent && <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(59,130,246,0.1)] text-[#60a5fa] border border-[rgba(59,130,246,0.15)]">📅 {due}</span>}
            {hasNDA && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[rgba(139,92,246,0.1)] text-[#a78bfa] border border-[rgba(139,92,246,0.2)]">🔒 NDA</span>}
          </div>
        </div>

        {/* Row 2 */}
        <div className="mb-2">
          <div className="font-semibold text-[13px] mb-0.5 truncate text-[#eefcfb]">{service}</div>
          <div className="flex items-center gap-2 text-[11px] text-[#6b9e9a]">
            <span className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded bg-[rgba(13,148,136,0.2)] flex items-center justify-center text-[8px] text-[#2dd4bf]">🛡</span>
              {client}
            </span>
            <span className="text-[#334e4c]">·</span>
            <span className="text-[#334e4c]">{words.toLocaleString()} words · ${price}</span>
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: m.bg, color: m.color }}>{status}</span>
          {unreadMsgs > 0 && (
            <div className="ml-auto flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(13,148,136,0.18)] text-[#2dd4bf]">
              💬 {unreadMsgs} new
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FreelancerDashboardClient({ session, profile }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
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
      <div className="flex-1 md:ml-64 flex flex-col bg-[#FBFBFB] min-h-screen text-[#111111]">
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
    <div className="flex-1 md:ml-64 flex flex-col bg-[#FBFBFB] min-h-screen text-[#111111]">
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

        <div className="flex h-[calc(100vh-12rem)] border border-[rgba(255,255,255,0.06)] rounded-lg overflow-hidden bg-[#101019] mt-6">
           {/* Orders List */}
           <div className={`${selectedOrder ? 'w-1/3' : 'w-full'} border-r border-[rgba(255,255,255,0.06)] flex flex-col`}>
             {/* Header */}
             <div className="p-4 border-b border-[rgba(255,255,255,0.06)] bg-[#101019]">
               <div className="flex items-center justify-between mb-3">
                 <h2 className="text-sm font-bold uppercase tracking-wider text-[#eefcfb]">Orders</h2>
                 <div className="flex gap-2">
                   <button className="text-xs text-[#6b9e9a] hover:text-[#eefcfb]">All</button>
                   <button className="text-xs text-[#6b9e9a] hover:text-[#eefcfb]">Active</button>
                 </div>
               </div>
               <div className="relative">
                 <input placeholder="Search orders..." className="w-full bg-[#161626] border border-[rgba(255,255,255,0.06)] rounded px-3 py-1.5 text-xs text-[#eefcfb] outline-none focus:border-[#0d9488]" />
               </div>
             </div>

             {/* List */}
             <div className="flex-1 overflow-y-auto p-2 space-y-2">
               {tasks.length > 0 ? tasks.map((task) => (
                 <OrderStrip key={task.id} order={task} isActive={selectedOrder?.id === task.id} onClick={() => setSelectedOrder(task)} />
               )) : (
                 <div className="text-center p-4 text-xs text-[#6b9e9a]">No orders</div>
               )}
             </div>
           </div>

           {/* Details / Chat */}
           {selectedOrder ? (
             <div className="flex-1">
               <OrderChatPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} />
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-[#6b9e9a] bg-[#0d0d13]">
               <div className="text-3xl mb-2">💬</div>
               <div className="text-xs font-medium">Select an order to view details</div>
               <div className="text-[10px] opacity-60 mt-0.5">All conversations are secured</div>
             </div>
           )}
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
