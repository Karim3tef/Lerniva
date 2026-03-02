'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Menu, Play, Star, Clock, ChevronLeft } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { STUDENT_NAVIGATION } from '@/constants';
import { MOCK_COURSES } from '@/constants';
import { formatDuration, getLevelLabel, getLevelColor } from '@/lib/helpers';

const MY_ENROLLED = MOCK_COURSES.map((c, i) => ({
  ...c,
  progress: [65, 30, 90, 15, 100, 45][i] || 0,
  lastLesson: ['مقدمة في Python', 'التكامل المحدد', 'شبكات عصبية', 'معادلات شرودنغر', 'تحليل البيانات', 'أنظمة التحكم'][i],
}));

export default function MyCoursesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const filtered = MY_ENROLLED.filter((c) => {
    if (filter === 'in-progress') return c.progress > 0 && c.progress < 100;
    if (filter === 'completed') return c.progress === 100;
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
            <p className="text-xs text-gray-500">{MY_ENROLLED.length} دورة مسجلة</p>
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

          {/* Courses */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-36 bg-gradient-to-br from-indigo-500 to-purple-600 relative flex items-center justify-center">
                  <span className="text-5xl opacity-40 select-none">📚</span>
                  {course.progress === 100 && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      مكتملة ✓
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getLevelColor(course.level)}`}>
                    {getLevelLabel(course.level)}
                  </span>
                  <h3 className="font-bold text-gray-900 text-sm mt-2 mb-1 line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-gray-400 mb-3">آخر درس: {course.lastLesson}</p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>التقدم</span>
                      <span className="font-bold text-gray-700">{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${course.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <Link href={`/courses/${course.id}`}>
                    <button className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      course.progress === 100
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}>
                      {course.progress === 100 ? 'مراجعة الدورة' : 'متابعة التعلم'}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
