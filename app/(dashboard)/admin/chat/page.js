"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Paperclip, Hash, Users, 
  MessageCircle, Search, MoreVertical,
  CheckCheck, Sidebar as SidebarIcon,
  Phone, Video, Info
} from 'lucide-react';

const AdminChatHub = () => {
  const [activeChannel, setActiveChannel] = useState({ id: 'global', name: 'Global Expert Team', type: 'group' });
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const res = await fetch('/api/admin/freelancers');
        const data = await res.json();
        setFreelancers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch freelancers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancers();
  }, []);

  const channels = [
    { id: 'global', name: 'Global Expert Team', unread: 0, type: 'group' },
    { id: 'strategy', name: 'Admin Strategy', unread: 0, type: 'group' },
  ];

  const messages = [
    { id: 1, sender: 'System', text: 'Welcome to the Secure Communication Bridge.', time: 'System', type: 'incoming' },
  ];

  return (
    <div className="flex bg-[#f8f9fa] min-h-screen text-[#1d1d1f]">
      <Sidebar role="ADMIN" />
      
      <main className="flex-1 ml-64 flex bg-white overflow-hidden m-4 rounded-[3rem] border border-slate-100 shadow-2xl">
        {/* Chat Sidebar */}
        <div className="w-80 border-r border-slate-50 flex flex-col bg-slate-50/30">
           <div className="p-8 pb-4">
              <h1 className="text-xl font-black tracking-tight mb-6 italic">Communication</h1>
              <div className="relative group">
                 <Search className="absolute left-4 top-3 text-slate-400" size={16} />
                 <input type="text" placeholder="Find thread..." className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>
           </div>

           <nav className="flex-1 overflow-y-auto px-4 pb-8 space-y-8">
              {/* Common Groups */}
              <div>
                 <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex justify-between items-center">
                    Groups <Users size={12} />
                 </p>
                 <div className="space-y-1">
                    {channels.map(ch => (
                       <button 
                        key={ch.id} 
                        onClick={() => setActiveChannel(ch)}
                        className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all ${activeChannel.id === ch.id ? 'bg-white shadow-xl shadow-slate-200/50 text-blue-600' : 'text-slate-500 hover:bg-white/50'}`}
                       >
                          <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-xl ${activeChannel.id === ch.id ? 'bg-blue-50' : 'bg-slate-100'}`}>
                                <Hash size={16} />
                             </div>
                             <span className="text-[11px] font-black uppercase tracking-wider">{ch.name}</span>
                          </div>
                          {ch.unread > 0 && <span className="bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-full">{ch.unread}</span>}
                       </button>
                    ))}
                 </div>
              </div>

              {/* Direct Messages */}
              <div>
                 <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex justify-between items-center">
                    Direct Feedback <MessageCircle size={12} />
                 </p>
                  <div className="space-y-1">
                    {freelancers.map(dm => (
                       <button 
                         key={dm.id} 
                         onClick={() => setActiveChannel({ ...dm, type: 'direct' })}
                         className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${activeChannel.id === dm.id ? 'bg-white shadow-xl shadow-slate-200/50 text-blue-600' : 'text-slate-500 hover:bg-white/50'}`}
                       >
                          <div className="relative">
                             <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400 italic">
                                {(dm.name || 'U')[0]}
                             </div>
                             <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${dm.freelancerProfile?.availability ? 'bg-green-500' : 'bg-slate-300'}`} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-wider">{dm.name}</span>
                       </button>
                    ))}
                 </div>
              </div>
           </nav>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
           {/* Chat Header */}
           <header className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-md">
              <div className="flex items-center gap-4 text-center mx-auto lg:mx-0">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    {activeChannel.type === 'group' ? <Hash size={24} /> : <MessageCircle size={24} />}
                 </div>
                 <div className="text-left">
                    <h2 className="text-lg font-black tracking-tight italic uppercase">{activeChannel.name}</h2>
                    <p className="text-[10px] font-black text-green-500 tracking-[0.2em]">{activeChannel.type === 'group' ? '24 Experts Connected' : 'End-to-End Encrypted'}</p>
                 </div>
              </div>
              <div className="hidden lg:flex gap-3 text-slate-400">
                 <button className="p-3 hover:bg-slate-50 rounded-xl transition-all"><Phone size={20} /></button>
                 <button className="p-3 hover:bg-slate-50 rounded-xl transition-all"><Video size={20} /></button>
                 <button className="p-3 hover:bg-slate-50 rounded-xl transition-all"><Info size={20} /></button>
              </div>
           </header>

           {/* Messages Scroll Area */}
           <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/20">
              {messages.map(msg => (
                 <div key={msg.id} className={`flex ${msg.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] space-y-2 ${msg.type === 'outgoing' ? 'items-end' : 'items-start'}`}>
                       {msg.type === 'incoming' && <p className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1">{msg.sender}</p>}
                       <div className={`p-6 rounded-[2rem] text-sm font-bold shadow-sm ${
                          msg.type === 'outgoing' 
                           ? 'bg-[#1d1d1f] text-white rounded-tr-none' 
                           : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                       }`}>
                          {msg.text}
                       </div>
                       <p className={`text-[8px] font-black text-slate-300 uppercase flex items-center gap-2 ${msg.type === 'outgoing' ? 'justify-end mr-2' : 'ml-2'}`}>
                          {msg.time} {msg.type === 'outgoing' && <CheckCheck size={12} className="text-blue-500" />}
                       </p>
                    </div>
                 </div>
              ))}
           </div>

           {/* Chat Input Bar */}
           <div className="p-8 border-t border-slate-50">
              <div className="bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-4 flex items-center gap-6 group focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-200 transition-all">
                 <button className="text-slate-400 hover:text-blue-500 transition-colors">
                    <Paperclip size={20} />
                 </button>
                 <input 
                  type="text" 
                  placeholder={`Speak to ${activeChannel.name}...`} 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold placeholder:text-slate-300"
                 />
                 <button className="w-12 h-12 bg-[#0071e3] text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 hover:scale-110 active:scale-95 transition-all">
                    <Send size={20} />
                 </button>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default AdminChatHub;
