"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, UserMinus, ShieldAlert, 
  Activity, Clock, FileText, ChevronRight
} from 'lucide-react';
import { getSocket } from '@/lib/socket';

const ProjectBridgeManagement = ({ params }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableFreelancers, setAvailableFreelancers] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const { data: session } = useSession();

  const unwrappedParams = React.use(params);
  const projectId = unwrappedParams.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, freelancersRes] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch('/api/admin/freelancers')
        ]);
        
        const projectData = await projectRes.json();
        const freelancersData = await freelancersRes.json();
        
        setProject(projectData);
        setAvailableFreelancers(freelancersData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const assignFreelancer = async (freelancerId) => {
    setAssigning(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerId, status: 'ASSIGNED' })
      });
      
      if (res.ok) {
        const updatedProject = await res.json();
        setProject(updatedProject);
        
        const socket = getSocket();
        if (socket) {
          socket.emit('status_update', { projectId, status: 'ASSIGNED' });
        }
      }
    } catch (error) {
      console.error("Assignment failed:", error);
    } finally {
      setAssigning(false);
    }
  };

  const removeFreelancer = async () => {
    setAssigning(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerId: null, status: 'CREATED' })
      });
      
      if (res.ok) {
        const updatedProject = await res.json();
        setProject(updatedProject);
      }
    } catch (error) {
      console.error("Removal failed:", error);
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!project) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Project Not Found</p>
    </div>
  );

  const participants = [
    { id: project.studentId, name: project.student?.name || 'Student', role: 'STUDENT', avatar: (project.student?.name || 'S')[0] },
    ...(project.freelancer ? [{ 
      id: project.freelancerId, 
      name: project.freelancer.name, 
      role: 'FREELANCER', 
      avatar: project.freelancer.name[0] 
    }] : [])
  ];

  const availableHelpers = availableFreelancers.filter(f => f.id !== project.freelancerId);

  return (
    <div className="flex bg-[#f8f9fa] min-h-screen text-[#1d1d1f]">
      <Sidebar role="ADMIN" />
      
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Project Context Header */}
        <header className="p-6 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm z-20">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center">
                 <ShieldAlert size={24} />
              </div>
              <div>
                 <h1 className="text-xl font-black tracking-tight italic uppercase">Eagle-Eye Bridge: {project.title}</h1>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Live Stealth Monitoring • Multi-Role Access</p>
              </div>
           </div>
           <div className="flex gap-6 pr-4">
              <div className="text-right">
                 <p className="text-xs font-black">Status</p>
                 <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">{project.status}</p>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <div className="text-right">
                 <p className="text-xs font-black text-green-500">₹{project.amount}</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">Valuation</p>
              </div>
           </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
           {/* MAIN CHAT BRIDGE */}
           <div className="flex-1 p-6 relative">
              <ChatInterface role="ADMIN" projectId={projectId} currentUserId={session?.user?.id} />
           </div>

           {/* EAGLE EYE MANAGEMENT PANEL */}
           <aside className="w-96 bg-white border-l border-slate-100 flex flex-col p-8 gap-10 overflow-y-auto shadow-2xl">
              {/* Active Participants */}
              <section>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Users size={14} /> Active In Bridge
                 </p>
                 <div className="space-y-4">
                    {participants.map((p) => (
                       <motion.div 
                        layout 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={p.id} 
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50"
                       >
                          <div className="flex items-center gap-4 text-center">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white italic ${p.role === 'STUDENT' ? 'bg-blue-500' : 'bg-[#1d1d1f]'}`}>
                                {p.avatar}
                             </div>
                             <div className="text-left">
                                <p className="text-xs font-black tracking-tight">{p.name}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{p.role}</p>
                             </div>
                          </div>
                          {p.role === 'FREELANCER' && (
                             <button 
                              disabled={assigning}
                              onClick={removeFreelancer}
                              className="w-10 h-10 bg-red-50 text-red-400 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-inner disabled:opacity-50"
                             >
                                <UserMinus size={18} />
                             </button>
                          )}
                       </motion.div>
                    ))}
                 </div>
              </section>

              {/* Inject Helper (Inject/Assign Logic) */}
              <section className="mt-4">
                 <p className="text-[10px] font-black text-[#0071e3] uppercase tracking-wider mb-6 flex items-center gap-2">
                    <UserPlus size={14} /> Assign Specialist
                 </p>
                 <div className="space-y-3">
                    {availableHelpers.length > 0 ? availableHelpers.map((h) => (
                       <button 
                        key={h.id} 
                        disabled={assigning}
                        onClick={() => assignFreelancer(h.id)}
                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-[1.5rem] group hover:border-[#0071e3] hover:shadow-lg transition-all text-left disabled:opacity-50"
                       >
                          <div>
                            <p className="text-xs font-black text-slate-800 tracking-tight">{h.name}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1 tracking-widest cursor-default">Available for Assignment</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0071e3] flex items-center justify-center group-hover:bg-[#0071e3] group-hover:text-white transition-all">
                             <ChevronRight size={16} />
                          </div>
                       </button>
                    )) : (
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">No freelancers available</p>
                    )}
                 </div>
              </section>

              {/* Financial Operations */}
              <section className="mt-4 p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="p-2 bg-green-50 rounded-xl text-green-500">
                        <Activity size={18} />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-800">Financial Ops</p>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Paid</span>
                        <span className="text-sm font-black text-slate-800">₹{project.amount}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Expert Payout</span>
                        <div className="flex items-center gap-1 border-b border-slate-200 pb-1 w-20">
                           <span className="text-xs text-slate-400">₹</span>
                           <input 
                            type="number" 
                            defaultValue={Math.floor(project.amount * 0.7)} 
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-xs font-black"
                           />
                        </div>
                     </div>
                     <button className="w-full py-4 bg-[#1d1d1f] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200/50 flex items-center justify-center gap-2">
                        <FileText size={14} /> Generate Invoice
                     </button>
                  </div>
              </section>

              {/* Project DNA Card */}
              <div className="mt-auto p-6 bg-[#1d1d1f] rounded-[2rem] text-white shadow-2xl">
                 <div className="flex items-center gap-3 mb-4">
                    <Activity size={18} className="text-blue-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Project DNA</p>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400">Type</span>
                        <span className="text-xs font-black uppercase">{project.serviceType}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400">Deadline</span>
                        <span className="text-xs font-black text-amber-400 italic">
                          {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                        </span>
                    </div>
                 </div>
              </div>
           </aside>
        </div>
      </main>
    </div>
  );
};

export default ProjectBridgeManagement;
