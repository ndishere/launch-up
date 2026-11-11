import type {
  AgentModelAssignments,
  CustomApiProviderConfig,
  CustomApiProviderType,
  SwarmAgentRoleKey,
} from '../types';

export interface ApiProviderPreset {
  provider: CustomApiProviderType;
  label: string;
  baseUrl: string;
  defaultModelId: string;
  suggestedModels: string[];
  defaultInputCostPer1M: number;
  defaultOutputCostPer1M: number;
  requiresApiKey: boolean;
  keyPlaceholder: string;
  description: string;
}

export const API_PROVIDER_PRESETS: Record<CustomApiProviderType, ApiProviderPreset> = {
  openrouter: {
    provider: 'openrouter',
    label: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModelId: 'anthropic/claude-3.7-sonnet',
    suggestedModels: [
      'anthropic/claude-3.7-sonnet',
      'openai/gpt-4o',
      'google/gemini-2.5-pro',
      'deepseek/deepseek-r1',
    ],
    defaultInputCostPer1M: 3.0,
    defaultOutputCostPer1M: 15.0,
    requiresApiKey: true,
    keyPlaceholder: 'sk-or-v1-... (or sk-test-openrouter for sandbox)',
    description: 'Unified multi-model gateway with OpenAI-compatible routing & automatic failover.',
  },
  openai: {
    provider: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModelId: 'gpt-4o',
    suggestedModels: ['gpt-4o', 'gpt-4.1', 'gpt-4.1-mini', 'o3-mini'],
    defaultInputCostPer1M: 2.5,
    defaultOutputCostPer1M: 10.0,
    requiresApiKey: true,
    keyPlaceholder: 'Bearer secret key (or sk-test-openai for sandbox)',
    description: 'Official OpenAI endpoint for GPT-4o, GPT-4.1, and reasoning models.',
  },
  anthropic: {
    provider: 'anthropic',
    label: 'Anthropic Claude',
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModelId: 'claude-3-7-sonnet-20250219',
    suggestedModels: [
      'claude-3-7-sonnet-20250219',
      'claude-3-5-haiku-20241022',
      'claude-sonnet-4-20250514',
    ],
    defaultInputCostPer1M: 3.0,
    defaultOutputCostPer1M: 15.0,
    requiresApiKey: true,
    keyPlaceholder: 'x-api-key header secret (or sk-test-claude for sandbox)',
    description: 'Anthropic Messages API using x-api-key authentication for Claude Sonnet & Haiku.',
  },
  gemini: {
    provider: 'gemini',
    label: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModelId: 'gemini-2.5-pro',
    suggestedModels: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash-lite'],
    defaultInputCostPer1M: 1.25,
    defaultOutputCostPer1M: 5.0,
    requiresApiKey: true,
    keyPlaceholder: 'Gemini API Key (or sk-test-gemini for sandbox)',
    description: 'Google AI Studio / Gemini Developer API supporting 1M+ context & Flash triage.',
  },
  groq: {
    provider: 'groq',
    label: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModelId: 'llama-3.3-70b-versatile',
    suggestedModels: [
      'llama-3.3-70b-versatile',
      'deepseek-r1-distill-llama-70b',
      'mixtral-8x7b-32768',
    ],
    defaultInputCostPer1M: 0.59,
    defaultOutputCostPer1M: 0.79,
    requiresApiKey: true,
    keyPlaceholder: 'Groq Cloud Key (or sk-test-groq for sandbox)',
    description: 'Ultra-low-latency LPU inference engine for rapid triage & swarm orchestration.',
  },
  ollama: {
    provider: 'ollama',
    label: 'Local Ollama / vLLM',
    baseUrl: 'http://localhost:11434/v1',
    defaultModelId: 'qwen2.5-coder:14b',
    suggestedModels: ['qwen2.5-coder:14b', 'phi3.5:3.8b', 'llama3.2:latest', 'deepseek-r1:8b'],
    defaultInputCostPer1M: 0.0,
    defaultOutputCostPer1M: 0.0,
    requiresApiKey: false,
    keyPlaceholder: 'Optional local bearer token (leave blank for Ollama)',
    description: 'Zero-token-cost on-premise / edge inference server via localhost OpenAI API.',
  },
  custom: {
    provider: 'custom',
    label: 'Custom OpenAI-Compatible Endpoint',
    baseUrl: 'https://api.example.com/v1',
    defaultModelId: 'deepseek-chat',
    suggestedModels: ['deepseek-chat', 'deepseek-reasoner', 'custom/internal-coder'],
    defaultInputCostPer1M: 0.27,
    defaultOutputCostPer1M: 1.1,
    requiresApiKey: false,
    keyPlaceholder: 'Optional API key (or sk-test-custom for sandbox)',
    description: 'Any DeepSeek, Together, Fireworks, Azure, LiteLLM, or private VPC gateway.',
  },
};

