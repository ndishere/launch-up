import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import {
  processLeadDiscovery,
} from '../../services/lead-pitch-service/src/lib/engine.ts';
import type {
  ProspectRaw,
  Mod01LeadRequest,
} from '../../services/lead-pitch-service/src/types/index.ts';
import {
  DncListBlockedError,
  ScrapeTimeoutError,
  CanvaAutofillFailError,
} from '../../services/lead-pitch-service/src/types/index.ts';

const mockRegistry: ProspectRaw[] = [
  {
    id: 'lead-0001-0000-0000-000000000001',
    name: 'Amritsar Regional Express Logistics',
    website: 'https://amritsarexpress.example.com',
    email: 'contact@amritsarexpress.example.com',
    phone: '+919876543210',
    hasMobileApp: false,
    lighthouseMobileScore: 35,
    hasWhatsAppBot: false,
    hasResponsiveViewport: true,
  },
  {
    id: 'lead-0002-0000-0000-000000000002',
    name: 'Punjab Cargo Freight Ltd',
    website: 'https://punjabcargo.example.com',
    email: 'info@punjabcargo.example.com',
    phone: '+919876543211',
    hasMobileApp: false,
    lighthouseMobileScore: 42,
    hasWhatsAppBot: false,
    hasResponsiveViewport: false,
  },
];

const mockDncLedger = new Set<string>([
  'blocked@example.com',
  '+919000000000',
]);

function createLeadPitchHttpServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    const sendJson = (status: number, data: any) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(200, { status: 'ok', service: 'lead-pitch-service' });
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/leads/discover') {
      let b = '';
      req.on('data', c => { b += c; });
      req.on('end', async () => {
        try {
          const body: Mod01LeadRequest = JSON.parse(b);
          if (!body.target_niche || !body.country_code || !body.city || !body.canva_pitch_template_id) {
            return sendJson(400, { success: false, error: 'Validation failed' });
          }

          // Special test flag triggers
          const simulateTimeout = (body as any).simulate_timeout === true;
          const simulateCanvaFail = body.canva_pitch_template_id === 'INVALID_TEMPLATE';

          const activeDnc = new Set<string>(mockDncLedger);
          if ((body as any).add_to_dnc) {
            activeDnc.add((body as any).add_to_dnc);
          }

          const response = await processLeadDiscovery(
            body,
            mockRegistry,
            activeDnc,
            { simulateScrapeTimeout: simulateTimeout, simulateCanvaFail: simulateCanvaFail }
          );

          return sendJson(200, response);
        } catch (err: any) {
          if (err instanceof DncListBlockedError) {
            return sendJson(422, { success: false, error: err.message, code: err.code });
          }
          if (err instanceof ScrapeTimeoutError) {
            return sendJson(504, { success: false, error: err.message, code: err.code });
          }
          if (err instanceof CanvaAutofillFailError) {
            return sendJson(502, { success: false, error: err.message, code: err.code });
          }
          return sendJson(500, { error: 'Internal Error' });
        }
      });
      return;
    }

    return sendJson(404, { error: 'Not Found' });
  });
}

describe('MOD-01: Lead Discovery & Pitch Engine (Integration & HTTP Contract Tests)', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    server = createLeadPitchHttpServer();
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

  it('MOD01-INT-01: GET /health returns 200 OK', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.status, 'ok');
    assert.strictEqual(json.service, 'lead-pitch-service');
  });

  it('MOD01-INT-02: POST /api/v1/leads/discover returns 200 and strict Mod01LeadResponse', async () => {
    const payload = {
      target_niche: 'regional-logistics',
      country_code: 'IN',
      city: 'Amritsar',
      max_leads: 2,
      canva_pitch_template_id: 'DAG_canva_template_01',
    };

    const res = await fetch(`${baseUrl}/api/v1/leads/discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.leads_generated));
    assert.strictEqual(data.leads_generated.length, 2);

    const lead1 = data.leads_generated[0];
    assert.strictEqual(typeof lead1.lead_id, 'string');
    assert.strictEqual(lead1.company_name, 'Amritsar Regional Express Logistics');
    assert.ok(lead1.digital_gaps_found.includes('NO_ANDROID_APP'));
    assert.deepStrictEqual(lead1.applicable_compliance, ['DPDP_INDIA_2023', 'CERT_IN']);
    assert.ok(lead1.canva_proposal_pdf_url.startsWith('https://export.canva.com/'));
    assert.strictEqual(typeof lead1.approval_gate_id, 'string');
  });

  it('MOD01-INT-03: Rejects DNC listed lead with 422 ERR_DNC_LIST_BLOCKED', async () => {
    const payload = {
      target_niche: 'regional-logistics',
      country_code: 'IN',
      city: 'Amritsar',
      canva_pitch_template_id: 'DAG_canva_template_01',
      add_to_dnc: 'contact@amritsarexpress.example.com',
    };

    const res = await fetch(`${baseUrl}/api/v1/leads/discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 422);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_DNC_LIST_BLOCKED');
  });

  it('MOD01-INT-04: Scrape timeout returns 504 ERR_SCRAPE_TIMEOUT', async () => {
    const payload = {
      target_niche: 'regional-logistics',
      country_code: 'IN',
      city: 'Amritsar',
      canva_pitch_template_id: 'DAG_canva_template_01',
      simulate_timeout: true,
    };

    const res = await fetch(`${baseUrl}/api/v1/leads/discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 504);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_SCRAPE_TIMEOUT');
  });

  it('MOD01-INT-05: Invalid Canva template returns 502 ERR_CANVA_AUTOFILL_FAIL', async () => {
    const payload = {
      target_niche: 'regional-logistics',
      country_code: 'IN',
      city: 'Amritsar',
      canva_pitch_template_id: 'INVALID_TEMPLATE',
    };

    const res = await fetch(`${baseUrl}/api/v1/leads/discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 502);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_CANVA_AUTOFILL_FAIL');
  });
});
