"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Plus, CheckCircle2, XCircle, Clock, User, FileText, Sparkles, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../store/authStore";
import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { AppointmentCard } from "../../../components/appointment/AppointmentCard";
import {
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
  updateAppointmentStatus,
  updateAppointment,
} from "../../../lib/appointments";
import { supabase } from "../../../lib/supabaseClient";
import { getHeuristicPriority } from "../../../lib/aiDoctor";
import { DoctorInsightsPanel } from "../../../components/ai/DoctorInsightsPanel";
import { AppointmentRowSkeleton, Spinner } from "../../../components/common/Skeletons";

// ─── Time slots (same as booking page) ──────────────────────────────────────
const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM",
];

// ─── Edit Appointment Modal ──────────────────────────────────────────────────
function EditModal({ appointment, onSave, onClose }) {
  const [date, setDate]       = useState(appointment.date || "");
  const [slot, setSlot]       = useState(appointment.time_slot || "");
  const [notes, setNotes]     = useState(appointment.notes || "");
  const [saving, setSaving]   = useState(false);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  const handleSave = async () => {
    if (!date) { toast.error("Please select a date."); return; }
    if (!slot) { toast.error("Please select a time slot."); return; }
    setSaving(true);
    await onSave(appointment.id, { date, time_slot: slot, notes: notes.trim() });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Modal header */}
          <div className="px-6 py-5 border-b border-[#E5E7EB]">
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>
              Reschedule Appointment
            </h2>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              {appointment.doctor_name} · {appointment.specialization}
            </p>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Date picker */}
            <div>
              <label className="flex items-center gap-2 text-[14px] font-semibold text-[#111827] mb-2">
                <Calendar size={14} className="text-[#0d9488]" />
                Date
              </label>
              <input
                type="date"
                min={minDateStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] focus:border-[#0d9488] focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 transition-all text-[#111827]"
                style={{ fontSize: "15px" }}
              />
            </div>

            {/* Time slot */}
            <div>
              <label className="flex items-center gap-2 text-[14px] font-semibold text-[#111827] mb-2">
                <Clock size={14} className="text-[#0d9488]" />
                Time Slot
              </label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlot(s)}
                    className={`py-2 px-1 rounded-lg border text-[12px] font-medium transition-all ${
                      slot === s
                        ? "bg-[#0d9488] border-[#0d9488] text-white shadow-[0_2px_8px_rgba(13,148,136,0.3)]"
                        : "bg-[#F9FAFB] border-[#E5E7EB] text-[#374151] hover:border-[#0d9488] hover:text-[#0d9488]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="flex items-center gap-2 text-[14px] font-semibold text-[#111827] mb-2">
                <FileText size={14} className="text-[#0d9488]" />
                Notes{" "}
                <span style={{ fontSize: "12px", fontWeight: 400, color: "#9CA3AF" }}>(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Describe your symptoms or reason for visit..."
                className="w-full px-4 py-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] focus:border-[#0d9488] focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 transition-all resize-none text-[#111827]"
                style={{ fontSize: "14px" }}
              />
            </div>
          </div>

          {/* Modal footer */}
          <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 border border-[#E5E7EB] rounded-xl hover:bg-[#F9FAFB] transition-colors"
              style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-[#0d9488] text-white rounded-xl hover:bg-[#0f766e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Doctor appointment row ──────────────────────────────────────────────────
const STATUS_COLORS = {
  scheduled: { bg: "#FFFBEB", border: "#FDE68A", text: "#B45309", label: "Scheduled" },
  confirmed:  { bg: "#F0FDF4", border: "#BBF7D0", text: "#15803D", label: "Confirmed"  },
  cancelled:  { bg: "#FEF2F2", border: "#FECACA", text: "#B91C1C", label: "Cancelled"  },
};

function DoctorAppointmentRow({ appointment, index, onAction, onClick }) {
  const [acting, setActing] = useState(false);
  const s = STATUS_COLORS[appointment.status] || STATUS_COLORS.scheduled;

  const handleAction = async (newStatus, e) => {
    e.stopPropagation();
    setActing(true);
    const { error } = await updateAppointmentStatus(appointment.id, newStatus);
    setActing(false);
    if (error) {
      toast.error(error.message || "Failed to update. Please try again.");
      return;
    }
    onAction(appointment.id, newStatus);
    if (newStatus === "confirmed") {
      toast.success(`Appointment confirmed for ${appointment.patient_name || "patient"}.`);
    } else {
      toast.error(`Appointment rejected for ${appointment.patient_name || "patient"}.`);
    }
  };

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      onClick={onClick}
      className="bg-white rounded-xl flex flex-col border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all overflow-hidden cursor-pointer group relative z-10"
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 w-full">
          <div
            className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#047857] rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ fontSize: "15px", fontWeight: 600 }}
          >
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
                <span style={{ fontSize: "13px", color: "#6B7280" }}>{appointment.time_slot}</span>
              </div>
            </div>
            {appointment.notes && (
              <p className="mt-2 text-[13px] text-[#6B7280] bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2">
                {appointment.notes}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-3 flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full border text-[12px] font-semibold"
              style={{ backgroundColor: s.bg, borderColor: s.border, color: s.text }}
            >
              {s.label}
            </span>
            {appointment.priority && (
              <div className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1
                ${appointment.priority === 'High' ? 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]' : 
                  appointment.priority === 'Medium' ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]' : 
                  'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'}`}
              >
                <AlertCircle size={12} /> {appointment.priority}
              </div>
            )}
          </div>
          
          {appointment.status === "scheduled" && (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleAction("confirmed", e)}
                disabled={acting}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px] justify-center"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                {acting ? <Spinner size={14} /> : <><CheckCircle2 size={14} /> Accept</>}
              </button>
              <button
                onClick={(e) => handleAction("cancelled", e)}
                disabled={acting}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#FECACA] text-[#EF4444] rounded-lg hover:bg-[#FEF2F2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px] justify-center"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                {acting ? <Spinner size={14} /> : <><XCircle size={14} /> Reject</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AppointmentHistoryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const role     = user?.user_metadata?.role || "patient";
  const isDoctor = role === "doctor";

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [fetchError, setFetchError]     = useState("");
  const [filter, setFilter]             = useState("all");
  const [editTarget, setEditTarget]     = useState(null); // appointment being edited

  // AI & Priority States for Doctor
  const [aiData, setAiData] = useState({});
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [prioritySort, setPrioritySort] = useState("High to Low");
  const [selectedAppt, setSelectedAppt] = useState(null);

  const handleInsightGenerated = (id, data) => {
    setAiData(prev => ({ ...prev, [id]: data }));
  };

  // ── Fetch ──
  const load = useCallback(async () => {
    if (!user) return;
    setFetchError("");
    const { data, error } = isDoctor
      ? await getAppointmentsByDoctor(user.id)
      : await getAppointmentsByPatient(user.id);
    if (error) setFetchError("Failed to load appointments. Please try again.");
    else setAppointments(data);
    setIsLoading(false);
  }, [user, isDoctor]);

  // ── Doctor: Accept / Reject ──
  const handleStatusUpdate = useCallback((id, newStatus) => {
    setAppointments(prev =>
      prev.map(a => a.id === id ? { ...a, status: newStatus } : a)
    );
  }, []);

  // ── Patient: Edit save ──
  const handleEditSave = async (id, updates) => {
    const { data, error } = await updateAppointment(id, updates);
    if (error) {
      toast.error(error.message || "Failed to save changes.");
      return;
    }
    setAppointments(prev =>
      prev.map(a => a.id === id ? { ...a, ...data } : a)
    );
    setEditTarget(null);
    toast.success("Appointment rescheduled successfully!");
  };

  // ── Initial load + real-time ──
  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    load();

    const filterStr = isDoctor
      ? `doctor_id=eq.${user.id}`
      : `patient_id=eq.${user.id}`;

    const channel = supabase
      .channel("appointments_page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments", filter: filterStr },
        (payload) => {
          if (!isDoctor && payload.eventType === "UPDATE") {
            const newStatus = payload.new?.status;
            const oldStatus = payload.old?.status;
            if (newStatus && newStatus !== oldStatus) {
              if (newStatus === "confirmed")
                toast.success("✅ Your appointment has been confirmed by the doctor!");
              else if (newStatus === "cancelled")
                toast.error("❌ Your appointment was rejected by the doctor.");
            }
          }
          load();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, load, isDoctor]);

  // ── Filtering & Sorting ──
  let processedAppointments = appointments;

  if (filter !== "all") {
    processedAppointments = processedAppointments.filter((a) => a.status === filter);
  }

  if (isDoctor) {
    // Add priority to all appointments
    processedAppointments = processedAppointments.map(appt => {
      const priority = aiData[appt.id]?.priority || getHeuristicPriority(appt);
      return {
        ...appt,
        priority,
        priorityValue: priority === "High" ? 1 : priority === "Medium" ? 2 : 3
      };
    });

    if (priorityFilter !== "All") {
      processedAppointments = processedAppointments.filter(a => a.priority === priorityFilter);
    }

    processedAppointments.sort((a, b) => {
      if (prioritySort === "High to Low") return a.priorityValue - b.priorityValue;
      return b.priorityValue - a.priorityValue;
    });
  }

  return (
    <DashboardLayout role={role}>
      {/* Edit modal — rendered at page level so it sits above layout */}
      {editTarget && (
        <EditModal
          appointment={editTarget}
          onSave={handleEditSave}
          onClose={() => setEditTarget(null)}
        />
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
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
          {!isDoctor && (
            <button
              onClick={() => router.push("/appointments/book")}
              className="flex items-center gap-2 bg-[#0d9488] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#0f766e] transition-colors shadow-[0_4px_12px_rgba(13,148,136,0.25)]"
              style={{ fontSize: "14px" }}
            >
              <Plus size={16} /> Book New
            </button>
          )}
        </div>
        {/* Filter tabs */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
          <div className="flex items-center bg-[#F3F4F6] p-1 rounded-xl border border-[#E5E7EB] w-full sm:w-fit overflow-x-auto overflow-y-hidden whitespace-nowrap">
            {["all", "scheduled", "confirmed", "cancelled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all capitalize ${
                  filter === tab
                    ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-[#0d9488]"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {isDoctor && !isLoading && processedAppointments.length > 0 && (
            <div className="flex items-center gap-3">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-white border border-[#E5E7EB] text-[#374151] text-[13px] font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#0d9488]"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={prioritySort}
                onChange={(e) => setPrioritySort(e.target.value)}
                className="bg-white border border-[#E5E7EB] text-[#374151] text-[13px] font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#0d9488]"
              >
                <option value="High to Low">Sort: High to Low</option>
                <option value="Low to High">Sort: Low to High</option>
              </select>
            </div>
          )}
        </div>

        {/* Error */}
        {fetchError && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[14px] font-medium">
            {fetchError}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <AppointmentRowSkeleton count={5} />
        ) : processedAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[#f0fdfa] rounded-full flex items-center justify-center mb-4">
              <Calendar size={28} className="text-[#0d9488]" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827" }}>
              {isDoctor ? "No appointment requests yet" : "No appointments yet"}
            </h3>
            <p className="mt-2 text-[14px] text-[#6B7280]">
              {isDoctor
                ? "Patients will appear here once they book with you"
                : "Book your first appointment from the dashboard"}
            </p>
            {!isDoctor && (
              <button
                onClick={() => router.push("/doctors")}
                className="mt-5 px-6 py-2.5 bg-[#0d9488] text-white rounded-xl font-semibold hover:bg-[#0f766e] transition-colors"
              >
                Find a Doctor
              </button>
            )}
          </div>
        ) : isDoctor ? (
          <div className="flex flex-col gap-4">
            {processedAppointments.map((appt, index) => (
              <DoctorAppointmentRow
                key={appt.id}
                appointment={appt}
                index={index}
                onAction={handleStatusUpdate}
                onClick={() => setSelectedAppt(appt)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {processedAppointments.map((appt, index) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                index={index}
                onEdit={setEditTarget}
              />
            ))}
          </div>
        )}
      </motion.div>
      
      {isDoctor && (
        <DoctorInsightsPanel 
          isOpen={!!selectedAppt}
          onClose={() => setSelectedAppt(null)}
          appointment={selectedAppt}
          cachedInsight={selectedAppt ? aiData[selectedAppt.id] : null}
          onInsightGenerated={handleInsightGenerated}
        />
      )}
    </DashboardLayout>
  );
}
