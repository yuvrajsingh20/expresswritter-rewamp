"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Sidebar from '@/components/dashboard/Sidebar';
import { 
  DollarSign, TrendingUp, Calendar, 
  ArrowUpRight, Clock, CheckCircle2, 
  ChevronRight, Wallet, History, Info
} from 'lucide-react';

export default function FreelancerEarnings() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutData, setPayoutData] = useState({
    amount: '',
    method: 'UPI',
    details: ''
  });
  
  const [earnings, setEarnings] = useState({
    balance: 0,
    totalEarned: 0,
    pending: 0,
    history: [],
    projects: []
  });

  const fetchEarnings = async () => {
    try {
      const res = await fetch('/api/freelancer/earnings');
      if (res.ok) {
        const data = await res.json();
        setEarnings(data);
        setPayoutData(prev => ({ ...prev, amount: data.balance }));
      }
    } catch (error) {
      console.error("Failed to fetch earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const handlePayoutRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/freelancer/payout-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payoutData)
      });
      if (res.ok) {
        setShowPayoutModal(false);
        fetchEarnings(); // Refresh data
        alert("Payout request submitted! Payments are processed within 24-48 hours.");
      }
    } catch (error) {
      console.error("Payout failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#FBFBFB]">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#002D5B] rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculating Balances...</p>
       </div>
    </div>
  );

  return (
    <div className="flex bg-[#FBFBFB] min-h-screen text-[#111111]">
      <Sidebar role="FREELANCER" />
      
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-8 shrink-0">
             <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Financial Hub</span>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Earnings & Payouts</span>
             </div>
             <button 
                onClick={() => setShowPayoutModal(true)}
                className="h-9 px-6 bg-[#002D5B] text-white rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-[#001D3D] transition-all flex items-center gap-2"
             >
                <Wallet size={14} /> Request Payout
             </button>
          </header>

          <main className="flex-1 overflow-y-auto p-10 space-y-10">
             <div className="flex justify-between items-end">
                <div>
                   <h1 className="text-2xl font-bold text-slate-900">Earnings Overview</h1>
                   <p className="text-sm text-slate-500 mt-1">Monitor your revenue, pending approvals, and transaction history.</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-200 px-4 py-2 rounded-sm">
                   <Calendar size={14} /> Last 30 Days: Apr 1 - Apr 30
                </div>
             </div>

             {/* Stats Cards */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 border border-[#E5E5E5] rounded-sm shadow-sm flex flex-col">
                   <div className="w-10 h-10 bg-blue-50 text-[#0067B8] rounded-sm flex items-center justify-center mb-6">
                      <Wallet size={20} />
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Available Balance</p>
                   <div className="flex items-baseline gap-2">
                      <h2 className="text-3xl font-bold text-slate-900">₹{earnings.balance.toLocaleString()}</h2>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                         <TrendingUp size={12} /> +12%
                      </span>
                   </div>
                </div>

                <div className="bg-white p-8 border border-[#E5E5E5] rounded-sm shadow-sm flex flex-col">
                   <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-sm flex items-center justify-center mb-6">
                      <CheckCircle2 size={20} />
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Earned (Lifetime)</p>
                   <h2 className="text-3xl font-bold text-slate-900">₹{earnings.totalEarned.toLocaleString()}</h2>
                </div>

                <div className="bg-white p-8 border border-[#E5E5E5] rounded-sm shadow-sm flex flex-col">
                   <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-sm flex items-center justify-center mb-6">
                      <Clock size={20} />
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Approval</p>
                   <h2 className="text-3xl font-bold text-slate-900">₹{earnings.pending.toLocaleString()}</h2>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Recent Payouts */}
                <div className="bg-white border border-[#E5E5E5] rounded-sm shadow-sm flex flex-col h-full">
                   <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <History size={16} className="text-slate-400" />
                         <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Payout History</h3>
                      </div>
                      <button className="text-[10px] font-bold text-[#0067B8] uppercase tracking-widest hover:underline transition-all">View All</button>
                   </div>
                   <div className="p-0 overflow-hidden">
                      <table className="w-full text-left">
                         <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                               <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Transaction ID</th>
                               <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Method</th>
                               <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                               <th className="px-6 py-4 text-right px-8 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {earnings.history.map((txn, idx) => (
                               <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-5">
                                     <p className="text-[11px] font-bold text-slate-900">{txn.id}</p>
                                     <p className="text-[9px] text-slate-400 mt-0.5">{txn.date}</p>
                                  </td>
                                  <td className="px-6 py-5">
                                     <p className="text-[11px] text-slate-600 font-medium">{txn.method}</p>
                                  </td>
                                  <td className="px-6 py-5">
                                     <p className="text-[11px] font-bold text-slate-900">₹{txn.amount.toLocaleString()}</p>
                                  </td>
                                  <td className="px-6 py-5 text-right px-8">
                                     <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${
                                        txn.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                     }`}>
                                        {txn.status}
                                     </span>
                                  </td>
                                </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>

                {/* Project Breakdown */}
                <div className="bg-white border border-[#E5E5E5] rounded-sm shadow-sm flex flex-col h-full">
                   <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <TrendingUp size={16} className="text-slate-400" />
                         <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Project Revenue</h3>
                      </div>
                   </div>
                   <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
                      {earnings.projects.map((proj) => (
                         <div key={proj.id} className="p-4 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-between hover:border-slate-300 transition-all group">
                            <div className="flex items-center gap-4">
                               <div className="w-9 h-9 bg-white border border-slate-200 rounded-sm flex items-center justify-center text-slate-400 group-hover:text-[#0067B8] transition-colors">
                                  <DollarSign size={16} />
                               </div>
                               <div>
                                  <p className="text-[11px] font-bold text-slate-900">{proj.title}</p>
                                  <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${
                                     proj.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'
                                  }`}>{proj.status}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-bold text-slate-900">₹{proj.amount.toLocaleString()}</p>
                               <button className="text-[8px] font-bold text-[#0067B8] uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 justify-end ml-auto">
                                  Breakdown <ArrowUpRight size={8} />
                                </button>
                            </div>
                         </div>
                      ))}
                   </div>
                   <div className="mt-auto p-6 bg-blue-50/50 border-t border-blue-100/50 flex items-center gap-4">
                      <Info size={16} className="text-[#0067B8]" />
                      <p className="text-[10px] text-[#0067B8] font-medium uppercase tracking-wide">Payments are processed within 24-48 hours after a payout request is approved by the finance team.</p>
                   </div>
                </div>
             </div>
          </main>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-md rounded-sm shadow-2xl overflow-hidden border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                 <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Request Payout</h3>
                 <button onClick={() => setShowPayoutModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
              </div>
              <form onSubmit={handlePayoutRequest} className="p-8 space-y-6">
                 <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Withdrawal Amount</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                       <input 
                         type="number" 
                         value={payoutData.amount}
                         onChange={(e) => setPayoutData({...payoutData, amount: e.target.value})}
                         max={earnings.balance}
                         className="w-full h-12 pl-8 pr-4 bg-slate-50 border border-slate-200 rounded-sm text-sm font-bold focus:ring-1 focus:ring-[#002D5B] outline-none"
                         required
                       />
                    </div>
                    <p className="text-[9px] text-slate-500 mt-2">Available: ₹{earnings.balance.toLocaleString()}</p>
                 </div>

                 <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Payout Method</label>
                    <select 
                      value={payoutData.method}
                      onChange={(e) => setPayoutData({...payoutData, method: e.target.value})}
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-sm text-sm font-medium focus:ring-1 focus:ring-[#002D5B] outline-none appearance-none"
                    >
                       <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                       <option value="BANK">IMPS / NEFT Bank Transfer</option>
                    </select>
                 </div>

                 <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                       {payoutData.method === 'UPI' ? 'UPI ID' : 'Bank Details (Acc No & IFSC)'}
                    </label>
                    <textarea 
                      value={payoutData.details}
                      onChange={(e) => setPayoutData({...payoutData, details: e.target.value})}
                      placeholder={payoutData.method === 'UPI' ? 'e.g. user@okaxis' : 'Enter Account Number and IFSC Code'}
                      className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:ring-1 focus:ring-[#002D5B] outline-none"
                      required
                    />
                 </div>

                 <button 
                   type="submit"
                   disabled={submitting || parseFloat(payoutData.amount) <= 0}
                   className="w-full h-12 bg-[#002D5B] text-white rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#001D3D] disabled:opacity-50 transition-all shadow-lg"
                 >
                   {submitting ? 'Processing...' : 'Confirm Withdrawal'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
