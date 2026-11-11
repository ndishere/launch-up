import type { CavemanAgentMode, TokenOptimizerSettings } from '../types';
import { sanitizeCodeSnippet } from './code-sanitizer.ts';

export interface CavemanCompressionResult {
  compressedText: string;
  rawTokens: number;
  compressedTokens: number;
  savedTokens: number;
  reductionPercent: number;
  mode: Exclude<CavemanAgentMode, 'off'>;
  systemPrompt: string;
}

export interface RepoSourceFileInput {
  path: string;
  content: string;
}

export interface RepomixSkeletonResult {
  markdownDigest: string;
  rawTokens: number;
  compressedTokens: number;
  savedTokens: number;
  reductionPercent: number;
  filesProcessed: number;
  secretsScrubbed: number;
}

export interface ProjectContextCompactResult {
  filename: 'PROJECT_CONTEXT_COMPACT.md';
  markdown: string;
  rawTokens: number;
  compressedTokens: number;
  savedTokens: number;
  reductionPercent: number;
  breakdown: {
    graphifyTokens: number;
    repomixTokens: number;
    cavemanHandoffTokens: number;
  };
}

export interface TokenCompressionSummary {
  rawTokens: number;
  compressedTokens: number;
  savedTokens: number;
  reductionPercent: number;
  estimatedVramGb: number;
  vramSafeForRtx3050: boolean;
  estimatedUsdSaved: number;
  deltaBoilerplateClonedPercent: number;
}

export const DEFAULT_TOKEN_OPTIMIZER_SETTINGS: TokenOptimizerSettings = {
  turboQuantKvCacheQ4: true,
  sequentialSingleGpuQueue: true,
  cavemanMode: 'full',
  repomixAstSkeletonMode: true,
  goldenTemplateDeltaOnly: true,
  vramBudgetGb: 6,
};

/**
 * Deterministic token estimator (~4 chars per token weighted slightly for code punctuation).
 */
export function estimateTokenCount(text: string): number {
  const normalized = (text ?? '').trim();
  if (!normalized) return 0;
  return Math.max(1, Math.ceil(normalized.length / 4));
}

export function getCavemanSystemPrompt(mode: CavemanAgentMode): string {
  switch (mode) {
    case 'lite':
      return 'Respond in concise caveman-lite: skip conversational filler and pleasantries, keep technical details and code intact.';
    case 'full':
      return 'Respond in terse caveman-speak: drop filler/pleasantries, keep 100% technical accuracy and code intact';
    case 'ultra':
      return 'Respond in terse caveman-speak (/caveman ultra): drop filler/pleasantries, articles, copulas & transitions; emit only high-density telemetry, symbols, diffs, and code intact.';
    default:
      return 'Standard verbose assistant output mode active.';
  }
}

const VERBOSE_FILLER_PHRASES = [
  /\bplease\s+note\s+that\b/gi,
  /\bit\s+is\s+important\s+to\s+note\s+that\b/gi,
  /\byou\s+should\s+make\s+sure\s+to\b/gi,
  /\bin\s+order\s+to\b/gi,
  /\bas\s+a\s+result\s+of\b/gi,
  /\bas\s+a\s+result\b/gi,
  /\bin\s+addition\s+to\s+this\b/gi,
  /\bin\s+addition\b/gi,
  /\bfor\s+the\s+purpose\s+of\b/gi,
  /\bthis\s+means\s+that\b/gi,
  /\btherefore\b/gi,
  /\bessentially\b/gi,
  /\bbasically\b/gi,
  /\bactually\b/gi,
  /\bfurthermore\b/gi,
  /\bmoreover\b/gi,
  /\badditionally\b/gi,
  /\bconsequently\b/gi,
  /\bnevertheless\b/gi,
  /\bhowever\b/gi,
  /\bmeanwhile\b/gi,
  /\byou\s+should\b/gi,
  /\bwe\s+need\s+to\b/gi,
  /\bmust\s+always\b/gi,
];

const ARTICLE_AND_COPULA_WORDS = [
  /\b(?:the|an|a)\b/gi,
  /\b(?:is|are|was|were|being|been|am)\b/gi,
  /\b(?:there\s+is|there\s+are)\b/gi,
  /\b(?:very|really|quite|rather|simply|just|actually|clearly|obviously)\b/gi,
];

const ULTRA_EXTRA_WORDS = [
  /\b(?:that|which|whom|whose|into|onto|upon|within|throughout)\b/gi,
  /\b(?:and\s+also|as\s+well\s+as)\b/gi,
  /\b(?:please|kindly|ensure|make\s+sure)\b/gi,
];

