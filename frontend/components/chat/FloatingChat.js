"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! 👋 How can we help you with your writing project today?", isBot: true }
  ]);
  const [input, setInput] = useState('');

  const send = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { text: input, isBot: false }]);
    setInput('');
    // Mock response
    setTimeout(() => {
      setMessages(prev => [...prev, { text: "Thanks for reaching out! A support agent will be with you shortly. In the meantime, feel free to check our pricing page.", isBot: true }]);
    }, 1000);
  };

  return (
    <>
      {/* Toggle Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          position: 'fixed', 
          bottom: '24px', 
          right: '24px', 
          width: '60px', 
          height: '60px', 
          background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer', 
          boxShadow: '0 10px 25px -5px rgba(20, 184, 166, 0.5)',
          zIndex: 9999,
          fontSize: '28px',
          color: '#fff'
        }}
      >
        {isOpen ? '×' : '💬'}
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{ 
              position: 'fixed', 
              bottom: '100px', 
              right: '24px', 
              width: '360px', 
              height: '500px', 
              background: '#fff', 
              borderRadius: '20px', 
              boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.25)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            {/* Header */}
            <div style={{ background: '#14b8a6', padding: '20px', color: '#fff' }}>
              <div style={{ fontSize: '18px', fontWeight: '800' }}>Xpress Support</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Typically replies in under 5 minutes</div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ 
                  alignSelf: m.isBot ? 'flex-start' : 'flex-end',
                  background: m.isBot ? '#fff' : '#14b8a6',
                  color: m.isBot ? '#1e293b' : '#fff',
                  padding: '12px 16px',
                  borderRadius: m.isBot ? '0 16px 16px 16px' : '16px 16px 0 16px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  boxShadow: m.isBot ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  maxWidth: '85%'
                }}>
                  {m.text}
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={send} style={{ padding: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}>
              <input 
                placeholder="Ask us anything..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ flex: 1, padding: '10px 16px', borderRadius: '100px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }} 
              />
              <button type="submit" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#14b8a6', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                →
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
