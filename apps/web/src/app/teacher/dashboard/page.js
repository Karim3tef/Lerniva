'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, PlusCircle, ChevronLeft, Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import StatsCard from '@/components/dashboard/StatsCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import NotificationBell from '@/components/notifications/NotificationBell';
import { TEACHER_NAVIGATION } from '@/constants';
import { getStatusLabel, getStatusColor, formatPrice } from '@/lib/helpers';
import { createClient } from '@/lib/supabase';

export default function TeacherDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title, is_published, is_approved')
        .eq('teacher_id', user.id);

      const courseList = coursesData || [];
      setCourses(courseList);

      const courseIds = courseList.map((c) => c.id);

      if (courseIds.length > 0) {
        const [{ count }, { data: payments }, { data: reviews }] = await Promise.all([
          supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .in('course_id', courseIds),
          supabase
            .from('payments')
            .select('amount')
            .in('course_id', courseIds)
            .eq('status', 'succeeded'),
          supabase
            .from('reviews')
            .select('rating')
            .in('course_id', courseIds),
        ]);

        setTotalStudents(count || 0);
        setTotalRevenue((payments || []).reduce((sum, p) => sum + Number(p.amount), 0));
        if (reviews && reviews.length > 0) {
          const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
          setAvgRating(avg.toFixed(1));
        }
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const publishedCount = courses.filter((c) => c.is_published).length;
  const draftCount = courses.filter((c) => !c.is_published).length;

  const getStatusFromCourse = (course) => {
    if (!course.is_published) return 'draft';
    if (!course.is_approved) return 'pending';
    return 'published';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navigation={TEACHER_NAVIGATION} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-black text-gray-900">لوحة المعلم</h1>
              <p className="text-xs text-gray-500">إدارة دوراتك ومتابعة أدائك</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userId && <NotificationBell userId={userId} />}
            <Link href="/teacher/create-course">
              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                <PlusCircle size={16} />
                <span className="hidden sm:inline">دورة جديدة</span>
              </button>
            </Link>
          </div>
        </header>

        <main className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="animate-spin text-indigo-600" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatsCard
                  title="إجمالي الطلاب"
                  value={String(totalStudents)}
                  icon="Users"
                  color="indigo"
                  subtitle=""
                />
                <StatsCard
                  title="إجمالي الإيرادات"
                  value={`${totalRevenue.toLocaleString('ar-SA')} ر.س`}
                  icon="DollarSign"
                  color="emerald"
                  subtitle=""
                />
                <StatsCard
                  title="دوراتي"
                  value={String(courses.length)}
                  icon="BookOpen"
                  color="amber"
                  subtitle={`${publishedCount} منشورة، ${draftCount} مسودة`}
                />
                <StatsCard title="متوسط التقييم" value={avgRating ?? '—'} icon="Star" color="purple" subtitle="من 5 نجوم" />
              </div>

              {/* Revenue Chart */}
              <div className="mb-6">
                <RevenueChart title="الإيرادات الشهرية" />
              </div>

              {/* My Courses Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900">دوراتي الأخيرة</h2>
                  <Link href="/teacher/courses" className="flex items-center gap-1 text-sm text-indigo-600 font-semibold">
                    عرض الكل <ChevronLeft size={16} />
                  </Link>
                </div>
                {courses.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">لم تضف أي دورة بعد</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-right py-3 px-4 font-bold text-gray-500 text-xs">الدورة</th>
                          <th className="text-right py-3 px-4 font-bold text-gray-500 text-xs">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {courses.slice(0, 5).map((course) => {
                          const status = getStatusFromCourse(course);
                          return (
                            <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-4">
                                <p className="font-semibold text-gray-900 line-clamp-1">{course.title}</p>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(status)}`}>
                                  {getStatusLabel(status)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
