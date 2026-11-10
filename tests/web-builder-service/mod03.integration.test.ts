import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { processWebBuild } from '../../services/web-builder-service/src/lib/engine.ts';
import type {
  Mod03WebBuildRequest,
  Mod03WebBuildResponse,
} from '../../services/web-builder-service/src/types/index.ts';
import {
  BuildCompileError,
  ViewportOverflowError,
  SandboxTimeoutError,
} from '../../services/web-builder-service/src/types/index.ts';

function createWebBuilderHttpServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    const sendJson = (status: number, data: any) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(200, {
        status: 'ok',
        service: 'web-builder-service',
        timestamp: new Date().toISOString(),
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/web/build') {
      let b = '';
      req.on('data', c => { b += c; });
      req.on('end', async () => {
        try {
          let body: Mod03WebBuildRequest;
          try {
            body = JSON.parse(b);
          } catch {
            return sendJson(400, {
              success: false,
              code: 'ERR_VALIDATION',
              error: 'Malformed JSON payload',
            });
          }

          if (!body.project_id || !body.golden_template_id || !Array.isArray(body.file_deltas)) {
            return sendJson(400, {
              success: false,
              code: 'ERR_VALIDATION',
              error: 'Missing mandatory fields: project_id, golden_template_id, or file_deltas',
            });
          }

          const simulateTimeout = (body as any).simulate_timeout === true;

          const response: Mod03WebBuildResponse = await processWebBuild(body, {
            simulateTimeout,
          });

          return sendJson(200, response);
        } catch (err: any) {
          if (err instanceof ViewportOverflowError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
              viewport: err.viewport,
              culprit: err.culprit,
            });
          }
          if (err instanceof BuildCompileError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
            });
          }
          if (err instanceof SandboxTimeoutError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
            });
          }
          return sendJson(500, {
            success: false,
            code: 'ERR_BUILD_COMPILE',
            error: 'Internal Server Error',
          });
        }
      });
      return;
    }

    return sendJson(404, { error: 'Not Found' });
  });
}

describe('MOD-03: Responsive Web & Landing Builder (Integration & HTTP Contract Tests)', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    server = createWebBuilderHttpServer();
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

  it('MOD03-INT-01: GET /health returns 200 OK with service identity', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.service, 'web-builder-service');
  });

  it('MOD03-INT-02: POST /api/v1/web/build returns 200 and matches locked Mod03WebBuildResponse contract', async () => {
    const payload: Mod03WebBuildRequest = {
      project_id: 'proj-0003-0000-0000-000000000010',
      golden_template_id: 'golden-web-landing',
      openapi_3_1_yaml: 'openapi: 3.1.0',
      brand_assets: {
        primary_color_hex: '#0F172A',
        secondary_color_hex: '#3B82F6',
      },
      compliance_flags: ['GDPR_EU', 'DPDP_INDIA'],
      ga4_measurement_id: 'G-XXXXXXXXXX',
      file_deltas: [
        {
          file_path: 'src/app/booking/page.tsx',
          operation: 'CREATE',
          linked_user_story_ids: ['US-001'],
          content: '<main className="w-full max-w-5xl mx-auto px-4">Booking Screen</main>',
        },
      ],
    };

    const res = await fetch(`${baseUrl}/api/v1/web/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const data: Mod03WebBuildResponse = await res.json();

    assert.strictEqual(data.project_id, payload.project_id);
    assert.strictEqual(typeof data.git_commit_sha, 'string');
    assert.strictEqual(data.git_commit_sha.length, 8);
    assert.ok(data.staging_preview_url.includes('preview-'));
    assert.deepStrictEqual(data.viewports_verified, ['375px', '768px', '1280px', '1920px']);
    assert.strictEqual(data.rtl_verified, true);
    assert.strictEqual(data.cookie_consent_banner_active, true);
    assert.strictEqual(data.graphify_updated, true);
  });

  it('MOD03-INT-03: POST /api/v1/web/build returns 400 on missing required parameters', async () => {
    const invalidPayload = {
      // missing project_id and golden_template_id
      file_deltas: [],
    };

    const res = await fetch(`${baseUrl}/api/v1/web/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_VALIDATION');
  });

  it('MOD03-INT-04: POST /api/v1/web/build returns 422 ERR_VIEWPORT_OVERFLOW on mobile width overflow', async () => {
    const overflowPayload = {
      project_id: 'proj-0003-0000-0000-000000000011',
      golden_template_id: 'golden-web-landing',
      file_deltas: [
        {
          file_path: 'src/components/WideCard.tsx',
          operation: 'CREATE',
          content: '<section className="w-[800px] bg-slate-100">Fixed Wide Desktop Element</section>',
        },
      ],
    };

    const res = await fetch(`${baseUrl}/api/v1/web/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(overflowPayload),
    });

    assert.strictEqual(res.status, 422);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_VIEWPORT_OVERFLOW');
    assert.strictEqual(data.viewport, '375px');
    assert.strictEqual(data.culprit, 'w-[800px]');
  });

  it('MOD03-INT-05: POST /api/v1/web/build returns 500 ERR_BUILD_COMPILE on template or compilation failure', async () => {
    const badTemplatePayload = {
      project_id: 'proj-0003-0000-0000-000000000012',
      golden_template_id: 'invalid-template-xyz',
      file_deltas: [],
    };

    const res = await fetch(`${baseUrl}/api/v1/web/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(badTemplatePayload),
    });

    assert.strictEqual(res.status, 500);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_BUILD_COMPILE');
  });

  it('MOD03-INT-06: POST /api/v1/web/build returns 504 ERR_SANDBOX_TIMEOUT on build execution timeout', async () => {
    const timeoutPayload = {
      project_id: 'proj-0003-0000-0000-000000000013',
      golden_template_id: 'golden-web-landing',
      file_deltas: [],
      simulate_timeout: true,
    };

    const res = await fetch(`${baseUrl}/api/v1/web/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(timeoutPayload),
    });

    assert.strictEqual(res.status, 504);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_SANDBOX_TIMEOUT');
  });
});
