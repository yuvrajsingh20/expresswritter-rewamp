"use client";
import React, { useState, useEffect } from 'react';
import { Send, Paperclip, MoreVertical, Search } from 'lucide-react';

const ChatWindow = ({ projectId, currentUser, initialMessages = [], chatType = 'client_chat' }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      message: inputText,
      timestamp: new Date(),
      isMe: true
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
    // Emit socket event here
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] glass-card overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
            PW
          </div>
          <div>
            <h3 className="font-bold text-sm">Project Workspace</h3>
            <p className="text-xs text-green-500 font-medium">● Online</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <Search size={18} className="cursor-pointer hover:text-foreground" />
          <MoreVertical size={18} className="cursor-pointer hover:text-foreground" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
              msg.senderId === currentUser.id 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
            }`}>
              {msg.senderId !== currentUser.id && (
                <p className="text-[10px] font-bold opacity-70 mb-1">{msg.senderName}</p>
              )}
              <p>{msg.message}</p>
              <p className={`text-[10px] text-right mt-1 opacity-50`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-primary/50 transition-all">
          <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
            <Paperclip size={20} />
          </button>
          <input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2 bg-primary text-white rounded-xl disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
