"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import Sidebar from '@/components/dashboard/Sidebar';
import { 
  Briefcase, Clock, FileText, Send, 
  ChevronLeft, MessageSquare, Info, 
  Upload, CheckCircle, CheckCircle2, AlertCircle, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

let socket;

export default function SpecialistConsole() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const { data: session } = useSession();
  
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
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
        body: JSON.stringify({
          content: tmpMsg.content,
          projectId: id,
          chatType: 'CLIENT_CHAT'
        })
      });
    } catch (error) {
      console.error("Message delivery failed:", error);
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
        
        // Update project status to REVIEW
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
        
        // Emit status update via Socket
        if (socket) {
            socket.emit('status_update', { projectId: id, status: 'REVIEW' });
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
        // Emit status update via Socket
        if (socket) {
            socket.emit('status_update', { projectId: id, status: newStatus });
        }
      }
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#FBFBFB]">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#002D5B] rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initialising Secure Console...</p>
       </div>
    </div>
  );

  if (!project) return (
    <div className="flex h-screen items-center justify-center bg-[#FBFBFB]">
       <div className="text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-sm flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Project Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">The project you are looking for does not exist or you do not have permission to access this node.</p>
          <button 
            onClick={() => router.push('/freelancer')}
            className="px-8 py-3 bg-[#002D5B] text-white rounded-sm text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-900/10"
          >
            Return to Dashboard
          </button>
       </div>
    </div>
  );

  return (
    <div className="flex bg-[#FBFBFB] min-h-screen text-[#111111]">
      <Sidebar role="FREELANCER" />
      
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-8 shrink-0">
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => router.push('/freelancer')}
                  className="p-2 hover:bg-slate-50 rounded-sm text-slate-400 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="h-4 w-[1px] bg-slate-200 mx-2" />
                <div>
                   <h2 className="text-sm font-bold text-slate-900">{project.title}</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case ID: {project.id.slice(-6).toUpperCase()}</p>
                </div>
             </div>
             
             <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-wider ${
                    project.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    project.status === 'ASSIGNED' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                    project.status === 'REVIEW' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    'bg-slate-50 text-slate-600 border border-slate-100'
                }`}>
                    {project.status}
                </div>
             </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
             {/* Left Column: Management */}
             <main className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Master Action Node */}
                <div className="bg-white border border-[#E5E5E5] rounded-sm shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#E5E5E5] bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#002D5B] text-white rounded-sm flex items-center justify-center">
                                <Briefcase size={16} />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Specialist Action Node</h3>
                        </div>
                    </div>
                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workflow Progress</p>
                                <div className="space-y-3">
                                    {[
                                        { s: 'ASSIGNED', l: 'Initial Assignment' },
                                        { s: 'IN_PROGRESS', l: 'Work Started' },
                                        { s: 'REVIEW', l: 'In Review' },
                                        { s: 'COMPLETED', l: 'Mark Final Delivery' }
                                    ].map((step, idx) => {
                                        const isDone = project.status === step.s || (idx < 2 && project.status === 'IN_PROGRESS') || (idx < 3 && project.status === 'REVIEW') || project.status === 'COMPLETED';
                                        const isCurrent = project.status === step.s;
                                        
                                        return (
                                            <div key={idx} className="flex items-center gap-4">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                                    isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-slate-300'
                                                }`}>
                                                    {isDone ? <CheckCircle2 size={12} /> : <span className="text-[10px]">{idx+1}</span>}
                                                </div>
                                                <span className={`text-[11px] font-bold uppercase tracking-wider ${isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                                                    {step.l}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-6 rounded-sm space-y-6">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Console Controls</p>
                                <div className="space-y-3">
                                    {project.status === 'ASSIGNED' && (
                                        <button 
                                          onClick={() => updateStatus('IN_PROGRESS')}
                                          className="w-full h-11 bg-[#0067B8] text-white rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-[#005a9e] transition-all flex items-center justify-center gap-2"
                                        >
                                          Start Working Now
                                        </button>
                                    )}
                                    {project.status === 'REVIEW' && (
                                         <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-sm">
                                            <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-2">
                                                <CheckCircle2 size={12} /> Submitted for Review
                                            </p>
                                            <p className="text-[9px] text-emerald-600 mt-1">Waiting for student feedback or approval.</p>
                                         </div>
                                    )}
                                    <button className="w-full h-11 bg-white text-slate-600 border border-slate-200 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                        Support Request
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Project Assets */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white border border-[#E5E5E5] rounded-sm shadow-sm h-full flex flex-col">
                        <div className="p-6 border-b border-[#E5E5E5] flex items-center gap-3">
                            <FileText size={16} className="text-[#0067B8]" />
                            <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Project Artifacts</h4>
                        </div>
                        <div className="p-6 flex-1 max-h-[300px] overflow-y-auto">
                            {project.attachments?.length > 0 ? (
                                <div className="space-y-3">
                                    {project.attachments.map((file, idx) => (
                                        <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-between group hover:border-[#0067B8] transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white border border-slate-200 rounded-sm flex items-center justify-center text-slate-400 group-hover:text-[#0067B8]">
                                                    <FileText size={14} />
                                                </div>
                                                <p className="text-[11px] font-medium text-slate-700 truncate max-w-[150px]">{file.name}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                  onClick={() => setPreviewUrl(file.url)}
                                                  className="p-1.5 text-slate-400 hover:text-[#0067B8] hover:bg-blue-50 rounded-sm transition-all"
                                                  title="Preview PDF"
                                                >
                                                    <Info size={14} />
                                                </button>
                                                <a 
                                                  href={file.url} 
                                                  target="_blank" 
                                                  className="p-1.5 text-slate-400 hover:text-[#0067B8] hover:bg-blue-50 rounded-sm transition-all"
                                                >
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                    <AlertCircle size={24} className="mb-2" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">No source files provided.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-[#E5E5E5] rounded-sm shadow-sm h-full flex flex-col relative overflow-hidden">
                        <div className="p-6 border-b border-[#E5E5E5] flex items-center gap-3">
                            <Upload size={16} className="text-emerald-500" />
                            <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Submit Deliverable</h4>
                        </div>
                        
                        <div className="p-8 flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 m-6 rounded-sm bg-slate-50/50 relative">
                            {uploading && (
                                <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-slate-200 border-t-[#002D5B] rounded-full animate-spin"></div>
                                    <p className="text-[9px] font-bold text-[#002D5B] uppercase tracking-widest mt-3">Uploading to Cloudinary...</p>
                                </div>
                            )}
                            <Upload size={32} className="text-slate-300 mb-4" />
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Drag & drop final draft</p>
                            <p className="text-[9px] text-slate-400 mt-1">PDF, DOCX up to 10MB</p>
                            <label className="mt-6 px-6 py-2 bg-white border border-slate-200 rounded-sm text-[10px] font-bold text-[#002D5B] uppercase tracking-widest hover:bg-white/50 transition-all cursor-pointer">
                                Browse Files
                                <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-[#E5E5E5] rounded-sm shadow-sm p-8">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Briefing Observation</h4>
                    <div className="prose prose-slate max-w-none">
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-sm border-l-4 border-slate-200 font-medium italic">
                            "{project.description || 'No detailed instructions provided by student.'}"
                        </p>
                    </div>
                </div>
             </main>

             {/* Right Column: Chat */}
             <aside className="w-[450px] border-l border-[#E5E5E5] bg-white flex flex-col shrink-0">
                <div className="p-6 border-b border-[#E5E5E5] bg-slate-50/50 flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#0067B8] text-white rounded-sm flex items-center justify-center">
                            <MessageSquare size={16} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">Communication Node</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Direct stream: Specialist → Student</p>
                </div>

                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6"
                >
                   {messages.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-12">
                        <Info size={32} className="mb-4" />
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Secure stream initialized. Connect with the student to clarify requirements.</p>
                     </div>
                   ) : (
                      <div className="space-y-6">
                        {messages.map((msg, idx) => {
                            const isMe = msg.senderId === user?.id || msg.senderId === session?.user?.id;
                            return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-4 rounded-sm text-xs font-medium leading-relaxed ${
                                            isMe ? 'bg-[#002D5B] text-white shadow-md' : 'bg-slate-100 text-slate-800'
                                        }`}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                            {isMe ? 'Expert Console' : 'Student (Client)'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                      </div>
                   )}
                </div>

                <form 
                  onSubmit={handleSendMessage}
                  className="p-6 border-t border-[#E5E5E5] bg-white gap-3 flex"
                >
                    <input 
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a secure message..."
                      className="flex-1 h-11 px-4 bg-slate-50 border border-slate-200 rounded-sm text-xs focus:ring-1 focus:ring-[#0067B8] outline-none transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="w-11 h-11 bg-[#002D5B] text-white rounded-sm flex items-center justify-center hover:bg-[#001D3D] disabled:opacity-50 transition-all shrink-0 shadow-lg shadow-blue-900/10"
                    >
                      <Send size={18} />
                    </button>
                </form>
             </aside>
          </div>
      </div>

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-12 right-12 z-[110]"
          >
            <div className="bg-[#002D5B] text-white p-6 shadow-2xl border-t-4 border-emerald-500 min-w-[320px] flex items-center gap-5">
               <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} className="text-emerald-400" />
               </div>
               <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-1">Stream Updated</h5>
                  <p className="text-xs font-medium text-slate-200">Deliverable submitted & status synced.</p>
               </div>
               <button 
                onClick={() => setShowSuccess(false)}
                className="ml-auto text-slate-400 hover:text-white"
               >
                 <span className="text-xl">×</span>
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF PREVIEW MODAL */}
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
              className="bg-white w-full h-full rounded-sm shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-14 border-b border-slate-200 flex items-center justify-between px-8 bg-slate-50 shrink-0">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-red-50 text-red-500 rounded-sm flex items-center justify-center">
                      <FileText size={16} />
                   </div>
                   <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Academic Document Preview</h3>
                </div>
                <button 
                  onClick={() => setPreviewUrl(null)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded-sm transition-all"
                >
                  <span className="text-xl font-light">×</span>
                </button>
              </div>
              <div className="flex-1 bg-slate-100 p-4">
                <iframe 
                   src={previewUrl} 
                   className="w-full h-full rounded-sm border-none shadow-lg"
                   title="PDF Preview"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
