import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import * as Icons from 'lucide-react';

export default function StatsCard({ title, value, subtitle, trend, trendValue, icon, color = 'indigo' }) {
  const Icon = Icons[icon] || Icons.BarChart2;

  const colors = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'bg-indigo-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'bg-amber-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'bg-red-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'bg-purple-100' },
  };

  const colorSet = colors[color] || colors.indigo;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-black text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${colorSet.icon} rounded-2xl flex items-center justify-center flex-shrink-0`}>
          <Icon size={22} className={colorSet.text} />
        </div>
      </div>
      {(subtitle || trendValue) && (
        <div className="flex items-center gap-2">
          {trendValue && (
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon size={14} />
              <span className="text-xs font-bold">{trendValue}</span>
            </div>
          )}
          {subtitle && (
            <span className="text-xs text-gray-400">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
