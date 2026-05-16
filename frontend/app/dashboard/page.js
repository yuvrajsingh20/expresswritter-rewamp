"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    setIsReady(true);
  }, [status]);

  const redirect = useCallback((targetPath) => {
    router.replace(targetPath);
  }, [router]);

  useEffect(() => {
    if (!isReady || status === "loading") return;

    if (!session) {
      redirect("/login");
      return;
    }

    const role = session.user.role;
    const roleRoutes = {
      "ADMIN": "/admin",
      "SUB_ADMIN": "/subadmin",
      "FREELANCER": "/freelancer",
      "STUDENT": "/student"
    };

    const targetRoute = roleRoutes[role] || "/login";
    
    if (pathname !== targetRoute) {
      redirect(targetRoute);
    }
  }, [session, status, isReady, pathname, redirect]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#86868B] animate-pulse">Loading your workspace...</p>
      </div>
    </div>
  );
}
