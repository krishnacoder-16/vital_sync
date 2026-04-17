"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { supabase } from "../../lib/supabaseClient";
import { useAuthStore } from "../../store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
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
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
      return;
    }

    const user = data.user;
    
    // Push directly to global session store
    const setUser = useAuthStore.getState().setUser;
    setUser(user);

    setIsLoading(false);
    router.push("/dashboard");
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
        Welcome Back
      </h2>

      {authError && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[14px] font-medium">
          {authError}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <div className="space-y-1">
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-[13px] font-medium text-[#4F46E5] hover:text-[#4338CA] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" isLoading={isLoading} className="mt-4">
          Login
        </Button>
      </form>

      <p className="mt-8 text-center text-[14px] text-[#6B7280]">
        Don't have an account?{' '}
        <Link href="/register" className="font-semibold text-[#4F46E5] hover:text-[#4338CA] hover:underline">
          Register here
        </Link>
      </p>
    </AuthLayout>
  );
}
