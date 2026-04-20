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
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { getAppointments } from "../../lib/appointments";

export function PatientDashboard({ userName = "John" }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await getAppointments(user.id);
      setAppointments(data);
      setApptLoading(false);
    };
    load();
  }, [user]);

  // Only upcoming (today or future) sorted nearest first
  const upcomingAppointments = appointments
    .filter((a) => {
      const apptDate = new Date(a.date + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return apptDate >= today && a.status !== 'cancelled';
    })
    .slice(0, 3);

  const stats = [
    {
      label: "Upcoming Appointments",
      value: apptLoading ? "—" : upcomingAppointments.length.toString(),
      icon: Calendar,
      color: "#4F46E5",
    },
    { label: "Active Doctors", value: "5", icon: Stethoscope, color: "#10B981" },
    { label: "Health Status", value: "Good", icon: Activity, color: "#EF4444" },
  ];

  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialization: "Cardiologist",
      location: "New York, NY",
      rating: 4.9,
      avatar: "SJ",
      available: true,
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialization: "Neurologist",
      location: "San Francisco, CA",
      rating: 4.8,
      avatar: "MC",
      available: true,
    },
    {
      id: 3,
      name: "Dr. Emily Martinez",
      specialization: "Pediatrician",
      location: "Los Angeles, CA",
      rating: 4.9,
      avatar: "EM",
      available: false,
    },
  ];

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

      {/* My Upcoming Appointments — real data */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-12"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827" }}>
            My Appointments
          </h2>
          <button
            onClick={() => router.push("/appointments/history")}
            className="text-[13px] font-semibold text-[#4F46E5] hover:underline"
          >
            View all →
          </button>
        </div>

        {apptLoading ? (
          <div className="flex gap-2 py-4">
            <div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
            <div className="w-2 h-2 bg-[#4F46E5] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 text-center">
            <p style={{ fontSize: "14px", color: "#6B7280" }}>
              No upcoming appointments.{" "}
              <button
                onClick={() => router.push("/dashboard")}
                className="text-[#4F46E5] font-semibold hover:underline"
              >
                Book one now
              </button>
            </p>
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
                  style={{ backgroundColor: "#EEF2FF" }}
                >
                  <Calendar size={20} style={{ color: "#4F46E5" }} />
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

      {/* Available Doctors */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        className="mt-12"
      >
        <h2 className="mb-6" style={{ fontSize: "20px", fontWeight: 600, color: "#111827" }}>
          Available Doctors
        </h2>
        <div className="grid grid-cols-2 gap-6">
          {doctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.85 + index * 0.1, duration: 0.5 }}
              className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-xl flex items-center justify-center text-white flex-shrink-0"
                  style={{ fontSize: "16px", fontWeight: 600 }}
                >
                  {doctor.avatar}
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
                          )}&specialization=${encodeURIComponent(doctor.specialization)}`
                        )
                      }
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
                  <div className="flex items-center gap-2 mt-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        doctor.available ? "bg-[#10B981]" : "bg-[#EF4444]"
                      }`}
                    />
                    <span style={{ fontSize: "13px", color: "#6B7280" }}>
                      {doctor.available ? "Available Now" : "Busy"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-12 mb-8"
      >
        <h2 className="mb-6" style={{ fontSize: "20px", fontWeight: 600, color: "#111827" }}>
          Recent Activity
        </h2>
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] divide-y divide-[#E5E7EB]">
          {[
            {
              icon: CheckCircle2,
              title: "Appointment Completed",
              description: "Checkup with Dr. Sarah Johnson",
              time: "2 hours ago",
            },
            {
              icon: Calendar,
              title: "Appointment Scheduled",
              description: "Follow-up with Dr. Michael Chen",
              time: "5 hours ago",
            },
            {
              icon: Activity,
              title: "Health Report Updated",
              description: "Blood test results available",
              time: "1 day ago",
            },
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.1 + index * 0.1, duration: 0.4 }}
              className="p-5 hover:bg-[#F9FAFB] transition-colors flex items-start gap-4"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#EEF2FF" }}
              >
                <activity.icon size={20} style={{ color: "#4F46E5" }} />
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
      </motion.div>
    </>
  );
}
