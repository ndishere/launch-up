import {
  SAMPLE_UNSAFE_TEMPLATE_SNIPPET,
  sanitizeCodeSnippet,
} from '../../lib/code-sanitizer.ts';
import { matchTemplates } from '../../lib/template-matcher.ts';
import {
  calculateProfitMarginPercent,
  evaluateMod10FinOpsBudget,
} from '../../lib/unit-economics.ts';
import type {
  Client,
  GitStageBranchName,
  GovernanceFrameworkKey,
  Mod10BudgetTierFallback,
  Project,
  ProjectComplianceItem,
  ProjectFinOpsState,
  ProjectSwarmStage,
  ProjectWorkspaceState,
  SwarmStageId,
} from '../../types';

export const SWARM_STAGE_DEFINITIONS: Array<{
  id: SwarmStageId;
  title: string;
  leadAgent: string;
  summary: string;
  branch: GitStageBranchName;
  reasoning: string;
  modelKey: 'fastReasoning' | 'deepArchitecture' | 'uiDesign' | 'qaSecurity';
  tokenCostUsd: number;
  containerHoursDelta: number;
  computeMinsDelta: number;
}> = [
  {
    id: 'ceo',
    title: 'CEO Agent',
    leadAgent: 'Aegis CEO Orchestrator',
    summary: 'Validates M:N client scope, budget ceiling ($25 FinOps cap), and commercial SLAs.',
    branch: 'feature/dev',
    reasoning:
      'Analyzed client subscription & SLA objectives. Partitioned project backlog into autonomous workstreams with FinOps guardrails enabled.',
    modelKey: 'fastReasoning',
    tokenCostUsd: 0.42,
    containerHoursDelta: 0.25,
    computeMinsDelta: 2.5,
  },
  {
    id: 'architect',
    title: 'Tech Architect',
    leadAgent: 'Vulcan Systems Architect',
    summary: 'Generates PostgreSQL 16 RLS migrations, OpenAPI 3.1 contract, and service boundaries.',
    branch: 'feature/dev',
    reasoning:
      'Designed multi-tenant client_project_links junction schema with ENABLE ROW LEVEL SECURITY and deterministic REST error contracts.',
    modelKey: 'deepArchitecture',
    tokenCostUsd: 1.35,
    containerHoursDelta: 0.5,
    computeMinsDelta: 4.8,
  },
  {
    id: 'design',
    title: 'Design Team',
    leadAgent: 'Iris Design & Token Agent',
    summary: 'Synthesizes adaptive Dark/Light/System palette tokens, typography, and 375px-1920px layouts.',
    branch: 'feature/dev',
    reasoning:
      'Compiled WCAG-AA contrast tokens, responsive FigCraft component tree, and compliance banners (GDPR/DPDP cookie & deletion flows).',
    modelKey: 'uiDesign',
    tokenCostUsd: 0.78,
    containerHoursDelta: 0.4,
    computeMinsDelta: 3.4,
  },
  {
    id: 'coding',
    title: 'Parallel Coding Agents',
    leadAgent: 'Orion + Nova Coder Swarm',
    summary: 'Concurrent Web, Android, and Fastify API workers commit isolated feature deltas.',
    branch: 'feature/dev',
    reasoning:
      'Spawned 3 parallel coding workers: Web UI TSX bundles, Fastify RLS route handlers, and Typed SDK client synced against OpenAPI 3.1.',
    modelKey: 'deepArchitecture',
    tokenCostUsd: 2.15,
    containerHoursDelta: 1.4,
    computeMinsDelta: 9.2,
  },
  {
    id: 'testing',
    title: 'Testing Agents',
    leadAgent: 'Sentinel QA & SecOps Agent',
    summary: 'Runs unit, HTTP contract, Semgrep SAST, Trivy CVE, Gitleaks & 375px viewport checks.',
    branch: 'feature/testing',
    reasoning:
      'Executed Playwright viewport sweeps, Semgrep static rules (0 criticals), Trivy base image scan, and tenant isolation cross-checks.',
    modelKey: 'qaSecurity',
    tokenCostUsd: 0.94,
    containerHoursDelta: 0.85,
    computeMinsDelta: 6.1,
  },
  {
    id: 'integration',
    title: 'Tech Manager Integration',
    leadAgent: 'Atlas Integration Lead',
    summary: 'Resolves merge graph via Graphify AST, builds Docker images, promotes to feature/uat.',
    branch: 'feature/uat',
    reasoning:
      'Validated AST symbol boundaries in Graphify, merged feature/dev -> feature/testing -> feature/uat with zero regression conflicts.',
    modelKey: 'deepArchitecture',
    tokenCostUsd: 0.68,
    containerHoursDelta: 0.75,
    computeMinsDelta: 4.0,
  },
  {
    id: 'uat',
    title: 'UAT / Deployment',
    leadAgent: 'Chronos Release Dispatcher',
    summary: 'Publishes staging bundle, verifies healthcheck endpoints, and stages feature/production.',
    branch: 'feature/production',
    reasoning:
      'Promoted signed Docker Compose stack to UAT preview; health probes returned 200 OK across gateway and database pool.',
    modelKey: 'fastReasoning',
    tokenCostUsd: 0.36,
    containerHoursDelta: 0.65,
    computeMinsDelta: 2.8,
  },
];

