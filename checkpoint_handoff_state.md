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

- **Last Updated Timestamp:** `2026-11-11T13:25:15+05:30`
- **Last AI Model Used:** `Gemini 3.8 Flash (Antigravity)`
- **Active Module ID:** `SPRINT 1 COMPLETE — PROJECT COMMAND CENTER & HIERARCHICAL AGENT SWARM WORKSPACE`
- **Architecture Alignment:** Built Sprint 1 autonomous software factory workspace (`src/components/workspace/`), unified favicon sync (`public/favicon.svg`), and full M:N `localStorage` persistence (`src/context/AppContext.tsx`):
  1. **Immersive Project Command Center (`src/components/workspace/ProjectWorkspaceModal.tsx`, `BuildAreaView.tsx`, `SwarmAndModelsView.tsx`, `FinOpsAndGitView.tsx`, `workspaceDefaults.ts`):** Triggered automatically when clicking any project (`ProjectsTab.tsx`, `ClientDetailDrawer.tsx`, `CommandPalette.tsx`, `DashboardTab.tsx`) or finishing `CreateProjectModal.tsx`. Includes all 6 top-level workspace tabs:
     - **`Build Area`:** 7-stage Hierarchical Agent Swarm (`CEO Agent -> Tech Architect -> Design Team -> Parallel Coding Agents -> Testing Agents -> Tech Manager Integration -> UAT / Deployment`), `"Start Autonomous Build"` runner, live agent reasoning logs, editable PRD/TDD/Design Theme blueprints, and interactive `GDPR_EU`, `DPDP_INDIA`, `CCPA_US` governance checklists.
     - **`n8n Workflows`:** Project-scoped embedded `<N8nWorkflowsTab />` synced to `n8nGraphs`.
     - **`Agent Swarm`:** Real-time virtual agent allocation, active task queue dispatch, token budget bars, and branch assignments.
     - **`AI Models`:** Tiered model routing selectors (Gemini Flash / Claude Sonnet / Gemini Pro / GPT Mini), Local Edge SLM FinOps fallback toggle, and determinism temperature slider.
     - **`FinOps & Unit Economics`:** Live calculator tracking Client Contract Value, estimated vs actual LLM spend, container hosting hours, agent compute minutes, manual expense CRUD ledger, Net Gross Profit (`$`), and Gross Margin (`%`).
     - **`Git & Docker Staging`:** 4-stage isolated branch promotion visualizer (`feature/dev -> feature/testing -> feature/uat -> feature/production`) with SHA tracking + Docker Compose status & YAML preview.
  2. **M:N Workspace Persistence (`src/context/AppContext.tsx` & `src/types/index.ts`):** `projectWorkspaces` persisted to `localStorage` (`launchup_state_v1_projectWorkspaces`), automatically hydrated from M:N `clientIds` retainer values, and reset cleanly via `resetDemoState()`.
  3. **Theme-Adaptive SVG Favicon (`public/favicon.svg`, `index.html`, `src/components/common/LaunchUpLogo.tsx`):** Added rounded ascend prism favicon synced live across Light/Dark/System themes and custom color palettes.
- **Current TDD Stage:**
  - `[x] Stage 0: Test Stubs Generated` — 55 test suites across all 10 modules, Sprint 1 Workspace, and cross-module E2E
  - `[x] Stage 1: Unit Tests Passing` — 85/85 PASS (82 MOD-01..MOD-10 + 3 Sprint 1 Workspace unit tests in `tests/workspace/sprint1-workspace.unit.test.ts`)
  - `[x] Stage 2: Integration & Contract Tests Passing` — 69/69 PASS (100% pass rate)
  - `[x] Stage 3: System & Security E2E Verification Passing` — 14/14 PASS (`tests/e2e/agency-full-lifecycle.system.test.ts`)
  - `[x] Stage 4: Cross-Module Performance & Concurrency Passing` — 4/4 PASS (`tests/e2e/agency-concurrency.perf.test.ts`)
  - `[x] Stage 5: Graphify AST & Mesh Readiness Verified` — Graphify updated (`1859` nodes, `3553` edges, `95` communities)
  - `[x] Cross-Module Monorepo Regression Passing` — 172/172 PASS across 55 test suites in 5.30s (100% pass rate)
  - `[x] Monorepo TypeScript & Build` — `tsc --noEmit` exits `0`; Vite production bundle built in `720ms`
- **Exact Resume Pointer (Where the Next Step Starts):**
  - **Platform Milestone:** **Sprint 1 Project Command Center & Hierarchical Swarm Workspace COMPLETE (172/172 tests passing, 0 TS errors).**
  - **Next Step:** Sprint 2 live WebSocket/SSE agent execution streaming or Docker multi-container production rollout.
- **Known Blockers / Unresolved Errors:**
  - `None. 172/172 tests passing across 55 suites, 0 TypeScript errors, clean Vite build. Graphify updated to 1859 nodes, 3553 edges, 95 communities.`

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