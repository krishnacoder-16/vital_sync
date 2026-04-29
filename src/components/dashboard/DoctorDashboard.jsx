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
  Sparkles,
  FileText,
  AlertCircle
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { getAppointmentsByDoctor } from "../../lib/appointments";
import { supabase } from "../../lib/supabaseClient";
import { AppointmentsLineChart } from "../charts/AppointmentsLineChart";
import { StatusPieChart } from "../charts/StatusPieChart";
import { getPatientInsights, getHeuristicPriority } from "../../lib/aiDoctor";
import { DoctorInsightsPanel } from "../ai/DoctorInsightsPanel";

export function DoctorDashboard({ userName = "Dr. Smith" }) {
  const { user } = useAuthStore();
  const formattedName = userName.toLowerCase().startsWith("dr")
    ? userName
    : `Dr. ${userName}`;

  const doctorId = user?.id;

  const [allAppointments, setAllAppointments] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  
  // AI Insights Panel State
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [aiData, setAiData] = useState({});
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [prioritySort, setPrioritySort] = useState("High to Low");

  const handleInsightGenerated = (id, data) => {
    setAiData(prev => ({ ...prev, [id]: data }));
  };

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
      color: "#0d9488",
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

  // Map real DB rows to display format + apply priority
  let displaySchedule = todaysSchedule.map((appt) => {
    const cachedPriority = aiData[appt.id]?.priority;
    const priority = cachedPriority || getHeuristicPriority(appt);
    return {
      original: appt,
      title: appt.patient_name || "Patient",
      description: appt.specialization || "Consultation",
      time: appt.time_slot,
      status: appt.status === "scheduled"
        ? "Scheduled"
        : appt.status.charAt(0).toUpperCase() + appt.status.slice(1),
      priority,
      priorityValue: priority === "High" ? 1 : priority === "Medium" ? 2 : 3
    };
  });

  // Filter
  if (priorityFilter !== "All") {
    displaySchedule = displaySchedule.filter(a => a.priority === priorityFilter);
  }

  // Sort
  displaySchedule.sort((a, b) => {
    if (prioritySort === "High to Low") return a.priorityValue - b.priorityValue;
    return b.priorityValue - a.priorityValue;
  });

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827" }}>
              Today's Schedule
            </h2>
            {!scheduleLoading && displaySchedule.length > 0 && (
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

          {scheduleLoading ? (
            <div className="flex gap-2 py-4">
              <div className="w-2 h-2 bg-[#0d9488] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[#0d9488] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              <div className="w-2 h-2 bg-[#0d9488] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>
          ) : displaySchedule.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 text-center">
              <p style={{ fontSize: "14px", color: "#6B7280" }}>
                No appointments found.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] divide-y divide-[#E5E7EB]">
              {displaySchedule.map((appt, index) => (
                <div 
                  key={index} 
                  onClick={() => setSelectedAppt(appt.original)}
                  className="p-5 hover:bg-[#F9FAFB] cursor-pointer transition-all flex items-start gap-4 relative group hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] z-10"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#f0fdfa" }}
                  >
                    <Clock size={20} style={{ color: "#0d9488" }} />
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
                  <div className="flex flex-col items-end gap-2 ml-auto shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-[#6B7280]" />
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>
                        {appt.time}
                      </span>
                    </div>
                    <div className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1
                      ${appt.priority === 'High' ? 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]' : 
                        appt.priority === 'Medium' ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]' : 
                        'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'}`}
                    >
                      <AlertCircle size={12} /> {appt.priority}
                    </div>
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

      <DoctorInsightsPanel 
        isOpen={!!selectedAppt}
        onClose={() => setSelectedAppt(null)}
        appointment={selectedAppt}
        cachedInsight={selectedAppt ? aiData[selectedAppt.id] : null}
        onInsightGenerated={handleInsightGenerated}
      />
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
