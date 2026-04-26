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
      <h2
        className="font-bold text-[#111827] tracking-tight mb-2"
        style={{ fontSize: '26px' }}
      >
        Welcome Back
      </h2>
      <p className="text-[14px] text-[#6B7280] mb-7">
        Sign in to your VitalSync account
      </p>

      {authError && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[14px] font-medium flex items-center gap-2">
          <span>⚠</span> {authError}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <div className="space-y-2">
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
              className="text-[13px] font-semibold text-[#0d9488] hover:text-[#0f766e] transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
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
              <span>Logging in...</span>
            </>
          ) : (
            <span>Log In</span>
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-[14px] text-[#6B7280]">
        Do Not Have Account?{' '}
        <Link
          href="/register"
          className="font-semibold text-[#0d9488] hover:text-[#0f766e] hover:underline transition-colors"
        >
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
}
