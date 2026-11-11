import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { verifyApiConnectionEngine } from '../../services/governance-service/src/engine.ts';
import {
  API_PROVIDER_PRESETS,
  SWARM_AGENT_ROLE_METADATA,
  calculateBlendedCostPer1MTokens,
  formatPreFlightGatewayLog,
  getDefaultAgentModelAssignments,
  getDefaultCustomApiProviders,
  maskApiKey,
  parseCustomHeadersJson,
} from '../../src/lib/custom-api-gateway.ts';

describe('Universal Custom AI & External API Gateway + MOD-10 Verifier', () => {
  let mockServer: http.Server;
  let mockPort = 0;

  before(async () => {
    mockServer = http.createServer((req, res) => {
      const url = new URL(req.url || '/', `http://127.0.0.1:${mockPort}`);

      if (url.pathname === '/v1/models') {
        const auth = req.headers.authorization;
        const customFlag = req.headers['x-launchup-custom'];
        if (auth === 'Bearer live-valid-key') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              data: [{ id: 'anthropic/claude-3.7-sonnet' }, { id: 'openai/gpt-4o' }],
              customHeaderReceived: customFlag ?? null,
            })
          );
          return;
        }
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      if (url.pathname === '/anthropic/v1/models') {
        if (req.headers['x-api-key'] === 'anthropic-live-ok' && req.headers['anthropic-version']) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ data: [{ id: 'claude-3-7-sonnet-20250219' }] }));
          return;
        }
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid x-api-key' }));
        return;
      }

      if (url.pathname === '/v1beta/models') {
        if (url.searchParams.get('key') === 'gemini-live-ok') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ models: [{ name: 'models/gemini-2.5-pro' }] }));
          return;
        }
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Forbidden' }));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    });

    await new Promise<void>((resolve) => {
      mockServer.listen(0, '127.0.0.1', () => {
        const addr = mockServer.address();
        if (addr && typeof addr === 'object') {
          mockPort = addr.port;
        }
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => mockServer.close(() => resolve()));
  });

  it('GW-01: Simulation keys (sk-test- / sim-) verify cleanly with latency & model', async () => {
    const res1 = await verifyApiConnectionEngine({
      provider: 'openrouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: 'sk-test-openrouter-123',
      modelId: 'anthropic/claude-3.7-sonnet',
    });
    assert.strictEqual(res1.status, 'CONNECTED');
    assert.strictEqual(res1.verifiedModel, 'anthropic/claude-3.7-sonnet');
    assert.strictEqual(res1.message, 'Handshake verified (HTTP 200 OK)');
    assert.ok(res1.latencyMs > 0);

    const res2 = await verifyApiConnectionEngine({
      provider: 'groq',
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey: 'sim-groq-fast',
    });
    assert.strictEqual(res2.status, 'CONNECTED');
    assert.strictEqual(res2.verifiedModel, 'llama-3.3-70b-versatile');
  });

  it('GW-02: Invalid URL and missing/bad API keys return structured FAILED error codes', async () => {
    const badUrl = await verifyApiConnectionEngine({
      provider: 'openai',
      baseUrl: 'not-a-valid-url',
      apiKey: 'sk-test-valid',
    });
    assert.strictEqual(badUrl.status, 'FAILED');
    if (badUrl.status === 'FAILED') {
      assert.strictEqual(badUrl.errorCode, 'ERR_API_UNREACHABLE');
    }

    const emptyKey = await verifyApiConnectionEngine({
      provider: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
    });
    assert.strictEqual(emptyKey.status, 'FAILED');
    if (emptyKey.status === 'FAILED') {
      assert.strictEqual(emptyKey.errorCode, 'ERR_API_AUTH_FAILED');
    }
  });

  it('GW-03: Real HTTP handshake verifies OpenAI/OpenRouter, Anthropic x-api-key, Gemini ?key=, and 401/403 errors', async () => {
    const openaiOk = await verifyApiConnectionEngine({
      provider: 'openrouter',
      baseUrl: `http://127.0.0.1:${mockPort}/v1`,
      apiKey: 'live-valid-key',
      modelId: 'anthropic/claude-3.7-sonnet',
      customHeaders: { 'x-launchup-custom': 'yes' },
    });
    assert.strictEqual(openaiOk.status, 'CONNECTED');
    assert.strictEqual(openaiOk.verifiedModel, 'anthropic/claude-3.7-sonnet');

    const anthropicOk = await verifyApiConnectionEngine({
      provider: 'anthropic',
      baseUrl: `http://127.0.0.1:${mockPort}/anthropic/v1`,
      apiKey: 'anthropic-live-ok',
      modelId: 'claude-3-7-sonnet-20250219',
    });
    assert.strictEqual(anthropicOk.status, 'CONNECTED');
    assert.strictEqual(anthropicOk.verifiedModel, 'claude-3-7-sonnet-20250219');

    const geminiOk = await verifyApiConnectionEngine({
      provider: 'gemini',
      baseUrl: `http://127.0.0.1:${mockPort}/v1beta`,
      apiKey: 'gemini-live-ok',
      modelId: 'models/gemini-2.5-pro',
    });
    assert.strictEqual(geminiOk.status, 'CONNECTED');

    const openaiBad = await verifyApiConnectionEngine({
      provider: 'openai',
      baseUrl: `http://127.0.0.1:${mockPort}/v1`,
      apiKey: 'wrong-secret',
    });
    assert.strictEqual(openaiBad.status, 'FAILED');
    if (openaiBad.status === 'FAILED') {
      assert.strictEqual(openaiBad.errorCode, 'ERR_API_AUTH_FAILED');
    }
  });

  it('GW-04: Presets, key masking, custom header JSON parser, pre-flight logs & blended cost math work cleanly', () => {
    assert.ok(API_PROVIDER_PRESETS.openrouter.baseUrl.includes('openrouter.ai'));
    assert.strictEqual(SWARM_AGENT_ROLE_METADATA.length, 6);
    assert.strictEqual(maskApiKey(''), 'No Key Configured');
    assert.strictEqual(maskApiKey('sk-test-1234567890abcd'), 'sk-tes••••abcd');

    const okHeaders = parseCustomHeadersJson('{"X-Title": "Launch Up"}');
    assert.deepStrictEqual(okHeaders.headers, { 'X-Title': 'Launch Up' });
    const badHeaders = parseCustomHeadersJson('["not-an-object"]');
    assert.ok(badHeaders.error);

    const defaults = getDefaultCustomApiProviders();
    const assignments = getDefaultAgentModelAssignments();
    const blended = calculateBlendedCostPer1MTokens(defaults, assignments);
    assert.ok(blended > 0);

    const log = formatPreFlightGatewayLog(defaults[0], 'CONNECTED', 138, 'Claude-3.7-Sonnet');
    assert.strictEqual(log, '[Gateway] Verified OpenRouter / Claude-3.7-Sonnet connection (138ms)');
  });
});
