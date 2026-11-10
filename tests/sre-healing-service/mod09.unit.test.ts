import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  processSREIncident,
  isExternalThirdPartyOutage,
  resolveImpactedGraphifyNodes,
} from '../../services/sre-healing-service/src/lib/engine.ts';
import type {
  Mod09SRERequest,
  Mod09SREResponse,
} from '../../services/sre-healing-service/src/types/index.ts';
import {
  ForbiddenFileTouchError,
  ReproductionFailedError,
  HotfixBrokeTestsError,
  MaxRetriesExceededError,
} from '../../services/sre-healing-service/src/types/index.ts';

describe('MOD-09: Autonomous SRE & Self-Healing Backend Operations (Unit Tests)', () => {
  describe('Positive Scenarios (Happy Path)', () => {
    it('TEST-MOD09-POS-01: Ingest Sentry 500 error, resolve Graphify AST nodes, verify sandbox regression, issue Gate 5', async () => {
      const request: Mod09SRERequest = {
        project_id: 'proj-0009-0000-0000-000000000001',
        incident_source: 'SENTRY_5XX',
        error_signature: 'ZeroDivisionError in /api/v1/rates',
        stack_trace_or_metric: {
          file: 'services/rates.py',
          line: 42,
          exception: 'ZeroDivisionError: division by zero in calculate_shipping_rates()',
          frames: [
            { function: 'handle_quote_request', file: 'services/rates.py', line: 20 },
            { function: 'calculate_shipping_rates', file: 'services/rates.py', line: 42 },
          ],
        },
      };

      const response: Mod09SREResponse = await processSREIncident(request);

      assert.strictEqual(response.project_id, request.project_id);
      assert.strictEqual(response.is_external_third_party_outage, false);
      assert.ok(response.rca_summary.includes('ZeroDivisionError'));
      assert.ok(response.impacted_graphify_nodes.length > 0);
      assert.ok(response.hotfix_pr_url.startsWith('https://github.com/'));
      assert.strictEqual(response.sandbox_regression_passed, true);
      assert.ok(response.approval_gate_id.startsWith('gate-0005-'));
    });

    it('TEST-MOD09-POS-02: Handle Uptime Kuma downtime event with successful service health recovery', async () => {
      const request: Mod09SRERequest = {
        project_id: 'proj-0009-0000-0000-000000000002',
        incident_source: 'UPTIME_KUMA_DOWN',
        error_signature: 'HTTP 503 Service Unavailable on /api/v1/health',
        stack_trace_or_metric: {
          consecutive_failures: 3,
          latency_ms: 12500,
          endpoint: '/api/v1/health',
          component: 'redis-connection-pool',
        },
      };

      const response: Mod09SREResponse = await processSREIncident(request);

      assert.strictEqual(response.project_id, request.project_id);
      assert.strictEqual(response.is_external_third_party_outage, false);
      assert.strictEqual(response.sandbox_regression_passed, true);
      assert.ok(response.approval_gate_id.startsWith('gate-0005-'));
    });

    it('TEST-MOD09-POS-03: Strict compliance with locked Mod09SREResponse contract schema', async () => {
      const request: Mod09SRERequest = {
        project_id: 'proj-0009-0000-0000-000000000003',
        incident_source: 'SENTRY_5XX',
        error_signature: 'NullPointerException in PaymentStatusListener',
        stack_trace_or_metric: {
          file: 'services/listener.ts',
          line: 88,
        },
      };

      const response: Mod09SREResponse = await processSREIncident(request);

      const keys = Object.keys(response).sort();
      const expectedKeys = [
        'project_id',
        'is_external_third_party_outage',
        'rca_summary',
        'impacted_graphify_nodes',
        'hotfix_pr_url',
        'sandbox_regression_passed',
        'approval_gate_id',
      ].sort();

      assert.deepStrictEqual(keys, expectedKeys);
      assert.strictEqual(typeof response.project_id, 'string');
      assert.strictEqual(typeof response.is_external_third_party_outage, 'boolean');
      assert.strictEqual(typeof response.rca_summary, 'string');
      assert.ok(Array.isArray(response.impacted_graphify_nodes));
      assert.strictEqual(typeof response.hotfix_pr_url, 'string');
      assert.strictEqual(typeof response.sandbox_regression_passed, 'boolean');
      assert.strictEqual(typeof response.approval_gate_id, 'string');
    });
  });

  describe('Negative Scenarios (Deterministic Error Codes)', () => {
    it('TEST-MOD09-NEG-01: Modification of forbidden security file rejects with 403 ERR_FORBIDDEN_FILE_TOUCH', async () => {
      const request: Mod09SRERequest = {
        project_id: 'proj-0009-0000-0000-000000000004',
        incident_source: 'SENTRY_5XX',
        error_signature: 'PermissionDeniedError in middleware',
        stack_trace_or_metric: {
          attempted_touch_file: 'database/migrations/002_mod10_rbac_finops.sql', // Protected RLS file!
        },
        simulate_forbidden_file_touch: true,
      };

      await assert.rejects(
        async () => {
          await processSREIncident(request);
        },
        (err: any) => {
          assert.strictEqual(err.name, 'ForbiddenFileTouchError');
          assert.strictEqual(err.code, 'ERR_FORBIDDEN_FILE_TOUCH');
          assert.strictEqual(err.statusCode, 403);
          return true;
        }
      );
    });

    it('TEST-MOD09-NEG-02: Sandbox reproduction failure rejects with 422 ERR_REPRODUCTION_FAILED', async () => {
      const request: Mod09SRERequest = {
        project_id: 'proj-0009-0000-0000-000000000005',
        incident_source: 'SENTRY_5XX',
        error_signature: 'TransientHeisenbug in background task',
        stack_trace_or_metric: {},
        simulate_reproduction_failure: true,
      };

      await assert.rejects(
        async () => {
          await processSREIncident(request);
        },
        (err: any) => {
          assert.strictEqual(err.name, 'ReproductionFailedError');
          assert.strictEqual(err.code, 'ERR_REPRODUCTION_FAILED');
          assert.strictEqual(err.statusCode, 422);
          return true;
        }
      );
    });

    it('TEST-MOD09-NEG-03: Hotfix patch breaks existing tests in sandbox, rejects with 409 ERR_HOTFIX_BROKE_TESTS', async () => {
      const request: Mod09SRERequest = {
        project_id: 'proj-0009-0000-0000-000000000006',
        incident_source: 'SENTRY_5XX',
        error_signature: 'BadParameterError in parser',
        stack_trace_or_metric: {},
        simulate_patch_test_failure: true,
      };

      await assert.rejects(
        async () => {
          await processSREIncident(request);
        },
        (err: any) => {
          assert.strictEqual(err.name, 'HotfixBrokeTestsError');
          assert.strictEqual(err.code, 'ERR_HOTFIX_BROKE_TESTS');
          assert.strictEqual(err.statusCode, 409);
          return true;
        }
      );
    });

    it('TEST-MOD09-NEG-04: Maximum hotfix retry budget (3 attempts) exceeded rejects with 508 ERR_MAX_RETRIES_EXCEEDED', async () => {
      const request: Mod09SRERequest = {
        project_id: 'proj-0009-0000-0000-000000000007',
        incident_source: 'SENTRY_5XX',
        error_signature: 'ComplexCyclicDependencyError',
        stack_trace_or_metric: {},
        simulate_max_retries: true,
      };

      await assert.rejects(
        async () => {
          await processSREIncident(request);
        },
        (err: any) => {
          assert.strictEqual(err.name, 'MaxRetriesExceededError');
          assert.strictEqual(err.code, 'ERR_MAX_RETRIES_EXCEEDED');
          assert.strictEqual(err.statusCode, 508);
          return true;
        }
      );
    });
  });

  describe('Rare & Edge Scenarios', () => {
    it('TEST-MOD09-RARE-01: Third-party outage detection identifies upstream provider down, skips code patch', async () => {
      const request: Mod09SRERequest = {
        project_id: 'proj-0009-0000-0000-000000000008',
        incident_source: 'SENTRY_5XX',
        error_signature: 'StripeConnectionError: 502 Bad Gateway from api.stripe.com',
        stack_trace_or_metric: {
          upstream_host: 'api.stripe.com',
          http_status: 502,
          provider: 'STRIPE',
        },
      };

      const response: Mod09SREResponse = await processSREIncident(request);

      assert.strictEqual(response.is_external_third_party_outage, true);
      assert.ok(response.rca_summary.includes('third-party'));
      assert.strictEqual(response.hotfix_pr_url, '');
      assert.strictEqual(response.sandbox_regression_passed, true);
      assert.ok(response.approval_gate_id.startsWith('gate-0005-'));
    });

    it('TEST-MOD09-RARE-02: GA4 conversion drop metric anomaly triggers automated telemetry diagnostic without code patch', async () => {
      const request: Mod09SRERequest = {
        project_id: 'proj-0009-0000-0000-000000000009',
        incident_source: 'GA4_CONVERSION_DROP',
        error_signature: 'Checkout conversion rate dropped from 4.8% to 0.4% in 60m',
        stack_trace_or_metric: {
          metric: 'ecommerce_purchase',
          drop_percentage: 91.6,
          traffic_source: 'direct',
        },
      };

      const response: Mod09SREResponse = await processSREIncident(request);

      assert.strictEqual(response.project_id, request.project_id);
      assert.ok(response.rca_summary.includes('GA4'));
      assert.strictEqual(response.sandbox_regression_passed, true);
    });
  });
});
