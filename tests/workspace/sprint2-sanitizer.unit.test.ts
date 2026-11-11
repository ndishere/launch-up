import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SAMPLE_UNSAFE_TEMPLATE_SNIPPET,
  sanitizeCodeSnippet,
} from '../../src/lib/code-sanitizer.ts';
import { matchTemplates } from '../../src/lib/template-matcher.ts';
import {
  calculateProjectUnitEconomics,
  createDefaultProjectWorkspace,
} from '../../src/components/workspace/workspaceDefaults.ts';

describe('Sprint 2: Smart Reusability & Code Sanitizer Engine (Unit Tests)', () => {
  it('SAN-01: scrubs PII (emails, phone numbers, addresses, author names) from snippets', () => {
    const dirtyPii = `
      // @author: Elena Vance
      // Contact Name: Marcus Chen
      const supportEmail = "founders@secretclient.io";
      const hotline = "+1 (415) 555-0192";
      const hq = "1600 Amphitheatre Parkway, Mountain View, CA 94043";
    `;
    const res = sanitizeCodeSnippet(dirtyPii);

    assert.equal(res.isSafe, true);
    assert.ok(res.countsByCategory.pii >= 4);
    assert.ok(!res.sanitizedCode.includes('founders@secretclient.io'));
    assert.ok(!res.sanitizedCode.includes('415'));
    assert.ok(!res.sanitizedCode.includes('Elena Vance'));
    assert.ok(!res.sanitizedCode.includes('1600 Amphitheatre Parkway'));
    assert.ok(res.sanitizedCode.includes('[REDACTED_EMAIL]'));
    assert.ok(res.sanitizedCode.includes('[REDACTED_PHONE]'));
    assert.ok(res.sanitizedCode.includes('[REDACTED_ADDRESS]'));
    assert.ok(res.sanitizedCode.includes('[REDACTED_NAME]'));
  });

  it('SAN-02: scrubs connection strings, AWS keys, provider keys, and Bearer tokens', () => {
    const sampleStripeKey = ['sk', 'live', '51TestKeyValue1234567890'].join('_');
    const dirtySecrets = `
      const pg = "postgresql://admin:UltraSecret@db.internal:5432/prod";
      const aws = "AKIAIOSFODNN7EXAMPLE";
      const stripe = "${sampleStripeKey}";
      const DB_PASSWORD = "super-secret-password-99";
      const auth = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tokenBodyValue";
    `;
    const res = sanitizeCodeSnippet(dirtySecrets);

    assert.equal(res.isSafe, true);
    assert.equal(res.riskScoreAfter, 0);
    assert.ok(res.countsByCategory.secret >= 5);
    assert.ok(!res.sanitizedCode.includes('UltraSecret'));
    assert.ok(!res.sanitizedCode.includes('AKIAIOSFODNN7EXAMPLE'));
    assert.ok(!res.sanitizedCode.includes(sampleStripeKey));
    assert.ok(!res.sanitizedCode.includes('super-secret-password-99'));
    assert.ok(res.sanitizedCode.includes('process.env.DATABASE_URL'));
    assert.ok(res.sanitizedCode.includes('process.env.AWS_ACCESS_KEY_ID'));
    assert.ok(res.sanitizedCode.includes('process.env.API_SECRET_KEY'));
  });

  it('SAN-03: removes proprietary/rigid UI styling constraints and stays idempotent on second scan', () => {
    const res = sanitizeCodeSnippet(SAMPLE_UNSAFE_TEMPLATE_SNIPPET);

    assert.equal(res.isSafe, true);
    assert.ok(res.riskScoreBefore > 0);
    assert.equal(res.riskScoreAfter, 0);
    assert.ok(res.countsByCategory.styling >= 4);
    assert.ok(!res.sanitizedCode.includes('#1E1B4B'));
    assert.ok(!res.sanitizedCode.includes('!important'));
    assert.ok(!res.sanitizedCode.includes('1280px'));
    assert.ok(res.sanitizedCode.includes('var(--theme-accent)'));
    assert.ok(res.sanitizedCode.includes('var(--font-sans)'));

    const rescan = sanitizeCodeSnippet(res.sanitizedCode);
    assert.equal(rescan.removedItems.length, 0);
    assert.equal(rescan.riskScoreAfter, 0);
    assert.equal(rescan.isSafe, true);
  });

  it('REUSE-01: matches PRD requirements against golden templates and computes token savings', () => {
    const webMatch = matchTemplates(
      'Build a responsive React 19 SaaS Platform dashboard with PostgreSQL 16 RLS isolation, OpenAPI 3.1 REST API, GDPR and DPDP consent compliance.',
      'SaaS Platform'
    );
    assert.ok(webMatch.matches.some((m) => m.templateId === 'golden-web-landing'));
    assert.ok(webMatch.matches.some((m) => m.templateId === 'golden-backend-api'));
    assert.ok(webMatch.totalReusabilityPercent > 0 && webMatch.totalReusabilityPercent <= 85);
    assert.ok(webMatch.totalEstimatedSavingsUsd > 0);

    const androidMatch = matchTemplates(
      'Build an Android mobile Kotlin Jetpack Compose app with offline sync and Fastify API integration.',
      'Mobile App API'
    );
    assert.ok(androidMatch.matches.some((m) => m.templateId === 'golden-mobile-android'));
  });

  it('REUSE-02: workspace defaults and FinOps calculator reflect reusability savings cleanly', () => {
    const ws = createDefaultProjectWorkspace(
      {
        id: 'proj-reuse-1',
        name: 'Nova Commerce',
        type: 'SaaS Platform',
        status: 'In Progress',
        healthPercent: 98,
        repoUrl: 'https://github.com/launchup/nova',
        branch: 'main',
        framework: 'React 19 + Fastify',
        serverTarget: 'Cloud Run',
        lastBackupDate: 'Just now',
        backupStatus: 'Healthy',
        clientIds: [],
      },
      []
    );

    assert.ok((ws.finops.reusabilityPercent ?? 0) > 0);
    assert.ok((ws.finops.reusabilityTokenSavingsUsd ?? 0) > 0);
    assert.ok(ws.finops.templateMatchResults);
    assert.equal(ws.finops.lastSanitizationResult?.isSafe, true);

    const summary = calculateProjectUnitEconomics(ws.finops);
    assert.ok(summary.reusabilitySavingsUsd > 0);
    assert.ok(summary.grossLlmCostWithoutReuseUsd > summary.estimatedLlmCost);
    assert.ok(summary.effectiveCostReductionPercent > 0);
  });
});
