"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { AuthLayout } from "../../components/layout/AuthLayout";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
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
    setIsLoading(true);

    console.log("Login Form Data:", formData);
    
    // Simulate setting auth context/role based on email
    const computedRole = formData.email.toLowerCase().includes("doctor") ? "doctor" : "patient";
    localStorage.setItem("vitalsync_role", computedRole);

    // Extract raw name from email and remove numerical digits (e.g. abhinay12@gmail.com -> Abhinay)
    const rawName = formData.email.split('@')[0].replace(/[0-9]/g, '');
    const computedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    localStorage.setItem("vitalsync_name", computedName || "User");

    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsLoading(false);
    router.push("/dashboard"); 
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-[28px] font-bold text-[#111827] tracking-tight mb-8">
        Welcome Back
      </h2>
      
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

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />

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
