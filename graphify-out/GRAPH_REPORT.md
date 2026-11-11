# Graph Report - launch-up  (2026-11-11)

## Corpus Check
- 169 files · ~124,222 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 18 file(s) not represented in the graph (top: (none) 13, .example 1, .lock 1)

## Summary
- 1736 nodes · 3186 edges · 84 communities (80 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `509a8036`
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
- auth-service/src/server.ts
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
- react
- marketing-engine-service
- NoCodeEditorTab.tsx
- web-builder-service
- vite.config.ts
- scripts
- react-dom
- agency-full-lifecycle.system.test.ts
- marketing-engine-service/src/lib/engine.ts
- express@^4.21.2
- lead-pitch-service/src/routes/index.ts
- LAUNCH UP — UNIVERSAL AI MODEL CHECKPOINT & HANDOFF STATE
- backend-api-service
- GovernanceMesh
- 2. Module-by-Module JSON Input/Output Contracts

## God Nodes (most connected - your core abstractions)
1. `useApp()` - 67 edges
2. `react` - 39 edges
3. `AppLayout()` - 36 edges
4. `lucide-react` - 35 edges
5. `AppContextType` - 25 edges
6. `services` - 20 edges
7. `ScreenAnalyticsHeader()` - 19 edges
8. `test` - 18 edges
9. `interval` - 18 edges
10. `timeout` - 18 edges

## Surprising Connections (you probably didn't know these)
- ``MOD-02`: BA Intake & Scope Synthesizer` --references--> `Mod02IntakeRequest`  [INFERRED]
  contracts/module_input_output_contracts.md → services/ba-intake-service/src/types/index.ts
- ``MOD-02`: BA Intake & Scope Synthesizer` --references--> `Mod02IntakeResponse`  [INFERRED]
  contracts/module_input_output_contracts.md → services/ba-intake-service/src/types/index.ts
- ``MOD-05`: Backend API & Row-Level Security (RLS) Engine` --references--> `Mod05BackendBuildRequest`  [INFERRED]
  contracts/module_input_output_contracts.md → services/backend-api-service/src/types/index.ts
- ``MOD-05`: Backend API & Row-Level Security (RLS) Engine` --references--> `Mod05BackendBuildResponse`  [INFERRED]
  contracts/module_input_output_contracts.md → services/backend-api-service/src/types/index.ts
- ``MOD-10`: M:N Tenancy, RBAC & FinOps Governance Core` --references--> `Mod10AuthRequest`  [INFERRED]
  contracts/module_input_output_contracts.md → services/governance-service/src/lib/verify_permission.ts

## Import Cycles
- None detected.

## Communities (84 total, 4 thin omitted)

### Community 0 - "AppContext.tsx"
Cohesion: 0.10
Nodes (49): NavItem, AppContext, AppContextType, initialAgents, initialAlerts, initialBackups, initialCampaigns, initialClients (+41 more)

### Community 1 - "environment"
Cohesion: 0.22
Nodes (24): environment, environment, environment, environment, BCRYPT_ROUNDS, DATABASE_URL, JWT_REFRESH_SECRET, JWT_SECRET (+16 more)

### Community 2 - "ba-intake-service/src/lib/engine.ts"
Cohesion: 0.16
Nodes (22): `MOD-02`: BA Intake & Scope Synthesizer, detectSemanticConflicts(), generateOpenApiYaml(), generateSqlMigration(), processBaIntake(), resolveComplianceFlags(), synthesizePrd(), VALID_COUNTRIES (+14 more)

### Community 3 - "package.json"
Cohesion: 0.12
Nodes (23): devDependencies, autoprefixer@^10.4.21, esbuild@^0.25.0, tailwindcss@^4.3.3, tsx@^4.21.0, @types/express@^4.17.21, @types/node@^22.14.0, @types/react@^19.3.0 (+15 more)

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
Cohesion: 0.11
Nodes (24): authenticate(), fastify, FastifyRequest, JwtPayload, authorize(), authSchema, organizations, permissions (+16 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution (+9 more)

### Community 13 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution (+9 more)

### Community 14 - "client-service/src/routes/index.ts"
Cohesion: 0.09
Nodes (25): config, EnvConfig, envSchema, closeDb(), db, pool, authenticate(), authorize() (+17 more)

### Community 15 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir (+8 more)

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
Cohesion: 0.06
Nodes (61): healthcheck, healthcheck, healthcheck, healthcheck, MINIO_ROOT_PASSWORD, MINIO_ROOT_USER, POSTGRES_DB, POSTGRES_PASSWORD (+53 more)

### Community 21 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir (+5 more)

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

### Community 26 - "auth-service/src/server.ts"
Cohesion: 0.22
Nodes (8): config, EnvConfig, envSchema, closeDb(), db, pool, app, shutdown()

### Community 27 - "services"
Cohesion: 0.11
Nodes (17): name, name, name, build, container_name, networks, ports, restart (+9 more)

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
Nodes (17): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution (+9 more)

### Community 37 - "project-service/src/db.ts"
Cohesion: 0.25
Nodes (4): config, envSchema, db, pool

### Community 38 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir (+5 more)

### Community 39 - "web-admin"
Cohesion: 0.22
Nodes (9): VITE_API_BASE_URL, web-admin, container_name, depends_on, environment, networks, ports, restart (+1 more)

### Community 40 - "governance-service"
Cohesion: 0.17
Nodes (16): condition, depends_on, container_name, depends_on, networks, ports, restart, volumes (+8 more)

### Community 41 - "qa-secops-service/package.json"
Cohesion: 0.08
Nodes (31): dependencies, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, pino@^9.5.0, zod@^3.24.0, description, devDependencies (+23 more)

### Community 42 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution (+6 more)

### Community 43 - "sre-healing-service/src/lib/engine.ts"
Cohesion: 0.17
Nodes (19): `MOD-09`: Autonomous SRE & Self-Healing Backend Operations, FORBIDDEN_FILE_PATTERNS, isExternalThirdPartyOutage(), processSREIncident(), resolveImpactedGraphifyNodes(), THIRD_PARTY_INDICATORS, sreRoutes(), buildApp() (+11 more)

### Community 44 - "auth-service"
Cohesion: 0.29
Nodes (7): build, container_name, networks, ports, restart, volumes, auth-service

### Community 45 - "qa-secops-service/src/lib/engine.ts"
Cohesion: 0.18
Nodes (19): `MOD-06`: Autonomous QA, SecOps & Compliance Verifier, processQAVerification(), runPlaywrightE2E(), runSecurityAudit(), validateLighthouseScores(), qaSecopsRoutes(), qaVerifyRequestSchema, userStorySchema (+11 more)

### Community 46 - "backend-api-service/package.json"
Cohesion: 0.08
Nodes (31): dependencies, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, pino@^9.5.0, zod@^3.24.0, description, devDependencies (+23 more)

### Community 47 - "backend-api-service/src/lib/engine.ts"
Cohesion: 0.20
Nodes (18): `MOD-05`: Backend API & Row-Level Security (RLS) Engine, BUILTIN_SYSTEM_ENDPOINTS, detectOpenApiDrift(), executePrivacyErasure(), executePrivacyExport(), processBackendBuild(), VALID_GOLDEN_TEMPLATES, verifyRlsCoverage() (+10 more)

### Community 48 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir (+5 more)

### Community 49 - "sre-healing-service/package.json"
Cohesion: 0.09
Nodes (29): dependencies, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, pino@^9.5.0, description, devDependencies, pino-pretty@^13.0.0 (+21 more)

### Community 50 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir (+6 more)

### Community 51 - "governance-service/src/middleware/authenticate.ts"
Cohesion: 0.18
Nodes (11): config, EnvConfig, envSchema, closeDb(), db, pool, fastify, FastifyRequest (+3 more)

### Community 52 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir (+5 more)

### Community 53 - "marketing-engine-service/package.json"
Cohesion: 0.08
Nodes (31): dependencies, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, pino@^9.5.0, zod@^3.24.0, description, devDependencies (+23 more)

### Community 54 - "web-builder-service/src/lib/engine.ts"
Cohesion: 0.17
Nodes (19): `MOD-03`: Responsive Web & Landing Page Builder, BuildOptions, checkCookieConsent(), processWebBuild(), VALID_GOLDEN_TEMPLATES, verifyViewports(), fileDeltaSchema, webBuilderRoutes() (+11 more)

### Community 55 - "lead-pitch-service/src/lib/engine.ts"
Cohesion: 0.22
Nodes (16): `MOD-01`: Lead Discovery & Canva Pitch Engine, auditDigitalGaps(), autofillCanvaProposal(), checkDncSuppression(), processLeadDiscovery(), resolveCompliance(), CanvaAutofillFailError, DncListBlockedError (+8 more)

### Community 56 - "sre-healing-service"
Cohesion: 0.29
Nodes (7): sre-healing-service, build, container_name, networks, ports, restart, volumes

### Community 57 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir (+5 more)

### Community 58 - "mobile-app-service"
Cohesion: 0.29
Nodes (7): build, container_name, networks, ports, restart, volumes, mobile-app-service

### Community 59 - "whatsapp-service"
Cohesion: 0.29
Nodes (7): whatsapp-service, build, container_name, networks, ports, restart, volumes

### Community 60 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, canvas-confetti@^1.9.4, dotenv@^17.2.3, fastify@^5.12.8, @fastify/cors@^11.4.1, @google/genai@^2.4.0, lucide-react@^0.546.0, react@^19.0.1 (+10 more)

### Community 61 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir (+5 more)

### Community 62 - "context"
Cohesion: 0.08
Nodes (33): build, container_name, networks, ports, restart, volumes, context, dockerfile (+25 more)

### Community 63 - "dev-orchestrator.ts"
Cohesion: 0.13
Nodes (13): checkPort(), __dirname, __filename, main(), processes, rootDir, SERVICES, ServiceSpec (+5 more)

### Community 64 - "App.tsx"
Cohesion: 0.11
Nodes (35): lucide-react, react, App(), AppLayout(), Sidebar(), AddClientModal(), ClientDetailDrawer(), ClientPortalModal() (+27 more)

### Community 65 - "whatsapp-service/src/lib/engine.ts"
Cohesion: 0.20
Nodes (17): `MOD-08`: WhatsApp Marketing & CRM RAG Engine, check24HourServiceWindow(), evaluateRagConfidence(), processWhatsAppEvent(), whatsappRoutes(), buildApp(), PORT, MetaApiRejectError (+9 more)

### Community 66 - "api.ts"
Cohesion: 0.14
Nodes (32): @xyflow/react, Header(), MarketingEngineTab(), getTemplates(), makeNodeStyle(), N8nWorkflowsTab(), N8nWorkflowsTabProps, WorkflowNodeData (+24 more)

### Community 67 - "whatsapp-service/package.json"
Cohesion: 0.08
Nodes (31): dependencies, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, pino@^9.5.0, zod@^3.24.0, description, devDependencies (+23 more)

### Community 68 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir (+6 more)

### Community 69 - "react"
Cohesion: 0.19
Nodes (11): MetricItem, ScreenAnalyticsHeader(), ScreenAnalyticsHeaderProps, ClientsTab(), ConnectedAppsTab(), DeploymentsTab(), FDESystemsTab(), SLMLabTab() (+3 more)

### Community 70 - "marketing-engine-service"
Cohesion: 0.29
Nodes (7): build, container_name, networks, ports, restart, volumes, marketing-engine-service

### Community 71 - "NoCodeEditorTab.tsx"
Cohesion: 0.22
Nodes (12): NoCodeEditorTab(), NoCodeEditorTabProps, compileFigCraftToReact(), DEFAULT_FIGCRAFT_TOKENS, FigCraftColorToken, FigCraftComponentNode, FigCraftDesignTokens, FigCraftProjectSchema (+4 more)

### Community 72 - "web-builder-service"
Cohesion: 0.29
Nodes (7): web-builder-service, build, container_name, networks, ports, restart, volumes

### Community 73 - "vite.config.ts"
Cohesion: 0.25
Nodes (6): @tailwindcss/vite@^4.3.3, vite@^8.3.0, @vitejs/plugin-react@^6.1.1, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 74 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, clean, dev, dev:all, lint, preview, test

### Community 75 - "react-dom"
Cohesion: 0.33
Nodes (4): motion@^12.23.24, react-dom@^19.0.1, motion, react-dom

### Community 76 - "agency-full-lifecycle.system.test.ts"
Cohesion: 0.13
Nodes (14): GateState, Principal, createGovernanceHttpServer(), dbStore, signToken(), RFC-7519, verifyToken(), createPerfServer() (+6 more)

### Community 77 - "marketing-engine-service/src/lib/engine.ts"
Cohesion: 0.21
Nodes (15): `MOD-07`: Canva Pro Digital Marketing Engine, generatePlatformPost(), PLATFORM_ROTATION, processMarketingCampaign(), marketingRequestSchema, marketingRoutes(), buildApp(), PORT (+7 more)

### Community 79 - "lead-pitch-service/src/routes/index.ts"
Cohesion: 0.28
Nodes (6): leadPitchRoutes(), leadRequestSchema, mockDncLedger, mockProspectRegistry, buildApp(), PORT

### Community 80 - "LAUNCH UP — UNIVERSAL AI MODEL CHECKPOINT & HANDOFF STATE"
Cohesion: 0.29
Nodes (6): 1. NEW AI MODEL BOOT SEQUENCE (EXECUTE IN THIS EXACT ORDER), 2. MANDATORY CHECKPOINT SAVE PROTOCOL (BEFORE TOKEN EXHAUSTION), 3. ACTIVE SPRINT & EXACT RESUME POINTER (UPDATED BY CODING AI), 4. MODULE COMPLETION & 5-STAGE TEST LEDGER, LAUNCH UP — UNIVERSAL AI MODEL CHECKPOINT & HANDOFF STATE, Required Actions Before Stopping:

### Community 81 - "backend-api-service"
Cohesion: 0.29
Nodes (7): build, container_name, networks, ports, restart, volumes, backend-api-service

### Community 84 - "2. Module-by-Module JSON Input/Output Contracts"
Cohesion: 0.50
Nodes (3): 1. Core Database & RBAC Relational Contract (Foundation for `MOD-10`), 2. Module-by-Module JSON Input/Output Contracts, LAUNCH UP — LOCKED MODULE INPUT/OUTPUT CONTRACTS (DESIGN-BY-CONTRACT)

## Knowledge Gaps
- **2 isolated node(s):** `RFC-7519`, `RFC-7519`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 709 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `services` connect `services` to `marketing-engine-service`, `web-admin`, `governance-service`, `web-builder-service`, `auth-service`, `backend-api-service`, `interval`, `sre-healing-service`, `environment`, `mobile-app-service`, `whatsapp-service`, `context`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `RFC-7519`, `RFC-7519` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AppContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10235690235690235 - nodes in this community are weakly interconnected._
- **Why does `bcrypt` connect `auth-service/package.json` to `auth-service/src/models/schema.ts`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11594202898550725 - nodes in this community are weakly interconnected._
- **Should `auth-service/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05333333333333334 - nodes in this community are weakly interconnected._
- **Should `client-service/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06387921022067364 - nodes in this community are weakly interconnected._