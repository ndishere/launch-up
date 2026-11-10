import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { processQAVerification } from '../../services/qa-secops-service/src/lib/engine.ts';
import type {
  Mod06QAVerifyRequest,
  Mod06QAVerifyResponse,
} from '../../services/qa-secops-service/src/types/index.ts';
import {
  SecurityVulnFoundError,
  E2EAssertionFailError,
  LighthouseBelow90Error,
} from '../../services/qa-secops-service/src/types/index.ts';

function createQaSecopsHttpServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    const sendJson = (status: number, data: any) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(200, {
        status: 'ok',
        service: 'qa-secops-service',
        timestamp: new Date().toISOString(),
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/qa/verify') {
      let b = '';
      req.on('data', c => { b += c; });
      req.on('end', async () => {
        try {
          let body: Mod06QAVerifyRequest;
          try {
            body = JSON.parse(b);
          } catch {
            return sendJson(400, {
              success: false,
              code: 'ERR_VALIDATION',
              error: 'Malformed JSON payload',
            });
          }

          if (
            !body.project_id ||
            !body.web_staging_url ||
            !body.api_staging_url ||
            !body.signed_apk_url
          ) {
            return sendJson(400, {
              success: false,
              code: 'ERR_VALIDATION',
              error: 'Missing mandatory fields: project_id, web_staging_url, api_staging_url, signed_apk_url',
            });
          }

          const response: Mod06QAVerifyResponse = await processQAVerification(body);
          return sendJson(200, response);
        } catch (err: any) {
          if (err instanceof SecurityVulnFoundError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
              findings: err.findings,
            });
          }
          if (err instanceof E2EAssertionFailError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
              failedStories: err.failedStories,
              passRate: err.passRate,
            });
          }
          if (err instanceof LighthouseBelow90Error) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
              failingCategories: err.failingCategories,
            });
          }
          return sendJson(500, {
            success: false,
            code: 'ERR_QA_VERIFY',
            error: 'Internal Server Error',
          });
        }
      });
      return;
    }

    return sendJson(404, { error: 'Not Found' });
  });
}

describe('MOD-06: Autonomous QA, SecOps & Compliance Verifier (Integration & HTTP Contract Tests)', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    server = createQaSecopsHttpServer();
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('MOD06-INT-01: GET /health returns 200 OK with service identity', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.service, 'qa-secops-service');
  });

  it('MOD06-INT-02: POST /api/v1/qa/verify returns 200 and matches locked Mod06QAVerifyResponse contract', async () => {
    const payload: Mod06QAVerifyRequest = {
      project_id: 'proj-0006-0000-0000-000000000010',
      web_staging_url: 'https://preview-proj1.launchup.internal',
      api_staging_url: 'https://api-preview-proj1.launchup.internal',
      signed_apk_url: 'https://artifacts.launchup.internal/app-release.apk',
      user_stories: [
        {
          id: 'US-001',
          role: 'Customer',
          goal: 'Login and book courier service',
          acceptance_criteria: ['Expect booking success'],
        },
      ],
    };

    const res = await fetch(`${baseUrl}/api/v1/qa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const data: Mod06QAVerifyResponse = await res.json();

    assert.strictEqual(data.project_id, payload.project_id);
    assert.strictEqual(data.overall_pass, true);
    assert.strictEqual(data.playwright_pass_rate, 100.0);
    assert.strictEqual(data.semgrep_critical_findings, 0);
    assert.strictEqual(data.trivy_critical_cves, 0);
    assert.strictEqual(data.gitleaks_secrets_found, 0);
    assert.ok(data.lighthouse_scores.performance >= 90);
    assert.ok(data.lighthouse_scores.accessibility >= 90);
    assert.ok(data.lighthouse_scores.best_practices >= 90);
    assert.ok(data.lighthouse_scores.seo >= 90);
    assert.ok(data.approval_gate_id.startsWith('gate-0003-'));
  });

  it('MOD06-INT-03: POST /api/v1/qa/verify returns 400 on missing mandatory parameters', async () => {
    const invalidPayload = {
      project_id: 'proj-0006-0000-0000-000000000011',
      // missing web_staging_url, api_staging_url, signed_apk_url
    };

    const res = await fetch(`${baseUrl}/api/v1/qa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_VALIDATION');
  });

  it('MOD06-INT-04: POST /api/v1/qa/verify returns 406 ERR_SECURITY_VULN_FOUND on detected vulnerabilities', async () => {
    const vulnPayload: Mod06QAVerifyRequest = {
      project_id: 'proj-0006-0000-0000-000000000012',
      web_staging_url: 'https://preview-proj1.launchup.internal',
      api_staging_url: 'https://api-preview-proj1.launchup.internal',
      signed_apk_url: 'https://artifacts.launchup.internal/app-release.apk',
      user_stories: [],
      simulated_findings: {
        semgrep_critical_findings: 2,
        trivy_critical_cves: 1,
      },
    };

    const res = await fetch(`${baseUrl}/api/v1/qa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vulnPayload),
    });

    assert.strictEqual(res.status, 406);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_SECURITY_VULN_FOUND');
    assert.strictEqual(data.findings.semgrep, 2);
    assert.strictEqual(data.findings.trivy, 1);
  });

  it('MOD06-INT-05: POST /api/v1/qa/verify returns 422 ERR_E2E_ASSERTION_FAIL on broken user story flow', async () => {
    const brokenFlowPayload: Mod06QAVerifyRequest = {
      project_id: 'proj-0006-0000-0000-000000000013',
      web_staging_url: 'https://preview-proj1.launchup.internal',
      api_staging_url: 'https://api-preview-proj1.launchup.internal',
      signed_apk_url: 'https://artifacts.launchup.internal/app-release.apk',
      user_stories: [
        {
          id: 'US-001',
          role: 'Customer',
          goal: 'Login with OAuth',
          acceptance_criteria: ['Redirects to dashboard'],
        },
      ],
      simulated_findings: {
        failing_user_stories: ['US-001'],
      },
    };

    const res = await fetch(`${baseUrl}/api/v1/qa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brokenFlowPayload),
    });

    assert.strictEqual(res.status, 422);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_E2E_ASSERTION_FAIL');
    assert.deepStrictEqual(data.failedStories, ['US-001']);
  });

  it('MOD06-INT-06: POST /api/v1/qa/verify returns 422 ERR_LIGHTHOUSE_BELOW_90 when Lighthouse score is below 90', async () => {
    const lowLighthousePayload: Mod06QAVerifyRequest = {
      project_id: 'proj-0006-0000-0000-000000000014',
      web_staging_url: 'https://preview-proj1.launchup.internal',
      api_staging_url: 'https://api-preview-proj1.launchup.internal',
      signed_apk_url: 'https://artifacts.launchup.internal/app-release.apk',
      user_stories: [],
      simulated_findings: {
        custom_lighthouse_scores: {
          seo: 84, // Below 90!
        },
      },
    };

    const res = await fetch(`${baseUrl}/api/v1/qa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lowLighthousePayload),
    });

    assert.strictEqual(res.status, 422);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_LIGHTHOUSE_BELOW_90');
    assert.strictEqual(data.failingCategories.seo, 84);
  });
});
