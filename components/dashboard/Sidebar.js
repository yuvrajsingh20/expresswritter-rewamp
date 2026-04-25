"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from "next-auth/react";
import { 
  Home, Users, Briefcase, 
  MessageSquare, Shield, LogOut,
  TrendingUp, Award, Zap
} from 'lucide-react';

const Sidebar = ({ role = 'ADMIN' }) => {
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const menuItems = {
    ADMIN: [
      { name: 'Overview', icon: Home, path: '/admin' },
      { name: 'Workforce', icon: Zap, path: '/admin/freelancers' },
      { name: 'All Projects', icon: Briefcase, path: '/admin' },
      { name: 'Communication', icon: MessageSquare, path: '/admin/chat' },
      { name: 'System Logs', icon: Shield, path: '/admin' },
    ],
    SUB_ADMIN: [
      { name: 'Overview', icon: Home, path: '/subadmin' },
      { name: 'Manage Team', icon: Users, path: '/subadmin' },
      { name: 'Assigned', icon: Briefcase, path: '/subadmin' },
    ],
    FREELANCER: [
      { name: 'My Tasks', icon: Briefcase, path: '/freelancer' },
      { name: 'Client Chat', icon: MessageSquare, path: '/freelancer' },
      { name: 'Earnings', icon: TrendingUp, path: '/freelancer' },
    ],
    STUDENT: [
      { name: 'Dashboard', icon: Home, path: '/student' },
      { name: 'Orders', icon: Briefcase, path: '/student/orders' },
      { name: 'Certificates', icon: Award, path: '/student' },
    ],
  };

  const currentMenu = menuItems[role] || menuItems.STUDENT;

  return (
    <aside className="sidebar-container">
      <div className="mb-10 px-2">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-900 rounded-sm flex items-center justify-center text-white font-bold text-lg">
            E
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-slate-800">Express Writer</span>
            <p className="text-[10px] font-medium text-slate-400 capitalize">{role.toLowerCase().replace('_', ' ')} Portal</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigation</p>
        </div>
        {currentMenu.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={isActive ? 'nav-item-active' : 'nav-item'}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100 px-2">
        <button 
          onClick={handleLogout}
          className="nav-item w-full hover:bg-red-50 hover:text-red-600 transition-colors rounded-sm"
        >
          <LogOut size={18} />
          <span>Logout System</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
