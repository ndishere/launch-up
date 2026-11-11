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

- **Last Updated Timestamp:** `2026-11-11T13:48:20+05:30`
- **Last AI Model Used:** `Gemini 3.8 Flash (Antigravity)`
- **Active Module ID:** `SPRINT 2 COMPLETE — SMART REUSABILITY & CODE SANITIZER ENGINE`
- **Architecture Alignment:** Built Sprint 2 reusable module matching, security/PII sanitization, and FinOps savings visibility cleanly atop Sprint 1 (`src/lib/`, `src/components/workspace/`, `src/types/index.ts`):
  1. **Code Sanitizer Engine (`src/lib/code-sanitizer.ts`):** Deterministic, idempotent sanitizer inspecting code templates and snippets before reuse. Scrubs **PII** (emails, phone numbers, author/owner names, physical street addresses), **Secrets & Connection URIs** (PostgreSQL/Mongo/Redis/MySQL/AMQP URIs, AWS `AKIA...` keys, `sk_live_`/`ghp_`/`AIza`/`xox` keys, `Bearer` tokens, hardcoded env secret assignments), and **Proprietary / Rigid UI Constraints** (hex colors, `rgb`/`rgba`, fixed `font-family`/`fontFamily`, `!important`, fixed desktop `px` widths, extreme `z-index` overrides). Computes `riskScoreBefore`, `riskScoreAfter`, and `isSafe`.
  2. **Smart Template Matcher & Reusability Calculator (`src/lib/template-matcher.ts`):** Evaluates project PRD blueprints and `ProjectType` against canonical golden templates (`golden-web-landing`, `golden-mobile-android`, `golden-backend-api`) and verified sanitized components (`sanitized-gdpr-dpdp-consent`, `sanitized-rls-tenant-guard`, `sanitized-whatsapp-crm-bridge`), computing match scores, avoided token counts, reusability `%`, and USD savings.
  3. **FinOps & Workspace Integration (`src/components/workspace/FinOpsAndGitView.tsx`, `workspaceDefaults.ts`, `ProjectWorkspaceModal.tsx`):** Extended `ProjectFinOpsState` and `calculateProjectUnitEconomics()`, hydrated reusability + sanitization metrics on workspace creation and PRD updates, surfaced savings in the workspace 5-cell summary bar and FinOps breakdown, and added interactive Template Matcher + Code Sanitizer inspector controls.
- **Current TDD Stage:**
  - `[x] Stage 0: Test Stubs Generated` — 56 test suites across all 10 modules, Sprint 1 Workspace, Sprint 2 Sanitizer/Reusability, and cross-module E2E
  - `[x] Stage 1: Unit Tests Passing` — 90/90 PASS (82 MOD-01..MOD-10 + 3 Sprint 1 Workspace + 5 Sprint 2 Sanitizer/Reusability unit tests in `tests/workspace/sprint2-sanitizer.unit.test.ts`)
  - `[x] Stage 2: Integration & Contract Tests Passing` — 69/69 PASS (100% pass rate)
  - `[x] Stage 3: System & Security E2E Verification Passing` — 14/14 PASS (`tests/e2e/agency-full-lifecycle.system.test.ts`)
  - `[x] Stage 4: Cross-Module Performance & Concurrency Passing` — 4/4 PASS (`tests/e2e/agency-concurrency.perf.test.ts`)
  - `[x] Stage 5: Graphify AST & Mesh Readiness Verified` — Graphify updated (`1882` nodes, `3623` edges, `96` communities)
  - `[x] Cross-Module Monorepo Regression Passing` — 177/177 PASS across 56 test suites in 6.07s (100% pass rate)
  - `[x] Monorepo TypeScript & Build` — `tsc --noEmit` exits `0`; Vite production bundle built in `1.04s`
- **Exact Resume Pointer (Where the Next Step Starts):**
  - **Platform Milestone:** **Sprint 2 Smart Reusability & Code Sanitizer Engine COMPLETE (177/177 tests passing, 0 TS errors).**
  - **Next Step:** Sprint 3 live WebSocket/SSE agent execution streaming or Docker multi-container production rollout.
- **Known Blockers / Unresolved Errors:**
  - `None. 177/177 tests passing across 56 suites, 0 TypeScript errors, clean Vite build. Graphify updated to 1882 nodes, 3623 edges, 96 communities.`

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