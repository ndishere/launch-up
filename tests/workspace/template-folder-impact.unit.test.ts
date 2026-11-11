import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  BUILTIN_GOLDEN_TEMPLATES,
  parseTemplateManifest,
  scanGoldenTemplatesFromManifests,
} from '../../src/lib/template-loader.ts';
import {
  analyzeStackTraceWithGraphify,
  bootstrapRawProjectFolderManifest,
  normalizePulledProjectToLaunchUp,
} from '../../src/lib/project-folder-adapter.ts';
import {
  buildGraphifyImpactAnalysis,
  evaluatePreChangeEditGuard,
} from '../../src/lib/graphify-impact.ts';
import {
  importProjectFolderOnServer,
  scanGoldenTemplatesDir,
  scanLocalModelWeights,
  scanWorkspacesDir,
} from '../../services/governance-service/src/local-scanner.ts';

test('TFI-01: scans golden-templates/*.launchup.json and validates 3 starter templates', () => {
  const repoRoot = process.cwd();
  const scan = scanGoldenTemplatesDir(repoRoot);
  assert.equal(scan.errors.length, 0);
  assert.ok(scan.templates.length >= 3);

  const ids = scan.templates.map((t) => t.id);
  assert.ok(ids.includes('landing-page-launchpad'));
  assert.ok(ids.includes('frontend-modular-ui'));
  assert.ok(ids.includes('fullstack-saas-engine'));

  const normalized = scanGoldenTemplatesFromManifests(
    scan.templates.map((rawJson) => ({
      folderPath: String(rawJson.folderPath || ''),
      rawJson,
    }))
  );
  assert.equal(normalized.errors.length, 0);
  assert.equal(normalized.templates.length, scan.templates.length);
  for (const tmpl of normalized.templates) {
    assert.ok(tmpl.layers.coreLocked.files.length > 0);
    assert.ok(tmpl.layers.slotsMutable.files.length > 0);
    assert.ok(tmpl.lockedFiles.length > 0);
  }

  const bad = parseTemplateManifest({ onlyTitle: true }, 'golden-templates/bad');
  assert.equal(bad.valid, false);
});

test('TFI-02: discovers workspaces/* and auto-bootstraps raw folders without project.launchup.json', () => {
  const repoRoot = process.cwd();
  const wsScan = scanWorkspacesDir(repoRoot);
  assert.ok(wsScan.workspaces.some((w) => w.folderName === 'sample-claude-code-app' && w.hasManifest));

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchup-raw-codex-'));
  try {
    const res = importProjectFolderOnServer(repoRoot, {
      folderPath: tempDir,
      sourceTool: 'ChatGPT Codex',
      clientId: 'client-1',
      autoBootstrap: true,
    });

    assert.equal(res.bootstrapped, true);
    assert.equal(res.graphifyIndexed, true);
    assert.equal(res.manifest.sourceTool, 'ChatGPT Codex');
    assert.ok(fs.existsSync(path.join(tempDir, 'project.launchup.json')));
    assert.ok(fs.existsSync(path.join(tempDir, 'checkpoint_handoff_state.md')));
    assert.ok(fs.existsSync(path.join(tempDir, 'graphify-out', 'GRAPH_REPORT.md')));
    assert.deepEqual(res.manifest.runtimeAndDeploy.gitBranches, [
      'feature/dev',
      'feature/testing',
      'feature/uat',
      'main',
    ]);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('TFI-03: normalizes pulled project into Launch Up and traces stack trace via Graphify', () => {
  const bootstrapped = bootstrapRawProjectFolderManifest({
    folderPath: 'D:\\Projects\\my-claude-app',
    sourceTool: 'Claude Code',
    clientId: 'client-1',
    autoBootstrap: true,
  });

  const project = normalizePulledProjectToLaunchUp(bootstrapped.manifest, 'client-1');
  assert.equal(project.sourceTool, 'Claude Code');
  assert.equal(project.localFolderPath, 'D:\\Projects\\my-claude-app');
  assert.ok(typeof project.localDevPort === 'number' && project.localDevPort >= 4100);
  assert.ok(project.previewUrl?.startsWith('http://localhost:'));

  const trace = analyzeStackTraceWithGraphify(
    'ZeroDivisionError in src/routes/index.ts at calculateFreightRatePerKg(0)',
    project
  );
  assert.equal(trace.faultyFile, 'src/routes/index.ts');
  assert.equal(trace.regressionPassed, true);
  assert.equal(trace.gate5Status, 'HOTFIX_PR_QUEUED');
  assert.ok(trace.suggestedDiff.includes('--- a/src/routes/index.ts'));
});

test('TFI-04: Graphify Pre-Change Impact Analyzer blocks lockedFiles and permits slots-mutable/ui-layer', () => {
  const saasTemplate = BUILTIN_GOLDEN_TEMPLATES.find((t) => t.id === 'fullstack-saas-engine')!;
  const analysis = buildGraphifyImpactAnalysis({ template: saasTemplate });
  assert.equal(analysis.blastRadiusChain.length, 3);

  const lockedCheck = evaluatePreChangeEditGuard(saasTemplate.lockedFiles[0], analysis);
  assert.equal(lockedCheck.allowed, false);
  assert.match(lockedCheck.reason, /LOCKED_FILE_BLOCKED/);

  const mutableCheck = evaluatePreChangeEditGuard(
    saasTemplate.layers.slotsMutable.files[0],
    analysis
  );
  assert.equal(mutableCheck.allowed, true);
  assert.equal(mutableCheck.layer, 'slots-mutable');

  const uiCheck = evaluatePreChangeEditGuard(saasTemplate.layers.uiLayer.tokensFile, analysis);
  assert.equal(uiCheck.allowed, true);
  assert.equal(uiCheck.layer, 'ui-layer');
});

test('TFI-05: scanLocalModelWeights discovers Ollama manifests and .gguf weights cleanly', () => {
  const tempWeightsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchup-weights-'));
  try {
    const manifestDir = path.join(tempWeightsDir, 'manifests', 'registry.ollama.ai', 'library', 'qwen2.5-coder');
    fs.mkdirSync(manifestDir, { recursive: true });
    fs.writeFileSync(path.join(manifestDir, '7b-instruct-q4_K_M'), '{}', 'utf-8');
    fs.writeFileSync(path.join(tempWeightsDir, 'phi-3.5-mini-q4.gguf'), 'GGUF', 'utf-8');

    const scan = scanLocalModelWeights(tempWeightsDir);
    assert.equal(scan.exists, true);
    assert.ok(scan.discoveredModels.includes('qwen2.5-coder:7b-instruct-q4_K_M'));
    assert.ok(scan.discoveredModels.includes('phi-3.5-mini-q4'));
    assert.equal(scan.ggufFiles.length, 1);
  } finally {
    fs.rmSync(tempWeightsDir, { recursive: true, force: true });
  }
});
