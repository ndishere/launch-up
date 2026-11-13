# LAUNCH UP — UNIVERSAL AI MODEL CHECKPOINT & HANDOFF STATE

> **ARCHITECTURAL GOVERNANCE:** Managed by Senior Development Architect & Lead Business Analyst.
> **CODING AGENT RULE:** DO NOT scan or read the entire repository. Follow the Boot Sequence in Section 1 and the Checkpoint Save Protocol in Section 2 to keep token consumption minimal across model switches.

---

## 1. NEW AI MODEL BOOT SEQUENCE (EXECUTE IN THIS EXACT ORDER)

When you (a coding AI model) are given this project folder, execute **ONLY** these 4 steps to onboard in under $1,500$ tokens:

1. **Read Current State:** Read **Section 3 ("Active Sprint & Exact Resume Pointer")** and **Section 4 ("Module Completion & 5-Stage Test Ledger")** of this file (`CHECKPOINT_STATE.md`).
2. **Load Structural Memory via Graphify (Zero Full-Repo Scanning):**
   - Read `graphify-out/GRAPH_REPORT.md` for high-level repository topology, god nodes, and module boundaries.
   - Run `graphify query "<ACTIVE_MODULE_ID>"` to load **only** the files and call-graph nodes belonging to the active module.
   - Run `graphify path <Upstream_Node> <Downstream_Node>` when checking dependencies across modules.
3. **Read the Locked I/O Contract & TDD Specification:**
   - Open `contracts/MODULE_IO_CONTRACTS.md` and locate `<ACTIVE_MODULE_ID>`. The Input JSON, Output JSON, and Error Codes are **immutable**—do not rename fields or alter types.
   - Open `tests/specs/MASTER_TDD_MATRIX.md` and locate the Positive, Negative, and Rare test scenarios for `<ACTIVE_MODULE_ID>`.
4. **Resume Execution via Strict Red-Green-Refactor TDD:**
   - Run the existing test suite for the active module first to observe the exact failing test where the previous AI model stopped.
   - Write only the code required to pass the current failing test and progress through the 5 Testing Stages.

---

## 2. MANDATORY CHECKPOINT SAVE PROTOCOL (BEFORE TOKEN EXHAUSTION)

You **MUST** stop writing feature code and execute a Checkpoint Save when **ANY** of the following triggers occur:
- **(A)** Your context window or session token usage reaches **$75\%$ capacity**.
- **(B)** You complete a testing stage (Stage 1: Unit, Stage 2: Integration, Stage 3: System E2E, Stage 4: Performance, or Stage 5: Graphify Smart Regression).
- **(C)** The human operator types `"SAVE CHECKPOINT"` or `"PAUSE"`.

### Required Actions Before Stopping:
1. Ensure all modified files are saved in a clean, syntax-valid state (or committed to a `wip/<module_id>` Git branch).
2. Run `graphify .` in the project root so `graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md` are updated with your latest AST changes.
3. Run the test suite for the active module and record the exact pass/fail counts.
4. Overwrite **Section 3** and **Section 4** below with the exact file path, function/class name, line number, and next failing test ID so the next AI model can resume seamlessly.

---

## 3. ACTIVE SPRINT & EXACT RESUME POINTER (UPDATED BY CODING AI)

