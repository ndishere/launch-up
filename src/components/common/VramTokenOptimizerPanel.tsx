import React from 'react';
import {
  Cpu,
  HardDrive,
  Sparkles,
  Layers,
  Terminal,
  TrendingDown,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateBlendedCostPer1MTokens } from '../../lib/custom-api-gateway';
import {
  computeTokenCompressionMetrics,
  getCavemanSystemPrompt,
} from '../../lib/token-compressor';
import type { CavemanAgentMode } from '../../types';

interface VramTokenOptimizerPanelProps {
  onApplyFinOpsSavings?: (savingsUsd: number, reductionPercent: number) => void;
  appliedFinOpsSavingsUsd?: number;
}

const CAVEMAN_MODES: Array<{ id: CavemanAgentMode; label: string; badge: string }> = [
  { id: 'off', label: 'Off', badge: '0%' },
  { id: 'lite', label: '/caveman lite', badge: '-18%' },
  { id: 'full', label: '/caveman full', badge: '-28%' },
  { id: 'ultra', label: '/caveman ultra', badge: '-36%' },
];

export const VramTokenOptimizerPanel: React.FC<VramTokenOptimizerPanelProps> = ({
  onApplyFinOpsSavings,
  appliedFinOpsSavingsUsd,
}) => {
  const {
    tokenOptimizer,
    updateTokenOptimizer,
    customApiProviders,
    agentModelAssignments,
  } = useApp();

  const blendedRate = calculateBlendedCostPer1MTokens(
    customApiProviders,
    agentModelAssignments
  );

  const summary = computeTokenCompressionMetrics({
    rawBaselineTokens: 185_000,
    optimizer: tokenOptimizer,
    blendedUsdPer1MTokens: blendedRate > 0 ? blendedRate : 6.5,
  });

  const vramPct = Math.min(
    100,
    Math.round((summary.estimatedVramGb / Math.max(1, tokenOptimizer.vramBudgetGb)) * 100)
  );

  return (
    <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-purple-500" />
              <span>RTX 3050 (6GB VRAM) Optimizer & 4-Layer Token Compression</span>
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold inline-flex items-center gap-1 ${
                summary.vramSafeForRtx3050
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
              }`}
            >
              {summary.vramSafeForRtx3050 ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <AlertTriangle className="w-3 h-3" />
              )}
              <span>
                {summary.estimatedVramGb.toFixed(2)} GB / {tokenOptimizer.vramBudgetGb}.0 GB VRAM
              </span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Combines Caveman semantic compression, Repomix AST skeletons, Graphify subgraphs & Golden Template delta cloning.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            MAX_CONCURRENT_LOCAL = {tokenOptimizer.sequentialSingleGpuQueue ? 1 : 3}
          </span>
          {onApplyFinOpsSavings && (
            <button
              type="button"
              onClick={() =>
                onApplyFinOpsSavings(summary.estimatedUsdSaved, summary.reductionPercent)
              }
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 transition-colors"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>
                {appliedFinOpsSavingsUsd && appliedFinOpsSavingsUsd > 0
                  ? `Synced ($${appliedFinOpsSavingsUsd.toFixed(2)})`
                  : `Apply $${summary.estimatedUsdSaved.toFixed(2)} to FinOps`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Live Token Savings Meter + VRAM Pressure Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 rounded-xl border border-indigo-200/70 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              <span>Live 4-Layer Token Savings Meter</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {summary.rawTokens.toLocaleString()} raw tokens →{' '}
              {summary.compressedTokens.toLocaleString()} compressed tokens •{' '}
              {summary.reductionPercent}% saved
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{
                width: `${Math.max(4, 100 - summary.reductionPercent)}%`,
              }}
              title="Retained compressed context tokens"
            />
            <div
              className="h-full bg-emerald-500/80 transition-all duration-300"
              style={{ width: `${summary.reductionPercent}%` }}
              title="Eliminated filler / boilerplate tokens"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <span>
              Boilerplate Delta Clone:{' '}
              <strong className="text-slate-900 dark:text-white">
                {summary.deltaBoilerplateClonedPercent}% @ $0 token cost
              </strong>
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              Est. FinOps Savings: ${summary.estimatedUsdSaved.toFixed(2)} / project run
            </span>
          </div>
        </div>

        <div className="lg:col-span-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-500" />
              <span>6GB VRAM Pressure</span>
            </span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
              {vramPct}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                summary.vramSafeForRtx3050 ? 'bg-purple-500' : 'bg-rose-500'
              }`}
              style={{ width: `${vramPct}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
            {summary.vramSafeForRtx3050
              ? 'Fits cleanly in 6GB RTX 3050 VRAM with zero CPU spillover bottleneck.'
              : 'Exceeds 6GB RTX 3050 VRAM — enable TurboQuant Q4_0 & Sequential Queue.'}
          </p>
        </div>
      </div>

      {/* Hardware & Compression Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            key: 'turboQuantKvCacheQ4' as const,
            title: 'TurboQuant / Q4_0 KV-Cache',
            desc: '4-bit quantized KV-cache saves ~1.4 GB VRAM across 32k context windows.',
            icon: HardDrive,
          },
          {
            key: 'sequentialSingleGpuQueue' as const,
            title: 'Sequential Single-GPU Queue',
            desc: 'Enforces MAX_CONCURRENT_LOCAL = 1 to avoid parallel OOM swaps.',
            icon: Layers,
          },
          {
            key: 'repomixAstSkeletonMode' as const,
            title: 'Repomix AST Skeleton Mode',
            desc: 'Packs signatures, interfaces & routes only (~70% context reduction).',
            icon: Terminal,
          },
          {
            key: 'goldenTemplateDeltaOnly' as const,
            title: 'Golden Template Delta-Only',
            desc: 'Clones 88% verified boilerplate free; sends 12% custom client delta to LLM.',
            icon: Sparkles,
          },
        ].map((toggle) => {
          const active = tokenOptimizer[toggle.key];
          const Icon = toggle.icon;
          return (
            <button
              key={toggle.key}
              type="button"
              onClick={() => updateTokenOptimizer({ [toggle.key]: !active })}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                active
                  ? 'border-indigo-500/80 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                  }`}
                />
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    active
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {active ? 'ON' : 'OFF'}
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {toggle.title}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {toggle.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Caveman Agent Output Mode Selector */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3.5 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Caveman Agent Output Mode (/caveman lite | full | ultra)
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              Injects terse output directive into Agent Swarm system prompt to cut response tokens 50%–65%.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {CAVEMAN_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => updateTokenOptimizer({ cavemanMode: m.id })}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-colors ${
                  tokenOptimizer.cavemanMode === m.id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                {m.label} ({m.badge})
              </button>
            ))}
          </div>
        </div>

        <div className="px-3 py-2 rounded-lg bg-[#0D111A] border border-slate-800 font-mono text-[11px] text-emerald-300">
          <span className="text-slate-400 mr-1.5">SYSTEM_RULE:</span>
          {getCavemanSystemPrompt(tokenOptimizer.cavemanMode)}
        </div>
      </div>
    </div>
  );
};
