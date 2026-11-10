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

- **Last Updated Timestamp:** `2026-11-10T23:02:00+05:30`
- **Last AI Model Used:** `Gemini 3.8 Flash (Antigravity)`
- **Active Module ID:** `MOD-03` *(Responsive Web & Landing Builder)* -> Queue: `MOD-04` *(Android Mobile App Builder)*
- **Architecture Alignment:** Fully implemented as `services/web-builder-service` (Node.js 22 / Fastify 5), strictly adhering to all locked schemas in `contracts/module_input_output_contracts.md` (MOD-03).
- **Current TDD Stage for MOD-03:**
  - `[x] Stage 0: Test Stubs Generated` — `tests/web-builder-service/mod03.unit.test.ts`, `tests/web-builder-service/mod03.integration.test.ts`
  - `[x] Stage 1: Unit Tests Passing` — 8/8 PASS (100% pass rate)
  - `[x] Stage 2: Integration & Contract Tests Passing` — 6/6 PASS (100% pass rate)
  - `[x] Cross-Module Monorepo Regression Passing` — 64/64 PASS across 22 test suites (100% pass rate)
- **Test Execution Summary:**
  - **MOD-10 (Governance Core):** 24/24 tests passed across Unit, Integration, System, and Performance stages.
  - **MOD-01 (Lead Discovery & Pitch Engine):** 13/13 tests passed (8 Unit + 5 Integration/Contract).
  - **MOD-02 (BA Intake & Scope Synthesizer):** 13/13 tests passed (7 Unit + 6 Integration/Contract).
  - **MOD-03 (Responsive Web & Landing Builder):** 14/14 tests passed (8 Unit + 6 Integration/Contract).
  - **Total Monorepo Tests Passing:** 64/64 passed (0 failures).
- **Verified MOD-03 Contracts & Deterministic Error Codes:**
  - `Mod03WebBuildRequest` -> `Mod03WebBuildResponse`: Verified synthesis of `git_commit_sha`, `staging_preview_url`, `viewports_verified` (`["375px", "768px", "1280px", "1920px"]`), `rtl_verified`, `cookie_consent_banner_active`, and `graphify_updated`.
  - `422 ERR_VIEWPORT_OVERFLOW`: Verified horizontal overflow detection on 375px mobile viewport when arbitrary hardcoded widths/min-widths exceed 375px.
  - `500 ERR_BUILD_COMPILE`: Verified compiler/template error detection on invalid templates or unclosed JSX syntax.
  - `504 ERR_SANDBOX_TIMEOUT`: Verified sandbox execution timeout handling and graceful error response.
  - `RTL & Multilingual Support`: Verified RTL directionality (`dir="rtl"`, logical start/end properties) and German compound word hyphenation/wrapping (`break-words`).
  - `Cookie Consent Banner`: Verified dynamic activation when `compliance_flags` contains `GDPR_EU` or `DPDP_INDIA`.
- **Exact Resume Pointer (Where the Next Step Starts):**
  - **Target Module:** `MOD-04` *(Android Mobile App Builder)*.
- **Known Blockers / Unresolved Errors:**
  - `None. MOD-03 service implemented with 14/14 passing tests. Monorepo total 64/64 tests passing. Graphify knowledge graph updated to 1155 nodes, 2011 edges, 49 communities.`

---

## 4. MODULE COMPLETION & 5-STAGE TEST LEDGER

| Module ID | Module Name | Contract Locked | Stage 1: Unit | Stage 2: Integration | Stage 3: System E2E | Stage 4: Perf | Stage 5: Regression | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **MOD-10** | M:N Tenancy, RBAC & FinOps Core | YES | `9/9 (100%)` | `8/8 (100%)` | `5/5 (100%)` | `2/2 (100%)` | `PASSED` | `COMPLETE` |
| **MOD-01** | Lead Discovery & Canva Pitch Engine | YES | `8/8 (100%)` | `5/5 (100%)` | `N/A` | `N/A` | `PASSED` | `COMPLETE` |
| **MOD-02** | BA Intake & Scope Synthesizer | YES | `7/7 (100%)` | `6/6 (100%)` | `N/A` | `N/A` | `PASSED` | `COMPLETE` |
| **MOD-03** | Responsive Web & Landing Builder | YES | `8/8 (100%)` | `6/6 (100%)` | `N/A` | `N/A` | `PASSED` | `COMPLETE` |
| **MOD-04** | Android Mobile App Builder | YES | `0/10` | `0/6` | `0/4` | `0/2` | `Pending` | `QUEUED` |
| **MOD-05** | Backend API & RLS Engine | YES | `0/12` | `0/8` | `0/4` | `0/3` | `Pending` | `QUEUED` |
| **MOD-06** | Autonomous QA & SecOps Verifier | YES | `0/10` | `0/6` | `0/4` | `0/2` | `Pending` | `QUEUED` |
| **MOD-07** | Canva Pro Digital Marketing Engine | YES | `0/8` | `0/6` | `0/3` | `0/2` | `Pending` | `QUEUED` |
| **MOD-08** | WhatsApp Marketing & CRM Engine | YES | `0/10` | `0/6` | `0/4` | `0/2` | `Pending` | `QUEUED` |
| **MOD-09** | Autonomous SRE & Self-Healing Ops | YES | `0/10` | `0/6` | `0/3` | `0/2` | `Pending` | `QUEUED` |