# Graph Report - launch-up  (2026-11-10)

## Corpus Check
- 127 files · ~96,688 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 9, .example 1, .lock 1)

## Summary
- 1320 nodes · 2319 edges · 66 communities (64 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `951d2e80`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
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
- volumes
- lead-pitch-service/src/lib/engine.ts
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
- context
- web-builder-service/src/lib/engine.ts
- compilerOptions
- services
- postgres
- auth-service
- backend-api-service/package.json
- backend-api-service/src/lib/engine.ts
- mobile-app-service/src/server.ts
- ref_node_assert
- mod10.unit.test.ts
- governance-service/src/middleware/authenticate.ts
- compilerOptions
- minio
- postgres
- gateway
- redis
- kafka
- LAUNCH UP — UNIVERSAL AI MODEL CHECKPOINT & HANDOFF STATE
- project-service
- web-builder-service
- compilerOptions
- backend-api-service
- governance-service
- mobile-app-service
- web-builder-service/src/server.ts

## God Nodes (most connected - your core abstractions)
1. `useApp()` - 59 edges
2. `react` - 35 edges
3. `lucide-react` - 32 edges
4. `AppLayout()` - 32 edges
5. `AppContextType` - 24 edges
6. `ScreenAnalyticsHeader()` - 21 edges
7. `services` - 16 edges
8. `compilerOptions` - 16 edges
9. `compilerOptions` - 15 edges
10. `compilerOptions` - 15 edges

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

## Communities (66 total, 2 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.06
Nodes (93): lucide-react, react, App(), AppLayout(), MetricItem, ScreenAnalyticsHeader(), ScreenAnalyticsHeaderProps, Header() (+85 more)

### Community 1 - "environment"
Cohesion: 0.26
Nodes (19): environment, environment, environment, environment, BCRYPT_ROUNDS, DATABASE_URL, JWT_REFRESH_SECRET, JWT_SECRET (+11 more)

### Community 2 - "ba-intake-service/src/lib/engine.ts"
Cohesion: 0.15
Nodes (22): `MOD-02`: BA Intake & Scope Synthesizer, detectSemanticConflicts(), generateOpenApiYaml(), generateSqlMigration(), processBaIntake(), resolveComplianceFlags(), synthesizePrd(), VALID_COUNTRIES (+14 more)

### Community 3 - "package.json"
Cohesion: 0.05
Nodes (52): dependencies, canvas-confetti@^1.9.4, dotenv@^17.2.3, express@^4.21.2, @google/genai@^2.4.0, lucide-react@^0.546.0, motion@^12.23.24, react@^19.0.1 (+44 more)

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
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+8 more)

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
Cohesion: 0.34
Nodes (19): healthcheck, healthcheck, healthcheck, healthcheck, healthcheck, healthcheck, interval, retries (+11 more)

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
Cohesion: 0.17
Nodes (12): ALLOW_PLAINTEXT_LISTENER, KAFKA_CFG_ADVERTISED_LISTENERS, KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE, KAFKA_CFG_CONTROLLER_LISTENER_NAMES, KAFKA_CFG_CONTROLLER_QUORUM_VOTERS, KAFKA_CFG_INTER_BROKER_LISTENER_NAME, KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP, KAFKA_CFG_LISTENERS (+4 more)

### Community 26 - "auth-service/src/server.ts"
Cohesion: 0.22
Nodes (8): config, EnvConfig, envSchema, closeDb(), db, pool, app, shutdown()

### Community 27 - "volumes"
Cohesion: 0.12
Nodes (16): container_name, networks, ports, restart, volumes, name, name, name (+8 more)

### Community 28 - "lead-pitch-service/src/lib/engine.ts"
Cohesion: 0.11
Nodes (27): 1. Core Database & RBAC Relational Contract (Foundation for `MOD-10`), 2. Module-by-Module JSON Input/Output Contracts, LAUNCH UP — LOCKED MODULE INPUT/OUTPUT CONTRACTS (DESIGN-BY-CONTRACT), `MOD-01`: Lead Discovery & Canva Pitch Engine, `MOD-06`: Autonomous QA, SecOps & Compliance Verifier, `MOD-07`: Canva Pro Digital Marketing Engine, `MOD-08`: WhatsApp Marketing & CRM RAG Engine, `MOD-09`: Autonomous SRE & Self-Healing Backend Operations (+19 more)

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
Cohesion: 0.17
Nodes (19): 3. ACTIVE SPRINT & EXACT RESUME POINTER (UPDATED BY CODING AI), `MOD-04`: Android Mobile App Builder, checkPlayPolicyDataSafety(), DANGEROUS_PERMISSION_MAP, JAVA_KEYWORDS, processAndroidBuild(), VALID_GOLDEN_TEMPLATES, validatePackageName() (+11 more)

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

### Community 40 - "context"
Cohesion: 0.22
Nodes (16): build, build, context, dockerfile, target, build, container_name, networks (+8 more)

### Community 41 - "web-builder-service/src/lib/engine.ts"
Cohesion: 0.21
Nodes (16): `MOD-03`: Responsive Web & Landing Page Builder, BuildOptions, checkCookieConsent(), processWebBuild(), VALID_GOLDEN_TEMPLATES, verifyViewports(), fileDeltaSchema, webBuildRequestSchema (+8 more)

