"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTickets from '../../admin/admin-tickets';

export default function SubAdminTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "SUB_ADMIN") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role === "SUB_ADMIN") {
      setIsAuthorized(true);
    }
  }, [status, session, router]);

  if (status === "loading" || !isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <Sidebar role="SUB_ADMIN" />
      <main className="flex-1 md:ml-64 p-10 space-y-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Ticketing System</h1>
          <p className="text-slate-400 text-sm mt-1">Manage customer and writer support tickets</p>
        </div>
        <AdminTickets />
      </main>
    </div>
  );
}