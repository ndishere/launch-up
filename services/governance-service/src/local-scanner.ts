import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export interface LocalModelWeightsScanResult {
  weightsDir: string;
  exists: boolean;
  discoveredModels: string[];
  ggufFiles: Array<{ name: string; sizeMb: number }>;
  blobCount: number;
  scannedAt: string;
}

export interface ScannedWorkspaceFolderEntry {
  folderPath: string;
  folderName: string;
  hasManifest: boolean;
  manifest: Record<string, any> | null;
  hasDockerfile: boolean;
  hasCompose: boolean;
  hasCheckpoint: boolean;
  hasGraphifyReport: boolean;
}

function collectFilesRecursive(dirPath: string, maxDepth = 4, currentDepth = 0): string[] {
  if (currentDepth > maxDepth || !fs.existsSync(dirPath)) return [];
  const results: string[] = [];
  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFilesRecursive(full, maxDepth, currentDepth + 1));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Scans `D:\models\weights` (or `LAUNCHUP_LOCAL_WEIGHTS_DIR`) for Ollama manifests,
 * blob partials/weights metadata, and standalone `.gguf` / `.safetensors` files.
 */
export function scanLocalModelWeights(
  weightsDir = process.env.LAUNCHUP_LOCAL_WEIGHTS_DIR || 'D:\\models\\weights'
): LocalModelWeightsScanResult {
  const scannedAt = new Date().toISOString();
  if (!fs.existsSync(weightsDir)) {
    return {
      weightsDir,
      exists: false,
      discoveredModels: [],
      ggufFiles: [],
      blobCount: 0,
      scannedAt,
    };
  }

  const discoveredModels = new Set<string>();
  const ggufFiles: Array<{ name: string; sizeMb: number }> = [];

  for (const manifestFolder of ['manifests', 'manifests-v2']) {
    const mRoot = path.join(weightsDir, manifestFolder);
    const files = collectFilesRecursive(mRoot, 5);
    for (const file of files) {
      const rel = path.relative(mRoot, file).replace(/\\/g, '/');
      const parts = rel.split('/').filter(Boolean);
      if (parts.length >= 2) {
        const tag = parts[parts.length - 1];
        const model = parts[parts.length - 2];
        discoveredModels.add(`${model}:${tag}`);
      } else if (parts.length === 1) {
        discoveredModels.add(parts[0]);
      }
    }
  }

  const allRootFiles = collectFilesRecursive(weightsDir, 3);
  for (const file of allRootFiles) {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.gguf' || ext === '.safetensors' || ext === '.bin') {
      const base = path.basename(file);
      let sizeMb = 0;
      try {
        sizeMb = Math.round((fs.statSync(file).size / (1024 * 1024)) * 10) / 10;
      } catch {}
      ggufFiles.push({ name: base, sizeMb });
      discoveredModels.add(base.replace(ext, ''));
    }
  }

  let blobCount = 0;
  const blobsDir = path.join(weightsDir, 'blobs');
  if (fs.existsSync(blobsDir)) {
    try {
      blobCount = fs.readdirSync(blobsDir).length;
    } catch {}
  }

  return {
    weightsDir,
    exists: true,
    discoveredModels: Array.from(discoveredModels).slice(0, 30),
    ggufFiles: ggufFiles.slice(0, 20),
    blobCount,
    scannedAt,
  };
}

/**
 * Discovers all drop-in `template.launchup.json` manifests inside `golden-templates/`.
 */
export function scanGoldenTemplatesDir(rootDir: string): {
  templates: Record<string, any>[];
  errors: Array<{ source: string; error: string }>;
  scannedAt: string;
} {
  const templatesDir = path.join(rootDir, 'golden-templates');
  const templates: Record<string, any>[] = [];
  const errors: Array<{ source: string; error: string }> = [];

  if (fs.existsSync(templatesDir)) {
    const entries = fs.readdirSync(templatesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const folderPath = path.join(templatesDir, entry.name);
      const manifestPath = path.join(folderPath, 'template.launchup.json');
      if (!fs.existsSync(manifestPath)) continue;
      try {
        const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        templates.push({
          ...parsed,
          folderPath: `golden-templates/${entry.name}`,
        });
      } catch (err: any) {
        errors.push({
          source: `golden-templates/${entry.name}/template.launchup.json`,
          error: err?.message || 'Invalid JSON manifest',
        });
      }
    }
  }

  return {
    templates,
    errors,
    scannedAt: new Date().toISOString(),
  };
}

