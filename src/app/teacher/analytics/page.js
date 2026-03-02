'use client';

import { useState } from 'react';
import { Menu, TrendingUp, Users, Star, BookOpen } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import StatsCard from '@/components/dashboard/StatsCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import { TEACHER_NAVIGATION } from '@/constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COURSE_STATS = [
  { name: 'Python', students: 234, rating: 4.8 },
  { name: 'رياضيات', students: 187, rating: 4.9 },
  { name: 'ذكاء اصطناعي', students: 310, rating: 4.7 },
  { name: 'فيزياء', students: 98, rating: 4.6 },
];

const CATEGORY_DATA = [
  { name: 'برمجة', value: 45, color: '#4F46E5' },
  { name: 'رياضيات', value: 25, color: '#F59E0B' },
  { name: 'فيزياء', value: 18, color: '#10B981' },
  { name: 'ذكاء اصطناعي', value: 12, color: '#EC4899' },
];

export default function TeacherAnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState('month');

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
              <h1 className="text-lg font-black text-gray-900">التحليلات والإحصاءات</h1>
              <p className="text-xs text-gray-500">تتبع أداء دوراتك</p>
            </div>
          </div>
          <div className="flex gap-2">
            {['week', 'month', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === p ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {{ week: 'أسبوع', month: 'شهر', year: 'سنة' }[p]}
              </button>
            ))}
          </div>
        </header>

        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard title="إجمالي الطلاب" value="1,234" icon="Users" color="indigo" trend="up" trendValue="+12.5%" subtitle="مقارنة بالشهر السابق" />
            <StatsCard title="الإيرادات" value="28,000 ر.س" icon="DollarSign" color="emerald" trend="up" trendValue="+18.3%" subtitle="" />
            <StatsCard title="متوسط التقييم" value="4.8" icon="Star" color="amber" subtitle="من 5 نجوم" />
            <StatsCard title="معدل الإكمال" value="73%" icon="TrendingUp" color="purple" trend="up" trendValue="+5%" subtitle="" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Revenue Chart - takes 2 cols */}
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">توزيع الطلاب</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={CATEGORY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {CATEGORY_DATA.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => <span style={{ fontSize: 11, fontFamily: 'Cairo' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Course Performance */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-5">أداء كل دورة</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={COURSE_STATS} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Cairo' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Cairo' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontFamily: 'Cairo', borderRadius: 12, border: '1px solid #f1f5f9' }} />
                <Bar dataKey="students" fill="#4F46E5" radius={[6, 6, 0, 0]} name="الطلاب" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
}
