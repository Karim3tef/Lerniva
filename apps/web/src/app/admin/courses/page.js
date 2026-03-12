'use client';

import { useState, useEffect } from 'react';
import { Menu, Search, Eye, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Badge from '@/components/ui/Badge';
import { ADMIN_NAVIGATION } from '@/constants';
import { getLevelLabel, formatPrice, formatDate } from '@/lib/helpers';
import { api } from '@/lib/api';

function deriveStatus(course) {
  if (course.is_published && course.is_approved) return 'published';
  if (course.is_published && !course.is_approved) return 'pending';
  return 'draft';
}

export default function AdminCoursesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const data = await api.get('/admin/courses/pending');
      const allCourses = await api.get('/admin/courses');
      const courseList = allCourses || data || [];
      const mapped = courseList.map((c) => ({
        ...c,
        teacher: c.teacher_name || c.users?.full_name || '—',
        status: deriveStatus(c),
      }));
      setCourses(mapped);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  async function approveCourse(id) {
    const result = await api.patch(`/admin/courses/${id}/approve`);
    if (!result?.error) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, is_approved: true, status: 'published' } : c
        )
      );
    }
  }

  async function rejectCourse(id) {
    const result = await api.patch(`/admin/courses/${id}/reject`);
    if (!result?.error) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, is_approved: false, is_published: false, status: 'draft' }
            : c
        )
      );
    }
  }

  const filtered = courses.filter((c) => {
    const matchSearch =
      (c.title || '').includes(search) || (c.teacher || '').includes(search);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = courses.filter((c) => c.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navigation={ADMIN_NAVIGATION} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg font-black text-gray-900">إدارة الدورات</h1>
            <p className="text-xs text-gray-500">{courses.length} دورة في المنصة</p>
          </div>
        </header>

        <main className="p-6">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث بعنوان الدورة أو اسم المعلم..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'all', label: 'الكل' },
                  { value: 'published', label: 'منشورة' },
                  { value: 'pending', label: 'تنتظر المراجعة' },
                  { value: 'draft', label: 'مسودات' },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      statusFilter === f.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                    {f.value === 'pending' && pendingCount > 0 && (
                      <span className="mr-1.5 bg-amber-500 text-white text-xs w-4 h-4 rounded-full inline-flex items-center justify-center">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Courses Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="text-center py-12 text-gray-400 text-sm">جارٍ التحميل...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-right py-3 px-4 font-bold text-gray-500 text-xs">الدورة</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-500 text-xs hidden md:table-cell">المعلم</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-500 text-xs hidden sm:table-cell">السعر</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-500 text-xs hidden lg:table-cell">الطلاب</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-500 text-xs">الحالة</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-500 text-xs">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                              <BookOpen size={16} className="text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate max-w-48">{course.title}</p>
                              <p className="text-xs text-gray-400">{getLevelLabel(course.level)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 hidden md:table-cell text-gray-600 text-xs">{course.teacher}</td>
                        <td className="py-4 px-4 hidden sm:table-cell text-gray-600 font-medium">{formatPrice(course.price)}</td>
                        <td className="py-4 px-4 hidden lg:table-cell text-gray-600">{course.enrollment_count ?? 0}</td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={
                              course.status === 'published' ? 'success' :
                              course.status === 'pending' ? 'warning' : 'default'
                            }
                          >
                            {course.status === 'published' ? 'منشور' :
                             course.status === 'pending' ? 'قيد المراجعة' : 'مسودة'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                              title="مراجعة"
                            >
                              <Eye size={14} />
                            </button>
                            {course.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => approveCourse(course.id)}
                                  className="p-1.5 hover:bg-emerald-50 rounded-lg text-gray-400 hover:text-emerald-600 transition-colors"
                                  title="قبول"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  onClick={() => rejectCourse(course.id)}
                                  className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                                  title="رفض"
                                >
                                  <XCircle size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-sm">لا توجد دورات</div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
