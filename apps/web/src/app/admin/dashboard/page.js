'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import AdminDashboardClient from '@/components/dashboard/AdminDashboardClient';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    userCount: 0,
    courseCount: 0,
    totalRevenue: 0,
    recentUsers: [],
    pendingCount: 0,
    pendingWithdrawals: 0,
    pendingRefunds: 0,
    newUsersThisWeek: 0,
  });

  useEffect(() => {
    api.get('/admin/stats').then((data) => {
      if (data) setStats(data);
    }).catch(() => {});
  }, []);

  return <AdminDashboardClient {...stats} />;
}
