import { supabaseAdmin } from '@/lib/supabase-admin';
import AdminDashboardClient from '@/components/dashboard/AdminDashboardClient';

export default async function AdminDashboardPage() {
  const [
    { count: userCount },
    { count: courseCount },
    { count: pendingCount },
    { data: paymentsData },
    { data: recentUsers },
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
  ]);

  const totalRevenue = (paymentsData || []).reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <AdminDashboardClient
      userCount={userCount || 0}
      courseCount={courseCount || 0}
      totalRevenue={totalRevenue}
      recentUsers={recentUsers || []}
      pendingCount={pendingCount || 0}
    />
  );
}
