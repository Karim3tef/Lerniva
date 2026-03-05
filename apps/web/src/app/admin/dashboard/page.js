import { supabaseAdmin } from '@/lib/supabase-admin';
import AdminDashboardClient from '@/components/dashboard/AdminDashboardClient';

export default async function AdminDashboardPage() {
  const [
    { count: userCount },
    { count: courseCount },
    { count: pendingCount },
    { data: paymentsData },
    { data: recentUsers },
    { count: pendingWithdrawals },
    { count: pendingRefunds },
    { count: newUsersThisWeek },
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
      .eq('is_approved', true),
    supabaseAdmin
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
      .eq('is_approved', false),
    supabaseAdmin.from('payments').select('amount').eq('status', 'succeeded'),
    supabaseAdmin
      .from('users')
      .select('id, full_name, email, role, created_at, status')
      .order('created_at', { ascending: false })
      .limit(10),
    supabaseAdmin
      .from('withdrawals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabaseAdmin
      .from('refunds')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const totalRevenue = (paymentsData || []).reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <AdminDashboardClient
      userCount={userCount || 0}
      courseCount={courseCount || 0}
      totalRevenue={totalRevenue}
      recentUsers={recentUsers || []}
      pendingCount={pendingCount || 0}
      pendingWithdrawals={pendingWithdrawals || 0}
      pendingRefunds={pendingRefunds || 0}
      newUsersThisWeek={newUsersThisWeek || 0}
    />
  );
}