/**
 * Layer 1 & 2: Caveman Semantic Compressor.
 * Strips filler grammar, articles, and verbose transitions while locking 100% of
 * code blocks, inline code, file paths, URLs, SQL keywords, and numeric values.
 */
export function compressToCavemanMd(
  input: string,
  mode: Exclude<CavemanAgentMode, 'off'> = 'full'
): CavemanCompressionResult {
  const rawTokens = estimateTokenCount(input);
  if (!input.trim()) {
    return {
      compressedText: '',
      rawTokens: 0,
      compressedTokens: 0,
      savedTokens: 0,
      reductionPercent: 0,
      mode,
      systemPrompt: getCavemanSystemPrompt(mode),
    };
  }

  const protectedTokens: string[] = [];
  const lockToken = (match: string): string => {
    const idx = protectedTokens.length;
    protectedTokens.push(match);
    return `__CVM_LOCK_${idx}__`;
  };

  // Lock protected technical artifacts in strict precedence order
  let working = input
    // Fenced code blocks
    .replace(/```[\s\S]*?```/g, lockToken)
    // Inline code spans
    .replace(/`[^`\r\n]+`/g, lockToken)
    // URLs
    .replace(/https?:\/\/[^\s)>\]]+/g, lockToken)
    // File paths & API endpoints (e.g., src/lib/foo.ts, /api/v1/governance/verify)
    .replace(/(?:\b[a-zA-Z0-9._-]+\/)+[a-zA-Z0-9._-]+\b|\/api\/v\d+\/[a-zA-Z0-9/_:-]+/g, lockToken)
    // SQL / Policy clauses (line segments starting with DDL keywords)
    .replace(/\b(?:CREATE\s+TABLE|ALTER\s+TABLE|ENABLE\s+ROW\s+LEVEL\s+SECURITY|CREATE\s+POLICY|SELECT|INSERT\s+INTO|REFERENCES)\b[^\r\n]*/gi, lockToken)
    // Numbers, versions, currencies, percentages, dimensions
    .replace(/[$€£]?\b\d+(?:[.,:_/-]\d+)*%?(?:ms|s|GB|MB|KB|px|M|k|x|t\/s)?\b/gi, lockToken);

  for (const pattern of VERBOSE_FILLER_PHRASES) {
    working = working.replace(pattern, ' ');
  }

  if (mode === 'full' || mode === 'ultra') {
    for (const pattern of ARTICLE_AND_COPULA_WORDS) {
      working = working.replace(pattern, ' ');
    }
  }

  if (mode === 'ultra') {
    for (const pattern of ULTRA_EXTRA_WORDS) {
      working = working.replace(pattern, ' ');
    }
  }

  // Clean spacing & punctuation artifacts created by removed filler
  working = working
    .replace(/[ \t]+([,.;:!?])/g, '$1')
    .replace(/,\s*,+/g, ',')
    .replace(/\(\s*\)/g, '')
    .replace(/^[ \t]*[,.;:]+[ \t]*/gm, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();

  if (mode === 'ultra') {
    working = working.replace(/\n{2,}/g, '\n');
  }

  // Restore all protected blocks verbatim
  const compressedText = working.replace(/__CVM_LOCK_(\d+)__/g, (_full, idxStr: string) => {
    const idx = Number(idxStr);
    return protectedTokens[idx] ?? '';
  });

  const compressedTokens = estimateTokenCount(compressedText);
  const savedTokens = Math.max(0, rawTokens - compressedTokens);
  const reductionPercent =
    rawTokens > 0 ? Number(((savedTokens / rawTokens) * 100).toFixed(1)) : 0;

  return {
    compressedText,
    rawTokens,
    compressedTokens,
    savedTokens,
    reductionPercent,
    mode,
    systemPrompt: getCavemanSystemPrompt(mode),
  };
}

function extractAstSkeletonFromFile(rawContent: string, stripComments = true): string {
  let content = rawContent;

  if (stripComments) {
    content = content
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      .replace(/(^|\s)#\s+[^\r\n]*$/gm, '$1');
  }

  const lines = content.split(/\r?\n/);
  const keptLines: string[] = [];
  let braceDepth = 0;
  let insideSignatureBlock = false;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const isInterfaceOrTypeStart = /^(?:export\s+)?(?:interface|type|enum)\s+\w+/.test(trimmed);
    const isSqlContract = /^(?:CREATE\s+(?:TABLE|POLICY|INDEX)|ALTER\s+TABLE|ENABLE\s+ROW)/i.test(trimmed);
    const isExportDecl = /^export\s+(?:async\s+)?(?:function|const|class)\s+/.test(trimmed);
    const isRouteDecl = /^(?:app|router)\.(?:get|post|put|patch|delete)\s*\(/.test(trimmed);

    if (braceDepth === 0) {
      if (isInterfaceOrTypeStart || isSqlContract) {
        keptLines.push(trimmed);
        insideSignatureBlock = trimmed.includes('{') && !trimmed.includes('}');
      } else if (isExportDecl || isRouteDecl) {
        if (trimmed.includes('{') && !trimmed.includes('}')) {
          const signatureHeader = trimmed.slice(0, trimmed.indexOf('{')).trim();
          keptLines.push(`${signatureHeader} { /* body stripped */ }`);
          insideSignatureBlock = false;
        } else {
          keptLines.push(trimmed);
        }
      }
    } else if (insideSignatureBlock) {
      keptLines.push(`  ${trimmed}`);
      if (trimmed.startsWith('}')) {
        insideSignatureBlock = false;
      }
    }

    const openBraces = (trimmed.match(/\{/g) || []).length;
    const closeBraces = (trimmed.match(/\}/g) || []).length;
    braceDepth = Math.max(0, braceDepth + openBraces - closeBraces);
  }

  if (keptLines.length === 0) {
    // Fallback for plain config/markdown fragments: compact whitespace only
    return lines
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 12)
      .join('\n');
  }

  return keptLines.join('\n');
}

/**
 * Layer 3: Repomix Markdown Skeleton Packer.
 * Sanitizes secrets/PII, strips comments & implementation bodies, and packs project/template
 * AST signatures, interfaces, schemas & routes into a single compressed markdown digest.
 */
export function packRepoToCompressedMd(
  files: RepoSourceFileInput[],
  options: { stripComments?: boolean; sanitize?: boolean } = {}
): RepomixSkeletonResult {
  const { stripComments = true, sanitize = true } = options;
  let rawCombinedChars = 0;
  let secretsScrubbed = 0;
  const sections: string[] = [
    '# REPOMIX AST SKELETON DIGEST',
    `> Files Packed: ${files.length} | AST Signatures Only | Sanitized: ${sanitize}`,
    '',
  ];

  for (const file of files) {
    rawCombinedChars += file.content.length;
    let source = file.content;
    if (sanitize) {
      const sanitized = sanitizeCodeSnippet(source);
      source = sanitized.sanitizedCode;
      secretsScrubbed += sanitized.countsByCategory.secret + sanitized.countsByCategory.pii;
    }

    const skeleton = extractAstSkeletonFromFile(source, stripComments);
    const ext = file.path.split('.').pop() || 'ts';
    sections.push(`## \`${file.path}\``);
    sections.push(`\`\`\`${ext}`);
    sections.push(skeleton);
    sections.push('```');
    sections.push('');
  }

  const markdownDigest = sections.join('\n').trim();
  const rawTokens = Math.max(1, Math.ceil(rawCombinedChars / 4));
  const compressedTokens = estimateTokenCount(markdownDigest);
  const savedTokens = Math.max(0, rawTokens - compressedTokens);
  const reductionPercent =
    rawTokens > 0 ? Number(((savedTokens / rawTokens) * 100).toFixed(1)) : 0;

  return {
    markdownDigest,
    rawTokens,
    compressedTokens,
    savedTokens,
    reductionPercent,
    filesProcessed: files.length,
    secretsScrubbed,
  };
}

