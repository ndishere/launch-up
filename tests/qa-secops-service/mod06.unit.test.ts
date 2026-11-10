import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  processQAVerification,
  validateLighthouseScores,
  runSecurityAudit,
  runPlaywrightE2E,
} from '../../services/qa-secops-service/src/lib/engine.ts';
import type {
  Mod06QAVerifyRequest,
  Mod06QAVerifyResponse,
} from '../../services/qa-secops-service/src/types/index.ts';
import {
  SecurityVulnFoundError,
  E2EAssertionFailError,
  LighthouseBelow90Error,
} from '../../services/qa-secops-service/src/types/index.ts';

describe('MOD-06: Autonomous QA, SecOps & Compliance Verifier (Unit Tests)', () => {
  describe('Positive Scenarios (Happy Path)', () => {
    it('TEST-MOD06-POS-01: Full verification pass: 100% E2E, 0 security issues, Lighthouse >= 90 produces Gate 3', async () => {
      const request: Mod06QAVerifyRequest = {
        project_id: 'proj-0006-0000-0000-000000000001',
        web_staging_url: 'https://preview-proj1.launchup.internal',
        api_staging_url: 'https://api-preview-proj1.launchup.internal',
        signed_apk_url: 'https://artifacts.launchup.internal/app-release.apk',
        user_stories: [
          {
            id: 'US-001',
            role: 'Customer',
            goal: 'Browse catalog and add item to cart',
            acceptance_criteria: ['Given catalog, When tapped, Item is in cart'],
          },
          {
            id: 'US-002',
            role: 'Customer',
            goal: 'Checkout with credit card or UPI',
            acceptance_criteria: ['Given cart, When paid, Order ID is generated'],
          },
        ],
      };

      const response: Mod06QAVerifyResponse = await processQAVerification(request);

      assert.strictEqual(response.project_id, request.project_id);
      assert.strictEqual(response.overall_pass, true);
      assert.strictEqual(response.playwright_pass_rate, 100.0);
      assert.strictEqual(response.semgrep_critical_findings, 0);
      assert.strictEqual(response.trivy_critical_cves, 0);
      assert.strictEqual(response.gitleaks_secrets_found, 0);
      assert.ok(response.lighthouse_scores.performance >= 90);
      assert.ok(response.lighthouse_scores.accessibility >= 90);
      assert.ok(response.lighthouse_scores.best_practices >= 90);
      assert.ok(response.lighthouse_scores.seo >= 90);
      assert.ok(typeof response.approval_gate_id === 'string' && response.approval_gate_id.length > 10);
    });

    it('TEST-MOD06-POS-02: Strict compliance with locked Mod06QAVerifyResponse contract schema', async () => {
      const request: Mod06QAVerifyRequest = {
        project_id: 'proj-0006-0000-0000-000000000002',
        web_staging_url: 'https://preview-proj2.launchup.internal',
        api_staging_url: 'https://api-preview-proj2.launchup.internal',
        signed_apk_url: 'https://artifacts.launchup.internal/app-release2.apk',
        user_stories: [],
      };

      const res: Mod06QAVerifyResponse = await processQAVerification(request);

      const expectedKeys = [
        'project_id',
        'overall_pass',
        'playwright_pass_rate',
        'semgrep_critical_findings',
        'trivy_critical_cves',
        'gitleaks_secrets_found',
        'lighthouse_scores',
        'approval_gate_id',
      ].sort();

      assert.deepStrictEqual(Object.keys(res).sort(), expectedKeys);
    });
  });

  describe('Negative Scenarios (Deterministic Error Codes)', () => {
    it('TEST-MOD06-NEG-01: Security finding (Semgrep/Trivy/Gitleaks) rejects with 406 ERR_SECURITY_VULN_FOUND', async () => {
      const requestWithVulnerability: Mod06QAVerifyRequest = {
        project_id: 'proj-0006-0000-0000-000000000003',
        web_staging_url: 'https://preview-proj1.launchup.internal',
        api_staging_url: 'https://api-preview-proj1.launchup.internal',
        signed_apk_url: 'https://artifacts.launchup.internal/app-release.apk',
        user_stories: [],
        simulated_findings: {
          semgrep_critical_findings: 1, // Detected SQL injection sink
          gitleaks_secrets_found: 1,     // Detected hardcoded token
        },
      };

      await assert.rejects(
        async () => {
          await processQAVerification(requestWithVulnerability);
        },
        (err: any) => {
          assert.strictEqual(err instanceof SecurityVulnFoundError, true);
          assert.strictEqual(err.code, 'ERR_SECURITY_VULN_FOUND');
          assert.strictEqual(err.statusCode, 406);
          assert.strictEqual(err.findings?.semgrep, 1);
          assert.strictEqual(err.findings?.gitleaks, 1);
          return true;
        }
      );
    });

    it('TEST-MOD06-NEG-02: Playwright E2E assertion failure rejects with 422 ERR_E2E_ASSERTION_FAIL', async () => {
      const requestWithE2EFailure: Mod06QAVerifyRequest = {
        project_id: 'proj-0006-0000-0000-000000000004',
        web_staging_url: 'https://preview-proj1.launchup.internal',
        api_staging_url: 'https://api-preview-proj1.launchup.internal',
        signed_apk_url: 'https://artifacts.launchup.internal/app-release.apk',
        user_stories: [
          {
            id: 'US-001',
            role: 'Customer',
            goal: 'Checkout cart',
            acceptance_criteria: ['Expect order confirmation page'],
          },
        ],
        simulated_findings: {
          failing_user_stories: ['US-001'],
        },
      };

      await assert.rejects(
        async () => {
          await processQAVerification(requestWithE2EFailure);
        },
        (err: any) => {
          assert.strictEqual(err instanceof E2EAssertionFailError, true);
          assert.strictEqual(err.code, 'ERR_E2E_ASSERTION_FAIL');
          assert.strictEqual(err.statusCode, 422);
          assert.deepStrictEqual(err.failedStories, ['US-001']);
          return true;
        }
      );
    });

    it('TEST-MOD06-NEG-03: Lighthouse score below 90 rejects with 422 ERR_LIGHTHOUSE_BELOW_90', async () => {
      const requestWithLowLighthouse: Mod06QAVerifyRequest = {
        project_id: 'proj-0006-0000-0000-000000000005',
        web_staging_url: 'https://preview-proj1.launchup.internal',
        api_staging_url: 'https://api-preview-proj1.launchup.internal',
        signed_apk_url: 'https://artifacts.launchup.internal/app-release.apk',
        user_stories: [],
        simulated_findings: {
          custom_lighthouse_scores: {
            performance: 78, // Below 90!
          },
        },
      };

      await assert.rejects(
        async () => {
          await processQAVerification(requestWithLowLighthouse);
        },
        (err: any) => {
          assert.strictEqual(err instanceof LighthouseBelow90Error, true);
          assert.strictEqual(err.code, 'ERR_LIGHTHOUSE_BELOW_90');
          assert.strictEqual(err.statusCode, 422);
          assert.strictEqual(err.failingCategories?.performance, 78);
          return true;
        }
      );
    });
  });

  describe('Rare & Edge Scenarios', () => {
    it('TEST-MOD06-RARE-01: Empty user stories list runs default smoke tests and succeeds', async () => {
      const request: Mod06QAVerifyRequest = {
        project_id: 'proj-0006-0000-0000-000000000006',
        web_staging_url: 'https://preview-proj6.launchup.internal',
        api_staging_url: 'https://api-preview-proj6.launchup.internal',
        signed_apk_url: 'https://artifacts.launchup.internal/app-release6.apk',
        user_stories: [],
      };

      const response = await processQAVerification(request);
      assert.strictEqual(response.overall_pass, true);
      assert.strictEqual(response.playwright_pass_rate, 100.0);
    });

    it('TEST-MOD06-RARE-02: Lighthouse validation helper throws on any sub-90 category', () => {
      assert.throws(
        () => {
          validateLighthouseScores({
            performance: 92,
            accessibility: 88, // Below 90
            best_practices: 95,
            seo: 94,
          });
        },
        (err: any) => {
          assert.strictEqual(err instanceof LighthouseBelow90Error, true);
          assert.strictEqual(err.failingCategories?.accessibility, 88);
          return true;
        }
      );
    });
  });
});
