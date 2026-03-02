'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import useAuthStore from '@/store/authStore';

export function useAuth() {
  const { user, profile, isAuthenticated, isLoading, login, logout, setLoading, getRole } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          login(session.user, profileData);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();

    // eslint-disable-next-line react-hooks/exhaustive-deps -- Zustand store functions are stable references
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        login(session.user, profileData);
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- intentionally run once on mount

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    initialized,
    role: getRole(),
    isAdmin: getRole() === 'admin',
    isTeacher: getRole() === 'teacher',
    isStudent: getRole() === 'student',
  };
}
