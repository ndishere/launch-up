import type {
  SanitizationCategory,
  SanitizationFinding,
  SanitizationResult,
} from '../types';

interface SanitizerRule {
  name: string;
  category: SanitizationCategory;
  severity: 'high' | 'medium' | 'low';
  pattern: RegExp;
  replace: (match: string, ...groups: string[]) => string;
}

const SANITIZER_RULES: SanitizerRule[] = [
  // ------------------------------------------------------------------
  // 1. SECRETS, CREDENTIALS & CONNECTION STRINGS (run before PII rules)
  // ------------------------------------------------------------------
  {
    name: 'Database / Cache Connection URI',
    category: 'secret',
    severity: 'high',
    pattern:
      /\b(?:postgres(?:ql)?|mongodb(?:\+srv)?|mysql|redis|amqp):\/\/[^\s'"`<>)]+/gi,
    replace: (match) =>
      match.toLowerCase().startsWith('redis')
        ? 'process.env.REDIS_URL'
        : 'process.env.DATABASE_URL',
  },
  {
    name: 'AWS Access Key ID',
    category: 'secret',
    severity: 'high',
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
    replace: () => 'process.env.AWS_ACCESS_KEY_ID',
  },
  {
    name: 'Hardcoded Env / Secret Assignment',
    category: 'secret',
    severity: 'high',
    pattern:
      /\b(AWS_SECRET_ACCESS_KEY|DB_PASSWORD|DATABASE_PASSWORD|API_SECRET|JWT_SECRET|STRIPE_SECRET|PRIVATE_KEY|CLIENT_SECRET|AUTH_SECRET)\b(\s*[:=]\s*)(?!process\.env\.|\$\{)(?:(['"`])(?!process\.env\.|\$\{)[^'"`\n]{6,}\3|[^\s'"`\n;,#]{8,})/g,
    replace: (_match, key: string, sep: string, quote?: string) => {
      if (quote) {
        return `${key}${sep}process.env.${key}`;
      }
      return `${key}${sep}\${${key}}`;
    },
  },
  {
    name: 'Provider API Key / Token Literal',
    category: 'secret',
    severity: 'high',
    pattern:
      /\b(?:sk_live_[0-9a-zA-Z]{12,}|sk_test_[0-9a-zA-Z]{12,}|sk-[0-9a-zA-Z_-]{16,}|ghp_[0-9a-zA-Z]{20,}|AIza[0-9A-Za-z_-]{25,}|xox[baprs]-[0-9A-Za-z-]{10,})\b/g,
    replace: () => 'process.env.API_SECRET_KEY',
  },
  {
    name: 'Hardcoded Bearer Token',
    category: 'secret',
    severity: 'high',
    pattern: /\bBearer\s+[A-Za-z0-9._-]{16,}/g,
    replace: () => 'Bearer ${process.env.AUTH_TOKEN}',
  },

  // ------------------------------------------------------------------
  // 2. PERSONALLY IDENTIFIABLE INFORMATION (PII)
  // ------------------------------------------------------------------
  {
    name: 'Email Address (PII)',
    category: 'pii',
    severity: 'medium',
    pattern: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
    replace: () => '[REDACTED_EMAIL]',
  },
  {
    name: 'Phone Number (PII)',
    category: 'pii',
    severity: 'medium',
    pattern:
      /(?:\+\d{1,3}[\s.-]?)?(?:\(\d{3}\)|\b\d{3})[\s.-]\d{3}[\s.-]\d{4}\b|\+\d{1,3}[\s.-]?\d{4,5}[\s.-]?\d{5}\b/g,
    replace: () => '[REDACTED_PHONE]',
  },
  {
    name: 'Hardcoded Street Address (PII)',
    category: 'pii',
    severity: 'medium',
    pattern:
      /\b\d{1,5}\s+(?:[A-Z][a-zA-Z0-9]+\s+){1,4}(?:Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Lane|Ln|Way|Parkway|Pkwy)\b(?:,\s*[A-Za-z\s]+(?:,\s*[A-Z]{2}\s*\d{5})?)?/g,
    replace: () => '[REDACTED_ADDRESS]',
  },
  {
    name: 'Hardcoded Author / Owner Name (PII)',
    category: 'pii',
    severity: 'medium',
    pattern:
      /(@author|Author|Owner|Contact\s*Name|Full\s*Name)(\s*[:=]\s*)(['"]?)[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+(['"]?)/g,
    replace: (_match, label: string, sep: string, q1: string, q2: string) =>
      `${label}${sep}${q1}[REDACTED_NAME]${q2}`,
  },

  // ------------------------------------------------------------------
  // 3. PROPRIETARY / RIGID UI STYLING CONSTRAINTS
  // ------------------------------------------------------------------
  {
    name: 'Hardcoded Hex Color Token',
    category: 'styling',
    severity: 'low',
    pattern: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g,
    replace: () => 'var(--theme-accent)',
  },
  {
    name: 'Hardcoded RGB/RGBA Color',
    category: 'styling',
    severity: 'low',
    pattern: /rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*[\d.]+)?\s*\)/g,
    replace: () => 'var(--theme-surface)',
  },
  {
    name: 'Proprietary CSS Font-Family Lock',
    category: 'styling',
    severity: 'low',
    pattern: /font-family\s*:\s*(?!var\(--font-)[^;}\n]+/gi,
    replace: () => 'font-family: var(--font-sans)',
  },
  {
    name: 'Proprietary Inline FontFamily Lock',
    category: 'styling',
    severity: 'low',
    pattern: /fontFamily\s*:\s*(['"])(?!var\(--font-)[^'"]+\1/g,
    replace: () => "fontFamily: 'var(--font-sans)'",
  },
  {
    name: 'Rigid !important CSS Override',
    category: 'styling',
    severity: 'low',
    pattern: /\s*!important\b/gi,
    replace: () => '',
  },
  {
    name: 'Fixed Desktop Pixel Width Constraint',
    category: 'styling',
    severity: 'low',
    pattern:
      /\b(min-width|max-width|width|minWidth|maxWidth)\s*:\s*(['"]?)(?:[5-9]\d{2}|[1-9]\d{3,})px\2/gi,
    replace: (_match, prop: string, quote: string) =>
      `${prop}: ${quote}100%${quote}`,
  },
  {
    name: 'Rigid Extreme Z-Index Override',
    category: 'styling',
    severity: 'low',
    pattern: /\b(z-index|zIndex)\s*:\s*(?:9{3,}|\d{5,})\b/gi,
    replace: (_match, prop: string) =>
      prop === 'zIndex' ? 'zIndex: 40' : 'z-index: var(--z-overlay, 40)',
  },
];

const SEVERITY_WEIGHT: Record<SanitizationFinding['severity'], number> = {
  high: 25,
  medium: 15,
  low: 8,
};

function getLineNumberAt(source: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < source.length; i++) {
    if (source.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function maskPreview(value: string, category: SanitizationCategory): string {
  const trimmed = value.trim();
  if (category === 'secret' && trimmed.length > 10) {
    return `${trimmed.slice(0, 6)}...${trimmed.slice(-3)}`;
  }
  if (trimmed.length > 36) {
    return `${trimmed.slice(0, 33)}...`;
  }
  return trimmed;
}

function computeRiskScore(findings: SanitizationFinding[]): number {
  const total = findings.reduce((sum, f) => sum + SEVERITY_WEIGHT[f.severity], 0);
  return Math.min(100, total);
}

function collectFindings(code: string): {
  rewritten: string;
  findings: SanitizationFinding[];
} {
  let current = code;
  const findings: SanitizationFinding[] = [];
  let seq = 1;

  for (const rule of SANITIZER_RULES) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    current = current.replace(regex, (...args) => {
      const match = args[0] as string;
      const offset = args[args.length - 2] as number;
      const groups = args.slice(1, -2) as string[];
      const replacement = rule.replace(match, ...groups);

      findings.push({
        id: `san-${seq++}`,
        category: rule.category,
        ruleName: rule.name,
        matchedPreview: maskPreview(match, rule.category),
        replacement: replacement || '[REMOVED]',
        line: getLineNumberAt(current, offset),
        severity: rule.severity,
      });

      return replacement;
    });
  }

  return { rewritten: current, findings };
}

/**
 * Inspects and sanitizes code templates or open-source snippets before reuse.
 * Removes PII, hardcoded secrets/connection URIs, and rigid UI styling tokens.
 */
export function sanitizeCodeSnippet(rawCode: string): SanitizationResult {
  const source = rawCode ?? '';
  const { rewritten, findings } = collectFindings(source);
  const verificationPass = collectFindings(rewritten);

  const countsByCategory: Record<SanitizationCategory, number> = {
    pii: 0,
    secret: 0,
    styling: 0,
  };
  for (const item of findings) {
    countsByCategory[item.category] += 1;
  }

  const riskScoreBefore = computeRiskScore(findings);
  const riskScoreAfter = computeRiskScore(verificationPass.findings);

  return {
    sanitizedCode: rewritten,
    removedItems: findings,
    countsByCategory,
    riskScoreBefore,
    riskScoreAfter,
    isSafe: riskScoreAfter === 0,
    scannedAt: new Date().toISOString(),
  };
}

const SAMPLE_STRIPE_PLACEHOLDER = ['sk', 'live', 'demoToken9876543210abcd'].join('_');

/**
 * Sample unsafe snippet for interactive FinOps sanitizer testing and verification.
 */
export const SAMPLE_UNSAFE_TEMPLATE_SNIPPET = `/**
 * @author: Jordan Mercer
 * Contact Name: Jordan Mercer
 * Support: billing-ops@legacy-client-corp.com | +1 (415) 890-4312
 * HQ: 742 Evergreen Terrace, Springfield, IL 62704
 */
const DATABASE_URL = "postgres://admin:S3cr3tP@ss99@prod-db.legacy.internal:5432/app";
const AWS_KEY = "AKIAIOSFODNN7EXAMPLE";
const STRIPE_SECRET = "${SAMPLE_STRIPE_PLACEHOLDER}";
const AUTH_HEADER = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.legacyTokenPayload";

export const LegacyHeroCardStyle = {
  backgroundColor: '#1E1B4B',
  borderColor: 'rgba(15, 23, 42, 0.9)',
  fontFamily: 'LegacyBrandSerif, Georgia, serif',
  width: '1280px',
  boxShadow: '0 8px 30px #000000 !important',
  zIndex: 99999,
};`;