- **Last Updated Timestamp:** `2026-11-13T21:30:00+05:30`
- **Last AI Model Used:** `Gemini 3.8 Flash (Antigravity)`
- **Active Module ID:** `PHASE 2A: 3-SECTION STANDARDIZATION & PLAIN-ENGLISH INSPECTORS (DASHBOARD, CLIENTS, PROJECTS, SERVICES)`
- **Architecture Alignment:** Successfully standardized the canonical 3-Section Layout (Row 1: Unified 5-Cell Summary Bar | Row 2, Column 1: Main Content Workspace | Row 2, Column 2: Dynamic Expandable/Collapsible Right Details Panel) across our first 4 core tabs while strictly preserving our Slate & Indigo Launch Up theme, Global Header Heading + Subtitle (`...` truncation), and zero horizontal overflow:
  1. **Dashboard Command Center (`src/components/tabs/DashboardTab.tsx`):**
     - Row 1: Unified 5-cell summary bar with `19px` primary values. Clicking the 5th summary card (*Agency Health*) opens the live microservice health telemetry in Column 2.
     - Row 2 Column 1: Top toolbar `<ExpandableDetailToggleButton>`, follow-ups list, funnel metrics, approvals inbox, and active client table with subtle indigo selection highlight ring (`ring-2 ring-indigo-500/80 bg-indigo-50/20 dark:bg-indigo-950/20`).
     - Row 2 Column 2: Rich inspector displaying live status of all 10 microservices (:8004..:8013) with pulse button, visual approval preview with feedback textarea and 1-click **`Approve`** / **`Request Changes`** buttons, and client follow-up actions.
  2. **Clients Funnel & Accounts (`src/components/tabs/ClientsTab.tsx`):**
     - Row 1: 5-cell summary bar (Active Retainers, Pipeline Leads, Monthly Retainers, Avg Retainer, Fast-Track Protos).
     - Row 2 Column 1: Top toolbar with `Generate Lead (Scan)`, `+ Add Client`, and `<ExpandableDetailToggleButton>`. Kanban and Table views with subtle indigo selection ring.
     - Row 2 Column 2: Contextual inspector showing client contact details, linked projects with quick `Create Project for Client` action, Canva pitch proposal preview card with interactive link, and action buttons (`Create Project for Client`, `Send Proposal (WhatsApp/Email)`, `Open Multi-Viewport Preview`).
  3. **Projects SDLC & Studios (`src/components/tabs/ProjectsTab.tsx`):**
     - Converted to `ThreeZoneScreenLayout`.
     - Row 1: 5-cell summary bar (Total Projects, Live Production, Build Swarm, Container Sync, Rollback Guard).
     - Row 2 Column 1: Top toolbar with `Pull Project from Folder`, `+ New Project`, and `<ExpandableDetailToggleButton>`. Autonomous App Factory strip (MOD-02..05), filter toolbar, and minimalist project cards with selection highlight.
     - Row 2 Column 2: Selected project inspector showing 5-step build checklist (*Plan -> Design -> Build -> Quality Check -> Live*), FinOps unit economics profit summary ($2,500 retainer, ~$14.20 infra/LLM cost, 99.4% margin), technical specs (Server Target, Branch, Port, Health), and action buttons (**`Open Full Workspace`**, **`Approve Go-Live (Gate 3)`**, **`Multi-Viewport Preview`**).
  4. **Services Engine (`src/components/tabs/ServicesTab.tsx`, `MarketingEngineTab.tsx`, `AlertsTab.tsx`):**
     - **Marketing & WhatsApp (`MarketingEngineTab.tsx`):** 2-column layout with `<ExpandableRightDetailPanel>` and toolbar toggle. Clicking any 30-day social calendar item or campaign card opens Column 2 with visual post preview, EU AI Act Art. 50 disclosure status, and 1-click **`Approve Campaign (Gate 4)`** button.
     - **Website Health & Auto-Fix (`AlertsTab.tsx`):** 2-column layout with `<ExpandableRightDetailPanel>` and toolbar toggle. Clicking any alert opens Column 2 showing plain-English Root Cause Analysis (RCA), Graphify AST impact node (`services/rates.py:42`), sandbox regression test verification status, and 1-click **`Approve Quick Fix (Gate 5)`** button.
  5. **Verification & Monorepo Test Suite:**
     - TypeScript `tsc --noEmit` exit 0 (0 errors).
     - Vite production build exit 0 (built in 1.48s).
     - Full monorepo test suite: **200/200 tests passing (100% pass rate)** across 60 suites.
     - Graphify AST updated: **2,587 nodes, 4,942 edges, 164 communities**.
- **Current TDD Stage:**
  - `[x] Stage 0: Test Stubs Generated` — 60 test suites across all 10 modules, Studio, Workspace Sprints 1–4, Gateway Verifier, 4-Layer Token Optimizer, and Template/Folder/Impact Adapter
  - `[x] Stage 1: Unit Tests Passing` — 113/113 PASS (82 MOD-01..MOD-10 + 17 Sprints 1–4 + 4 Custom API Gateway + 5 Token Optimizer + 5 Template/Folder/Impact `TFI-01..05`)
  - `[x] Stage 2: Integration & Contract Tests Passing` — 69/69 PASS (100% pass rate)
  - `[x] Stage 3: System & Security E2E Verification Passing` — 14/14 PASS (`tests/e2e/agency-full-lifecycle.system.test.ts`)
  - `[x] Stage 4: Cross-Module Performance & Concurrency` — 4/4 PASS (`STAGE4-CROSS-01..04`)
  - `[x] Stage 5: Graphify AST & Mesh Readiness Verified` — Graphify updated (`2587` nodes, `4942` edges, `164` communities)
  - `[x] Cross-Module Monorepo Regression` — 200/200 PASS across 60 test suites in 11.66s (100% pass rate)
  - `[x] Monorepo TypeScript & Build` — `tsc --noEmit` exit `0`; Vite production bundle built in `1.48s`
- **Exact Resume Pointer (Where the Next Step Starts):**
  - **Platform Milestone:** **Phase 2A Standard 3-Section Layout & Plain-English Inspector Views COMPLETE across Dashboard, Clients, Projects, and Services with 0 regressions, 200/200 tests passing, and Graphify AST updated.**
  - **Next Step:** Phase 2B (Standardize 3-Section Layout and Contextual Inspectors across remaining tabs: Tools/Apps, AI Workshop, Analytics, Teams, Settings).
- **Known Blockers / Unresolved Errors:**
  - `None. All 200 tests passing (100%), TypeScript 0 errors, Vite production build clean.`

