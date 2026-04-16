import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false, // Prevents early flash/re-routes before Supabase session check finishes

  // Hydrate store from a valid Supabase API session response
  setUser: (user) => set({
    user: user,
    isAuthenticated: !!user,
    isInitialized: true,
  }),

  // Purge local store on signout
  clearUser: () => set({
    user: null,
    isAuthenticated: false,
    isInitialized: true,
  }),
}));
