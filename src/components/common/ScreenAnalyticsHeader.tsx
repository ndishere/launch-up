import React from 'react';

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
    <div className="space-y-4 pb-1">
      {/* Top Title & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h1>
            {badge && (
              <span className="px-2 py-0.5 text-[11px] font-medium bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50 rounded-md inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl line-clamp-1">
            {description}
          </p>
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>

      {/* Minimalist Horizontal Hairline Metric Strip */}
      {metrics.length > 0 && (
        <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800/80">
          {metrics.map((m, idx) => (
            <div key={idx} className="px-4 py-3 flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  {m.label}
                </span>
                {m.status === 'good' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                )}
                {m.status === 'live' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                )}
                {m.status === 'warn' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                )}
              </div>

              <div className="flex items-baseline justify-between gap-2 mt-1">
                <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  {m.value}
                </span>
                {m.subValue && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {m.subValue}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
