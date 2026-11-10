import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, TrendingUp, Zap } from 'lucide-react';

interface MetricItem {
  label: string;
  value: string | number;
  subValue?: string;
  status?: 'good' | 'warn' | 'neutral' | 'live';
}

interface ScreenAnalyticsHeaderProps {
  title: string;
  badge?: string;
  description: string;
  metrics: MetricItem[];
  actions?: React.ReactNode;
}

export const ScreenAnalyticsHeader: React.FC<ScreenAnalyticsHeaderProps> = ({
  title,
  badge,
  description,
  metrics,
  actions,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Title & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            {badge && (
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/60 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            {description}
          </p>
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>

      {/* Analytics KPI Metric Strip with Live Error/Success Rates */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#111622] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:border-indigo-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
              <span className="truncate">{m.label}</span>
              {m.status === 'live' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
              {m.status === 'good' && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              )}
              {m.status === 'warn' && (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              )}
              {(!m.status || m.status === 'neutral') && (
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </div>

            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {m.value}
            </div>

            {m.subValue && (
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 truncate">
                {m.subValue}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
