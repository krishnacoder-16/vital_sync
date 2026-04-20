"use client";

import { motion } from "motion/react";
import { useState } from "react";
import {
  LayoutDashboard,
  Stethoscope,
  Calendar,
  User,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";

export function DashboardLayout({ children, role }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, clearUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUser();
    router.push("/login");
  };

  const displayName = user?.user_metadata?.name || user?.email || "User";
  const initials = displayName.substring(0, 2).toUpperCase();

  const checkActive = (basePath) => {
    if (basePath === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(basePath);
  };

  const patientNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: checkActive("/dashboard") },
    { icon: Stethoscope, label: "Doctors", href: "/doctors", active: checkActive("/doctors") },
    { icon: Calendar, label: "Appointments", href: "/appointments/history", active: checkActive("/appointments") },
    { icon: User, label: "Profile", href: "/profile", active: checkActive("/profile") },
  ];

  const doctorNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: checkActive("/dashboard") },
    { icon: Calendar, label: "Appointments", href: "/appointments/history", active: checkActive("/appointments") },
    { icon: User, label: "Profile", href: "/profile", active: checkActive("/profile") },
  ];

  const navItems = role === "doctor" ? doctorNavItems : patientNavItems;

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`bg-white border-r border-[#E5E7EB] flex flex-col transition-all duration-300 flex-shrink-0 z-20 ${
          isCollapsed ? 'w-[88px]' : 'w-60'
        }`}
      >
        <div className={`p-6 flex items-center h-[88px] ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
          {isCollapsed ? (
             <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-[0_2px_8px_rgba(79,70,229,0.35)]">
               V
             </div>
          ) : (
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#4F46E5' }}>
              VitalSync
            </h1>
          )}
        </div>

        <nav className="flex-1 px-3 mt-2 flex flex-col gap-1">
          {navItems.map((item, index) => (
            <motion.button
              key={item.label}
              onClick={() => router.push(item.href)}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={`w-full flex items-center py-3 rounded-xl transition-all relative group ${
                isCollapsed ? 'justify-center' : 'gap-3 px-4'
              } ${
                item.active
                  ? 'bg-[#EEF2FF] text-[#4F46E5]'
                  : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
              }`}
            >
              {item.active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#4F46E5] rounded-r-full" />
              )}
              
              <item.icon size={isCollapsed ? 24 : 20} className="flex-shrink-0" />
              
              {!isCollapsed && (
                <span style={{ fontSize: '15px', fontWeight: 500 }} className="whitespace-nowrap transition-opacity">
                  {item.label}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-[70px] px-3 py-2 bg-[#111827] text-white text-[13px] font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl pointer-events-none">
                  {item.label}
                </div>
              )}
            </motion.button>
          ))}
        </nav>

        {/* Sidebar Collapse Toggle */}
        <div className="p-4 border-t border-[#E5E7EB]">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center w-full py-3 rounded-xl text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827] transition-all ${
              isCollapsed ? "justify-center" : "gap-3 px-4"
            }`}
          >
            {isCollapsed ? (
              <ChevronRight size={22} className="text-[#4F46E5] group-hover:scale-110 transition-transform" />
            ) : (
              <>
                <ChevronLeft size={20} />
                <span className="text-[15px] font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="bg-white border-b border-[#E5E7EB] px-8 py-4 flex items-center justify-between z-10 sticky top-0">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#F9FAFB] border border-transparent focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 transition-all text-[#111827]"
                style={{ fontSize: '15px' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-8 flex-shrink-0">
            <button className="relative p-2 hover:bg-[#F9FAFB] rounded-xl transition-colors">
              <Bell size={22} className="text-[#6B7280]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full"></span>
            </button>
            <button onClick={handleLogout} className="relative p-2 hover:bg-[#FEE2E2] rounded-xl transition-colors text-[#6B7280] hover:text-[#EF4444]" title="Logout">
              <LogOut size={22} />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-full flex items-center justify-center text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
              {initials}
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
