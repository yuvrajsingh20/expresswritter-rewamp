"use client";
import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-10">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Access Restricted</h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          You do not have the required permissions to access this module.
          Please contact your administrator if you believe this is a mistake.
        </p>
        <Link
          href="/subadmin"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#002D5B] text-white text-sm font-bold rounded-lg hover:bg-[#001f3f] transition-all"
        >
          Return to Overview
        </Link>
      </div>
    </div>
  );
}
