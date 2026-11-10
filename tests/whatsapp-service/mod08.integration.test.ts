import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { processWhatsAppEvent } from '../../services/whatsapp-service/src/lib/engine.ts';
import type {
  Mod08WhatsAppRequest,
  Mod08WhatsAppResponse,
} from '../../services/whatsapp-service/src/types/index.ts';
import {
  validateWhatsAppRequest,
  NoOptinProofError,
  Outside24hWindowError,
  MetaApiRejectError,
  ValidationError,
} from '../../services/whatsapp-service/src/types/index.ts';

function createWhatsAppHttpServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    const sendJson = (status: number, data: any, headers: Record<string, string> = {}) => {
      res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
      res.end(JSON.stringify(data));
    };

    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(200, {
        status: 'ok',
        service: 'whatsapp-service',
        timestamp: new Date().toISOString(),
      });
    }

    if (
      req.method === 'POST' &&
      (url.pathname === '/api/v1/whatsapp/send' || url.pathname === '/api/v1/whatsapp/webhook')
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

          let validated: Mod08WhatsAppRequest;
          try {
            validated = validateWhatsAppRequest(parsed);
          } catch (valErr: any) {
            return sendJson(400, {
              success: false,
              code: 'ERR_VALIDATION_FAILED',
              error: valErr.message,
            });
          }

          const response: Mod08WhatsAppResponse = await processWhatsAppEvent(validated);
          return sendJson(200, response);
        } catch (err: any) {
          if (err instanceof NoOptinProofError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
            });
          }
          if (err instanceof Outside24hWindowError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
            });
          }
          if (err instanceof MetaApiRejectError) {
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

describe('MOD-08: WhatsApp Marketing & CRM RAG Engine (Integration & HTTP Contract Tests)', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    server = createWhatsAppHttpServer();
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

  it('MOD08-INT-01: GET /health returns 200 OK with service identity', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.status, 'ok');
    assert.strictEqual(body.service, 'whatsapp-service');
    assert.ok(body.timestamp);
  });

  it('MOD08-INT-02: POST /api/v1/whatsapp/send returns 200 and matches locked Mod08WhatsAppResponse contract', async () => {
    const payload: Mod08WhatsAppRequest = {
      project_id: 'proj-0008-0000-0000-000000000010',
      event_type: 'INBOUND_CUSTOMER_MSG',
      recipient_phone_e164: '+919876543210',
      opt_in_proof_id: null,
      last_inbound_timestamp: '2026-11-10T11:00:00Z',
      message_payload: {
        text_or_template: 'Can I track my delivery parcel in real-time?',
      },
      current_time_iso: '2026-11-10T12:00:00Z',
    };

    const res = await fetch(`${baseUrl}/api/v1/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const body: Mod08WhatsAppResponse = await res.json();

    assert.strictEqual(body.project_id, payload.project_id);
    assert.ok(body.whatsapp_message_id.startsWith('wamid.'));
    assert.strictEqual(body.within_24h_service_window, true);
    assert.ok(body.rag_confidence_score >= 0.75);
    assert.strictEqual(body.escalated_to_human_chatwoot, false);
    assert.strictEqual(body.unsubscribe_footer_attached, true);
  });

  it('MOD08-INT-03: POST /api/v1/whatsapp/send returns 400 on missing or invalid parameters', async () => {
    const invalidPayload = {
      project_id: 'proj-0008-0000-0000-000000000011',
      event_type: 'INVALID_EVENT_TYPE', // Invalid event type
      recipient_phone_e164: 'invalid-phone-format',
    };

    const res = await fetch(`${baseUrl}/api/v1/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'ERR_VALIDATION_FAILED');
  });

  it('MOD08-INT-04: POST /api/v1/whatsapp/send returns 403 ERR_NO_OPTIN_PROOF for unconsented broadcast', async () => {
    const payload: Mod08WhatsAppRequest = {
      project_id: 'proj-0008-0000-0000-000000000012',
      event_type: 'OUTBOUND_CAMPAIGN_BROADCAST',
      recipient_phone_e164: '+919876543210',
      opt_in_proof_id: null, // Missing opt-in proof!
      last_inbound_timestamp: '2026-11-10T11:00:00Z',
      message_payload: {
        text_or_template: 'Seasonal discount broadcast',
      },
      current_time_iso: '2026-11-10T12:00:00Z',
    };

    const res = await fetch(`${baseUrl}/api/v1/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'ERR_NO_OPTIN_PROOF');
    assert.ok(body.error.includes('opt_in_proof_id'));
  });

  it('MOD08-INT-05: POST /api/v1/whatsapp/send returns 422 ERR_OUTSIDE_24H_WINDOW for expired free-form message', async () => {
    const payload: Mod08WhatsAppRequest = {
      project_id: 'proj-0008-0000-0000-000000000013',
      event_type: 'OUTBOUND_CAMPAIGN_BROADCAST',
      recipient_phone_e164: '+919876543210',
      opt_in_proof_id: 'proof-uuid-12345',
      last_inbound_timestamp: '2026-11-08T00:00:00Z', // 2+ days ago (> 24h)
      message_payload: {
        text_or_template: 'Hey there, please check our new products!',
        is_meta_approved_template: false,
      },
      current_time_iso: '2026-11-10T12:00:00Z',
    };

    const res = await fetch(`${baseUrl}/api/v1/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 422);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'ERR_OUTSIDE_24H_WINDOW');
  });

  it('MOD08-INT-06: POST /api/v1/whatsapp/send returns 502 ERR_META_API_REJECT on Meta Graph API rejection', async () => {
    const payload: Mod08WhatsAppRequest = {
      project_id: 'proj-0008-0000-0000-000000000014',
      event_type: 'INBOUND_CUSTOMER_MSG',
      recipient_phone_e164: '+919876543210',
      opt_in_proof_id: null,
      last_inbound_timestamp: '2026-11-10T11:00:00Z',
      message_payload: {
        text_or_template: 'Help with my order',
      },
      mock_meta_failure: true,
      current_time_iso: '2026-11-10T12:00:00Z',
    };

    const res = await fetch(`${baseUrl}/api/v1/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 502);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.code, 'ERR_META_API_REJECT');
  });
});
