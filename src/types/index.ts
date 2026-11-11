export type ThemeMode = 'dark' | 'light' | 'system';
export type ColorPalette = 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose';
export type Theme = 'dark' | 'light' | 'system' | 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'midnight-cyber' | 'emerald-matrix' | 'sunset-amber' | 'nordic-frost';

export type TabId = 
  | 'dashboard'
  | 'clients'
  | 'projects'
  | 'project-canvas'
  | 'slm-lab'
  | 'deployments'
  | 'templates'
  | 'connected-apps'
  | 'analytics'
  | 'team'
  | 'ams'
  | 'remote-telemetry'
  | 'services'
  | 'workflows'
  | 'alerts'
  | 'settings'
  | 'system-design'
  | 'agent-company'
  | 'billing'
  | 'fde-systems'
  | 'marketing-engine'
  | 'telemetry-hub'
  | 'integrations'
  | 'n8n-workflows'
  | 'project-builder'
  | 'nocode-editor'
  | 'preview-studio';

// Stack Presets & Configuration
export interface TechStackPreset {
  id: string;
  name: string;
  category: 'Full-Stack' | 'Mobile & Web' | 'Enterprise Event-Driven' | 'Microservices & AI' | 'Lightweight Edge';
  frontend: string;
  backend: string;
  database: string;
  streamingOrQueue?: string; // e.g. Kafka, RabbitMQ, Redis PubSub
  devops: string; // Docker, Kubernetes, Vercel
  isPreset: boolean;
  tags: string[];
}

// Connected App / Plugin for Launch Up
export interface ConnectedAppPlugin {
  id: string;
  name: string;
  category: 'Automation' | 'AI / SLM' | 'DevOps & Git' | 'Marketing' | 'Messaging' | 'Database' | 'Payment';
  icon: string;
  installed: boolean;
  version: string;
  description: string;
  author: string;
  rating: number;
  apiEndpointsConfigured: number;
}

// Client Requirement Intake (via public link or manual entry)
export interface ClientRequirementIntake {
  id: string;
  clientId?: string;
  clientName: string;
  companyName: string;
  contactEmail: string;
  contactPhone?: string;
  projectTitle: string;
  productTypes: Array<'Landing Page' | 'Full Website (4-5+ pages)' | 'SaaS Platform' | 'Android App' | 'Dual Android Apps' | 'Custom SLM' | 'Automation Flow (n8n)' | 'Digital / Social Marketing'>;
  servicesNeeded: Array<'WhatsApp Automation' | 'Email Handling & Analysis' | 'Order Management SLM' | 'Payment & Stripe Webhooks' | 'Autonomous Telemetry' | 'External API Integrations' | 'n8n Workflow Hub'>;
  budgetEstimated?: string;
  deadline?: string;
  summary: string;
  detailedRequirements: string;
  status: 'Draft' | 'Submitted via Web Link' | 'Under Review' | 'Converted to Project' | 'Archived';
  submittedAt: string;
  apiWiringEndpoint: string;
  databaseWiringKey: string;
}

// Workflow Trigger & Automation (n8n, webhook, event)
export interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: 'Webhook' | 'New Client Intake' | 'Git Push' | 'Agent Event' | 'Incident Alert' | 'Cron Schedule';
  status: 'Active' | 'Paused' | 'Error';
  integrationsInvolved: string[]; // ['n8n', 'WhatsApp', 'Stripe', 'Slack']
  executionsCount: number;
  successRate: number; // e.g. 99.8
  lastExecuted: string;
}

// Company of Agents Types
export type AgentRole = 
  | 'Chief Orchestrator' 
  | 'FDE Architect' 
  | 'SLM Model Trainer' 
  | 'Marketing Automation Lead' 
  | 'Telemetry Sentinel' 
  | 'Full-Stack Coder'
  | 'DevOps Dispatcher';

export type AgentStatus = 'Idle' | 'Executing' | 'Training' | 'Streaming Logs' | 'Standby';

export interface AutonomousAgent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  avatar: string;
  model: string; // e.g. "Gemini 2.5 Flash", "Llama-3.2-3B Local", "DeepSeek-R1-Distill", "Phi-3.5-mini Local"
  isLocal: boolean;
  activeTask?: string;
  tasksCompleted: number;
  tokensProcessed: number;
  latencyMs: number;
  accuracyScore: number; // e.g. 99.4%
  capabilities: string[];
}

