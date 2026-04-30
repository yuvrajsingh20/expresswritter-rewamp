"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Shield, Lock, Send, 
  Paperclip, Users, Zap, Bell, Eye, EyeOff
} from 'lucide-react';

const ChatInterface = ({ role = 'ADMIN', projectId, currentUserId }) => {
  const [activeBridge, setActiveBridge] = useState('CLIENT'); // CLIENT, INTERNAL, ADMIN
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const bridges = [
    { id: 'CLIENT', name: 'Client Chat', icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-50', access: 'Everywhere', type: 'CLIENT_CHAT' },
    { id: 'INTERNAL', name: 'Internal Strategy', icon: Shield, color: 'text-amber-500', bg: 'bg-amber-50', access: 'No Student', type: 'INTERNAL_CHAT' },
    { id: 'ADMIN', name: 'Admin mission control', icon: Lock, color: 'text-purple-500', bg: 'bg-purple-50', access: 'Admin only', type: 'ADMIN_CHAT' },
  ];

  useEffect(() => {
    const fetchMessages = async () => {
      if (!projectId) return;
      setLoading(true);
      try {
        const type = bridges.find(b => b.id === activeBridge).type;
        const res = await fetch(`/api/messages?projectId=${projectId}&type=${type}`);
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [projectId, activeBridge]);

  const handleSendMessage = async () => {
    if (!message.trim() || !projectId) return;
    try {
      const type = bridges.find(b => b.id === activeBridge).type;
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          content: message,
          chatType: type
        })
      });
      if (res.ok) {
        setMessage('');
        // Refresh messages
        const data = await res.json();
        setMessages(prev => [...prev, data]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex h-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 italic">
      {/* BRIDGE NAVIGATOR (Left Rail) */}
      <div className="w-64 border-r border-slate-50 flex flex-col bg-slate-50/30 p-6">
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 px-4">Bridge Layers</p>
         <nav className="space-y-3">
            {bridges.map((bridge) => {
               // Security check: Students cannot see Internal or Admin layers
               if (role === 'STUDENT' && bridge.id !== 'CLIENT') return null;
               
               const isActive = activeBridge === bridge.id;
               return (
                  <button 
                    key={bridge.id} 
                    onClick={() => setActiveBridge(bridge.id)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all relative ${
                      isActive ? 'bg-white shadow-xl shadow-slate-200/50 scale-[1.05] z-10' : 'hover:bg-white/50 grayscale'
                    }`}
                  >
                     <div className={`p-2 rounded-xl ${bridge.bg} ${bridge.color}`}>
                        <bridge.icon size={18} />
                     </div>
                     <div className="text-left leading-tight">
                        <p className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{bridge.name}</p>
                        <p className="text-[7px] font-bold text-slate-400 uppercase opacity-60">{bridge.access}</p>
                     </div>
                     {isActive && <motion.div layoutId="activeDot" className="absolute -left-1 w-2 h-8 bg-current rounded-full" />}
                  </button>
               )
            })}
         </nav>
      </div>

      {/* CHAT WINDOW (Main Stream) */}
      <div className="flex-1 flex flex-col bg-white relative">
         {/* Layer Context Header */}
         <header className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center opacity-80 ${bridges.find(b => b.id === activeBridge).bg}`}>
                  {React.createElement(bridges.find(b => b.id === activeBridge).icon, { size: 24, className: bridges.find(b => b.id === activeBridge).color })}
               </div>
               <div>
                  <h3 className="text-lg font-black tracking-tight uppercase italic">{activeBridge} BRIDGE ACTIVE</h3>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Full Compliance Monitoring Live</p>
                  </div>
               </div>
            </div>
            {activeBridge !== 'CLIENT' && (
               <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                  <EyeOff size={14} className="text-amber-500" />
                  <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Client is Blind to this channel</span>
               </div>
            )}
         </header>

         {/* Message Stream */}
         <div className="flex-1 overflow-y-auto p-12 space-y-10 bg-slate-50/20">
            {messages.map((msg, i) => {
               const isOutgoing = msg.senderId === currentUserId;
               return (
                <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 key={msg.id || i} 
                 className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                >
                   <div className={`max-w-[80%] ${isOutgoing ? 'text-right' : 'text-left'}`}>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest px-2">
                        {msg.sender?.name || 'User'}
                      </p>
                      <div className={`p-6 rounded-[2.5rem] text-sm font-bold shadow-sm ${
                         isOutgoing 
                         ? 'bg-[#1d1d1f] text-white rounded-tr-none' 
                         : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                      }`}>
                         {msg.content}
                      </div>
                      <p className="text-[8px] font-black text-slate-300 uppercase mt-2 px-2 tracking-widest">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                   </div>
                </motion.div>
               )
            })}
         </div>

         {/* Input Box */}
         <div className="p-10 border-t border-slate-50">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="bg-slate-50 border border-slate-100 rounded-[2.5rem] px-10 py-5 flex items-center gap-6 group focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-200 transition-all shadow-inner"
            >
               <button type="button" className="text-slate-300 hover:text-blue-500 transition-colors">
                  <Paperclip size={20} />
               </button>
               <input 
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 type="text" 
                 placeholder={`Type in ${activeBridge.toLowerCase()} bridge...`} 
                 className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-black placeholder:text-slate-300 italic"
               />
               <button 
                 type="submit"
                 className="bg-[#0071e3] text-white p-4 rounded-ful rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-110 active:scale-95 transition-all"
               >
                  <Send size={20} />
               </button>
            </form>
         </div>
      </div>
    </div>
  );
};

export default ChatInterface;
