"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from "next-auth/react";
import { motion } from 'framer-motion';
import {
  Home, Users, Briefcase,
  MessageSquare, Shield, LogOut,
  TrendingUp, Award, Zap, PlusCircle,
  Settings, CreditCard, ChevronRight,
  LayoutGrid, Activity
} from 'lucide-react';

const Sidebar = ({ role = 'ADMIN' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const menuItems = {
    ADMIN: [
      { name: 'Mission Control', icon: LayoutGrid, path: '/admin' },
      { name: 'Elite Workforce', icon: Zap, path: '/admin/freelancers' },
      { name: 'Global Projects', icon: Briefcase, path: '/admin' },
      { name: 'Secure Comms', icon: MessageSquare, path: '/admin/chat' },
    ],
    SUB_ADMIN: [
      { name: 'Overview', icon: Home, path: '/subadmin' },
      { name: 'Manage Team', icon: Users, path: '/subadmin' },
      { name: 'Assignments', icon: Briefcase, path: '/subadmin' },
    ],
    FREELANCER: [
      { name: 'Project Hub', icon: LayoutGrid, path: '/freelancer' },
      { name: 'Active Tasks', icon: Briefcase, path: '/freelancer' },
      { name: 'Secure Inbox', icon: MessageSquare, path: '/freelancer/chat' },
      { name: 'Financials', icon: CreditCard, path: '/freelancer/earnings' },
    ],
    STUDENT: [
      { name: 'Workspace', icon: LayoutGrid, path: '/student' },
      { name: 'Order History', icon: Briefcase, path: '/student/orders' },
      { name: 'Initialize Draft', icon: PlusCircle, path: '/student/new-order' },
    ],
  };

  const currentMenu = menuItems[role] || menuItems.STUDENT;

  return (
    <>
      {/* Hamburger button visible only on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[60] md:hidden bg-[#002D5B] text-white p-2 rounded-lg shadow-lg"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      <aside className={`w-64 bg-white border-r border-[#E5E5E5] flex flex-col h-screen fixed left-0 top-0 z-50 font-sans shadow-xl shadow-slate-900/5 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Premium Logo Section */}
        <div className="p-8 mb-4">
          <Link href="/" className="group flex items-center gap-4">
            <div className="w-10 h-10 bg-[#002D5B] text-white flex items-center justify-center font-black text-lg rounded-none group-hover:scale-110 transition-transform">
              E
            </div>
            <div>
              <span className="text-xs font-black tracking-tight uppercase text-[#002D5B] leading-none block">Express Writer</span>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{role.replace('_', ' ')} NODE</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5">
          <div className="px-4 mb-4">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-wider">Institutional Core</p>
          </div>
          {currentMenu.map((item) => {
            const isActive = pathname === item.path ||
              (item.path !== '/admin' && item.path !== '/student' && item.path !== '/freelancer' && pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center justify-between px-4 py-3.5 rounded-none transition-all ${isActive
                    ? 'bg-[#002D5B] text-white'
                    : 'text-slate-500 hover:text-[#002D5B] hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center gap-3.5">
                  <item.icon size={18} className={isActive ? "text-white" : "text-slate-400 group-hover:text-[#002D5B] transition-colors"} />
                  <span className="text-[10px] font-black uppercase tracking-wider">{item.name}</span>
                </div>
                {isActive && (
                  <motion.div layoutId="activePill" className="w-1.5 h-1.5 bg-white rounded-none" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="p-6 border-t border-slate-50 space-y-4">
          <div className="bg-slate-50 rounded-none p-4 flex items-center gap-4 border border-slate-100">
            <div className="w-8 h-8 bg-white border border-slate-100 rounded-none flex items-center justify-center text-[#002D5B] shadow-sm">
              <Activity size={14} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider leading-none">Session Status</p>
              <p className="text-[10px] font-bold text-slate-900 mt-1">Encrypted Stream</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 text-[9px] font-black uppercase tracking-wider text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-none transition-all"
          >
            <LogOut size={16} />
            <span>Terminate Access</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
