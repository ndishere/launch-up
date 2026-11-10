import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { processMarketingCampaign } from '../../services/marketing-engine-service/src/lib/engine.ts';
import type {
  Mod07MarketingRequest,
  Mod07MarketingResponse,
} from '../../services/marketing-engine-service/src/types/index.ts';
import {
  CanvaRateLimitError,
  TemplateFieldMismatchError,
} from '../../services/marketing-engine-service/src/types/index.ts';

function createMarketingHttpServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    const sendJson = (status: number, data: any, headers: Record<string, string> = {}) => {
      res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
      res.end(JSON.stringify(data));
    };

    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(200, {
        status: 'ok',
        service: 'marketing-engine-service',
        timestamp: new Date().toISOString(),
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/marketing/calendar') {
      let b = '';
      req.on('data', c => { b += c; });
      req.on('end', async () => {
        try {
          let body: Mod07MarketingRequest;
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
            !body.campaign_theme ||
            !body.canva_brand_template_ids ||
            !Array.isArray(body.canva_brand_template_ids)
          ) {
            return sendJson(400, {
              success: false,
              code: 'ERR_VALIDATION',
              error: 'Missing mandatory fields: project_id, campaign_theme, canva_brand_template_ids',
            });
          }

          const response: Mod07MarketingResponse = await processMarketingCampaign(body);
          return sendJson(200, response);
        } catch (err: any) {
          if (err instanceof CanvaRateLimitError) {
            return sendJson(
              err.statusCode,
              {
                success: false,
                code: err.code,
                error: err.message,
                retryAfterSeconds: err.retryAfterSeconds,
              },
              { 'Retry-After': String(err.retryAfterSeconds) }
            );
          }
          if (err instanceof TemplateFieldMismatchError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
              missingFields: err.missingFields,
            });
          }
          return sendJson(500, {
            success: false,
            code: 'ERR_MARKETING_ENGINE',
            error: 'Internal Server Error',
          });
        }
      });
      return;
    }

    return sendJson(404, { error: 'Not Found' });
  });
}

describe('MOD-07: Canva Pro Digital Marketing Engine (Integration & HTTP Contract Tests)', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    server = createMarketingHttpServer();
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

  it('MOD07-INT-01: GET /health returns 200 OK with service identity', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.service, 'marketing-engine-service');
  });

  it('MOD07-INT-02: POST /api/v1/marketing/calendar returns 200 and matches locked Mod07MarketingResponse contract', async () => {
    const payload: Mod07MarketingRequest = {
      project_id: 'proj-0007-0000-0000-000000000010',
      brand_kit: {
        company_name: 'Express Route Logistics',
        primary_color_hex: '#0F172A',
      },
      campaign_theme: 'Diwali Festive Express Logistics',
      days_count: 30,
      canva_brand_template_ids: ['DAG_social_01', 'DAG_carousel_02'],
    };

    const res = await fetch(`${baseUrl}/api/v1/marketing/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const data: Mod07MarketingResponse = await res.json();

    assert.strictEqual(data.project_id, payload.project_id);
    assert.strictEqual(data.calendar_items.length, 30);
    assert.ok(data.approval_gate_id.startsWith('gate-0004-'));

    // Verify first and last items
    assert.strictEqual(data.calendar_items[0].day, 1);
    assert.strictEqual(data.calendar_items[0].platform, 'INSTAGRAM');
    assert.strictEqual(data.calendar_items[0].eu_ai_act_disclosure_attached, true);

    assert.strictEqual(data.calendar_items[29].day, 30);
    assert.strictEqual(data.calendar_items[29].eu_ai_act_disclosure_attached, true);
  });

  it('MOD07-INT-03: POST /api/v1/marketing/calendar returns 400 on missing mandatory parameters', async () => {
    const invalidPayload = {
      project_id: 'proj-0007-0000-0000-000000000011',
      // missing campaign_theme, canva_brand_template_ids
    };

    const res = await fetch(`${baseUrl}/api/v1/marketing/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_VALIDATION');
  });

  it('MOD07-INT-04: POST /api/v1/marketing/calendar returns 429 ERR_CANVA_RATE_LIMIT on rate limit breach', async () => {
    const rateLimitedPayload: Mod07MarketingRequest = {
      project_id: 'proj-0007-0000-0000-000000000012',
      brand_kit: {},
      campaign_theme: 'High Frequency Campaign',
      days_count: 30,
      canva_brand_template_ids: ['DAG_social_01'],
      simulate_rate_limit: true,
    };

    const res = await fetch(`${baseUrl}/api/v1/marketing/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rateLimitedPayload),
    });

    assert.strictEqual(res.status, 429);
    assert.strictEqual(res.headers.get('Retry-After'), '60');
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_CANVA_RATE_LIMIT');
  });

  it('MOD07-INT-05: POST /api/v1/marketing/calendar returns 422 ERR_TEMPLATE_FIELD_MISMATCH on template incompatibility', async () => {
    const mismatchPayload: Mod07MarketingRequest = {
      project_id: 'proj-0007-0000-0000-000000000013',
      brand_kit: {},
      campaign_theme: 'Strict Template Campaign',
      days_count: 14,
      canva_brand_template_ids: ['DAG_strict_01'],
      simulate_field_mismatch: true,
    };

    const res = await fetch(`${baseUrl}/api/v1/marketing/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mismatchPayload),
    });

    assert.strictEqual(res.status, 422);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_TEMPLATE_FIELD_MISMATCH');
    assert.deepStrictEqual(data.missingFields, ['company_logo_svg', 'hero_headline_text']);
  });
});
