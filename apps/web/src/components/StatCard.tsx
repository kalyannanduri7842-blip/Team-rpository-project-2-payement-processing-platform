import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'emerald' | 'darkgreen' | 'amber' | 'rose' | 'teal';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp,
  color = 'darkgreen',
}) => {
  const colorMap = {
    darkgreen: 'bg-emerald-950 text-emerald-300 border-emerald-900',
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rose: 'bg-rose-100 text-rose-800 border-rose-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    teal: 'bg-teal-100 text-teal-800 border-teal-200',
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-emerald-600/50 hover:shadow-md transition-all shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.darkgreen}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs">
          <span className={`font-bold mr-1.5 ${trendUp ? 'text-emerald-700' : 'text-rose-600'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
          <span className="text-slate-400">vs last period</span>
        </div>
      )}
    </div>
  );
};
