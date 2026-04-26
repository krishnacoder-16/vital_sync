"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { User, MapPin, Briefcase, Activity, CheckCircle, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    specialization: "",
    available: true,
  });

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (data && !error) {
          setProfile(data);
          setFormData({
            name: data.name || "",
            location: data.location || "",
            specialization: data.specialization || "",
            available: data.available ?? true,
          });
        }
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      return toast.error("Name cannot be empty.");
    }

    setIsSaving(true);
    
    const updatePayload = {
      name: formData.name,
      location: formData.location,
    };
    
    // Include doctor-specific fields
    if (profile?.role === 'doctor') {
      updatePayload.specialization = formData.specialization;
      updatePayload.available = formData.available;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", profile.id);

    if (error) {
      toast.error(error.message || "Failed to update profile.");
    } else {
      toast.success("Profile updated successfully!");
      setProfile({ ...profile, ...updatePayload });
      setIsEditing(false);
    }
    
    setIsSaving(false);
  };

  const getInitials = (name) => {
    if (!name) return "U";
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
            <p className="text-[#6B7280] font-medium text-sm">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout role="patient">
        <div className="flex flex-col h-full items-center justify-center text-center">
          <div className="w-16 h-16 bg-[#f0fdfa] text-[#0d9488] rounded-full flex items-center justify-center mb-4">
            <User size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#111827]">Profile not found</h2>
          <p className="text-[#6B7280] mt-2">We couldn't load your profile details.</p>
        </div>
      </DashboardLayout>
    );
  }

  const isDoctor = profile.role === 'doctor';

  return (
    <DashboardLayout role={profile.role}>
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">
            {isDoctor ? "Doctor Profile" : "Patient Profile"}
          </h1>
          <p className="text-[#6B7280] mt-1 text-[15px]">
            Manage your personal information and preferences.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden relative">
          {/* Top Banner Accent */}
          <div className="h-24 bg-gradient-to-r from-[#0d9488] to-[#0369a1]" />
          
          <div className="px-8 pb-8">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-12 mb-8">
              <div className="flex items-end gap-6">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-[#0d9488] to-[#0369a1] text-white flex items-center justify-center text-4xl font-bold">
                  {getInitials(profile.name)}
                </div>
                <div className="mb-2">
                  <h2 className="text-2xl font-bold text-[#111827]">{profile.name}</h2>
                  <p className="text-[#0d9488] font-medium uppercase tracking-wider text-xs mt-1 bg-[#f0fdfa] px-3 py-1 rounded-full inline-block">
                    {profile.role}
                  </p>
                </div>
              </div>
              
              {!isEditing && (
                <div className="mb-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#374151] font-semibold hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-all shadow-sm flex items-center gap-2"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              
              {/* Form Section */}
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2 border-b border-[#F3F4F6] pb-3">
                  <User size={18} className="text-[#0d9488]" /> Personal Details
                </h3>

                <div>
                  <label className="text-[13px] font-semibold text-[#374151] uppercase tracking-wide mb-1.5 block">Full Name</label>
                  {isEditing ? (
                    <Input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    <p className="text-[#111827] text-[15px] font-medium">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-[#374151] uppercase tracking-wide mb-1.5 block flex items-center gap-1.5">
                    Email Address
                  </label>
                  <p className="text-[#6B7280] text-[15px] flex items-center gap-2">
                    <Mail size={16} /> {profile.email}
                  </p>
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-[#374151] uppercase tracking-wide mb-1.5 block flex items-center gap-1.5">
                    Location
                  </label>
                  {isEditing ? (
                    <Input
                      name="location"
                      type="text"
                      placeholder="e.g. New York, NY"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  ) : (
                    <p className="text-[#111827] text-[15px] flex items-center gap-2">
                      <MapPin size={16} className="text-[#0d9488]" />
                      {profile.location || "Not specified"}
                    </p>
                  )}
                </div>
              </div>

              {/* Professional Section (Doctor Only) */}
              {isDoctor && (
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2 border-b border-[#F3F4F6] pb-3">
                    <Briefcase size={18} className="text-[#0d9488]" /> Professional Info
                  </h3>

                  <div>
                    <label className="text-[13px] font-semibold text-[#374151] uppercase tracking-wide mb-1.5 block">
                      Specialization
                    </label>
                    {isEditing ? (
                      <Input
                        name="specialization"
                        type="text"
                        placeholder="e.g. Cardiologist"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      />
                    ) : (
                      <p className="text-[#111827] text-[15px] font-medium">
                        {profile.specialization || "Not specified"}
                      </p>
                    )}
                  </div>

                  {/* Availability Toggle */}
                  <div className={`p-5 rounded-2xl border transition-all ${isEditing ? 'bg-[#f0fdfa] border-[#ccfbf1]' : 'bg-[#F9FAFB] border-[#E5E7EB]'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[15px] font-bold text-[#111827] flex items-center gap-2">
                          <Activity size={18} className={formData.available ? "text-[#10B981]" : "text-[#EF4444]"} />
                          Availability Status
                        </h4>
                        <p className="text-[13px] text-[#6B7280] mt-1 pr-4">
                          When active, patients can view your profile and book appointments.
                        </p>
                      </div>
                      
                      {isEditing ? (
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={formData.available} 
                            onChange={(e) => setFormData({...formData, available: e.target.checked})} 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d9488]"></div>
                        </label>
                      ) : (
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 ${profile.available ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
                          {profile.available ? 'Available' : 'Busy'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {isEditing && (
              <div className="mt-10 pt-6 border-t border-[#F3F4F6] flex items-center gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    // Reset to original
                    setFormData({
                      name: profile.name || "",
                      location: profile.location || "",
                      specialization: profile.specialization || "",
                      available: profile.available ?? true,
                    });
                    setIsEditing(false);
                  }}
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl font-semibold text-[#374151] border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <div className="w-40">
                  <Button
                    variant="solid"
                    onClick={handleUpdate}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
