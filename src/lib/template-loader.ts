import type { GoldenTemplateManifest, Template } from '../types/index.ts';

export const BUILTIN_GOLDEN_TEMPLATES: GoldenTemplateManifest[] = [
  {
    schemaVersion: '1.0.0',
    id: 'landing-page-launchpad',
    name: 'Landing Page Launchpad',
    version: '2.4.0',
    category: 'Marketing',
    description:
      'High-converting multi-section marketing shell with pre-wired SEO metadata, lead capture webhook slot, and DPDP/GDPR consent guard.',
    stars: 4.9,
    deployTime: '< 90s',
    previewImage:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    techStack: ['React 19', 'Tailwind v4', 'Vite 8', 'PostgreSQL Lead Slot'],
    deltaCloneRatio: 0.88,
    folderPath: 'golden-templates/landing-page-launchpad',
    layers: {
      coreLocked: {
        rootPath: 'core-locked/',
        zeroTokenCost: true,
        summary: 'Immutable SEO SSR router, DPDP/GDPR consent banner state & security headers.',
        files: [
          'golden-templates/landing-page-launchpad/core-locked/router.ts',
          'golden-templates/landing-page-launchpad/core-locked/compliance.ts',
        ],
      },
      slotsMutable: {
        rootPath: 'slots-mutable/',
        files: [
          'golden-templates/landing-page-launchpad/slots-mutable/api-leads.ts',
          'golden-templates/landing-page-launchpad/slots-mutable/seo-meta.sql',
        ],
        sqlSlots: ['leads_capture_table', 'utm_attribution_view'],
        apiSlots: ['POST /api/v1/public/leads', 'GET /api/v1/public/pricing'],
      },
      uiLayer: {
        rootPath: 'ui-layer/',
        tokensFile: 'golden-templates/landing-page-launchpad/ui-layer/theme.tokens.json',
        components: ['golden-templates/landing-page-launchpad/ui-layer/HeroSection.tsx'],
      },
    },
    lockedFiles: [
      'golden-templates/landing-page-launchpad/core-locked/router.ts',
      'golden-templates/landing-page-launchpad/core-locked/compliance.ts',
    ],
    graphifyChain: {
      databaseSchemaRoot: 'slots-mutable/seo-meta.sql::leads_capture',
      apiRouterRoot: 'core-locked/router.ts::LandingRouterRoot',
      featureRegistryRoot: 'slots-mutable/api-leads.ts::LeadCaptureFeatureRegistry',
    },
  },
  {
    schemaVersion: '1.0.0',
    id: 'frontend-modular-ui',
    name: 'Frontend Modular UI Kit',
    version: '3.1.0',
    category: 'Client Portal',
    description:
      'Multi-tenant client portal frontend with immutable RBAC session guards, hot-swappable widget slots, and adaptive Light/Dark/System design tokens.',
    stars: 4.8,
    deployTime: '< 2 mins',
    previewImage:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    techStack: ['React 19', 'TypeScript 5.8', 'Tailwind v4', 'Modular Slots'],
    deltaCloneRatio: 0.88,
    folderPath: 'golden-templates/frontend-modular-ui',
    layers: {
      coreLocked: {
        rootPath: 'core-locked/',
        zeroTokenCost: true,
        summary: 'Immutable JWT auth guard and multi-tenant workspace isolation provider.',
        files: [
          'golden-templates/frontend-modular-ui/core-locked/auth-guard.ts',
          'golden-templates/frontend-modular-ui/core-locked/tenant-context.ts',
        ],
      },
      slotsMutable: {
        rootPath: 'slots-mutable/',
        files: [
          'golden-templates/frontend-modular-ui/slots-mutable/dashboard-widgets.ts',
          'golden-templates/frontend-modular-ui/slots-mutable/billing-hooks.sql',
        ],
        sqlSlots: ['portal_widgets', 'subscription_webhooks'],
        apiSlots: ['GET /api/v1/portal/widgets', 'POST /api/v1/portal/preferences'],
      },
      uiLayer: {
        rootPath: 'ui-layer/',
        tokensFile: 'golden-templates/frontend-modular-ui/ui-layer/theme.tokens.json',
        components: ['golden-templates/frontend-modular-ui/ui-layer/DashboardShell.tsx'],
      },
    },
    lockedFiles: [
      'golden-templates/frontend-modular-ui/core-locked/auth-guard.ts',
      'golden-templates/frontend-modular-ui/core-locked/tenant-context.ts',
    ],
    graphifyChain: {
      databaseSchemaRoot: 'slots-mutable/billing-hooks.sql::portal_widgets',
      apiRouterRoot: 'core-locked/auth-guard.ts::verifyPortalSession',
      featureRegistryRoot: 'slots-mutable/dashboard-widgets.ts::PortalWidgetRegistry',
    },
  },
  {
    schemaVersion: '1.0.0',
    id: 'fullstack-saas-engine',
    name: 'Fullstack SaaS Engine',
    version: '4.0.0',
    category: 'B2B SaaS',
    description:
      'Enterprise M:N multi-tenant SaaS engine with locked PostgreSQL 16 Row-Level Security, Fastify RBAC middleware, Stripe/API slots, and decoupled theme tokens.',
    stars: 5.0,
    deployTime: '< 3 mins',
    previewImage:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    techStack: ['React 19', 'Fastify 5', 'PostgreSQL 16 RLS', 'Docker Compose'],
    deltaCloneRatio: 0.88,
    folderPath: 'golden-templates/fullstack-saas-engine',
    layers: {
      coreLocked: {
        rootPath: 'core-locked/',
        zeroTokenCost: true,
        summary: 'Immutable PostgreSQL 16 RLS tenant isolation policies and Fastify RBAC middleware.',
        files: [
          'golden-templates/fullstack-saas-engine/core-locked/rls-policy.sql',
          'golden-templates/fullstack-saas-engine/core-locked/rbac-middleware.ts',
        ],
      },
      slotsMutable: {
        rootPath: 'slots-mutable/',
        files: [
          'golden-templates/fullstack-saas-engine/slots-mutable/feature-routes.ts',
          'golden-templates/fullstack-saas-engine/slots-mutable/domain-schema.sql',
        ],
        sqlSlots: ['tenant_work_orders', 'billing_usage_events'],
        apiSlots: ['POST /api/v1/domain/orders', 'GET /api/v1/domain/metrics'],
      },
      uiLayer: {
        rootPath: 'ui-layer/',
        tokensFile: 'golden-templates/fullstack-saas-engine/ui-layer/theme.tokens.json',
        components: ['golden-templates/fullstack-saas-engine/ui-layer/TenantBillingPanel.tsx'],
      },
    },
    lockedFiles: [
      'golden-templates/fullstack-saas-engine/core-locked/rls-policy.sql',
      'golden-templates/fullstack-saas-engine/core-locked/rbac-middleware.ts',
    ],
    graphifyChain: {
      databaseSchemaRoot: 'core-locked/rls-policy.sql::DatabaseSchemaRoot',
      apiRouterRoot: 'core-locked/rbac-middleware.ts::ApiRouterRoot',
      featureRegistryRoot: 'slots-mutable/feature-routes.ts::FeatureRegistryRoot',
    },
  },
];

