"use client";

import { motion } from "motion/react";
import { Calendar, Clock, Stethoscope, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

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

export function AppointmentCard({ appointment, index = 0 }) {
  const status = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.scheduled;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-white rounded-xl p-5 border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 bg-[#EEF2FF] rounded-xl flex items-center justify-center flex-shrink-0">
            <Stethoscope size={22} className="text-[#4F46E5]" />
          </div>

          <div className="flex-1 min-w-0">
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
                  {new Date(appointment.date).toLocaleDateString("en-US", {
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
              <p
                className="mt-2 text-[13px] text-[#6B7280] bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2"
              >
                {appointment.notes}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0 border"
          style={{
            backgroundColor: status.bg,
            borderColor: status.border,
          }}
        >
          <StatusIcon size={13} style={{ color: status.color }} />
          <span style={{ fontSize: "12px", fontWeight: 600, color: status.color }}>
            {status.label}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
