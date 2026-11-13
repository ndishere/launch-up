import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type MetricStatusTone = 'good' | 'live' | 'warn' | 'bad' | 'neutral';

export interface SummaryMetricCardProps {
  title: string;
  primaryValue: string | number;
  subtitle: string;
  secondaryCaption?: string;
  status?: MetricStatusTone;
  onClick?: () => void;
  id?: string;
}

const DOT_STYLES: Record<MetricStatusTone, string> = {
  good: 'bg-emerald-500',
  live: 'bg-indigo-500',
  warn: 'bg-amber-500',
  bad: 'bg-rose-500',
  neutral: 'bg-slate-400',
};

const BADGE_STYLES: Record<MetricStatusTone, string> = {
  good: 'bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/50',
  live: 'bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800/50',
  warn: 'bg-amber-50/90 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/50',
  bad: 'bg-rose-50/90 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/50',
  neutral: 'bg-slate-100/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-slate-200/70 dark:border-slate-700/70',
};

export const SummaryMetricGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const { uiThemeStyle } = useApp();
  const isPrototype = uiThemeStyle === 'prototype';

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 rounded-2xl shadow-xs overflow-hidden transition-colors ${
        isPrototype
          ? 'bg-[var(--surf)] border border-[var(--line)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--line)]'
          : 'border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-slate-800'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const SummaryMetricCard: React.FC<SummaryMetricCardProps> = ({
  title,
  primaryValue,
  subtitle,
  secondaryCaption,
  status = 'neutral',
  onClick,
  id,
}) => {
  const { uiThemeStyle } = useApp();
  const isPrototype = uiThemeStyle === 'prototype';

  const interactiveClasses = onClick
    ? isPrototype
      ? 'cursor-pointer hover:bg-[var(--surf2)] focus:outline-none text-left group'
      : 'cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500/30 text-left group'
    : '';

  const getBadgeStyle = () => {
    if (isPrototype) {
      if (status === 'good') return 'chip g';
      if (status === 'warn' || status === 'bad') return 'chip a';
      if (status === 'live') return 'chip b';
      return 'chip text-[var(--mut)] bg-[var(--surf2)] border border-[var(--line)]';
    }
    return `inline-block max-w-full truncate text-[11px] font-medium px-2 py-0.5 rounded-md border ${BADGE_STYLES[status]}`;
  };

  const content = (
    <>
      {/* Top Row: Title + Status Dot */}
      <div className="flex items-center justify-between gap-2 w-full">
        <span
          className={`text-xs font-medium truncate ${
            isPrototype ? 'text-[var(--mut)]' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {title}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {onClick && (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          )}
          <span className={`w-2 h-2 rounded-full ${DOT_STYLES[status]}`} />
        </div>
      </div>

      {/* Middle Row: Primary Value */}
      <div className="mt-2">
        <span
          className={`text-[19px] leading-snug font-bold tracking-tight whitespace-nowrap tabular-nums block ${
            isPrototype ? 'text-[var(--ink)]' : 'text-slate-900 dark:text-slate-100'
          }`}
        >
          {primaryValue}
        </span>
      </div>

      {/* Bottom Row: Clean Subtitle Badge + Optional Secondary Caption */}
      <div className="mt-2.5 flex flex-col items-start gap-1 w-full min-w-0">
        <span className={getBadgeStyle()} title={subtitle}>
          {subtitle}
        </span>
        {secondaryCaption && (
          <span
            className={`text-[10px] truncate max-w-full ${
              isPrototype ? 'text-[var(--mut)]' : 'text-slate-400 dark:text-slate-500'
            }`}
            title={secondaryCaption}
          >
            {secondaryCaption}
          </span>
        )}
      </div>
    </>
  );

  const baseClass = `h-full min-h-[112px] w-full flex flex-col justify-between p-4 bg-transparent transition-colors ${interactiveClasses}`;

  if (onClick) {
    return (
      <button id={id} type="button" onClick={onClick} className={baseClass}>
        {content}
      </button>
    );
  }

  return (
    <div id={id} className={baseClass}>
      {content}
    </div>
  );
};
