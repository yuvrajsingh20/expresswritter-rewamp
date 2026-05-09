"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import Sidebar from '@/components/dashboard/Sidebar';
import { 
  Briefcase, Clock, FileText, Send, 
  ChevronLeft, MessageSquare, Info, 
  Upload, CheckCircle, CheckCircle2, AlertCircle, 
  ExternalLink, Zap, Paperclip, Loader2, DollarSign,
  LayoutGrid, Calendar, Target, ShieldCheck,
  Search, ArrowRight, Download, Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import servicesData from '@/data/services_data.json';

const SERVICES = Object.values(servicesData.individualServices).flat();
const getServiceName = (id) => SERVICES.find(s => s.id === id)?.name || id;

export default function SpecialistConsole() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const { data: session } = useSession();
  
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorAlert, setErrorAlert] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);
  const socketRef = useRef(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice input is not supported in your browser. Try Chrome or Safari.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNewMessage(prev => prev + (prev ? ' ' : '') + transcript);
    };
    
    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

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
        const [projRes, msgRes, invRes] = await Promise.all([
          fetch(`/api/projects/${id}`),
          fetch(`/api/chat?projectId=${id}&chatType=CLIENT_CHAT`),
          fetch(`/api/admin/invoices?projectId=${id}`)
        ]);

        if (projRes.ok) setProject(await projRes.json());
        if (msgRes.ok) {
          const fetchedMessages = await msgRes.json();
          setMessages(fetchedMessages.map(m => ({ ...m, timestamp: new Date(m.createdAt) })));
        }
        if (invRes.ok) setInvoices(await invRes.json());
      } catch (error) {
        console.error("Failed to fetch project details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Socket.io Real-time Logic
  useEffect(() => {
    if (!id || !user?.id) return;
    
    const socket = io();
    socketRef.current = socket;

    socket.emit('join_chat', { 
      projectId: id, 
      userId: user.id, 
      role: 'FREELANCER' 
    });

    socket.on('receive_message', (data) => {
      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some(m => m.id === data.id)) return prev;
        return [...prev, { ...data, timestamp: new Date(data.timestamp) }];
      });
    });

    socket.on('error_alert', (alert) => {
      setErrorAlert(alert.message);
      setTimeout(() => setErrorAlert(null), 5000);
    });

    socket.on('project_status_changed', (data) => {
      if (data.projectId === id) {
        setProject(prev => ({ ...prev, status: data.status }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id, user?.id]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    const userId = user?.id || session?.user?.id;
    if (!userId) return;

    const tmpMsg = {
      content: newMessage,
      senderId: userId,
      senderRole: 'FREELANCER',
      chatType: 'CLIENT_CHAT',
      projectId: id,
    };

    setNewMessage("");

    try {
      // 1. Save to database first via messages API
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tmpMsg)
      });
      
      const savedMessage = await res.json();

      // 2. Emit via socket
      if (socketRef.current) {
          socketRef.current.emit('send_message', {
              id: savedMessage.id,
              content: savedMessage.content,
              projectId: id,
              senderId: userId,
              senderRole: 'FREELANCER',
              chatType: 'CLIENT_CHAT'
          });
      }
    } catch (error) {
      console.error("Message delivery failed:", error);
      setErrorAlert("Failed to send message.");
      setTimeout(() => setErrorAlert(null), 5000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e) e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const uploadData = await res.json();
        
        await fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'REVIEW',
            attachments: [...(project.attachments || []), uploadData]
          })
        });

        setProject(prev => ({
          ...prev,
          status: 'REVIEW',
          attachments: [...(prev.attachments || []), uploadData]
        }));
        
        if (socketRef.current) {
            socketRef.current.emit('status_update', { projectId: id, status: 'REVIEW' });
        }

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

   const updateStatus = async (newStatus) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setProject({ ...project, status: newStatus });
        if (socketRef.current) {
            socketRef.current.emit('status_update', { projectId: id, status: newStatus });
        }
      }
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  if (loading) return (
    <div className="flex bg-[#FBFBFB] min-h-screen">
      <Sidebar role="FREELANCER" />
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-[#002D5B] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="text-[#002D5B] animate-pulse" size={20} />
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider animate-pulse">Synchronizing Secure Console...</p>
      </div>
    </div>
  );

  if (!project) return (
    <div className="flex bg-[#FBFBFB] min-h-screen">
      <Sidebar role="FREELANCER" />
      <div className="flex-1 flex items-center justify-center p-8">
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="text-center p-12 bg-white border border-[#E5E5E5] rounded-3xl max-w-md shadow-2xl"
         >
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">Access Denied</h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium italic">This project stream is either encrypted, revoked, or non-existent in the current specialist directory.</p>
            <button onClick={() => router.push('/freelancer')} className="w-full h-14 bg-[#002D5B] text-white rounded-xl flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all">
              <ChevronLeft size={16} /> RETURN TO HUB
            </button>
         </motion.div>
      </div>
    </div>
  );

  return (
    <div className="flex bg-[#FBFBFB] min-h-screen text-[#111111] font-sans overflow-hidden">
      <Sidebar role="FREELANCER" />
      
      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Premium Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5] flex items-center justify-between px-10 shrink-0 z-20">
          <div className="flex items-center gap-6">
             <button 
               onClick={() => router.push('/freelancer')} 
               className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#002D5B] transition-all"
             >
               <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-blue-50 transition-colors">
                 <ChevronLeft size={14} />
               </div>
               PROJECT HUB
             </button>
             <div className="h-6 w-px bg-slate-200" />
             <div className="flex flex-col">
               <h1 className="text-base font-black text-slate-900 tracking-tight">{project.title}</h1>
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 <span className="text-[#0067B8]">CASE NODE: #{project.id.slice(-6).toUpperCase()}</span>
                 <span>•</span>
                 <span className="text-[#0067B8]">{getServiceName(project.serviceType)}</span>
                 <span>•</span>
                 <span>INIT: {new Date(project.createdAt).toLocaleDateString()}</span>
                 <span>•</span>
                 <span>DL: {new Date(project.deadline).toLocaleDateString()}</span>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all ${
               project.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
               project.status === 'REVIEW' ? 'bg-amber-50 text-amber-600 border-amber-100' :
               'bg-blue-50 text-[#0067B8] border-blue-100'
             }`}>
               {project.status.replace('_', ' ')}
             </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <main className="flex-1 flex flex-col p-8 overflow-y-auto space-y-8 bg-slate-50/30">
            
            {/* Workflow Tracker Card */}
            <div className="bg-[#002D5B] rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20 shrink-0">
               <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none rotate-12">
                 <Target size={140} />
               </div>
               <div className="relative z-10 space-y-10">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Operational Phase</p>
                       <h2 className="text-2xl font-black tracking-tight">Active Specialization Sequence</h2>
                    </div>
                    <div className="flex items-center gap-6 bg-white/10 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10 shadow-inner">
                       <div className="text-center px-4">
                          <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1">Target DL</p>
                          <p className="text-xl font-black">{new Date(project.deadline).toLocaleDateString([], { day: 'numeric', month: 'short' })}</p>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { s: 'ASSIGNED', l: 'Assigned', i: Briefcase },
                      { s: 'IN_PROGRESS', l: 'Production', i: PlayCircle },
                      { s: 'REVIEW', l: 'Verification', i: Search },
                      { s: 'COMPLETED', l: 'Delivered', i: CheckCircle2 }
                    ].map((step, idx) => {
                      const isPast = project.status === step.s || (idx === 0 && project.status !== 'CREATED') || (idx === 1 && (project.status === 'REVIEW' || project.status === 'COMPLETED')) || (idx === 2 && project.status === 'COMPLETED');
                      const isCurrent = project.status === step.s;
                      return (
                        <div key={idx} className="relative group">
                           <div className={`p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                             isCurrent ? 'bg-white text-[#002D5B] border-white shadow-xl scale-105' : 
                             isPast ? 'bg-blue-800/40 text-blue-100 border-blue-700/50' : 
                             'bg-blue-900/40 text-blue-400 border-blue-800/50'
                           }`}>
                              <step.i size={20} className={isCurrent ? 'animate-pulse' : ''} />
                              <span className="text-[10px] font-black uppercase tracking-widest">{step.l}</span>
                              {isPast && !isCurrent && <CheckCircle size={14} className="ml-auto text-emerald-400" />}
                           </div>
                        </div>
                      )
                    })}
                  </div>
               </div>
            </div>

            {/* Console Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 shrink-0">
               {/* Controls & Briefing */}
               <div className="space-y-8">
                  <div className="bg-white p-8 border border-[#E5E5E5] rounded-3xl shadow-sm space-y-8">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Console Controls</h3>
                        <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                           <LayoutGrid size={16} />
                        </div>
                      </div>
                      <div className="space-y-4">
                        {project.status === 'ASSIGNED' && (
                          <button 
                            onClick={() => updateStatus('IN_PROGRESS')}
                            className="w-full h-16 bg-[#0067B8] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-900/10 active:scale-95"
                          >
                             <PlayCircle size={20} /> INITIALIZE PRODUCTION
                          </button>
                        )}
                        {project.status === 'REVIEW' && (
                          <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4">
                             <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                                <Clock size={20} />
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Verification Pending</p>
                                <p className="text-xs font-medium text-amber-600/80 mt-0.5">Deliverable is currently under student review sequence.</p>
                             </div>
                          </div>
                        )}
                        <button className="w-full h-14 bg-white border border-[#E5E5E5] text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                           <ShieldCheck size={16} className="text-[#0067B8]" /> PLATFORM SUPPORT
                        </button>
                      </div>
                  </div>

                  <div className="bg-white p-8 border border-[#E5E5E5] rounded-3xl shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Briefing Observation</h3>
                        <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                           <Info size={16} />
                        </div>
                      </div>
                      <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs leading-[1.8] text-slate-600 font-medium italic whitespace-pre-wrap min-h-[120px]">
                         "{project.description || 'No detailed briefing provided by the client.'}"
                      </div>
                  </div>
               </div>

                 {/* Financial Clearance (Freelancer Payouts) */}
                 <div className="bg-white border border-[#E5E5E5] rounded-3xl shadow-sm flex flex-col p-8 space-y-8 mb-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Financial Clearance</h3>
                       <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                          <DollarSign size={16} />
                       </div>
                    </div>
                    
                    {invoices.length > 0 ? (
                       <div className="space-y-4">
                          {invoices.map((inv) => (
                             <div key={inv.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                   <div className="flex items-center gap-2">
                                      <p className="text-sm font-bold text-slate-900">₹{inv.amount.toLocaleString()}</p>
                                      <span className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded">
                                         {inv.status}
                                      </span>
                                   </div>
                                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                      {inv.description || 'Project Milestone Payout'}
                                   </p>
                                </div>
                                <div className="text-right">
                                   <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                      {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                   </p>
                                   <p className="text-[8px] text-slate-400 mt-1 uppercase tracking-widest">Invoiced</p>
                                </div>
                             </div>
                          ))}
                          <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Accrued</p>
                             <p className="text-lg font-black text-[#002D5B]">₹{invoices.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</p>
                          </div>
                       </div>
                    ) : (
                       <div className="flex flex-col items-center justify-center py-6 text-center">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
                             <DollarSign size={24} />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting financial mapping from admin.</p>
                       </div>
                    )}
                 </div>

               {/* Asset Management */}
               <div className="bg-white border border-[#E5E5E5] rounded-3xl shadow-sm flex flex-col p-8 space-y-8">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Asset Management</h3>
                     <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                        <Paperclip size={16} />
                     </div>
                  </div>

                  {/* Upload Zone */}
                  <div className="relative group">
                      <div className={`p-10 border-2 border-dashed rounded-3xl bg-slate-50/50 flex flex-col items-center justify-center text-center transition-all ${
                        uploading ? 'border-blue-200' : 'border-slate-100 group-hover:border-blue-200 group-hover:bg-blue-50/20'
                      }`}>
                          {uploading && (
                             <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-3xl">
                                <Loader2 size={32} className="animate-spin text-[#002D5B]" />
                                <p className="text-[10px] font-black text-[#002D5B] uppercase tracking-widest mt-4 animate-pulse">Syncing to Cloud...</p>
                             </div>
                          )}
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                             <Upload size={28} className="text-[#002D5B]" />
                          </div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Submit Final Deliverable</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tight">PDF, DOCX up to 10MB accepted</p>
                          <label className="mt-8 px-8 py-3 bg-[#002D5B] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all cursor-pointer shadow-xl shadow-blue-900/10 active:scale-95">
                             SELECT FILES
                             <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
                          </label>
                      </div>
                  </div>

                  {/* Artifact List */}
                  <div className="space-y-3">
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-wider mb-4">Registry Artifacts</p>
                     {project.attachments?.length > 0 ? project.attachments.map((file, idx) => (
                        <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-[#0067B8] hover:shadow-lg hover:shadow-blue-900/5 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-50 flex items-center justify-center text-slate-400 rounded-xl group-hover:bg-blue-50 group-hover:text-[#0067B8] transition-colors">
                                 <FileText size={18} />
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-slate-700 truncate max-w-[140px]">{file.name}</p>
                                 <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">ACADEMIC NODE</p>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              <button onClick={() => setPreviewUrl(file.url)} className="p-2.5 text-slate-400 hover:text-[#0067B8] hover:bg-blue-50 rounded-lg transition-all">
                                 <Search size={16} />
                              </button>
                              <a href={file.url} target="_blank" className="p-2.5 text-slate-400 hover:text-[#0067B8] hover:bg-blue-50 rounded-lg transition-all">
                                 <Download size={16} />
                              </a>
                           </div>
                        </div>
                     )) : (
                        <div className="py-10 text-center border border-dashed border-slate-100 rounded-2xl opacity-30">
                           <p className="text-[10px] font-black uppercase tracking-widest italic">No assets detected.</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          </main>

          {/* Premium Chat Sidebar */}
          <aside className="w-[480px] border-l border-[#E5E5E5] bg-white flex flex-col shrink-0 relative">
            <div className="p-8 border-b border-[#E5E5E5] bg-white flex flex-col gap-2 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-[#002D5B] text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/20">
                       <MessageSquare size={20} />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-slate-900 tracking-tight">Client Comms</h4>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Active Stream</p>
                     </div>
                  </div>
                  <div className="flex -space-x-3">
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-900 overflow-hidden shadow-sm">
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-white">SP</div>
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-500">CL</div>
                    </div>
                  </div>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FBFBFB]/50">
               {messages.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center px-12 space-y-4 opacity-40">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                      <Info size={28} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Direct communication node standby. Secure transmission authorized.</p>
                 </div>
               ) : (
                  <div className="space-y-8">
                    {messages.map((msg, idx) => {
                        const isMe = msg.senderId === user?.id || msg.senderId === session?.user?.id;
                        return (
                            <motion.div 
                              initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              key={idx} 
                              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-5 py-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                                        isMe ? 'bg-[#002D5B] text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                                    }`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2 px-1">
                                        {isMe ? 'SPECIALIST CONSOLE' : (msg.sender?.role === 'STUDENT' ? 'STUDENT NODE' : 'TEAM SPECIALIST')} • {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString()}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                  </div>
               )}
            </div>

            <div className="p-8 border-t border-[#E5E5E5] bg-white">
               <AnimatePresence>
                 {errorAlert && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0 }}
                     className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start gap-2 text-xs font-bold"
                   >
                     <AlertCircle size={14} className="mt-0.5 shrink-0" />
                     <p>{errorAlert}</p>
                   </motion.div>
                 )}
               </AnimatePresence>
               <form onSubmit={handleSendMessage} className="space-y-6">
                  <div className="relative group">
                    <textarea 
                        rows={3}
                        value={newMessage}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type secure transmit packet..."
                        className="w-full bg-slate-50 border-2 border-transparent group-hover:bg-white group-hover:border-slate-100 rounded-2xl p-5 pr-14 text-xs font-medium focus:bg-white focus:border-[#0067B8]/20 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none shadow-inner"
                    />
                    <div className="absolute right-4 bottom-4 flex items-center gap-3 text-slate-300">
                        <button 
                          type="button" 
                          onClick={startListening}
                          className={`transition-all ${isListening ? 'text-red-500 animate-pulse' : 'hover:text-[#0067B8]'}`}
                        >
                           <Mic size={18} />
                        </button>
                        <Paperclip size={18} className="cursor-pointer hover:text-[#0067B8] transition-colors" />
                    </div>
                  </div>
                  <button 
                    disabled={!newMessage.trim()}
                    type="submit" 
                    className="w-full h-14 bg-slate-900 text-white flex items-center justify-center gap-4 font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-2xl shadow-slate-900/10 active:scale-95"
                  >
                    SEND MESSAGE <Send size={16} />
                  </button>
               </form>
               <div className="mt-6 p-4 bg-slate-50 rounded-xl flex items-start gap-4">
                  <ShieldCheck size={18} className="text-[#0067B8] mt-0.5 shrink-0" />
                  <p className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase tracking-tight">Security Warning: Platform integrity monitoring is active. All communications are logged for quality assurance.</p>
               </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Success Modal & PDF Preview would go here, consistent with student side */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-12 right-12 z-[110]"
          >
            <div className="bg-[#002D5B] text-white p-6 rounded-2xl shadow-2xl border-t-4 border-emerald-500 min-w-[320px] flex items-center gap-5">
               <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 size={24} className="text-emerald-400" />
               </div>
               <div>
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Upload Successful</h5>
                  <p className="text-xs font-bold text-slate-200">Asset synced to repository.</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 p-12 backdrop-blur-sm"
            onClick={() => setPreviewUrl(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full h-full rounded-3xl shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-20 border-b border-slate-200 flex items-center justify-between px-10 bg-slate-50 shrink-0">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shadow-sm">
                      <FileText size={20} />
                   </div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Academic Node Preview</h3>
                </div>
                <button onClick={() => setPreviewUrl(null)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-200 rounded-xl transition-all">
                  <span className="text-2xl font-light">×</span>
                </button>
              </div>
              <div className="flex-1 bg-slate-100 p-8">
                <iframe src={previewUrl} className="w-full h-full rounded-2xl border-none shadow-2xl" title="PDF Preview" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { PlayCircle } from 'lucide-react';
