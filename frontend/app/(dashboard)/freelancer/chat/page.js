"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Sidebar from '@/components/dashboard/Sidebar';
import { 
  MessageSquare, Search, Filter, 
  ChevronRight, Clock, User, 
  ExternalLink, Briefcase, Info,
  ShieldCheck, Send, Paperclip, X
} from 'lucide-react';
import Link from 'next/link';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

export default function FreelancerChatInbox() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState('CLIENT'); // CLIENT or ADMIN
  
  // Admin Chat State
  const [adminMessages, setAdminMessages] = useState([]);
  const [adminInput, setAdminInput] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (Array.isArray(data)) setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchAdminMessages = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/messages?senderId=${session.user.id}&type=ADMIN_CHAT`);
        const data = await res.json();
        setAdminMessages(data);
      } catch (e) { console.error(e); }
    };
    fetchAdminMessages();
  }, [session?.user?.id]);

  useEffect(() => {
    if (socket && session?.user?.id) {
       socket.emit('join_chat', { userId: session.user.id, role: 'FREELANCER' });
       socket.on('receive_message', (data) => {
          if (data.chatType === 'ADMIN_CHAT') {
             setAdminMessages(prev => [...prev, data]);
          }
       });
    }
    return () => socket?.off('receive_message');
  }, [socket, session?.user?.id]);

  const handleSendAdminMessage = async () => {
    if (!adminInput.trim() || !session?.user?.id) return;
    const content = adminInput;
    setAdminInput("");
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          chatType: 'ADMIN_CHAT',
          receiverId: null // Changed from 'ADMIN' to null
        })
      });
      if (res.ok) {
        const saved = await res.json();
        setAdminMessages(prev => [...prev, saved]);
        if (socket) {
           socket.emit('send_message', {
              id: saved.id,
              content: saved.content,
              senderId: session.user.id,
              receiverId: null, // Broadcast to all admins
              senderRole: 'FREELANCER',
              chatType: 'ADMIN_CHAT'
           });
        }
      }
    } catch (e) { console.error(e); }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex bg-[#FBFBFB] min-h-screen text-[#111111]">
      <Sidebar role="FREELANCER" />
      
      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
          <header className="h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-8 shrink-0">
             <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Communication Hub</span>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">{activeTab === 'CLIENT' ? 'Client Stream' : 'Admin Stealth Stream'}</span>
             </div>
             <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setActiveTab('CLIENT')}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${activeTab === 'CLIENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Client
                </button>
                <button 
                  onClick={() => setActiveTab('ADMIN')}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${activeTab === 'ADMIN' ? 'bg-[#002D5B] text-white shadow-sm' : 'text-slate-400'}`}
                >
                  Admin
                </button>
             </div>
          </header>

          <main className="flex-1 overflow-hidden flex flex-col p-8 space-y-6 bg-slate-50/30">
             {activeTab === 'CLIENT' ? (
                <>
                  <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Secure Inbox</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium italic">Direct encrypted communication with your active students.</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Find Case ID..." 
                            className="h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs focus:ring-4 focus:ring-blue-50 outline-none w-64 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                  </div>

                  <div className="flex-1 bg-white border border-[#E5E5E5] rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
                      <div className="p-6 border-b border-[#E5E5E5] bg-slate-50/50 grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-5 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Active Thread</div>
                          <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Case Type</div>
                          <div className="col-span-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Activity</div>
                          <div className="col-span-2 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Action</div>
                      </div>

                      <div className="flex-1 overflow-y-auto">
                          {loading ? (
                              <div className="h-full flex items-center justify-center py-20">
                                  <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                              </div>
                          ) : filteredProjects.length > 0 ? (
                              filteredProjects.map((proj) => (
                                  <Link 
                                      key={proj.id}
                                      href={`/freelancer/projects/${proj.id}`}
                                      className="grid grid-cols-12 gap-4 items-center p-8 border-b border-slate-50 hover:bg-slate-50/50 transition-all group"
                                  >
                                      <div className="col-span-5 px-4 flex items-center gap-6">
                                          <div className="w-12 h-12 bg-white border border-slate-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                              <User size={20} />
                                          </div>
                                          <div>
                                              <h4 className="text-[15px] font-black text-slate-900 leading-snug">{proj.title}</h4>
                                              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">NODE: #{proj.studentId.slice(-6).toUpperCase()}</p>
                                          </div>
                                      </div>
                                      <div className="col-span-2">
                                          <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-black uppercase tracking-widest border border-blue-100">
                                              {proj.serviceType}
                                          </span>
                                      </div>
                                      <div className="col-span-3 flex items-center gap-2">
                                          <Clock size={14} className="text-slate-400" />
                                          <span className="text-[12px] text-slate-500 font-black uppercase tracking-widest italic">Live Stream</span>
                                      </div>
                                      <div className="col-span-2 px-4 flex justify-end">
                                          <div className="h-10 px-6 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#002D5B] flex items-center gap-2 group-hover:bg-[#002D5B] group-hover:text-white transition-all shadow-sm">
                                              OPEN <ChevronRight size={14} />
                                          </div>
                                      </div>
                                  </Link>
                              ))
                          ) : (
                              <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-40">
                                  <MessageSquare size={48} className="mb-6 text-slate-300" />
                                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 tracking-wider">Inbox Empty</h3>
                                  <p className="text-[10px] mt-2 uppercase tracking-widest font-bold max-w-xs">No active conversation nodes detected.</p>
                              </div>
                          )}
                      </div>
                  </div>
                </>
             ) : (
                <div className="flex-1 flex gap-8 h-full overflow-hidden">
                   {/* Admin Chat Sidebar (List of system messages) */}
                   <div className="w-80 bg-white border border-slate-100 rounded-[2rem] flex flex-col p-6 shadow-xl shadow-slate-200/30 overflow-hidden shrink-0">
                      <div className="flex items-center gap-4 mb-8 px-2">
                         <div className="w-12 h-12 bg-[#002D5B] text-white rounded-2xl flex items-center justify-center">
                            <ShieldCheck size={24} />
                         </div>
                         <div>
                            <h3 className="text-sm font-black uppercase tracking-tight">System Comms</h3>
                            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Admin Online</p>
                         </div>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-4">
                         <button className="w-full p-4 bg-blue-50 border border-blue-100 rounded-2xl text-left transition-all">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Direct Line</p>
                            <p className="text-[11px] font-bold text-slate-800">Master Admin Feedback</p>
                            <p className="text-[8px] text-slate-400 mt-2 uppercase font-black tracking-widest">Active Thread</p>
                         </button>
                      </div>
                   </div>

                   {/* Admin Chat Window */}
                   <div className="flex-1 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden relative">
                      <header className="p-8 border-b border-slate-50 bg-white/50 backdrop-blur-md flex justify-between items-center shrink-0">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                               <User size={20} />
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-tight">Master Admin Chat</h4>
                         </div>
                         <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                            Secure Tunnel
                         </div>
                      </header>

                      <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/20">
                         {adminMessages.map((msg, i) => {
                            const isMe = msg.senderId === session?.user?.id;
                            return (
                               <motion.div 
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 key={msg.id || i} 
                                 className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                               >
                                  <div className={`max-w-[70%] space-y-2 ${isMe ? 'items-end' : 'items-start'}`}>
                                     <div className={`p-6 rounded-[2rem] text-xs font-bold shadow-sm ${
                                        isMe 
                                         ? 'bg-[#1d1d1f] text-white rounded-tr-none' 
                                         : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                                     }`}>
                                        {msg.content}
                                     </div>
                                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2">
                                        {isMe ? 'YOU' : 'ADMIN'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                     </p>
                                  </div>
                               </motion.div>
                            )
                         })}
                      </div>

                      <div className="p-8 border-t border-slate-50 shrink-0">
                         <div className="bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-4 flex items-center gap-6 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-200 transition-all">
                            <button className="text-slate-300 hover:text-blue-500 transition-colors">
                               <Paperclip size={20} />
                            </button>
                            <input 
                              type="text" 
                              value={adminInput}
                              onChange={(e) => setAdminInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendAdminMessage()}
                              placeholder="Type message to Admin..." 
                              className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-black placeholder:text-slate-300 italic"
                            />
                            <button 
                              onClick={handleSendAdminMessage}
                              className="bg-[#002D5B] text-white p-4 rounded-2xl shadow-xl shadow-blue-900/20 hover:scale-110 active:scale-95 transition-all"
                            >
                               <Send size={20} />
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
             )}
          </main>
      </div>
    </div>
  );
}