const buildDefaultCompliance = (): Record<GovernanceFrameworkKey, ProjectComplianceItem[]> => ({
  GDPR_EU: [
    { id: 'gdpr-1', label: 'Lawful consent banner & granular opt-in storage', checked: true },
    { id: 'gdpr-2', label: 'GET /api/v1/privacy/me/export structured JSON portability', checked: true },
    { id: 'gdpr-3', label: 'EU AI Act transparent synthetic-content disclosure tags', checked: true },
    { id: 'gdpr-4', label: '72-hour breach notification webhook wired to MOD-09', checked: false },
  ],
  DPDP_INDIA: [
    { id: 'dpdp-1', label: 'Explicit itemized Consent Notice prior to PII capture', checked: true },
    { id: 'dpdp-2', label: 'DELETE /api/v1/privacy/me/erase cryptographic erasure proof', checked: true },
    { id: 'dpdp-3', label: 'Grievance Officer contact metadata published in footer & portal', checked: true },
    { id: 'dpdp-4', label: 'CERT-In 6-hour security telemetry retention clock active', checked: false },
  ],
  CCPA_US: [
    { id: 'ccpa-1', label: '"Do Not Sell or Share My Personal Information" footer control', checked: true },
    { id: 'ccpa-2', label: 'Automated 45-day verifiable consumer request SLA tracker', checked: true },
    { id: 'ccpa-3', label: 'Sensitive PII column encryption via PostgreSQL pgcrypto', checked: true },
  ],
});

export interface FinOpsCalculatedSummary {
  estimatedLlmCost: number;
  actualLlmCost: number;
  estimatedContainerCost: number;
  containerCost: number;
  estimatedAgentComputeCost: number;
  agentComputeCost: number;
  manualExpensesTotal: number;
  totalEstimatedCost: number;
  totalActualCost: number;
  costVarianceUsd: number;
  estimatedGrossProfitUsd: number;
  grossProfitUsd: number;
  estimatedProfitMarginPercent: number;
  profitMarginPercent: number;
  roiPercent: number;
  reusabilityPercent: number;
  reusabilitySavingsUsd: number;
  grossLlmCostWithoutReuseUsd: number;
  effectiveCostReductionPercent: number;
  mod10RemainingBudgetUsd: number;
  mod10BudgetUtilizationPercent: number;
  mod10BudgetTierFallback: Mod10BudgetTierFallback;
  mod10Authorized: boolean;
}