export interface BusinessAutomationIntake {
  id: string;
  businessName: string;
  industry: string;
  targetAudience: string;
  currentBottlenecks: string[];
  desiredAutomations: string[]; // e.g., ["Lead Scoring", "Auto Invoicing", "Support SLM Agent", "SEO Campaigns"]
  fdeArchitecture: 'Event-Driven Microservices' | 'Realtime WebSocket Mesh' | 'CQRS + TimescaleDB' | 'Serverless Edge Cluster' | 'Zero-Trust Secure Enclave';
  slmChoice: string;
  slmDeployment: 'Local Edge Device' | 'Private GPU Cloud' | 'Hybrid Edge-Cloud';
  marketingChannels: string[];
  autoUpdatePolicy: 'Continuous Auto-Deploy' | 'Canary Auto-Shift' | 'Approval Required';
  status: 'Draft' | 'Synthesizing' | 'Deployed' | 'Optimizing';
  createdAt: string;
}

// SLM (Small Language Model) Studio Types
export type SLMQuantization = 'FP16' | 'Q8_0' | 'Q4_K_M' | 'GGUF-Q4' | 'AWQ 4-bit';

export interface SLMModel {
  id: string;
  name: string;
  baseArchitecture: string; // e.g. "Phi-3.5-mini (3.8B)", "Llama-3.2 (3B)", "Qwen2.5-Coder (1.5B)", "Gemma-2 (2B)"
  parameterSize: string; // "3.8B", "1.5B", "3B"
  contextLength: number; // 32k, 128k
  domainSpecialization: 'B2B Customer Support' | 'Enterprise Code & FDE' | 'Marketing Copywriter' | 'Telemetry Log Parser' | 'Finance & Invoicing';
  trainingLoss: number;
  quantization: SLMQuantization;
  isLocal: boolean;
  status: 'Ready' | 'Training' | 'Fine-Tuning' | 'Benchmarking' | 'Exported';
  tokensPerSec: number; // e.g. 142 tokens/sec
  deviceTarget: 'Local WebGPU / ONNX' | 'Local Ollama / vLLM' | 'Edge TPU' | 'Private Cloud H100';
  lastEvaluated: string;
  evalScores: {
    accuracy: number;
    hallucinationRate: number;
    latencyMs: number;
    throughputTps: number;
  };
}

// Marketing Automation Types
export interface MarketingCampaign {
  id: string;
  title: string;
  businessName: string;
  channel: 'Google Ads' | 'Meta Dynamic' | 'LinkedIn B2B' | 'Automated SEO Blog' | 'Cold Email Sequence' | 'TikTok / Shorts Automation';
  status: 'Running' | 'Optimizing' | 'Scheduled' | 'Paused';
  budgetMonthly: number;
  roas: number; // e.g. 4.6x
  leadsGenerated: number;
  conversionRate: number; // e.g. 8.4%
  aiAgentManager: string;
  creativeAssetCount: number;
  lastAutonomousOptimization: string;
  generatedHeadlines: string[];
}

// Remote Telemetry & Auto-Update Engine Types
export interface RemoteTelemetryPackage {
  id: string;
  clientName: string;
  packageName: string;
  installedVersion: string;
  latestVersionAvailable: string;
  autoUpdateStatus: 'In Sync' | 'Update Pending' | 'Deploying Update' | 'Rolled Back';
  lastLogTimestamp: string;
  errorRateLastHour: number;
  p99LatencyMs: number;
  activeUsers: number;
  recentLogs: {
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'METRIC';
    message: string;
    source: string;
    autoTriggeredAction?: string;
  }[];
}

// FDE (Forward Deployed Engineering) Systems
export interface FDESystemArchitecture {
  id: string;
  name: string;
  clientName: string;
  pattern: 'Event Sourcing + CQRS' | 'Realtime WebSocket Engine' | 'Zero-Trust Secure Enclave' | 'Edge Streaming Mesh';
  dbTechnology: string;
  frontendStack: string;
  backendRuntime: string;
  throughputRps: number;
  uptimeSla: string;
  status: 'Operational' | 'Auto-Scaling' | 'Under Maintenance';
  activePipelines: number;
  lastArchitectureAudit: string;
}

export type ClientStatus = 'Active' | 'Onboarding' | 'Pending' | 'Inactive';
export type ClientTier = 'Enterprise B2B' | 'Growth B2B' | 'Startup B2C' | 'Agency';

export interface Client {
  id: string;
  name: string;
  domain: string;
  initials: string;
  email: string;
  phone?: string;
  tier: ClientTier;
  status: ClientStatus;
  joinedDate: string;
  totalSpend: number;
  monthlySubscription: number;
  primaryContact: {
    name: string;
    role: string;
    email: string;
  };
  notes?: string;
  // Many-to-many relationship
  projectIds: string[];
}

