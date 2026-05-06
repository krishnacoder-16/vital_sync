"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  Calendar,
  MapPin,
  Star,
  Clock,
  Activity,
  CheckCircle2,
  Search,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { getAppointmentsByPatient } from "../../lib/appointments";
import { getDoctors, getDoctorAvatar } from "../../lib/doctors";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
const AppointmentsLineChart = dynamic(() => import("../charts/AppointmentsLineChart").then(m => m.AppointmentsLineChart), { ssr: false, loading: () => <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div> });
const StatusPieChart = dynamic(() => import("../charts/StatusPieChart").then(m => m.StatusPieChart), { ssr: false, loading: () => <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div> });
import { useDashboardSearch } from "../../context/DashboardSearchContext";
import { appointmentMatchesPatient, doctorMatchesQuery } from "../../lib/searchFilters";
import { StatCardSkeleton, AppointmentRowSkeleton, DoctorCardSkeleton } from "../common/Skeletons";

export function PatientDashboard({ userName = "John" }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  // Fetch appointments
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data } = await getAppointmentsByPatient(user.id);
      setAppointments(data);
      setApptLoading(false);
    };

    load();

    // Real-time synchronization — notify patient on status change
    const channel = supabase
      .channel("appointments_patient")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments", filter: `patient_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === "UPDATE") {
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Fetch doctors
  useEffect(() => {
    const load = async () => {
      const { data } = await getDoctors();
      setDoctors(data);
      setDoctorsLoading(false);
    };
    load();
  }, []);

  // Only upcoming (today or future) sorted nearest first
  const { query, clearSearch } = useDashboardSearch();
  const q = query.toLowerCase().trim();

  const filteredUpcoming = appointments
    .filter((a) => {
      const apptDate = new Date(a.date + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isUpcoming = apptDate >= today && a.status !== 'cancelled';
      if (!isUpcoming) return false;
      return appointmentMatchesPatient(a, q);
    })
    .slice(0, 3);

  const filteredDoctors = q
    ? doctors.filter(d => doctorMatchesQuery(d, q))
    : doctors;

  const upcomingAppointments = filteredUpcoming;

  const stats = [
    {
      label: "Upcoming Appointments",
      value: apptLoading ? "—" : upcomingAppointments.length.toString(),
      icon: Calendar,
      color: "#0d9488",
    },
    {
      label: "Available Doctors",
      value: doctorsLoading ? "—" : doctors.filter(d => d.available ?? true).length.toString(),
      icon: Stethoscope,
      color: "#10B981",
    },
    { label: "Health Status", value: "Good", icon: Activity, color: "#EF4444" },
  ];

  // Build recent activity from real appointment data
  const recentActivity = appointments
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3)
    .map((appt) => {
      const isCompleted = appt.status === "confirmed";
      const isCancelled = appt.status === "cancelled";
      return {
        icon: isCancelled ? Activity : isCompleted ? CheckCircle2 : Calendar,
        title: isCancelled
          ? "Appointment Cancelled"
          : isCompleted
          ? "Appointment Confirmed"
          : "Appointment Scheduled",
        description: `${appt.specialization} with ${appt.doctor_name}`,
        time: getTimeAgo(appt.created_at),
      };
    });

  return (
    <>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h1 className="mb-2" style={{ fontSize: "32px", fontWeight: 700, color: "#111827" }}>
          Welcome back, {userName} 👋
        </h1>
        <p style={{ fontSize: "16px", color: "#6B7280" }}>
          Here's what's happening with your health today.
        </p>
      </motion.div>

      {/* ── Search Header Banner ── */}
      {q && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center justify-between gap-4 px-4 py-3 bg-[#f0fdfa] border border-[#99f6e4] rounded-xl"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search size={16} className="text-[#0d9488] flex-shrink-0" />
            <p className="text-[14px] text-[#0d9488] font-medium truncate">
              Showing results for: <span className="font-bold">&ldquo;{query}&rdquo;</span>
              <span className="ml-2 text-[#6B7280] font-normal">
                &mdash; {upcomingAppointments.length} appointment{upcomingAppointments.length !== 1 ? 's' : ''}, {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
              </span>
            </p>
          </div>
          <button
            onClick={clearSearch}
            className="flex-shrink-0 text-[13px] font-semibold text-[#0d9488] hover:text-[#0f766e] border border-[#0d9488]/30 hover:border-[#0d9488] px-3 py-1 rounded-lg transition-colors"
          >
            Clear Search
          </button>
        </motion.div>
      )}

      {/* Stats */}
      {apptLoading ? (
        <StatCardSkeleton />
      ) : (
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
      )}

      {/* ── Charts ── */}
      {!apptLoading && appointments.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10"
        >
          <AppointmentsLineChart appointments={appointments} days={7} />
          <StatusPieChart appointments={appointments} />
        </motion.div>
      )}

      {/* My Upcoming Appointments */}
      {/* Hide section entirely if search is active and it has zero results (global empty state below handles it) */}
      {(!q || upcomingAppointments.length > 0) && (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-12"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827" }}>
            My Appointments
            {q && (
              <span className="ml-2 text-[15px] font-normal text-[#6B7280]">({upcomingAppointments.length})</span>
            )}
          </h2>
          <button
            onClick={() => router.push("/appointments/history")}
            className="text-[13px] font-semibold text-[#0d9488] hover:underline"
          >
            View all →
          </button>
        </div>

        {apptLoading ? (
          <AppointmentRowSkeleton count={3} />
        ) : upcomingAppointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] py-12 px-6 text-center">
            {q ? (
              <>
                <div className="w-12 h-12 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search size={22} className="text-[#9CA3AF]" />
                </div>
                <p className="font-semibold text-[#111827] text-[15px]">No results found</p>
                <p className="text-[#6B7280] text-[13px] mt-1">Try searching by doctor name, specialization, or time</p>
              </>
            ) : (
              <p style={{ fontSize: "14px", color: "#6B7280" }}>
                No upcoming appointments.{" "}
                <button
                  onClick={() => router.push("/doctors")}
                  className="text-[#0d9488] font-semibold hover:underline"
                >
                  Book one now
                </button>
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] divide-y divide-[#E5E7EB]">
            {upcomingAppointments.map((appt, index) => (
              <motion.div
                key={appt.id}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.08, duration: 0.4 }}
                className="p-5 hover:bg-[#F9FAFB] transition-colors flex items-start gap-4"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#f0fdfa" }}
                >
                  <Calendar size={20} style={{ color: "#0d9488" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>
                    {appt.doctor_name}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "2px" }}>
                    {appt.specialization}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Clock size={14} className="text-[#6B7280]" />
                  <span style={{ fontSize: "13px", color: "#6B7280" }}>
                    {new Date(appt.date + 'T00:00:00').toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {appt.time_slot}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      )}

      {/* Our Doctors — from Supabase */}
      {/* Hide section entirely if search is active and it has zero results (global empty state below handles it) */}
      {(!q || filteredDoctors.length > 0) && (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        className="mt-12"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827" }}>
            Our Doctors
            {q && (
              <span className="ml-2 text-[15px] font-normal text-[#6B7280]">({filteredDoctors.length})</span>
            )}
          </h2>
          <button
            onClick={() => router.push("/doctors")}
            className="text-[13px] font-semibold text-[#0d9488] hover:underline"
          >
            View all →
          </button>
        </div>

        {doctorsLoading ? (
          <DoctorCardSkeleton count={2} />
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] py-12 px-6 text-center">
            {q ? (
              <>
                <div className="w-12 h-12 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search size={22} className="text-[#9CA3AF]" />
                </div>
                <p className="font-semibold text-[#111827] text-[15px]">No results found</p>
                <p className="text-[#6B7280] text-[13px] mt-1">Try searching by doctor name, specialization, or location</p>
              </>
            ) : (
              <p style={{ fontSize: "14px", color: "#6B7280" }}>No doctors found. Check back later.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {filteredDoctors.slice(0, 4).map((doctor, index) => {
              const isAvailable = doctor.available ?? true;
              return (
                <motion.div
                  key={doctor.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.85 + index * 0.1, duration: 0.5 }}
                  className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 bg-gradient-to-br from-[#0d9488] to-[#0369a1] rounded-xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ fontSize: "16px", fontWeight: 600 }}
                    >
                      {getDoctorAvatar(doctor.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#111827" }}>
                        {doctor.name}
                      </h3>
                      <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "2px" }}>
                        {doctor.specialization}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-[#6B7280]" />
                          <span style={{ fontSize: "13px", color: "#6B7280" }}>
                            {doctor.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
                          <span style={{ fontSize: "13px", color: "#111827", fontWeight: 600 }}>
                            {doctor.rating}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() =>
                            router.push(
                              `/appointments/book?doctorId=${doctor.id}&doctorName=${encodeURIComponent(
                                doctor.name
                              )}&specialization=${encodeURIComponent(doctor.specialization ?? "")}`
                            )
                          }
                          disabled={!isAvailable}
                          className="flex-1 bg-gradient-to-br from-[#0d9488] to-[#0369a1] text-white py-2.5 px-4 rounded-lg hover:from-[#0f766e] hover:to-[#0284c7] transition-all shadow-[0_4px_14px_0_rgba(13,148,136,0.35)] hover:shadow-[0_6px_20px_rgba(13,148,136,0.5)] hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                          style={{ fontSize: "14px", fontWeight: 600 }}
                        >
                          Book Appointment
                        </button>
                        <button
                          onClick={() => router.push(`/doctors/${doctor.id}`)}
                          className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
                          style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}
                        >
                          View Profile
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isAvailable ? "bg-[#10B981]" : "bg-[#EF4444]"
                          }`}
                        />
                        <span style={{ fontSize: "13px", color: "#6B7280" }}>
                          {isAvailable ? "Available Now" : "Busy"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
      )}

      {/* ── Global Empty State — shown when search yields zero results in BOTH sections ── */}
      {q && upcomingAppointments.length === 0 && filteredDoctors.length === 0 && !apptLoading && !doctorsLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 bg-white rounded-2xl border border-[#E5E7EB] py-16 px-8 text-center"
        >
          <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-[#9CA3AF]" />
          </div>
          <p className="font-bold text-[#111827] text-[18px]">No results found</p>
          <p className="text-[#6B7280] text-[14px] mt-2 max-w-xs mx-auto">
            No appointments or doctors matched &ldquo;<span className="font-semibold text-[#374151]">{query}</span>&rdquo;.
            Try searching by name, specialization, or location.
          </p>
          <button
            onClick={clearSearch}
            className="mt-5 inline-flex items-center gap-2 bg-[#0d9488] text-white text-[14px] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#0f766e] transition-colors shadow-sm"
          >
            Clear Search
          </button>
        </motion.div>
      )}

      {/* Recent Activity — derived from real appointments */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-12 mb-8"
      >
        <h2 className="mb-6" style={{ fontSize: "20px", fontWeight: 600, color: "#111827" }}>
          Recent Activity
        </h2>

        {apptLoading ? (
          <div className="flex gap-2 py-4">
            <div className="w-2 h-2 bg-[#0d9488] rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-[#0d9488] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
            <div className="w-2 h-2 bg-[#0d9488] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 text-center">
            <p style={{ fontSize: "14px", color: "#6B7280" }}>
              No recent activity yet.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] divide-y divide-[#E5E7EB]">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.1 + index * 0.1, duration: 0.4 }}
                className="p-5 hover:bg-[#F9FAFB] transition-colors flex items-start gap-4"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#f0fdfa" }}
                >
                  <activity.icon size={20} style={{ color: "#0d9488" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>
                    {activity.title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "2px" }}>
                    {activity.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Clock size={14} className="text-[#6B7280]" />
                  <span style={{ fontSize: "13px", color: "#6B7280" }}>
                    {activity.time}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
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
