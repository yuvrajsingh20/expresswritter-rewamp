"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from "next-auth/react";
import { 
  Home, Users, Briefcase, 
  MessageSquare, Shield, LogOut,
  TrendingUp, Award, Zap, PlusCircle,
  Settings, CreditCard
} from 'lucide-react';

const Sidebar = ({ role = 'ADMIN' }) => {
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const menuItems = {
    ADMIN: [
      { name: 'Mission Control', icon: Home, path: '/admin' },
      { name: 'Elite Workforce', icon: Zap, path: '/admin/freelancers' },
      { name: 'Global Projects', icon: Briefcase, path: '/admin/projects' },
      { name: 'Secure Comms', icon: MessageSquare, path: '/admin/chat' },
    ],
    SUB_ADMIN: [
      { name: 'Overview', icon: Home, path: '/subadmin' },
      { name: 'Manage Team', icon: Users, path: '/subadmin' },
      { name: 'Assignments', icon: Briefcase, path: '/subadmin' },
    ],
    FREELANCER: [
      { name: 'Project Hub', icon: Home, path: '/freelancer' },
      { name: 'Active Tasks', icon: Briefcase, path: '/freelancer/projects' },
      { name: 'Secure Inbox', icon: MessageSquare, path: '/freelancer/chat' },
      { name: 'Financials', icon: CreditCard, path: '/freelancer/earnings' },
    ],
    STUDENT: [
      { name: 'Workspace', icon: Home, path: '/student' },
      { name: 'Order History', icon: Briefcase, path: '/student/orders' },
      { name: 'Initialize Draft', icon: PlusCircle, path: '/student/new-order' },
    ],
  };

  const currentMenu = menuItems[role] || menuItems.STUDENT;

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 font-sans">
      <div className="p-10 mb-2">
        <Link href="/" className="flex items-center gap-4">
          <div className="w-12 h-12 bg-black flex items-center justify-center text-white font-black text-xl">
            E
          </div>
          <div>
            <span className="text-sm font-[900] tracking-tighter uppercase italic text-black leading-none block">Express Writer</span>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{role.replace('_', ' ')} PORTAL</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-6 space-y-2 mt-4">
        <div className="px-4 mb-6">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Institutional Navigation</p>
        </div>
        {currentMenu.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`flex items-center gap-4 px-4 py-4 text-[11px] font-black uppercase tracking-widest transition-all rounded-none border-l-2 ${
                isActive 
                  ? 'bg-slate-50 text-black border-black shadow-sm' 
                  : 'text-slate-400 border-transparent hover:text-black hover:bg-slate-50'
              }`}
            >
              <item.icon size={16} className={isActive ? "text-black" : "text-slate-300"} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-8 border-t border-slate-50 space-y-3">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-none"
        >
          <LogOut size={16} />
          <span>Terminate Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
