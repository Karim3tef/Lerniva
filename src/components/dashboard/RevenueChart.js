'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const MOCK_DATA = [
  { month: 'يناير', revenue: 12400, enrollments: 45 },
  { month: 'فبراير', revenue: 18200, enrollments: 67 },
  { month: 'مارس', revenue: 15800, enrollments: 52 },
  { month: 'أبريل', revenue: 22100, enrollments: 84 },
  { month: 'مايو', revenue: 19700, enrollments: 71 },
  { month: 'يونيو', revenue: 28400, enrollments: 108 },
  { month: 'يوليو', revenue: 31200, enrollments: 125 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3">
        <p className="text-xs font-bold text-gray-700 mb-1">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
            {entry.name === 'revenue' ? 'الإيرادات' : 'التسجيلات'}:{' '}
            <span className="font-bold">
              {entry.name === 'revenue'
                ? `${entry.value.toLocaleString('ar-SA')} ر.س`
                : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data = MOCK_DATA, title = 'الإيرادات الشهرية' }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900">{title}</h3>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            الإيرادات
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            التسجيلات
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Cairo' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Cairo' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}ك`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#4F46E5"
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
          <Area
            type="monotone"
            dataKey="enrollments"
            stroke="#F59E0B"
            strokeWidth={2}
            fill="url(#enrollmentGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
