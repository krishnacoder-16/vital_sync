"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Calendar, Plus } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { AppointmentCard } from "../../../components/appointment/AppointmentCard";
import { getAppointmentsByPatient } from "../../../lib/appointments";
import { supabase } from "../../../lib/supabaseClient";

export default function AppointmentHistoryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setIsLoading(true);
      setFetchError("");

      const { data, error } = await getAppointmentsByPatient(user.id);

      if (error) {
        setFetchError("Failed to load appointments. Please try again.");
      } else {
        setAppointments(data);
      }

      setIsLoading(false);
    };

    load();

    // Real-time synchronization
    const channel = supabase
      .channel("appointments_history")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments", filter: `patient_id=eq.${user.id}` },
        () => {
          // Re-fetch implicitly skips heavy loading UI since we just update state silently
          getAppointmentsByPatient(user.id).then(({ data, error }) => {
            if (!error && data) setAppointments(data);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const filtered =
    filter === "all"
      ? appointments
      : appointments.filter((a) => a.status === filter);

  const role = user?.user_metadata?.role || "patient";

  return (
    <DashboardLayout role={role}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>
              My Appointments
            </h1>
            <p className="mt-1 text-[#6B7280]">
              Track and manage all your appointments
            </p>
          </div>
          <button
            onClick={() => router.push("/appointments/book")}
            className="flex items-center gap-2 bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#4338CA] transition-colors shadow-[0_4px_12px_rgba(79,70,229,0.25)]"
            style={{ fontSize: "14px" }}
          >
            <Plus size={16} />
            Book New
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-[#F3F4F6] p-1 rounded-xl border border-[#E5E7EB] w-fit mb-6">
          {["all", "scheduled", "confirmed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all capitalize ${
                filter === tab
                  ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-[#4F46E5]"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Error State */}
        {fetchError && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[14px] font-medium">
            {fetchError}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 bg-[#4F46E5] rounded-full animate-bounce" />
              <div className="w-2.5 h-2.5 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              <div className="w-2.5 h-2.5 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-4">
              <Calendar size={28} className="text-[#4F46E5]" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827" }}>
              No appointments yet
            </h3>
            <p className="mt-2 text-[14px] text-[#6B7280]">
              Book your first appointment from the dashboard
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-5 px-6 py-2.5 bg-[#4F46E5] text-white rounded-xl font-semibold hover:bg-[#4338CA] transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((appt, index) => (
              <AppointmentCard key={appt.id} appointment={appt} index={index} />
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
