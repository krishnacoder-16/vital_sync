"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Calendar, Clock, Stethoscope, CheckCircle2, XCircle, AlertCircle, Pencil, CalendarClock, RefreshCw } from "lucide-react";

const STATUS_CONFIG = {
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "#10B981",
    bg: "#F0FDF4",
    border: "#BBF7D0",
  },
  scheduled: {
    label: "Scheduled",
    icon: AlertCircle,
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "#EF4444",
    bg: "#FEF2F2",
    border: "#FECACA",
  },
  rescheduled: {
    label: "Rescheduled",
    icon: RefreshCw,
    color: "#2563EB", // Blue
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
};

/**
 * AppointmentCard — patient-facing read/reschedule card.
 *
 * Props:
 *  appointment  — the appointment object
 *  index        — for staggered animation
 *  onEdit(appt) — called when patient clicks Edit (only for scheduled)
 */
export function AppointmentCard({ appointment, index = 0, onEdit }) {
  const status = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.scheduled;
  const StatusIcon = status.icon;

  const isScheduled = appointment.status === "scheduled";
  const isCancelled = appointment.status === "cancelled";
  const canReschedule = !isCancelled && !appointment.is_rescheduled;

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-white rounded-xl p-5 border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all"
    >
      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
        {/* Left: appointment info */}
        <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
          <div className="w-12 h-12 bg-[#f0fdfa] rounded-xl flex items-center justify-center flex-shrink-0">
            <Stethoscope size={22} className="text-[#0d9488]" />
          </div>

          <div className="flex-1 min-w-0 w-full">
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>
              {appointment.doctor_name}
            </h3>
            <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px" }}>
              {appointment.specialization}
            </p>

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#6B7280]" />
                <span style={{ fontSize: "13px", color: "#6B7280" }}>
                  {new Date(appointment.date + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
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

        {/* Right: status badge + action buttons */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Status badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
            style={{ backgroundColor: status.bg, borderColor: status.border }}
          >
            <StatusIcon size={13} style={{ color: status.color }} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: status.color }}>
              {status.label}
            </span>
          </div>

          {/* Reschedule — visible if not cancelled and hasn't been rescheduled yet */}
          {canReschedule && onEdit && (
            <button
              onClick={() => onEdit(appointment)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f0fdfa] border border-[#99f6e4] text-[#0d9488] rounded-lg hover:bg-[#ccfbf1] transition-colors"
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              <CalendarClock size={12} />
              Reschedule
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
