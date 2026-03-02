'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, PlusCircle, Edit, BarChart2, Eye, Trash2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { TEACHER_NAVIGATION } from '@/constants';
import { MOCK_COURSES } from '@/constants';
import { getStatusLabel, getStatusColor, getLevelLabel, formatPrice } from '@/lib/helpers';

const TEACHER_COURSES = MOCK_COURSES.map((c, i) => ({
  ...c,
  status: ['published', 'published', 'draft', 'published', 'archived', 'published'][i] || 'draft',
  revenue: [12400, 8900, 0, 6700, 3200, 9800][i] || 0,
}));

export default function TeacherCoursesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = TEACHER_COURSES.filter((c) =>
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
          <div className="flex gap-2 mb-6">
            {[
              { value: 'all', label: 'الكل' },
              { value: 'published', label: 'منشور' },
              { value: 'draft', label: 'مسودة' },
              { value: 'archived', label: 'مؤرشف' },
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

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative flex items-center justify-center">
                  <span className="text-4xl opacity-30 select-none">📚</span>
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(course.status)}`}>
                      {getStatusLabel(course.status)}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-gray-400 mb-3">{getLevelLabel(course.level)} · {course.category}</p>
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
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors">
                      <Edit size={14} /> تعديل
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold transition-colors">
                      <BarChart2 size={14} /> تحليلات
                    </button>
                    <button className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
