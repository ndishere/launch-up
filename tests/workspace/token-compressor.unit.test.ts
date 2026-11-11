import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { verifyApiConnectionEngine } from '../../services/governance-service/src/engine.ts';
import { API_PROVIDER_PRESETS } from '../../src/lib/custom-api-gateway.ts';
import {
  DEFAULT_TOKEN_OPTIMIZER_SETTINGS,
  compressToCavemanMd,
  computeTokenCompressionMetrics,
  generateProjectContextCompactMd,
  getCavemanSystemPrompt,
  packRepoToCompressedMd,
} from '../../src/lib/token-compressor.ts';

describe('4-Layer Token Compression & RTX 3050 6GB VRAM Optimizer', () => {
  let ollamaMockServer: http.Server;
  let ollamaPort = 0;

  before(async () => {
    ollamaMockServer = http.createServer((req, res) => {
      if (req.url === '/v1/models') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: [{ id: 'qwen2.5-coder:7b-instruct-q4_K_M' }] }));
        return;
      }
      if (req.url === '/api/tags') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            models: [
              { name: 'qwen2.5-coder:7b-instruct-q4_K_M' },
              { name: 'phi3.5:3.8b' },
              { name: 'deepseek-r1:7b-qwen-distill-q4_K_M' },
            ],
          })
        );
        return;
      }
      res.writeHead(404);
      res.end();
    });

    await new Promise<void>((resolve) => {
      ollamaMockServer.listen(0, '127.0.0.1', () => {
        const addr = ollamaMockServer.address();
        if (addr && typeof addr === 'object') {
          ollamaPort = addr.port;
        }
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => ollamaMockServer.close(() => resolve()));
  });

  it('TC-01: compressToCavemanMd removes filler grammar while preserving code blocks, paths, SQL, and numbers', () => {
    const verboseInput = [
      'Please note that you should make sure to configure the system in order to protect all multi-tenant tables.',
      'Furthermore, it is important to note that the latency threshold is strictly 250ms for 95% of requests.',
      'Additionally, the file at src/lib/token-compressor.ts must preserve SQL policies like:',
      'ENABLE ROW LEVEL SECURITY ON projects_items;',
      '```ts',
      'export const MAX_VRAM_GB = 6;',
      'const endpoint = "/api/v1/governance/verify";',
      '```',
      'Therefore, essentially this means that all agents will communicate with minimal overhead and zero fluff.',
    ].join('\n');

    const res = compressToCavemanMd(verboseInput, 'full');
    assert.ok(res.compressedTokens < res.rawTokens, 'Expected compressed tokens to be lower');
    assert.ok(res.reductionPercent >= 15, `Expected meaningful reduction, got ${res.reductionPercent}%`);
    assert.ok(res.compressedText.includes('export const MAX_VRAM_GB = 6;'));
    assert.ok(res.compressedText.includes('src/lib/token-compressor.ts'));
    assert.ok(res.compressedText.includes('ENABLE ROW LEVEL SECURITY ON projects_items;'));
    assert.ok(res.compressedText.includes('250ms'));
    assert.ok(res.compressedText.includes('95%'));
    assert.ok(!/please note that/i.test(res.compressedText));
  });

  it('TC-02: getCavemanSystemPrompt returns terse caveman directives across modes', () => {
    const fullRule = getCavemanSystemPrompt('full');
    assert.ok(fullRule.toLowerCase().includes('caveman-speak'));
    assert.ok(fullRule.includes('100% technical accuracy'));
    assert.ok(getCavemanSystemPrompt('ultra').includes('/caveman ultra'));
    assert.ok(getCavemanSystemPrompt('lite').includes('caveman-lite'));
  });

  it('TC-03: packRepoToCompressedMd strips bodies/comments, scrubs secrets, and preserves interfaces & routes', () => {
    const packed = packRepoToCompressedMd([
      {
        path: 'src/api/server.ts',
        content: `
// Verbose comment explaining the secret handler
/* Multi-line comment that should be stripped out by Repomix AST packer */
export interface TenantOrder {
  id: string;
  amountUsd: number;
}
export async function handleOrderCreate(orderId: string) {
  const dbUri = "postgresql://alice:secretpass@db.internal:5432/prod";
  const stepOne = orderId.trim();
  const stepTwo = stepOne.toUpperCase();
  const stepThree = { ok: true, id: stepTwo, uri: dbUri };
  return stepThree;
}
app.post('/api/v1/orders', async () => ({ status: 'ok' }));
`,
      },
    ]);

    assert.ok(packed.compressedTokens < packed.rawTokens);
    assert.ok(packed.secretsScrubbed >= 1);
    assert.ok(packed.markdownDigest.includes('export interface TenantOrder'));
    assert.ok(packed.markdownDigest.includes('body stripped'));
    assert.ok(!packed.markdownDigest.includes('secretpass'));
    assert.ok(!packed.markdownDigest.includes('Verbose comment explaining'));
  });

  it('TC-04: generateProjectContextCompactMd and computeTokenCompressionMetrics verify 4-layer compactness & 6GB VRAM budget', () => {
    const compact = generateProjectContextCompactMd({
      projectName: 'Launch Up Cloud',
      projectType: 'SaaS Platform',
      branchNames: ['feature/dev', 'feature/testing', 'feature/uat', 'feature/production'],
      workspaceSummary: 'The platform is built for autonomous delivery in order to achieve fast deployments.',
      handoffCheckpointMd: 'Please note that there is essentially a hard requirement of 100% pass rate on all suites.',
      templateFiles: [
        {
          path: 'src/routes.ts',
          content: `// comment\nexport interface RouteCfg { port: number; }\nexport function boot() {\n  const x = 1;\n  const y = 2;\n  return x + y;\n}`,
        },
      ],
      optimizer: DEFAULT_TOKEN_OPTIMIZER_SETTINGS,
    });

    assert.strictEqual(compact.filename, 'PROJECT_CONTEXT_COMPACT.md');
    assert.ok(compact.markdown.includes('GRAPHIFY STRUCTURAL SUBGRAPH'));
    assert.ok(compact.markdown.includes('REPOMIX SANITIZED AST SKELETON'));
    assert.ok(compact.markdown.includes('CAVEMAN WORKSPACE & HANDOFF CHECKPOINT'));

    const safeVram = computeTokenCompressionMetrics({
      rawBaselineTokens: 185_000,
      optimizer: DEFAULT_TOKEN_OPTIMIZER_SETTINGS,
    });
    assert.strictEqual(safeVram.vramSafeForRtx3050, true);
    assert.ok(safeVram.estimatedVramGb <= 6);
    assert.ok(safeVram.reductionPercent > 80);

    const overflowVram = computeTokenCompressionMetrics({
      rawBaselineTokens: 185_000,
      optimizer: {
        ...DEFAULT_TOKEN_OPTIMIZER_SETTINGS,
        turboQuantKvCacheQ4: false,
        sequentialSingleGpuQueue: false,
      },
    });
    assert.strictEqual(overflowVram.vramSafeForRtx3050, false);
    assert.ok(overflowVram.estimatedVramGb > 6);
  });

  it('TC-05: Local 6GB-VRAM presets & Ollama /api/tags auto-discovery work cleanly', async () => {
    assert.strictEqual(API_PROVIDER_PRESETS.ollama.baseUrl, 'http://localhost:11434/v1');
    assert.strictEqual(API_PROVIDER_PRESETS.ik_llama_cpp.baseUrl, 'http://localhost:8080/v1');
    assert.strictEqual(API_PROVIDER_PRESETS.airllm.baseUrl, 'http://localhost:8000/v1');
    assert.strictEqual(API_PROVIDER_PRESETS.lmstudio.baseUrl, 'http://localhost:1234/v1');

    const result = await verifyApiConnectionEngine({
      provider: 'ollama',
      baseUrl: `http://127.0.0.1:${ollamaPort}/v1`,
      apiKey: '',
    });

    assert.strictEqual(result.status, 'CONNECTED');
    if (result.status === 'CONNECTED') {
      assert.ok(Array.isArray(result.discoveredModels));
      assert.strictEqual(result.discoveredModels?.length, 3);
      assert.ok(result.discoveredModels?.includes('phi3.5:3.8b'));
      assert.ok(result.message.includes('3 local model(s) discovered'));
    }
  });
});
