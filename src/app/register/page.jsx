"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { supabase } from "../../lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    specialization: "",
    location: "",
  });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setAuthError("");
    setSuccessMsg("");
    setIsLoading(true);

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          role: formData.role,
          specialization: formData.specialization || null,
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
      return;
    }

    // Insert profile row immediately so they appear in the system
    if (signUpData?.user) {
      await supabase.from('profiles').insert({
        id: signUpData.user.id,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        specialization: formData.specialization || null,
        location: formData.location || null,
      });
    }

    setIsLoading(false);
    setSuccessMsg("Account created! Please check your email to confirm, then log in.");

    // Redirect to login after a short delay
    setTimeout(() => router.push("/login"), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (authError) setAuthError("");
  };

  return (
    <AuthLayout>
      <h2
        className="font-bold text-[#111827] tracking-tight mb-1"
        style={{ fontSize: '26px' }}
      >
        Create an Account
      </h2>
      <p className="text-[14px] text-[#6B7280] mb-6">
        Join VitalSync — smart healthcare, simplified
      </p>

      {authError && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[14px] font-medium flex items-center gap-2">
          <span>⚠</span> {authError}
        </div>
      )}

      {successMsg && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] text-[14px] font-medium flex items-center gap-2">
          <span>✓</span> {successMsg}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Role selector */}
        <div className="flex flex-col w-full">
          <label className="text-[14px] font-medium text-[#111827] mb-2">Registering as a</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'patient' }))}
              className={`border py-2.5 px-4 rounded-xl text-[14px] transition-all font-semibold shadow-sm ${
                formData.role === 'patient'
                  ? 'bg-[#CCFBF1] border-[#0d9488] text-[#0d9488] ring-2 ring-[#0d9488]/20'
                  : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]'
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'doctor' }))}
              className={`border py-2.5 px-4 rounded-xl text-[14px] transition-all font-semibold shadow-sm ${
                formData.role === 'doctor'
                  ? 'bg-[#CCFBF1] border-[#0d9488] text-[#0d9488] ring-2 ring-[#0d9488]/20'
                  : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]'
              }`}
            >
              Doctor
            </button>
          </div>
        </div>

        <Input
          label="Full Name"
          name="name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        {/* Specialization — only for doctors */}
        {formData.role === 'doctor' && (
          <div className="flex flex-col w-full">
            <label className="text-[14px] font-medium text-[#111827] mb-2">Specialization</label>
            <input
              name="specialization"
              type="text"
              placeholder="e.g. Cardiologist, Neurologist"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5E7EB] shadow-sm transition-all focus:outline-none focus:ring-[3px] focus:border-[#0d9488] focus:ring-[#0d9488]/20 hover:border-[#D1D5DB] text-[15px]"
            />
          </div>
        )}

        {/* Location — only for doctors */}
        {formData.role === 'doctor' && (
          <div className="flex flex-col w-full">
            <label className="text-[14px] font-medium text-[#111827] mb-2">Location</label>
            <input
              name="location"
              type="text"
              placeholder="e.g. New York, NY"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5E7EB] shadow-sm transition-all focus:outline-none focus:ring-[3px] focus:border-[#0d9488] focus:ring-[#0d9488]/20 hover:border-[#D1D5DB] text-[15px]"
            />
          </div>
        )}

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0369a1 100%)',
            boxShadow: '0 4px 14px 0 rgba(13,148,136,0.39)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(13,148,136,0.5)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(13,148,136,0.39)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span>Registering...</span>
            </>
          ) : (
            <span>Register</span>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-[14px] text-[#6B7280]">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-[#0d9488] hover:text-[#0f766e] hover:underline transition-colors"
        >
          Log in here
        </Link>
      </p>
    </AuthLayout>
  );
}