export interface ParsedTemplateScanResult {
  templates: GoldenTemplateManifest[];
  errors: Array<{ source: string; error: string }>;
  scannedAt: string;
}

/**
 * Validates and normalizes an unknown JSON object read from a `template.launchup.json` manifest.
 */
export function parseTemplateManifest(
  raw: unknown,
  folderPath?: string
): { valid: true; manifest: GoldenTemplateManifest } | { valid: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Manifest payload must be a JSON object' };
  }
  const obj = raw as Record<string, unknown>;
  const id = typeof obj.id === 'string' ? obj.id.trim() : '';
  const name = typeof obj.name === 'string' ? obj.name.trim() : '';
  if (!id || !name) {
    return { valid: false, error: 'Missing required manifest fields: id and name' };
  }

  const layers = (obj.layers && typeof obj.layers === 'object' ? obj.layers : {}) as Record<
    string,
    any
  >;
  const coreLocked = layers.coreLocked ?? {};
  const slotsMutable = layers.slotsMutable ?? {};
  const uiLayer = layers.uiLayer ?? {};

  const lockedFiles = Array.isArray(obj.lockedFiles)
    ? obj.lockedFiles.filter((f): f is string => typeof f === 'string')
    : Array.isArray(coreLocked.files)
    ? coreLocked.files.filter((f: unknown): f is string => typeof f === 'string')
    : [];

  const graphifyChain = (obj.graphifyChain && typeof obj.graphifyChain === 'object'
    ? obj.graphifyChain
    : {}) as Record<string, unknown>;

  const manifest: GoldenTemplateManifest = {
    schemaVersion: typeof obj.schemaVersion === 'string' ? obj.schemaVersion : '1.0.0',
    id,
    name,
    version: typeof obj.version === 'string' ? obj.version : '1.0.0',
    category:
      typeof obj.category === 'string'
        ? (obj.category as GoldenTemplateManifest['category'])
        : 'B2B SaaS',
    description:
      typeof obj.description === 'string'
        ? obj.description
        : 'Auto-discovered Launch Up Golden Template package.',
    stars: typeof obj.stars === 'number' ? obj.stars : 4.8,
    deployTime: typeof obj.deployTime === 'string' ? obj.deployTime : '< 3 mins',
    previewImage:
      typeof obj.previewImage === 'string'
        ? obj.previewImage
        : 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    techStack: Array.isArray(obj.techStack)
      ? obj.techStack.filter((t): t is string => typeof t === 'string')
      : ['React 19', 'TypeScript'],
    deltaCloneRatio: typeof obj.deltaCloneRatio === 'number' ? obj.deltaCloneRatio : 0.88,
    folderPath: folderPath || (typeof obj.folderPath === 'string' ? obj.folderPath : `golden-templates/${id}`),
    layers: {
      coreLocked: {
        rootPath: typeof coreLocked.rootPath === 'string' ? coreLocked.rootPath : 'core-locked/',
        zeroTokenCost: coreLocked.zeroTokenCost !== false,
        summary:
          typeof coreLocked.summary === 'string'
            ? coreLocked.summary
            : 'Immutable core runtime files cloned at zero LLM token cost.',
        files: Array.isArray(coreLocked.files) ? coreLocked.files : lockedFiles,
      },
      slotsMutable: {
        rootPath: typeof slotsMutable.rootPath === 'string' ? slotsMutable.rootPath : 'slots-mutable/',
        files: Array.isArray(slotsMutable.files) ? slotsMutable.files : [],
        sqlSlots: Array.isArray(slotsMutable.sqlSlots) ? slotsMutable.sqlSlots : [],
        apiSlots: Array.isArray(slotsMutable.apiSlots) ? slotsMutable.apiSlots : [],
      },
      uiLayer: {
        rootPath: typeof uiLayer.rootPath === 'string' ? uiLayer.rootPath : 'ui-layer/',
        tokensFile:
          typeof uiLayer.tokensFile === 'string'
            ? uiLayer.tokensFile
            : `golden-templates/${id}/ui-layer/theme.tokens.json`,
        components: Array.isArray(uiLayer.components) ? uiLayer.components : [],
      },
    },
    lockedFiles,
    graphifyChain: {
      databaseSchemaRoot:
        typeof graphifyChain.databaseSchemaRoot === 'string'
          ? graphifyChain.databaseSchemaRoot
          : 'slots-mutable/domain-schema.sql::DatabaseSchemaRoot',
      apiRouterRoot:
        typeof graphifyChain.apiRouterRoot === 'string'
          ? graphifyChain.apiRouterRoot
          : 'core-locked/router.ts::ApiRouterRoot',
      featureRegistryRoot:
        typeof graphifyChain.featureRegistryRoot === 'string'
          ? graphifyChain.featureRegistryRoot
          : 'slots-mutable/feature-routes.ts::FeatureRegistryRoot',
    },
  };

  return { valid: true, manifest };
}

/**
 * Validates and compiles an arbitrary array of scanned raw manifests into `ParsedTemplateScanResult`.
 */
export function scanGoldenTemplatesFromManifests(
  rawEntries: Array<{ folderPath: string; rawJson: unknown }>
): ParsedTemplateScanResult {
  const templates: GoldenTemplateManifest[] = [];
  const errors: Array<{ source: string; error: string }> = [];

  for (const entry of rawEntries) {
    const parsed = parseTemplateManifest(entry.rawJson, entry.folderPath);
    if (parsed.valid) {
      templates.push(parsed.manifest);
    } else {
      errors.push({ source: entry.folderPath, error: parsed.error });
    }
  }

  return {
    templates,
    errors,
    scannedAt: new Date().toISOString(),
  };
}

/**
 * Converts a `GoldenTemplateManifest` into a Launch Up `Template` card item for catalog UI.
 */
export function toCatalogTemplate(manifest: GoldenTemplateManifest): Template {
  return {
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    category: manifest.category,
    techStack: manifest.techStack,
    stars: manifest.stars,
    previewImage: manifest.previewImage,
    deployTime: manifest.deployTime,
  };
}
