import type {
  MatchedTemplateItem,
  ProjectType,
  TemplateMatchResult,
} from '../types';
import { sanitizeCodeSnippet } from './code-sanitizer.ts';

interface TemplateCatalogEntry {
  templateId: string;
  templateName: string;
  sourceKind: 'golden-template' | 'sanitized-component';
  preferredTypes: ProjectType[];
  keywords: string[];
  reusableComponents: string[];
  baseTokensSaved: number;
  sampleCode: string;
}

const BLENDED_LLM_USD_PER_1K_TOKENS = 0.012;

const TEMPLATE_CATALOG: TemplateCatalogEntry[] = [
  {
    templateId: 'golden-web-landing',
    templateName: 'Golden Web & SaaS Responsive Shell',
    sourceKind: 'golden-template',
    preferredTypes: ['Marketing Website', 'Landing Page', 'SaaS Platform', 'E-commerce Site'],
    keywords: [
      'web',
      'react',
      'landing',
      'responsive',
      '375px',
      '1920px',
      'seo',
      'dashboard',
      'saas',
      'theme',
      'tailwind',
      'ui',
      'portal',
    ],
    reusableComponents: [
      'AdaptiveThemeProvider',
      'ResponsiveNavDrawer',
      'HeroPricingMatrix',
      'AccessibilityLandmarkShell',
    ],
    baseTokensSaved: 115_000,
    sampleCode: `export const AdaptiveHero = () => '<section class="w-full bg-[var(--theme-surface)]"></section>';`,
  },
  {
    templateId: 'golden-mobile-android',
    templateName: 'Golden Android Kotlin / Compose Core',
    sourceKind: 'golden-template',
    preferredTypes: ['Mobile App API'],
    keywords: [
      'android',
      'mobile',
      'kotlin',
      'compose',
      'apk',
      'offline',
      'push',
      'biometric',
      'play store',
      'ios',
      'flutter',
    ],
    reusableComponents: [
      'ComposeThemeScaffold',
      'OfflineSyncRoomStore',
      'BiometricAuthPrompt',
      'PushNotificationRouter',
    ],
    baseTokensSaved: 140_000,
    sampleCode: `package com.launchup.app; const val THEME_TOKEN = "var(--theme-accent)"`,
  },
  {
    templateId: 'golden-backend-api',
    templateName: 'Golden Fastify + PostgreSQL 16 RLS API',
    sourceKind: 'golden-template',
    preferredTypes: ['CRM Platform', 'SaaS Platform', 'Mobile App API', 'E-commerce Site'],
    keywords: [
      'api',
      'fastify',
      'postgres',
      'postgresql',
      'rls',
      'openapi',
      'tenant',
      'm:n',
      'migration',
      'backend',
      'latency',
      'microservice',
      'rest',
    ],
    reusableComponents: [
      'PostgresRlsPolicyMigration',
      'OpenApi31SchemaValidator',
      'DeterministicErrorMapper',
      'TenantContextPoolHook',
    ],
    baseTokensSaved: 128_000,
    sampleCode: `export const dbConfig = { connectionString: process.env.DATABASE_URL };`,
  },
  {
    templateId: 'sanitized-gdpr-dpdp-consent',
    templateName: 'Sanitized Privacy & Compliance Kit (GDPR/DPDP/CCPA)',
    sourceKind: 'sanitized-component',
    preferredTypes: ['Marketing Website', 'Landing Page', 'SaaS Platform', 'CRM Platform', 'E-commerce Site'],
    keywords: [
      'gdpr',
      'dpdp',
      'ccpa',
      'privacy',
      'consent',
      'export',
      'erase',
      'compliance',
      'governance',
      'pii',
    ],
    reusableComponents: [
      'ConsentBannerModal',
      'PrivacyExportEndpoint',
      'CryptographicErasureJob',
    ],
    baseTokensSaved: 54_000,
    sampleCode: `export async function exportPrivacyData(userId: string) { return { userId, redacted: true }; }`,
  },
  {
    templateId: 'sanitized-rls-tenant-guard',
    templateName: 'Sanitized M:N Client-Project RBAC & RLS Guard',
    sourceKind: 'sanitized-component',
    preferredTypes: ['SaaS Platform', 'CRM Platform', 'Mobile App API'],
    keywords: [
      'm:n',
      'client_project_links',
      'rbac',
      'isolation',
      'auth',
      'role',
      'permission',
      'security',
    ],
    reusableComponents: [
      'M2NTenantIsolationMiddleware',
      'RbacMatrixEvaluator',
      'AuditTrailLogger',
    ],
    baseTokensSaved: 62_000,
    sampleCode: `export const assertTenantAccess = (tenantId: string) => Boolean(tenantId);`,
  },
  {
    templateId: 'sanitized-whatsapp-crm-bridge',
    templateName: 'Sanitized WhatsApp & n8n Webhook Dispatcher',
    sourceKind: 'sanitized-component',
    preferredTypes: ['CRM Platform', 'Marketing Website', 'E-commerce Site'],
    keywords: [
      'whatsapp',
      'crm',
      'n8n',
      'webhook',
      'automation',
      'campaign',
      'workflow',
      'messaging',
    ],
    reusableComponents: [
      'WebhookSignatureVerifier',
      'WhatsAppTemplateDispatcher',
      'RetryDeadLetterQueue',
    ],
    baseTokensSaved: 48_000,
    sampleCode: `export const verifyWebhook = (sig: string) => sig.length > 0;`,
  },
];

