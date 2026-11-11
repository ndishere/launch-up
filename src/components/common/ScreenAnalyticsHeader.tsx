import React from 'react';
import { SummaryMetricGrid, SummaryMetricCard, type MetricStatusTone } from './SummaryMetricCard';

interface MetricItem {
  label: string;
  value: string | number;
  subValue?: string;
  status?: MetricStatusTone;
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

      {/* Unified 5-Cell Horizontal Summary Bar */}
      {metrics.length > 0 && (
        <SummaryMetricGrid>
          {metrics.map((m, idx) => (
            <SummaryMetricCard
              key={idx}
              title={m.label}
              primaryValue={m.value}
              subtitle={m.subValue || 'Operational'}
              status={m.status || 'neutral'}
            />
          ))}
        </SummaryMetricGrid>
      )}
    </div>
  );
};
