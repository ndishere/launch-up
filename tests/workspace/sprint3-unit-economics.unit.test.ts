import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateProfitMarginPercent,
  computeClientBillingAttribution,
  computeEstimatedVsActualBreakdown,
  evaluateMod10FinOpsBudget,
} from '../../src/lib/unit-economics.ts';
import {
  calculateProjectUnitEconomics,
  createDefaultProjectWorkspace,
} from '../../src/components/workspace/workspaceDefaults.ts';

describe('Sprint 3: Automated Unit Economics & Profitability Dashboard (Unit Tests)', () => {
  it('ECON-01: computes Gross Profit % ((Revenue - Cost) / Revenue * 100) and guards zero revenue', () => {
    assert.equal(calculateProfitMarginPercent(5000, 1000), 80);
    assert.equal(calculateProfitMarginPercent(2500, 500), 80);
    assert.equal(calculateProfitMarginPercent(1000, 1250), -25);
    assert.equal(calculateProfitMarginPercent(0, 100), 0);
  });

  it('ECON-02: evaluates MOD-10 FinOps budget caps and TIER_2 / TIER_3 / ERR_BUDGET_EXCEEDED boundaries', () => {
    const tierNone = evaluateMod10FinOpsBudget({
      llmTokenBudgetUsd: 25,
      actualLlmSpendUsd: 10,
    });
    assert.equal(tierNone.authorized, true);
    assert.equal(tierNone.remainingBudgetUsd, 15);
    assert.equal(tierNone.budgetTierFallback, 'NONE');
    assert.equal(tierNone.errorCode, undefined);

    const tier2 = evaluateMod10FinOpsBudget({
      llmTokenBudgetUsd: 25,
      actualLlmSpendUsd: 15,
    });
    assert.equal(tier2.authorized, true);
    assert.equal(tier2.remainingBudgetUsd, 10);
    assert.equal(tier2.budgetTierFallback, 'TIER_2');

    const tier3 = evaluateMod10FinOpsBudget({
      llmTokenBudgetUsd: 25,
      actualLlmSpendUsd: 22,
    });
    assert.equal(tier3.authorized, true);
    assert.equal(tier3.remainingBudgetUsd, 3);
    assert.equal(tier3.budgetTierFallback, 'TIER_3');

    const exceeded = evaluateMod10FinOpsBudget(
      {
        llmTokenBudgetUsd: 25,
        actualLlmSpendUsd: 24.9,
      },
      0.5
    );
    assert.equal(exceeded.authorized, false);
    assert.equal(exceeded.errorCode, 'ERR_BUDGET_EXCEEDED');
  });

  it('ECON-03: computes Estimated vs Actual expense breakdown across LLM, Container, Compute, and Manual entries', () => {
    const rows = computeEstimatedVsActualBreakdown({
      clientContractValueUsd: 6000,
      llmTokenBudgetUsd: 25,
      estimatedLlmSpendUsd: 8,
      actualLlmSpendUsd: 10,
      estimatedContainerHours: 10,
      containerHours: 12,
      containerRatePerHourUsd: 1.5,
      estimatedAgentComputeMinutes: 20,
      agentComputeMinutes: 30,
      agentComputeRatePerMinUsd: 0.4,
      manualExpenses: [
        {
          id: 'exp-1',
          category: 'Tooling',
          description: 'Observability addon',
          amountUsd: 50,
          date: '2026-11-11',
        },
      ],
    });

    assert.equal(rows.length, 4);
    const llm = rows.find((r) => r.id === 'llm')!;
    const container = rows.find((r) => r.id === 'container')!;
    const compute = rows.find((r) => r.id === 'compute')!;
    const manual = rows.find((r) => r.id === 'manual')!;

    assert.equal(llm.estimatedUsd, 8);
    assert.equal(llm.actualUsd, 10);
    assert.equal(llm.varianceUsd, 2);

    assert.equal(container.estimatedUsd, 15);
    assert.equal(container.actualUsd, 18);
    assert.equal(container.varianceUsd, 3);

    assert.equal(compute.estimatedUsd, 8);
    assert.equal(compute.actualUsd, 12);
    assert.equal(compute.varianceUsd, 4);

    assert.equal(manual.actualUsd, 50);
    assert.equal(manual.varianceUsd, 0);
  });

  it('ECON-04: distributes M:N client revenue and net profit share proportionally across linked clients', () => {
    const shares = computeClientBillingAttribution(4000, 3600, [
      {
        id: 'c-1',
        name: 'Primary Logistics',
        domain: 'primary.io',
        initials: 'PL',
        email: 'ops@primary.io',
        tier: 'Enterprise B2B',
        status: 'Active',
        joinedDate: 'Jan 2026',
        totalSpend: 12000,
        monthlySubscription: 3000,
        primaryContact: { name: 'A', role: 'CTO', email: 'a@primary.io' },
        projectIds: ['p-1'],
      },
      {
        id: 'c-2',
        name: 'Partner Retail',
        domain: 'partner.io',
        initials: 'PR',
        email: 'ops@partner.io',
        tier: 'Agency',
        status: 'Active',
        joinedDate: 'Feb 2026',
        totalSpend: 4000,
        monthlySubscription: 1000,
        primaryContact: { name: 'B', role: 'VP', email: 'b@partner.io' },
        projectIds: ['p-1'],
      },
    ]);

    assert.equal(shares.length, 2);
    assert.equal(shares[0].sharePercent, 75);
    assert.equal(shares[0].attributedRevenueUsd, 3000);
    assert.equal(shares[0].attributedProfitUsd, 2700);
    assert.equal(shares[1].sharePercent, 25);
    assert.equal(shares[1].attributedRevenueUsd, 1000);
    assert.equal(shares[1].attributedProfitUsd, 900);
  });

  it('ECON-05: createDefaultProjectWorkspace and calculateProjectUnitEconomics populate Sprint 3 MOD-10 & ROI summary', () => {
    const ws = createDefaultProjectWorkspace(
      {
        id: 'proj-econ-1',
        name: 'FinOps Flagship',
        type: 'SaaS Platform',
        status: 'Live',
        healthPercent: 99,
        repoUrl: 'https://github.com/launchup/finops',
        branch: 'main',
        framework: 'React 19 + Fastify',
        serverTarget: 'Cloud Run',
        lastBackupDate: 'Just now',
        backupStatus: 'Healthy',
        monthlyRevenue: 5000,
        clientIds: [],
      },
      []
    );

    assert.ok(ws.finops.lastMod10Check);
    assert.equal(ws.finops.lastMod10Check?.authorized, true);
    assert.equal(ws.finops.lastMod10Check?.budget_tier_fallback, 'NONE');

    const summary = calculateProjectUnitEconomics(ws.finops);
    assert.ok(summary.roiPercent > 0);
    assert.equal(summary.mod10Authorized, true);
    assert.equal(summary.mod10BudgetTierFallback, 'NONE');
    assert.equal(summary.mod10RemainingBudgetUsd, 18.32);
  });
});
