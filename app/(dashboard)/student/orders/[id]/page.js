"use client";
import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { motion } from 'framer-motion';
import { useSession } from "next-auth/react";
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronRight, ArrowLeft, Send, Paperclip, 
  CheckCircle2, Clock, PlayCircle, Package,
  User, MessageSquare, Download, AlertCircle,
  Loader2
} from 'lucide-react';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  
  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

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

    if (session?.user) fetchOrderData();
  }, [id, session]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tmpMsg = {
      content: newMessage,
      senderId: session.user.id,
      chatType: 'CLIENT_CHAT',
      projectId: id,
      createdAt: new Date()
    };

    setMessages([...messages, tmpMsg]);
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
    { label: 'Submitted', status: 'REVIEW', icon: Package },
    { label: 'Delivered', status: 'COMPLETED', icon: CheckCircle2 },
  ];

  if (loading) return (
    <div className="flex bg-[#f8f9fa] min-h-screen">
      <Sidebar role="STUDENT" />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    </div>
  );

  if (!project) return <div>Project not found</div>;

  return (
    <div className="flex bg-[#f8f9fa] min-h-screen text-[#1d1d1f]">
      <Sidebar role="STUDENT" />
      
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white/70 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-2">
             <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <ArrowLeft size={16} className="text-slate-400" />
             </button>
             <ChevronRight size={14} className="text-slate-200" />
             <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{project.title}</span>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status:</span>
             <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">
               {project.status}
             </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <main className="flex-1 flex flex-col p-8 overflow-y-auto space-y-8">
            {/* Tracking Layer */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-10 px-4">
                  {statusSteps.map((step, idx) => {
                    const isActive = project.status === step.status;
                    const isPast = statusSteps.findIndex(s => s.status === project.status) >= idx;
                    return (
                      <React.Fragment key={step.label}>
                        <div className="flex flex-col items-center gap-3 relative">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                             isPast ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-300'
                           }`}>
                              <step.icon size={20} />
                           </div>
                           <span className={`text-[10px] font-black uppercase tracking-widest ${isPast ? 'text-slate-800' : 'text-slate-300'}`}>
                             {step.label}
                           </span>
                        </div>
                        {idx < statusSteps.length - 1 && (
                          <div className={`h-[2px] w-full flex-1 mx-4 rounded-full ${
                            statusSteps.findIndex(s => s.status === project.status) > idx ? 'bg-blue-600' : 'bg-slate-100'
                          }`} />
                        )}
                      </React.Fragment>
                    );
                  })}
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Writer Assigned</p>
                    <p className="text-xs font-black">{project.freelancerId ? `Writer#${project.freelancerId.slice(-4)}` : 'Waitlist'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Left</p>
                    <p className="text-xs font-black">48 Hours</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Placed</p>
                    <p className="text-xs font-black">{new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price</p>
                    <p className="text-xs font-black">₹2,499</p>
                  </div>
               </div>
            </div>

            {/* Submission Area */}
            {project.status === 'COMPLETED' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50/50 border border-green-100 p-8 rounded-[2.5rem] flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-green-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-green-200">
                    <Download size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-green-900 tracking-tight mb-1">Work Submitted!</h3>
                    <p className="text-sm font-medium text-green-600">Your final document is ready for review.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button className="px-8 py-4 bg-white text-green-600 border border-green-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-100 transition-all">
                    REQUEST REVISION
                  </button>
                  <button className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-200 hover:scale-105 transition-all">
                    ACCEPT & DOWNLOAD
                  </button>
                </div>
              </motion.div>
            )}

            {/* Project Details */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <h3 className="text-lg font-black tracking-tight mb-6 italic">Project Requirements</h3>
               <div className="p-6 bg-slate-50 rounded-2xl text-sm leading-relaxed text-slate-600 font-medium whitespace-pre-wrap">
                  {project.description || "No specific requirements provided."}
               </div>
            </div>
          </main>

          {/* Chat Sidebar */}
          <aside className="w-[400px] border-l border-slate-100 bg-white flex flex-col shrink-0">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center text-white">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-tight">Direct Messaging</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Writer Communication</p>
                  </div>
               </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
               <div className="flex items-center gap-3 justify-center mb-4">
                  <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Project Started
                  </div>
               </div>

               {messages.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-full text-center gap-4 opacity-50">
                    <AlertCircle size={32} className="text-slate-300" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No messages yet. Send a note to your writer!</p>
                 </div>
               )}

               {messages.map((msg, idx) => {
                 const isMe = msg.senderId === session.user.id;
                 return (
                   <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                        isMe ? 'bg-black text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'
                      }`}>
                         {msg.content}
                         <div className={`text-[8px] mt-2 font-bold uppercase opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </div>
                      </div>
                   </div>
                 );
               })}
            </div>

            <form onSubmit={handleSendMessage} className="p-6 border-t border-slate-100 bg-slate-50/30">
               <div className="relative">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message your writer..."
                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-6 pr-24 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button type="button" className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                      <Paperclip size={18} />
                    </button>
                    <button type="submit" className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                      <Send size={18} />
                    </button>
                  </div>
               </div>
               <p className="text-[9px] text-center mt-4 font-black text-slate-300 uppercase tracking-widest">
                 Safety Tip: Avoid sharing external contact details.
               </p>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}
