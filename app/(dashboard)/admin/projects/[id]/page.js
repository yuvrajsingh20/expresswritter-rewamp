"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, UserMinus, ShieldAlert, 
  Activity, Clock, FileText, ChevronRight
} from 'lucide-react';

const ProjectBridgeManagement = ({ params }) => {
  const [participants, setParticipants] = useState([
    { id: 's1', name: 'Student (Client)', role: 'STUDENT', avatar: 'ST' },
    { id: 'f1', name: 'Rahul Kumar', role: 'FREELANCER', avatar: 'RK' },
  ]);

  const [availableHelpers, setAvailableHelpers] = useState([
    { id: 'h1', name: 'Sneha (Technical Expert)', role: 'HELPER' },
    { id: 'h2', name: 'Vikram (Quality Assurance)', role: 'HELPER' }
  ]);

  const injectHelper = (helper) => {
    setParticipants([...participants, { ...helper, avatar: helper.name[0] + helper.name[1] }]);
    setAvailableHelpers(availableHelpers.filter(h => h.id !== helper.id));
  };

  const removeParticipant = (id) => {
    if (id === 's1') return; // Cannot remove the student
    setParticipants(participants.filter(p => p.id !== id));
    // Add back to helpers if they were a helper
  };

  return (
    <div className="flex bg-[#f8f9fa] min-h-screen text-[#1d1d1f]">
      <Sidebar role="ADMIN" />
      
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Project Context Header */}
        <header className="p-6 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm z-20">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                 <ShieldAlert size={24} />
              </div>
              <div>
                 <h1 className="text-xl font-black tracking-tight italic uppercase">Eagle-Eye Bridge: Project #9281</h1>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Live Stealth Monitoring • Multi-Role Access</p>
              </div>
           </div>
           <div className="flex gap-6 pr-4">
              <div className="text-right">
                 <p className="text-xs font-black">2h 45m</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Avg Response</p>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <div className="text-right">
                 <p className="text-xs font-black text-green-500">Normal</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Latency</p>
              </div>
           </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
           {/* MAIN CHAT BRIDGE */}
           <div className="flex-1 p-6 relative">
              <ChatInterface role="ADMIN" />
           </div>

           {/* EAGLE EYE MANAGEMENT PANEL */}
           <aside className="w-96 bg-white border-l border-slate-100 flex flex-col p-8 gap-10 overflow-y-auto shadow-2xl">
              {/* Active Participants */}
              <section>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <Users size={14} /> Active In Bridge
                 </p>
                 <div className="space-y-4">
                    {participants.map((p) => (
                       <motion.div 
                        layout 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={p.id} 
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50"
                       >
                          <div className="flex items-center gap-4 text-center">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white italic ${p.role === 'STUDENT' ? 'bg-blue-500' : 'bg-[#1d1d1f]'}`}>
                                {p.avatar}
                             </div>
                             <div className="text-left">
                                <p className="text-xs font-black tracking-tight">{p.name}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{p.role}</p>
                             </div>
                          </div>
                          {p.role !== 'STUDENT' && (
                             <button 
                              onClick={() => removeParticipant(p.id)}
                              className="w-10 h-10 bg-red-50 text-red-400 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-inner"
                             >
                                <UserMinus size={18} />
                             </button>
                          )}
                       </motion.div>
                    ))}
                 </div>
              </section>

              {/* Inject Helper (Inject/Assign Logic) */}
              <section className="mt-4">
                 <p className="text-[10px] font-black text-[#0071e3] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <UserPlus size={14} /> Inject New Expert
                 </p>
                 <div className="space-y-3">
                    {availableHelpers.map((h) => (
                       <button 
                        key={h.id} 
                        onClick={() => injectHelper(h)}
                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-[1.5rem] group hover:border-[#0071e3] hover:shadow-lg transition-all text-left"
                       >
                          <div>
                            <p className="text-xs font-black text-slate-800 tracking-tight">{h.name}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1 tracking-widest cursor-default">Available for Injection</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0071e3] flex items-center justify-center group-hover:bg-[#0071e3] group-hover:text-white transition-all">
                             <ChevronRight size={16} />
                          </div>
                       </button>
                    ))}
                 </div>
              </section>

              {/* Project Stats Sidebar Card */}
              <div className="mt-auto p-6 bg-[#1d1d1f] rounded-[2rem] text-white">
                 <div className="flex items-center gap-3 mb-4">
                    <Activity size={18} className="text-blue-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Efficiency Log</p>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400">Word Count</span>
                        <span className="text-xs font-black">2,400 / 3,000</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400">Next Deadline</span>
                        <span className="text-xs font-black text-amber-400 italic">6h 12m</span>
                    </div>
                 </div>
              </div>
           </aside>
        </div>
      </main>
    </div>
  );
};

export default ProjectBridgeManagement;
