import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  GitBranch,
  Box,
  ArrowUpRight,
  Copy,
  Check,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  GitCommit,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import {
  Client,
  GitStageBranchName,
  Project,
  ProjectFinOpsExpense,
  ProjectFinOpsState,
  ProjectGitBranchNode,
} from '../../types';
import { calculateProjectUnitEconomics } from './workspaceDefaults';
import {
  SAMPLE_UNSAFE_TEMPLATE_SNIPPET,
  sanitizeCodeSnippet,
} from '../../lib/code-sanitizer.ts';
import { matchTemplates } from '../../lib/template-matcher.ts';
import {
  generateGitDockerCliCommands,
  generateProjectComposeYaml,
  generateProjectDockerfile,
  type GitDockerActionType,
} from '../../lib/git-docker-manager.ts';
import { UnitEconomicsProfitabilityCard } from './UnitEconomicsProfitabilityCard';

interface FinOpsUnitEconomicsViewProps {
  finops: ProjectFinOpsState;
  prdText?: string;
  projectType?: Project['type'];
  linkedClients?: Client[];
  verifyingMod10?: boolean;
  onUpdateFinOps: (patch: Partial<ProjectFinOpsState>) => void;
  onAddExpense: (expense: Omit<ProjectFinOpsExpense, 'id' | 'date'>) => void;
  onRemoveExpense: (expenseId: string) => void;
  onRunTemplateMatch?: () => void;
  onRunSanitizer?: (rawSnippet: string) => void;
  onVerifyMod10Budget?: () => void;
}

