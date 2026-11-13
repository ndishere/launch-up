import React from 'react';
import { 
  ShieldCheck, CheckCircle2, Lock, ExternalLink, Play, Eye, 
  FileText, Sparkles, FolderGit2, Cpu, Check, AlertTriangle, XCircle,
  TrendingUp, ArrowUpRight, Smartphone, Globe, MessageSquare, Layers
} from 'lucide-react';

export interface LegalShieldConfig {
  dpdpStatus?: 'Verified' | 'Pending' | 'Exempt';
  gdprStatus?: 'Verified' | 'Pending' | 'Exempt';
  ccpaStatus?: 'Verified' | 'Pending' | 'Exempt';
  playSafetyStatus?: 'Verified' | 'Pending' | 'Exempt';
  rlsSecurityStatus?: '100% Pass' | 'Scanning' | 'Attention';
}

export interface CostPortabilityConfig {
  baseReusedPercent?: number; // e.g. 88
  compressionActive?: boolean; // Caveman + Graphify
  estimatedAiCost?: string; // e.g. "₹18 / $0.22"
  profitMarginPercent?: number; // e.g. 99.4
  monthlyRevenue?: string; // e.g. "$2,500/mo"
  dockerBranchesStatus?: string; // "Docker + Git Branches Ready"
  localFolderPath?: string; // "d:/Projects/launch-up"
  portabilityNote?: string; // "Export/Pull Compatible with Claude Code & Codex"
}

export interface ApprovalBarConfig {
  decisionStatus?: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED';
  onApprove?: () => void;
  approveLabel?: string;
  onRequestChanges?: () => void;
  requestChangesLabel?: string;
  feedbackValue?: string;
  onFeedbackChange?: (val: string) => void;
  feedbackPlaceholder?: string;
  customButtons?: React.ReactNode;
}

export interface StandardContextInspectorProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeTone?: 'good' | 'warn' | 'bad' | 'live' | 'neutral';
  
  // Card 1: Overview & Visual Preview
  overview: {
    statusSummary: string;
    details?: string;
    clientName?: string;
    domainOrUrl?: string;
    previewUrl?: string;
    previewThumbnailLabel?: string;
    primaryActionLabel?: string;
    onPrimaryAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
    customPreview?: React.ReactNode;
  };

  // Card 2: Global Legal & Security Compliance Shield
  legalShield?: LegalShieldConfig;

  // Card 3: Cost Intelligence & Portability Passport
  costPortability?: CostPortabilityConfig;

  // Card 4: Sticky Bottom Approval & Maintenance Action Bar
  approvalBar?: ApprovalBarConfig;
}

