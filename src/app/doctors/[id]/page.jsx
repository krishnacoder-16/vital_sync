"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { User, MapPin, Briefcase, Activity, Calendar as CalendarIcon, Star } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DoctorProfileView({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .eq("role", "doctor")
        .single();
        
      if (data && !error) {
        setDoctor(data);
      }
      setLoading(false);
    };

    if (id) fetchDoctor();
  }, [id]);

  const getInitials = (name) => {
    if (!name) return "D";
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <DashboardLayout role="patient">
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-[#0d9488] rounded-full animate-bounce" />
              <div className="w-3 h-3 bg-[#0d9488] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              <div className="w-3 h-3 bg-[#0d9488] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>
            <p className="text-[#6B7280] font-medium text-sm">Loading doctor profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!doctor) {
    return (
      <DashboardLayout role="patient">
        <div className="flex flex-col h-full items-center justify-center text-center">
          <div className="w-16 h-16 bg-[#f0fdfa] text-[#0d9488] rounded-full flex items-center justify-center mb-4">
            <User size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#111827]">Doctor not found</h2>
          <p className="text-[#6B7280] mt-2">The profile you are looking for doesn't exist or is unavailable.</p>
          <button 
            onClick={() => router.push('/doctors')}
            className="mt-6 px-6 py-2 bg-[#0d9488] text-white rounded-lg hover:bg-[#0f766e] transition-colors"
          >
            Go back to Doctors
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isAvailable = doctor.available ?? true;

  return (
    <DashboardLayout role="patient">
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        
        {/* Header Navigation */}
        <div className="flex items-center gap-4 mb-2">
          <button 
            onClick={() => router.back()}
            className="text-[#6B7280] hover:text-[#111827] font-medium text-sm transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden relative">
          {/* Top Banner Accent */}
          <div className="h-32 bg-gradient-to-r from-[#0d9488] to-[#0369a1]" />
          
          <div className="px-8 pb-8">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-14 mb-8">
              <div className="flex items-end gap-6">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-[#0d9488] to-[#0369a1] text-white flex items-center justify-center text-4xl font-bold">
                  {getInitials(doctor.name)}
                </div>
                <div className="mb-2">
                  <h2 className="text-3xl font-bold text-[#111827]">{doctor.name}</h2>
                  <p className="text-[#0d9488] font-semibold text-[15px] mt-1 flex items-center gap-2">
                    <Briefcase size={16} /> {doctor.specialization || "General Physician"}
                  </p>
                </div>
              </div>
              
              <div className="mb-2">
                <button
                  onClick={() => router.push(`/appointments/book?doctorId=${doctor.id}&doctorName=${encodeURIComponent(doctor.name)}&specialization=${encodeURIComponent(doctor.specialization ?? '')}`)}
                  disabled={!isAvailable}
                  className="px-8 py-3.5 bg-gradient-to-br from-[#0d9488] to-[#0369a1] rounded-xl text-white font-bold hover:from-[#0f766e] hover:to-[#0284c7] transition-all shadow-[0_4px_14px_0_rgba(13,148,136,0.35)] hover:shadow-[0_6px_20px_rgba(13,148,136,0.5)] hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center gap-2"
                >
                  <CalendarIcon size={18} /> Book Appointment
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mt-12">
              
              {/* Left Column: Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[#111827] border-b border-[#F3F4F6] pb-3">
                  Professional Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wide block">
                      Specialization
                    </label>
                    <p className="text-[#111827] text-[16px] font-medium mt-1">
                      {doctor.specialization || "General"}
                    </p>
                  </div>

                  <div>
                    <label className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wide block">
                      Clinic Location
                    </label>
                    <p className="text-[#111827] text-[16px] font-medium mt-1 flex items-center gap-2">
                      <MapPin size={18} className="text-[#0d9488]" />
                      {doctor.location || "Location not provided"}
                    </p>
                  </div>

                  <div>
                    <label className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wide block">
                      Consultation Language
                    </label>
                    <p className="text-[#111827] text-[16px] font-medium mt-1">
                      English, Local Languages
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Status */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[#111827] border-b border-[#F3F4F6] pb-3">
                  Current Status
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-2">
                      Availability
                    </label>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${isAvailable ? 'bg-[#f0fdfa] border-[#ccfbf1]' : 'bg-[#FEF2F2] border-[#FECACA]'}`}>
                      <Activity size={18} className={isAvailable ? "text-[#10B981]" : "text-[#EF4444]"} />
                      <span className={`font-semibold ${isAvailable ? "text-[#0d9488]" : "text-[#EF4444]"}`}>
                        {isAvailable ? "Accepting Appointments" : "Currently Unavailable"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wide block mb-2">
                      Patient Rating
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={20} className="text-[#F59E0B] fill-[#F59E0B]" />
                        ))}
                      </div>
                      <span className="font-bold text-[#111827] text-lg ml-1">5.0</span>
                      <span className="text-[#6B7280] text-sm">(Verified Patients)</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bio Section */}
            <div className="mt-10 pt-8 border-t border-[#F3F4F6]">
              <h3 className="text-lg font-bold text-[#111827] mb-4">
                About {doctor.name}
              </h3>
              <p className="text-[#4B5563] text-[15px] leading-relaxed max-w-3xl">
                {doctor.name} is a dedicated healthcare professional specializing in {doctor.specialization || "General Medicine"}. 
                Committed to providing compassionate and comprehensive care, they work closely with patients to ensure the best possible health outcomes. 
                With a focus on preventative medicine and patient education, you can trust them with your ongoing health needs.
              </p>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
