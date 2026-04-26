import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({ children, isLoading, variant = 'solid', className = '', ...props }) => {
  const baseStyles = "w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed";
  
  const variants = {
    solid: "bg-gradient-to-br from-[#0d9488] to-[#0369a1] hover:from-[#0f766e] hover:to-[#0284c7] text-white shadow-[0_4px_14px_0_rgba(13,148,136,0.35)] hover:shadow-[0_6px_20px_rgba(13,148,136,0.5)] hover:-translate-y-[1px]",
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
