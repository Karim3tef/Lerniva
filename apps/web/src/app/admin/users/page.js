'use client';

import { useState, useEffect } from 'react';
import { Menu, Search, UserPlus, Ban, Shield, Mail } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Badge from '@/components/ui/Badge';
import { ADMIN_NAVIGATION } from '@/constants';
import { formatDate } from '@/lib/helpers';
import { api } from '@/lib/api';

export default function AdminUsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const data = await api.get('/admin/users');
    setUsers(data || []);
    setLoading(false);
  }

  async function toggleUserStatus(user) {
    const newStatus = user.status === 'active' ? 'banned' : 'active';
    const result = await api.patch(`/admin/users/${user.id}/status`, { status: newStatus });
    if (!result?.error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
    }
  }

  const filtered = users.filter((u) => {
    const matchSearch =
      (u.full_name || '').includes(search) || (u.email || '').includes(search);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navigation={ADMIN_NAVIGATION} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-black text-gray-900">إدارة المستخدمين</h1>
              <p className="text-xs text-gray-500">{users.length} مستخدم مسجل</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            <UserPlus size={16} />
            <span className="hidden sm:inline">إضافة مستخدم</span>
          </button>
        </header>

        <main className="p-6">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو البريد..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'الكل' },
                  { value: 'student', label: 'طلاب' },
                  { value: 'teacher', label: 'معلمون' },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setRoleFilter(f.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      roleFilter === f.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'جميع الحالات' },
                  { value: 'active', label: 'نشط' },
                  { value: 'pending', label: 'معلق' },
                  { value: 'banned', label: 'محظور' },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      statusFilter === f.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="text-center py-12 text-gray-400 text-sm">جارٍ التحميل...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-right py-3 px-4 font-bold text-gray-500 text-xs">المستخدم</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-500 text-xs">الدور</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-500 text-xs hidden sm:table-cell">تاريخ التسجيل</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-500 text-xs">الحالة</th>
                      <th className="text-right py-3 px-4 font-bold text-gray-500 text-xs">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-indigo-600">
                                {(user.full_name || user.email || '؟').charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{user.full_name || '—'}</p>
                              <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={user.role === 'teacher' ? 'primary' : 'default'}>
                            {user.role === 'teacher' ? 'معلم' : 'طالب'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 hidden sm:table-cell text-gray-400 text-xs">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={user.status === 'active' ? 'success' : user.status === 'pending' ? 'warning' : 'danger'}
                            dot
                          >
                            {user.status === 'active' ? 'نشط' : user.status === 'pending' ? 'معلق' : 'محظور'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                              title="إرسال بريد"
                            >
                              <Mail size={14} />
                            </button>
                            <button
                              onClick={() => toggleUserStatus(user)}
                              className="p-1.5 hover:bg-amber-50 rounded-lg text-gray-400 hover:text-amber-600 transition-colors"
                              title={user.status === 'active' ? 'تعطيل' : 'تفعيل'}
                            >
                              {user.status === 'active' ? <Ban size={14} /> : <Shield size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Search size={32} className="mx-auto mb-3 text-gray-300" />
                    <p>لا توجد نتائج للبحث</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
