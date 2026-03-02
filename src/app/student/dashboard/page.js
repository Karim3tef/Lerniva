'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Trophy, Clock, TrendingUp, Play, ChevronLeft, Menu } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import StatsCard from '@/components/dashboard/StatsCard';
import CourseCard from '@/components/course/CourseCard';
import { STUDENT_NAVIGATION } from '@/constants';
import { MOCK_COURSES } from '@/constants';

const MY_COURSES = MOCK_COURSES.slice(0, 3).map((c) => ({ ...c, progress: Math.floor(Math.random() * 80) + 10 }));

export default function StudentDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        navigation={STUDENT_NAVIGATION}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-black text-gray-900">لوحة التحكم</h1>
              <p className="text-xs text-gray-500">مرحباً بعودتك! واصل رحلة التعلم</p>
            </div>
          </div>
          <Link href="/courses">
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              <BookOpen size={16} />
              <span className="hidden sm:inline">استكشف الدورات</span>
            </button>
          </Link>
        </header>

        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard title="الدورات المسجلة" value="3" icon="BookOpen" color="indigo" trend="up" trendValue="+1 هذا الشهر" subtitle="" />
            <StatsCard title="الدروس المكتملة" value="47" icon="CheckCircle" color="emerald" trend="up" trendValue="+12 هذا الأسبوع" subtitle="" />
            <StatsCard title="الشهادات" value="1" icon="Award" color="amber" subtitle="آخر: Python للمبتدئين" />
            <StatsCard title="ساعات التعلم" value="28h" icon="Clock" color="purple" trend="up" trendValue="+3h هذا الأسبوع" subtitle="" />
          </div>

          {/* Continue Learning */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">واصل التعلم</h2>
              <Link href="/student/my-courses" className="flex items-center gap-1 text-sm text-indigo-600 font-semibold">
                عرض الكل <ChevronLeft size={16} />
              </Link>
            </div>
            <div className="space-y-4">
              {MY_COURSES.map((course) => (
                <div key={course.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors group">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
                    {['💻', '📐', '🤖'][MY_COURSES.indexOf(course)]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{course.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{course.progress}%</span>
                    </div>
                  </div>
                  <button className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Play size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">دورات مقترحة لك</h2>
              <Link href="/courses" className="flex items-center gap-1 text-sm text-indigo-600 font-semibold">
                عرض الكل <ChevronLeft size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {MOCK_COURSES.slice(3, 6).map((course) => (
                <CourseCard key={course.id} course={course} compact />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
