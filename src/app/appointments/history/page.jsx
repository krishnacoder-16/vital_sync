"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Calendar, Plus, CheckCircle2, XCircle, Clock, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../store/authStore";
import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { AppointmentCard } from "../../../components/appointment/AppointmentCard";
import { getAppointmentsByPatient, getAppointmentsByDoctor } from "../../../lib/appointments";
import { supabase } from "../../../lib/supabaseClient";

// ─── Doctor view: Accept / Reject an appointment ─────────────────────────────
async function updateAppointmentStatus(id, status) {
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id);
  return { error };
}

// ─── Doctor appointment row ────────────────────────────────────────────────
function DoctorAppointmentRow({ appointment, index, onAction }) {
  const [acting, setActing] = useState(false);
  // Optimistic local status — updates instantly before parent re-fetches
  const [localStatus, setLocalStatus] = useState(appointment.status);

  const handleAction = async (newStatus) => {
    setActing(true);
    setLocalStatus(newStatus); // instant badge + button update
    const { error } = await updateAppointmentStatus(appointment.id, newStatus);
    setActing(false);
    if (error) {
      setLocalStatus(appointment.status); // revert on failure
      toast.error("Failed to update appointment. Please try again.");
    } else {
      if (newStatus === "confirmed") {
        toast.success(`Appointment confirmed for ${appointment.patient_name || "patient"}.`);
      } else {
        toast.error(`Appointment rejected for ${appointment.patient_name || "patient"}.`);
      }
      onAction(appointment.id, newStatus); // bubble id + new status up to parent
    }
  };

  const statusColors = {
    scheduled: { bg: "#FFFBEB", border: "#FDE68A", text: "#B45309", label: "Scheduled" },
    confirmed: { bg: "#F0FDF4", border: "#BBF7D0", text: "#15803D", label: "Confirmed" },
    cancelled: { bg: "#FEF2F2", border: "#FECACA", text: "#B91C1C", label: "Cancelled" },
  };
  const s = statusColors[localStatus] || statusColors.scheduled;

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className="bg-white rounded-xl p-5 border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Patient info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#047857] rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ fontSize: "15px", fontWeight: 600 }}>
            {(appointment.patient_name || "P").substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <User size={14} className="text-[#6B7280]" />
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>
                {appointment.patient_name || "Patient"}
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px" }}>
              {appointment.specialization}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#6B7280]" />
                <span style={{ fontSize: "13px", color: "#6B7280" }}>
                  {new Date(appointment.date + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#6B7280]" />
                <span style={{ fontSize: "13px", color: "#6B7280" }}>
                  {appointment.time_slot}
                </span>
              </div>
            </div>
            {appointment.notes && (
              <p className="mt-2 text-[13px] text-[#6B7280] bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2">
                {appointment.notes}
              </p>
            )}
          </div>
        </div>

        {/* Status badge + actions */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          {/* Status badge — reflects localStatus instantly */}
          <span
            className="px-3 py-1 rounded-full border text-[12px] font-semibold"
            style={{ backgroundColor: s.bg, borderColor: s.border, color: s.text }}
          >
            {s.label}
          </span>

          {/* Accept / Reject — only while still scheduled */}
          {localStatus === "scheduled" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAction("confirmed")}
                disabled={acting}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                <CheckCircle2 size={14} />
                Accept
              </button>
              <button
                onClick={() => handleAction("cancelled")}
                disabled={acting}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#FECACA] text-[#EF4444] rounded-lg hover:bg-[#FEF2F2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                <XCircle size={14} />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function AppointmentHistoryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const role = user?.user_metadata?.role || "patient";
  const isDoctor = role === "doctor";

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [filter, setFilter] = useState("all");

  const load = async () => {
    if (!user) return;
    setFetchError("");

    const { data, error } = isDoctor
      ? await getAppointmentsByDoctor(user.id)
      : await getAppointmentsByPatient(user.id);

    if (error) {
      setFetchError("Failed to load appointments. Please try again.");
    } else {
      setAppointments(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    load();

    // Real-time channel — scoped to role
    const filterStr = isDoctor
      ? `doctor_id=eq.${user.id}`
      : `patient_id=eq.${user.id}`;

    const channel = supabase
      .channel("appointments_page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments", filter: filterStr },
        (payload) => {
          // For patients: show a notification when doctor changes the status
          if (!isDoctor && payload.eventType === "UPDATE") {
            const newStatus = payload.new?.status;
            const oldStatus = payload.old?.status;
            if (newStatus && newStatus !== oldStatus) {
              if (newStatus === "confirmed") {
                toast.success("✅ Your appointment has been confirmed by the doctor!");
              } else if (newStatus === "cancelled") {
                toast.error("❌ Your appointment was rejected by the doctor.");
              }
            }
          }
          load();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered =
    filter === "all"
      ? appointments
      : appointments.filter((a) => a.status === filter);

  return (
    <DashboardLayout role={role}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header — role-aware */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>
              {isDoctor ? "Patient Appointments" : "My Appointments"}
            </h1>
            <p className="mt-1 text-[#6B7280]">
              {isDoctor
                ? "Review and manage incoming appointment requests"
                : "Track and manage all your appointments"}
            </p>
          </div>

          {/* Book New — patients only */}
          {!isDoctor && (
            <button
              onClick={() => router.push("/appointments/book")}
              className="flex items-center gap-2 bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#4338CA] transition-colors shadow-[0_4px_12px_rgba(79,70,229,0.25)]"
              style={{ fontSize: "14px" }}
            >
              <Plus size={16} />
              Book New
            </button>
          )}
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
              {isDoctor ? "No appointment requests yet" : "No appointments yet"}
            </h3>
            <p className="mt-2 text-[14px] text-[#6B7280]">
              {isDoctor
                ? "Patients will appear here once they book with you"
                : "Book your first appointment from the dashboard"}
            </p>

            {/* CTA — patients only */}
            {!isDoctor && (
              <button
                onClick={() => router.push("/doctors")}
                className="mt-5 px-6 py-2.5 bg-[#4F46E5] text-white rounded-xl font-semibold hover:bg-[#4338CA] transition-colors"
              >
                Find a Doctor
              </button>
            )}
          </div>
        ) : isDoctor ? (
          // Doctor view — Accept/Reject rows
          <div className="flex flex-col gap-4">
            {filtered.map((appt, index) => (
              <DoctorAppointmentRow
                key={appt.id}
                appointment={appt}
                index={index}
                onAction={(id, newStatus) => {
                  // Immediately update the parent appointments array so tab
                  // filtering reflects the change without waiting for DB re-fetch
                  setAppointments(prev =>
                    prev.map(a => a.id === id ? { ...a, status: newStatus } : a)
                  );
                  // Background re-fetch to keep data in sync
                  load();
                }}
              />
            ))}
          </div>
        ) : (
          // Patient view — read-only cards
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
