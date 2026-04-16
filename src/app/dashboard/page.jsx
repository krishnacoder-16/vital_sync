"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { PatientDashboard } from "../../components/dashboard/PatientDashboard";
import { DoctorDashboard } from "../../components/dashboard/DoctorDashboard";
import { useAuthStore } from "../../store/authStore";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  useEffect(() => {
    // Restrict access purely using active global session validation
    if (isInitialized && !user) {
      router.push("/login");
    }
  }, [user, isInitialized, router]);

  // Barrier logic protecting protected chunk hooks from firing unauth'd
  if (!isInitialized || !user) {
    return (
      <div className="flex h-screen bg-[#F9FAFB] items-center justify-center">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 bg-[#4F46E5] rounded-full animate-bounce"></div>
          <div className="w-2.5 h-2.5 bg-[#4F46E5] rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
          <div className="w-2.5 h-2.5 bg-[#4F46E5] rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
        </div>
      </div>
    );
  }

  const role = user.user_metadata?.role || "patient";
  const userName = user.user_metadata?.name || user.email?.split('@')[0] || "User";

  return (
    <DashboardLayout role={role}>
      {role === "patient" ? <PatientDashboard userName={userName} /> : <DoctorDashboard userName={userName} />}
    </DashboardLayout>
  );
}
