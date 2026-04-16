"use client";

import { useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuthStore } from "../../store/authStore";

export function AuthProvider({ children }) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    // 1. Fetch initial active session securely on app mount
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        } else {
          clearUser();
        }
      } catch (error) {
        console.error("Auth Session Error:", error);
        clearUser();
      }
    };

    initializeAuth();

    // 2. Subscribe to Supabase auth events (persists state seamlessly across browser tabs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          clearUser();
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, clearUser]);

  return <>{children}</>;
}
