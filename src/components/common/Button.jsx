import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({ children, isLoading, variant = 'solid', className = '', ...props }) => {
  const baseStyles = "w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed";
  
  const variants = {
    solid: "bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-[0_2px_8px_rgba(79,70,229,0.25)] hover:shadow-[0_4px_12px_rgba(79,70,229,0.35)]",
    outline: "bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827] shadow-sm tracking-wide font-medium"
  };

  return (
    <button
      disabled={isLoading || props.disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  );
};
