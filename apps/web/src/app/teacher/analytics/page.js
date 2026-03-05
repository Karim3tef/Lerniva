'use client';

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import StatsCard from '@/components/dashboard/StatsCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import { TEACHER_NAVIGATION } from '@/constants';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const CHART_COLORS = ['#4F46E5', '#F59E0B', '#10B981', '#EC4899', '#3B82F6', '#8B5CF6', '#F97316', '#14B8A6'];

export default function TeacherAnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState('month');
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.get('/teachers/analytics');
        if (data?.courses) {
          setAnalyticsData(data.courses);
        } else if (Array.isArray(data)) {
          setAnalyticsData(data);
        }
      } catch {
        // handle silently
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const totalStudents = analyticsData.reduce((s, c) => s + c.students, 0);
  const totalRevenue = analyticsData.reduce((s, c) => s + c.revenue, 0);
  const ratingsWithData = analyticsData.filter((c) => c.rating !== '—');
  const avgRating = ratingsWithData.length
    ? (ratingsWithData.reduce((s, c) => s + Number(c.rating), 0) / ratingsWithData.length).toFixed(1)
    : '—';

  // Build per-category student distribution for pie chart
  const categoryMap = {};
  analyticsData.forEach((c, i) => {
    const cat = c.category;
    if (!categoryMap[cat]) categoryMap[cat] = { name: cat, value: 0, color: CHART_COLORS[i % CHART_COLORS.length] };
    categoryMap[cat].value += c.students;
  });
  const categoryData = Object.values(categoryMap);

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
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatsCard title="إجمالي الطلاب" value={totalStudents.toLocaleString('ar-SA')} icon="Users" color="indigo" subtitle="جميع الدورات" />
                <StatsCard title="الإيرادات" value={`${totalRevenue.toLocaleString('ar-SA')} ر.س`} icon="DollarSign" color="emerald" subtitle="" />
                <StatsCard title="متوسط التقييم" value={avgRating} icon="Star" color="amber" subtitle="من 5 نجوم" />
                <StatsCard title="عدد الدورات" value={analyticsData.length} icon="BookOpen" color="purple" subtitle="دوراتك النشطة" />
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
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend
                          formatter={(value) => <span style={{ fontSize: 11, fontFamily: 'Cairo' }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">لا توجد بيانات</div>
                  )}
                </div>
              </div>

              {/* Course Performance */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-5">أداء كل دورة</h3>
                {analyticsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analyticsData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Cairo' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Cairo' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ fontFamily: 'Cairo', borderRadius: 12, border: '1px solid #f1f5f9' }} />
                      <Bar dataKey="students" fill="#4F46E5" radius={[6, 6, 0, 0]} name="الطلاب" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">لا توجد بيانات بعد</div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
