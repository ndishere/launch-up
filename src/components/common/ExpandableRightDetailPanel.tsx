import React from 'react';
import { PanelRightClose, PanelRightOpen, X, ChevronRight, Info } from 'lucide-react';

export interface ExpandableRightDetailPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeTone?: 'good' | 'warn' | 'live' | 'neutral';
  children: React.ReactNode;
  widthClass?: string;
  className?: string;
}

export const ExpandableRightDetailPanel: React.FC<ExpandableRightDetailPanelProps> = ({
  isOpen,
  onToggle,
  title,
  subtitle,
  badge,
  badgeTone = 'neutral',
  children,
  widthClass = 'lg:w-[360px] xl:w-[390px]',
  className = '',
}) => {
  const getBadgeStyle = () => {
    switch (badgeTone) {
      case 'good':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800';
      case 'warn':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800';
      case 'live':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <aside
      className={`transition-all duration-200 shrink-0 w-full ${
        isOpen ? widthClass : 'lg:w-12'
      } ${className}`}
      aria-label="Contextual detail panel"
    >
      {isOpen ? (
        <div className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/95 shadow-xs overflow-hidden transition-colors">
          {/* Panel Header */}
          <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 truncate">
                  {title}
                </h3>
                {badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-semibold rounded border ${getBadgeStyle()}`}
                  >
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={onToggle}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Collapse details panel (full-width view)"
                aria-label="Collapse details panel"
              >
                <span>Collapse</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Panel Body */}
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-230px)] space-y-4 text-xs">
            {children}
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-col items-center">
          <button
            type="button"
            onClick={onToggle}
            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all flex flex-col items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer"
            title="Expand contextual details panel"
            aria-label="Expand contextual details panel"
          >
            <PanelRightOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 [writing-mode:vertical-rl] rotate-180">
              Details
            </span>
          </button>
        </div>
      )}
    </aside>
  );
};

export const ExpandableDetailToggleButton: React.FC<{
  isOpen: boolean;
  onToggle: () => void;
  label?: string;
  className?: string;
}> = ({ isOpen, onToggle, label = 'Details', className = '' }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
        isOpen
          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800'
          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
      } ${className}`}
      title={isOpen ? 'Collapse right details panel' : 'Expand right details panel'}
      aria-label="Toggle details panel"
    >
      {isOpen ? (
        <PanelRightClose className="w-3.5 h-3.5" />
      ) : (
        <PanelRightOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
      )}
      <span>{label}</span>
    </button>
  );
};
