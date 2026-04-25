"use client";
import React from 'react';
import Link from 'next/link';
import { 
  FileText, Clock, ExternalLink, 
  MoreHorizontal, Eye, User,
  AlertCircle
} from 'lucide-react';

const ProjectTable = ({ projects = [], loading = false, role = 'ADMIN' }) => {
  
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

  return (
    <div className="card-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <th className="px-8 py-5">Project Details</th>
              <th className="px-8 py-5">Status Protocol</th>
              {role !== 'STUDENT' && <th className="px-8 py-5">Owner / Assignment</th>}
              <th className="px-8 py-5">Deadline</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-5">
                    <div className="w-11 h-11 bg-white border border-[#E5E5E5] flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-primary rounded-sm transition-all shadow-sm">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 mb-1">{project.title}</p>
                      <p className="text-[10px] font-medium text-slate-300 uppercase tracking-widest">Ref: {project.id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider rounded-sm ${getStatusStyle(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </td>
                {role !== 'STUDENT' && (
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                          <User size={14} />
                       </div>
                       <p className="text-xs font-semibold text-slate-600">
                         {project.student?.name || 'Unassigned'}
                       </p>
                    </div>
                  </td>
                )}
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-slate-900 uppercase">
                    <Clock size={12} className="text-slate-300" />
                    <span className="text-xs font-bold">{new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">Calculated ETD</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`${getRolePrefix()}/${project.id}`}>
                      <button className="p-2.5 text-slate-400 hover:text-primary hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-sm transition-all">
                        <Eye size={16} />
                      </button>
                    </Link>
                    <button className="p-2.5 text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200 rounded-sm transition-all">
                      <MoreHorizontal size={16} />
                    </button>
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