export type ProjectStatus = 'Live' | 'In Progress' | 'Pending' | 'On Hold';
export type ProjectType = 'Marketing Website' | 'CRM Platform' | 'Landing Page' | 'E-commerce Site' | 'Mobile App API' | 'SaaS Platform';

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  deployedDate?: string;
  healthPercent: number; // e.g. 100, 99.8
  liveUrl?: string;
  repoUrl: string;
  branch: string;
  framework: string;
  stackPresetId?: string;
  serverTarget: 'Vercel' | 'AWS ECS' | 'Cloud Run' | 'DigitalOcean VPS';
  lastBackupDate: string;
  backupStatus: 'Healthy' | 'Syncing' | 'Warning';
  // Many-to-many: linked clients
  clientIds: string[];
  totalVisitors?: number;
  monthlyRevenue?: number;
  description?: string;
  // Extended SDLC & Agent fields
  requirementDocLink?: string;
  appDesignUrl?: string;
  dataStructureModel?: string; // e.g. 'PostgreSQL 16 Multi-Tenant + Redis'
  assignedAgents?: string[]; // IDs or names of assigned autonomous agents
  templatesUsed?: string;
  connectedServices?: string[]; // ['WhatsApp API', 'Email SLM', 'Stripe Invoicing', 'n8n']
  integrationsActive?: string[]; // ['GitHub', 'AWS ECS', 'Docker Hub', 'Cloudflare']
  deploymentStatus?: 'Provisioned' | 'Building Docker' | 'Canary Rollout' | 'Healthy Live' | 'Auto-Patched';
  sandboxSynced?: boolean;
  sandboxSyncTimestamp?: string;
  // External Project Pull & Golden Template Adapter metadata
  sourceTool?: ExternalBuilderTool;
  localFolderPath?: string;
  localDevPort?: number;
  previewUrl?: string;
  pulledManifest?: ProjectLaunchupManifest;
}

export type ExternalBuilderTool =
  | 'Claude Code'
  | 'ChatGPT Codex'
  | 'Cursor'
  | 'Launch Up Template';

export interface ProjectLaunchupRuntimeAndDeploy {
  dockerfile: string;
  composeFile: string;
  buildCommand: string;
  startCommand: string;
  localDevPort: number;
  previewUrl: string;
  gitBranches: string[];
}

export interface ProjectLaunchupManifest {
  schemaVersion: string;
  projectId: string;
  name: string;
  description: string;
  sourceTool: ExternalBuilderTool;
  projectType: ProjectType;
  framework: string;
  folderPath: string;
  clientId?: string;
  bootstrapped: boolean;
  createdAt: string;
  runtimeAndDeploy: ProjectLaunchupRuntimeAndDeploy;
  layers: {
    coreLocked: string[];
    slotsMutable: string[];
    uiLayer: string[];
  };
  lockedFiles: string[];
  complianceFrameworks: GovernanceFrameworkKey[];
  graphify: {
    reportPath: string;
    nodesCount: number;
    edgesCount: number;
    entryNodes: string[];
  };
}

export interface GoldenTemplateManifest {
  schemaVersion: string;
  id: string;
  name: string;
  version: string;
  category: Template['category'];
  description: string;
  stars: number;
  deployTime: string;
  previewImage: string;
  techStack: string[];
  deltaCloneRatio: number;
  folderPath?: string;
  layers: {
    coreLocked: {
      rootPath: string;
      zeroTokenCost: boolean;
      summary: string;
      files: string[];
    };
    slotsMutable: {
      rootPath: string;
      files: string[];
      sqlSlots: string[];
      apiSlots: string[];
    };
    uiLayer: {
      rootPath: string;
      tokensFile: string;
      components: string[];
    };
  };
  lockedFiles: string[];
  graphifyChain: {
    databaseSchemaRoot: string;
    apiRouterRoot: string;
    featureRegistryRoot: string;
  };
}

export interface DeploymentLog {
  id: string;
  projectId: string;
  projectName: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  timestamp: string;
  environment: 'Production' | 'Staging' | 'Preview';
  status: 'Success' | 'Failed' | 'In Progress' | 'Queued';
  durationSeconds: number;
  logs: string[];
}

export interface SystemAlert {
  id: string;
  title: string;
  description: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timeAgo: string;
  timestamp: string;
  read: boolean;
  relatedEntity?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  pricePerMonth: number;
  features: string[];
  clientCount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: string;
  issuedDate: string;
  planName: string;
}

