'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, PlusCircle, ChevronLeft } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import StatsCard from '@/components/dashboard/StatsCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import { TEACHER_NAVIGATION } from '@/constants';
import { MOCK_COURSES } from '@/constants';
import { getStatusLabel, getStatusColor, formatPrice } from '@/lib/helpers';

const MY_TEACHER_COURSES = MOCK_COURSES.slice(0, 4).map((c, i) => ({
  ...c,
  status: ['published', 'published', 'draft', 'published'][i],
  revenue: [12400, 8900, 0, 6700][i],
}));

export default function TeacherDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          <Link href="/teacher/create-course">
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              <PlusCircle size={16} />
              <span className="hidden sm:inline">دورة جديدة</span>
            </button>
          </Link>
        </header>

        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard title="إجمالي الطلاب" value="1,234" icon="Users" color="indigo" trend="up" trendValue="+89 هذا الشهر" subtitle="" />
            <StatsCard title="إجمالي الإيرادات" value="28,000 ر.س" icon="DollarSign" color="emerald" trend="up" trendValue="+15% هذا الشهر" subtitle="" />
            <StatsCard title="دوراتي" value="4" icon="BookOpen" color="amber" subtitle="3 منشورة، 1 مسودة" />
            <StatsCard title="متوسط التقييم" value="4.8 ⭐" icon="Star" color="purple" subtitle="من 5 نجوم" />
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-right py-3 px-4 font-bold text-gray-500 text-xs">الدورة</th>
                    <th className="text-right py-3 px-4 font-bold text-gray-500 text-xs">الطلاب</th>
                    <th className="text-right py-3 px-4 font-bold text-gray-500 text-xs">الإيراد</th>
                    <th className="text-right py-3 px-4 font-bold text-gray-500 text-xs">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MY_TEACHER_COURSES.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900 line-clamp-1">{course.title}</p>
                        <p className="text-xs text-gray-400">{course.category}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-medium">{course.enrollment_count}</td>
                      <td className="py-3 px-4 text-gray-600 font-medium">{formatPrice(course.revenue)}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(course.status)}`}>
                          {getStatusLabel(course.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
