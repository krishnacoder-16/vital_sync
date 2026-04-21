"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  CalendarDays,
  Users,
  Clock,
  CheckCircle2,
  MapPin,
  Activity,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { getAppointmentsByDoctor } from "../../lib/appointments";
import { supabase } from "../../lib/supabaseClient";

export function DoctorDashboard({ userName = "Dr. Smith" }) {
  const { user } = useAuthStore();
  const formattedName = userName.toLowerCase().startsWith("dr")
    ? userName
    : `Dr. ${userName}`;

  const [schedule, setSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data } = await getAppointmentsByDoctor(formattedName);
      // Filter for today's schedule inline
      const todayString = new Date().toISOString().split("T")[0];
      const todaysData = (data || []).filter(a => a.date === todayString);
      setSchedule(todaysData);
      setScheduleLoading(false);
    };

    load();

    // Real-time synchronization
    const channel = supabase
      .channel("appointments_doctor")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments", filter: `doctor_name=eq.${formattedName}` },
        () => {
          load(); // Re-fetch when patient books or updates an appointment
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, formattedName]);

  const stats = [
    {
      label: "Appointments Today",
      value: scheduleLoading ? "—" : schedule.length.toString(),
      icon: CalendarDays,
      color: "#4F46E5",
    },
    { label: "Total Patients", value: "145", icon: Users, color: "#10B981" },
    { label: "Available Slots", value: "4", icon: Clock, color: "#F59E0B" },
  ];

  // Fallback mock schedule shown when no real data is available yet
  const mockSchedule = [
    { title: "Robert Fox", description: "Annual Physical Checkup", time: "09:00 AM", status: "Scheduled" },
    { title: "Wade Warren", description: "Blood Test Review", time: "11:30 AM", status: "Completed" },
    { title: "Esther Howard", description: "Follow-up Consultation", time: "02:00 PM", status: "Scheduled" },
  ];

  // Map real DB rows to display format; fall back to mock if none
  const displaySchedule =
    schedule.length > 0
      ? schedule.map((appt) => ({
          title: appt.patient_name || "Patient",
          description: appt.specialization || "Consultation",
          time: appt.time_slot,
          status: appt.status === "pending" ? "Scheduled" : appt.status.charAt(0).toUpperCase() + appt.status.slice(1),
        }))
      : mockSchedule;

  const myPatients = [
    { id: 1, name: "Robert Fox", condition: "Hypertension", location: "New York, NY", lastVisit: "2 weeks ago", avatar: "RF" },
    { id: 2, name: "Wade Warren", condition: "Diabetes Type 2", location: "Brooklyn, NY", lastVisit: "1 month ago", avatar: "WW" },
    { id: 3, name: "Esther Howard", condition: "Asthma", location: "Queens, NY", lastVisit: "3 days ago", avatar: "EH" },
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 mb-8">
        {/* Today's Schedule — real or fallback */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827" }}>
              Today's Schedule
            </h2>
            {schedule.length === 0 && !scheduleLoading && (
              <span className="text-[12px] text-[#9CA3AF] bg-[#F3F4F6] px-2 py-1 rounded-lg">
                Sample data
              </span>
            )}
          </div>

          {scheduleLoading ? (
            <div className="flex gap-2 py-4">
              <div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              <div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
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

        {/* My Patients — static for now */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <h2 className="mb-6" style={{ fontSize: "20px", fontWeight: 600, color: "#111827" }}>
            My Patients
          </h2>
          <div className="flex flex-col gap-4">
            {myPatients.map((patient) => (
              <div
                key={patient.id}
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
                    <Activity size={13} className="text-[#EF4444]" />
                    <p style={{ fontSize: "13px", color: "#6B7280" }}>
                      {patient.condition}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#6B7280]" />
                    <span style={{ fontSize: "12px", color: "#6B7280" }}>
                      {patient.location}
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>
                    Last visit: {patient.lastVisit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
