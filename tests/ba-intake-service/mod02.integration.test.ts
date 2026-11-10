import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { processBaIntake } from '../../services/ba-intake-service/src/lib/engine.ts';
import type {
  Mod02IntakeRequest,
  Mod02IntakeResponse,
} from '../../services/ba-intake-service/src/types/index.ts';
import {
  SchemaInvalidError,
  AmbiguousScopeError,
  UnsupportedLawError,
} from '../../services/ba-intake-service/src/types/index.ts';

function createBaIntakeHttpServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    const sendJson = (status: number, data: any) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(200, {
        status: 'ok',
        service: 'ba-intake-service',
        timestamp: new Date().toISOString(),
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/intake/synthesize') {
      let b = '';
      req.on('data', c => { b += c; });
      req.on('end', async () => {
        try {
          let body: Mod02IntakeRequest;
          try {
            body = JSON.parse(b);
          } catch {
            return sendJson(422, {
              success: false,
              code: 'ERR_SCHEMA_INVALID',
              error: 'Malformed JSON payload',
            });
          }

          // Validation of required top-level schema
          if (
            !body.project_id ||
            !body.client_id ||
            !body.intake_transcript ||
            !body.brand_assets ||
            !body.target_countries ||
            !body.target_modules
          ) {
            return sendJson(422, {
              success: false,
              code: 'ERR_SCHEMA_INVALID',
              error: 'Missing mandatory fields in Mod02IntakeRequest',
            });
          }

          const response: Mod02IntakeResponse = await processBaIntake(body);
          return sendJson(200, response);
        } catch (err: any) {
          if (err instanceof SchemaInvalidError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
            });
          }
          if (err instanceof AmbiguousScopeError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
            });
          }
          if (err instanceof UnsupportedLawError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
            });
          }
          return sendJson(500, { success: false, error: 'Internal Server Error' });
        }
      });
      return;
    }

    return sendJson(404, { error: 'Not Found' });
  });
}