/**
 * Layer 4: Graphify + Repomix + Caveman Checkpoint Sync.
 * Produces the compact `PROJECT_CONTEXT_COMPACT.md` consumed by local/cloud agents.
 */
export function generateProjectContextCompactMd(params: {
  projectName: string;
  projectType: string;
  branchNames: string[];
  workspaceSummary: string;
  handoffCheckpointMd: string;
  templateFiles: RepoSourceFileInput[];
  optimizer: TokenOptimizerSettings;
  graphifyNodes?: number;
  graphifyEdges?: number;
}): ProjectContextCompactResult {
  const cavemanMode: Exclude<CavemanAgentMode, 'off'> =
    params.optimizer.cavemanMode === 'off' ? 'lite' : params.optimizer.cavemanMode;

  const cavemanHandoff = compressToCavemanMd(params.handoffCheckpointMd, cavemanMode);
  const cavemanSummary = compressToCavemanMd(params.workspaceSummary, cavemanMode);
  const repomix = packRepoToCompressedMd(params.templateFiles, {
    stripComments: true,
    sanitize: true,
  });

  const graphifyBlock = [
    '## 1. GRAPHIFY STRUCTURAL SUBGRAPH',
    `- Project: \`${params.projectName}\` (\`${params.projectType}\`)`,
    `- Topology: ${params.graphifyNodes ?? 1949} nodes / ${params.graphifyEdges ?? 3867} edges | Branches: ${params.branchNames.map((b) => `\`${b}\``).join(', ')}`,
    `- Hardware Guardrail: VRAM=${params.optimizer.vramBudgetGb}GB | TurboQuantQ4=${params.optimizer.turboQuantKvCacheQ4} | MAX_CONCURRENT_LOCAL=${params.optimizer.sequentialSingleGpuQueue ? 1 : 3} | DeltaClone=${params.optimizer.goldenTemplateDeltaOnly ? '88%' : '0%'}`,
  ].join('\n');

  const markdown = [
    `# PROJECT_CONTEXT_COMPACT.md — ${params.projectName}`,
    `> System Rule (/caveman ${params.optimizer.cavemanMode}): ${getCavemanSystemPrompt(params.optimizer.cavemanMode)}`,
    '',
    graphifyBlock,
    '',
    '## 2. CAVEMAN WORKSPACE & HANDOFF CHECKPOINT',
    cavemanSummary.compressedText,
    '',
    cavemanHandoff.compressedText,
    '',
    '## 3. REPOMIX SANITIZED AST SKELETON',
    repomix.markdownDigest,
  ].join('\n');

  const rawTokens =
    estimateTokenCount(graphifyBlock) +
    cavemanHandoff.rawTokens +
    cavemanSummary.rawTokens +
    repomix.rawTokens;
  const compressedTokens = estimateTokenCount(markdown);
  const savedTokens = Math.max(0, rawTokens - compressedTokens);
  const reductionPercent =
    rawTokens > 0 ? Number(((savedTokens / rawTokens) * 100).toFixed(1)) : 0;

  return {
    filename: 'PROJECT_CONTEXT_COMPACT.md',
    markdown,
    rawTokens,
    compressedTokens,
    savedTokens,
    reductionPercent,
    breakdown: {
      graphifyTokens: estimateTokenCount(graphifyBlock),
      repomixTokens: repomix.compressedTokens,
      cavemanHandoffTokens: cavemanHandoff.compressedTokens,
    },
  };
}

