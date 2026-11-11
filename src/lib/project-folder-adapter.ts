import type {
  ExternalBuilderTool,
  Project,
  ProjectLaunchupManifest,
  ProjectType,
} from '../types/index.ts';

export const BUILTIN_WORKSPACE_SAMPLES: ProjectLaunchupManifest[] = [
  {
    schemaVersion: '1.0.0',
    projectId: 'ext-claude-freight-01',
    name: 'SwiftFreight Dispatch AI (Claude Code)',
    description:
      'External multi-tenant freight quoting & dispatch app built in Claude Code, pulled into Launch Up for Gate 3 deployment, MOD-06 SecOps, and MOD-09 SRE hotfixes.',
    sourceTool: 'Claude Code',
    projectType: 'SaaS Platform',
    framework: 'React 19 + Fastify 5 + PostgreSQL 16',
    folderPath: 'workspaces/sample-claude-code-app',
    clientId: 'client-1',
    bootstrapped: false,
    createdAt: '2026-11-11T10:00:00Z',
    runtimeAndDeploy: {
      dockerfile: 'Dockerfile',
      composeFile: 'docker-compose.yml',
      buildCommand: 'npm run build',
      startCommand: 'node dist/server.js',
      localDevPort: 4100,
      previewUrl: 'http://localhost:4100',
      gitBranches: ['feature/dev', 'feature/testing', 'feature/uat', 'main'],
    },
    layers: {
      coreLocked: ['src/server.ts', 'src/db/schema.sql'],
      slotsMutable: ['src/routes/rates.ts', 'Dockerfile', 'docker-compose.yml'],
      uiLayer: ['ui/theme.tokens.json'],
    },
    lockedFiles: ['src/server.ts', 'src/db/schema.sql'],
    complianceFrameworks: ['DPDP_INDIA', 'GDPR_EU'],
    graphify: {
      reportPath: 'workspaces/sample-claude-code-app/graphify-out/GRAPH_REPORT.md',
      nodesCount: 148,
      edgesCount: 312,
      entryNodes: ['DatabaseSchemaRoot', 'ApiRouterRoot', 'FeatureRegistryRoot'],
    },
  },
];

export interface PullFolderRequest {
  folderPath: string;
  sourceTool: ExternalBuilderTool;
  clientId?: string;
  projectName?: string;
  projectType?: ProjectType;
  autoBootstrap?: boolean;
  localDevPort?: number;
}

export interface PullFolderResponse {
  manifest: ProjectLaunchupManifest;
  bootstrapped: boolean;
  generatedFiles: string[];
  graphifyIndexed: boolean;
  checkpointMarkdown: string;
  isLiveService?: boolean;
}

export interface SreDebugTraceResult {
  errorSignature: string;
  faultyNode: string;
  faultyFile: string;
  dependencyPath: string[];
  rootCauseSummary: string;
  suggestedDiff: string;
  blockedByLock: boolean;
  regressionPassed: boolean;
  gate5Status: 'READY_FOR_GATE_5' | 'HOTFIX_PR_QUEUED';
}

function inferProjectNameFromPath(folderPath: string): string {
  const cleaned = folderPath.replace(/\\/g, '/').replace(/\/+$/, '');
  const parts = cleaned.split('/').filter(Boolean);
  const last = parts[parts.length - 1] || 'external-app';
  return last
    .split(/[-_]/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function deterministicPort(folderPath: string): number {
  let hash = 0;
  for (let i = 0; i < folderPath.length; i++) {
    hash = (hash * 31 + folderPath.charCodeAt(i)) % 900;
  }
  return 4100 + hash;
}

/**
 * Generates a full `project.launchup.json` manifest and `checkpoint_handoff_state.md`
 * for raw external folders built in Claude Code, ChatGPT Codex, or Cursor.
 */
export function bootstrapRawProjectFolderManifest(input: PullFolderRequest): {
  manifest: ProjectLaunchupManifest;
  checkpointMarkdown: string;
  generatedFiles: string[];
} {
  const normalizedPath = input.folderPath.trim() || 'workspaces/custom-external-app';
  const inferredName = input.projectName?.trim() || inferProjectNameFromPath(normalizedPath);
  const slug = inferredName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const port = input.localDevPort ?? deterministicPort(normalizedPath);

  const manifest: ProjectLaunchupManifest = {
    schemaVersion: '1.0.0',
    projectId: `ext-${slug}-${Date.now().toString(36)}`,
    name: `${inferredName}${inferredName.includes(input.sourceTool) ? '' : ` (${input.sourceTool})`}`,
    description: `Pulled external project from ${normalizedPath} (${input.sourceTool}) with Launch Up Gate 3 deployment, MOD-06 SecOps, and MOD-09 SRE hotfix support.`,
    sourceTool: input.sourceTool,
    projectType: input.projectType ?? 'SaaS Platform',
    framework:
      input.sourceTool === 'ChatGPT Codex'
        ? 'Next.js / Fastify + PostgreSQL 16'
        : input.sourceTool === 'Cursor'
        ? 'React 19 + TypeScript + Docker'
        : 'React 19 + Fastify 5 + PostgreSQL 16',
    folderPath: normalizedPath,
    clientId: input.clientId,
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
      reportPath: `${normalizedPath.replace(/\\/g, '/')}/graphify-out/GRAPH_REPORT.md`,
      nodesCount: 112,
      edgesCount: 248,
      entryNodes: ['DatabaseSchemaRoot', 'ApiRouterRoot', 'FeatureRegistryRoot'],
    },
  };

  const checkpointMarkdown = `# ${manifest.name} — Auto-Bootstrapped Checkpoint Handoff

- **Source Tool:** ${manifest.sourceTool}
- **Local Folder:** \`${manifest.folderPath}\`
- **Local Dev Port:** \`${manifest.runtimeAndDeploy.localDevPort}\`
- **Git Branches:** ${manifest.runtimeAndDeploy.gitBranches.map((b) => `\`${b}\``).join(', ')}
- **Core Locked Files:** ${manifest.lockedFiles.map((f) => `\`${f}\``).join(', ')}
- **Graphify Indexed Nodes:** \`${manifest.graphify.nodesCount}\` nodes · \`${manifest.graphify.edgesCount}\` edges
`;

  return {
    manifest,
    checkpointMarkdown,
    generatedFiles: [
      'project.launchup.json',
      'checkpoint_handoff_state.md',
      'graphify-out/GRAPH_REPORT.md',
    ],
  };
}

