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

- **Last Updated Timestamp:** `2026-11-13T17:37:00+05:30`
- **Last AI Model Used:** `Gemini 3.8 Flash (Antigravity)`
- **Active Module ID:** `GLOBAL TOP HEADER TAB HEADING + SUBTITLE REFINEMENT & ALL-TAB SIMPLIFICATION`
- **Architecture Alignment:** Moved Tab Heading and Subtitle into the Global Top Header (`src/components/layout/Header.tsx`) across all current and future tabs, replacing the `10/10 Services Live` pill:
  1. **Centralized Tab Metadata Registry (`src/constants/tabHeaders.ts`):** Created `TAB_HEADER_META: Record<string, { title: string; subtitle: string }>` covering all 27 tabs plus human-readable fallback generator `getTabHeaderMeta(tabId)` for future dynamic tabs.
  2. **Global Header Refinement (`src/components/layout/Header.tsx`):** Positioned active tab's Heading and Subtitle directly to the right of the sidebar toggle button within `flex flex-col justify-center min-w-0 flex-1 mr-4 overflow-hidden`. Strictly preserved existing header height (`h-[72px]` in prototype / `h-14` in classic). Heading styled with `truncate`, subtitle with `truncate` and `title={tabMeta.subtitle}` for hover tooltip, ensuring smooth `...` truncation on window resize without wrapping or pushing search/action buttons.
  3. **Removed Duplicate Standalone Headings Across All Tabs:**
     - `ThreeZoneScreenLayout.tsx`: Retained action buttons and badges in a compact toolbar above Section 1 without redundant `<h1>` / `<p>`.
     - `ScreenAnalyticsHeader.tsx`: Preserved action buttons and badges above the 5-cell summary bar with optional title/description props for 100% backward compatibility.
     - Standalone tabs (`AgentCompanyTab.tsx`, `AlertsTab.tsx`, `AnalyticsTab.tsx`, `BillingTab.tsx`, `IntegrationsTab.tsx`, `MarketingEngineTab.tsx`, `SystemDesignTab.tsx`, `TemplatesTab.tsx`): Cleaned up duplicate headers while preserving action buttons (`+ Intake Business`, `Mark All as Read`, `Plans`, `Scan *.launchup.json`, `+ Launch Campaign`, sub-tabs, etc.).
  4. **Verification & Monorepo Test Suite:**
     - TypeScript `tsc --noEmit` exit 0 (0 errors).
     - Vite production build exit 0 (built in 1.31s).
     - Full monorepo test suite: **200/200 tests passing (100% pass rate)** across 60 suites.
- **Current TDD Stage:**
  - `[x] Stage 0: Test Stubs Generated` — 60 test suites across all 10 modules, Studio, Workspace Sprints 1–4, Gateway Verifier, 4-Layer Token Optimizer, and Template/Folder/Impact Adapter
  - `[x] Stage 1: Unit Tests Passing` — 113/113 PASS (82 MOD-01..MOD-10 + 17 Sprints 1–4 + 4 Custom API Gateway + 5 Token Optimizer + 5 Template/Folder/Impact `TFI-01..05`)
  - `[x] Stage 2: Integration & Contract Tests Passing` — 69/69 PASS (100% pass rate)
  - `[x] Stage 3: System & Security E2E Verification Passing` — 14/14 PASS (`tests/e2e/agency-full-lifecycle.system.test.ts`)
  - `[x] Stage 4: Cross-Module Performance & Concurrency` — 4/4 PASS (`STAGE4-CROSS-01..04`)
  - `[x] Stage 5: Graphify AST & Mesh Readiness Verified` — Graphify updated
  - `[x] Cross-Module Monorepo Regression` — 200/200 PASS across 60 test suites in 9.75s (100% pass rate)
  - `[x] Monorepo TypeScript & Build` — `tsc --noEmit` exit `0`; Vite production bundle built in `1.31s`
- **Exact Resume Pointer (Where the Next Step Starts):**
  - **Platform Milestone:** **Global Top Header Heading & Subtitle integration COMPLETE across all current and future tabs with 0 regressions and 200/200 tests passing.**
  - **Next Step:** Phase 2 UI Simplification (apply 3-section layout and prototype cards to remaining tabs).
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
| **UI THEME & 3-SECTION LAYOUT** | Prototype Theme, 72px Header, 9-Tab Nav & 3-Zone Screens | YES | `N/A` | `N/A` | `VERIFIED` | `N/A` | `PASSED` | `PHASE 1 COMPLETE` |
| **GLOBAL HEADER TAB TITLE & SUBTITLE** | Top Header Title + Subtitle & Tab Body Deduplication | YES | `N/A` | `N/A` | `VERIFIED` | `N/A` | `PASSED` | `100% COMPLETE` |