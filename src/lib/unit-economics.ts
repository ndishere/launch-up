import type {
  Client,
  Mod10BudgetTierFallback,
  ProjectFinOpsState,
} from '../types';

export interface Mod10BudgetEvaluation {
  monthlyBudgetUsd: number;
  actualSpendUsd: number;
  remainingBudgetUsd: number;
  budgetUtilizationPercent: number;
  budgetTierFallback: Mod10BudgetTierFallback;
  authorized: boolean;
  errorCode?: 'ERR_BUDGET_EXCEEDED';
}

export interface CostComparisonRow {
  id: 'llm' | 'container' | 'compute' | 'manual';
  label: string;
  unitSummary: string;
  estimatedUsd: number;
  actualUsd: number;
  varianceUsd: number;
  variancePercent: number;
  shareOfActualPercent: number;
}

export interface ClientBillingShareRow {
  clientId: string;
  clientName: string;
  tier: string;
  sharePercent: number;
  attributedRevenueUsd: number;
  attributedProfitUsd: number;
}

/**
 * Evaluates a project's FinOps token spend against its MOD-10 cap using the
 * canonical TIER_2 (<50% remaining) and TIER_3 (<20% remaining) fallback rules.
 */
export function evaluateMod10FinOpsBudget(
  finops: Pick<ProjectFinOpsState, 'llmTokenBudgetUsd' | 'actualLlmSpendUsd'>,
  requestedAdditionalUsd = 0
): Mod10BudgetEvaluation {
  const monthlyBudgetUsd = Number(Math.max(0, finops.llmTokenBudgetUsd).toFixed(2));
  const actualSpendUsd = Number(Math.max(0, finops.actualLlmSpendUsd).toFixed(2));
  const projectedSpend = Number((actualSpendUsd + Math.max(0, requestedAdditionalUsd)).toFixed(2));
  const rawRemaining = monthlyBudgetUsd > 0 ? monthlyBudgetUsd - actualSpendUsd : 0;
  const remainingBudgetUsd = Number(rawRemaining.toFixed(2));
  const budgetUtilizationPercent =
    monthlyBudgetUsd > 0
      ? Number(((actualSpendUsd / monthlyBudgetUsd) * 100).toFixed(1))
      : 0;

  let budgetTierFallback: Mod10BudgetTierFallback = 'NONE';
  if (monthlyBudgetUsd > 0) {
    const remainingRatio = rawRemaining / monthlyBudgetUsd;
    if (remainingRatio < 0.2) {
      budgetTierFallback = 'TIER_3';
    } else if (remainingRatio < 0.5) {
      budgetTierFallback = 'TIER_2';
    }
  }

  const exceedsBudget = monthlyBudgetUsd > 0 && projectedSpend > monthlyBudgetUsd;

  return {
    monthlyBudgetUsd,
    actualSpendUsd,
    remainingBudgetUsd,
    budgetUtilizationPercent,
    budgetTierFallback,
    authorized: !exceedsBudget,
    errorCode: exceedsBudget ? 'ERR_BUDGET_EXCEEDED' : undefined,
  };
}

/**
 * Computes Gross Profit Percentage using: ((Revenue - Cost) / Revenue) * 100.
 */
export function calculateProfitMarginPercent(revenueUsd: number, costUsd: number): number {
  if (revenueUsd <= 0) return 0;
  return Number((((revenueUsd - costUsd) / revenueUsd) * 100).toFixed(1));
}

/**
 * Builds the Estimated vs. Actual Expenses comparison breakdown across LLM tokens,
 * container hosting hours, agent compute time, and manual ledger entries.
 */
export function computeEstimatedVsActualBreakdown(
  finops: ProjectFinOpsState
): CostComparisonRow[] {
  const estLlm = Number(finops.estimatedLlmSpendUsd.toFixed(2));
  const actLlm = Number(finops.actualLlmSpendUsd.toFixed(2));

  const estHours = finops.estimatedContainerHours ?? finops.containerHours;
  const estContainer = Number((estHours * finops.containerRatePerHourUsd).toFixed(2));
  const actContainer = Number((finops.containerHours * finops.containerRatePerHourUsd).toFixed(2));

  const estMins = finops.estimatedAgentComputeMinutes ?? finops.agentComputeMinutes;
  const estCompute = Number((estMins * finops.agentComputeRatePerMinUsd).toFixed(2));
  const actCompute = Number((finops.agentComputeMinutes * finops.agentComputeRatePerMinUsd).toFixed(2));

  const actManual = Number(
    finops.manualExpenses
      .reduce((acc, item) => acc + (Number(item.amountUsd) || 0), 0)
      .toFixed(2)
  );
  const estManual = actManual;

  const totalActual = actLlm + actContainer + actCompute + actManual;

  const rows: Array<Omit<CostComparisonRow, 'varianceUsd' | 'variancePercent' | 'shareOfActualPercent'>> = [
    {
      id: 'llm',
      label: 'LLM Token Consumption',
      unitSummary: `Cap $${finops.llmTokenBudgetUsd.toFixed(2)}`,
      estimatedUsd: estLlm,
      actualUsd: actLlm,
    },
    {
      id: 'container',
      label: 'Container Hosting Hours',
      unitSummary: `${finops.containerHours}h @ $${finops.containerRatePerHourUsd}/hr`,
      estimatedUsd: estContainer,
      actualUsd: actContainer,
    },
    {
      id: 'compute',
      label: 'Agent Compute Time',
      unitSummary: `${finops.agentComputeMinutes}m @ $${finops.agentComputeRatePerMinUsd}/min`,
      estimatedUsd: estCompute,
      actualUsd: actCompute,
    },
    {
      id: 'manual',
      label: 'Manual Project Expenses',
      unitSummary: `${finops.manualExpenses.length} ledger item(s)`,
      estimatedUsd: estManual,
      actualUsd: actManual,
    },
  ];

  return rows.map((row) => {
    const varianceUsd = Number((row.actualUsd - row.estimatedUsd).toFixed(2));
    const variancePercent =
      row.estimatedUsd > 0
        ? Number(((varianceUsd / row.estimatedUsd) * 100).toFixed(1))
        : 0;
    const shareOfActualPercent =
      totalActual > 0 ? Number(((row.actualUsd / totalActual) * 100).toFixed(1)) : 0;

    return {
      ...row,
      varianceUsd,
      variancePercent,
      shareOfActualPercent,
    };
  });
}

/**
 * Attributes contract revenue and net profit across M:N linked client stakeholders
 * proportionally by monthly subscription weight (or equal split when uniform).
 */
export function computeClientBillingAttribution(
  contractValueUsd: number,
  netProfitUsd: number,
  linkedClients: Client[]
): ClientBillingShareRow[] {
  if (linkedClients.length === 0) {
    return [
      {
        clientId: 'internal',
        clientName: 'Agency Internal R&D',
        tier: 'Internal',
        sharePercent: 100,
        attributedRevenueUsd: Number(contractValueUsd.toFixed(2)),
        attributedProfitUsd: Number(netProfitUsd.toFixed(2)),
      },
    ];
  }

  const weights = linkedClients.map((c) => Math.max(c.monthlySubscription || 0, 1));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  return linkedClients.map((client, idx) => {
    const ratio = weights[idx] / totalWeight;
    return {
      clientId: client.id,
      clientName: client.name,
      tier: client.tier,
      sharePercent: Number((ratio * 100).toFixed(1)),
      attributedRevenueUsd: Number((contractValueUsd * ratio).toFixed(2)),
      attributedProfitUsd: Number((netProfitUsd * ratio).toFixed(2)),
    };
  });
}
