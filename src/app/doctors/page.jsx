"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useAuthStore } from "../../store/authStore";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { DoctorCard } from "../../components/doctor/DoctorCard";
import { getDoctors } from "../../lib/doctors";
import { Stethoscope } from "lucide-react";

export default function DoctorsPage() {
  const { user } = useAuthStore();
  const role = user?.user_metadata?.role || "patient";
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await getDoctors();
      setDoctors(data);
      setIsLoading(false);
    };
    load();
  }, []);

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

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 bg-[#0d9488] rounded-full animate-bounce" />
              <div className="w-2.5 h-2.5 bg-[#0d9488] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              <div className="w-2.5 h-2.5 bg-[#0d9488] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>
          </div>
        ) : doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[#f0fdfa] rounded-full flex items-center justify-center mb-4">
              <Stethoscope size={28} className="text-[#0d9488]" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827" }}>
              No doctors available
            </h3>
            <p className="mt-2 text-[14px] text-[#6B7280]">
              Please check back later
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {doctors.map((doctor, index) => (
              <DoctorCard key={doctor.id} doctor={doctor} index={index} />
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
