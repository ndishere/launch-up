import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  PieChart,
  Users,
  RefreshCw,
} from 'lucide-react';
import type { Client, ProjectFinOpsState } from '../../types';
import {
  calculateProjectUnitEconomics,
  FinOpsCalculatedSummary,
} from './workspaceDefaults.ts';
import {
  computeClientBillingAttribution,
  computeEstimatedVsActualBreakdown,
} from '../../lib/unit-economics.ts';

interface UnitEconomicsProfitabilityCardProps {
  finops: ProjectFinOpsState;
  summary?: FinOpsCalculatedSummary;
  linkedClients?: Client[];
  verifyingMod10?: boolean;
  onVerifyMod10Budget?: () => void;
}

export const UnitEconomicsProfitabilityCard: React.FC<UnitEconomicsProfitabilityCardProps> = ({
  finops,
  summary: providedSummary,
  linkedClients = [],
  verifyingMod10 = false,
  onVerifyMod10Budget,
}) => {
  const summary = providedSummary ?? calculateProjectUnitEconomics(finops);
  const breakdownRows = computeEstimatedVsActualBreakdown(finops);
  const billingShares = computeClientBillingAttribution(
    finops.clientContractValueUsd,
    summary.grossProfitUsd,
    linkedClients
  );

  const revenueDenominator = Math.max(finops.clientContractValueUsd, 1);
  const costBarPercent = Math.min(
    100,
    Number(((summary.totalActualCost / revenueDenominator) * 100).toFixed(1))
  );
  const profitBarPercent = Math.max(0, Number((100 - costBarPercent).toFixed(1)));

  const mod10Check = finops.lastMod10Check;
  const activeTier = mod10Check?.budget_tier_fallback ?? summary.mod10BudgetTierFallback;
  const activeRemaining = mod10Check?.remaining_budget_usd ?? summary.mod10RemainingBudgetUsd;
  const isAuthorized = mod10Check ? mod10Check.authorized : summary.mod10Authorized;

  return (
    <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-5">
      {/* Header + MOD-10 FinOps Sync */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-indigo-500" />
            Automated Unit Economics & Profitability Dashboard
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time Estimated vs. Actual expense variance, Gross Revenue vs. Net Profit, and MOD-10 token caps
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 ${
              isAuthorized
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
            }`}
          >
            {isAuthorized ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            <span>
              {isAuthorized
                ? `MOD-10 ${activeTier} · $${activeRemaining.toFixed(2)} cap left`
                : 'ERR_BUDGET_EXCEEDED'}
            </span>
          </span>

          {onVerifyMod10Budget && (
            <button
              type="button"
              disabled={verifyingMod10}
              onClick={onVerifyMod10Budget}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${verifyingMod10 ? 'animate-spin' : ''}`} />
              <span>{verifyingMod10 ? 'Verifying...' : 'Verify MOD-10 Budget'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Profitability & Variance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Gross Revenue vs Net Profit Formula & M:N Attribution (5 cols) */}
        <div className="lg:col-span-5 space-y-4 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gross Revenue vs. Net Profit
            </span>
            <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono font-semibold">
              ROI: {summary.roiPercent}%
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400">Gross Revenue (Contract)</span>
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                ${finops.clientContractValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400">Less: Total Actual Cost</span>
              <span className="text-sm font-semibold font-mono text-rose-600 dark:text-rose-400">
                -${summary.totalActualCost.toFixed(2)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Net Profit ({summary.profitMarginPercent}%)
              </span>
              <span
                className={`text-base font-bold font-mono ${
                  summary.grossProfitUsd >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                ${summary.grossProfitUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Stacked Revenue vs Cost Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
              <div
                className="h-full bg-rose-500 transition-all"
                style={{ width: `${costBarPercent}%` }}
                title={`Actual Cost Share: ${costBarPercent}%`}
              />
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${profitBarPercent}%` }}
                title={`Net Profit Margin: ${profitBarPercent}%`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span>Cost: {costBarPercent}%</span>
              <span>Formula: (Rev − Cost) / Rev = {summary.profitMarginPercent}%</span>
            </div>
          </div>

          {/* M:N Client Billing Share Attribution */}
          <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>M:N Stakeholder Revenue & Profit Split</span>
            </div>
            <div className="space-y-1">
              {billingShares.map((share) => (
                <div
                  key={share.clientId}
                  className="flex items-center justify-between text-[11px] px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-200 truncate pr-2">
                    {share.clientName}{' '}
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({share.sharePercent}%)
                    </span>
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
                    +${share.attributedProfitUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })} net
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Estimated vs Actual Expenses Breakdown Table (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
              Estimated vs. Actual Expense Breakdown
            </span>
            <span
              className={`text-[11px] font-mono font-semibold ${
                summary.costVarianceUsd <= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              Total Variance: {summary.costVarianceUsd > 0 ? '+' : ''}
              ${summary.costVarianceUsd.toFixed(2)} vs Est
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                  <th className="py-2.5 px-3 font-semibold">Cost Pillar</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Estimated</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actual</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Variance</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {breakdownRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{row.label}</div>
                      <div className="text-[10px] font-mono text-slate-400">{row.unitSummary}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                      ${row.estimatedUsd.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                      ${row.actualUsd.toFixed(2)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono font-semibold ${
                        row.varianceUsd <= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {row.varianceUsd > 0 ? '+' : ''}
                      ${row.varianceUsd.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                      {row.shareOfActualPercent}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 font-bold">
                  <td className="py-2.5 px-3 text-slate-900 dark:text-white">Total Project Spend</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    ${summary.totalEstimatedCost.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-900 dark:text-white">
                    ${summary.totalActualCost.toFixed(2)}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono ${
                      summary.costVarianceUsd <= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {summary.costVarianceUsd > 0 ? '+' : ''}
                    ${summary.costVarianceUsd.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    100%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* MOD-10 Budget Utilization Bar */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                MOD-10 Monthly LLM Cap Utilization
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-400">
                ${finops.actualLlmSpendUsd.toFixed(2)} / ${finops.llmTokenBudgetUsd.toFixed(2)} (
                {summary.mod10BudgetUtilizationPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  !isAuthorized
                    ? 'bg-rose-500'
                    : activeTier === 'TIER_3'
                    ? 'bg-amber-500'
                    : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, summary.mod10BudgetUtilizationPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