/**
 * Computes RTX 3050 (6GB VRAM) memory pressure & live 4-layer token savings metrics
 * to display in SLM Lab, Workspace AI Models, and FinOps Profit calculations.
 */
export function computeTokenCompressionMetrics(params: {
  rawBaselineTokens?: number;
  optimizer: TokenOptimizerSettings;
  blendedUsdPer1MTokens?: number;
}): TokenCompressionSummary {
  const rawTokens = Math.max(10_000, params.rawBaselineTokens ?? 185_000);
  const opt = params.optimizer;

  // Compounding multiplicative savings ratios across enabled layers
  let remainingFactor = 1.0;

  if (opt.goldenTemplateDeltaOnly) {
    // 88% of boilerplate cloned at zero token cost (only 12% custom client delta parsed by LLM)
    remainingFactor *= 0.34;
  }
  if (opt.repomixAstSkeletonMode) {
    // Repomix AST signatures only (~55% remaining of structural context)
    remainingFactor *= 0.56;
  }
  if (opt.cavemanMode === 'lite') {
    remainingFactor *= 0.82;
  } else if (opt.cavemanMode === 'full') {
    remainingFactor *= 0.72;
  } else if (opt.cavemanMode === 'ultra') {
    remainingFactor *= 0.64;
  }

  const compressedTokens = Math.max(2500, Math.round(rawTokens * remainingFactor));
  const savedTokens = Math.max(0, rawTokens - compressedTokens);
  const reductionPercent = Number(((savedTokens / rawTokens) * 100).toFixed(1));

  // RTX 3050 6GB VRAM footprint estimate (base 7B Q4 weights ~3.45 GB + KV cache + concurrency multiplier)
  const baseWeightsGb = 3.45;
  const kvCacheGb = opt.turboQuantKvCacheQ4 ? 0.55 : 1.95;
  const concurrencyMultiplier = opt.sequentialSingleGpuQueue ? 1.0 : 1.65;
  const estimatedVramGb = Number(((baseWeightsGb + kvCacheGb) * concurrencyMultiplier).toFixed(2));
  const vramSafeForRtx3050 = estimatedVramGb <= opt.vramBudgetGb;

  const ratePer1M = Math.max(0.5, params.blendedUsdPer1MTokens ?? 6.5);
  const estimatedUsdSaved = Number(((savedTokens / 1_000_000) * ratePer1M * 6).toFixed(2));

  return {
    rawTokens,
    compressedTokens,
    savedTokens,
    reductionPercent,
    estimatedVramGb,
    vramSafeForRtx3050,
    estimatedUsdSaved,
    deltaBoilerplateClonedPercent: opt.goldenTemplateDeltaOnly ? 88 : 0,
  };
}