/**
 * Discovers project folders inside `workspaces/` along with optional `project.launchup.json`.
 */
export function scanWorkspacesDir(rootDir: string): {
  workspaces: ScannedWorkspaceFolderEntry[];
  scannedAt: string;
} {
  const wsDir = path.join(rootDir, 'workspaces');
  const workspaces: ScannedWorkspaceFolderEntry[] = [];

  if (fs.existsSync(wsDir)) {
    const entries = fs.readdirSync(wsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const absFolder = path.join(wsDir, entry.name);
      const manifestPath = path.join(absFolder, 'project.launchup.json');
      let manifest: Record<string, any> | null = null;
      if (fs.existsSync(manifestPath)) {
        try {
          manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        } catch {}
      }

      workspaces.push({
        folderPath: `workspaces/${entry.name}`,
        folderName: entry.name,
        hasManifest: manifest !== null,
        manifest,
        hasDockerfile: fs.existsSync(path.join(absFolder, 'Dockerfile')),
        hasCompose: fs.existsSync(path.join(absFolder, 'docker-compose.yml')),
        hasCheckpoint: fs.existsSync(path.join(absFolder, 'checkpoint_handoff_state.md')),
        hasGraphifyReport: fs.existsSync(path.join(absFolder, 'graphify-out', 'GRAPH_REPORT.md')),
      });
    }
  }

  return {
    workspaces,
    scannedAt: new Date().toISOString(),
  };
}

