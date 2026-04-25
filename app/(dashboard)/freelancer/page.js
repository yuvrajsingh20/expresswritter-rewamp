import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import FreelancerDashboardClient from "./FreelancerDashboardClient";

export default async function FreelancerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "FREELANCER") {
    redirect("/login");
  }

  // Step 1 Check: Verify if freelancer has completed profile setup
  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!profile) {
    redirect("/onboard/freelancer/setup");
  }

  return (
    <div className="flex bg-[#f8f9fa] min-h-screen text-[#1d1d1f]">
      <Sidebar role="FREELANCER" />
      <FreelancerDashboardClient session={session} profile={profile} />
    </div>
  );
}