describe('MOD-02: BA Intake & Scope Synthesizer (Integration & HTTP Contract Tests)', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    server = createBaIntakeHttpServer();
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

  it('GET /health returns 200 OK with service identity', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.service, 'ba-intake-service');
  });

  it('POST /api/v1/intake/synthesize - 200 OK happy path with full contract compliance', async () => {
    const payload: Mod02IntakeRequest = {
      project_id: 'proj-0002-0000-0000-000000000001',
      client_id: 'clie-0002-0000-0000-000000000001',
      intake_transcript: 'Client wants a high-throughput logistics app with Android delivery scanning and tracking.',
      brand_assets: {
        primary_color_hex: '#0F172A',
        secondary_color_hex: '#3B82F6',
        font_heading: 'Inter',
        font_body: 'Inter',
      },
      target_countries: ['IN', 'US', 'DE'],
      target_modules: {
        build_website: true,
        build_landing_page: true,
        build_android_app: true,
        build_backend_api: true,
        enable_digital_marketing: true,
        enable_whatsapp_marketing: true,
      },
    };

    const res = await fetch(`${baseUrl}/api/v1/intake/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const data: Mod02IntakeResponse = await res.json();

    // Verify Output Contract structure
    assert.strictEqual(data.project_id, payload.project_id);
    assert.ok(data.prd_json);
    assert.ok(data.prd_json.executive_summary.length > 0);
    assert.ok(data.prd_json.user_stories.length > 0);
    assert.ok(data.prd_json.roles_and_permissions);
    assert.ok(data.db_migration_sql.includes('ENABLE ROW LEVEL SECURITY'));
    assert.ok(data.openapi_3_1_yaml.includes('openapi: 3.1.0'));

    // Verify all expected compliance flags are present
    assert.ok(data.compliance_flags.includes('DPDP_INDIA'));
    assert.ok(data.compliance_flags.includes('GDPR_EU'));
    assert.ok(data.compliance_flags.includes('CCPA_US'));
    assert.ok(data.compliance_flags.includes('GOOGLE_PLAY_DATA_SAFETY'));

    // Verify generated documentation paths
    assert.deepStrictEqual(data.generated_docs_paths, [
      '01_PRD_Executive_Blueprint.md',
      '02_Functional_Requirements_Matrix.md',
      '03_Detailed_Technical_SRS.md',
    ]);

    // Verify approval gate ID format
    assert.ok(typeof data.approval_gate_id === 'string' && data.approval_gate_id.length > 10);
  });

  it('POST /api/v1/intake/synthesize - 422 ERR_SCHEMA_INVALID on missing fields or malformed JSON', async () => {
    // Test missing fields
    const invalidPayload = {
      project_id: 'proj-0002-0000-0000-000000000001',
      // missing client_id, intake_transcript, etc.
    };

    const res = await fetch(`${baseUrl}/api/v1/intake/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    assert.strictEqual(res.status, 422);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_SCHEMA_INVALID');

    // Test malformed JSON
    const malformedRes = await fetch(`${baseUrl}/api/v1/intake/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ not valid json',
    });
    assert.strictEqual(malformedRes.status, 422);
    const malformedData = await malformedRes.json();
    assert.strictEqual(malformedData.code, 'ERR_SCHEMA_INVALID');
  });

  it('POST /api/v1/intake/synthesize - 400 ERR_UNSUPPORTED_LAW on unsupported country code', async () => {
    const payloadWithBadCountry = {
      project_id: 'proj-0002-0000-0000-000000000001',
      client_id: 'clie-0002-0000-0000-000000000001',
      intake_transcript: 'Valid transcript for international trade.',
      brand_assets: {
        primary_color_hex: '#0F172A',
        secondary_color_hex: '#3B82F6',
        font_heading: 'Inter',
        font_body: 'Inter',
      },
      target_countries: ['XX'], // Unsupported country code
      target_modules: {
        build_website: true,
        build_landing_page: false,
        build_android_app: false,
        build_backend_api: true,
        enable_digital_marketing: false,
        enable_whatsapp_marketing: false,
      },
    };

    const res = await fetch(`${baseUrl}/api/v1/intake/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadWithBadCountry),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_UNSUPPORTED_LAW');
    assert.ok(data.error.includes('XX'));
  });

  it('POST /api/v1/intake/synthesize - 409 ERR_AMBIGUOUS_SCOPE on conflicting co-owner requirements', async () => {
    const payloadWithConflict = {
      project_id: 'proj-0002-0000-0000-000000000001',
      client_id: 'clie-0002-0000-0000-000000000001',
      intake_transcript: 'We need seamless guest checkout without registration, but our security team insists on mandatory OTP login for every single checkout.',
      brand_assets: {
        primary_color_hex: '#0F172A',
        secondary_color_hex: '#3B82F6',
        font_heading: 'Inter',
        font_body: 'Inter',
      },
      target_countries: ['IN'],
      target_modules: {
        build_website: true,
        build_landing_page: false,
        build_android_app: false,
        build_backend_api: true,
        enable_digital_marketing: false,
        enable_whatsapp_marketing: false,
      },
    };

    const res = await fetch(`${baseUrl}/api/v1/intake/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadWithConflict),
    });

    assert.strictEqual(res.status, 409);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_AMBIGUOUS_SCOPE');
    assert.ok(data.error.includes('Guest checkout without login directly contradicts mandatory OTP'));
  });

  it('POST /api/v1/intake/synthesize - 409 ERR_AMBIGUOUS_SCOPE on public catalog vs private invite conflict', async () => {
    const payloadWithCatalogConflict = {
      project_id: 'proj-0002-0000-0000-000000000001',
      client_id: 'clie-0002-0000-0000-000000000001',
      intake_transcript: 'Allow anyone on the internet to view the public catalog without signing in, but keep the catalog private and accessible only to invited VIP members.',
      brand_assets: {
        primary_color_hex: '#0F172A',
        secondary_color_hex: '#3B82F6',
        font_heading: 'Inter',
        font_body: 'Inter',
      },
      target_countries: ['US'],
      target_modules: {
        build_website: true,
        build_landing_page: false,
        build_android_app: false,
        build_backend_api: true,
        enable_digital_marketing: false,
        enable_whatsapp_marketing: false,
      },
    };

    const res = await fetch(`${baseUrl}/api/v1/intake/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadWithCatalogConflict),
    });

    assert.strictEqual(res.status, 409);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_AMBIGUOUS_SCOPE');
    assert.ok(data.error.includes('Public open catalog contradicts private exclusive access'));
  });
});