export function calculateProjectUnitEconomics(finops: ProjectFinOpsState): FinOpsCalculatedSummary {
  const manualExpensesTotal = finops.manualExpenses.reduce((acc, item) => acc + (Number(item.amountUsd) || 0), 0);
  const estHours = finops.estimatedContainerHours ?? finops.containerHours;
  const estMins = finops.estimatedAgentComputeMinutes ?? finops.agentComputeMinutes;

  const estimatedContainerCost = Number((estHours * finops.containerRatePerHourUsd).toFixed(2));
  const containerCost = Number((finops.containerHours * finops.containerRatePerHourUsd).toFixed(2));
  const estimatedAgentComputeCost = Number((estMins * finops.agentComputeRatePerMinUsd).toFixed(2));
  const agentComputeCost = Number((finops.agentComputeMinutes * finops.agentComputeRatePerMinUsd).toFixed(2));
  const estimatedLlmCost = Number(finops.estimatedLlmSpendUsd.toFixed(2));
  const actualLlmCost = Number(finops.actualLlmSpendUsd.toFixed(2));

  const totalEstimatedCost = Number(
    (estimatedLlmCost + estimatedContainerCost + estimatedAgentComputeCost + manualExpensesTotal).toFixed(2)
  );
  const totalActualCost = Number(
    (actualLlmCost + containerCost + agentComputeCost + manualExpensesTotal).toFixed(2)
  );
  const costVarianceUsd = Number((totalActualCost - totalEstimatedCost).toFixed(2));

  const estimatedGrossProfitUsd = Number((finops.clientContractValueUsd - totalEstimatedCost).toFixed(2));
  const grossProfitUsd = Number((finops.clientContractValueUsd - totalActualCost).toFixed(2));
  const estimatedProfitMarginPercent = calculateProfitMarginPercent(
    finops.clientContractValueUsd,
    totalEstimatedCost
  );
  const profitMarginPercent = calculateProfitMarginPercent(
    finops.clientContractValueUsd,
    totalActualCost
  );
  const roiPercent =
    totalActualCost > 0 ? Number(((grossProfitUsd / totalActualCost) * 100).toFixed(1)) : 0;

  const reusabilitySavingsUsd = Number(
    (
      finops.reusabilityTokenSavingsUsd ??
      finops.templateMatchResults?.totalEstimatedSavingsUsd ??
      0
    ).toFixed(2)
  );
  const reusabilityPercent =
    finops.reusabilityPercent ??
    finops.templateMatchResults?.totalReusabilityPercent ??
    0;
  const grossLlmCostWithoutReuseUsd = Number(
    (estimatedLlmCost + reusabilitySavingsUsd).toFixed(2)
  );
  const effectiveCostReductionPercent =
    grossLlmCostWithoutReuseUsd > 0
      ? Number(((reusabilitySavingsUsd / grossLlmCostWithoutReuseUsd) * 100).toFixed(1))
      : 0;

  const mod10Eval = evaluateMod10FinOpsBudget(finops);

  return {
    estimatedLlmCost,
    actualLlmCost,
    estimatedContainerCost,
    containerCost,
    estimatedAgentComputeCost,
    agentComputeCost,
    manualExpensesTotal,
    totalEstimatedCost,
    totalActualCost,
    costVarianceUsd,
    estimatedGrossProfitUsd,
    grossProfitUsd,
    estimatedProfitMarginPercent,
    profitMarginPercent,
    roiPercent,
    reusabilityPercent,
    reusabilitySavingsUsd,
    grossLlmCostWithoutReuseUsd,
    effectiveCostReductionPercent,
    mod10RemainingBudgetUsd: mod10Eval.remainingBudgetUsd,
    mod10BudgetUtilizationPercent: mod10Eval.budgetUtilizationPercent,
    mod10BudgetTierFallback: mod10Eval.budgetTierFallback,
    mod10Authorized: mod10Eval.authorized,
  };
}

