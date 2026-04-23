"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  CalendarDays,
  Users,
  Clock,
  MapPin,
  Activity,
  Stethoscope,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { getAppointmentsByDoctor } from "../../lib/appointments";
import { supabase } from "../../lib/supabaseClient";
import { AppointmentsLineChart } from "../charts/AppointmentsLineChart";
import { StatusPieChart } from "../charts/StatusPieChart";

export function DoctorDashboard({ userName = "Dr. Smith" }) {
  const { user } = useAuthStore();
  const formattedName = userName.toLowerCase().startsWith("dr")
    ? userName
    : `Dr. ${userName}`;

  const doctorId = user?.id;

  const [allAppointments, setAllAppointments] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  useEffect(() => {
    if (!user || !doctorId) return;

    const load = async () => {
      const { data } = await getAppointmentsByDoctor(doctorId);
      setAllAppointments(data || []);
      setScheduleLoading(false);
    };

    load();

    // Real-time synchronization — filter by doctor_id UUID
    const channel = supabase
      .channel("appointments_doctor")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments", filter: `doctor_id=eq.${doctorId}` },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, doctorId]);

  // Filter for today's schedule
  const todayString = new Date().toISOString().split("T")[0];
  const todaysSchedule = allAppointments.filter(a => a.date === todayString);

  // Derive unique patients from all appointments
  const uniquePatients = [];
  const seenPatients = new Set();
  for (const appt of allAppointments) {
    const key = appt.patient_id || appt.patient_name;
    if (!seenPatients.has(key)) {
      seenPatients.add(key);
      uniquePatients.push({
        id: appt.patient_id,
        name: appt.patient_name || "Patient",
        condition: appt.specialization || "General",
        lastVisit: getTimeAgo(appt.created_at),
        avatar: getInitials(appt.patient_name || "P"),
      });
    }
  }

  // Compute available slots (14 total per day minus today's booked)
  const totalSlots = 14;
  const availableSlots = Math.max(0, totalSlots - todaysSchedule.length);

  const stats = [
    {
      label: "Appointments Today",
      value: scheduleLoading ? "—" : todaysSchedule.length.toString(),
      icon: CalendarDays,
      color: "#4F46E5",
    },
    {
      label: "Total Patients",
      value: scheduleLoading ? "—" : uniquePatients.length.toString(),
      icon: Users,
      color: "#10B981",
    },
    {
      label: "Available Slots",
      value: scheduleLoading ? "—" : availableSlots.toString(),
      icon: Clock,
      color: "#F59E0B",
    },
  ];

  // Map real DB rows to display format
  const displaySchedule = todaysSchedule.map((appt) => ({
    title: appt.patient_name || "Patient",
    description: appt.specialization || "Consultation",
    time: appt.time_slot,
    status: appt.status === "scheduled"
      ? "Scheduled"
      : appt.status.charAt(0).toUpperCase() + appt.status.slice(1),
  }));

  return (
    <>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="mb-2" style={{ fontSize: "32px", fontWeight: 700, color: "#111827" }}>
              Welcome back, {formattedName} 👋
            </h1>
            <p style={{ fontSize: "16px", color: "#6B7280" }}>
              Here is your schedule and patient updates for today.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 border border-[#E5E7EB] rounded-xl shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="text-sm font-medium text-[#111827]">Available for Walk-ins</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mt-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
            </div>
            <p style={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>
              {stat.value}
            </p>
            <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}>
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Charts ── */}
      {!scheduleLoading && allAppointments.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10"
        >
          <AppointmentsLineChart appointments={allAppointments} days={7} />
          <StatusPieChart appointments={allAppointments} />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 mb-8">
        {/* Today's Schedule */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="mb-6" style={{ fontSize: "20px", fontWeight: 600, color: "#111827" }}>
            Today's Schedule
          </h2>

          {scheduleLoading ? (
            <div className="flex gap-2 py-4">
              <div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              <div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>
          ) : displaySchedule.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 text-center">
              <p style={{ fontSize: "14px", color: "#6B7280" }}>
                No appointments scheduled for today.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] divide-y divide-[#E5E7EB]">
              {displaySchedule.map((appt, index) => (
                <div
                  key={index}
                  className="p-5 hover:bg-[#F9FAFB] transition-colors flex items-start gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#EEF2FF" }}
                  >
                    <Clock size={20} style={{ color: "#4F46E5" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>
                      {appt.title}{" "}
                      <span className="text-sm font-normal text-[#6B7280]">
                        ({appt.status})
                      </span>
                    </h3>
                    <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "2px" }}>
                      {appt.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
                    <Clock size={14} className="text-[#6B7280]" />
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>
                      {appt.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* My Patients — derived from real appointments */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <h2 className="mb-6" style={{ fontSize: "20px", fontWeight: 600, color: "#111827" }}>
            My Patients
          </h2>

          {scheduleLoading ? (
            <div className="flex gap-2 py-4">
              <div className="w-2 h-2 bg-[#10B981] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[#10B981] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              <div className="w-2 h-2 bg-[#10B981] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>
          ) : uniquePatients.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 text-center">
              <p style={{ fontSize: "14px", color: "#6B7280" }}>
                No patients yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {uniquePatients.slice(0, 5).map((patient, idx) => (
                <div
                  key={patient.id || idx}
                  className="bg-white rounded-xl p-5 border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all flex items-start gap-4"
                >
                  <div
                    className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#047857] rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ fontSize: "15px", fontWeight: 600 }}
                  >
                    {patient.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>
                      {patient.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Stethoscope size={13} className="text-[#6B7280]" />
                      <p style={{ fontSize: "13px", color: "#6B7280" }}>
                        {patient.condition}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span style={{ fontSize: "12px", color: "#6B7280" }}>
                      Last booked: {patient.lastVisit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}

/** Helper: convert ISO timestamp to "X ago" string */
function getTimeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  return `${diffDay}d ago`;
}

/** Helper: extract initials from a name */
function getInitials(name) {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}