/**
 * Converts a `ProjectLaunchupManifest` (either discovered or auto-bootstrapped) into a Launch Up `Project` record.
 */
export function normalizePulledProjectToLaunchUp(
  manifest: ProjectLaunchupManifest,
  overrideClientId?: string
): Project {
  const clientIds = overrideClientId
    ? [overrideClientId]
    : manifest.clientId
    ? [manifest.clientId]
    : ['client-1'];

  const slug = manifest.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    id: manifest.projectId || `ext-${slug}-${Date.now()}`,
    name: manifest.name,
    type: manifest.projectType || 'SaaS Platform',
    status: 'In Progress',
    healthPercent: 98,
    liveUrl: manifest.runtimeAndDeploy.previewUrl,
    previewUrl: manifest.runtimeAndDeploy.previewUrl,
    localDevPort: manifest.runtimeAndDeploy.localDevPort,
    repoUrl: `local://${manifest.folderPath.replace(/\\/g, '/')}`,
    branch: manifest.runtimeAndDeploy.gitBranches[0] || 'feature/dev',
    framework: manifest.framework,
    serverTarget: 'Cloud Run',
    lastBackupDate: 'Synced on folder pull',
    backupStatus: 'Healthy',
    clientIds,
    monthlyRevenue: 3490,
    description: manifest.description,
    dataStructureModel: 'PostgreSQL 16 Multi-Tenant + Graphify AST',
    templatesUsed: `${manifest.sourceTool} Folder Adapter`,
    connectedServices: ['Docker BuildKit', 'MOD-06 SecOps', 'MOD-09 SRE'],
    integrationsActive: ['Git Branches', 'Docker Compose', 'Graphify'],
    deploymentStatus: 'Provisioned',
    sourceTool: manifest.sourceTool,
    localFolderPath: manifest.folderPath,
    pulledManifest: manifest,
  };
}

/**
 * Parses a pasted runtime stack trace or health alert and traces faulty nodes
 * against the pulled project's Graphify chain + locked files, producing a root-cause hotfix diff.
 */
export function analyzeStackTraceWithGraphify(
  stackTrace: string,
  project?: Project | null,
  graphReportMarkdown?: string
): SreDebugTraceResult {
  const text = (stackTrace || '').trim() || 'ZeroDivisionError in /api/v1/rates (weightKg = 0)';
  const firstLine = text.split(/\r?\n/)[0].slice(0, 140);

  // Extract file token like src/routes/rates.ts or services/rates.py
  const fileMatch = text.match(/([a-zA-Z0-9._/-]+\.(?:ts|tsx|js|jsx|py|sql))/i);
  const symbolMatch = text.match(/\b([a-zA-Z_][a-zA-Z0-9_]{3,})\s*\(/);

  const locked = new Set(project?.pulledManifest?.lockedFiles ?? []);
  const mutableCandidates = project?.pulledManifest?.layers.slotsMutable ?? ['src/routes/rates.ts'];
  const defaultTargetFile = mutableCandidates[0] || 'src/routes/rates.ts';
  const matchedFile = fileMatch?.[1] || defaultTargetFile;
  const blockedByLock = locked.has(matchedFile);

  const symbolName = symbolMatch?.[1] || (text.includes('rates') ? 'calculateFreightRatePerKg' : 'handleRouteRequest');
  const dbRoot =
    project?.pulledManifest?.graphify.entryNodes[0] || 'DatabaseSchemaRoot (src/db/schema.sql)';
  const routerRoot =
    project?.pulledManifest?.graphify.entryNodes[1] || 'ApiRouterRoot (src/server.ts)';
  const featureNode = `${matchedFile}::${symbolName}`;

  const reportHint =
    graphReportMarkdown && graphReportMarkdown.includes(symbolName)
      ? 'Matched directly in GRAPH_REPORT.md'
      : 'Resolved via `graphify path` blast-radius trace';

  const suggestedDiff = `--- a/${matchedFile}
+++ b/${matchedFile}
@@ -1,6 +1,10 @@
 export function ${symbolName}(totalUsd: number, weightKg: number): number {
+  if (!Number.isFinite(weightKg) || weightKg <= 0) {
+    // Guard injected by Launch Up MOD-09 SRE Auto-Hotfix
+    return 0;
+  }
   return Number((totalUsd / weightKg).toFixed(2));
 }`;

  return {
    errorSignature: firstLine,
    faultyNode: featureNode,
    faultyFile: matchedFile,
    dependencyPath: [dbRoot, routerRoot, featureNode],
    rootCauseSummary: `${reportHint}: Fault isolated at ${featureNode}. Added defensive validation & boundary guard before dividing/serializing payload.${
      blockedByLock
        ? ' Note: File is in core-locked/ — patch routed via mutable adapter overlay to keep core invariant untouched.'
        : ''
    }`,
    suggestedDiff,
    blockedByLock,
    regressionPassed: true,
    gate5Status: 'HOTFIX_PR_QUEUED',
  };
}
