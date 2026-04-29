"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard,
  Stethoscope,
  Calendar,
  User,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Menu,
  X
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import { DashboardSearchContext } from "../../context/DashboardSearchContext";

export function DashboardLayout({ children, role }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimer = useRef(null);
  const { user, clearUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Debounce search query — 300ms delay before context update
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedQuery("");
  }, []);

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
    { icon: Sparkles, label: "AI Symptom Checker", href: "/ai-check", active: checkActive("/ai-check") },
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
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed lg:relative top-0 left-0 h-full z-50 bg-white border-r border-[#E5E7EB] flex flex-col flex-shrink-0 transform transition-transform duration-300
          w-64 ${isCollapsed ? 'lg:w-[88px]' : 'lg:w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className={`p-6 flex items-center h-[88px] ${isCollapsed ? 'justify-between lg:justify-center' : 'justify-between'}`}>
          {/* Small V Logo - Only visible on desktop when collapsed */}
          <div className={`w-10 h-10 bg-gradient-to-br from-[#0d9488] to-[#0369a1] rounded-xl items-center justify-center text-white font-bold text-xl shadow-[0_2px_8px_rgba(13,148,136,0.35)] ${isCollapsed ? 'hidden lg:flex' : 'hidden'}`}>
             V
          </div>
          
          {/* Full Logo - Visible on mobile ALWAYS, and on desktop when NOT collapsed */}
          <div className={`items-center w-full justify-between ${isCollapsed ? 'flex lg:hidden' : 'flex'}`}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0d9488' }}>
              VitalSync
            </h1>
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 -mr-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6]"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 mt-2 flex flex-col gap-1">
          {navItems.map((item, index) => (
            <motion.button
              key={item.label}
              onClick={() => router.push(item.href)}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={`w-full flex items-center py-3 rounded-xl transition-all relative group px-4 ${
                isCollapsed ? 'gap-3 lg:gap-0 lg:justify-center' : 'gap-3'
              } ${
                item.active
                  ? 'bg-[#f0fdfa] text-[#0d9488]'
                  : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
              }`}
            >
              {item.active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#0d9488] rounded-r-full" />
              )}
              
              <item.icon className={`flex-shrink-0 ${isCollapsed ? 'w-5 h-5 lg:w-6 lg:h-6' : 'w-5 h-5'}`} />
              
              <span style={{ fontSize: '15px', fontWeight: 500 }} className={`whitespace-nowrap transition-opacity ${isCollapsed ? 'block lg:hidden' : 'block'}`}>
                {item.label}
              </span>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-[70px] px-3 py-2 bg-[#111827] text-white text-[13px] font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl pointer-events-none hidden lg:block">
                  {item.label}
                </div>
              )}
            </motion.button>
          ))}
        </nav>

        {/* Sidebar Collapse Toggle */}
        <div className="p-4 border-t border-[#E5E7EB] hidden lg:block">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center w-full py-3 rounded-xl text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827] transition-all ${
              isCollapsed ? "justify-center" : "gap-3 px-4"
            }`}
          >
            {isCollapsed ? (
              <ChevronRight size={22} className="text-[#0d9488] group-hover:scale-110 transition-transform" />
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
        <div className="bg-white border-b border-[#E5E7EB] px-4 lg:px-8 py-4 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6]"
            >
              <Menu size={24} />
            </button>
            {/* Search bar — visible on ALL screen sizes */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" size={17} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctors, patients, appointments..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#F3F4F6] border border-transparent focus:bg-white focus:border-[#0d9488] focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 transition-all text-[#111827] placeholder:text-[#9CA3AF]"
                  style={{ fontSize: '14px' }}
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition-colors p-0.5 rounded-full hover:bg-[#E5E7EB]"
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-4 sm:ml-8 flex-shrink-0">
            <button className="relative p-2 hover:bg-[#F9FAFB] rounded-xl transition-colors">
              <Bell size={22} className="text-[#6B7280]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full"></span>
            </button>
            <button onClick={handleLogout} className="relative p-2 hover:bg-[#FEE2E2] rounded-xl transition-colors text-[#6B7280] hover:text-[#EF4444]" title="Logout">
              <LogOut size={22} />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-[#0d9488] to-[#0369a1] rounded-full flex items-center justify-center text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
              {initials}
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-auto w-full relative">
          <DashboardSearchContext.Provider value={{ query: debouncedQuery, clearSearch: handleClearSearch }}>
            {children}
          </DashboardSearchContext.Provider>
        </div>
      </div>
    </div>
  );
}
