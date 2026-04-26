"use client";

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = forwardRef(({ label, error, type = "text", className = "", ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPasswordType = type === "password";
  const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-[#111827]">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          ref={ref}
          className={`w-full px-4 py-3 rounded-xl bg-white border shadow-sm transition-all focus:outline-none focus:ring-[3px] text-[15px]
            ${error 
              ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20' 
              : 'border-[#E5E7EB] hover:border-[#D1D5DB] focus:border-[#0d9488] focus:ring-[#0d9488]/20'
            } ${isPasswordType ? 'pr-12' : ''} ${className}
          `}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827] focus:outline-none p-1 transition-colors flex items-center justify-center"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <span className="text-xs text-[#EF4444] mt-0.5">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
