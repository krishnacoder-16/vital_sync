"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { supabase } from "../../lib/supabaseClient";
import { CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError("Email is required"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Invalid email format"); return; }

    setError("");
    setIsLoading(true);

    const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
      // Supabase will append the token to this URL automatically
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (supabaseError) {
      setError(supabaseError.message);
      return;
    }

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} className="text-[#16A34A]" />
          </div>
          <h2 className="text-[24px] font-bold text-[#111827]">Check your email</h2>
          <p className="text-[14px] text-[#6B7280] leading-relaxed">
            We sent a password reset link to <span className="font-semibold text-[#111827]">{email}</span>. 
            Click the link in the email to reset your password.
          </p>
          <p className="text-[13px] text-[#6B7280] mt-2">
            Didn't receive it?{" "}
            <button
              onClick={() => setIsSubmitted(false)}
              className="font-semibold text-[#0d9488] hover:underline"
            >
              Try again
            </button>
          </p>
        </div>

        <p className="mt-8 text-center text-[14px] text-[#6B7280]">
          <Link href="/login" className="font-semibold text-[#0d9488] hover:text-[#0f766e] hover:underline">
            ← Back to Login
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="text-[28px] font-bold text-[#111827] tracking-tight mb-2">
        Forgot Password?
      </h2>
      <p className="text-[14px] text-[#6B7280] mb-8">
        Enter your registered email and we'll send you a reset link.
      </p>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[14px] font-medium">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          error={error && !email ? error : ""}
        />

        <Button type="submit" isLoading={isLoading}>
          Send Reset Link
        </Button>
      </form>

      <p className="mt-8 text-center text-[14px] text-[#6B7280]">
        <Link href="/login" className="font-semibold text-[#0d9488] hover:text-[#0f766e] hover:underline">
          ← Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
}
