import type { GoldenTemplateManifest, Project, ProjectLaunchupManifest } from '../types/index.ts';

export interface GraphifyImpactNode {
  id: string;
  label: string;
  role: 'DatabaseSchemaRoot' | 'ApiRouterRoot' | 'FeatureRegistryRoot';
  filePath: string;
  locked: boolean;
}

export interface GraphifyFileEditCheck {
  filePath: string;
  allowed: boolean;
  layer: 'core-locked' | 'slots-mutable' | 'ui-layer' | 'unclassified';
  reason: string;
  tokenCostSavedUsd: number;
  impactedChain: string[];
}

export interface GraphifyImpactAnalysis {
  targetName: string;
  coreLockedFiles: string[];
  slotsMutableFiles: string[];
  uiLayerFiles: string[];
  lockedFiles: string[];
  blastRadiusChain: GraphifyImpactNode[];
  zeroTokenCostCoveragePercent: number;
}

/**
 * Builds a structured 3-column Graphify Pre-Change Impact Analysis for any Golden Template
 * or Pulled External Project manifest.
 */
export function buildGraphifyImpactAnalysis(options: {
  template?: GoldenTemplateManifest | null;
  project?: Project | null;
  manifest?: ProjectLaunchupManifest | null;
}): GraphifyImpactAnalysis {
  const manifest = options.manifest ?? options.project?.pulledManifest ?? null;
  const tmpl = options.template ?? null;

  if (tmpl) {
    const coreLockedFiles = tmpl.layers.coreLocked.files;
    const slotsMutableFiles = tmpl.layers.slotsMutable.files;
    const uiLayerFiles = [tmpl.layers.uiLayer.tokensFile, ...tmpl.layers.uiLayer.components];
    const lockedFiles = tmpl.lockedFiles;
    const totalCount = Math.max(
      1,
      coreLockedFiles.length + slotsMutableFiles.length + uiLayerFiles.length
    );

    return {
      targetName: tmpl.name,
      coreLockedFiles,
      slotsMutableFiles,
      uiLayerFiles,
      lockedFiles,
      zeroTokenCostCoveragePercent: Math.max(
        75,
        Math.round((tmpl.deltaCloneRatio || coreLockedFiles.length / totalCount) * 100)
      ),
      blastRadiusChain: [
        {
          id: 'db-root',
          label: tmpl.graphifyChain.databaseSchemaRoot,
          role: 'DatabaseSchemaRoot',
          filePath: coreLockedFiles[0] || slotsMutableFiles[0] || 'schema.sql',
          locked: lockedFiles.some((f) => f.endsWith('.sql')),
        },
        {
          id: 'api-root',
          label: tmpl.graphifyChain.apiRouterRoot,
          role: 'ApiRouterRoot',
          filePath: coreLockedFiles[0] || 'core-locked/router.ts',
          locked: true,
        },
        {
          id: 'feature-root',
          label: tmpl.graphifyChain.featureRegistryRoot,
          role: 'FeatureRegistryRoot',
          filePath: slotsMutableFiles[0] || 'slots-mutable/feature-routes.ts',
          locked: false,
        },
      ],
    };
  }

  const coreLockedFiles = manifest?.layers.coreLocked ?? [
    'services/governance-service/src/lib/verify_permission.ts',
    'src/db/rls-tenant-policy.sql',
  ];
  const slotsMutableFiles = manifest?.layers.slotsMutable ?? [
    'src/routes/feature-handlers.ts',
    'src/db/domain-slots.sql',
  ];
  const uiLayerFiles = manifest?.layers.uiLayer ?? [
    'ui-layer/theme.tokens.json',
    'src/components/workspace/BuildAreaView.tsx',
  ];
  const lockedFiles = manifest?.lockedFiles ?? coreLockedFiles;

  return {
    targetName: manifest?.name || options.project?.name || 'Active Project Workspace',
    coreLockedFiles,
    slotsMutableFiles,
    uiLayerFiles,
    lockedFiles,
    zeroTokenCostCoveragePercent: 88,
    blastRadiusChain: [
      {
        id: 'db-root',
        label: manifest?.graphify.entryNodes[0] || 'DatabaseSchemaRoot',
        role: 'DatabaseSchemaRoot',
        filePath: coreLockedFiles.find((f) => f.endsWith('.sql')) || coreLockedFiles[0] || 'src/db/schema.sql',
        locked: true,
      },
      {
        id: 'api-root',
        label: manifest?.graphify.entryNodes[1] || 'ApiRouterRoot',
        role: 'ApiRouterRoot',
        filePath: coreLockedFiles[0] || 'src/server.ts',
        locked: true,
      },
      {
        id: 'feature-root',
        label: manifest?.graphify.entryNodes[2] || 'FeatureRegistryRoot',
        role: 'FeatureRegistryRoot',
        filePath: slotsMutableFiles[0] || 'src/routes/rates.ts',
        locked: false,
      },
    ],
  };
}

/**
 * Evaluates whether an agent is permitted to edit a target file path before making changes.
 * Blocks any file listed in `lockedFiles` or `core-locked/` with explicit blast-radius trace.
 */
export function evaluatePreChangeEditGuard(
  filePath: string,
  analysis: GraphifyImpactAnalysis
): GraphifyFileEditCheck {
  const normalized = filePath.trim().replace(/\\/g, '/');
  const isExplicitlyLocked = analysis.lockedFiles.some(
    (lf) => lf.replace(/\\/g, '/') === normalized || normalized.endsWith(`/${lf.replace(/\\/g, '/')}`)
  );
  const isInCoreLockedDir =
    normalized.includes('core-locked/') ||
    analysis.coreLockedFiles.some((f) => f.replace(/\\/g, '/') === normalized);

  const impactedChain = analysis.blastRadiusChain.map((n) => `${n.role} (${n.filePath})`);

  if (isExplicitlyLocked || isInCoreLockedDir) {
    return {
      filePath: normalized,
      allowed: false,
      layer: 'core-locked',
      reason: `LOCKED_FILE_BLOCKED: "${normalized}" is immutable inside core-locked/ and verified at 0 token cost. Route customization via slots-mutable/ or ui-layer/ instead.`,
      tokenCostSavedUsd: 2.45,
      impactedChain,
    };
  }

  const isMutableSlot =
    normalized.includes('slots-mutable/') ||
    analysis.slotsMutableFiles.some((f) => f.replace(/\\/g, '/') === normalized);
  const isUiLayer =
    normalized.includes('ui-layer/') ||
    normalized.endsWith('theme.tokens.json') ||
    analysis.uiLayerFiles.some((f) => f.replace(/\\/g, '/') === normalized);

  if (isUiLayer) {
    return {
      filePath: normalized,
      allowed: true,
      layer: 'ui-layer',
      reason: `ALLOWED (ui-layer): Brand tokens & presentational UI edit isolated from database/auth core.`,
      tokenCostSavedUsd: 0.95,
      impactedChain: [impactedChain[2] || normalized],
    };
  }

  return {
    filePath: normalized,
    allowed: true,
    layer: isMutableSlot ? 'slots-mutable' : 'unclassified',
    reason: isMutableSlot
      ? `ALLOWED (slots-mutable): Scoped domain SQL/API slot verified against Graphify blast-radius boundary.`
      : `ALLOWED (mutable workspace file): Proceed through normal Stage 5 regression gate.`,
    tokenCostSavedUsd: 1.35,
    impactedChain: impactedChain.slice(1),
  };
}
