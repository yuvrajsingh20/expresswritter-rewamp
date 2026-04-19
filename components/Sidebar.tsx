'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut,
  ShieldCheck,
  UserCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['admin', 'sub-admin', 'freelancer', 'student'] },
    { name: 'Projects', icon: FileText, href: '/projects', roles: ['admin', 'sub-admin', 'freelancer', 'student'] },
    { name: 'Messages', icon: MessageSquare, href: '/messages', roles: ['admin', 'sub-admin', 'freelancer', 'student'] },
    { name: 'Team', icon: Users, href: '/team', roles: ['admin', 'sub-admin'] },
    { name: 'Admin Control', icon: ShieldCheck, href: '/admin', roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="w-64 h-screen bg-secondary border-r border-border flex flex-col p-6">
      <div className="flex items-center gap-3 px-2 py-4 mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
          E
        </div>
        <span className="text-xl font-extrabold tracking-tight text-foreground">ExpressWriter</span>
      </div>

      <nav className="flex-1 space-y-1.5">
        {filteredMenu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              pathname.startsWith(item.href) 
                ? "bg-primary text-white shadow-lg shadow-primary/10" 
                : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
            )}
          >
            <item.icon size={20} strokeWidth={pathname.startsWith(item.href) ? 2.5 : 2} />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t border-border pt-6">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/50 border border-white mb-4 shadow-sm">
          <UserCircle size={36} className="text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground truncate">{user?.name}</span>
            <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">{user?.role}</span>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
