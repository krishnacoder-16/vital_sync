"use client";

import { motion } from "motion/react";
import { useAuthStore } from "../../store/authStore";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { DoctorCard } from "../../components/doctor/DoctorCard";

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

export default function DoctorsPage() {
  const { user } = useAuthStore();
  const role = user?.user_metadata?.role || "patient";

  return (
    <DashboardLayout role={role}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>
            Available Doctors
          </h1>
          <p className="mt-1 text-[#6B7280]">
            Browse and book appointments with our healthcare professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {doctors.map((doctor, index) => (
            <DoctorCard key={doctor.id} doctor={doctor} index={index} />
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
