'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setAccessToken } from '@/lib/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: true,

      init: async () => {
        set({ isLoading: true });
        try {
          const data = await api.post('/auth/refresh');
          if (data?.accessToken) {
            setAccessToken(data.accessToken);
            set({ user: data.user, profile: data.user, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch {
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (email, password) => {
        const data = await api.post('/auth/login', { email, password });
        if (!data?.accessToken) throw new Error('فشل تسجيل الدخول');
        setAccessToken(data.accessToken);
        set({ user: data.user, profile: data.user, isAuthenticated: true, isLoading: false });
        return data.user;
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch { /* ignore */ }
        setAccessToken(null);
        set({ user: null, profile: null, isAuthenticated: false });
      },

      updateProfile: (updates) =>
        set((state) => ({
          user: { ...state.user, ...updates },
          profile: { ...state.profile, ...updates },
        })),

      getRole: () => get().user?.role || null,
      isAdmin: () => get().user?.role === 'admin',
      isTeacher: () => get().user?.role === 'teacher',
      isStudent: () => get().user?.role === 'student',

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'lerniva-auth',
      partialize: (s) => ({ user: s.user, profile: s.profile, isAuthenticated: s.isAuthenticated }),
    }
  )
);

export default useAuthStore;