export const StandardContextInspector: React.FC<StandardContextInspectorProps> = ({
  title,
  subtitle,
  badge = 'Active Context',
  badgeTone = 'live',
  overview,
  legalShield = {
    dpdpStatus: 'Verified',
    gdprStatus: 'Verified',
    ccpaStatus: 'Verified',
    playSafetyStatus: 'Verified',
    rlsSecurityStatus: '100% Pass',
  },
  costPortability = {
    baseReusedPercent: 88,
    compressionActive: true,
    estimatedAiCost: '₹18 / $0.22',
    profitMarginPercent: 99.4,
    monthlyRevenue: '$2,500/mo',
    dockerBranchesStatus: 'Docker + Git Branches Ready',
    localFolderPath: 'd:/Projects/launch-up',
    portabilityNote: 'Export/Pull Compatible with Claude Code & Codex',
  },
  approvalBar,
}) => {
  return (
    <div className="space-y-4 text-xs">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* CARD 1: OVERVIEW & VISUAL PREVIEW                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
              badgeTone === 'good'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : badgeTone === 'warn'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : badgeTone === 'bad'
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
            }`}
          >
            {badge}
          </span>
          {overview.domainOrUrl && (
            <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 truncate max-w-[170px]">
              {overview.domainOrUrl}
            </span>
          )}
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {title}
          </h4>
          {subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
          {overview.statusSummary}
        </p>

        {overview.details && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            {overview.details}
          </p>
        )}

        {/* Visual Preview Box / Interactive Thumbnail */}
        {overview.previewUrl && (
          <div className="p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
                {overview.previewThumbnailLabel || 'Live Multi-Viewport Preview'}
              </span>
              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                {overview.previewUrl}
              </span>
            </div>
            <a
              href={overview.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 shrink-0"
              title="Open preview in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {overview.customPreview}

        {/* Quick Launch Buttons */}
        {(overview.primaryActionLabel || overview.secondaryActionLabel) && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            {overview.primaryActionLabel && (
              <button
                type="button"
                onClick={overview.onPrimaryAction}
                className="py-1.5 px-3 rounded-lg text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{overview.primaryActionLabel}</span>
              </button>
            )}
            {overview.secondaryActionLabel && (
              <button
                type="button"
                onClick={overview.onSecondaryAction}
                className="py-1.5 px-3 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3 h-3 text-indigo-500" />
                <span>{overview.secondaryActionLabel}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CARD 2: GLOBAL LEGAL & SECURITY COMPLIANCE SHIELD             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Global Legal & Security Shield</span>
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800">
            Automated
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between p-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[11px] text-slate-600 dark:text-slate-300">India DPDP Act & CERT-In Logs</span>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-3 h-3" /> {legalShield.dpdpStatus || 'Verified'}
            </span>
          </div>

          <div className="flex items-center justify-between p-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[11px] text-slate-600 dark:text-slate-300">EU/UK GDPR, Cookies & AI Act</span>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-3 h-3" /> {legalShield.gdprStatus || 'Verified'}
            </span>
          </div>

          <div className="flex items-center justify-between p-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[11px] text-slate-600 dark:text-slate-300">US CCPA & WhatsApp 24h Opt-In</span>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-3 h-3" /> {legalShield.ccpaStatus || 'Verified'}
            </span>
          </div>

          <div className="flex items-center justify-between p-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[11px] text-slate-600 dark:text-slate-300">Play Data Safety & Deletion Screen</span>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-3 h-3" /> {legalShield.playSafetyStatus || 'Verified'}
            </span>
          </div>

          <div className="flex items-center justify-between p-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[11px] text-slate-600 dark:text-slate-300">Data Isolation (RLS) & CVE Audit</span>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-3 h-3" /> {legalShield.rlsSecurityStatus || '100% Pass'}
            </span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CARD 3: COST INTELLIGENCE & PORTABILITY PASSPORT               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>Cost & Portability Passport</span>
          </span>
          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800">
            {costPortability.profitMarginPercent ?? 99.4}% Margin
          </span>
        </div>

        <div className="space-y-2 text-[11px]">
          {/* Template & Token Savings */}
          <div className="p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50">
            <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
              <span>{costPortability.baseReusedPercent ?? 88}% Base Template Reused</span>
              <span className="text-[10px]">Caveman + Graphify</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mt-1">
              <span>Est. AI Token Cost:</span>
              <strong className="text-slate-900 dark:text-slate-100 font-mono">
                {costPortability.estimatedAiCost || '₹18 / $0.22'}
              </strong>
            </div>
          </div>

          {/* 100% Portability Specs */}
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
              <FolderGit2 className="w-3 h-3 text-indigo-500" />
              <span>{costPortability.dockerBranchesStatus || 'Docker + Git Branches Ready'}</span>
            </div>
            <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate">
              Path: {costPortability.localFolderPath || 'd:/Projects/launch-up'}
            </div>
            <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
              ✓ {costPortability.portabilityNote || '100% Export/Pull Compatible with Claude Code & Codex'}
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CARD 4: STICKY BOTTOM APPROVAL & MAINTENANCE ACTION BAR        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {approvalBar && (
        <div className="p-3.5 rounded-xl border border-indigo-200/80 dark:border-indigo-800/80 bg-gradient-to-b from-white to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Decision & Maintenance Gate</span>
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                approvalBar.decisionStatus === 'APPROVED'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                  : approvalBar.decisionStatus === 'CHANGES_REQUESTED'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200'
              }`}
            >
              {approvalBar.decisionStatus || 'PENDING'}
            </span>
          </div>

          {/* Feedback Textarea if requested changes supported */}
          {approvalBar.onFeedbackChange && (
            <textarea
              value={approvalBar.feedbackValue || ''}
              onChange={(e) => approvalBar.onFeedbackChange?.(e.target.value)}
              placeholder={approvalBar.feedbackPlaceholder || 'Add maintenance or revision instruction...'}
              className="w-full p-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 resize-none h-14"
            />
          )}

          {/* Pinned Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={approvalBar.onApprove}
              className="py-2 px-3 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{approvalBar.approveLabel || 'Approve & Continue'}</span>
            </button>

            {approvalBar.onRequestChanges && (
              <button
                type="button"
                onClick={approvalBar.onRequestChanges}
                className="py-2 px-3 rounded-lg text-xs font-semibold border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>{approvalBar.requestChangesLabel || 'Request Changes'}</span>
              </button>
            )}
          </div>

          {approvalBar.customButtons}
        </div>
      )}
    </div>
  );
};
