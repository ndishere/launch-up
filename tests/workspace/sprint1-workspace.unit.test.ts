import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SWARM_STAGE_DEFINITIONS,
  calculateProjectUnitEconomics,
  createDefaultProjectWorkspace,
} from '../../src/components/workspace/workspaceDefaults.ts';

describe('Sprint 1: Project Command Center & Hierarchical Agent Swarm (Unit Tests)', () => {
  it('WS-01: defines all 7 hierarchical swarm pipeline stages in canonical execution order', () => {
    assert.deepEqual(
      SWARM_STAGE_DEFINITIONS.map((s) => s.title),
      [
        'CEO Agent',
        'Tech Architect',
        'Design Team',
        'Parallel Coding Agents',
        'Testing Agents',
        'Tech Manager Integration',
        'UAT / Deployment',
      ]
    );
  });

  it('WS-02: hydrates workspace linked M:N clients, GDPR/DPDP/CCPA checklists, and 4 Git/Docker branches', () => {
    const ws = createDefaultProjectWorkspace(
      {
        id: 'proj-test-1',
        name: 'OmniRoute Logistics',
        type: 'SaaS Platform',
        status: 'In Progress',
        healthPercent: 95,
        repoUrl: 'https://github.com/launchup/omniroute',
        branch: 'main',
        framework: 'React 19 + Fastify',
        serverTarget: 'Cloud Run',
        lastBackupDate: 'Just now',
        backupStatus: 'Healthy',
        clientIds: ['c-1', 'c-2'],
      },
      [
        {
          id: 'c-1',
          name: 'Acme Logistics',
          domain: 'acme.io',
          initials: 'AL',
          email: 'ops@acme.io',
          tier: 'Enterprise B2B',
          status: 'Active',
          joinedDate: 'Jan 2026',
          totalSpend: 5000,
          monthlySubscription: 2500,
          primaryContact: { name: 'Riya', role: 'CTO', email: 'riya@acme.io' },
          projectIds: ['proj-test-1'],
        },
        {
          id: 'c-2',
          name: 'Apex Partner',
          domain: 'apex.io',
          initials: 'AP',
          email: 'cto@apex.io',
          tier: 'Agency',
          status: 'Active',
          joinedDate: 'Feb 2026',
          totalSpend: 3000,
          monthlySubscription: 1500,
          primaryContact: { name: 'Dev', role: 'VP', email: 'dev@apex.io' },
          projectIds: ['proj-test-1'],
        },
      ]
    );

    assert.equal(ws.finops.clientContractValueUsd, 4000);
    assert.equal(ws.stages.length, 7);
    assert.deepEqual(
      ws.gitDocker.map((b) => b.branch),
      ['feature/dev', 'feature/testing', 'feature/uat', 'feature/production']
    );
    assert.ok(ws.blueprints.compliance.GDPR_EU.length >= 3);
    assert.ok(ws.blueprints.compliance.DPDP_INDIA.length >= 3);
    assert.ok(ws.blueprints.compliance.CCPA_US.length >= 3);
  });

  it('WS-03: calculateProjectUnitEconomics computes actual cost, gross profit, and margin % accurately', () => {
    const metrics = calculateProjectUnitEconomics({
      clientContractValueUsd: 5000,
      llmTokenBudgetUsd: 25,
      estimatedLlmSpendUsd: 8,
      actualLlmSpendUsd: 10,
      containerHours: 10,
      containerRatePerHourUsd: 2,
      agentComputeMinutes: 20,
      agentComputeRatePerMinUsd: 0.5,
      manualExpenses: [
        {
          id: 'exp-1',
          category: 'Tooling',
          description: 'Figma seat',
          amountUsd: 60,
          date: '2026-11-11',
        },
      ],
    });

    // actualCost = 10 (LLM) + 20 (container) + 10 (compute) + 60 (manual) = 100
    assert.equal(metrics.totalActualCost, 100);
    assert.equal(metrics.totalEstimatedCost, 98);
    assert.equal(metrics.grossProfitUsd, 4900);
    assert.equal(metrics.profitMarginPercent, 98);
  });
});
