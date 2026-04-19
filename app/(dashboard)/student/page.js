"use client";
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { motion } from 'framer-motion';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import { 
  ShoppingBag, FileText, MessageSquare, 
  Clock, Plus, CreditCard, ChevronRight,
  TrendingUp, HelpCircle, Loader2, Shield, Award
} from 'lucide-react';

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) fetchProjects();
  }, [session]);

  const activeOrders = Array.isArray(projects) ? projects.filter(p => !['COMPLETED', 'DELIVERED'].includes(p.status)).length : 0;
  const completedOrders = Array.isArray(projects) ? projects.filter(p => ['COMPLETED', 'DELIVERED'].includes(p.status)).length : 0;

  const stats = [
    { title: 'Active Orders', count: activeOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Completed', count: completedOrders, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Messages', count: 4, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <Sidebar role="STUDENT" />
      
      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10">
          <div>
            <h1 className="text-sm font-bold text-slate-800">Student Dashboard</h1>
            <p className="text-[10px] font-medium text-slate-400">Welcome back, {session?.user?.name || "Scholar"}</p>
          </div>
          <div className="flex gap-4">
            <Link href="/student/new-order" className="btn-primary">
               <Plus size={18} /> New Request
            </Link>
          </div>
        </header>

        <main className="p-10 max-w-7xl mx-auto w-full space-y-10">
          {/* Welcome Header */}
          <section className="bg-[#0a192f] text-white p-12 rounded-2xl relative overflow-hidden shadow-xl shadow-blue-900/10">
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl font-extrabold tracking-tight mb-4 leading-tight">Elevate your academic <br /> application today.</h1>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                Manage your Statements of Purpose, Letters of Recommendation, and Resumes with our expert writing team.
              </p>
              <Link href="/student/new-order" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-sm transition-all">
                Get Started Now <ChevronRight size={18} />
              </Link>
            </div>
            {/* Abstract Background Element */}
            <div className="absolute right-[-10%] top-[-20%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          </section>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div key={stat.title} className="card-subtle p-8 flex items-center gap-6">
                <div className={`w-14 h-14 ${stat.bg} ${stat.color} flex items-center justify-center rounded-xl`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{stat.title}</p>
                  <p className="text-3xl font-extrabold text-slate-900">{stat.count}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Recent Orders List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-bold text-slate-800">Recent Projects</h3>
                <Link href="/student/orders" className="text-xs font-bold text-blue-600 hover:underline">View All Projects</Link>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="card-subtle py-24 flex flex-col items-center justify-center gap-4 text-slate-300">
                    <Loader2 className="animate-spin" size={32} />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading your history...</p>
                  </div>
                ) : Array.isArray(projects) && projects.length > 0 ? (
                  projects.slice(0, 4).map((project) => (
                    <div key={project.id} className="card-subtle group p-6 flex items-center justify-between hover:border-blue-200">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-lg transition-all">
                           <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 mb-1">{project.title}</p>
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Added • {new Date(project.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                         <div className="text-right hidden md:block">
                            <p className="text-xs font-bold text-slate-900">Deadline</p>
                            <p className="text-[10px] font-medium text-slate-400">{new Date(project.deadline).toLocaleDateString()}</p>
                         </div>
                         <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 uppercase rounded-full">
                           {project.status.replace('_', ' ')}
                         </div>
                         <Link href={`/student/orders/${project.id}`} className="w-10 h-10 border border-slate-100 flex items-center justify-center rounded-lg hover:border-blue-300 transition-all">
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500" />
                         </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="card-subtle py-24 flex flex-col items-center justify-center text-center px-10">
                    <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-2xl mb-6">
                      <Clock size={32} className="text-slate-200" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">No active projects</h3>
                    <p className="text-sm text-slate-400 mb-8 max-w-xs mx-auto">Initialize your first writing request to see it tracked here.</p>
                    <Link href="/student/new-order" className="btn-primary px-10 py-3">
                       Create New Project
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Support/Faq Side */}
            <div className="space-y-6">
               <h3 className="text-lg font-bold text-slate-800 px-1">Resources</h3>
               <div className="space-y-4">
                  <div className="card-subtle p-6 space-y-4 group cursor-pointer hover:bg-slate-50/50">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                          <Shield size={20} />
                       </div>
                       <div>
                          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Our Guarantee</h4>
                          <p className="text-[10px] text-slate-400 font-medium">Privacy & Quality Assurance</p>
                       </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">All drafts undergo triple verification for plagiarism and quality before release.</p>
                  </div>

                  <div className="card-subtle p-8 bg-gradient-to-br from-[#0a192f] to-[#112240] text-white">
                    <TrendingUp className="text-blue-400 mb-6" size={32} />
                    <h3 className="text-xl font-bold mb-3 tracking-tight">Maximize your potential.</h3>
                    <p className="text-slate-400 text-xs mb-8 leading-relaxed">Upgrade your package to include direct mentoring sessions with our top-tier writers.</p>
                    <button className="w-full bg-blue-600 py-3 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all">
                      Explore Add-ons
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
