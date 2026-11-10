import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { processSREIncident } from '../../services/sre-healing-service/src/lib/engine.ts';
import type {
  Mod09SRERequest,
  Mod09SREResponse,
} from '../../services/sre-healing-service/src/types/index.ts';
import {
  validateSRERequest,
  ForbiddenFileTouchError,
  ReproductionFailedError,
  HotfixBrokeTestsError,
  MaxRetriesExceededError,
  ValidationError,
} from '../../services/sre-healing-service/src/types/index.ts';

function createSREHttpServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    const sendJson = (status: number, data: any, headers: Record<string, string> = {}) => {
      res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
      res.end(JSON.stringify(data));
    };

    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(200, {
        status: 'ok',
        service: 'sre-healing-service',
        timestamp: new Date().toISOString(),
      });
    }

    if (
      req.method === 'POST' &&
      (url.pathname === '/api/v1/sre/heal' || url.pathname === '/api/v1/sre/webhook')
    ) {
      let b = '';
      req.on('data', chunk => {
        b += chunk;
      });
      req.on('end', async () => {
        try {
          let parsed: any;
          try {
            parsed = JSON.parse(b);
          } catch {
            return sendJson(400, {
              success: false,
              code: 'ERR_VALIDATION_FAILED',
              error: 'Malformed JSON payload',
            });
          }

          let validated: Mod09SRERequest;
          try {
            validated = validateSRERequest(parsed);
          } catch (valErr: any) {
            return sendJson(400, {
              success: false,
              code: 'ERR_VALIDATION_FAILED',
              error: valErr.message,
            });
          }

          const response: Mod09SREResponse = await processSREIncident(validated);
          return sendJson(200, response);
        } catch (err: any) {
          if (err instanceof ForbiddenFileTouchError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
            });
          }
          if (err instanceof ReproductionFailedError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
            });
          }
          if (err instanceof HotfixBrokeTestsError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
            });
          }
          if (err instanceof MaxRetriesExceededError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
            });
          }
          if (err instanceof ValidationError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
            });
          }

          return sendJson(500, {
            success: false,
            code: 'ERR_INTERNAL_SERVER_ERROR',
            error: err.message || 'Internal server error',
          });
        }
      });
      return;
    }

    sendJson(404, { success: false, error: 'Route not found' });
  });
}

describe('MOD-09: Autonomous SRE & Self-Healing Backend Operations (Integration & HTTP Contract Tests)', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    server = createSREHttpServer();
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const address = server.address() as any;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it('MOD09-INT-01: GET /health returns 200 OK with service identity', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.status, 'ok');
    assert.strictEqual(body.service, 'sre-healing-service');
    assert.ok(body.timestamp);
  });

  it('MOD09-INT-02: POST /api/v1/sre/heal returns 200 and matches locked Mod09SREResponse contract', async () => {
    const payload: Mod09SRERequest = {
      project_id: 'proj-0009-0000-0000-000000000010',
      incident_source: 'SENTRY_5XX',
      error_signature: 'ZeroDivisionError in /api/v1/rates',
      stack_trace_or_metric: {
        file: 'services/rates.py',
        line: 42,
      },
    };

    const res = await fetch(`${baseUrl}/api/v1/sre/heal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const body: Mod09SREResponse = await res.json();

    assert.strictEqual(body.project_id, payload.project_id);
    assert.strictEqual(body.is_external_third_party_outage, false);
    assert.ok(body.rca_summary.length > 0);
    assert.ok(Array.isArray(body.impacted_graphify_nodes));
    assert.ok(body.hotfix_pr_url.startsWith('https://github.com/'));
    assert.strictEqual(body.sandbox_regression_passed, true);
    assert.ok(body.approval_gate_id.startsWith('gate-0005-'));
  });

  it('MOD09-INT-03: POST /api/v1/sre/heal returns 400 on missing or invalid parameters', async () => {
    const invalidPayload = {
      project_id: 'proj-0009-0000-0000-000000000011',
      incident_source: 'INVALID_SOURCE',
    };

    const res = await fetch(`${baseUrl}/api/v1/sre/heal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'ERR_VALIDATION_FAILED');
  });

  it('MOD09-INT-04: POST /api/v1/sre/heal returns 403 ERR_FORBIDDEN_FILE_TOUCH on attempted touch of RLS/Auth files', async () => {
    const payload: Mod09SRERequest = {
      project_id: 'proj-0009-0000-0000-000000000012',
      incident_source: 'SENTRY_5XX',
      error_signature: 'PermissionError in auth middleware',
      stack_trace_or_metric: {
        attempted_touch_file: 'services/auth-service/src/middleware/auth.ts',
      },
    };

    const res = await fetch(`${baseUrl}/api/v1/sre/heal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'ERR_FORBIDDEN_FILE_TOUCH');
  });

  it('MOD09-INT-05: POST /api/v1/sre/heal returns 422 ERR_REPRODUCTION_FAILED on failed sandbox reproduction', async () => {
    const payload: Mod09SRERequest = {
      project_id: 'proj-0009-0000-0000-000000000013',
      incident_source: 'SENTRY_5XX',
      error_signature: 'NonReproducibleRaceCondition',
      stack_trace_or_metric: {},
      simulate_reproduction_failure: true,
    };

    const res = await fetch(`${baseUrl}/api/v1/sre/heal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 422);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'ERR_REPRODUCTION_FAILED');
  });

  it('MOD09-INT-06: POST /api/v1/sre/heal returns 409 ERR_HOTFIX_BROKE_TESTS when patch breaks regression tests', async () => {
    const payload: Mod09SRERequest = {
      project_id: 'proj-0009-0000-0000-000000000014',
      incident_source: 'SENTRY_5XX',
      error_signature: 'RegressionTriggeringBug',
      stack_trace_or_metric: {},
      simulate_patch_test_failure: true,
    };

    const res = await fetch(`${baseUrl}/api/v1/sre/heal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 409);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'ERR_HOTFIX_BROKE_TESTS');
  });

  it('MOD09-INT-07: POST /api/v1/sre/heal returns 508 ERR_MAX_RETRIES_EXCEEDED when retry limit is reached', async () => {
    const payload: Mod09SRERequest = {
      project_id: 'proj-0009-0000-0000-000000000015',
      incident_source: 'SENTRY_5XX',
      error_signature: 'PersistentFailureLoop',
      stack_trace_or_metric: {},
      simulate_max_retries: true,
    };

    const res = await fetch(`${baseUrl}/api/v1/sre/heal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 508);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'ERR_MAX_RETRIES_EXCEEDED');
  });
});
