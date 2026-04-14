import React from 'react';

export const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <div className="hidden lg:flex w-2/5 bg-[#4F46E5] flex-col justify-center items-center text-white px-12">
        <div className="max-w-md w-full">
          <h1 className="text-[52px] font-bold mb-4 tracking-tight leading-tight">VitalSync</h1>
          <p className="text-[20px] font-medium text-white/90">Smart Healthcare, Simplified</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[420px]">
          <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E5E7EB] p-8 sm:p-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
