import React, { useState } from 'react';
import { PanelRightClose, PanelRightOpen, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface ThreeZoneScreenLayoutProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  headerActions?: React.ReactNode;
  summaryMetrics: React.ReactNode;
  children: React.ReactNode;
  sidePanelContent?: React.ReactNode;
  sidePanelTitle?: string;
  sidePanelSubtitle?: string;
  isSidePanelOpen?: boolean;
  onToggleSidePanel?: () => void;
  className?: string;
}

export const ThreeZoneScreenLayout: React.FC<ThreeZoneScreenLayoutProps> = ({
  title,
  subtitle,
  badge,
  headerActions,
  summaryMetrics,
  children,
  sidePanelContent,
  sidePanelTitle = 'Details & Actions',
  sidePanelSubtitle,
  isSidePanelOpen: externalIsOpen,
  onToggleSidePanel: externalOnToggle,
  className = '',
}) => {
  const { uiThemeStyle } = useApp();
  const isPrototype = uiThemeStyle === 'prototype';

  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const toggleOpen = externalOnToggle || (() => setInternalIsOpen((prev) => !prev));

  return (
    <div className={`space-y-5 pb-12 animate-in fade-in duration-150 ${className}`}>
      {/* Action Toolbar & Badge (Tab Heading & Subtitle are displayed in Global Top Header) */}
      {(headerActions || badge) && (
        <div className="flex items-center justify-between gap-2 flex-wrap pb-0.5">
          {badge ? (
            <span
              className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border inline-flex items-center gap-1.5 ${
                isPrototype
                  ? 'chip g'
                  : 'bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {badge}
            </span>
          ) : (
            <div />
          )}

          {headerActions && (
            <div className="flex items-center gap-2 shrink-0 flex-wrap ml-auto">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Section 1: Top Unified 5-Cell Summary Metric Bar */}
      <div className="w-full">
        {summaryMetrics}
      </div>

      {/* Row 2: Two-Column Section (Column 1: Main Content, Column 2: Dynamic Info Panel) */}
      <div className="flex flex-col lg:flex-row items-start gap-5 w-full min-w-0">
        {/* Section 2: Main Content Area (Column 1) */}
        <div className="flex-1 min-w-0 w-full space-y-5">
          {children}
        </div>

        {/* Section 3: Expandable / Collapsible Dynamic Info Panel (Column 2) */}
        {sidePanelContent && (
          <div
            className={`transition-all duration-200 w-full lg:w-auto shrink-0 ${
              isOpen ? 'lg:w-[360px] xl:w-[390px]' : 'lg:w-12'
            }`}
          >
            {isOpen ? (
              <div
                className={`w-full rounded-2xl border shadow-xs overflow-hidden transition-colors ${
                  isPrototype
                    ? 'bg-[var(--surf)] border-[var(--line)] text-[var(--ink)]'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Panel Header */}
                <div
                  className={`px-4 py-3 border-b flex items-center justify-between gap-2 ${
                    isPrototype
                      ? 'border-[var(--line)] bg-[var(--surf2)]'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`text-xs font-bold uppercase tracking-wider truncate ${
                        isPrototype ? 'text-[var(--ink)]' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {sidePanelTitle}
                    </h3>
                    {sidePanelSubtitle && (
                      <p
                        className={`text-[11px] truncate mt-0.5 ${
                          isPrototype ? 'text-[var(--mut)]' : 'text-slate-400'
                        }`}
                      >
                        {sidePanelSubtitle}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={toggleOpen}
                    className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
                    title="Collapse Info Panel"
                    aria-label="Collapse Info Panel"
                  >
                    <PanelRightClose className="w-4 h-4" />
                  </button>
                </div>

                {/* Panel Body */}
                <div className="p-4 overflow-y-auto max-h-[calc(100vh-240px)]">
                  {sidePanelContent}
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex flex-col items-center">
                <button
                  onClick={toggleOpen}
                  className={`p-3 rounded-2xl border shadow-xs transition-all flex flex-col items-center gap-2 ${
                    isPrototype
                      ? 'bg-[var(--surf)] border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surf2)]'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  title="Expand Info Panel"
                  aria-label="Expand Info Panel"
                >
                  <PanelRightOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 [writing-mode:vertical-rl] rotate-180">
                    Details
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