export function createDefaultProjectWorkspace(
  project: Project,
  linkedClients: Client[]
): ProjectWorkspaceState {
  const isAlreadyLive = project.status === 'Live';
  const combinedSubscription = linkedClients.reduce((sum, c) => sum + (c.monthlySubscription || 0), 0);
  const contractValue = Math.max(project.monthlyRevenue || combinedSubscription || 3500, 1200);

  const clientNames =
    linkedClients.length > 0 ? linkedClients.map((c) => `${c.name} (${c.tier})`).join(', ') : 'Agency Internal';

  const stages: ProjectSwarmStage[] = SWARM_STAGE_DEFINITIONS.map((def, idx) => ({
    id: def.id,
    title: def.title,
    leadAgent: def.leadAgent,
    summary: def.summary,
    status: isAlreadyLive ? 'completed' : idx === 0 ? 'completed' : 'pending',
    progressPercent: isAlreadyLive ? 100 : idx === 0 ? 100 : 0,
    completedAt: isAlreadyLive || idx === 0 ? 'Verified' : undefined,
  }));

  const shortSha = (seed: string) => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return h.toString(16).padStart(7, '0').slice(0, 7);
  };

  const defaultPrd = `# PRD Blueprint — ${project.name}
- Archetype: ${project.type}
- M:N Linked Clients: ${clientNames}
- Primary Framework: ${project.framework || 'React 19 + Fastify'}
- Deployment Target: ${project.serverTarget}
- Success Metric: 100% RLS isolation, <250ms p95 API latency, 0px horizontal mobile overflow (375px–1920px).`;

  const initialTemplateMatches = matchTemplates(defaultPrd, project.type);
  const initialSanitization = sanitizeCodeSnippet(SAMPLE_UNSAFE_TEMPLATE_SNIPPET);

  const initialLlmBudget = 25.0;
  const initialActualLlm = isAlreadyLive ? 6.68 : 0.3;
  const initialMod10Eval = evaluateMod10FinOpsBudget({
    llmTokenBudgetUsd: initialLlmBudget,
    actualLlmSpendUsd: initialActualLlm,
  });

  return {
    projectId: project.id,
    buildStatus: isAlreadyLive ? 'completed' : 'idle',
    currentStageIndex: isAlreadyLive ? SWARM_STAGE_DEFINITIONS.length - 1 : 0,
    stages,
    logs: [
      {
        id: `log-init-1-${project.id}`,
        timestamp: new Date().toLocaleTimeString(),
        stageId: 'ceo',
        agentName: 'Aegis CEO Orchestrator',
        modelUsed: 'Gemini 2.5 Flash',
        message: `Workspace hydrated for "${project.name}" (${project.type}) linked to M:N stakeholders: ${clientNames}.`,
        level: 'info',
        tokensUsed: 1420,
      },
      {
        id: `log-init-2-${project.id}`,
        timestamp: new Date().toLocaleTimeString(),
        stageId: isAlreadyLive ? 'uat' : 'ceo',
        agentName: isAlreadyLive ? 'Chronos Release Dispatcher' : 'Vulcan Systems Architect',
        modelUsed: isAlreadyLive ? 'Gemini 2.5 Flash' : 'Claude 3.7 Sonnet',
        message: isAlreadyLive
          ? `All 7 hierarchical swarm gates completed. Production stack healthy on ${project.serverTarget}.`
          : 'Awaiting "Start Autonomous Build" command to execute Tech Architect -> UAT pipeline.',
        level: isAlreadyLive ? 'success' : 'reasoning',
        tokensUsed: isAlreadyLive ? 3890 : 960,
      },
    ],
    blueprints: {
      prd: defaultPrd,
      tdd: `# Technical Design & Verification Matrix
1. Schema Isolation: PostgreSQL 16 ENABLE ROW LEVEL SECURITY across tenant entities via client_project_links.
2. API Contract: Strict OpenAPI 3.1 validation with deterministic 4xx/5xx error codes (ERR_RLS_UNPROTECTED_TABLE, ERR_OPTIMISTIC_LOCK_CONFLICT).
3. Stage Gate Locks: MOD-10 human sign-off required before PRODUCTION_DEPLOY.`,
      designTheme: `# Design System & Adaptive Theme Tokens
- Light/Dark/System adaptive contrast (WCAG AA compliant).
- Primary Palette Sync: Inherits active workspace CSS variables (--theme-accent, --palette-400..700).
- Typography: Plus Jakarta Sans (UI) + JetBrains Mono (telemetry & SQL DDL).`,
      compliance: buildDefaultCompliance(),
    },
    swarmAgents: [
      {
        id: `slot-ceo-${project.id}`,
        roleTitle: 'CEO Agent',
        agentName: 'Aegis Orchestrator',
        specialty: 'Scope Decomposition & FinOps Cap',
        status: isAlreadyLive ? 'Completed' : 'Idle',
        activeQueue: isAlreadyLive ? 0 : 1,
        tokenBudgetUsd: 3.0,
        tokensSpentUsd: isAlreadyLive ? 0.42 : 0.12,
        assignedBranch: 'feature/dev',
      },
      {
        id: `slot-arch-${project.id}`,
        roleTitle: 'Tech Architect',
        agentName: 'Vulcan Architect',
        specialty: 'PostgreSQL 16 RLS + OpenAPI 3.1',
        status: isAlreadyLive ? 'Completed' : 'Idle',
        activeQueue: isAlreadyLive ? 0 : 2,
        tokenBudgetUsd: 6.0,
        tokensSpentUsd: isAlreadyLive ? 1.35 : 0.18,
        assignedBranch: 'feature/dev',
      },
      {
        id: `slot-design-${project.id}`,
        roleTitle: 'Design Team',
        agentName: 'Iris UI Synthesizer',
        specialty: 'FigCraft Tokens & 375px Responsive',
        status: isAlreadyLive ? 'Completed' : 'Idle',
        activeQueue: isAlreadyLive ? 0 : 1,
        tokenBudgetUsd: 4.0,
        tokensSpentUsd: isAlreadyLive ? 0.78 : 0.0,
        assignedBranch: 'feature/dev',
      },
      {
        id: `slot-code-${project.id}`,
        roleTitle: 'Parallel Coding Agents',
        agentName: 'Orion + Nova Workers',
        specialty: 'Full-Stack Web, Android & Fastify Workers',
        status: isAlreadyLive ? 'Completed' : 'Idle',
        activeQueue: isAlreadyLive ? 0 : 3,
        tokenBudgetUsd: 7.5,
        tokensSpentUsd: isAlreadyLive ? 2.15 : 0.0,
        assignedBranch: 'feature/dev',
      },
      {
        id: `slot-qa-${project.id}`,
        roleTitle: 'Testing Agents',
        agentName: 'Sentinel QA & SecOps',
        specialty: 'Contract Suites, Semgrep, Trivy & Gitleaks',
        status: isAlreadyLive ? 'Completed' : 'Idle',
        activeQueue: isAlreadyLive ? 0 : 2,
        tokenBudgetUsd: 2.5,
        tokensSpentUsd: isAlreadyLive ? 0.94 : 0.0,
        assignedBranch: 'feature/testing',
      },
      {
        id: `slot-uat-${project.id}`,
        roleTitle: 'Integration & UAT',
        agentName: 'Atlas + Chronos',
        specialty: 'Graphify AST Merge & Docker Rollout',
        status: isAlreadyLive ? 'Completed' : 'Idle',
        activeQueue: 0,
        tokenBudgetUsd: 2.0,
        tokensSpentUsd: isAlreadyLive ? 1.04 : 0.0,
        assignedBranch: 'feature/production',
      },
    ],
    modelRouting: {
      fastReasoning: 'Gemini 2.5 Flash',
      deepArchitecture: 'Claude 3.7 Sonnet',
      uiDesign: 'Gemini 2.5 Pro',
      qaSecurity: 'GPT-4.1 Mini',
      localEdgeFallback: true,
      temperature: 0.2,
    },
    finops: {
      clientContractValueUsd: contractValue,
      llmTokenBudgetUsd: initialLlmBudget,
      estimatedLlmSpendUsd: 6.68,
      actualLlmSpendUsd: initialActualLlm,
      estimatedContainerHours: 14.0,
      containerHours: isAlreadyLive ? 14.5 : 2.0,
      containerRatePerHourUsd: 1.45,
      estimatedAgentComputeMinutes: 30.0,
      agentComputeMinutes: isAlreadyLive ? 32.8 : 4.5,
      agentComputeRatePerMinUsd: 0.35,
      manualExpenses: [
        {
          id: `exp-init-${project.id}`,
          category: 'Domain & SSL',
          description: 'Edge TLS Certificate & DNS Zone',
          amountUsd: 18.0,
          date: new Date().toISOString().slice(0, 10),
        },
      ],
      reusabilityPercent: initialTemplateMatches.totalReusabilityPercent,
      reusabilityTokenSavingsUsd: initialTemplateMatches.totalEstimatedSavingsUsd,
      templateMatchResults: initialTemplateMatches,
      lastSanitizationResult: initialSanitization,
      lastMod10Check: {
        authorized: initialMod10Eval.authorized,
        principal_type: 'AI_AGENT',
        effective_role: 'AUTONOMOUS_FACTORY_SWARM',
        rls_session_token: `rls_${shortSha(project.id)}`,
        remaining_budget_usd: initialMod10Eval.remainingBudgetUsd,
        budget_tier_fallback: initialMod10Eval.budgetTierFallback,
        gate_required: false,
        error_code: initialMod10Eval.errorCode,
        checkedAt: new Date().toISOString(),
        isLiveService: false,
      },
    },
    gitDocker: [
      {
        branch: 'feature/dev',
        stageLabel: 'Development Sandbox',
        status: isAlreadyLive ? 'Synced' : 'Active',
        lastCommitSha: shortSha(`${project.id}-dev`),
        lastCommitMsg: 'feat(swarm): synthesize RLS migrations & component tree',
        containerService: 'launchup-dev-worker',
        containerPort: 5173,
        dockerHealth: 'Healthy',
        replicas: '2/2 Running',
      },
      {
        branch: 'feature/testing',
        stageLabel: 'Automated QA & SecOps',
        status: isAlreadyLive ? 'Synced' : 'Ahead',
        lastCommitSha: shortSha(`${project.id}-test`),
        lastCommitMsg: 'test(mod06): contract verification & Semgrep zero-CVE gate',
        containerService: 'launchup-qa-runner',
        containerPort: 8009,
        dockerHealth: isAlreadyLive ? 'Healthy' : 'Standby',
        replicas: isAlreadyLive ? '2/2 Verified' : '1/1 Standby',
      },
      {
        branch: 'feature/uat',
        stageLabel: 'Client UAT Preview',
        status: isAlreadyLive ? 'Synced' : 'Pending',
        lastCommitSha: shortSha(`${project.id}-uat`),
        lastCommitMsg: 'chore(uat): staging container + PostgreSQL RLS mirror',
        containerService: 'launchup-uat-preview',
        containerPort: 8080,
        dockerHealth: isAlreadyLive ? 'Healthy' : 'Standby',
        replicas: isAlreadyLive ? '2/2 Healthy' : '0/1 Standby',
      },
      {
        branch: 'feature/production',
        stageLabel: 'Production Cluster',
        status: isAlreadyLive ? 'Active' : 'Pending',
        lastCommitSha: shortSha(`${project.id}-prod`),
        lastCommitMsg: `release(${project.serverTarget.toLowerCase()}): immutable blue-green rollout`,
        containerService: 'launchup-prod-edge',
        containerPort: 443,
        dockerHealth: isAlreadyLive ? 'Healthy' : 'Standby',
        replicas: isAlreadyLive ? '3/3 Live' : '0/3 Gated',
      },
    ],
    lastUpdatedAt: new Date().toISOString(),
  };
}
