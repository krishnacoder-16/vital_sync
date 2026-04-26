"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Calendar, Clock, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../store/authStore";
import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { createAppointment } from "../../../lib/appointments";

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM",
];

function BookAppointmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const doctorId = searchParams.get("doctorId");
  const doctorName = searchParams.get("doctorName") || "Doctor";
  const specialization = searchParams.get("specialization") || "";

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Minimum date = tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate) { setError("Please select a date."); return; }
    if (!selectedSlot) { setError("Please select a time slot."); return; }

    setError("");
    setIsLoading(true);

    const { error: dbError } = await createAppointment({
      userId: user.id,
      patientName: user.user_metadata?.name || user.email,
      doctorId,
      doctorName,
      specialization,
      date: selectedDate,
      timeSlot: selectedSlot,
      notes: notes.trim(),
    });

    setIsLoading(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    toast.success("Appointment booked successfully!");
    router.push("/appointments/history");
  };

  const role = user?.user_metadata?.role || "patient";

  return (
    <DashboardLayout role={role}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-[13px] text-[#6B7280] hover:text-[#111827] mb-4 flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>
            Book Appointment
          </h1>
          <p className="mt-1 text-[#6B7280]">
            Scheduling with{" "}
            <span className="font-semibold text-[#111827]">{doctorName}</span> · {specialization}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Picker */}
          <div className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#f0fdfa] rounded-lg flex items-center justify-center">
                <Calendar size={16} className="text-[#0d9488]" />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>
                Select Date
              </h3>
            </div>
            <input
              type="date"
              min={minDateStr}
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setError(""); }}
              className="w-full px-4 py-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] focus:border-[#0d9488] focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 transition-all text-[#111827]"
              style={{ fontSize: "15px" }}
            />
          </div>

          {/* Time Slot Picker */}
          <div className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#f0fdfa] rounded-lg flex items-center justify-center">
                <Clock size={16} className="text-[#0d9488]" />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>
                Select Time Slot
              </h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => { setSelectedSlot(slot); setError(""); }}
                  className={`py-2.5 px-2 rounded-lg border text-[13px] font-medium transition-all ${
                    selectedSlot === slot
                      ? "bg-[#0d9488] border-[#0d9488] text-white shadow-[0_2px_8px_rgba(13,148,136,0.3)]"
                      : "bg-[#F9FAFB] border-[#E5E7EB] text-[#374151] hover:border-[#0d9488] hover:text-[#0d9488]"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#f0fdfa] rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-[#0d9488]" />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>
                Notes{" "}
                <span style={{ fontSize: "13px", fontWeight: 400, color: "#9CA3AF" }}>
                  (optional)
                </span>
              </h3>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe your symptoms or reason for visit..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] focus:border-[#0d9488] focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 transition-all resize-none text-[#111827]"
              style={{ fontSize: "14px" }}
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[14px] font-medium">
              {error}
            </div>
          )}

          {/* Booking summary */}
          {selectedDate && selectedSlot && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#f0fdfa] border border-[#99f6e4] rounded-xl px-5 py-4 text-[14px] text-[#0f766e]"
            >
              <span className="font-semibold">Booking summary: </span>
              {doctorName} ·{" "}
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric",
              })}{" "}
              at {selectedSlot}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0d9488] text-white py-3.5 rounded-xl font-semibold hover:bg-[#0f766e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(13,148,136,0.3)]"
            style={{ fontSize: "16px" }}
          >
            {isLoading ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>
      </motion.div>
    </DashboardLayout>
  );
}

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-[#F9FAFB] items-center justify-center">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 bg-[#0d9488] rounded-full animate-bounce"></div>
          <div className="w-2.5 h-2.5 bg-[#0d9488] rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
          <div className="w-2.5 h-2.5 bg-[#0d9488] rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
        </div>
      </div>
    }>
      <BookAppointmentContent />
    </Suspense>
  );
}
