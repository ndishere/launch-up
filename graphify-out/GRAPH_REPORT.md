# Graph Report - launch-up  (2026-11-10)

## Corpus Check
- 86 files · ~80,678 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .example 1, .lock 1)

## Summary
- 890 nodes · 1530 edges · 39 communities (37 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e3f7734a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- environment
- minio
- package.json
- auth-service/package.json
- client-service/package.json
- project-service/package.json
- auth-service/src/routes/index.ts
- 3. Functional Requirements (FR)
- environment
- Launch Up — Comprehensive Technology Stack & Curriculum Guide
- auth-service/src/server.ts
- compilerOptions
- compilerOptions
- client-service/src/routes/index.ts
- compilerOptions
- compilerOptions
- Launch Up — System Design Document (SDD)
- Launch Up — UI/UX Wireframes & Page Layout Specifications
- 2. Module-by-Module JSON Input/Output Contracts
- interval
- client-service/src/middleware/authenticate.ts
- governance-service/package.json
- postgres
- networks
- services
- project-service/src/db.ts
- volumes
- mod10.unit.test.ts
- LAUNCH UP — MASTER ARCHITECTURE, GLOBAL COMPLIANCE & BUSINESS ANALYST SUITE
- 1. Module-by-Module Positive, Negative & Rare Test Cases
- governance-service/src/routes/index.ts
- ref_fastify
- LAUNCH UP — SETUP GUIDE & EXACT STARTER PROMPT FOR CODING AI MODELS
- Run and deploy your AI Studio app
- compilerOptions
- web-admin
- gateway

## God Nodes (most connected - your core abstractions)
1. `useApp()` - 59 edges
2. `react` - 35 edges
3. `AppLayout()` - 32 edges
4. `lucide-react` - 32 edges
5. `AppContextType` - 24 edges
6. `ScreenAnalyticsHeader()` - 21 edges
7. `compilerOptions` - 16 edges
8. `compilerOptions` - 15 edges
9. `compilerOptions` - 15 edges
10. `compilerOptions` - 15 edges

## Surprising Connections (you probably didn't know these)
- `3. ACTIVE SPRINT & EXACT RESUME POINTER (UPDATED BY CODING AI)` --references--> `Mod10AuthResponse`  [INFERRED]
  checkpoint_handoff_state.md → services/governance-service/src/lib/verify_permission.ts
- `TypeScript 5.x` --references--> `Client`  [INFERRED]
  TECH_STACK.md → src/types/index.ts
- `TypeScript 5.x` --references--> `DeploymentLog`  [INFERRED]
  TECH_STACK.md → src/types/index.ts
- `TypeScript 5.x` --references--> `Project`  [INFERRED]
  TECH_STACK.md → src/types/index.ts
- `TypeScript 5.x` --references--> `SystemAlert`  [INFERRED]
  TECH_STACK.md → src/types/index.ts

## Import Cycles
- None detected.

## Communities (39 total, 2 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.06
Nodes (93): lucide-react, react, App(), AppLayout(), MetricItem, ScreenAnalyticsHeader(), ScreenAnalyticsHeaderProps, Header() (+85 more)

### Community 1 - "environment"
Cohesion: 0.06
Nodes (57): build, condition, container_name, depends_on, environment, networks, ports, restart (+49 more)

### Community 2 - "minio"
Cohesion: 0.18
Nodes (11): MINIO_ROOT_PASSWORD, MINIO_ROOT_USER, command, container_name, environment, image, networks, ports (+3 more)

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

### Community 7 - "auth-service/src/routes/index.ts"
Cohesion: 0.13
Nodes (21): authenticate(), authorize(), authSchema, organizations, permissions, refreshTokens, rolePermissions, rolePermissionsRelations (+13 more)

### Community 8 - "3. Functional Requirements (FR)"
Cohesion: 0.10
Nodes (20): 1.1 Problem Statement, 1.2 Product Vision & Objective, 1. Executive Summary & Business Objectives, 2.1 Personas, 2.2 Access Control Matrix, 2. User Personas & Permissions Matrix (RBAC), 3. Functional Requirements (FR), 4. Non-Functional Requirements (NFR) (+12 more)

### Community 9 - "environment"
Cohesion: 0.11
Nodes (19): ALLOW_PLAINTEXT_LISTENER, KAFKA_CFG_ADVERTISED_LISTENERS, KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE, KAFKA_CFG_CONTROLLER_LISTENER_NAMES, KAFKA_CFG_CONTROLLER_QUORUM_VOTERS, KAFKA_CFG_INTER_BROKER_LISTENER_NAME, KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP, KAFKA_CFG_LISTENERS (+11 more)

### Community 10 - "Launch Up — Comprehensive Technology Stack & Curriculum Guide"
Cohesion: 0.11
Nodes (18): 1. Frontend Core & Reactive Architecture, 2. Type System & Software Correctness, 3. Styling, Design Systems & Theming, 4. Data Visualization & Charting, 5. Database Architecture & Systems Engineering, 6. DevOps, Infrastructure & CI/CD Pipelines, 7. Security, Cryptography & Compliance, 8. Build Tools & Runtime Environment (+10 more)

### Community 11 - "auth-service/src/server.ts"
Cohesion: 0.16
Nodes (11): config, EnvConfig, envSchema, closeDb(), db, pool, app, shutdown() (+3 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution (+9 more)

### Community 13 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution (+9 more)

### Community 14 - "client-service/src/routes/index.ts"
Cohesion: 0.17
Nodes (13): db, pool, clientProjects, clientProjectsRelations, clients, clientsRelations, clientsSchema, orgIdRef (+5 more)

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

### Community 19 - "2. Module-by-Module JSON Input/Output Contracts"
Cohesion: 0.15
Nodes (12): 1. Core Database & RBAC Relational Contract (Foundation for `MOD-10`), 2. Module-by-Module JSON Input/Output Contracts, LAUNCH UP — LOCKED MODULE INPUT/OUTPUT CONTRACTS (DESIGN-BY-CONTRACT), `MOD-01`: Lead Discovery & Canva Pitch Engine, `MOD-02`: BA Intake & Scope Synthesizer, `MOD-03`: Responsive Web & Landing Page Builder, `MOD-04`: Android Mobile App Builder, `MOD-05`: Backend API & Row-Level Security (RLS) Engine (+4 more)

### Community 20 - "interval"
Cohesion: 0.42
Nodes (14): healthcheck, healthcheck, healthcheck, healthcheck, interval, retries, start_period, test (+6 more)

### Community 21 - "client-service/src/middleware/authenticate.ts"
Cohesion: 0.18
Nodes (9): config, EnvConfig, envSchema, authenticate(), authorize(), fastify, FastifyRequest, JwtPayload (+1 more)

### Community 22 - "governance-service/package.json"
Cohesion: 0.06
Nodes (46): vitest, dependencies, drizzle-orm@^0.39.0, fastify@^5.2.0, @fastify/cors@^11.0.0, @fastify/helmet@^13.0.0, jsonwebtoken@^9.0.2, pg@^8.13.0 (+38 more)

### Community 23 - "postgres"
Cohesion: 0.18
Nodes (11): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, container_name, environment, image, networks, ports (+3 more)

### Community 24 - "networks"
Cohesion: 0.18
Nodes (11): driver, name, driver, internal, name, driver, name, networks (+3 more)

### Community 25 - "services"
Cohesion: 0.20
Nodes (9): command, container_name, image, networks, ports, restart, volumes, services (+1 more)

### Community 26 - "project-service/src/db.ts"
Cohesion: 0.22
Nodes (4): config, envSchema, db, pool

### Community 27 - "volumes"
Cohesion: 0.22
Nodes (9): name, name, name, name, volumes, kafka_data, minio_data, postgres_data (+1 more)

### Community 28 - "mod10.unit.test.ts"
Cohesion: 0.10
Nodes (17): RFC-7519, createGovernanceHttpServer(), dbStore, signToken(), verifyToken(), ApprovalGateRecord, BudgetExceededError, CircularTenancyError (+9 more)

### Community 29 - "LAUNCH UP — MASTER ARCHITECTURE, GLOBAL COMPLIANCE & BUSINESS ANALYST SUITE"
Cohesion: 0.25
Nodes (7): 1. Executive Vision & Multi-Tenant Business Architecture, 2. Token Reduction & Multi-Model Continuity via `Graphify`, 3. Curated Open-Source & Subscription Tool Stack, 4. Global Multi-Country Legal, Privacy & App Store Compliance Matrix, 5. Future Report Analysis Protocol (How You Work With Your Senior Architect & BA), LAUNCH UP — MASTER ARCHITECTURE, GLOBAL COMPLIANCE & BUSINESS ANALYST SUITE, Many-to-Many (M:N) Tenancy & Revenue Model

### Community 30 - "1. Module-by-Module Positive, Negative & Rare Test Cases"
Cohesion: 0.25
Nodes (7): 1. Module-by-Module Positive, Negative & Rare Test Cases, 2. The 5-Stage Post-Development Automated Testing Pipeline, LAUNCH UP — MASTER TEST-DRIVEN DEVELOPMENT (TDD) MATRIX & 5-STAGE PIPELINE, `MOD-01` & `MOD-02`: Lead Discovery, BA Intake & Legal Compliance Synthesizer, `MOD-03`, `MOD-04` & `MOD-05`: Responsive Web, Android App & Backend Factory, `MOD-06`, `MOD-07`, `MOD-08` & `MOD-09`: QA/SecOps, Canva, WhatsApp & SRE, `MOD-10`: M:N Tenancy, RBAC & FinOps Governance Core

### Community 31 - "governance-service/src/routes/index.ts"
Cohesion: 0.06
Nodes (43): 1. NEW AI MODEL BOOT SEQUENCE (EXECUTE IN THIS EXACT ORDER), 2. MANDATORY CHECKPOINT SAVE PROTOCOL (BEFORE TOKEN EXHAUSTION), 3. ACTIVE SPRINT & EXACT RESUME POINTER (UPDATED BY CODING AI), 4. MODULE COMPLETION & 5-STAGE TEST LEDGER, LAUNCH UP — UNIVERSAL AI MODEL CHECKPOINT & HANDOFF STATE, Required Actions Before Stopping:, `MOD-10`: M:N Tenancy, RBAC & FinOps Governance Core, config (+35 more)

### Community 32 - "ref_fastify"
Cohesion: 0.47
Nodes (3): fastify, FastifyRequest, JwtPayload

### Community 33 - "LAUNCH UP — SETUP GUIDE & EXACT STARTER PROMPT FOR CODING AI MODELS"
Cohesion: 0.50
Nodes (3): LAUNCH UP — SETUP GUIDE & EXACT STARTER PROMPT FOR CODING AI MODELS, Step 1: One-Time Folder & Graphify Setup on Your Machine, Step 2: Exact Copy-Paste Prompt for Any Coding AI Model

### Community 36 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution (+9 more)

### Community 37 - "web-admin"
Cohesion: 0.22
Nodes (9): VITE_API_BASE_URL, web-admin, container_name, depends_on, environment, networks, ports, restart (+1 more)

### Community 38 - "gateway"
Cohesion: 0.25
Nodes (8): container_name, depends_on, image, networks, ports, restart, volumes, gateway

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `services` connect `services` to `environment`, `minio`, `web-admin`, `gateway`, `environment`, `postgres`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.060198643410852716 - nodes in this community are weakly interconnected._
- **Why does `bcrypt` connect `auth-service/package.json` to `auth-service/src/routes/index.ts`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Should `environment` be split into smaller, more focused modules?**
  _Cohesion score 0.05764411027568922 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.tsx` to `package.json`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.050505050505050504 - nodes in this community are weakly interconnected._
- **Should `auth-service/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05333333333333334 - nodes in this community are weakly interconnected._