"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Calendar, Clock, Stethoscope, CheckCircle2, XCircle, AlertCircle, Pencil } from "lucide-react";

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
};

/**
 * AppointmentCard — patient-facing read/edit/cancel card.
 *
 * Props:
 *  appointment  — the appointment object
 *  index        — for staggered animation
 *  onEdit(appt) — called when patient clicks Edit (only for scheduled)
 *  onCancel(id) — called when patient clicks Cancel (not for already-cancelled)
 */
export function AppointmentCard({ appointment, index = 0, onEdit, onCancel }) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const status = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.scheduled;
  const StatusIcon = status.icon;

  const isScheduled  = appointment.status === "scheduled";
  const isCancelled  = appointment.status === "cancelled";

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

            {/* Inline cancel confirmation */}
            {confirmCancel && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl"
              >
                <p style={{ fontSize: "13px", color: "#B91C1C", fontWeight: 500, flex: 1 }}>
                  Cancel this appointment?
                </p>
                <button
                  onClick={() => { onCancel(appointment.id); setConfirmCancel(false); }}
                  className="px-3 py-1.5 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors"
                  style={{ fontSize: "12px", fontWeight: 600 }}
                >
                  Yes, Cancel
                </button>
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
                  style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}
                >
                  Keep
                </button>
              </motion.div>
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

          {/* Edit — scheduled only */}
          {isScheduled && onEdit && !confirmCancel && (
            <button
              onClick={() => onEdit(appointment)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
              style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}
            >
              <Pencil size={12} />
              Edit
            </button>
          )}

          {/* Cancel — not for already-cancelled */}
          {!isCancelled && onCancel && !confirmCancel && (
            <button
              onClick={() => setConfirmCancel(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#FECACA] text-[#EF4444] rounded-lg hover:bg-[#FEF2F2] transition-colors"
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              <XCircle size={12} />
              Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
