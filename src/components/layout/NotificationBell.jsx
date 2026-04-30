"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { getNotifications, markNotificationAsRead } from "../../lib/notifications";
import { useAuthStore } from "../../store/authStore";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationBell() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!user) return;

    // Fetch initial notifications
    getNotifications(user.id).then(({ data }) => {
      if (data) setNotifications(data);
    });

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`notifications_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === payload.new.id ? payload.new : n))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await markNotificationAsRead(id);
  };

  const getTimeAgo = (dateStr) => {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[#F9FAFB] rounded-xl transition-colors outline-none focus:ring-2 focus:ring-[#0d9488]/20"
        aria-label="Notifications"
      >
        <Bell size={22} className="text-[#6B7280]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-[#E5E7EB] overflow-hidden z-50 origin-top-right"
          >
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
              <h3 className="font-semibold text-[#111827]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-[#0d9488]/10 text-[#0d9488] text-[12px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-5 py-10 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-[#F3F4F6] rounded-full flex items-center justify-center mb-3">
                    <Bell size={20} className="text-[#9CA3AF]" />
                  </div>
                  <p className="text-[14px] text-[#6B7280] font-medium">
                    No notifications yet
                  </p>
                  <p className="text-[13px] text-[#9CA3AF] mt-1">
                    We'll notify you when something arrives.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E7EB]">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-5 py-4 hover:bg-[#F9FAFB] transition-colors ${
                        !notif.is_read ? "bg-[#f0fdfa]/30" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-[14px] leading-snug ${
                              !notif.is_read
                                ? "text-[#111827] font-semibold"
                                : "text-[#374151] font-medium"
                            }`}
                          >
                            {notif.title}
                          </p>
                          <p className="text-[13px] text-[#6B7280] mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[12px] text-[#9CA3AF] mt-2 font-medium">
                            {getTimeAgo(notif.created_at)}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="flex-shrink-0 p-1.5 text-[#0d9488] hover:bg-[#0d9488]/10 rounded-lg transition-colors tooltip-trigger"
                            title="Mark as read"
                          >
                            <Check size={16} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
