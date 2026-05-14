"use client";
import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronRight, ArrowLeft, Send, Paperclip, 
  CheckCircle2, Clock, PlayCircle, Package,
  User, MessageSquare, Download, AlertCircle,
  Loader2, FileText, Info, ExternalLink, Calendar,
  CreditCard, ShieldCheck, Zap, Edit3, X, Save,
  Plus, Trash2, LayoutGrid, Mic
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useRazorpay } from '@/hooks/useRazorpay';

import servicesData from '@/data/services_data.json';

const SERVICES = Object.values(servicesData.individualServices).flat().map(s => {
  const priceNum = typeof s.price === 'string' 
    ? parseFloat(s.price.replace(/[^\d.]/g, '')) 
    : (s.price || 0);
  return { ...s, price: priceNum || 0 };
});

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const { processPayment } = useRazorpay();
  
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  // Edit States
  const searchParams = useSearchParams();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccessModal(true);
      router.replace(`/student/orders/${id}`);
    }
  }, [searchParams, id, router]);

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [isEditingPackage, setIsEditingPackage] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const scrollRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatFileInputRef = useRef(null);
  const [errorAlert, setErrorAlert] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [chatAttachments, setChatAttachments] = useState([]);
  const [chatUploading, setChatUploading] = useState(false);

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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
        
        if (projRes.ok) {
          const data = await projRes.json();
          setProject(data);
          setEditDescription(data.description || "");
        }
        if (msgRes.ok) {
          const fetchedMessages = await msgRes.json();
          setMessages(fetchedMessages.map(m => ({ ...m, timestamp: new Date(m.createdAt) })));
        }
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
    if (!id || !user?.id) return;
    
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
    socketRef.current = socket;

    socket.emit('join_chat', { 
      projectId: id, 
      userId: user.id, 
      role: 'STUDENT' 
    });

    socket.on('receive_message', (data) => {
      setMessages((prev) => {
        // Prevent duplicate messages
        if (prev.some(m => m.id === data.id)) return prev;
        return [...prev, { ...data, timestamp: new Date(data.timestamp) }];
      });
    });

    socket.on('error_alert', (alert) => {
      setErrorAlert(alert.message);
      setTimeout(() => setErrorAlert(null), 5000);
    });

    socket.on('project_status_changed', async (data) => {
      if (data.projectId === id) {
        // Re-fetch project data to get updated relations (like assigned freelancer)
        try {
          const res = await fetch(`/api/projects/${id}`);
          if (res.ok) {
            const updatedProject = await res.json();
            setProject(updatedProject);
          }
        } catch (error) {
          console.error("Failed to re-fetch project on status change:", error);
          setProject(prev => ({ ...prev, status: data.status }));
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id, user?.id]);

  const handleUpdateProject = async (data) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setProject(prev => ({ ...prev, ...data }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update failed:", error);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveDescription = async () => {
    const success = await handleUpdateProject({ description: editDescription });
    if (success) setIsEditingDescription(false);
  };

  const handleChangePackage = async (service) => {
    const success = await handleUpdateProject({ 
      serviceType: service.id,
      amount: service.price,
      title: `${service.name} Order`
    });
    if (success) setIsEditingPackage(false);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const body = new FormData();
        body.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body });
        if (!res.ok) throw new Error('Upload failed');
        return await res.json();
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const newAttachments = [...(project.attachments || []), ...uploadedFiles];
      await handleUpdateProject({ attachments: newAttachments });
    } catch (error) {
      console.error('File upload failure:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = async (url) => {
    const newAttachments = project.attachments.filter(a => a.url !== url);
    await handleUpdateProject({ attachments: newAttachments });
  };

  // Helper to get effective amount
  const getEffectiveAmount = () => {
    if (project?.amount && project.amount > 0) return project.amount;
    const service = SERVICES.find(s => s.id === project?.serviceType);
    return service ? service.price : 0;
  };

  const handlePayment = async () => {
    const finalAmount = getEffectiveAmount();
    if (!project || finalAmount === 0) {
      alert("Invalid order amount. Please select a package.");
      return;
    }
    
    setPaymentLoading(true);
    
    try {
      await processPayment({
        amount: finalAmount,
        projectId: project.id,
        onSuccess: async (response) => {
          // After payment, update status to ASSIGNED locally and on server
          const success = await handleUpdateProject({ status: 'ASSIGNED' });
          if (success) {
            if (socketRef.current) {
               socketRef.current.emit('status_update', { projectId: id, status: 'ASSIGNED' });
            }
            router.refresh();
          }
          setPaymentLoading(false);
          setShowSuccessModal(true);
        },
        onError: (err) => {
          console.error("Payment failed:", err);
          setPaymentLoading(false);
        }
      });
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      if (res.ok) {
        if (socketRef.current) {
          socketRef.current.emit('status_update', { projectId: id, status: 'COMPLETED' });
        }
        setProject(prev => ({ ...prev, status: 'COMPLETED' }));
      }
    } catch (error) {
      console.error("Failed to approve project:", error);
    }
  };

  const handleRevisionRequest = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REVISION' }),
      });

      if (res.ok) {
        if (socketRef.current) {
          socketRef.current.emit('status_update', { projectId: id, status: 'REVISION' });
        }
        setProject(prev => ({ ...prev, status: 'REVISION' }));
        
        // Auto-send a message in chat about the revision
        const userId = user?.id || session?.user?.id;
        const msgRes = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: "⚠️ I have requested a revision for this draft. Please check the requirements again.",
            senderId: userId,
            senderRole: 'STUDENT',
            chatType: 'CLIENT_CHAT',
            projectId: id,
          }),
        });

        if (msgRes.ok) {
           const savedMsg = await msgRes.json();
           if (socketRef.current) {
              socketRef.current.emit('send_message', {
                  id: savedMsg.id,
                  content: savedMsg.content,
                  projectId: id,
                  senderId: userId,
                  senderRole: 'STUDENT'
              });
           }
        }
      }
    } catch (error) {
      console.error("Failed to request revision:", error);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    const userId = user?.id || session?.user?.id;
    if (!userId) return;

    const tmpMsg = {
      content: newMessage,
      senderId: userId,
      senderRole: 'STUDENT',
      chatType: 'CLIENT_CHAT',
      projectId: id,
      attachments: chatAttachments
    };

    setNewMessage("");
    setChatAttachments([]);

    try {
      // 1. Save to database first via messages API
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tmpMsg),
      });
      
      const savedMessage = await res.json();
      
      // 2. Emit via socket
      if (socketRef.current) {
          socketRef.current.emit('send_message', {
              id: savedMessage.id,
              content: savedMessage.content,
              attachments: savedMessage.attachments,
              projectId: id,
              senderId: userId,
              senderRole: 'STUDENT',
              chatType: 'CLIENT_CHAT'
          });
      }
    } catch (error) {
      console.error("Message send failed:", error);
      setErrorAlert("Failed to send message.");
      setTimeout(() => setErrorAlert(null), 5000);
    }
  };

  const handleChatFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setChatUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const body = new FormData();
        body.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body });
        if (!res.ok) throw new Error('Upload failed');
        return await res.json();
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setChatAttachments(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('Chat file upload failure:', error);
      setErrorAlert("File upload failed. Please try again.");
      setTimeout(() => setErrorAlert(null), 5000);
    } finally {
      setChatUploading(false);
      if (chatFileInputRef.current) chatFileInputRef.current.value = '';
    }
  };

  const removeChatAttachment = (url) => {
    setChatAttachments(prev => prev.filter(a => a.url !== url));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const statusSteps = [
    { label: 'Payment', status: 'CREATED', icon: CreditCard },
    { label: 'Assigned', status: 'ASSIGNED', icon: User },
    { label: 'In Progress', status: 'IN_PROGRESS', icon: PlayCircle },
    { label: 'Review', status: 'REVIEW', icon: Package },
    { label: 'Completed', status: 'COMPLETED', icon: CheckCircle2 },
  ];

  const getStatusStepIndex = (status) => {
      const idx = statusSteps.findIndex(s => s.status === status);
      return idx === -1 ? 0 : idx;
  };

  if (loading) return (
    <div className="flex bg-[#FBFBFB] min-h-screen">
      <Sidebar role="STUDENT" />
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-[#002D5B] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="text-[#002D5B] animate-pulse" size={20} />
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider animate-pulse">Syncing Secure Environment...</p>
      </div>
    </div>
  );

  if (!project) return (
    <div className="flex bg-[#FBFBFB] min-h-screen">
      <Sidebar role="STUDENT" />
      <div className="flex-1 flex items-center justify-center p-8">
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="text-center p-12 bg-white border border-[#E5E5E5] rounded-xl max-w-md shadow-2xl"
         >
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Node Not Found</h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">The project stream you are attempting to access is either encrypted, archived, or does not exist.</p>
            <button onClick={() => router.push('/student/orders')} className="w-full btn-primary py-3 rounded-lg flex items-center justify-center gap-2">
              <ArrowLeft size={16} /> Return to Orders
            </button>
         </motion.div>
      </div>
    </div>
  );

  const currentStepIndex = getStatusStepIndex(project.status);
  const needsPayment = project.status === 'CREATED' || project.status === 'PENDING_PAYMENT' || project.status === 'AWAITING_PAYMENT';
  const isCancellable = project.status === 'CREATED';
  const currentService = SERVICES.find(s => s.id === project.serviceType);
  const effectiveAmount = getEffectiveAmount();

  return (
    <div className="flex bg-[#FBFBFB] min-h-screen text-[#111111] font-sans overflow-hidden">
      <Sidebar role="STUDENT" />
      
      {/* Success Modal Overlay */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-[#0a192f]" />
               
               <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                 <CheckCircle2 size={40} />
               </div>
               
               <h2 className="text-3xl font-black text-center text-[#0a192f] mb-4 tracking-tight uppercase italic">Payment Successful!</h2>
               
               <p className="text-slate-500 text-center font-medium leading-relaxed mb-8">
                 Congratulations! Your order is secured and we are now processing your request. Please wait a short while as our system assigns the perfect specialist for your domain. We will notify you in the chat once an expert is allocated.
               </p>
               
               <button 
                 onClick={() => setShowSuccessModal(false)}
                 className="w-full bg-[#0a192f] text-white py-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
               >
                 Go to Order Chat
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Premium Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5] flex items-center justify-between px-10 shrink-0 z-20">
          <div className="flex items-center gap-6">
             <button 
               onClick={() => router.push('/student/orders')} 
               className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#002D5B] transition-all"
             >
               <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-blue-50 transition-colors">
                 <ArrowLeft size={14} />
               </div>
               BACK TO HISTORY
             </button>
             <div className="h-6 w-px bg-slate-200" />
             <div className="flex flex-col">
               <h1 className="text-base font-black text-slate-900 tracking-tight">{project.title}</h1>
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 <span className="text-[#0067B8]">ORDER ID: XW-{project.id.slice(-5).toUpperCase()}</span>
                 <span>•</span>
                 <span>{new Date(project.createdAt).toLocaleDateString()}</span>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all ${
               needsPayment ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' :
               project.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
               'bg-blue-50 text-[#0067B8] border-blue-100'
             }`}>
               {project.status.replace('_', ' ')}
             </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <main className="flex-1 flex flex-col p-8 overflow-y-auto space-y-8 bg-slate-50/30">
            
            {/* Payment Section (Conditional) */}
            <AnimatePresence>
              {needsPayment && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-[#002D5B] rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20 shrink-0"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <CreditCard size={120} />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-[10px] uppercase tracking-widest">
                        <ShieldCheck size={14} /> Secure Payment Required
                      </div>
                      <h2 className="text-2xl font-black tracking-tight">Finalize Your Order Initiation</h2>
                      <p className="text-blue-100/70 text-sm max-w-lg leading-relaxed font-medium">
                        To activate your academic specialist and begin the research phase, please complete the secure transaction. Your funds are held in escrow until delivery.
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-4">
                         <div className="px-3 py-1.5 bg-white/10 rounded-lg flex items-center gap-2 border border-white/10">
                            <Package size={14} className="text-blue-200" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{currentService?.name || project.serviceType || 'Standard Package'}</span>
                         </div>
                         {isCancellable && (
                            <button 
                              onClick={() => setIsEditingPackage(!isEditingPackage)}
                              className="text-[10px] font-black uppercase tracking-widest text-blue-200 hover:text-white flex items-center gap-2 transition-colors ml-2"
                            >
                               <Edit3 size={14} /> {isEditingPackage ? 'CLOSE SELECTOR' : 'CHANGE PACKAGE'}
                            </button>
                         )}
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/10 flex flex-col items-center gap-4 min-w-[240px]">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-3xl font-black tracking-tighter text-white">₹{effectiveAmount}</p>
                      </div>
                      <button 
                        onClick={handlePayment}
                        disabled={paymentLoading || updating || effectiveAmount === 0}
                        className="w-full h-12 bg-white text-[#002D5B] rounded-lg font-black text-[11px] uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
                      >
                        {paymentLoading ? <Loader2 className="animate-spin" size={16} /> : <><CreditCard size={16} /> PAY SECURELY NOW</>}
                      </button>
                    </div>
                  </div>

                  {/* Package Selector (Expanded) */}
                  <AnimatePresence>
                    {isEditingPackage && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 mt-8 border-t border-white/10">
                           {SERVICES.map((s) => (
                             <button 
                               key={s.id}
                               disabled={updating}
                               onClick={() => handleChangePackage(s)}
                               className={`p-5 rounded-xl border-2 transition-all text-left group ${
                                 project.serviceType === s.id 
                                 ? 'bg-white border-white' 
                                 : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                               }`}
                             >
                                <div className={`w-8 h-8 rounded-lg mb-3 flex items-center justify-center ${project.serviceType === s.id ? 'bg-[#002D5B] text-white' : 'bg-white/10 text-white'}`}>
                                   <FileText size={16} />
                                </div>
                                <h4 className={`text-xs font-black uppercase tracking-tight ${project.serviceType === s.id ? 'text-[#002D5B]' : 'text-white'}`}>{s.name}</h4>
                                <p className={`text-[9px] font-bold mt-1 ${project.serviceType === s.id ? 'text-slate-500' : 'text-blue-200'}`}>₹{s.price}</p>
                                {project.serviceType === s.id && (
                                   <div className="mt-3 py-1 bg-[#002D5B]/5 text-[#002D5B] text-[8px] font-black text-center rounded uppercase tracking-widest">CURRENT SELECTION</div>
                                )}
                             </button>
                           ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Premium Stepper Section */}
            <div className="bg-white p-10 border border-[#E5E5E5] rounded-2xl shadow-sm relative overflow-hidden shrink-0">
               <div className="flex items-center justify-between mb-10 px-4 relative z-10">
                  {statusSteps.map((step, idx) => {
                    const isPast = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;
                    return (
                      <React.Fragment key={step.label}>
                        <div className="flex flex-col items-center gap-3 relative">
                           <motion.div 
                             initial={false}
                             animate={{ 
                               backgroundColor: isPast ? '#002D5B' : '#FFFFFF',
                               borderColor: isPast ? '#002D5B' : '#E5E5E5',
                               color: isPast ? '#FFFFFF' : '#CBD5E1',
                               scale: isCurrent ? 1.1 : 1
                             }}
                             className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all shadow-sm ${
                               isCurrent ? 'ring-8 ring-blue-50' : ''
                             }`}
                           >
                              <step.icon size={20} />
                           </motion.div>
                           <span className={`text-[10px] font-black uppercase tracking-widest ${isPast ? 'text-slate-900' : 'text-slate-300'}`}>
                             {step.label}
                           </span>
                        </div>
                        {idx < statusSteps.length - 1 && (
                          <div className="h-[2px] w-full flex-1 mx-4 bg-slate-100 relative">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: currentStepIndex > idx ? '100%' : '0%' }}
                              className="absolute inset-0 bg-[#002D5B]"
                            />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
               </div>
               
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-slate-50">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialist Team</p>
                    <div className="flex flex-col gap-2">
                      {project.freelancer && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center text-[#0067B8]">
                            <ShieldCheck size={12} />
                          </div>
                          <p className="text-xs font-bold text-slate-800">{project.freelancer.name} (Lead)</p>
                        </div>
                      )}
                      {project.collaborators?.map(collab => (
                        <div key={collab.id} className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-slate-50 rounded-md flex items-center justify-center text-slate-400">
                            <User size={12} />
                          </div>
                          <p className="text-xs font-bold text-slate-600">{collab.name}</p>
                        </div>
                      ))}
                      {!project.freelancer && (
                        <p className="text-xs font-bold text-amber-500 uppercase tracking-tight">
                          {project.status === 'CREATED' ? 'WAITING FOR PAYMENT' : 'ALLOCATING TEAM...'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Target</p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-amber-50 rounded-md flex items-center justify-center text-amber-600">
                        <Calendar size={12} />
                      </div>
                      <p className="text-xs font-bold text-slate-800">{new Date(project.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Investment</p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-emerald-50 rounded-md flex items-center justify-center text-emerald-600">
                        <CreditCard size={12} />
                      </div>
                      <p className="text-xs font-bold text-slate-800">₹{effectiveAmount || '---'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Domain</p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-50 rounded-md flex items-center justify-center text-purple-600">
                        <Info size={12} />
                      </div>
                      <p className="text-xs font-bold text-slate-800">{currentService?.name || project.serviceType || 'Standard'}</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Delivery Action Card */}
            {project.status === 'REVIEW' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500 rounded-2xl p-10 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-emerald-500/20 border border-emerald-400 shrink-0"
              >
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white/20 text-white rounded-2xl flex items-center justify-center backdrop-blur-md shadow-xl border border-white/20">
                    <Package size={36} />
                  </div>
                  <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-2xl font-black tracking-tight">Draft Ready for Review</h3>
                    <p className="text-emerald-50/80 text-sm font-medium max-w-sm">The specialist has submitted the final files. Please review them carefully before final approval.</p>
                  </div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button 
                    onClick={handleRevisionRequest}
                    className="flex-1 md:flex-none h-14 px-8 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all backdrop-blur-md"
                  >
                    REVISION REQUEST
                  </button>
                  <button 
                    onClick={handleApprove}
                    className="flex-1 md:flex-none h-14 px-10 bg-white text-emerald-600 rounded-xl font-black text-[11px] uppercase tracking-widest hover:shadow-2xl transition-all active:scale-95"
                  >
                    APPROVE & ARCHIVE
                  </button>
                </div>
              </motion.div>
            )}

            {/* Grid Layout for Requirements & Files */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 shrink-0">
                {/* Requirements Card */}
                <div className="bg-white p-8 border border-[#E5E5E5] rounded-2xl shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Project Parameters</h3>
                      {needsPayment && (
                        <button 
                          onClick={() => setIsEditingDescription(!isEditingDescription)}
                          className="w-8 h-8 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-[#0067B8] rounded-lg flex items-center justify-center transition-all"
                        >
                           {isEditingDescription ? <X size={16} /> : <Edit3 size={16} />}
                        </button>
                      )}
                    </div>
                    
                    <div className="flex-1 relative">
                       {isEditingDescription ? (
                         <div className="space-y-4 h-full flex flex-col">
                            <textarea 
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full flex-1 p-6 bg-slate-50 border-2 border-blue-100 rounded-xl text-xs leading-[1.8] text-slate-600 font-medium focus:bg-white focus:border-[#0067B8] outline-none transition-all resize-none"
                              placeholder="Detail your background..."
                            />
                            <button 
                              onClick={handleSaveDescription}
                              disabled={updating}
                              className="h-12 w-full bg-[#002D5B] text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                               {updating ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} SAVE UPDATED BRIEF
                            </button>
                         </div>
                       ) : (
                         <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-xs leading-[1.8] text-slate-600 font-medium whitespace-pre-wrap min-h-[180px]">
                            {project.description || "No specific detailed briefing provided for this order."}
                         </div>
                       )}
                    </div>
                </div>

                {/* Attachments Card */}
                <div className="bg-white p-8 border border-[#E5E5E5] rounded-2xl shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Source Artifacts</h3>
                      {project.status !== 'COMPLETED' && (
                        <div className="flex items-center gap-2">
                           <input type="file" className="hidden" ref={fileInputRef} multiple onChange={handleFileUpload} />
                           <button 
                             onClick={() => fileInputRef.current?.click()}
                             disabled={uploading || updating}
                             className="w-8 h-8 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-[#0067B8] rounded-lg flex items-center justify-center transition-all"
                           >
                              {uploading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                           </button>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                        {project.attachments?.length > 0 ? project.attachments.map((file, idx) => (
                            <motion.div 
                              whileHover={{ x: 5 }}
                              key={idx} 
                              className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl group hover:border-[#0067B8] hover:shadow-lg hover:shadow-blue-900/5 transition-all"
                            >
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-10 h-10 bg-slate-50 flex items-center justify-center text-slate-400 rounded-xl group-hover:bg-blue-50 group-hover:text-[#0067B8] transition-colors">
                                        <FileText size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{file.name}</span>
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ASSET NODE</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2.5 text-slate-400 hover:text-[#0067B8] hover:bg-blue-50 rounded-lg transition-all">
                                        <Download size={16} />
                                    </a>
                                    {project.status !== 'COMPLETED' && (
                                       <button 
                                         onClick={() => handleDeleteFile(file.url)}
                                         disabled={updating}
                                         className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                       >
                                          <Trash2 size={16} />
                                       </button>
                                    )}
                                </div>
                            </motion.div>
                        )) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl p-10 text-center text-slate-300">
                                <FileText size={32} className="mb-4 opacity-50" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Repository is Empty</p>
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
                     <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20">
                       <MessageSquare size={20} />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-slate-900 tracking-tight">
                           {project.freelancer?.name || 'Support Node'}
                        </h4>
                        <p className="text-[10px] text-[#0067B8] font-bold uppercase tracking-widest">
                           {project.freelancerId ? 'Specialist Stream' : 'Secured Stream'}
                        </p>
                     </div>
                  </div>
                  <div className="flex -space-x-3">
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm flex items-center justify-center text-[8px] font-black text-slate-500 uppercase">
                       YOU
                    </div>
                    {project.freelancerId && (
                       <div className="w-8 h-8 rounded-full border-2 border-white bg-[#002D5B] overflow-hidden shadow-sm flex items-center justify-center text-[8px] font-black text-white uppercase">
                          SP
                       </div>
                    )}
                  </div>
                </div>
            </div>

            <div 
              ref={scrollRef}
              className={`flex-1 overflow-y-auto p-8 space-y-8 bg-[#FBFBFB]/50 transition-all ${needsPayment ? 'blur-[2px] grayscale opacity-40 pointer-events-none select-none' : ''}`}
            >
               {messages.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center px-12 space-y-4 opacity-40">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                      <Info size={28} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">System: Handshake Complete. Secure stream initialized. Waiting for protocol exchange.</p>
                 </div>
               ) : (
                  <div className="space-y-8">
                    {messages.map((msg, idx) => {
                        const isMe = msg.senderId === user?.id || msg.senderId === session?.user?.id;
                        return (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              key={idx} 
                              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-5 py-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                                        isMe ? 'bg-[#002D5B] text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                                    }`}>
                                        {msg.content || msg.text}
                                        
                                        {msg.attachments?.length > 0 && (
                                          <div className={`mt-3 flex flex-col gap-2 ${isMe ? 'items-end' : 'items-start'}`}>
                                            {msg.attachments.map((file, fidx) => {
                                              const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.url);
                                              if (isImg) {
                                                return (
                                                  <a key={fidx} href={file.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-white/20 shadow-md transition-transform hover:scale-[1.02]">
                                                    <img src={file.url} alt={file.name} className="max-w-[200px] max-h-[200px] object-cover" />
                                                  </a>
                                                );
                                              }
                                              return (
                                                <a key={fidx} href={file.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-md ${isMe ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}>
                                                  <FileText size={18} className={isMe ? 'text-blue-200' : 'text-[#002D5B]'} />
                                                  <div className="flex flex-col min-w-0">
                                                    <span className={`text-[10px] font-bold truncate max-w-[120px] ${isMe ? 'text-white' : 'text-slate-700'}`}>{file.name}</span>
                                                    <span className={`text-[8px] font-black uppercase tracking-widest ${isMe ? 'text-blue-200/60' : 'text-slate-400'}`}>DOCUMENT</span>
                                                  </div>
                                                  <ExternalLink size={14} className={isMe ? 'text-white/40' : 'text-slate-300'} />
                                                </a>
                                              );
                                            })}
                                          </div>
                                        )}
                                    </div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2 px-1">
                                        {isMe ? 'CLIENT CONSOLE' : ((msg.sender?.role === 'FREELANCER' || msg.senderRole === 'FREELANCER') ? `SPECIALIST: ${msg.sender?.name || 'Assigned'}` : 'OPERATOR')} • {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString()}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                  </div>
               )}
            </div>

            <div className="p-8 border-t border-[#E5E5E5] bg-white relative">
               {needsPayment && (
                 <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
                       <ShieldCheck size={24} />
                    </div>
                    <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Stream Locked</h5>
                    <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight max-w-[200px]">
                      Complete payment to initialize the encrypted specialist stream.
                    </p>
                 </div>
               )}
                <AnimatePresence>
                 {errorAlert && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0 }}
                     className="absolute -top-12 left-8 right-8 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start gap-2 text-xs font-bold z-50 shadow-sm"
                   >
                     <AlertCircle size={14} className="mt-0.5 shrink-0" />
                     <p>{errorAlert}</p>
                   </motion.div>
                 )}
               </AnimatePresence>
               
                <form onSubmit={handleSendMessage} className="space-y-6">
                   <div className="relative group">
                     {chatAttachments.length > 0 && (
                       <div className="flex items-center gap-3 overflow-x-auto pb-4 px-2 no-scrollbar">
                         {chatAttachments.map((file, aidx) => {
                           const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.url);
                           return (
                             <motion.div 
                               initial={{ scale: 0.8, opacity: 0 }}
                               animate={{ scale: 1, opacity: 1 }}
                               key={aidx} 
                               className="relative group/thumb shrink-0"
                             >
                               {isImg ? (
                                 <div className="w-16 h-16 rounded-xl border-2 border-slate-100 overflow-hidden shadow-sm">
                                   <img src={file.url} alt="thumb" className="w-full h-full object-cover" />
                                 </div>
                               ) : (
                                 <div className="w-16 h-16 rounded-xl border-2 border-slate-100 bg-slate-50 flex flex-col items-center justify-center p-2 text-center shadow-sm">
                                   <FileText size={18} className="text-[#002D5B] mb-1" />
                                   <span className="text-[8px] font-bold text-slate-500 truncate w-full">{file.name}</span>
                                 </div>
                               )}
                               <button 
                                 type="button"
                                 onClick={() => removeChatAttachment(file.url)}
                                 className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transform translate-y-1 opacity-0 group-hover/thumb:translate-y-0 group-hover/thumb:opacity-100 transition-all"
                               >
                                 <X size={12} />
                               </button>
                             </motion.div>
                           );
                         })}
                       </div>
                     )}

                     <textarea 
                         rows={3}
                         disabled={needsPayment || chatUploading}
                         value={newMessage}
                         onKeyDown={handleKeyDown}
                         onChange={(e) => setNewMessage(e.target.value)}
                         placeholder={chatUploading ? "Uploading assets..." : "Initialize message exchange..."}
                         className="w-full bg-slate-50 border-2 border-transparent group-hover:bg-white group-hover:border-slate-100 rounded-2xl p-5 pr-14 text-xs font-medium focus:bg-white focus:border-[#0067B8]/20 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none shadow-inner disabled:opacity-50"
                     />
                     <div className="absolute right-4 bottom-4 flex items-center gap-3 text-slate-300">
                         {chatUploading && <Loader2 className="animate-spin text-[#0067B8]" size={18} />}
                         <button 
                           type="button" 
                           onClick={startListening}
                           className={`transition-all ${isListening ? 'text-red-500 animate-pulse' : 'hover:text-[#0067B8]'}`}
                         >
                            <Mic size={18} />
                         </button>
                         <input 
                           type="file" 
                           className="hidden" 
                           ref={chatFileInputRef} 
                           multiple 
                           accept="image/*,.pdf,.doc,.docx" 
                           onChange={handleChatFileUpload} 
                         />
                         <Paperclip 
                           size={18} 
                           className={`cursor-pointer transition-colors ${chatUploading ? 'opacity-50 pointer-events-none' : 'hover:text-[#0067B8]'}`} 
                           onClick={() => chatFileInputRef.current?.click()}
                         />
                     </div>
                   </div>
                   <button 
                     disabled={(!newMessage.trim() && chatAttachments.length === 0) || needsPayment || chatUploading}
                     type="submit" 
                     className="w-full h-14 bg-slate-900 text-white flex items-center justify-center gap-4 font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-2xl shadow-slate-900/10 active:scale-95"
                   >
                     {chatUploading ? "UPLOADING ASSETS..." : <>{newMessage.trim() || chatAttachments.length === 0 ? "TRANSMIT PACKET" : "SEND ASSETS"} <Send size={16} /></>}
                   </button>
                </form>
               <div className="mt-6 p-4 bg-slate-50 rounded-xl flex items-start gap-4">
                  <ShieldCheck size={18} className="text-[#0067B8] mt-0.5 shrink-0" />
                  <p className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase tracking-tight">Security Protocol: Direct identifier exchange is restricted to maintain platform integrity and user privacy.</p>
               </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
