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

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          role: formData.role,
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
      return;
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
      <h2 className="text-[28px] font-bold text-[#111827] tracking-tight mb-8">
        Create an Account
      </h2>

      {authError && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[14px] font-medium">
          {authError}
        </div>
      )}

      {successMsg && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] text-[14px] font-medium">
          {successMsg}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="flex flex-col w-full">
          <label className="text-[14px] font-medium text-[#111827] mb-2">Registering as a</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'patient' }))}
              className={`border py-2.5 px-4 rounded-xl text-[15px] transition-all font-semibold ${
                formData.role === 'patient'
                  ? 'bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]'
                  : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280]'
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'doctor' }))}
              className={`border py-2.5 px-4 rounded-xl text-[15px] transition-all font-semibold ${
                formData.role === 'doctor'
                  ? 'bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]'
                  : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280]'
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

        <Button type="submit" isLoading={isLoading} className="mt-4">
          Register
        </Button>
      </form>

      <p className="mt-8 text-center text-[14px] text-[#6B7280]">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-[#4F46E5] hover:text-[#4338CA] hover:underline">
          Log in here
        </Link>
      </p>
    </AuthLayout>
  );
}
