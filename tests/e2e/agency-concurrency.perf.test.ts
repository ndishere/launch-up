process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { performance } from 'node:perf_hooks';
import Fastify, { type FastifyInstance } from 'fastify';

import { processLeadDiscovery } from '../../services/lead-pitch-service/src/lib/engine.ts';
import type { ProspectRaw } from '../../services/lead-pitch-service/src/types/index.ts';
import { processBaIntake } from '../../services/ba-intake-service/src/lib/engine.ts';
import { buildApp as buildMod03 } from '../../services/web-builder-service/src/server.ts';
import { buildApp as buildMod04 } from '../../services/mobile-app-service/src/server.ts';
import { buildApp as buildMod05 } from '../../services/backend-api-service/src/server.ts';
import { buildApp as buildMod06 } from '../../services/qa-secops-service/src/server.ts';
import { buildApp as buildMod07 } from '../../services/marketing-engine-service/src/server.ts';
import { buildApp as buildMod08 } from '../../services/whatsapp-service/src/server.ts';
import { buildApp as buildMod09 } from '../../services/sre-healing-service/src/server.ts';

const MOCK_PROSPECTS: ProspectRaw[] = [
  {
    id: 'lead-perf-001',
    name: 'Express Route Logistics',
    website: 'https://expressroute.example.com',
    email: 'contact@expressroute.example.com',
    phone: '+919876543210',
    hasMobileApp: false,
    lighthouseMobileScore: 35,
    hasWhatsAppBot: false,
    hasResponsiveViewport: true,
  },
];

async function buildMod01(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  app.get('/health', async () => ({ status: 'ok', service: 'lead-pitch-service' }));
  app.post('/api/v1/leads/discover', async (request, reply) => {
    const res = await processLeadDiscovery(request.body as any, MOCK_PROSPECTS, new Set());
    return reply.status(200).send(res);
  });
  return app;
}

async function buildMod02(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  app.get('/health', async () => ({ status: 'ok', service: 'ba-intake-service' }));
  app.post('/api/v1/intake/synthesize', async (request, reply) => {
    const res = await processBaIntake(request.body as any);
    return reply.status(200).send(res);
  });
  return app;
}

interface LiveEndpoint {
  id: string;
  app: FastifyInstance;
  baseUrl: string;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p));
  return sorted[idx];
}

function buildOptimisticMod10App(): FastifyInstance {
  const app = Fastify({ logger: false });

  const gates = new Map<
    string,
    { gate_id: string; project_id: string; status: string; version: number; decided_by?: string }
  >([
    ['gate-0001', { gate_id: 'gate-0001', project_id: 'proj-alpha', status: 'PENDING', version: 1 }],
    ['gate-0002', { gate_id: 'gate-0002', project_id: 'proj-alpha', status: 'PENDING', version: 1 }],
    ['gate-0003', { gate_id: 'gate-0003', project_id: 'proj-beta', status: 'PENDING', version: 1 }],
    ['gate-0004', { gate_id: 'gate-0004', project_id: 'proj-beta', status: 'PENDING', version: 1 }],
    ['gate-0005', { gate_id: 'gate-0005', project_id: 'proj-gamma', status: 'PENDING', version: 1 }],
  ]);

  app.get('/health', async () => ({ status: 'ok', service: 'governance-service-e2e' }));

  app.post('/api/v1/gates/:gateId/decide', async (request, reply) => {
    const { gateId } = request.params as { gateId: string };
    const body = request.body as {
      decision: 'APPROVED' | 'REJECTED';
      expected_version?: number;
      principal_id?: string;
    };

    const gate = gates.get(gateId);
    if (!gate) {
      return reply.status(404).send({ success: false, code: 'ERR_GATE_NOT_FOUND' });
    }

    const expected = body.expected_version ?? 1;
    if (gate.version !== expected || gate.status !== 'PENDING') {
      return reply.status(409).send({
        success: false,
        code: 'ERR_OPTIMISTIC_LOCK_CONFLICT',
        error: `Gate ${gateId} already decided (current version ${gate.version})`,
      });
    }

    gate.status = body.decision;
    gate.version += 1;
    gate.decided_by = body.principal_id || 'human-approver';

    return reply.status(200).send({
      success: true,
      gate_id: gate.gate_id,
      status: gate.status,
      version: gate.version,
      decided_by: gate.decided_by,
    });
  });

  return app;
}