export const SWARM_AGENT_ROLE_METADATA: Array<{
  roleKey: SwarmAgentRoleKey;
  label: string;
  agentName: string;
  description: string;
}> = [
  {
    roleKey: 'ceo',
    label: 'CEO Orchestrator',
    agentName: 'Aegis CEO Orchestrator',
    description: 'Commercial scope breakdown, M:N SLA validation & MOD-10 FinOps guardrails.',
  },
  {
    roleKey: 'architect',
    label: 'Tech Architect',
    agentName: 'Vulcan Systems Architect',
    description: 'PostgreSQL 16 RLS schemas, OpenAPI 3.1 contracts & Graphify boundaries.',
  },
  {
    roleKey: 'design',
    label: 'UI/UX Design Agent',
    agentName: 'Iris Design & Token Agent',
    description: 'Adaptive Light/Dark palette tokens, FigCraft trees & compliance banners.',
  },
  {
    roleKey: 'coding',
    label: 'Parallel Coding Agents',
    agentName: 'Orion + Nova Coder Swarm',
    description: 'Concurrent React Web, Kotlin Android, and Fastify backend implementation.',
  },
  {
    roleKey: 'testing',
    label: 'QA & Testing Agent',
    agentName: 'Sentinel QA & SecOps Agent',
    description: 'Unit tests, API contracts, Semgrep SAST, Trivy CVE & viewport verification.',
  },
  {
    roleKey: 'integration',
    label: 'Tech Manager Agent',
    agentName: 'Atlas Integration Lead',
    description: 'Git branch promotion, Docker Compose staging builds & merge resolution.',
  },
];

export function maskApiKey(apiKey: string): string {
  const trimmed = (apiKey || '').trim();
  if (!trimmed) return 'No Key Configured';
  if (trimmed.length <= 8) return `${trimmed.slice(0, 2)}••••${trimmed.slice(-2)}`;
  return `${trimmed.slice(0, 6)}••••${trimmed.slice(-4)}`;
}

export function getDefaultCustomApiProviders(): CustomApiProviderConfig[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'api-openrouter-primary',
      name: 'OpenRouter Enterprise Gateway',
      provider: 'openrouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: 'sk-test-openrouter-enterprise',
      defaultModelId: 'anthropic/claude-3.7-sonnet',
      costPer1MInputUsd: 3.0,
      costPer1MOutputUsd: 15.0,
      status: 'CONNECTED',
      latencyMs: 138,
      verifiedModel: 'anthropic/claude-3.7-sonnet',
      lastTestedAt: now,
      lastMessage: 'Handshake verified (HTTP 200 OK)',
      enabled: true,
      createdAt: now,
    },
    {
      id: 'api-gemini-flash',
      name: 'Google Gemini Studio',
      provider: 'gemini',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      apiKey: 'sk-test-gemini-studio',
      defaultModelId: 'gemini-2.5-pro',
      costPer1MInputUsd: 1.25,
      costPer1MOutputUsd: 5.0,
      status: 'CONNECTED',
      latencyMs: 96,
      verifiedModel: 'gemini-2.5-pro',
      lastTestedAt: now,
      lastMessage: 'Handshake verified (HTTP 200 OK)',
      enabled: true,
      createdAt: now,
    },
    {
      id: 'api-ollama-edge',
      name: 'Local Ollama Edge SLM',
      provider: 'ollama',
      baseUrl: 'http://localhost:11434/v1',
      apiKey: '',
      defaultModelId: 'qwen2.5-coder:14b',
      costPer1MInputUsd: 0.0,
      costPer1MOutputUsd: 0.0,
      status: 'UNVERIFIED',
      lastMessage: 'Click Test to Verify local runtime',
      enabled: true,
      createdAt: now,
    },
  ];
}

export function getDefaultAgentModelAssignments(): AgentModelAssignments {
  return {
    ceo: 'api-gemini-flash',
    architect: 'api-openrouter-primary',
    design: 'api-gemini-flash',
    coding: 'api-openrouter-primary',
    testing: 'api-ollama-edge',
    integration: 'api-openrouter-primary',
  };
}

export function parseCustomHeadersJson(rawJson: string): {
  headers?: Record<string, string>;
  error?: string;
} {
  const trimmed = rawJson.trim();
  if (!trimmed) return { headers: undefined };
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { error: 'Custom headers must be a JSON object of string key/value pairs.' };
    }
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      headers[String(k)] = String(v);
    }
    return { headers };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? `Invalid JSON headers: ${err.message}` : 'Invalid JSON headers.',
    };
  }
}

export function formatPreFlightGatewayLog(
  providerConfig: CustomApiProviderConfig,
  status: 'CONNECTED' | 'FAILED',
  latencyMs: number,
  verifiedModel?: string,
  failureMessage?: string
): string {
  const providerLabel = API_PROVIDER_PRESETS[providerConfig.provider]?.label ?? providerConfig.name;
  const modelLabel = verifiedModel || providerConfig.defaultModelId;
  if (status === 'CONNECTED') {
    return `[Gateway] Verified ${providerLabel} / ${modelLabel} connection (${latencyMs}ms)`;
  }
  return `[Gateway] Warning: ${providerLabel} / ${modelLabel} check failed (${failureMessage || 'Unreachable'}) — keeping fallback route ready`;
}

export function calculateBlendedCostPer1MTokens(
  providers: CustomApiProviderConfig[],
  assignments: AgentModelAssignments
): number {
  const assignedIds = Object.values(assignments).filter(Boolean);
  if (assignedIds.length === 0) return 0;
  let totalBlended = 0;
  let matchedCount = 0;
  for (const id of assignedIds) {
    const found = providers.find((p) => p.id === id);
    if (found) {
      // Blended assuming ~70% input, ~30% output ratio
      totalBlended += found.costPer1MInputUsd * 0.7 + found.costPer1MOutputUsd * 0.3;
      matchedCount += 1;
    }
  }
  return matchedCount > 0 ? Number((totalBlended / matchedCount).toFixed(2)) : 0;
}
