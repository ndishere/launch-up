import React, { useState } from 'react';
import { ExpandableRightDetailPanel } from '../common/ExpandableRightDetailPanel';

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
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const toggleOpen = externalOnToggle || (() => setInternalIsOpen((prev) => !prev));

  return (
    <div className={`space-y-5 pb-12 animate-in fade-in duration-150 ${className}`}>
      {/* Action Toolbar & Badge (Tab Heading & Subtitle are displayed in Global Top Header) */}
      {(headerActions || badge) && (
        <div className="flex items-center justify-between gap-2 flex-wrap pb-0.5">
          {badge ? (
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md border inline-flex items-center gap-1.5 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/50">
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

        {/* Section 3: Expandable / Collapsible Right Detail Panel (Column 2) */}
        {sidePanelContent && (
          <ExpandableRightDetailPanel
            isOpen={isOpen}
            onToggle={toggleOpen}
            title={sidePanelTitle}
            subtitle={sidePanelSubtitle}
          >
            {sidePanelContent}
          </ExpandableRightDetailPanel>
        )}
      </div>
    </div>
  );
};