export interface BackupRecord {
  id: string;
  projectId: string;
  projectName: string;
  type: 'Automated Daily' | 'Manual Snapshot' | 'Pre-Deploy Git Tag';
  storageTarget: 'GitHub Mirror + AWS S3' | 'Google Cloud Storage' | 'Encrypted Git Bundle';
  sizeBytes: string;
  timestamp: string;
  status: 'Completed' | 'In Progress' | 'Verified';
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'B2B SaaS' | 'E-commerce' | 'Marketing' | 'Client Portal' | 'API Backend';
  techStack: string[];
  stars: number;
  previewImage: string;
  deployTime: string;
}

export interface Integration {
  id: string;
  name: string;
  category: 'Version Control' | 'Cloud Provider' | 'Payment Gateway' | 'Analytics' | 'Notifications';
  icon: string;
  connected: boolean;
  configuredDate?: string;
  description: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Lead Architect' | 'DevOps Engineer' | 'Frontend Specialist' | 'Client Success';
  status: 'Active' | 'Invited';
  avatarInitials: string;
  projectsAssigned: number;
}

// ====================================================================
// SPRINT 1: PROJECT COMMAND CENTER & HIERARCHICAL AGENT SWARM TYPES
// ====================================================================
export type SwarmStageId =
  | 'ceo'
  | 'architect'
  | 'design'
  | 'coding'
  | 'testing'
  | 'integration'
  | 'uat';

export type SwarmStageStatus = 'pending' | 'running' | 'completed';

export interface ProjectSwarmStage {
  id: SwarmStageId;
  title: string;
  leadAgent: string;
  summary: string;
  status: SwarmStageStatus;
  progressPercent: number;
  completedAt?: string;
}

export interface ProjectSwarmLog {
  id: string;
  timestamp: string;
  stageId: SwarmStageId;
  agentName: string;
  modelUsed: string;
  message: string;
  level: 'info' | 'reasoning' | 'success' | 'warn';
  tokensUsed?: number;
}

export interface ProjectComplianceItem {
  id: string;
  label: string;
  checked: boolean;
}

export type GovernanceFrameworkKey = 'GDPR_EU' | 'DPDP_INDIA' | 'CCPA_US';

export interface ProjectBlueprints {
  prd: string;
  tdd: string;
  designTheme: string;
  compliance: Record<GovernanceFrameworkKey, ProjectComplianceItem[]>;
}

export interface ProjectSwarmAgentSlot {
  id: string;
  roleTitle: string;
  agentName: string;
  specialty: string;
  status: 'Idle' | 'Active' | 'Completed';
  activeQueue: number;
  tokenBudgetUsd: number;
  tokensSpentUsd: number;
  assignedBranch: string;
}

export interface ProjectModelRouting {
  fastReasoning: string;
  deepArchitecture: string;
  uiDesign: string;
  qaSecurity: string;
  localEdgeFallback: boolean;
  temperature: number;
}

export interface ProjectFinOpsExpense {
  id: string;
  category: 'Tooling' | 'API Quota' | 'Cloud Compute' | 'Domain & SSL' | 'Contractor' | 'Other';
  description: string;
  amountUsd: number;
  date: string;
}

// ====================================================================
// SPRINT 2: SMART REUSABILITY & CODE SANITIZER TYPES
// ====================================================================
export type SanitizationCategory = 'pii' | 'secret' | 'styling';

export interface SanitizationFinding {
  id: string;
  category: SanitizationCategory;
  ruleName: string;
  matchedPreview: string;
  replacement: string;
  line: number;
  severity: 'high' | 'medium' | 'low';
}

export interface SanitizationResult {
  sanitizedCode: string;
  removedItems: SanitizationFinding[];
  countsByCategory: Record<SanitizationCategory, number>;
  riskScoreBefore: number;
  riskScoreAfter: number;
  isSafe: boolean;
  scannedAt: string;
}

export type GoldenTemplateId =
  | 'golden-web-landing'
  | 'golden-mobile-android'
  | 'golden-backend-api';

export interface MatchedTemplateItem {
  templateId: string;
  templateName: string;
  sourceKind: 'golden-template' | 'sanitized-component';
  matchScore: number;
  matchedCapabilities: string[];
  reusableComponents: string[];
  estimatedTokensSaved: number;
  estimatedTokenSavingsUsd: number;
  sanitizedVerified: boolean;
}

export interface TemplateMatchResult {
  matches: MatchedTemplateItem[];
  totalReusabilityPercent: number;
  totalTokensSaved: number;
  totalEstimatedSavingsUsd: number;
  evaluatedAt: string;
}