function scoreCatalogEntry(
  entry: TemplateCatalogEntry,
  normalizedPrd: string,
  projectType?: ProjectType
): { score: number; matchedCapabilities: string[] } {
  const matchedCapabilities = entry.keywords.filter((kw) =>
    normalizedPrd.includes(kw.toLowerCase())
  );

  const keywordRatio = matchedCapabilities.length / Math.max(entry.keywords.length, 1);
  const typeBonus = projectType && entry.preferredTypes.includes(projectType) ? 38 : 0;
  const keywordScore = Math.round(keywordRatio * 62);

  // Baseline relevance floor for core backend/privacy building blocks in Launch Up factory
  const baseline = entry.templateId === 'golden-backend-api' ? 12 : 6;
  const score = Math.min(99, typeBonus + keywordScore + (matchedCapabilities.length > 0 ? baseline : 0));

  return { score, matchedCapabilities };
}

/**
 * Matches a project's PRD requirements and archetype against golden templates
 * and pre-sanitized reusable components, estimating token and USD savings.
 */
export function matchTemplates(
  prdText: string,
  projectType?: ProjectType
): TemplateMatchResult {
  const normalizedPrd = (prdText || '').toLowerCase();

  const candidates: MatchedTemplateItem[] = TEMPLATE_CATALOG.map((entry) => {
    const { score, matchedCapabilities } = scoreCatalogEntry(
      entry,
      normalizedPrd,
      projectType
    );

    const verification = sanitizeCodeSnippet(entry.sampleCode);
    const scaleFactor = score / 100;
    const estimatedTokensSaved = Math.round(entry.baseTokensSaved * scaleFactor);
    const estimatedTokenSavingsUsd = Number(
      ((estimatedTokensSaved / 1000) * BLENDED_LLM_USD_PER_1K_TOKENS).toFixed(2)
    );

    return {
      templateId: entry.templateId,
      templateName: entry.templateName,
      sourceKind: entry.sourceKind,
      matchScore: score,
      matchedCapabilities:
        matchedCapabilities.length > 0
          ? matchedCapabilities.slice(0, 5)
          : entry.preferredTypes.slice(0, 2),
      reusableComponents: entry.reusableComponents,
      estimatedTokensSaved,
      estimatedTokenSavingsUsd,
      sanitizedVerified: verification.isSafe,
    };
  })
    .filter((item) => item.matchScore >= 25)
    .sort((a, b) => b.matchScore - a.matchScore);

  const selectedMatches = candidates.slice(0, 4);
  const totalTokensSaved = selectedMatches.reduce(
    (sum, item) => sum + item.estimatedTokensSaved,
    0
  );
  const totalEstimatedSavingsUsd = Number(
    selectedMatches
      .reduce((sum, item) => sum + item.estimatedTokenSavingsUsd, 0)
      .toFixed(2)
  );

  // Reusability percentage reflects proportion of factory generation covered by matched modules
  const rawPercent =
    selectedMatches.length > 0
      ? selectedMatches.reduce((sum, item) => sum + item.matchScore * 0.28, 0)
      : 0;
  const totalReusabilityPercent = Math.min(85, Math.round(rawPercent));

  return {
    matches: selectedMatches,
    totalReusabilityPercent,
    totalTokensSaved,
    totalEstimatedSavingsUsd,
    evaluatedAt: new Date().toISOString(),
  };
}
