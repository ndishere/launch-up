import React, { useState, useMemo } from 'react';
import {
  Lock,
  Unlock,
  GitFork,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Search,
  Layers,
} from 'lucide-react';
import {
  buildGraphifyImpactAnalysis,
  evaluatePreChangeEditGuard,
} from '../../lib/graphify-impact';
import type {
  GoldenTemplateManifest,
  Project,
  ProjectLaunchupManifest,
} from '../../types';

interface GraphifyImpactAnalyzerPanelProps {
  template?: GoldenTemplateManifest | null;
  project?: Project | null;
  manifest?: ProjectLaunchupManifest | null;
  title?: string;
}

export const GraphifyImpactAnalyzerPanel: React.FC<GraphifyImpactAnalyzerPanelProps> = ({
  template,
  project,
  manifest,
  title = 'Graphify Pre-Change Impact Analyzer',
}) => {
  const analysis = useMemo(
    () => buildGraphifyImpactAnalysis({ template, project, manifest }),
    [template, project, manifest]
  );

  const [probeFilePath, setProbeFilePath] = useState(
    () => analysis.lockedFiles[0] || analysis.slotsMutableFiles[0] || ''
  );

  const guardResult = useMemo(
    () =>
      evaluatePreChangeEditGuard(
        probeFilePath || analysis.slotsMutableFiles[0] || '',
        analysis
      ),
    [probeFilePath, analysis]
  );

  return (
    <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <GitFork className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {title} — {analysis.targetName}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              {analysis.zeroTokenCostCoveragePercent}% Core Locked ($0 Token Cost)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Inspect immutable core files, mutable slot boundaries, and Graphify dependency blast radius before dispatching coding agents.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className="text-slate-400">Edit Guard Test:</span>
          <select
            value={probeFilePath}
            onChange={(e) => setProbeFilePath(e.target.value)}
            className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 max-w-[240px]"
          >
            {[
              ...analysis.lockedFiles,
              ...analysis.slotsMutableFiles,
              ...analysis.uiLayerFiles,
            ].map((file) => (
              <option key={file} value={file}>
                {file}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Visual Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: What We Already Have (core-locked - 0 Token Cost) */}
        <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>1. What We Already Have</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              0 Token Cost
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            <code>core-locked/</code> — Cloned deterministically. Edits blocked to prevent regression & token waste.
          </p>
          <div className="space-y-1.5 pt-1">
            {analysis.coreLockedFiles.map((file) => (
              <button
                key={file}
                type="button"
                onClick={() => setProbeFilePath(file)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-[11px] font-mono flex items-center justify-between gap-2 transition-colors ${
                  probeFilePath === file
                    ? 'border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                    : 'border-emerald-200/60 dark:border-emerald-800/40 bg-white/70 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                }`}
              >
                <span className="truncate">{file}</span>
                <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Column 2: What Agents Can Change (slots-mutable & ui-layer) */}
        <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
              <Unlock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>2. What Agents Can Change</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
              12% Delta Only
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            <code>slots-mutable/</code> &amp; <code>ui-layer/</code> — Safe SQL schemas, API slots &amp; brand tokens.
          </p>
          <div className="space-y-1.5 pt-1">
            {analysis.slotsMutableFiles.map((file) => (
              <button
                key={file}
                type="button"
                onClick={() => setProbeFilePath(file)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-[11px] font-mono flex items-center justify-between gap-2 transition-colors ${
                  probeFilePath === file
                    ? 'border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                    : 'border-indigo-200/60 dark:border-indigo-800/40 bg-white/70 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                }`}
              >
                <span className="truncate">{file}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 shrink-0">
                  SLOT
                </span>
              </button>
            ))}
            {analysis.uiLayerFiles.map((file) => (
              <button
                key={file}
                type="button"
                onClick={() => setProbeFilePath(file)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-[11px] font-mono flex items-center justify-between gap-2 transition-colors ${
                  probeFilePath === file
                    ? 'border-purple-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                    : 'border-purple-200/60 dark:border-purple-800/40 bg-white/70 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-purple-400'
                }`}
              >
                <span className="truncate">{file}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 shrink-0">
                  UI
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Column 3: Graphify Blast-Radius & Impact Preview */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>3. Graphify Blast-Radius</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              AST Trace
            </span>
          </div>

          <div className="space-y-1.5">
            {analysis.blastRadiusChain.map((node, index) => (
              <div key={node.id} className="flex items-center gap-2 text-[11px] font-mono">
                <span
                  className={`px-2 py-1 rounded-md border flex-1 truncate ${
                    node.locked
                      ? 'border-amber-300/80 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200'
                      : 'border-indigo-300/80 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-200'
                  }`}
                >
                  {node.role} → {node.filePath}
                </span>
                {index < analysis.blastRadiusChain.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Pre-Change File Guard Status */}
          <div
            className={`p-2.5 rounded-lg border text-[11px] space-y-1 ${
              guardResult.allowed
                ? 'border-emerald-300/80 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200'
                : 'border-rose-300/80 dark:border-rose-800/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              {guardResult.allowed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              )}
              <span>
                {guardResult.allowed
                  ? `Editable (${guardResult.layer})`
                  : 'Blocked Edit (core-locked Protection)'}
              </span>
            </div>
            <p className="text-[10px] leading-relaxed">{guardResult.reason}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
