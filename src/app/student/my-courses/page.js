'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Menu, Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { STUDENT_NAVIGATION } from '@/constants';
import { getLevelLabel, getLevelColor } from '@/lib/helpers';
import { createClient } from '@/lib/supabase';

export default function MyCoursesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('enrollments')
        .select('*, courses(id, title, thumbnail_url, price, level, total_lessons, total_duration, users(full_name))')
        .eq('student_id', user.id)
        .order('purchased_at', { ascending: false });

      setEnrollments(data || []);
      setLoading(false);
    };
    fetchEnrollments();
  }, []);

  const filtered = enrollments.filter((e) => {
    const progress = e.progress || 0;
    if (filter === 'in-progress') return progress > 0 && progress < 100;
    if (filter === 'completed') return progress === 100;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navigation={STUDENT_NAVIGATION} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg font-black text-gray-900">دوراتي</h1>
            <p className="text-xs text-gray-500">{enrollments.length} دورة مسجلة</p>
          </div>
        </header>

        <main className="p-6">
          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {[
              { value: 'all', label: 'الكل' },
              { value: 'in-progress', label: 'قيد التعلم' },
              { value: 'completed', label: 'مكتملة' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filter === f.value ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="animate-spin text-indigo-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-gray-400 text-sm">لا توجد دورات في هذه الفئة</p>
              <Link href="/courses">
                <button className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  استكشف الدورات
                </button>
              </Link>
            </div>
          ) : (
            /* Courses */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((enrollment) => {
                const course = enrollment.courses || {};
                const progress = enrollment.progress || 0;
                return (
                  <div key={enrollment.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-36 bg-gradient-to-br from-indigo-500 to-purple-600 relative flex items-center justify-center">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl opacity-40 select-none">📚</span>
                      )}
                      {progress === 100 && (
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          مكتملة ✓
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      {course.level && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getLevelColor(course.level)}`}>
                          {getLevelLabel(course.level)}
                        </span>
                      )}
                      <h3 className="font-bold text-gray-900 text-sm mt-2 mb-1 line-clamp-2">{course.title || '—'}</h3>
                      <p className="text-xs text-gray-400 mb-3">
                        {course.users?.full_name ? `المعلم: ${course.users.full_name}` : ''}
                      </p>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>التقدم</span>
                          <span className="font-bold text-gray-700">{progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <Link href={`/learn/${enrollment.course_id}`}>
                        <button className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${
                          progress === 100
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}>
                          {progress === 100 ? 'مراجعة الدورة' : 'متابعة التعلم'}
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