export type Mod10BudgetTierFallback = 'NONE' | 'TIER_2' | 'TIER_3';

export interface Mod10FinOpsCheckSnapshot {
  authorized: boolean;
  principal_type: 'HUMAN' | 'AI_AGENT';
  effective_role: string;
  rls_session_token: string;
  remaining_budget_usd: number;
  budget_tier_fallback: Mod10BudgetTierFallback;
  gate_required: boolean;
  error_code?: 'ERR_BUDGET_EXCEEDED' | 'ERR_RBAC_DENIED' | 'ERR_TENANT_MISMATCH' | 'ERR_CIRCULAR_TENANCY';
  checkedAt: string;
  isLiveService: boolean;
}

export interface ProjectFinOpsState {
  clientContractValueUsd: number;
  llmTokenBudgetUsd: number;
  estimatedLlmSpendUsd: number;
  actualLlmSpendUsd: number;
  estimatedContainerHours?: number;
  containerHours: number;
  containerRatePerHourUsd: number;
  estimatedAgentComputeMinutes?: number;
  agentComputeMinutes: number;
  agentComputeRatePerMinUsd: number;
  manualExpenses: ProjectFinOpsExpense[];
  reusabilityPercent?: number;
  reusabilityTokenSavingsUsd?: number;
  tokenCompressionSavingsUsd?: number;
  tokenReductionPercent?: number;
  templateMatchResults?: TemplateMatchResult | null;
  lastSanitizationResult?: SanitizationResult | null;
  lastMod10Check?: Mod10FinOpsCheckSnapshot | null;
}

export type GitStageBranchName =
  | 'feature/dev'
  | 'feature/testing'
  | 'feature/uat'
  | 'feature/production';

export interface ProjectGitBranchNode {
  branch: GitStageBranchName;
  stageLabel: string;
  status: 'Active' | 'Ahead' | 'Synced' | 'Pending';
  lastCommitSha: string;
  lastCommitMsg: string;
  containerService: string;
  containerPort: number;
  dockerHealth: 'Healthy' | 'Building' | 'Standby';
  replicas: string;
}

export interface ProjectWorkspaceState {
  projectId: string;
  buildStatus: 'idle' | 'running' | 'completed';
  currentStageIndex: number;
  stages: ProjectSwarmStage[];
  logs: ProjectSwarmLog[];
  blueprints: ProjectBlueprints;
  swarmAgents: ProjectSwarmAgentSlot[];
  modelRouting: ProjectModelRouting;
  finops: ProjectFinOpsState;
  gitDocker: ProjectGitBranchNode[];
  lastUpdatedAt: string;
}

// ====================================================================
// UNIVERSAL CUSTOM AI & EXTERNAL API GATEWAY TYPES
// ====================================================================
export type CustomApiProviderType =
  | 'openrouter'
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'groq'
  | 'ollama'
  | 'ik_llama_cpp'
  | 'airllm'
  | 'lmstudio'
  | 'custom';

export type ApiConnectionStatus = 'UNVERIFIED' | 'CONNECTED' | 'FAILED';

export type SwarmAgentRoleKey =
  | 'ceo'
  | 'architect'
  | 'design'
  | 'coding'
  | 'testing'
  | 'integration';

export interface CustomApiProviderConfig {
  id: string;
  name: string;
  provider: CustomApiProviderType;
  baseUrl: string;
  apiKey: string;
  defaultModelId: string;
  costPer1MInputUsd: number;
  costPer1MOutputUsd: number;
  customHeaders?: Record<string, string>;
  status: ApiConnectionStatus;
  latencyMs?: number;
  verifiedModel?: string;
  discoveredModels?: string[];
  lastTestedAt?: string;
  lastMessage?: string;
  errorCode?: 'ERR_API_AUTH_FAILED' | 'ERR_API_UNREACHABLE';
  enabled: boolean;
  createdAt: string;
}

export type AgentModelAssignments = Record<SwarmAgentRoleKey, string>;

// ====================================================================
// RTX 3050 (6GB VRAM) OPTIMIZER & 4-LAYER TOKEN COMPRESSION TYPES
// ====================================================================
export type CavemanAgentMode = 'off' | 'lite' | 'full' | 'ultra';

export interface TokenOptimizerSettings {
  turboQuantKvCacheQ4: boolean;
  sequentialSingleGpuQueue: boolean;
  cavemanMode: CavemanAgentMode;
  repomixAstSkeletonMode: boolean;
  goldenTemplateDeltaOnly: boolean;
  vramBudgetGb: number;
}