### Community 42 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution (+6 more)

### Community 43 - "services"
Cohesion: 0.29
Nodes (7): container_name, environment, networks, ports, restart, volumes, lead-pitch-service

### Community 44 - "postgres"
Cohesion: 0.31
Nodes (10): condition, depends_on, depends_on, auth-service, postgres, redis, depends_on, condition (+2 more)

### Community 45 - "auth-service"
Cohesion: 0.33
Nodes (6): container_name, networks, ports, restart, volumes, auth-service

### Community 46 - "backend-api-service/package.json"
Cohesion: 0.08
Nodes (31): dependencies, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, pino@^9.5.0, zod@^3.24.0, description, devDependencies (+23 more)

### Community 47 - "backend-api-service/src/lib/engine.ts"
Cohesion: 0.20
Nodes (18): `MOD-05`: Backend API & Row-Level Security (RLS) Engine, BUILTIN_SYSTEM_ENDPOINTS, detectOpenApiDrift(), executePrivacyErasure(), executePrivacyExport(), processBackendBuild(), VALID_GOLDEN_TEMPLATES, verifyRlsCoverage() (+10 more)

### Community 48 - "mobile-app-service/src/server.ts"
Cohesion: 0.67
Nodes (3): mobileAppRoutes(), buildApp(), PORT

### Community 49 - "ref_node_assert"
Cohesion: 0.13
Nodes (12): createGovernanceHttpServer(), dbStore, signToken(), RFC-7519, verifyToken(), createPerfServer(), perfStore, signToken() (+4 more)

### Community 50 - "mod10.unit.test.ts"
Cohesion: 0.13
Nodes (13): ApprovalGateRecord, BudgetExceededError, CircularTenancyError, ClientProjectLinkRecord, MembershipRecord, PrincipalRecord, ProjectRecord, RbacDeniedError (+5 more)

### Community 51 - "governance-service/src/middleware/authenticate.ts"
Cohesion: 0.18
Nodes (11): config, EnvConfig, envSchema, closeDb(), db, pool, fastify, FastifyRequest (+3 more)

### Community 52 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir (+5 more)

### Community 53 - "minio"
Cohesion: 0.18
Nodes (11): MINIO_ROOT_PASSWORD, MINIO_ROOT_USER, command, container_name, environment, image, networks, ports (+3 more)

### Community 54 - "postgres"
Cohesion: 0.18
Nodes (11): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, container_name, environment, image, networks, ports (+3 more)

### Community 55 - "gateway"
Cohesion: 0.25
Nodes (8): container_name, depends_on, image, networks, ports, restart, volumes, gateway

### Community 56 - "redis"
Cohesion: 0.25
Nodes (8): command, container_name, image, networks, ports, restart, volumes, redis

### Community 57 - "kafka"
Cohesion: 0.29
Nodes (7): container_name, image, networks, ports, restart, volumes, kafka

### Community 58 - "LAUNCH UP — UNIVERSAL AI MODEL CHECKPOINT & HANDOFF STATE"
Cohesion: 0.33
Nodes (5): 1. NEW AI MODEL BOOT SEQUENCE (EXECUTE IN THIS EXACT ORDER), 2. MANDATORY CHECKPOINT SAVE PROTOCOL (BEFORE TOKEN EXHAUSTION), 4. MODULE COMPLETION & 5-STAGE TEST LEDGER, LAUNCH UP — UNIVERSAL AI MODEL CHECKPOINT & HANDOFF STATE, Required Actions Before Stopping:

### Community 59 - "project-service"
Cohesion: 0.29
Nodes (7): build, container_name, networks, ports, restart, volumes, project-service

### Community 60 - "web-builder-service"
Cohesion: 0.33
Nodes (6): web-builder-service, container_name, networks, ports, restart, volumes

### Community 61 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir (+5 more)

### Community 62 - "backend-api-service"
Cohesion: 0.29
Nodes (7): build, container_name, networks, ports, restart, volumes, backend-api-service

### Community 63 - "governance-service"
Cohesion: 0.29
Nodes (7): build, container_name, networks, ports, restart, volumes, governance-service

### Community 64 - "mobile-app-service"
Cohesion: 0.33
Nodes (6): container_name, networks, ports, restart, volumes, mobile-app-service

### Community 65 - "web-builder-service/src/server.ts"
Cohesion: 0.67
Nodes (3): webBuilderRoutes(), buildApp(), PORT

## Knowledge Gaps
- **2 isolated node(s):** `RFC-7519`, `RFC-7519`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 550 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `services` connect `volumes` to `mobile-app-service`, `web-admin`, `context`, `services`, `auth-service`, `minio`, `postgres`, `gateway`, `redis`, `kafka`, `project-service`, `web-builder-service`, `backend-api-service`, `governance-service`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `RFC-7519`, `RFC-7519` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.060198643410852716 - nodes in this community are weakly interconnected._
- **Why does `bcrypt` connect `auth-service/package.json` to `auth-service/src/models/schema.ts`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.050505050505050504 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.tsx` to `package.json`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Should `auth-service/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05333333333333334 - nodes in this community are weakly interconnected._