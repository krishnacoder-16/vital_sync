"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { PatientDashboard } from "../../components/dashboard/PatientDashboard";
import { DoctorDashboard } from "../../components/dashboard/DoctorDashboard";

export default function DashboardPage() {
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Attempt to grab securely saved role from local storage mockup or fallback to patient
    const savedRole = localStorage.getItem("vitalsync_role") || "patient";
    const savedName = localStorage.getItem("vitalsync_name") || "Guest";
    setRole(savedRole);
    setUserName(savedName);
  }, []);

  // Simple loading barrier while reading client state
  if (!role) {
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

  return (
    <DashboardLayout 
      role={role} 
      setRole={(newRole) => {
        setRole(newRole);
        localStorage.setItem("vitalsync_role", newRole);
      }}
    >
      {role === "patient" ? <PatientDashboard userName={userName} /> : <DoctorDashboard userName={userName} />}
    </DashboardLayout>
  );
}
