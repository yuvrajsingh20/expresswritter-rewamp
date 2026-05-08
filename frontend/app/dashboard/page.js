"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    const role = session.user.role;
    switch (role) {
      case "ADMIN":
        router.push("/admin");
        break;
      case "SUB_ADMIN":
        router.push("/subadmin");
        break;
      case "FREELANCER":
        router.push("/freelancer");
        break;
      case "STUDENT":
        router.push("/student");
        break;
      default:
        router.push("/login");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#86868B] animate-pulse">Initializing Mission Control...</p>
      </div>
    </div>
  );
}
