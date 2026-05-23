"use client";

import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, Paperclip, UserCircle2, MessageSquare, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface OrderChatProps {
  orderId: string;
  projectId: string; // Keep projectId for legacy API compatibility if needed
  userId: string;
  role: "STUDENT" | "FREELANCER" | "SUB_ADMIN" | "ADMIN";
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderRole?: string;
  timestamp: Date;
  isSystem?: boolean;
}

export default function OrderChat({ orderId, projectId, userId, role }: OrderChatProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initial Fetch & Socket Connection
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Fetching via existing messages API (using projectId for now to maintain compatibility)
        const res = await axios.get(`/api/messages?projectId=${projectId}&type=CLIENT_CHAT`);
        const formatted = res.data.map((m: any) => ({
          id: m.id,
          content: m.content,
          senderId: m.senderId,
          timestamp: new Date(m.createdAt),
          senderRole: m.sender?.role
        }));
        setMessages(formatted);
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };

    fetchHistory();

    const newSocket = io();
    setSocket(newSocket);

    newSocket.emit("join_chat", { projectId, userId, role });

    newSocket.on("receive_message", (message: any) => {
      // Avoid duplicates if we already added it via optimistic update or API
      setMessages((prev) => {
        if (prev.find(m => m.id === message.id)) return prev;
        return [...prev, {
          ...message,
          timestamp: new Date(message.timestamp)
        }];
      });
    });

    newSocket.on("error_alert", (alert: { message: string; reasons: any }) => {
      setErrorAlert(alert.message);
      setTimeout(() => setErrorAlert(null), 5000);
    });

    newSocket.on("system_alert", (alert: { message: string; type: string }) => {
      setMessages((prev) => [
        ...prev,
        { 
          id: Date.now().toString(), 
          content: alert.message, 
          senderId: "SYSTEM", 
          timestamp: new Date(),
          isSystem: true
        }
      ]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [orderId, projectId, userId, role]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim() || !socket) return;

    const messageData = {
      projectId,
      content,
      chatType: "CLIENT_CHAT",
      senderId: userId,
      senderRole: role,
    };

    try {
      // 1. Save to database first
      const res = await axios.post("/api/messages", messageData);
      const savedMessage = res.data;

      // 2. Emit to socket with the database ID
      socket.emit("send_message", {
        id: savedMessage.id,
        projectId,
        content: savedMessage.content,
        senderId: userId,
        senderRole: role,
      });
      
      setContent("");
    } catch (err) {
      console.error("Message send failed:", err);
      setErrorAlert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-secondary/30 border border-border rounded-3xl overflow-hidden glass">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
            <UserCircle2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">Secure Order Chat</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Order ID: #{orderId.slice(-6)}</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wide">
          {role}
        </div>
      </div>

      {/* Messages Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/50"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-foreground/20 italic text-sm">
              <MessageSquare size={48} className="mb-2 opacity-10" />
              Your conversation starts here
            </div>
          )}
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isSystem ? 'justify-center' : msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
            >
              {msg.isSystem ? (
                 <div className="bg-muted px-4 py-1.5 rounded-full text-xs text-muted-foreground font-medium flex items-center gap-2">
                   <AlertTriangle size={14} className="text-amber-500" />
                   {msg.content}
                 </div>
              ) : (
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.senderId === userId 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white text-foreground border border-border rounded-tl-none'
                }`}>
                  {msg.senderId !== userId && (
                     <p className="text-[10px] font-black uppercase text-muted-foreground/60 mb-1">{msg.senderRole || 'Specialist'}</p>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <span className={`text-[10px] opacity-60 mt-1 block text-right ${msg.senderId === userId ? 'text-white' : 'text-muted-foreground'}`}>
                    {msg.timestamp 
                      ? `${new Date(msg.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} · ${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                      : ''}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Error Feedback */}
      <AnimatePresence>
        {errorAlert && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-4 mb-4 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start gap-2 shadow-sm text-sm"
          >
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p className="leading-tight">{errorAlert}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Bar */}
      <div className="p-4 bg-secondary/50 border-t border-border">
        <form onSubmit={sendMessage} className="relative flex items-center gap-2 bg-white p-2 rounded-2xl border border-border shadow-sm">
          <button type="button" className="p-2 text-muted-foreground hover:text-primary transition-colors">
            <Paperclip size={20} />
          </button>
          <input 
            type="text" 
            placeholder="Write a message..."
            className="flex-1 bg-transparent text-sm outline-none px-2 text-foreground placeholder:text-muted-foreground"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="submit" disabled={!content.trim()} className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
