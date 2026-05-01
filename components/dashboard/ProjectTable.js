"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, Clock, ExternalLink, 
  MoreHorizontal, Eye, User,
  AlertCircle, Plus, Check, X, UserPlus, ChevronRight, ShieldCheck
} from 'lucide-react';
import { io } from 'socket.io-client';

const ProjectTable = ({ projects = [], loading = false, role = 'ADMIN' }) => {
  const [assigningId, setAssigningId] = useState(null);
  const [freelancers, setFreelancers] = useState([]);

  useEffect(() => {
    if (role === 'ADMIN') {
      fetch('/api/admin/freelancers')
        .then(res => res.json())
        .then(data => setFreelancers(Array.isArray(data) ? data : []));
    }
  }, [role]);

  const handleAssign = async (projectId, freelancerId) => {
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerId })
      });
      if (res.ok) {
        const socket = io();
        socket.emit("admin_assigned_freelancer", {
          projectId,
          freelancerId,
          projectName: projects.find(p => p.id === projectId)?.title || "Academic Node"
        });

        alert("Success: Specialist mapped to project node.");
        window.location.reload(); 
      }
    } catch (error) {
      console.error("Assignment failed:", error);
    }
  };

  const handleCollaborator = async (projectId, freelancerId, action) => {
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerId, action })
      });
      if (res.ok) {
        alert(`Success: Collaborator ${action === 'ADD' ? 'added to' : 'removed from'} node.`);
        window.location.reload();
      }
    } catch (error) {
      console.error("Collaborator operation failed:", error);
    }
  };
  
  const getStatusStyle = (status) => {
    const styles = {
      CREATED: 'bg-blue-50 text-blue-600 border-blue-100',
      ASSIGNED: 'bg-slate-50 text-slate-600 border-slate-200',
      IN_PROGRESS: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      REVIEW: 'bg-amber-50 text-amber-600 border-amber-100',
      COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    };
    return styles[status] || 'bg-slate-50 text-slate-400 border-slate-100';
  };

  const getRolePrefix = () => {
    if (role === 'ADMIN') return '/admin/projects';
    if (role === 'SUB_ADMIN') return '/subadmin/projects';
    return '/student/orders';
  };

  if (loading) {
    return (
      <div className="card-subtle py-32 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Aggregating stream data...</p>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="card-subtle py-32 flex flex-col items-center justify-center text-center px-10">
        <div className="w-16 h-16 bg-slate-50 rounded-sm flex items-center justify-center mb-6 border border-[#E5E5E5]">
          <AlertCircle size={28} className="text-slate-200" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">No active projects found</h3>
        <p className="text-sm text-slate-400 max-w-xs mx-auto">All current requests and historical data will appear here once initialized.</p>
      </div>
    );
  }

  const handlePayout = async (project) => {
    const amount = prompt(`Enter payout amount for ${project.freelancer.name}:`);
    if (!amount || isNaN(amount)) return;
    
    const description = prompt("Enter payout description (optional):");
    
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          freelancerId: project.freelancer.id,
          amount,
          description
        })
      });
      if (res.ok) {
        alert("Payout logged successfully.");
        window.location.reload();
      }
    } catch (error) {
      console.error("Payout failed:", error);
    }
  };

  return (
    <div className="card-subtle overflow-hidden border-t-4 border-blue-600">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <th className="px-4 py-4">Service</th>
              <th className="px-4 py-4">Student</th>
              <th className="px-4 py-4">Purchase</th>
              <th className="px-4 py-4">Specialists (Team)</th>
              <th className="px-4 py-4 text-right">Operational Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-blue-50/30 transition-all duration-150">
                <td className="px-4 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded flex items-center justify-center text-blue-600 border border-blue-100">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{project.title}</p>
                      <p className="text-[9px] text-slate-400">#{project.id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-none bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px] border border-slate-200">
                      {project.student?.name?.charAt(0) || <User size={12} />}
                    </div>
                    <div className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{project.student?.name || 'Unknown'}</div>
                  </div>
                </td>

                <td className="px-4 py-5">
                  {project.orders?.some(o => o.paymentStatus === 'PAID') ? (
                    <span className="px-2 py-0.5 rounded-none text-[9px] font-black bg-emerald-500 text-white uppercase tracking-wider">
                      PAID: ₹{project.amount}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-none text-[9px] font-black bg-amber-400 text-white uppercase tracking-wider">
                      PENDING
                    </span>
                  )}
                </td>
                
                <td className="px-4 py-5">
                  <div className="flex flex-col gap-2">
                    {/* Lead Writer */}
                    {project.freelancer ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-[11px]">
                          <ShieldCheck size={14} className="shrink-0" /> {project.freelancer.name} (Lead)
                        </div>
                        {role === 'ADMIN' && (
                          <button 
                            onClick={() => handlePayout(project)}
                            className="text-[9px] font-bold text-blue-600 hover:underline text-left ml-5"
                          >
                            + ADD PAYOUT
                          </button>
                        )}
                      </div>
                    ) : (
                      <select 
                        onChange={(e) => handleAssign(project.id, e.target.value)}
                        className="bg-orange-600 text-white text-[10px] font-bold rounded px-2 py-1.5 cursor-pointer hover:bg-orange-700 transition-all border-none w-full max-w-[120px]"
                        defaultValue=""
                      >
                        <option value="" disabled>➜ ALLOCATE LEAD</option>
                        {freelancers.map(f => (
                          <option key={f.id} value={f.id} className="text-slate-900 bg-white">{f.name}</option>
                        ))}
                      </select>
                    )}

                    {/* Collaborators */}
                    {project.collaborators?.map(collab => (
                      <div key={collab.id} className="flex items-center justify-between gap-2 text-slate-600 font-bold text-[10px] bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        <div className="flex items-center gap-2">
                          <User size={12} className="shrink-0" /> {collab.name}
                        </div>
                        {role === 'ADMIN' && (
                          <button 
                            onClick={() => handleCollaborator(project.id, collab.id, 'REMOVE')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Add Collaborator Action */}
                    {role === 'ADMIN' && project.freelancer && (
                      <select 
                        onChange={(e) => {
                          if (e.target.value) handleCollaborator(project.id, e.target.value, 'ADD');
                        }}
                        className="text-[9px] font-bold text-slate-400 bg-white border border-slate-200 rounded px-2 py-1 cursor-pointer hover:border-slate-300 transition-all w-full max-w-[120px]"
                        defaultValue=""
                      >
                        <option value="" disabled>+ ADD WRITER</option>
                        {freelancers
                          .filter(f => f.id !== project.freelancerId && !project.collaboratorIds?.includes(f.id))
                          .map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))
                        }
                      </select>
                    )}
                  </div>
                </td>

                <td className="px-4 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`${getRolePrefix()}/${project.id}`}>
                      <button className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded hover:bg-slate-800 transition-all">
                        OPEN BRIDGE
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectTable;