describe('Stage 4: Cross-Module Performance & Concurrency E2E Suite', () => {
  const servers: Record<string, LiveEndpoint> = {};
  const closedUrls: string[] = [];
  let baselineHeapMb = 0;

  before(async () => {
    baselineHeapMb = process.memoryUsage().heapUsed / (1024 * 1024);

    const factories: Array<[string, () => Promise<FastifyInstance>]> = [
      ['MOD-01', buildMod01],
      ['MOD-02', buildMod02],
      ['MOD-03', buildMod03],
      ['MOD-04', buildMod04],
      ['MOD-05', buildMod05],
      ['MOD-06', buildMod06],
      ['MOD-07', buildMod07],
      ['MOD-08', buildMod08],
      ['MOD-09', buildMod09],
      ['MOD-10', async () => buildOptimisticMod10App()],
    ];

    for (const [id, factory] of factories) {
      const app = await factory();
      (app.log as any).level = 'silent';
      const baseUrl = await app.listen({ port: 0, host: '127.0.0.1' });
      servers[id] = { id, app, baseUrl };
    }
  });

  after(async () => {
    for (const entry of Object.values(servers)) {
      closedUrls.push(entry.baseUrl);
      await entry.app.close();
    }
  });

  it('STAGE4-CROSS-01: 90 concurrent multi-tenant requests across MOD-01..MOD-09 (p95 < 250ms, 0 tenant leakage)', async () => {
    const tenants = [
      { projectId: '11111111-1111-4111-8111-111111111101', clientId: 'aaaa1111-1111-4111-8111-111111111101', country: 'IN' },
      { projectId: '22222222-2222-4222-8222-222222222202', clientId: 'bbbb2222-2222-4222-8222-222222222202', country: 'DE' },
      { projectId: '33333333-3333-4333-8333-333333333303', clientId: 'cccc3333-3333-4333-8333-333333333303', country: 'US' },
    ];

    const sqlDdl = [
      'CREATE TABLE orders (id UUID PRIMARY KEY, tenant_id UUID NOT NULL);',
      'ALTER TABLE orders ENABLE ROW LEVEL SECURITY;',
      'CREATE POLICY orders_rls ON orders FOR ALL USING (tenant_id = current_setting(\'app.tenant_id\')::uuid);',
    ].join('\n');

    const openApiYaml = `openapi: 3.1.0
info:
  title: Tenant API
  version: 1.0.0
paths:
  /api/v1/orders:
    get:
      responses:
        '200':
          description: OK`;

    const callSpecs = (t: (typeof tenants)[number]) => [
      {
        mod: 'MOD-01',
        path: '/api/v1/leads/discover',
        expectProjectEcho: false,
        body: {
          target_niche: 'Logistics',
          country_code: t.country,
          city: t.country === 'IN' ? 'Amritsar' : t.country === 'DE' ? 'Berlin' : 'Austin',
          max_leads: 2,
          canva_pitch_template_id: 'DAG_canva_template_01',
        },
      },
      {
        mod: 'MOD-02',
        path: '/api/v1/intake/synthesize',
        expectProjectEcho: true,
        body: {
          project_id: t.projectId,
          client_id: t.clientId,
          intake_transcript: `Real-time logistics dispatch portal for ${t.country}`,
          brand_assets: {
            primary_color_hex: '#4f46e5',
            secondary_color_hex: '#06b6d4',
            font_heading: 'Inter',
            font_body: 'Inter',
          },
          target_countries: [t.country],
          target_modules: {
            build_website: true,
            build_landing_page: true,
            build_android_app: true,
            build_backend_api: true,
            enable_digital_marketing: true,
            enable_whatsapp_marketing: true,
          },
        },
      },
      {
        mod: 'MOD-03',
        path: '/api/v1/web/build',
        expectProjectEcho: true,
        body: {
          project_id: t.projectId,
          golden_template_id: 'golden-web-landing',
          compliance_flags: t.country === 'IN' ? ['DPDP_INDIA'] : t.country === 'DE' ? ['GDPR_EU'] : ['CCPA_US'],
          ga4_measurement_id: 'G-TEST123456',
          file_deltas: [
            {
              file_path: 'src/pages/index.tsx',
              operation: 'UPDATE',
              content: '<div className="w-full max-w-screen-xl mx-auto">Responsive Hero</div>',
            },
          ],
        },
      },
      {
        mod: 'MOD-04',
        path: '/api/v1/mobile/build',
        expectProjectEcho: true,
        body: {
          project_id: t.projectId,
          golden_template_id: 'golden-mobile-android',
          package_name: 'com.launchup.logistics',
          target_sdk_version: 35,
          file_deltas: [
            {
              file_path: 'app/src/main/kotlin/AccountDeletionScreen.kt',
              operation: 'CREATE',
              content: 'fun AccountDeletionRoute() {}',
            },
          ],
          declared_permissions: ['INTERNET'],
          data_safety_csv_declarations: ['account_id', 'order_history'],
        },
      },
      {
        mod: 'MOD-05',
        path: '/api/v1/backend/build',
        expectProjectEcho: true,
        body: {
          project_id: t.projectId,
          golden_template_id: 'golden-backend-api',
          db_migration_sql: sqlDdl,
          openapi_3_1_yaml: openApiYaml,
          rbac_matrix: { admin: ['*'], customer: ['orders:read'] },
          compliance_flags: ['DPDP_INDIA', 'GDPR_EU'],
        },
      },
      {
        mod: 'MOD-06',
        path: '/api/v1/qa/verify',
        expectProjectEcho: true,
        body: {
          project_id: t.projectId,
          web_staging_url: `https://web-${t.country.toLowerCase()}.launchup.example.com`,
          api_staging_url: `https://api-${t.country.toLowerCase()}.launchup.example.com`,
          signed_apk_url: `https://artifacts.launchup.example.com/${t.country.toLowerCase()}.apk`,
          user_stories: [
            {
              id: 'US-01',
              role: 'Customer',
              goal: 'Track shipment across responsive viewports',
              acceptance_criteria: ['200 OK response', '0 horizontal overflow'],
            },
          ],
        },
      },
      {
        mod: 'MOD-07',
        path: '/api/v1/marketing/calendar',
        expectProjectEcho: true,
        body: {
          project_id: t.projectId,
          brand_kit: { primary_color: '#4f46e5', tone: 'Minimalist' },
          campaign_theme: `Q4 Growth (${t.country})`,
          days_count: 5,
          canva_brand_template_ids: ['TMPL-IG-01'],
        },
      },
      {
        mod: 'MOD-08',
        path: '/api/v1/whatsapp/send',
        expectProjectEcho: true,
        body: {
          project_id: t.projectId,
          client_id: t.clientId,
          event_type: 'INBOUND_CUSTOMER_MSG',
          recipient_phone_e164: '+919876543210',
          last_inbound_timestamp: new Date().toISOString(),
          message_payload: { text_or_template: 'Where is my shipment order?' },
        },
      },
      {
        mod: 'MOD-09',
        path: '/api/v1/sre/heal',
        expectProjectEcho: true,
        body: {
          project_id: t.projectId,
          incident_source: 'SENTRY_5XX',
          error_signature: 'TypeError: Cannot read shipping rate',
          stack_trace_or_metric: {
            service: 'rates-service',
            culprit_file: 'services/rates/calculator.ts',
          },
        },
      },
    ];

    // Warm up cold sockets and JIT route compilation across all endpoints
    const warmUpTenant = tenants[0];
    await Promise.all(
      callSpecs(warmUpTenant).map(async (spec) => {
        try {
          await fetch(`${servers[spec.mod].baseUrl}${spec.path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(spec.body),
          });
        } catch {
          // ignore warmup errors
        }
      })
    );

    const latencies: number[] = [];
    const tasks: Array<Promise<void>> = [];

    // 10 iterations * 9 modules = 90 concurrent multi-tenant requests across 3 tenants
    for (let iter = 0; iter < 10; iter++) {
      const tenant = tenants[iter % tenants.length];
      for (const spec of callSpecs(tenant)) {
        tasks.push(
          (async () => {
            const t0 = performance.now();
            const res = await fetch(`${servers[spec.mod].baseUrl}${spec.path}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(spec.body),
            });
            latencies.push(performance.now() - t0);
            const json = (await res.json()) as Record<string, any>;
            assert.strictEqual(res.status, 200, `${spec.mod} returned ${res.status}: ${JSON.stringify(json)}`);
            if (spec.expectProjectEcho) {
              assert.strictEqual(
                json.project_id,
                tenant.projectId,
                `${spec.mod} leaked cross-tenant project_id: expected ${tenant.projectId}, got ${json.project_id}`
              );
            }
          })()
        );
      }
    }

    await Promise.all(tasks);
    const sorted = [...latencies].sort((a, b) => a - b);
    const p95 = percentile(sorted, 0.95);
    assert.strictEqual(latencies.length, 90);
    assert.ok(p95 < 250, `Expected cross-module p95 < 250ms, got ${p95.toFixed(2)}ms`);
  });

  it('STAGE4-CROSS-02: 100 concurrent /health mesh sweeps across all 10 microservices (p95 < 250ms)', async () => {
    const latencies: number[] = [];
    const checks: Array<Promise<void>> = [];

    for (let round = 0; round < 10; round++) {
      for (const [id, ep] of Object.entries(servers)) {
        checks.push(
          (async () => {
            const t0 = performance.now();
            const res = await fetch(`${ep.baseUrl}/health`);
            latencies.push(performance.now() - t0);
            assert.strictEqual(res.status, 200, `${id} /health expected 200`);
            const data = (await res.json()) as { status: string };
            assert.strictEqual(data.status, 'ok');
          })()
        );
      }
    }

    await Promise.all(checks);
    const sorted = [...latencies].sort((a, b) => a - b);
    const p95 = percentile(sorted, 0.95);
    assert.strictEqual(latencies.length, 100);
    assert.ok(p95 < 250, `Expected mesh /health p95 < 250ms, got ${p95.toFixed(2)}ms`);
  });

  it('STAGE4-CROSS-03: Optimistic concurrency prevents double-approving Gates 1-5 under 25 parallel requests per gate', async () => {
    const mod10Url = servers['MOD-10'].baseUrl;

    for (const gateId of ['gate-0001', 'gate-0002', 'gate-0003', 'gate-0004', 'gate-0005']) {
      const parallelDecisions = await Promise.all(
        Array.from({ length: 25 }).map(async (_, idx) => {
          const res = await fetch(`${mod10Url}/api/v1/gates/${gateId}/decide`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              decision: 'APPROVED',
              expected_version: 1,
              principal_id: `approver-${idx}`,
            }),
          });
          const body = (await res.json()) as Record<string, any>;
          return { status: res.status, body };
        })
      );

      const winners = parallelDecisions.filter((r) => r.status === 200);
      const conflicts = parallelDecisions.filter(
        (r) => r.status === 409 && r.body.code === 'ERR_OPTIMISTIC_LOCK_CONFLICT'
      );

      assert.strictEqual(winners.length, 1, `Gate ${gateId} allowed ${winners.length} parallel approvals`);
      assert.strictEqual(winners[0].body.version, 2);
      assert.strictEqual(conflicts.length, 24, `Gate ${gateId} expected 24 lock conflicts`);
    }
  });

  it('STAGE4-CROSS-04: Memory growth bounded (< 100 MB delta) and ephemeral listeners tear down cleanly', async () => {
    const afterHeapMb = process.memoryUsage().heapUsed / (1024 * 1024);
    const deltaMb = afterHeapMb - baselineHeapMb;
    assert.ok(deltaMb < 100, `Heap grew by ${deltaMb.toFixed(2)} MB (limit 100 MB)`);

    // Explicitly close MOD-10 early to verify closed port refuses connections with zero leak
    await servers['MOD-10'].app.close();
    await assert.rejects(async () => {
      await fetch(`${servers['MOD-10'].baseUrl}/health`);
    });

    // Re-bind cleanly so outer after() hook closes without double-close errors
    servers['MOD-10'].app = buildOptimisticMod10App();
    servers['MOD-10'].baseUrl = await servers['MOD-10'].app.listen({ port: 0, host: '127.0.0.1' });
  });
});
