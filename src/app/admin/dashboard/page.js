'use client';

import { useState } from 'react';
import { Menu, AlertTriangle } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import StatsCard from '@/components/dashboard/StatsCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import Badge from '@/components/ui/Badge';
import { ADMIN_NAVIGATION } from '@/constants';
import { formatDate } from '@/lib/helpers';

const RECENT_USERS = [
  { id: 1, name: 'أحمد محمد', email: 'ahmed@email.com', role: 'student', joinedAt: new Date().toISOString(), status: 'active' },
  { id: 2, name: 'سارة علي', email: 'sara@email.com', role: 'teacher', joinedAt: new Date().toISOString(), status: 'active' },
  { id: 3, name: 'خالد عمر', email: 'khalid@email.com', role: 'student', joinedAt: new Date().toISOString(), status: 'banned' },
  { id: 4, name: 'فاطمة زيد', email: 'fatima@email.com', role: 'teacher', joinedAt: new Date().toISOString(), status: 'pending' },
  { id: 5, name: 'محمد سعد', email: 'mohammed@email.com', role: 'student', joinedAt: new Date().toISOString(), status: 'active' },
];

const RECENT_ACTIVITIES = [
  { id: 1, text: 'دورة جديدة تنتظر المراجعة', type: 'warning', time: 'منذ 5 دقائق' },
  { id: 2, text: 'طلب استرداد من أحمد محمد', type: 'warning', time: 'منذ 15 دقيقة' },
  { id: 3, text: 'تسجيل معلم جديد: د. نورة الشمري', type: 'info', time: 'منذ ساعة' },
  { id: 4, text: 'إتمام دفع 349 ر.س من سارة علي', type: 'success', time: 'منذ 2 ساعة' },
];

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navigation={ADMIN_NAVIGATION} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg font-black text-gray-900">لوحة الإدارة</h1>
            <p className="text-xs text-gray-500">نظرة عامة على المنصة</p>
          </div>
          <div className="mr-auto flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-xl">
            <AlertTriangle size={14} />
            2 طلبات تحتاج مراجعة
          </div>
        </header>

        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard title="إجمالي المستخدمين" value="12,542" icon="Users" color="indigo" trend="up" trendValue="+234 هذا الشهر" subtitle="" />
            <StatsCard title="الدورات النشطة" value="734" icon="BookOpen" color="emerald" trend="up" trendValue="+18 هذا الشهر" subtitle="" />
            <StatsCard title="إجمالي الإيرادات" value="89,400 ر.س" icon="DollarSign" color="amber" trend="up" trendValue="+22.5% هذا الشهر" subtitle="" />
            <StatsCard title="معدل الرضا" value="98%" icon="Heart" color="purple" subtitle="من الطلاب" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2">
              <RevenueChart title="إيرادات المنصة" />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">النشاط الأخير</h3>
              <div className="space-y-3">
                {RECENT_ACTIVITIES.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      activity.type === 'warning' ? 'bg-amber-400' :
                      activity.type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'
                    }`} />
                    <div>
                      <p className="text-sm text-gray-700">{activity.text}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Users */}
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-5">المستخدمون الجدد</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-right">
                    <th className="py-3 px-4 font-bold text-gray-500 text-xs">المستخدم</th>
                    <th className="py-3 px-4 font-bold text-gray-500 text-xs">الدور</th>
                    <th className="py-3 px-4 font-bold text-gray-500 text-xs">تاريخ التسجيل</th>
                    <th className="py-3 px-4 font-bold text-gray-500 text-xs">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {RECENT_USERS.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-indigo-600">{user.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={user.role === 'teacher' ? 'primary' : 'default'}>
                          {user.role === 'teacher' ? 'معلم' : 'طالب'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(user.joinedAt)}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={user.status === 'active' ? 'success' : user.status === 'pending' ? 'warning' : 'danger'}
                          dot
                        >
                          {user.status === 'active' ? 'نشط' : user.status === 'pending' ? 'معلق' : 'محظور'}
                        </Badge>
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