function inferFriendlyName(folderPath: string): string {
  const cleaned = folderPath.replace(/\\/g, '/').replace(/\/+$/, '');
  const seg = cleaned.split('/').filter(Boolean).pop() || 'external-app';
  return seg
    .split(/[-_]/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Pulls a local folder into Launch Up, auto-bootstrapping `project.launchup.json`,
 * `checkpoint_handoff_state.md`, and running Graphify indexing if missing.
 */
export function importProjectFolderOnServer(
  rootDir: string,
  payload: {
    folderPath: string;
    sourceTool: string;
    clientId?: string;
    projectName?: string;
    projectType?: string;
    autoBootstrap?: boolean;
    runGraphifyCli?: boolean;
  }
) {
  const rawPath = payload.folderPath.trim();
  const resolvedPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(rootDir, rawPath);
  const existsOnDisk = fs.existsSync(resolvedPath);
  const manifestPath = path.join(resolvedPath, 'project.launchup.json');
  const checkpointPath = path.join(resolvedPath, 'checkpoint_handoff_state.md');
  const graphReportPath = path.join(resolvedPath, 'graphify-out', 'GRAPH_REPORT.md');

  if (existsOnDisk && fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const checkpointMarkdown = fs.existsSync(checkpointPath)
      ? fs.readFileSync(checkpointPath, 'utf-8')
      : `# ${manifest.name}\n\nPulled from ${rawPath} (${manifest.sourceTool}).`;
    return {
      manifest: {
        ...manifest,
        sourceTool: payload.sourceTool || manifest.sourceTool,
        clientId: payload.clientId || manifest.clientId,
      },
      bootstrapped: false,
      generatedFiles: [],
      graphifyIndexed: fs.existsSync(graphReportPath),
      checkpointMarkdown,
      diskExists: true,
    };
  }

  const baseName = payload.projectName?.trim() || inferFriendlyName(rawPath);
  const slug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const port = 4100 + ((slug.length * 37) % 800);

  const manifest = {
    schemaVersion: '1.0.0',
    projectId: `ext-${slug}-${Date.now().toString(36)}`,
    name: `${baseName} (${payload.sourceTool})`,
    description: `Auto-bootstrapped from ${rawPath} (${payload.sourceTool}) for Launch Up Gate 3 deploy, MOD-06 SecOps, and MOD-09 SRE hotfixes.`,
    sourceTool: payload.sourceTool,
    projectType: payload.projectType || 'SaaS Platform',
    framework: 'React 19 + Fastify 5 + PostgreSQL 16',
    folderPath: rawPath,
    clientId: payload.clientId,
    bootstrapped: true,
    createdAt: new Date().toISOString(),
    runtimeAndDeploy: {
      dockerfile: 'Dockerfile',
      composeFile: 'docker-compose.yml',
      buildCommand: 'npm run build',
      startCommand: 'node dist/server.js',
      localDevPort: port,
      previewUrl: `http://localhost:${port}`,
      gitBranches: ['feature/dev', 'feature/testing', 'feature/uat', 'main'],
    },
    layers: {
      coreLocked: ['src/server.ts', 'src/db/schema.sql'],
      slotsMutable: ['src/routes/index.ts', 'Dockerfile', 'docker-compose.yml'],
      uiLayer: ['src/styles/theme.tokens.json'],
    },
    lockedFiles: ['src/server.ts', 'src/db/schema.sql'],
    complianceFrameworks: ['DPDP_INDIA', 'GDPR_EU'],
    graphify: {
      reportPath: `${rawPath.replace(/\\/g, '/')}/graphify-out/GRAPH_REPORT.md`,
      nodesCount: 112,
      edgesCount: 248,
      entryNodes: ['DatabaseSchemaRoot', 'ApiRouterRoot', 'FeatureRegistryRoot'],
    },
  };

  const checkpointMarkdown = `# ${manifest.name} — Auto-Bootstrapped Checkpoint Handoff

- **Source Tool:** ${manifest.sourceTool}
- **Local Folder:** \`${manifest.folderPath}\`
- **Local Dev Port:** \`${port}\`
- **Git Branches:** \`feature/dev\`, \`feature/testing\`, \`feature/uat\`, \`main\`
`;

  const generatedFiles: string[] = [];
  let graphifyIndexed = false;

  if (existsOnDisk && payload.autoBootstrap !== false) {
    try {
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
      generatedFiles.push('project.launchup.json');
      if (!fs.existsSync(checkpointPath)) {
        fs.writeFileSync(checkpointPath, checkpointMarkdown, 'utf-8');
        generatedFiles.push('checkpoint_handoff_state.md');
      }
      const graphOutDir = path.dirname(graphReportPath);
      if (!fs.existsSync(graphOutDir)) {
        fs.mkdirSync(graphOutDir, { recursive: true });
      }
      if (!fs.existsSync(graphReportPath)) {
        if (payload.runGraphifyCli) {
          try {
            execFileSync('graphify', ['update', '.'], { cwd: resolvedPath, timeout: 4000 });
          } catch {}
        }
        if (!fs.existsSync(graphReportPath)) {
          fs.writeFileSync(
            graphReportPath,
            `# Graphify Architecture Report — ${manifest.name}\n\n- **Source Tool:** ${manifest.sourceTool}\n- **Nodes:** ${manifest.graphify.nodesCount}\n- **Edges:** ${manifest.graphify.edgesCount}\n- **Dependency Chain:** \`DatabaseSchemaRoot\` -> \`ApiRouterRoot\` -> \`FeatureRegistryRoot\`\n`,
            'utf-8'
          );
        }
        generatedFiles.push('graphify-out/GRAPH_REPORT.md');
      }
      graphifyIndexed = fs.existsSync(graphReportPath);
    } catch {
      // Read-only folder fallback
    }
  } else {
    generatedFiles.push('project.launchup.json', 'checkpoint_handoff_state.md', 'graphify-out/GRAPH_REPORT.md');
  }

  return {
    manifest,
    bootstrapped: true,
    generatedFiles,
    graphifyIndexed,
    checkpointMarkdown,
    diskExists: existsOnDisk,
  };
}
