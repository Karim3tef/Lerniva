'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, PlusCircle, Edit, BarChart2, Trash2, BookOpen } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { TEACHER_NAVIGATION } from '@/constants';
import { createClient } from '@/lib/supabase';
import { getStatusLabel, getStatusColor, getLevelLabel, formatPrice } from '@/lib/helpers';

function getCourseStatus(course) {
  if (course.is_published && course.is_approved) return 'published';
  if (course.is_published && !course.is_approved) return 'pending';
  return 'draft';
}

export default function TeacherCoursesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('courses')
        .select('*, categories(name)')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) setCourseList(data || []);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const handleDelete = async (courseId) => {
    if (!confirm('هل أنت متأكد من حذف هذه الدورة؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
    const supabase = createClient();
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (!error) setCourseList((prev) => prev.filter((c) => c.id !== courseId));
  };

  const coursesWithStatus = courseList.map((c) => ({
    ...c,
    status: getCourseStatus(c),
    enrollment_count: c.enrollment_count || 0,
    revenue: c.revenue || 0,
  }));

  const filtered = coursesWithStatus.filter((c) =>
    statusFilter === 'all' ? true : c.status === statusFilter
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navigation={TEACHER_NAVIGATION} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-black text-gray-900">إدارة الدورات</h1>
          </div>
          <Link href="/teacher/create-course">
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              <PlusCircle size={16} />
              دورة جديدة
            </button>
          </Link>
        </header>

        <main className="p-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { value: 'all', label: 'الكل' },
              { value: 'published', label: 'منشور' },
              { value: 'pending', label: 'قيد المراجعة' },
              { value: 'draft', label: 'مسودة' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  statusFilter === f.value ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد دورات</h3>
              <p className="text-gray-500 mb-6">ابدأ بإنشاء دورتك الأولى الآن</p>
              <Link href="/teacher/create-course">
                <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors">
                  <PlusCircle size={16} />
                  إنشاء دورة جديدة
                </button>
              </Link>
            </div>
          ) : (
            /* Courses Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative flex items-center justify-center">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl opacity-30 select-none">📚</span>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(course.status)}`}>
                        {getStatusLabel(course.status)}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-gray-400 mb-3">
                      {getLevelLabel(course.level)} · {course.categories?.name || course.category || '—'}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-4 text-center">
                      <div className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-xs text-gray-400">الطلاب</p>
                        <p className="font-bold text-gray-900 text-sm">{course.enrollment_count}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-xs text-gray-400">الإيراد</p>
                        <p className="font-bold text-gray-900 text-sm">{formatPrice(course.revenue)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/teacher/courses/${course.id}/edit`} className="flex-1">
                        <button className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors">
                          <Edit size={14} /> تعديل
                        </button>
                      </Link>
                      <Link href={`/teacher/courses/${course.id}/lessons`} className="flex-1">
                        <button className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold transition-colors">
                          <BookOpen size={14} /> إدارة الدروس
                        </button>
                      </Link>
                      <Link href="/teacher/analytics">
                        <button className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors" title="تحليلات">
                          <BarChart2 size={14} />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
