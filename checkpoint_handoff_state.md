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

- **Last Updated Timestamp:** `2026-11-13T20:36:00+05:30`
- **Last AI Model Used:** `Gemini 3.8 Flash (Antigravity)`
- **Active Module ID:** `STRICT RESTORATION OF ORIGINAL SLATE & INDIGO THEME + EXPANDABLE RIGHT DETAIL PANEL + GLOBAL TOP HEADER TAB HEADING`
- **Architecture Alignment:** Strictly reverted and locked visual theme to the original sleek dark/light Slate & Indigo Control Plane theme from commit `8c12cde`, while retaining the Global Top Header Tab Heading + Subtitle and the Expandable Right-Side Detail Panel:
  1. **Theme Reversion & Scoping Cleanup (`src/index.css`, `src/context/AppContext.tsx`, `src/App.tsx`):**
     - Fully removed all `:root[data-ui-style="prototype"]` overrides, prototype CSS variables (`--bg:#F4F5F7`, `--surf:#161D2F`, etc.), and `.chip` / `.btn-pri` / `.card-kpi` overrides.
     - Restored pure Tailwind Slate/Indigo styling with `@theme`, 5 user color palettes (Indigo, Cyan, Emerald, Amber, Rose), and clean dark/light/system mode switching.
     - Removed `uiThemeStyle` and prototype switching states from `AppContext.tsx`, `Header.tsx`, `Sidebar.tsx`, `SummaryMetricCard.tsx`, `SettingsTab.tsx`, `ClientsTab.tsx`, and `DashboardTab.tsx`.
  2. **Expandable / Collapsible Right-Side Detail Panel (`src/components/common/ExpandableRightDetailPanel.tsx`):**
     - Reusable `<ExpandableRightDetailPanel />` component styled 100% in Slate & Indigo (`bg-white dark:bg-slate-900/95 border-l border-slate-200 dark:border-slate-800`).
     - Includes integrated `[✕ / Collapse >]` button, collapsed vertical `Details` pill, and companion toolbar toggle button `<ExpandableDetailToggleButton />`.
     - Integrated across `ThreeZoneScreenLayout.tsx` for seamless contextual inspection across tabs.
  3. **Global Header Tab Heading + Subtitle (`src/components/layout/Header.tsx`, `src/constants/tabHeaders.ts`):**
     - Fixed `h-14` header bar with zero height increase.
     - Single-line title and subtitle with `truncate` on resize, ensuring search bar and user controls never wrap or misalign.
     - Hover tooltip (`title={tabMeta.subtitle}`) provides full subtitle context on all screen sizes.
  4. **Restored Full 15-Tab Sidebar (`src/components/layout/Sidebar.tsx`):**
     - Restored full 15 navigation destinations (`Dashboard`, `Clients`, `Projects`, `SLM Lab`, `Deployments`, `Templates`, `Connected Apps`, `Analytics`, `Team & Gates`, `Agent Swarm`, `Telemetry`, `Services`, `Workflows`, `Alerts`, `Settings`).
     - Theme-adaptive `<LaunchUpLogo size={34} />` and original Slate/Indigo active highlights.
  5. **Verification & Monorepo Test Suite:**
     - TypeScript `tsc --noEmit` exit 0 (0 errors).
     - Vite production build exit 0 (built in 2.30s).
     - Full monorepo test suite: **200/200 tests passing (100% pass rate)** across 60 suites.
     - Graphify AST updated: **2577 nodes, 4887 edges, 172 communities**.
- **Current TDD Stage:**
  - `[x] Stage 0: Test Stubs Generated` — 60 test suites across all 10 modules, Studio, Workspace Sprints 1–4, Gateway Verifier, 4-Layer Token Optimizer, and Template/Folder/Impact Adapter
  - `[x] Stage 1: Unit Tests Passing` — 113/113 PASS (82 MOD-01..MOD-10 + 17 Sprints 1–4 + 4 Custom API Gateway + 5 Token Optimizer + 5 Template/Folder/Impact `TFI-01..05`)
  - `[x] Stage 2: Integration & Contract Tests Passing` — 69/69 PASS (100% pass rate)
  - `[x] Stage 3: System & Security E2E Verification Passing` — 14/14 PASS (`tests/e2e/agency-full-lifecycle.system.test.ts`)
  - `[x] Stage 4: Cross-Module Performance & Concurrency` — 4/4 PASS (`STAGE4-CROSS-01..04`)
  - `[x] Stage 5: Graphify AST & Mesh Readiness Verified` — Graphify updated (`2577` nodes, `4887` edges, `172` communities)
  - `[x] Cross-Module Monorepo Regression` — 200/200 PASS across 60 test suites in 9.89s (100% pass rate)
  - `[x] Monorepo TypeScript & Build` — `tsc --noEmit` exit `0`; Vite production bundle built in `2.30s`
- **Exact Resume Pointer (Where the Next Step Starts):**
  - **Platform Milestone:** **Original Slate & Indigo Theme strictly restored; Expandable Right Detail Panel and Global Top Header Tab Heading + Subtitle preserved and locked; 200/200 tests passing; Graphify AST updated.**
  - **Next Step:** Continue standard feature work or tab refinements using the locked Slate & Indigo theme.
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
| **ORIGINAL SLATE & INDIGO THEME** | Sleek Control Plane Theme Locked, 15-Tab Nav Restored | YES | `N/A` | `N/A` | `VERIFIED` | `N/A` | `PASSED` | `100% LOCKED` |
| **EXPANDABLE RIGHT DETAIL PANEL** | Expandable/Collapsible Drawer & Toggle Button | YES | `N/A` | `N/A` | `VERIFIED` | `N/A` | `PASSED` | `100% COMPLETE` |
| **GLOBAL HEADER TAB TITLE & SUBTITLE** | Top Header Title + Subtitle & Tab Body Deduplication | YES | `N/A` | `N/A` | `VERIFIED` | `N/A` | `PASSED` | `100% COMPLETE` |