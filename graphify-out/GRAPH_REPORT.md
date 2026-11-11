# Graph Report - launch-up  (2026-11-11)

## Corpus Check
- 177 files · ~130,290 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 18 file(s) not represented in the graph (top: (none) 13, .example 1, .lock 1)

## Summary
- 1819 nodes · 3345 edges · 95 communities (89 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bbb79e17`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AppContext.tsx
- environment
- ba-intake-service/src/lib/engine.ts
- package.json
- auth-service/package.json
- client-service/package.json
- project-service/package.json
- mobile-app-service/package.json
- 3. Functional Requirements (FR)
- ba-intake-service/package.json
- Launch Up — Comprehensive Technology Stack & Curriculum Guide
- auth-service/src/models/schema.ts
- compilerOptions
- compilerOptions
- client-service/src/routes/index.ts
- compilerOptions
- compilerOptions
- Launch Up — System Design Document (SDD)
- Launch Up — UI/UX Wireframes & Page Layout Specifications
- lead-pitch-service/package.json
- interval
- compilerOptions
- governance-service/package.json
- web-builder-service/package.json
- networks
- environment
- agency-full-lifecycle.system.test.ts
- services
- mod10.unit.test.ts
- LAUNCH UP — MASTER ARCHITECTURE, GLOBAL COMPLIANCE & BUSINESS ANALYST SUITE
- 1. Module-by-Module Positive, Negative & Rare Test Cases
- governance-service/src/routes/index.ts
- mobile-app-service/src/lib/engine.ts
- LAUNCH UP — SETUP GUIDE & EXACT STARTER PROMPT FOR CODING AI MODELS
- Run and deploy your AI Studio app
- compilerOptions
- project-service/src/db.ts
- compilerOptions
- web-admin
- governance-service
- qa-secops-service/package.json
- compilerOptions
- sre-healing-service/src/lib/engine.ts
- auth-service
- qa-secops-service/src/lib/engine.ts
- backend-api-service/package.json
- backend-api-service/src/lib/engine.ts
- compilerOptions
- sre-healing-service/package.json
- compilerOptions
- governance-service/src/middleware/authenticate.ts
- compilerOptions
- marketing-engine-service/package.json
- web-builder-service/src/lib/engine.ts
- lead-pitch-service/src/lib/engine.ts
- sre-healing-service
- compilerOptions
- mobile-app-service
- whatsapp-service
- dependencies
- compilerOptions
- context
- dev-orchestrator.ts
- App.tsx
- whatsapp-service/src/lib/engine.ts
- api.ts
- whatsapp-service/package.json
- compilerOptions
- DashboardTab.tsx
- marketing-engine-service
- NoCodeEditorTab.tsx
- web-builder-service
- vite.config.ts
- scripts
- minio
- marketing-engine-service/src/lib/engine.ts
- ambient.d.ts
- postgres
- AppProvider
- LAUNCH UP — UNIVERSAL AI MODEL CHECKPOINT & HANDOFF STATE
- gateway
- redis
- verify-mesh-health.ts
- Sidebar.tsx
- governance-service
- lead-pitch-service
- qa-secops-service
- agency-concurrency.perf.test.ts
- GovernanceMesh
- 2. Module-by-Module JSON Input/Output Contracts
- express@^4.21.2
- @fastify/helmet@^13.2.0
- pino-pretty@^13.2.0
- zod@^4.6.7

## God Nodes (most connected - your core abstractions)
1. `useApp()` - 71 edges
2. `react` - 43 edges
3. `lucide-react` - 38 edges
4. `AppLayout()` - 36 edges
5. `AppContextType` - 27 edges
6. `services` - 20 edges
7. `interval` - 18 edges
8. `retries` - 18 edges
9. `test` - 18 edges
10. `timeout` - 18 edges

## Surprising Connections (you probably didn't know these)
- `TypeScript 5.x` --references--> `Client`  [INFERRED]
  TECH_STACK.md → src/types/index.ts
- `TypeScript 5.x` --references--> `DeploymentLog`  [INFERRED]
  TECH_STACK.md → src/types/index.ts
- `TypeScript 5.x` --references--> `Project`  [INFERRED]
  TECH_STACK.md → src/types/index.ts
- `TypeScript 5.x` --references--> `SystemAlert`  [INFERRED]
  TECH_STACK.md → src/types/index.ts
- ``MOD-02`: BA Intake & Scope Synthesizer` --references--> `Mod02IntakeRequest`  [INFERRED]
  contracts/module_input_output_contracts.md → services/ba-intake-service/src/types/index.ts

## Import Cycles
- None detected.

## Communities (95 total, 6 thin omitted)

### Community 0 - "AppContext.tsx"
Cohesion: 0.08
Nodes (58): AppContext, AppContextType, DEFAULT_FIGCRAFT_PROJECT, DEFAULT_STUDIO_COMPLIANCE, N8nProjectGraph, ProjectScopeDraft, initialAgents, initialAlerts (+50 more)

### Community 1 - "environment"
Cohesion: 0.22
Nodes (24): environment, environment, environment, environment, BCRYPT_ROUNDS, DATABASE_URL, JWT_REFRESH_SECRET, JWT_SECRET (+16 more)

### Community 2 - "ba-intake-service/src/lib/engine.ts"
Cohesion: 0.16
Nodes (22): `MOD-02`: BA Intake & Scope Synthesizer, detectSemanticConflicts(), generateOpenApiYaml(), generateSqlMigration(), processBaIntake(), resolveComplianceFlags(), synthesizePrd(), VALID_COUNTRIES (+14 more)

### Community 3 - "package.json"
Cohesion: 0.10
Nodes (27): devDependencies, autoprefixer@^10.4.21, esbuild@^0.25.0, tailwindcss@^4.3.3, tsx@^4.21.0, @types/express@^4.17.21, @types/jsonwebtoken@^9.0.10, @types/node@^22.20.5 (+19 more)

### Community 4 - "auth-service/package.json"
Cohesion: 0.05
Nodes (50): bcrypt, @fastify/rate-limit, @types/bcrypt, dependencies, bcrypt@^5.1.1, drizzle-orm@^0.39.0, fastify@^5.2.0, @fastify/cors@^11.0.0 (+42 more)

### Community 5 - "client-service/package.json"
Cohesion: 0.06
Nodes (41): dependencies, drizzle-orm@^0.39.0, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, jsonwebtoken@^9.0.2, pg@^8.13.0, zod@^3.24.0 (+33 more)

### Community 6 - "project-service/package.json"
Cohesion: 0.07
Nodes (36): dependencies, drizzle-orm@^0.39.0, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, jsonwebtoken@^9.0.2, pg@^8.13.0, zod@^3.24.0 (+28 more)

### Community 7 - "mobile-app-service/package.json"
Cohesion: 0.08
Nodes (31): dependencies, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, pino@^9.5.0, zod@^3.24.0, description, devDependencies (+23 more)

### Community 8 - "3. Functional Requirements (FR)"
Cohesion: 0.10
Nodes (20): 1.1 Problem Statement, 1.2 Product Vision & Objective, 1. Executive Summary & Business Objectives, 2.1 Personas, 2.2 Access Control Matrix, 2. User Personas & Permissions Matrix (RBAC), 3. Functional Requirements (FR), 4. Non-Functional Requirements (NFR) (+12 more)

### Community 9 - "ba-intake-service/package.json"
Cohesion: 0.08
Nodes (31): dependencies, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, pino@^9.5.0, zod@^3.24.0, description, devDependencies (+23 more)

### Community 10 - "Launch Up — Comprehensive Technology Stack & Curriculum Guide"
Cohesion: 0.11
Nodes (18): 1. Frontend Core & Reactive Architecture, 2. Type System & Software Correctness, 3. Styling, Design Systems & Theming, 4. Data Visualization & Charting, 5. Database Architecture & Systems Engineering, 6. DevOps, Infrastructure & CI/CD Pipelines, 7. Security, Cryptography & Compliance, 8. Build Tools & Runtime Environment (+10 more)

### Community 11 - "auth-service/src/models/schema.ts"
Cohesion: 0.08
Nodes (32): config, EnvConfig, envSchema, closeDb(), db, pool, authenticate(), fastify (+24 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution (+10 more)

### Community 13 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution (+10 more)

### Community 14 - "client-service/src/routes/index.ts"
Cohesion: 0.10
Nodes (25): config, EnvConfig, envSchema, closeDb(), db, pool, authenticate(), authorize() (+17 more)

### Community 15 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir (+9 more)

### Community 16 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+10 more)

### Community 17 - "Launch Up — System Design Document (SDD)"
Cohesion: 0.13
Nodes (14): 1. Architectural Blueprint & System Context, 2.1 Client Application Tier, 2.2 Deployment & Cloud Orchestration Engine, 2. High-Level Architecture Decomposition, 3.1 Relational Architecture Diagram, 3.2 Key Design Choices in DDL, 3. Database Design & Entity Relationship Diagram (ERD), 4.1 Envelope Encryption Pattern (AES-256-GCM) (+6 more)

### Community 18 - "Launch Up — UI/UX Wireframes & Page Layout Specifications"
Cohesion: 0.13
Nodes (14): 1. Global Shell & Navigation Framework, 2. Page Wireframe 1: Command Center / Dashboard Tab, 3. Page Wireframe 2: Projects Roster & Creation Modal, 4. Page Wireframe 3: Clients & Accounts Management, 5. Page Wireframe 4: Deployments & Streaming Terminal, 6. Page Wireframe 5: System Design & Documentation Hub, 7. Global Component Wireframe: Spotlight Command Palette (`Ctrl+K`), Launch Up — UI/UX Wireframes & Page Layout Specifications (+6 more)

### Community 19 - "lead-pitch-service/package.json"
Cohesion: 0.08
Nodes (31): dependencies, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, pino@^9.5.0, zod@^3.24.0, description, devDependencies (+23 more)

### Community 20 - "interval"
Cohesion: 0.29
Nodes (23): healthcheck, healthcheck, healthcheck, healthcheck, healthcheck, healthcheck, interval, retries (+15 more)

### Community 21 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowImportingTsExtensions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, noEmit (+7 more)

### Community 22 - "governance-service/package.json"
Cohesion: 0.06
Nodes (46): dependencies, drizzle-orm@^0.39.0, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, jsonwebtoken@^9.0.2, pg@^8.13.0, pino@^9.5.0 (+38 more)

### Community 23 - "web-builder-service/package.json"
Cohesion: 0.08
Nodes (31): dependencies, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, pino@^9.5.0, zod@^3.24.0, description, devDependencies (+23 more)

### Community 24 - "networks"
Cohesion: 0.18
Nodes (11): driver, name, driver, internal, name, driver, name, networks (+3 more)

### Community 25 - "environment"
Cohesion: 0.11
Nodes (19): ALLOW_PLAINTEXT_LISTENER, KAFKA_CFG_ADVERTISED_LISTENERS, KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE, KAFKA_CFG_CONTROLLER_LISTENER_NAMES, KAFKA_CFG_CONTROLLER_QUORUM_VOTERS, KAFKA_CFG_INTER_BROKER_LISTENER_NAME, KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP, KAFKA_CFG_LISTENERS (+11 more)

### Community 26 - "agency-full-lifecycle.system.test.ts"
Cohesion: 0.13
Nodes (14): GateState, Principal, createGovernanceHttpServer(), dbStore, signToken(), RFC-7519, verifyToken(), createPerfServer() (+6 more)

### Community 27 - "services"
Cohesion: 0.09
Nodes (22): container_name, networks, ports, restart, volumes, container_name, networks, ports (+14 more)

### Community 28 - "mod10.unit.test.ts"
Cohesion: 0.13
Nodes (13): ApprovalGateRecord, BudgetExceededError, CircularTenancyError, ClientProjectLinkRecord, MembershipRecord, PrincipalRecord, ProjectRecord, RbacDeniedError (+5 more)

### Community 29 - "LAUNCH UP — MASTER ARCHITECTURE, GLOBAL COMPLIANCE & BUSINESS ANALYST SUITE"
Cohesion: 0.25
Nodes (7): 1. Executive Vision & Multi-Tenant Business Architecture, 2. Token Reduction & Multi-Model Continuity via `Graphify`, 3. Curated Open-Source & Subscription Tool Stack, 4. Global Multi-Country Legal, Privacy & App Store Compliance Matrix, 5. Future Report Analysis Protocol (How You Work With Your Senior Architect & BA), LAUNCH UP — MASTER ARCHITECTURE, GLOBAL COMPLIANCE & BUSINESS ANALYST SUITE, Many-to-Many (M:N) Tenancy & Revenue Model

### Community 30 - "1. Module-by-Module Positive, Negative & Rare Test Cases"
Cohesion: 0.25
Nodes (7): 1. Module-by-Module Positive, Negative & Rare Test Cases, 2. The 5-Stage Post-Development Automated Testing Pipeline, LAUNCH UP — MASTER TEST-DRIVEN DEVELOPMENT (TDD) MATRIX & 5-STAGE PIPELINE, `MOD-01` & `MOD-02`: Lead Discovery, BA Intake & Legal Compliance Synthesizer, `MOD-03`, `MOD-04` & `MOD-05`: Responsive Web, Android App & Backend Factory, `MOD-06`, `MOD-07`, `MOD-08` & `MOD-09`: QA/SecOps, Canva, WhatsApp & SRE, `MOD-10`: M:N Tenancy, RBAC & FinOps Governance Core

### Community 31 - "governance-service/src/routes/index.ts"
Cohesion: 0.10
Nodes (26): `MOD-10`: M:N Tenancy, RBAC & FinOps Governance Core, detectCircularTenancy(), BudgetExceededError, CircularTenancyError, GATE_STAGES, Mod10AuthRequest, Mod10AuthResponse, RbacDeniedError (+18 more)

### Community 32 - "mobile-app-service/src/lib/engine.ts"
Cohesion: 0.15
Nodes (21): `MOD-04`: Android Mobile App Builder, checkPlayPolicyDataSafety(), DANGEROUS_PERMISSION_MAP, JAVA_KEYWORDS, processAndroidBuild(), VALID_GOLDEN_TEMPLATES, validatePackageName(), androidBuildRequestSchema (+13 more)

### Community 33 - "LAUNCH UP — SETUP GUIDE & EXACT STARTER PROMPT FOR CODING AI MODELS"
Cohesion: 0.50
Nodes (3): LAUNCH UP — SETUP GUIDE & EXACT STARTER PROMPT FOR CODING AI MODELS, Step 1: One-Time Folder & Graphify Setup on Your Machine, Step 2: Exact Copy-Paste Prompt for Any Coding AI Model

### Community 36 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution (+10 more)

### Community 37 - "project-service/src/db.ts"
Cohesion: 0.22
Nodes (4): config, envSchema, db, pool

### Community 38 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowImportingTsExtensions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, noEmit (+7 more)

### Community 39 - "web-admin"
Cohesion: 0.22
Nodes (9): VITE_API_BASE_URL, web-admin, container_name, depends_on, environment, networks, ports, restart (+1 more)

### Community 40 - "governance-service"
Cohesion: 0.11
Nodes (22): condition, depends_on, container_name, depends_on, networks, ports, restart, volumes (+14 more)

### Community 41 - "qa-secops-service/package.json"
Cohesion: 0.08
Nodes (31): dependencies, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, pino@^9.5.0, zod@^3.24.0, description, devDependencies (+23 more)

### Community 42 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowImportingTsExtensions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, noEmit (+7 more)

### Community 43 - "sre-healing-service/src/lib/engine.ts"
Cohesion: 0.17
Nodes (19): `MOD-09`: Autonomous SRE & Self-Healing Backend Operations, FORBIDDEN_FILE_PATTERNS, isExternalThirdPartyOutage(), processSREIncident(), resolveImpactedGraphifyNodes(), THIRD_PARTY_INDICATORS, sreRoutes(), buildApp() (+11 more)

### Community 44 - "auth-service"
Cohesion: 0.33
Nodes (6): container_name, networks, ports, restart, volumes, auth-service

### Community 45 - "qa-secops-service/src/lib/engine.ts"
Cohesion: 0.22
Nodes (16): `MOD-06`: Autonomous QA, SecOps & Compliance Verifier, processQAVerification(), runPlaywrightE2E(), runSecurityAudit(), validateLighthouseScores(), qaVerifyRequestSchema, userStorySchema, E2EAssertionFailError (+8 more)

### Community 46 - "backend-api-service/package.json"
Cohesion: 0.08
Nodes (31): dependencies, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, pino@^9.5.0, zod@^3.24.0, description, devDependencies (+23 more)

### Community 47 - "backend-api-service/src/lib/engine.ts"
Cohesion: 0.21
Nodes (18): `MOD-05`: Backend API & Row-Level Security (RLS) Engine, BUILTIN_SYSTEM_ENDPOINTS, detectOpenApiDrift(), executePrivacyErasure(), executePrivacyExport(), processBackendBuild(), VALID_GOLDEN_TEMPLATES, verifyRlsCoverage() (+10 more)

### Community 48 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowImportingTsExtensions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, noEmit (+7 more)

### Community 49 - "sre-healing-service/package.json"
Cohesion: 0.09
Nodes (29): dependencies, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, pino@^9.5.0, description, devDependencies, pino-pretty@^13.0.0 (+21 more)

### Community 50 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, noEmit (+8 more)

### Community 51 - "governance-service/src/middleware/authenticate.ts"
Cohesion: 0.18
Nodes (11): config, EnvConfig, envSchema, closeDb(), db, pool, fastify, FastifyRequest (+3 more)

### Community 52 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowImportingTsExtensions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, noEmit (+7 more)

### Community 53 - "marketing-engine-service/package.json"
Cohesion: 0.08
Nodes (31): dependencies, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, pino@^9.5.0, zod@^3.24.0, description, devDependencies (+23 more)

### Community 54 - "web-builder-service/src/lib/engine.ts"
Cohesion: 0.17
Nodes (19): `MOD-03`: Responsive Web & Landing Page Builder, BuildOptions, checkCookieConsent(), processWebBuild(), VALID_GOLDEN_TEMPLATES, verifyViewports(), fileDeltaSchema, webBuilderRoutes() (+11 more)

### Community 55 - "lead-pitch-service/src/lib/engine.ts"
Cohesion: 0.16
Nodes (22): `MOD-01`: Lead Discovery & Canva Pitch Engine, auditDigitalGaps(), autofillCanvaProposal(), checkDncSuppression(), processLeadDiscovery(), resolveCompliance(), leadPitchRoutes(), leadRequestSchema (+14 more)

### Community 56 - "sre-healing-service"
Cohesion: 0.33
Nodes (6): sre-healing-service, container_name, networks, ports, restart, volumes

### Community 57 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowImportingTsExtensions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, noEmit (+7 more)

### Community 58 - "mobile-app-service"
Cohesion: 0.33
Nodes (6): container_name, networks, ports, restart, volumes, mobile-app-service

### Community 59 - "whatsapp-service"
Cohesion: 0.33
Nodes (6): whatsapp-service, container_name, networks, ports, restart, volumes

### Community 60 - "dependencies"
Cohesion: 0.08
Nodes (24): dependencies, canvas-confetti@^1.9.4, dotenv@^17.2.3, drizzle-orm@^0.45.4, fastify@^5.12.8, @fastify/cors@^11.4.1, @google/genai@^2.4.0, jsonwebtoken@^9.0.3 (+16 more)

### Community 61 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, allowImportingTsExtensions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, noEmit (+7 more)

### Community 62 - "context"
Cohesion: 0.30
Nodes (17): build, build, build, context, dockerfile, target, build, build (+9 more)

### Community 63 - "dev-orchestrator.ts"
Cohesion: 0.13
Nodes (15): checkPort(), cleanup(), __dirname, __filename, main(), processes, rootDir, SERVICES (+7 more)

### Community 64 - "App.tsx"
Cohesion: 0.12
Nodes (37): lucide-react, react, AppLayout(), MetricItem, ScreenAnalyticsHeader(), ScreenAnalyticsHeaderProps, Header(), AddClientModal() (+29 more)

### Community 65 - "whatsapp-service/src/lib/engine.ts"
Cohesion: 0.19
Nodes (17): `MOD-08`: WhatsApp Marketing & CRM RAG Engine, check24HourServiceWindow(), evaluateRagConfidence(), processWhatsAppEvent(), whatsappRoutes(), buildApp(), PORT, MetaApiRejectError (+9 more)

### Community 66 - "api.ts"
Cohesion: 0.14
Nodes (34): @xyflow/react, MarketingEngineTab(), getTemplates(), makeNodeStyle(), N8nWorkflowsTab(), N8nWorkflowsTabProps, WorkflowNodeData, buildErNodes() (+26 more)

### Community 67 - "whatsapp-service/package.json"
Cohesion: 0.08
Nodes (31): dependencies, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, pino@^9.5.0, zod@^3.24.0, description, devDependencies (+23 more)

### Community 68 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, noEmit (+8 more)

### Community 69 - "DashboardTab.tsx"
Cohesion: 0.16
Nodes (15): BADGE_STYLES, DOT_STYLES, MetricStatusTone, SummaryMetricCard(), SummaryMetricCardProps, SummaryMetricGrid(), GenerateLeadModal(), GenerateLeadModalProps (+7 more)

### Community 70 - "marketing-engine-service"
Cohesion: 0.33
Nodes (6): container_name, networks, ports, restart, volumes, marketing-engine-service

### Community 71 - "NoCodeEditorTab.tsx"
Cohesion: 0.24
Nodes (11): NoCodeEditorTab(), NoCodeEditorTabProps, compileFigCraftToReact(), DEFAULT_FIGCRAFT_TOKENS, FigCraftColorToken, FigCraftComponentNode, FigCraftDesignTokens, FigCraftTypographyToken (+3 more)

### Community 72 - "web-builder-service"
Cohesion: 0.33
Nodes (6): web-builder-service, container_name, networks, ports, restart, volumes

### Community 73 - "vite.config.ts"
Cohesion: 0.25
Nodes (6): @tailwindcss/vite@^4.3.3, vite@^8.3.0, @vitejs/plugin-react@^6.1.1, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 74 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, clean, dev, dev:all, lint, preview, test (+1 more)

### Community 75 - "minio"
Cohesion: 0.18
Nodes (11): MINIO_ROOT_PASSWORD, MINIO_ROOT_USER, command, container_name, environment, image, networks, ports (+3 more)

### Community 76 - "marketing-engine-service/src/lib/engine.ts"
Cohesion: 0.27
Nodes (12): `MOD-07`: Canva Pro Digital Marketing Engine, generatePlatformPost(), PLATFORM_ROTATION, processMarketingCampaign(), marketingRequestSchema, CalendarItem, CanvaRateLimitError, Mod07MarketingRequest (+4 more)

### Community 77 - "ambient.d.ts"
Cohesion: 0.50
Nodes (3): bcrypt, drizzle-kit, @fastify/rate-limit

### Community 78 - "postgres"
Cohesion: 0.18
Nodes (11): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, container_name, environment, image, networks, ports (+3 more)

### Community 79 - "AppProvider"
Cohesion: 0.25
Nodes (6): App(), AppProvider(), getDefaultTelemetryScores(), loadPersisted(), savePersisted(), resetStoredGates()

### Community 80 - "LAUNCH UP — UNIVERSAL AI MODEL CHECKPOINT & HANDOFF STATE"
Cohesion: 0.33
Nodes (6): 1. NEW AI MODEL BOOT SEQUENCE (EXECUTE IN THIS EXACT ORDER), 2. MANDATORY CHECKPOINT SAVE PROTOCOL (BEFORE TOKEN EXHAUSTION), 3. ACTIVE SPRINT & EXACT RESUME POINTER (UPDATED BY CODING AI), 4. MODULE COMPLETION & 5-STAGE TEST LEDGER, LAUNCH UP — UNIVERSAL AI MODEL CHECKPOINT & HANDOFF STATE, Required Actions Before Stopping:

### Community 81 - "gateway"
Cohesion: 0.25
Nodes (8): container_name, depends_on, image, networks, ports, restart, volumes, gateway

### Community 82 - "redis"
Cohesion: 0.25
Nodes (8): command, container_name, image, networks, ports, restart, volumes, redis

### Community 83 - "verify-mesh-health.ts"
Cohesion: 0.50
Nodes (4): main(), probe(), ProbeTarget, TARGETS

### Community 84 - "Sidebar.tsx"
Cohesion: 0.43
Nodes (5): LaunchUpLogo(), LaunchUpLogoProps, NavItem, Sidebar(), TabId

### Community 85 - "governance-service"
Cohesion: 0.33
Nodes (6): container_name, networks, ports, restart, volumes, governance-service

### Community 86 - "lead-pitch-service"
Cohesion: 0.33
Nodes (6): container_name, networks, ports, restart, volumes, lead-pitch-service

### Community 87 - "qa-secops-service"
Cohesion: 0.33
Nodes (6): container_name, networks, ports, restart, volumes, qa-secops-service

### Community 88 - "agency-concurrency.perf.test.ts"
Cohesion: 0.17
Nodes (10): marketingRoutes(), buildApp(), PORT, qaSecopsRoutes(), buildApp(), PORT, buildMod01(), buildMod02() (+2 more)

### Community 90 - "2. Module-by-Module JSON Input/Output Contracts"
Cohesion: 0.50
Nodes (3): 1. Core Database & RBAC Relational Contract (Foundation for `MOD-10`), 2. Module-by-Module JSON Input/Output Contracts, LAUNCH UP — LOCKED MODULE INPUT/OUTPUT CONTRACTS (DESIGN-BY-CONTRACT)

### Community 91 - "express@^4.21.2"
Cohesion: 0.33
Nodes (4): express@^4.21.2, @types/canvas-confetti@^1.9.0, express, @types/canvas-confetti

## Knowledge Gaps
- **2 isolated node(s):** `RFC-7519`, `RFC-7519`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 748 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `services` connect `services` to `marketing-engine-service`, `web-admin`, `governance-service`, `web-builder-service`, `minio`, `auth-service`, `postgres`, `gateway`, `redis`, `governance-service`, `lead-pitch-service`, `qa-secops-service`, `sre-healing-service`, `environment`, `mobile-app-service`, `whatsapp-service`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `RFC-7519`, `RFC-7519` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AppContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07832167832167833 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.tsx` to `AppContext.tsx`, `api.ts`, `package.json`, `DashboardTab.tsx`, `NoCodeEditorTab.tsx`, `AppProvider`, `Sidebar.tsx`, `dependencies`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.10052910052910052 - nodes in this community are weakly interconnected._
- **Why does `TypeScript 5.x` connect `AppContext.tsx` to `Launch Up — Comprehensive Technology Stack & Curriculum Guide`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Should `auth-service/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05333333333333334 - nodes in this community are weakly interconnected._