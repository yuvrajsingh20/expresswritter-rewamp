"use client";
import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from "next-auth/react";
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronRight, ArrowLeft, Send, Paperclip, 
  CheckCircle2, Clock, PlayCircle, Package,
  User, MessageSquare, Download, AlertCircle,
  Loader2, FileText, Info, ExternalLink, Calendar
} from 'lucide-react';
import { io } from 'socket.io-client';

let socket;

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchSession = async () => {
        const res = await fetch('/api/auth-session');
        if (res.ok) {
            const data = await res.json();
            setUser(data.user);
        }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const [projRes, msgRes] = await Promise.all([
          fetch(`/api/projects/${id}`),
          fetch(`/api/chat?projectId=${id}&chatType=CLIENT_CHAT`)
        ]);
        
        if (projRes.ok) setProject(await projRes.json());
        if (msgRes.ok) setMessages(await msgRes.json());
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [id, session]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Socket.io Real-time Logic
  useEffect(() => {
    socketInitializer();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const socketInitializer = async () => {
    // We connect to the same host
    socket = io();

    socket.on('connect', () => {
      console.log('Connected to socket');
      socket.emit('join_project', id);
    });

    socket.on('receive_message', (data) => {
      if (data.projectId === id) {
        setMessages((prev) => [...prev, data]);
      }
    });

    socket.on('project_status_changed', (data) => {
      if (data.projectId === id) {
        setProject(prev => ({ ...prev, status: data.status }));
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('project_status_changed');
    };
  }, [id]);

  const handleApprove = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      if (res.ok) {
        const socket = io('http://localhost:3000');
        socket.emit('status_update', { projectId: id, status: 'COMPLETED' });
        setProject(prev => ({ ...prev, status: 'COMPLETED' }));
      }
    } catch (error) {
      console.error("Failed to approve project:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userId = user?.id || session?.user?.id;
    if (!userId) return;

    const tmpMsg = {
      content: newMessage,
      senderId: userId,
      chatType: 'CLIENT_CHAT',
      projectId: id,
      createdAt: new Date()
    };

    // Emit via Socket for real-time delivery
    if (socket) {
        socket.emit('send_message', {
            ...tmpMsg,
            projectId: id
        });
    }

    setNewMessage("");

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tmpMsg),
      });
    } catch (error) {
      console.error("Message send failed:", error);
    }
  };

  const statusSteps = [
    { label: 'Assigned', status: 'ASSIGNED', icon: User },
    { label: 'In Progress', status: 'IN_PROGRESS', icon: PlayCircle },
    { label: 'Review', status: 'REVIEW', icon: Package },
    { label: 'Delivered', status: 'COMPLETED', icon: CheckCircle2 },
  ];

  const getStatusStepIndex = (status) => {
      return statusSteps.findIndex(s => s.status === status);
  };

  if (loading) return (
    <div className="flex bg-[#FBFBFB] min-h-screen">
      <Sidebar role="STUDENT" />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#0067B8]" size={32} />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Opening Secure Stream...</p>
      </div>
    </div>
  );

  if (!project) return (
    <div className="flex bg-[#FBFBFB] min-h-screen">
      <Sidebar role="STUDENT" />
      <div className="flex-1 flex items-center justify-center">
         <div className="text-center p-12 bg-white border border-[#E5E5E5] rounded-sm max-w-md">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-lg font-bold text-slate-900 mb-2">Project Not Found</h2>
            <p className="text-sm text-slate-500 mb-6">The project you are looking for does not exist or has been archived.</p>
            <button onClick={() => router.push('/student/orders')} className="btn-primary py-2 px-6">Return to Orders</button>
         </div>
      </div>
    </div>
  );

  const currentStepIndex = getStatusStepIndex(project.status);

  return (
    <div className="flex bg-[#FBFBFB] min-h-screen text-[#111111] font-sans overflow-hidden">
      <Sidebar role="STUDENT" />
      
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-3">
             <button onClick={() => router.back()} className="text-xs font-semibold text-slate-500 hover:text-[#0067B8] flex items-center gap-1 transition-colors">
               <ArrowLeft size={14} /> Back
             </button>
             <div className="h-4 w-px bg-slate-200" />
             <span className="text-sm font-bold text-slate-900">{project.title}</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-blue-50 text-[#0067B8] border border-blue-100 rounded-sm text-[10px] font-bold uppercase tracking-wider">
               {project.status.replace('_', ' ')}
             </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <main className="flex-1 flex flex-col p-8 overflow-y-auto space-y-6">
            {/* Progress Section */}
            <div className="bg-white p-8 border border-[#E5E5E5] rounded-sm shadow-sm">
               <div className="flex items-center justify-between mb-8 px-4">
                  {statusSteps.map((step, idx) => {
                    const isPast = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;
                    return (
                      <React.Fragment key={step.label}>
                        <div className="flex flex-col items-center gap-2 relative">
                           <div className={`w-10 h-10 rounded-sm flex items-center justify-center border transition-all ${
                             isPast ? 'bg-[#002D5B] text-white border-[#002D5B]' : 'bg-white text-slate-300 border-slate-100'
                           } ${isCurrent ? 'ring-4 ring-blue-50' : ''}`}>
                              <step.icon size={18} />
                           </div>
                           <span className={`text-[10px] font-bold uppercase tracking-widest ${isPast ? 'text-slate-900' : 'text-slate-300'}`}>
                             {step.label}
                           </span>
                        </div>
                        {idx < statusSteps.length - 1 && (
                          <div className={`h-px w-full flex-1 mx-4 ${
                            currentStepIndex > idx ? 'bg-[#002D5B]' : 'bg-slate-100'
                          }`} />
                        )}
                      </React.Fragment>
                    );
                  })}
               </div>
               
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned Expert</p>
                    <p className="text-xs font-bold text-slate-800">{project.freelancerId ? `Specialist #EX-${project.freelancerId.slice(-4).toUpperCase()}` : 'Initializing...'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Deadline</p>
                    <p className="text-xs font-bold text-slate-800">{new Date(project.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price Point</p>
                    <p className="text-xs font-bold text-slate-800">₹{project.amount || 'Calculated'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Type</p>
                    <p className="text-xs font-bold text-slate-800">{project.serviceType || 'Standard'}</p>
                  </div>
               </div>
            </div>

            {/* Submission Area */}
            {project.status === 'COMPLETED' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border border-emerald-100 p-6 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4 text-center md:text-left">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-sm flex items-center justify-center shadow-md">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900">Final Draft Delivered</h3>
                    <p className="text-[11px] text-emerald-700">Project completed. Please review the final document below.</p>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button className="flex-1 md:flex-none h-10 px-6 bg-white text-emerald-700 border border-emerald-200 rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all">
                    Request Revision
                  </button>
                  <button 
                    onClick={handleApprove}
                    className="flex-1 md:flex-none h-10 px-6 bg-[#002D5B] text-white rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-[#001D3D] transition-all"
                  >
                    Approve & Download
                  </button>
                </div>
              </motion.div>
            )}

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Requirements */}
                <div className="bg-white p-6 border border-[#E5E5E5] rounded-sm shadow-sm h-full">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Project Parameters</h3>
                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-sm text-xs leading-relaxed text-slate-600 font-medium whitespace-pre-wrap min-h-[150px]">
                        {project.description || "No specific brief provided."}
                    </div>
                </div>

                {/* Attachments */}
                <div className="bg-white p-6 border border-[#E5E5E5] rounded-sm shadow-sm h-full flex flex-col">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Initial Assets</h3>
                    <div className="flex-1 space-y-3">
                        {project.attachments?.length > 0 ? project.attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-sm group hover:border-blue-200 bg-white transition-all">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 bg-slate-50 flex items-center justify-center text-slate-400 rounded-sm">
                                        <FileText size={16} />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-700 truncate max-w-[200px]">{file.name}</span>
                                </div>
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 text-[#0067B8] hover:bg-blue-50 rounded-sm transition-all">
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        )) : (
                            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-sm p-8 text-center text-slate-300">
                                <FileText size={24} className="mb-2 opacity-50" />
                                <p className="text-[11px] font-bold uppercase tracking-widest">No assets uploaded</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </main>

          {/* Chat Sidebar */}
          <aside className="w-[450px] border-l border-[#E5E5E5] bg-white flex flex-col shrink-0">
            <div className="p-6 border-b border-[#E5E5E5] bg-slate-50/50 flex flex-col gap-1">
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 bg-[#0067B8] text-white rounded-sm flex items-center justify-center">
                     <MessageSquare size={16} />
                   </div>
                   <h4 className="text-sm font-bold text-slate-900">Communication Node</h4>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Direct line to assigned academic specialist.</p>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
               {messages.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-12">
                    <Info size={32} className="mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Secure stream initialized. No messages detected in current project thread.</p>
                 </div>
               ) : (
                  <div className="space-y-6">
                    {messages.map((msg, idx) => {
                        const isMe = msg.senderId === user?.id || msg.senderId === session?.user?.id;
                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-4 rounded-sm text-xs font-medium leading-relaxed ${
                                        isMe ? 'bg-[#002D5B] text-white' : 'bg-slate-100 text-slate-800'
                                    }`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        {isMe ? 'You' : (project.freelancerId && msg.senderId === project.freelancerId ? 'Specialist' : 'Support')} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                  </div>
               )}
            </div>

            <div className="p-6 border-t border-[#E5E5E5] bg-white">
               <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="relative">
                    <textarea 
                        rows={3}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Detail your inquiry or drop additional context..."
                        className="w-full bg-slate-50 border border-[#CCCCCC] rounded-sm p-4 pr-12 text-xs font-medium focus:ring-1 focus:ring-[#0067B8] outline-none transition-all resize-none"
                    />
                    <div className="absolute right-3 bottom-3 flex items-center gap-2 text-slate-300">
                        <Paperclip size={16} className="cursor-pointer hover:text-slate-600" />
                    </div>
                  </div>
                  <button 
                    disabled={!newMessage.trim()}
                    type="submit" 
                    className="w-full h-11 bg-[#002D5B] text-white flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest hover:bg-[#001D3D] transition-all disabled:opacity-50"
                  >
                    Transmit Message <Send size={14} />
                  </button>
               </form>
               <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-sm flex items-start gap-3">
                  <AlertCircle size={14} className="text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-[9px] text-slate-400 font-medium leading-relaxed leading-tight uppercase tracking-tight">Protocol: Exchange of personal identifiers is prohibited to maintain project integrity.</p>
               </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
