'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

function dashboardByRole(role) {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'teacher') return '/teacher/dashboard';
  return '/student/dashboard';
}

export default function RoleGuard({ requiredRole, children }) {
  const router = useRouter();
  const { init, isLoading, isAuthenticated, user } = useAuthStore();
  const [checked, setChecked] = useState(false);
  const fallbackPath = useMemo(() => dashboardByRole(user?.role), [user?.role]);

  useEffect(() => {
    init().catch(() => {});
  }, [init]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    if (user.role !== requiredRole) {
      router.replace(fallbackPath);
      return;
    }

    setChecked(true);
  }, [isLoading, isAuthenticated, user, requiredRole, fallbackPath, router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
        جاري التحقق من الصلاحيات...
      </div>
    );
  }

  return children;
}
