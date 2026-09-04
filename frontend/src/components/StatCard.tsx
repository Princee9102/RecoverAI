import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'indigo'
}) => {
  const colorMap = {
    indigo: 'from-indigo-500/10 to-indigo-600/5 text-indigo-400 border-indigo-500/20 icon-bg-indigo-500/20',
    emerald: 'from-emerald-500/10 to-emerald-600/5 text-emerald-400 border-emerald-500/20 icon-bg-emerald-500/20',
    amber: 'from-amber-500/10 to-amber-600/5 text-amber-400 border-amber-500/20 icon-bg-amber-500/20',
    rose: 'from-rose-500/10 to-rose-600/5 text-rose-400 border-rose-500/20 icon-bg-rose-500/20',
    sky: 'from-sky-500/10 to-sky-600/5 text-sky-400 border-sky-500/20 icon-bg-sky-500/20',
    purple: 'from-purple-500/10 to-purple-600/5 text-purple-400 border-purple-500/20 icon-bg-purple-500/20'
  };

  const currentStyle = colorMap[color];

  return (
    <div className={`bg-gradient-to-br ${currentStyle} bg-slate-900/90 border rounded-2xl p-5 shadow-lg relative overflow-hidden backdrop-blur-sm`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 ${currentStyle.split(' ')[2]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-extrabold text-slate-50 tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-400 font-medium mt-1">
            {subtitle}
          </p>
        )}
        {trend && (
          <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