---

## 4. MODULE COMPLETION & 5-STAGE TEST LEDGER

| Module ID | Module Name | Contract Locked | Stage 1: Unit | Stage 2: Integration | Stage 3: System E2E | Stage 4: Perf | Stage 5: Regression | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **STUDIO** | 4 Interactive Studio Screens + Persistence | YES | `N/A` | `N/A` | `VERIFIED` | `N/A` | `PASSED` | `COMPLETE` |
| **SYSTEM** | Master Full Agency Lifecycle & Concurrency | YES | `N/A` | `N/A` | `14/14 (100%)` | `4/4 (100%)` | `PASSED (11/11 MESH)` | `COMPLETE` |
| **MOD-10** | M:N Tenancy, RBAC & FinOps Core | YES | `9/9 (100%)` | `8/8 (100%)` | `5/5 (100%)` | `2/2 (100%)` | `PASSED` | `COMPLETE` |
| **MOD-01** | Lead Discovery & Canva Pitch Engine | YES | `8/8 (100%)` | `5/5 (100%)` | `VERIFIED` | `VERIFIED` | `PASSED` | `COMPLETE` |
| **MOD-02** | BA Intake & Scope Synthesizer | YES | `7/7 (100%)` | `6/6 (100%)` | `VERIFIED` | `VERIFIED` | `PASSED` | `COMPLETE` |
| **MOD-03** | Responsive Web & Landing Builder | YES | `8/8 (100%)` | `6/6 (100%)` | `VERIFIED` | `VERIFIED` | `PASSED` | `COMPLETE` |
| **MOD-04** | Android Mobile App Builder | YES | `8/8 (100%)` | `6/6 (100%)` | `VERIFIED` | `VERIFIED` | `PASSED` | `COMPLETE` |
| **MOD-05** | Backend API & RLS Engine | YES | `8/8 (100%)` | `8/8 (100%)` | `VERIFIED` | `VERIFIED` | `PASSED` | `COMPLETE` |
| **MOD-06** | Autonomous QA & SecOps Verifier | YES | `7/7 (100%)` | `6/6 (100%)` | `VERIFIED` | `VERIFIED` | `PASSED` | `COMPLETE` |
| **MOD-07** | Canva Pro Digital Marketing Engine | YES | `8/8 (100%)` | `5/5 (100%)` | `VERIFIED` | `VERIFIED` | `PASSED` | `COMPLETE` |
| **MOD-08** | WhatsApp Marketing & CRM Engine | YES | `9/9 (100%)` | `6/6 (100%)` | `VERIFIED` | `VERIFIED` | `PASSED` | `COMPLETE` |
| **MOD-09** | Autonomous SRE & Self-Healing Ops | YES | `9/9 (100%)` | `7/7 (100%)` | `VERIFIED` | `VERIFIED` | `PASSED` | `COMPLETE` |
| **WORKSPACE (Sprints 1–4)** | Command Center, Sanitizer, FinOps & Git/Docker | YES | `17/17 (100%)` | `N/A` | `VERIFIED` | `N/A` | `PASSED` | `100% COMPLETE` |
| **API GATEWAY (MOD-10)** | Custom AI / API Verifier & Swarm Matrix | YES | `4/4 (100%)` | `Live Route` | `VERIFIED` | `N/A` | `PASSED` | `COMPLETE` |
| **TOKEN OPTIMIZER (3050)** | 4-Layer Compression, Ollama Discovery & Delta | YES | `5/5 (100%)` | `Live Route` | `VERIFIED` | `N/A` | `PASSED` | `COMPLETE` |
| **EXTERNAL ADAPTER + IMPACT** | Drop-In Templates, Folder Pull, Graphify Guard & Weights | YES | `5/5 (100%)` | `Live Route` | `VERIFIED` | `N/A` | `PASSED` | `COMPLETE` |
| **9-TAB NAVIGATION CONSOLIDATION** | 9 Clean Primary Tabs + Sub-View Switchers | YES | `N/A` | `N/A` | `VERIFIED` | `N/A` | `PASSED` | `100% COMPLETE` |
| **PLAIN-ENGLISH DOMAIN LABELS** | Proposal, Plan, Go-Live, Campaign & Quick Fix Approvals | YES | `N/A` | `N/A` | `VERIFIED` | `N/A` | `PASSED` | `100% COMPLETE` |
| **EXPANDABLE RIGHT DETAIL PANEL** | Expandable/Collapsible Drawer & Toggle Button | YES | `N/A` | `N/A` | `VERIFIED` | `N/A` | `PASSED` | `100% COMPLETE` |
| **GLOBAL HEADER TAB TITLE & SUBTITLE** | Top Header Title + Subtitle & Tab Body Deduplication | YES | `N/A` | `N/A` | `VERIFIED` | `N/A` | `PASSED` | `100% COMPLETE` |