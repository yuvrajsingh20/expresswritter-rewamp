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
  Search, ArrowRight, Download, Mic, Terminal, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import servicesData from '@/data/services_data.json';

const SERVICES = Object.values(servicesData.individualServices).flat();
const getServiceName = (id) => SERVICES.find(s => s.id === id)?.name || id;

// ── CUSTOM DIGITAL MATRIX EFFECT ──
function MatrixRain({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 400;
      canvas.height = canvas.parentElement?.clientHeight || 300;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const katakana = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const alphabet = katakana.split("");
    const fontSize = 10;
    const columns = canvas.width / fontSize;
    const rainDrops = [];
    for (let x = 0; x < columns; x++) {
      rainDrops[x] = Math.random() * -100;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(12, 16, 23, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f8';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet[Math.floor(Math.random() * alphabet.length)];
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [active]);

  if (!active) return null;
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none opacity-[0.15] z-0" 
      style={{ mixBlendMode: 'screen' }} 
    />
  );
}

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
  const [chatAttachments, setChatAttachments] = useState([]);
  const [chatUploading, setChatUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const scrollRef = useRef(null);
  const socketRef = useRef(null);

  // ── SPECIALIST TERMINAL OPERATIONS ──
  const [isTerminalMode, setIsTerminalMode] = useState(true);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showMatrix, setShowMatrix] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    { type: 'system', text: '==================================================\n   SECURE TERMINAL NODE • CODENAME: XW-SPECIALIST\n==================================================' },
    { type: 'output', text: 'Cryptographic sandbox stream initialized.\nSyncing PostgreSQL datastore: OK\nType "help" or click suggestion pills below to begin.' }
  ]);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollTop = terminalEndRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  useEffect(() => {
    if (!project) return;
    const timer = setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        { type: 'system', text: `\n[SYSTEM BOOT SUCCESSFUL]\n  Target Node ID: XW-${project.id.slice(-5).toUpperCase()}\n  Operational Mode: SECURE COMMAND SHELL ACTIVE\n  Type chat <msg> to transmit message from CLI.` }
      ]);
    }, 1200);
    return () => clearTimeout(timer);
  }, [project]);

  const handleSendMessageDirectly = async (msgText) => {
    if (!msgText.trim()) return;
    const userId = user?.id || session?.user?.id;
    if (!userId) return;

    const optimisticMsg = {
      id: `tmp-${Date.now()}`,
      content: msgText,
      senderId: userId,
      senderRole: 'FREELANCER',
      chatType: 'CLIENT_CHAT',
      projectId: id,
      timestamp: new Date(),
      createdAt: new Date()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: msgText,
          senderId: userId,
          senderRole: 'FREELANCER',
          chatType: 'CLIENT_CHAT',
          projectId: id,
          attachments: []
        })
      });
      
      const savedMessage = await res.json();

      if (project?.status === 'ASSIGNED' || project?.status === 'IN_PROGRESS') {
        const isFirstMsg = !messages.some(m => m.senderRole === 'FREELANCER' && m.id !== optimisticMsg.id);
        if (isFirstMsg) fireSLA('FIRST_REPLY');
      }

      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? { ...savedMessage, timestamp: new Date(savedMessage.createdAt) } : m));

      if (socketRef.current) {
          socketRef.current.emit('send_message', {
              id: savedMessage.id,
              content: savedMessage.content,
              attachments: savedMessage.attachments,
              projectId: id,
              senderId: userId,
              senderRole: 'FREELANCER',
              chatType: 'CLIENT_CHAT'
          });
      }
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      console.error("Message delivery failed:", error);
    }
  };

  const handleTerminalSubmit = (e) => {
    e?.preventDefault();
    const input = terminalInput.trim();
    if (!input) return;

    const newLogs = [...terminalLogs, { type: 'input', text: `specialist@XW-NODE:~$ ${input}` }];
    const parts = input.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    let reply = '';
    let replyType = 'output';

    switch (command) {
      case 'help':
      case '/help':
        reply = `OPERATIONAL DEPLOYMENT COMMAND GUIDE:\n` +
                `  help         - Print this command help matrix\n` +
                `  brief        - Decode original client academic description\n` +
                `  status       - Inspect project operational phase details\n` +
                `  files        - List active workspace delivery & briefing assets\n` +
                `  payouts      - Retrieve milestone financial ledger\n` +
                `  deadline     - Run timeline count calculations\n` +
                `  chat [msg]   - Transmit secure message broadcast to student\n` +
                `  system       - Diagnose technical sandbox variables\n` +
                `  matrix       - Toggle neural code cascade stream\n` +
                `  clear        - Flush scrollback screen buffer`;
        break;
      case 'brief':
      case '/brief':
        reply = `[DECRYPTED BRIEFING TRANSCRIPT]\n"${project?.description || 'No detailed brief available.'}"`;
        replyType = 'system';
        break;
      case 'status':
      case '/status':
        reply = `NODE INTEGRITY SUMMARY:\n` +
                `  Node ID      : XW-${id.slice(-5).toUpperCase()}\n` +
                `  Brief Title  : ${project?.title}\n  Service      : ${getServiceName(project?.serviceType)}\n` +
                `  Active Phase : ${project?.status?.replace('_', ' ')}\n` +
                `  Pipeline     : SECURE SOCKETS ESTABLISHED`;
        replyType = 'system';
        break;
      case 'files':
      case '/files':
        const filesList = project?.attachments?.length > 0
          ? project.attachments.map((f, i) => `  [${i+1}] ${f.name} (Tag: ${f.type || 'BRIEF_FILE'})`).join('\n')
          : '  No registered assets detected in this case node.';
        reply = `WORKSPACE ASSET REGISTRY:\n${filesList}`;
        break;
      case 'payouts':
      case '/payouts':
        const totalVal = invoices.reduce((acc, curr) => acc + curr.amount, 0);
        reply = `FINANCIAL CLEARANCE LEDGER:\n` +
                `  Milestone Transactions: ${invoices.length} mapped\n` +
                `  Total Accrued Amount  : ₹${totalVal.toLocaleString()}\n` +
                `  Ledger Verification   : AUTHENTICATED`;
        break;
      case 'deadline':
      case '/deadline':
        const timeRemaining = new Date(project?.deadline) - new Date();
        if (timeRemaining < 0) {
          reply = `TIMELINE ASSESSMENT:\n  Operational deadline elapsed. Case node in post-delivery buffer.`;
        } else {
          const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const mins = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
          
          const totalDuration = new Date(project?.deadline) - new Date(project?.createdAt);
          const elapsed = new Date() - new Date(project?.createdAt);
          const pct = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
          const barChars = Math.round(pct / 5);
          const progressStr = `[${'#'.repeat(barChars)}${'.'.repeat(20 - barChars)}] ${pct}% elapsed`;
          
          reply = `TIMELINE ASSESSMENT:\n` +
                  `  Time Remaining  : ${days}d ${hours}h ${mins}m\n` +
                  `  Case Timeline   : ${progressStr}\n` +
                  `  Action Required : Ensure deliverable uploads prior to expiration.`;
        }
        break;
      case 'chat':
      case '/chat':
        if (!args.trim()) {
          reply = `ERROR: chat command requires a message. Example: chat Completed thesis revision.`;
          replyType = 'error';
        } else {
          handleSendMessageDirectly(args);
          reply = `[TRANSMITTING SECURE BROADCAST PACKET...]\n  Packet Content: "${args}"\n  Broadcast Status: SENT`;
          replyType = 'system';
        }
        break;
      case 'system':
      case '/system':
        reply = `SANDBOX DIAGNOSTICS:\n` +
                `  Terminal core : Quantum CLI Client v1.0.4\n` +
                `  Framework     : Next.js + React Virtual DOM\n` +
                `  DB Link       : PostgreSQL via Prisma Client\n` +
                `  Socket Status : Channel Online (Realtime Active)\n` +
                `  Diagnostics   : ALL SYSTEMS NOMINAL`;
        break;
      case 'matrix':
      case '/matrix':
        setShowMatrix(!showMatrix);
        reply = showMatrix ? `[Neural Rain Matrix: DE-ACTIVATED]` : `[Neural Rain Matrix: ACTIVATED]`;
        break;
      case 'clear':
      case '/clear':
        setTerminalLogs([]);
        setTerminalInput('');
        return;
      default:
        reply = `Command not recognized: '${command}'. Type 'help' for the guidelines matrix.`;
        replyType = 'error';
    }

    setTerminalLogs([...newLogs, { type: replyType, text: reply }]);
    setTerminalInput('');
    setTerminalHistory([...terminalHistory, input]);
    setHistoryIndex(-1);
  };

  const handleTerminalKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (terminalHistory.length === 0) return;
      const nextIndex = historyIndex === -1 ? terminalHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setTerminalInput(terminalHistory[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex === terminalHistory.length - 1) {
        setHistoryIndex(-1);
        setTerminalInput('');
      } else {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setTerminalInput(terminalHistory[nextIndex]);
      }
    }
  };

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
    
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
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

    const optimisticMsg = {
      id: `tmp-${Date.now()}`,
      content: newMessage,
      senderId: userId,
      senderRole: 'FREELANCER',
      chatType: 'CLIENT_CHAT',
      projectId: id,
      timestamp: new Date(),
      createdAt: new Date()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    const msgText = newMessage;
    const atts = chatAttachments;
    setNewMessage("");
    setChatAttachments([]);

    try {
      // 1. Save to database first via messages API
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: msgText,
          senderId: userId,
          senderRole: 'FREELANCER',
          chatType: 'CLIENT_CHAT',
          projectId: id,
          attachments: atts
        })
      });
      
      const savedMessage = await res.json();

      // Fire FIRST_REPLY SLA if this is the first freelancer message on an ASSIGNED project
      if (project?.status === 'ASSIGNED' || project?.status === 'IN_PROGRESS') {
        const isFirstMsg = !messages.some(m => m.senderRole === 'FREELANCER' && m.id !== optimisticMsg.id);
        if (isFirstMsg) fireSLA('FIRST_REPLY');
      }

      // Replace optimistic message with real saved one
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? { ...savedMessage, timestamp: new Date(savedMessage.createdAt) } : m));

      // 2. Emit via socket
      if (socketRef.current) {
          socketRef.current.emit('send_message', {
              id: savedMessage.id,
              content: savedMessage.content,
              attachments: savedMessage.attachments,
              projectId: id,
              senderId: userId,
              senderRole: 'FREELANCER',
              chatType: 'CLIENT_CHAT'
          });
      }
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      console.error("Message delivery failed:", error);
      setErrorAlert("Failed to send message.");
      setTimeout(() => setErrorAlert(null), 5000);
    }
  };

  const removeChatAttachment = (url) => {
    setChatAttachments(prev => prev.filter(a => a.url !== url));
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

  useEffect(() => {
    const chatDocs = messages
      .filter(m => m.attachments?.length > 0)
      .flatMap(m => m.attachments.map(a => ({
        ...a,
        type: 'CHAT',
        sentBy: m.sender?.name || (m.senderId === project?.studentId ? 'Student' : 'You'),
        sentAt: m.createdAt || m.timestamp
      })));
    
    const projectDocs = (project?.attachments || []).map(a => ({
      ...a,
      type: 'PROJECT',
      sentBy: 'System',
      sentAt: project.createdAt
    }));

    setDocuments([...projectDocs, ...chatDocs]);
  }, [messages, project?.studentId, project?.attachments, project?.createdAt]);

  const chatFileInputRef = useRef(null);

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
        const deliveryAsset = { ...uploadData, type: 'DELIVERY' };
        
        await fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'REVIEW',
            attachments: [...(project.attachments || []), deliveryAsset]
          })
        });

        setProject(prev => ({
          ...prev,
          status: 'REVIEW',
          attachments: [...(prev.attachments || []), deliveryAsset]
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

  // ─── SLA trigger helper ──────────────────────────────────────────────
  const fireSLA = async (eventType) => {
    try {
      await fetch('/api/sla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id, eventType }),
      });
    } catch (e) {
      console.warn('SLA fire failed (non-blocking):', e);
    }
  };

   const updateStatus = async (newStatus) => {
    const dbStatus = 
      newStatus === 'In Progress' ? 'IN_PROGRESS' : 
      newStatus === 'Delivered' ? 'COMPLETED' : 
      newStatus === 'Revision' ? 'REVISION' : 
      (newStatus === 'Quality Check' || newStatus === 'Under Review') ? 'REVIEW' : 
      newStatus;

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: dbStatus })
      });
      if (res.ok) {
        setProject({ ...project, status: newStatus });
        if (socketRef.current) {
            socketRef.current.emit('status_update', { projectId: id, status: newStatus });
        }
        // Fire SLA events on key transitions
        if (dbStatus === 'IN_PROGRESS') fireSLA('ASSIGN_ACCEPT');
        if (dbStatus === 'REVIEW') {
          const isRevisionDelivery = project.status === 'REVISION';
          fireSLA(isRevisionDelivery ? 'REVISION_TURNAROUND' : 'DELIVERY');
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
                 <span className="text-[#0067B8]">CASE NODE: XW-{project.id.slice(-5).toUpperCase()}</span>
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
                        {(project.status === 'IN_PROGRESS' || project.status === 'REVISION') && (
                          <button 
                            onClick={() => {
                              const fileInput = document.getElementById('freelancer-deliverable-upload');
                              if (fileInput) fileInput.click();
                            }}
                            className="w-full h-16 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-900/10 active:scale-95 animate-pulse"
                          >
                             <Upload size={20} /> UPLOAD COMPLETED WORK
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
                        {project.status === 'COMPLETED' && (
                          <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4">
                             <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                                <CheckCircle2 size={20} />
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Order Completed</p>
                                <p className="text-xs font-medium text-emerald-600/80 mt-0.5">This project is fully archived and completed.</p>
                             </div>
                          </div>
                        )}
                        <button className="w-full h-14 bg-white border border-[#E5E5E5] text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                           <ShieldCheck size={16} className="text-[#0067B8]" /> PLATFORM SUPPORT
                        </button>
                      </div>
                  </div>

                  <div className="bg-white border border-[#E5E5E5] rounded-3xl shadow-sm overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-[#E5E5E5]">
                        <div className="flex items-center gap-3">
                          <Terminal size={18} className="text-[#0067B8]" />
                          <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Workspace Console Node</h3>
                        </div>
                        {/* Toggle Switches */}
                        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 shrink-0">
                          <button
                            onClick={() => setIsTerminalMode(false)}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!isTerminalMode ? 'bg-[#002D5B] text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
                          >
                            Text Brief
                          </button>
                          <button
                            onClick={() => setIsTerminalMode(true)}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${isTerminalMode ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
                          >
                            Terminal CLI
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                          </button>
                        </div>
                      </div>

                      <div className="p-8">
                        {!isTerminalMode ? (
                          <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs leading-[1.8] text-slate-600 font-medium italic whitespace-pre-wrap min-h-[300px]">
                            "{project.description || 'No detailed briefing provided by the client.'}"
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            {/* CRT Screen Frame */}
                            <div className="relative overflow-hidden min-h-[360px] bg-[#0c1017] rounded-2xl border border-emerald-500/20 p-6 flex flex-col font-mono text-xs text-emerald-400 shadow-2xl terminal-crt">
                              <style dangerouslySetInnerHTML={{__html: `
                                @keyframes crtGlow {
                                  0% { opacity: 0.96; }
                                  50% { opacity: 1; }
                                  100% { opacity: 0.96; }
                                }
                                .terminal-crt {
                                  animation: crtGlow 0.25s infinite;
                                  position: relative;
                                }
                                .terminal-crt::before {
                                  content: " ";
                                  display: block;
                                  position: absolute;
                                  top: 0; left: 0; bottom: 0; right: 0;
                                  background: linear-gradient(rgba(18, 25, 36, 0) 50%, rgba(0, 0, 0, 0.15) 50%);
                                  background-size: 100% 4px;
                                  z-index: 10;
                                  pointer-events: none;
                                }
                              `}} />

                              {/* Matrix Rain Canvas */}
                              <MatrixRain active={showMatrix} />

                              {/* Output Stream */}
                              <div 
                                ref={terminalEndRef}
                                className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-emerald-950 max-h-[260px] relative z-10"
                              >
                                {terminalLogs.map((log, idx) => (
                                  <div 
                                    key={idx} 
                                    className={`whitespace-pre-wrap leading-relaxed ${
                                      log.type === 'input' ? 'text-[#38bdf8] font-bold' :
                                      log.type === 'system' ? 'text-amber-400 font-black' :
                                      log.type === 'error' ? 'text-rose-400 font-bold' : 'text-emerald-400'
                                    }`}
                                  >
                                    {log.text}
                                  </div>
                                ))}
                              </div>

                              {/* Interactive CLI Prompt */}
                              <form 
                                onSubmit={handleTerminalSubmit}
                                className="flex items-center gap-2 mt-4 pt-4 border-t border-emerald-500/10 relative z-10"
                              >
                                <span className="text-[#38bdf8] font-bold">specialist@XW-NODE:~$</span>
                                <input
                                  type="text"
                                  value={terminalInput}
                                  onChange={(e) => setTerminalInput(e.target.value)}
                                  onKeyDown={handleTerminalKeyDown}
                                  placeholder="Type command (e.g. status, brief, payouts)..."
                                  className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-emerald-400 font-mono focus:outline-none placeholder-emerald-900/60"
                                  autoFocus
                                />
                                <button type="submit" className="text-emerald-500 hover:text-emerald-300 font-bold shrink-0 px-2">
                                  ↵
                                </button>
                              </form>
                            </div>

                            {/* Quick Command suggestion badges */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Suggestions:</span>
                              {[
                                { c: 'help', label: 'Help matrix' },
                                { c: 'brief', label: 'Case briefing' },
                                { c: 'status', label: 'Operational phase' },
                                { c: 'deadline', label: 'Countdown timer' },
                                { c: 'payouts', label: 'Finance ledger' },
                                { c: 'matrix', label: 'Toggle digital rain' }
                              ].map(s => (
                                <button
                                  key={s.c}
                                  onClick={() => {
                                    setTerminalInput(s.c);
                                    setTimeout(() => handleTerminalSubmit(), 50);
                                  }}
                                  className="px-3 py-1 bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 rounded-lg text-[9px] font-bold text-slate-500 transition-all font-mono shadow-sm active:scale-95"
                                >
                                  /{s.c}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
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
                             <input id="freelancer-deliverable-upload" type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
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
                              <a href={file.url} download={file.name || 'document'} className="p-2.5 text-slate-400 hover:text-[#0067B8] hover:bg-blue-50 rounded-lg transition-all">
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

                {/* Shared Documents Panel */}
                <div className="bg-white border border-[#E5E5E5] rounded-3xl shadow-sm flex flex-col p-8 space-y-8">
                   <div className="flex items-center justify-between">
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Shared Documents</h3>
                      <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-[#0067B8]">
                         <FileText size={16} />
                      </div>
                   </div>

                   <div className="space-y-4">
                      {documents.length > 0 ? documents.map((doc, idx) => {
                        const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.url);
                        return (
                          <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-[#0067B8] hover:shadow-lg transition-all">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 overflow-hidden">
                                   {isImg ? <img src={doc.url} alt="doc" className="w-full h-full object-cover" /> : <FileText size={20} className="text-slate-400" />}
                                </div>
                                <div>
                                   <p className="text-xs font-bold text-slate-900 truncate max-w-[140px]">{doc.name}</p>
                                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Sent by {doc.sentBy} • {new Date(doc.sentAt).toLocaleDateString()}</p>
                                </div>
                             </div>
                             <div className="flex gap-2">
                               <button onClick={() => setPreviewUrl(doc.url)} className="p-2.5 text-slate-400 hover:text-[#0067B8] hover:bg-blue-50 rounded-lg transition-all">
                                  <Search size={14} />
                               </button>
                               <a 
                                 href={doc.url} 
                                 download={doc.name || 'document'}
                                 className="px-4 py-2 bg-white border border-slate-200 text-[#002D5B] rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#002D5B] hover:text-white transition-all flex items-center gap-2"
                               >
                                  <Download size={12} />
                                  Download
                               </a>
                             </div>
                          </div>
                        );
                      }) : (
                        <div className="py-12 text-center opacity-30">
                           <p className="text-[10px] font-black uppercase tracking-widest italic">No documents shared in chat.</p>
                        </div>
                      )}
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
                                        {isMe ? 'SPECIALIST CONSOLE' : (msg.sender?.role === 'STUDENT' ? 'STUDENT NODE' : 'TEAM SPECIALIST')} • {msg.timestamp ? `${new Date(msg.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} · ${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : `${new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
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
                         disabled={chatUploading}
                         value={newMessage}
                         onKeyDown={handleKeyDown}
                         onChange={(e) => setNewMessage(e.target.value)}
                         placeholder={chatUploading ? "Uploading assets..." : "Type secure transmit packet..."}
                         className="w-full bg-slate-50 border-2 border-transparent group-hover:bg-white group-hover:border-slate-100 rounded-2xl p-5 pr-14 text-xs font-medium focus:bg-white focus:border-[#0067B8]/20 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none shadow-inner"
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
                     disabled={(!newMessage.trim() && chatAttachments.length === 0) || chatUploading}
                     type="submit" 
                     className="w-full h-14 bg-slate-900 text-white flex items-center justify-center gap-4 font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-2xl shadow-slate-900/10 active:scale-95"
                   >
                     {chatUploading ? "UPLOADING ASSETS..." : <>{newMessage.trim() || chatAttachments.length === 0 ? "TRANSMIT PACKET" : "SEND ASSETS"} <Send size={16} /></>}
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