export const FinOpsUnitEconomicsView: React.FC<FinOpsUnitEconomicsViewProps> = ({
  finops,
  prdText = '',
  projectType,
  linkedClients = [],
  verifyingMod10 = false,
  onUpdateFinOps,
  onAddExpense,
  onRemoveExpense,
  onRunTemplateMatch,
  onRunSanitizer,
  onVerifyMod10Budget,
}) => {
  const [category, setCategory] = useState<ProjectFinOpsExpense['category']>('Cloud Compute');
  const [description, setDescription] = useState('');
  const [amountUsd, setAmountUsd] = useState('');
  const [snippetInput, setSnippetInput] = useState(SAMPLE_UNSAFE_TEMPLATE_SNIPPET);
  const [showSanitizedOutput, setShowSanitizedOutput] = useState(false);
  const [copiedSanitized, setCopiedSanitized] = useState(false);

  const activeTemplateMatch =
    finops.templateMatchResults ?? matchTemplates(prdText, projectType);
  const activeSanitization =
    finops.lastSanitizationResult ?? sanitizeCodeSnippet(snippetInput);

  const summary = calculateProjectUnitEconomics({
    ...finops,
    reusabilityPercent:
      finops.reusabilityPercent ?? activeTemplateMatch.totalReusabilityPercent,
    reusabilityTokenSavingsUsd:
      finops.reusabilityTokenSavingsUsd ??
      activeTemplateMatch.totalEstimatedSavingsUsd,
  });

  const handleRunSanitizerClick = () => {
    if (onRunSanitizer) {
      onRunSanitizer(snippetInput);
    } else {
      const result = sanitizeCodeSnippet(snippetInput);
      onUpdateFinOps({ lastSanitizationResult: result });
    }
    setShowSanitizedOutput(true);
  };

  const handleRunMatcherClick = () => {
    if (onRunTemplateMatch) {
      onRunTemplateMatch();
    } else {
      const matched = matchTemplates(prdText, projectType);
      onUpdateFinOps({
        reusabilityPercent: matched.totalReusabilityPercent,
        reusabilityTokenSavingsUsd: matched.totalEstimatedSavingsUsd,
        templateMatchResults: matched,
      });
    }
  };

  const handleCopySanitized = () => {
    navigator.clipboard.writeText(activeSanitization.sanitizedCode);
    setCopiedSanitized(true);
    setTimeout(() => setCopiedSanitized(false), 1800);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amountUsd);
    if (!description.trim() || Number.isNaN(num) || num <= 0) return;
    onAddExpense({
      category,
      description: description.trim(),
      amountUsd: num,
    });
    setDescription('');
    setAmountUsd('');
  };

  return (
    <div className="space-y-5">
      {/* Live Profit & Margin Readout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-4">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Client Contract Value
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            ${finops.clientContractValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            M:N Linked Retainer Revenue
          </span>
        </div>

        <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-4">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Estimated vs Actual Cost
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            ${summary.totalActualCost.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">
              / ${summary.totalEstimatedCost.toFixed(2)} est
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            LLM + Container + Compute + Manual
          </span>
        </div>

        <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-4">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Net Gross Profit
          </span>
          <div
            className={`text-xl font-bold mt-1 ${
              summary.grossProfitUsd >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            ${summary.grossProfitUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Contract Minus Actual Spend
          </span>
        </div>

        <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-4">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Gross Margin %</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          </span>
          <div
            className={`text-xl font-bold mt-1 ${
              summary.profitMarginPercent >= 60
                ? 'text-emerald-600 dark:text-emerald-400'
                : summary.profitMarginPercent >= 25
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {summary.profitMarginPercent}%
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
            {summary.profitMarginPercent >= 60 ? 'Healthy Agency Margin' : 'Monitor Unit Cost'}
          </span>
        </div>
      </div>

      {/* Sprint 3: Automated Unit Economics & Profitability Dashboard */}
      <UnitEconomicsProfitabilityCard
        finops={finops}
        summary={summary}
        linkedClients={linkedClients}
        verifyingMod10={verifyingMod10}
        onVerifyMod10Budget={onVerifyMod10Budget}
      />

      {/* Inputs & Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Resource & Rate Calculator (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-indigo-500" />
              Automated Cost & Contract Parameters
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Live Formula Sync</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Client Contract Value ($)
              </label>
              <input
                type="number"
                min={0}
                step="50"
                value={finops.clientContractValueUsd}
                onChange={(e) =>
                  onUpdateFinOps({ clientContractValueUsd: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                MOD-10 LLM Token Cap ($)
              </label>
              <input
                type="number"
                min={1}
                step="1"
                value={finops.llmTokenBudgetUsd}
                onChange={(e) =>
                  onUpdateFinOps({ llmTokenBudgetUsd: Math.max(1, Number(e.target.value)) })
                }
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Estimated LLM Expense ($)
              </label>
              <input
                type="number"
                min={0}
                step="0.25"
                value={finops.estimatedLlmSpendUsd}
                onChange={(e) =>
                  onUpdateFinOps({ estimatedLlmSpendUsd: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Actual LLM Spend ($)
              </label>
              <input
                type="number"
                min={0}
                step="0.10"
                value={finops.actualLlmSpendUsd}
                onChange={(e) =>
                  onUpdateFinOps({ actualLlmSpendUsd: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Container Hosting Hours (${finops.containerRatePerHourUsd}/hr)
              </label>
              <input
                type="number"
                min={0}
                step="0.5"
                value={finops.containerHours}
                onChange={(e) =>
                  onUpdateFinOps({ containerHours: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Agent Compute Minutes (${finops.agentComputeRatePerMinUsd}/min)
              </label>
              <input
                type="number"
                min={0}
                step="1"
                value={finops.agentComputeMinutes}
                onChange={(e) =>
                  onUpdateFinOps({ agentComputeMinutes: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>LLM Tokens (Actual)</span>
              <span className="font-mono text-slate-900 dark:text-slate-200">${summary.actualLlmCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Docker Container Hosting</span>
              <span className="font-mono text-slate-900 dark:text-slate-200">${summary.containerCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Swarm Agent Compute</span>
              <span className="font-mono text-slate-900 dark:text-slate-200">${summary.agentComputeCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Manual Expenses ({finops.manualExpenses.length})</span>
              <span className="font-mono text-slate-900 dark:text-slate-200">${summary.manualExpensesTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium pt-1 border-t border-slate-100 dark:border-slate-800/70">
              <span>Smart Reusability Savings ({summary.reusabilityPercent}% Reused)</span>
              <span className="font-mono">-${summary.reusabilitySavingsUsd.toFixed(2)} saved</span>
            </div>
          </div>
        </div>

        {/* Manual Expense Entry & Ledger (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Manual Project Expenses Ledger
            </h4>

            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectFinOpsExpense['category'])}
                className="sm:col-span-4 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="Cloud Compute">Cloud Compute</option>
                <option value="API Quota">API Quota</option>
                <option value="Tooling">Tooling</option>
                <option value="Domain & SSL">Domain & SSL</option>
                <option value="Contractor">Contractor</option>
                <option value="Other">Other</option>
              </select>

              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Expense description..."
                className="sm:col-span-5 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />

              <div className="sm:col-span-3 flex gap-1.5">
                <input
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={amountUsd}
                  onChange={(e) => setAmountUsd(e.target.value)}
                  placeholder="$0.00"
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shrink-0"
                  title="Add Expense"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/70 max-h-56 overflow-y-auto">
              {finops.manualExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="py-2.5 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {exp.category}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {exp.description}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{exp.date}</span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      ${exp.amountUsd.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveExpense(exp.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {finops.manualExpenses.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-400">
                  No manual expenses logged yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sprint 2: Smart Reusability & Code Sanitizer Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Smart Template Matcher & Token Savings (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Smart Template Matcher & Token Savings
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Matches PRD capabilities against golden templates & sanitized components
              </p>
            </div>
            <button
              type="button"
              onClick={handleRunMatcherClick}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Match Templates</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50">
              <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300 block">
                Reusability Rate
              </span>
              <span className="text-base font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                {summary.reusabilityPercent}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/50">
              <span className="text-[10px] font-medium text-indigo-700 dark:text-indigo-300 block">
                Token Cost Saved
              </span>
              <span className="text-base font-bold text-indigo-700 dark:text-indigo-300 font-mono">
                ${summary.reusabilitySavingsUsd.toFixed(2)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">
                Tokens Avoided
              </span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono">
                {(activeTemplateMatch.totalTokensSaved / 1000).toFixed(0)}k
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800">
            <span>
              Baseline LLM Estimate without reuse:{' '}
              <strong className="font-mono text-slate-800 dark:text-slate-200">
                ${summary.grossLlmCostWithoutReuseUsd.toFixed(2)}
              </strong>
            </span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              -{summary.effectiveCostReductionPercent}% LLM Spend
            </span>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {activeTemplateMatch.matches.map((match) => (
              <div
                key={match.templateId}
                className="p-3 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {match.templateName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
                        {match.templateId}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {match.reusableComponents.map((comp) => (
                        <span
                          key={comp}
                          className="px-1.5 py-0.5 text-[10px] rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 block">
                      -${match.estimatedTokenSavingsUsd.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {match.matchScore}% match
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${match.matchScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Sanitizer Engine (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                {activeSanitization.isSafe ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                )}
                Code Sanitizer Engine (Pre-Reuse Gate)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Scrubs PII, secrets/URIs & rigid UI tokens before agent assembly
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSnippetInput(SAMPLE_UNSAFE_TEMPLATE_SNIPPET);
                  setShowSanitizedOutput(false);
                }}
                className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Sample
              </button>
              <button
                type="button"
                onClick={handleRunSanitizerClick}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold inline-flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Run Sanitizer</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium">
                PII Scrubbed: {activeSanitization.countsByCategory.pii}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium">
                Secrets Scrubbed: {activeSanitization.countsByCategory.secret}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-medium">
                UI Tokens Freed: {activeSanitization.countsByCategory.styling}
              </span>
            </div>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              Risk {activeSanitization.riskScoreBefore} → {activeSanitization.riskScoreAfter}{' '}
              {activeSanitization.isSafe ? '(Safe)' : '(Review)'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowSanitizedOutput(false)}
                  className={`px-2 py-1 rounded font-semibold ${
                    !showSanitizedOutput
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Raw Snippet
                </button>
                <button
                  type="button"
                  onClick={() => setShowSanitizedOutput(true)}
                  className={`px-2 py-1 rounded font-semibold ${
                    showSanitizedOutput
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Sanitized Output
                </button>
              </div>
              {showSanitizedOutput && (
                <button
                  type="button"
                  onClick={handleCopySanitized}
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium"
                >
                  {copiedSanitized ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSanitized ? 'Copied' : 'Copy Clean'}</span>
                </button>
              )}
            </div>

            {showSanitizedOutput ? (
              <pre className="p-3 rounded-lg bg-slate-950 text-emerald-300 font-mono text-[11px] leading-relaxed max-h-36 overflow-auto border border-slate-800">
                {activeSanitization.sanitizedCode}
              </pre>
            ) : (
              <textarea
                value={snippetInput}
                onChange={(e) => setSnippetInput(e.target.value)}
                rows={5}
                placeholder="Paste third-party or template code snippet to inspect and sanitize..."
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>

          <div className="max-h-32 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/70">
            {activeSanitization.removedItems.map((finding) => (
              <div
                key={finding.id}
                className="py-1.5 flex items-center justify-between gap-2 text-[11px]"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`px-1.5 py-0.5 rounded uppercase font-bold text-[9px] shrink-0 ${
                      finding.category === 'secret'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : finding.category === 'pii'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                    }`}
                  >
                    {finding.category}
                  </span>
                  <span className="text-slate-500 font-mono shrink-0">L{finding.line}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {finding.ruleName}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 truncate max-w-[170px]">
                  → {finding.replacement}
                </span>
              </div>
            ))}
            {activeSanitization.removedItems.length === 0 && (
              <p className="py-3 text-center text-[11px] text-emerald-600 dark:text-emerald-400">
                Zero PII, hardcoded secrets, or rigid style violations found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface GitDockerStagingViewProps {
  project: Project;
  branches: ProjectGitBranchNode[];
  onPromoteBranch: (branch: GitStageBranchName) => void;
  onGitDockerAction?: (
    branch: GitStageBranchName,
    action: GitDockerActionType,
    customMessage?: string
  ) => void;
}

export const GitDockerStagingView: React.FC<GitDockerStagingViewProps> = ({
  project,
  branches,
  onPromoteBranch,
  onGitDockerAction,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<GitStageBranchName>('feature/dev');
  const [commitMessage, setCommitMessage] = useState('');
  const [specTab, setSpecTab] = useState<'compose' | 'dockerfile' | 'cli'>('compose');
  const [copiedSpec, setCopiedSpec] = useState(false);

  const activeNode =
    branches.find((b) => b.branch === selectedBranch) ?? branches[0];

  const composeSnippet = generateProjectComposeYaml(project, branches);
  const dockerfileSnippet = generateProjectDockerfile(project);
  const cliSnippet = generateGitDockerCliCommands(project, activeNode.branch);

  const activeSpecContent =
    specTab === 'compose'
      ? composeSnippet
      : specTab === 'dockerfile'
      ? dockerfileSnippet
      : cliSnippet;

  const composeSanitization = sanitizeCodeSnippet(composeSnippet);

  const triggerAction = (
    branch: GitStageBranchName,
    action: GitDockerActionType,
    customMessage?: string
  ) => {
    if (onGitDockerAction) {
      onGitDockerAction(branch, action, customMessage);
    } else if (action === 'promote') {
      onPromoteBranch(branch);
    }
  };

  const handleCommitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAction(activeNode.branch, 'commit', commitMessage);
    setCommitMessage('');
  };

  const copyActiveSpec = () => {
    navigator.clipboard.writeText(activeSpecContent);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 1800);
  };

  return (
    <div className="space-y-5">
      {/* 4 Isolated Branch Promotion Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {branches.map((node, idx) => {
          const isSelected = node.branch === activeNode.branch;
          return (
            <div
              key={node.branch}
              onClick={() => setSelectedBranch(node.branch)}
              className={`cursor-pointer bg-white dark:bg-[#111318] rounded-xl border p-4 flex flex-col justify-between space-y-3 transition-colors ${
                isSelected
                  ? 'border-indigo-500 ring-1 ring-indigo-500/30'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    <GitBranch className="w-3.5 h-3.5" />
                    {node.branch}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {node.status}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        node.dockerHealth === 'Healthy'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : node.dockerHealth === 'Building'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {node.dockerHealth}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  {node.stageLabel}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {node.lastCommitMsg}
                </p>
              </div>

              <div className="space-y-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">HEAD SHA</span>
                  <span className="text-slate-800 dark:text-slate-200">{node.lastCommitSha}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Container</span>
                  <span className="text-slate-800 dark:text-slate-200">{node.containerService}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Port / Replicas</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    :{node.containerPort} · {node.replicas}
                  </span>
                </div>

                <div className="pt-1 flex items-center gap-1.5 font-sans">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerAction(node.branch, 'rebuild');
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center justify-center gap-1"
                    title="Rebuild & verify Docker container"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Rebuild</span>
                  </button>

                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerAction(node.branch, 'rollback');
                      }}
                      className="py-1.5 px-2 rounded-lg text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors inline-flex items-center justify-center gap-1"
                      title="Rollback to standby snapshot"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {idx < branches.length - 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerAction(node.branch, 'promote');
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-sans font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Promote → {branches[idx + 1].branch}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Branch Commit Automation Bar */}
      <div className="bg-white dark:bg-[#111318] rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Isolated Branch Automation ·{' '}
              <span className="font-mono text-indigo-600 dark:text-indigo-400">
                {activeNode.branch}
              </span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Stage commits cleanly to {activeNode.branch} ({activeNode.containerService}:{activeNode.containerPort}) without polluting sibling branches.
          </p>
        </div>

        <form onSubmit={handleCommitSubmit} className="flex flex-1 max-w-xl items-center gap-2">
          <input
            type="text"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder={`Commit message for ${activeNode.branch} (e.g. feat: add RLS checkout guard)...`}
            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shrink-0"
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Commit & Build</span>
          </button>
        </form>
      </div>

      {/* Docker & Compose Spec Viewer */}
      <div className="bg-[#0D111A] rounded-xl border border-slate-800 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Box className="w-4 h-4 text-indigo-400" />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSpecTab('compose')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold ${
                  specTab === 'compose'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                docker-compose.staging.yml
              </button>
              <button
                type="button"
                onClick={() => setSpecTab('dockerfile')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold ${
                  specTab === 'dockerfile'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Dockerfile
              </button>
              <button
                type="button"
                onClick={() => setSpecTab('cli')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold inline-flex items-center gap-1 ${
                  specTab === 'cli'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3 h-3" />
                <span>Git/Docker CLI</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 text-[10px] font-mono inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>
                {composeSanitization.isSafe
                  ? 'Sanitized · 0 Secrets'
                  : `${composeSanitization.removedItems.length} warnings`}
              </span>
            </span>

            <button
              type="button"
              onClick={copyActiveSpec}
              className="px-2.5 py-1 text-[11px] font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg inline-flex items-center gap-1"
            >
              {copiedSpec ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSpec ? 'Copied' : 'Copy Spec'}</span>
            </button>
          </div>
        </div>

        <pre className="text-xs font-mono text-indigo-200/90 overflow-x-auto leading-relaxed max-h-80 overflow-y-auto">
          {activeSpecContent}
        </pre>
      </div>
    </div>
  );
};
