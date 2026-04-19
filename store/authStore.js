import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Global authentication state management using Zustand.
 * Persists user session details locally to maintain state across reloads.
 */
export const useAuthStore = create()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      
      setRole: (role) => set((state) => ({
        user: state.user ? { ...state.user, role } : null
      })),
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
        // Optional: Trigger server-side logout via API
      },
    }),
    {
      name: 'express-writer-auth', // key for localStorage
    }
  )
);
