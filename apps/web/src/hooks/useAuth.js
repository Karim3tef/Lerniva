'use client';

import { useEffect, useState } from 'react';
import useAuthStore from '@/store/authStore';

export function useAuth() {
  const { user, profile, isAuthenticated, isLoading, init, logout, getRole, isAdmin, isTeacher, isStudent } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !initialized) {
      init().finally(() => setInitialized(true));
    } else {
      setInitialized(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    initialized,
    role: getRole(),
    isAdmin: isAdmin(),
    isTeacher: isTeacher(),
    isStudent: isStudent(),
    logout,
  };
}
