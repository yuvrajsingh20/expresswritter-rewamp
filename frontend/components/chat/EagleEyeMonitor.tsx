"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ShieldAlert, Eye, Phone, Mail, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FlaggedMessage {
  projectId: string;
  content: string;
  senderId: string;
  senderRole: string;
  timestamp: string;
  reasons: {
    phone: boolean;
    email: boolean;
    link: boolean;
  };
}

export default function EagleEyeMonitor() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [flaggedMessages, setFlaggedMessages] = useState<FlaggedMessage[]>([]);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    // Admin joins global monitoring room
    newSocket.emit("join_chat", { role: "ADMIN", userId: "admin-session-id" });

    newSocket.on("flagged_message", (data: FlaggedMessage) => {
      setFlaggedMessages((prev) => [data, ...prev]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const jumpToOrderChat = (projectId: string) => {
    if (!socket) return;
    socket.emit("admin_join_chat", projectId);
    alert(`Now monitoring live chat for Project #${projectId.slice(-6)}`);
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden glass text-slate-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Eagle Eye Monitor</h3>
            <p className="text-[10px] text-red-400 uppercase tracking-widest font-black">Live Threat Detection</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full text-xs font-bold uppercase tracking-wide">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Active
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {flaggedMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 italic text-sm">
              <Eye size={48} className="mb-2 opacity-20" />
              Monitoring global chat traffic...
            </div>
          ) : (
            flaggedMessages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-slate-950 p-5 rounded-2xl border border-red-500/30 relative overflow-hidden group hover:border-red-500/60 transition-colors shadow-lg"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                      Blocked
                    </span>
                    <span className="text-sm font-medium text-slate-300">Project #{msg.projectId.slice(-6)}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="mb-4 bg-slate-900 rounded-xl p-3 border border-slate-800">
                  <p className="text-xs text-slate-500 mb-1 font-mono uppercase tracking-widest">
                    Sender: {msg.senderId.slice(-6)} <span className="text-slate-400">({msg.senderRole})</span>
                  </p>
                  <p className="text-slate-300 text-sm font-medium leading-relaxed">"{msg.content}"</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-red-400 flex gap-3 font-medium">
                    {msg.reasons.phone && <span className="flex items-center gap-1"><Phone size={12}/> Phone</span>}
                    {msg.reasons.email && <span className="flex items-center gap-1"><Mail size={12}/> Email</span>}
                    {msg.reasons.link && <span className="flex items-center gap-1"><LinkIcon size={12}/> Link</span>}
                  </div>
                  
                  <button 
                    onClick={() => jumpToOrderChat(msg.projectId)}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-600 transition-all active:scale-95"
                  >
                    <Eye size={14} />
                    Spectate Room
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
