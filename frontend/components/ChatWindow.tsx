'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Send, Paperclip, MoreHorizontal, UserCircle2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import axios from 'axios';

interface Message {
  _id: string;
  sender: { name: string; role: string; avatar?: string };
  content: string;
  layer: 'client' | 'internal' | 'broadcast';
  createdAt: string;
}
//test 2
export default function ChatWindow({ projectId }: { projectId: string }) {
  const { user } = useAuthStore();
  const [activeLayer, setActiveLayer] = useState<'client' | 'internal'>('client');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const socketRef = useRef<any>(null);

  // Handle Real-time Socket Connection
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.emit('join_project', projectId);

    socket.on('receive_message', (newMessage) => {
      if (newMessage.chatType === activeLayer.toUpperCase().replace(' ', '_')) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId, activeLayer]);

  // Initial Message Fetching
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const type = activeLayer.toUpperCase().replace(' ', '_');
        const res = await axios.get(`/api/chat?projectId=${projectId}&chatType=${type}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    fetchMessages();
  }, [projectId, activeLayer]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const messageData = {
      projectId,
      content: input,
      senderId: user.id,
      chatType: activeLayer.toUpperCase().replace(' ', '_'),
      sender: { name: user.name, role: user.role }
    };

    try {
      // 1. Persist to DB
      await axios.post('/api/chat', messageData);
      
      // 2. Emit to Socket (Server will broadcast)
      if (socketRef.current) {
        socketRef.current.emit('send_message', messageData);
      }
      
      setInput('');
    } catch (err) {
      console.error('Message delivery failed:', err);
    }
  };

  const layers = [
    { id: 'client', name: 'Client Chat', visibleTo: ['admin', 'sub-admin', 'freelancer', 'student'] },
    { id: 'internal', name: 'Internal Team', visibleTo: ['admin', 'sub-admin', 'freelancer'] },
  ];

  const filteredLayers = layers.filter(layer => layer.visibleTo.includes(user?.role || ''));

  return (
    <div className="flex flex-col h-[600px] bg-secondary/30 border border-border rounded-none overflow-hidden glass">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-primary flex items-center justify-center text-white">
            <UserCircle2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">Project Discussion</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Project ID: #{projectId.slice(-6)}</p>
          </div>
        </div>
        <div className="flex bg-black/5 p-1 rounded-none">
          {filteredLayers.map(layer => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id as any)}
              className={`px-4 py-1.5 rounded-none text-xs font-bold transition-all ${
                activeLayer === layer.id ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {layer.name}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        <AnimatePresence>
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-foreground/20 italic text-sm">
              <MessageSquare size={48} className="mb-2 opacity-5" />
              Start a conversation in the {activeLayer} layer
            </div>
          )}
          {messages.map((msg, i) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, x: msg.sender.name === user?.name ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.sender.name === user?.name ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] rounded-none px-4 py-2 text-sm ${
                msg.sender.name === user?.name 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-foreground border border-border shadow-sm'
              }`}>
                {msg.sender.name !== user?.name && (
                   <p className="text-[10px] font-black uppercase text-muted-foreground/60 mb-1">{msg.sender.name} • {msg.sender.role}</p>
                )}
                <p className="leading-relaxed">{msg.content}</p>
                <span className={`text-[10px] opacity-60 mt-1 block text-right ${msg.sender.name === user?.name ? 'text-white' : 'text-muted-foreground'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 bg-secondary/50 border-t border-border">
        <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 bg-white p-2 rounded-none border border-border shadow-sm">
          <button type="button" className="p-2 text-muted-foreground hover:text-primary transition-colors">
            <Paperclip size={20} />
          </button>
          <input 
            type="text" 
            placeholder={`Message in ${activeLayer} chat...`}
            className="flex-1 bg-transparent text-sm outline-none px-2 text-foreground placeholder:text-muted-foreground"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="p-2 bg-primary text-white rounded-none shadow-lg shadow-primary/10 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

