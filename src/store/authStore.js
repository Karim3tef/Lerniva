'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),

      login: (user, profile) =>
        set({ user, profile, isAuthenticated: true, isLoading: false }),

      logout: () =>
        set({ user: null, profile: null, isAuthenticated: false, isLoading: false }),

      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),

      getRole: () => {
        const { profile, user } = get();
        return profile?.role || user?.user_metadata?.role || 'student';
      },

      isAdmin: () => get().getRole() === 'admin',
      isTeacher: () => get().getRole() === 'teacher',
      isStudent: () => get().getRole() === 'student',
    }),
    {
      name: 'lerniva-auth',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
