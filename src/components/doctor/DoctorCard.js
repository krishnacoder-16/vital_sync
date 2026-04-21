"use client";

import { motion } from "motion/react";
import { MapPin, Star, Stethoscope } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Helper: generate avatar initials from a doctor name like "Dr. Sarah Johnson" → "SJ"
 */
function getAvatar(name) {
  const parts = (name || "").replace(/^Dr\.?\s*/i, "").trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0] || "D").substring(0, 2).toUpperCase();
}

export function DoctorCard({ doctor, index = 0 }) {
  const router = useRouter();
  const avatar = doctor.avatar || getAvatar(doctor.name);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
      className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ fontSize: "16px", fontWeight: 600 }}
        >
          {avatar}
        </div>

        <div className="flex-1 min-w-0">
          <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#111827" }}>
            {doctor.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Stethoscope size={13} className="text-[#6B7280]" />
            <p style={{ fontSize: "13px", color: "#6B7280" }}>
              {doctor.specialization}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[#6B7280]" />
              <span style={{ fontSize: "13px", color: "#6B7280" }}>
                {doctor.location}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={13} className="text-[#F59E0B] fill-[#F59E0B]" />
              <span style={{ fontSize: "13px", color: "#111827", fontWeight: 600 }}>
                {doctor.rating}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <div
              className={`w-2 h-2 rounded-full ${
                doctor.available ? "bg-[#10B981]" : "bg-[#EF4444]"
              }`}
            />
            <span style={{ fontSize: "13px", color: "#6B7280" }}>
              {doctor.available ? "Available Now" : "Busy"}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => router.push(`/appointments/book?doctorId=${doctor.id}&doctorName=${encodeURIComponent(doctor.name)}&specialization=${encodeURIComponent(doctor.specialization)}`)}
              disabled={!doctor.available}
              className="flex-1 bg-[#4F46E5] text-white py-2.5 px-4 rounded-lg hover:bg-[#4338CA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              Book Appointment
            </button>
            <button
              className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
              style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
