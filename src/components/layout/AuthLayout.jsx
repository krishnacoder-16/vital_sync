"use client";

import React from 'react';
import Image from 'next/image';

export const AuthLayout = ({ children }) => {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 sm:p-6 transition-all duration-500"
      style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      }}
    >
      {/* Outer card container */}
      <div 
        className="flex w-full max-w-[900px] min-h-[540px] rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/40"
        style={{ animation: 'fadeIn 0.6s ease-out forwards' }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* ─── LEFT PANEL ─── */}
        <div
          className="hidden lg:flex relative w-[45%] flex-col justify-between overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0369a1 100%)',
          }}
        >
          {/* Decorative blurred circles for depth */}
          <div
            className="absolute -top-24 -left-24 w-64 h-64 rounded-full mix-blend-screen filter blur-[40px] opacity-20"
            style={{ background: '#67e8f9' }}
          />
          <div
            className="absolute top-1/2 -right-12 w-48 h-48 rounded-full mix-blend-screen filter blur-[30px] opacity-20"
            style={{ background: '#38bdf8' }}
          />
          <div
            className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full mix-blend-screen filter blur-[40px] opacity-20"
            style={{ background: '#818cf8' }}
          />

          {/* Text content */}
          <div className="relative z-10 pt-16 px-12">
            <h1 className="text-white font-black tracking-tight drop-shadow-sm" style={{ fontSize: '48px', lineHeight: 1.1 }}>
              HELLO
              <span className="text-[#fde047]">!</span>
            </h1>
            <p className="text-white/90 mt-4 font-medium tracking-wide" style={{ fontSize: '16px', lineHeight: 1.5 }}>
              Please enter your details<br />to continue
            </p>
          </div>

          {/* Doctor illustration — Centered circular badge */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="relative w-[340px] h-[340px] bg-white rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.25)] flex items-center justify-center overflow-hidden border-[6px] border-white/20">
              <Image
                src="/doctor-illustration.png"
                alt="Doctor illustration"
                width={310}
                height={310}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div className="flex-1 flex flex-col justify-center bg-transparent px-8 py-8 sm:px-12 relative">
          {/* Logo / Branding */}
          <div className="flex items-baseline gap-1 mb-6 mt-2">
            <span className="font-black text-[24px] text-[#0d9488] tracking-tight">
              VitalSync
            </span>
            <span className="text-[#9CA3AF] font-medium text-[18px]">
              Hospital
            </span>
          </div>

          {/* Form children rendered here */}
          <div className="w-full relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
