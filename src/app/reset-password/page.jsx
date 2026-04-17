"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { supabase } from "../../lib/supabaseClient";
import { CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Supabase appends #access_token=...&type=recovery to the URL
    // The SDK picks up the hash fragment and establishes a session automatically
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      }
      setIsChecking(false);
    };

    // Listen for the SIGNED_IN event that Supabase fires after processing the URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
        setIsChecking(false);
      }
    });

    checkSession();
    return () => subscription.unsubscribe();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setErrors({});
    setAuthError("");
    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setIsLoading(false);

    if (error) { setAuthError(error.message); return; }

    setIsSuccess(true);
    // Sign out and redirect to login after 2 seconds
    setTimeout(async () => {
      await supabase.auth.signOut();
      router.push("/login");
    }, 2000);
  };

  // Still verifying the recovery token
  if (isChecking) {
    return (
      <AuthLayout>
        <div className="flex justify-center items-center py-12">
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 bg-[#4F46E5] rounded-full animate-bounce"></div>
            <div className="w-2.5 h-2.5 bg-[#4F46E5] rounded-full animate-bounce" style={{animationDelay:"0.1s"}}></div>
            <div className="w-2.5 h-2.5 bg-[#4F46E5] rounded-full animate-bounce" style={{animationDelay:"0.2s"}}></div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Invalid or expired link
  if (!isValidSession) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-[#FEF2F2] rounded-full flex items-center justify-center">
            <span className="text-3xl">🔗</span>
          </div>
          <h2 className="text-[24px] font-bold text-[#111827]">Link Expired</h2>
          <p className="text-[14px] text-[#6B7280] leading-relaxed">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Button onClick={() => router.push("/forgot-password")}>
            Request New Link
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} className="text-[#16A34A]" />
          </div>
          <h2 className="text-[24px] font-bold text-[#111827]">Password Updated!</h2>
          <p className="text-[14px] text-[#6B7280]">
            Your password has been reset. Redirecting you to login...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="text-[28px] font-bold text-[#111827] tracking-tight mb-2">
        Set New Password
      </h2>
      <p className="text-[14px] text-[#6B7280] mb-8">
        Choose a strong new password for your account.
      </p>

      {authError && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[14px] font-medium">
          {authError}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          label="New Password"
          name="password"
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
          error={errors.password}
        />

        <Input
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
          error={errors.confirmPassword}
        />

        <Button type="submit" isLoading={isLoading}>
          Reset Password
        </Button>
      </form>
    </AuthLayout>
  );
}
