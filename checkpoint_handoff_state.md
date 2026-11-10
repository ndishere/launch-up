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

- **Last Updated Timestamp:** `2026-11-10T00:00:00Z`
- **Last AI Model Used:** `NONE (Initial Project Bootstrap)`
- **Active Module ID:** `MOD-10` *(M:N Tenancy, RBAC & FinOps Governance Core)*
- **Current TDD Stage:**
  - `[ ] Stage 0: Test Stubs Generated`
  - `[ ] Stage 1: Unit Tests Passing`
  - `[ ] Stage 2: Integration & Contract Tests Passing`
  - `[ ] Stage 3: System & Security E2E Passing`
  - `[ ] Stage 4: Performance & Load Tests Passing`
  - `[ ] Stage 5: Graphify Smart Regression Passing`
- **Files Modified in Last Session:**
  - `None (Initial Bootstrap)`
- **Exact Resume Pointer (Where the Next Model Starts):**
  - **Target File:** `apps/orchestrator-api/app/models/rbac.py`
  - **Target Function / Class:** `ProjectMembership`, `ClientProjectLink`, and `verify_principal_permission()`
  - **Next Failing Test ID to Pass:** `TEST-MOD10-POS-01` $\rightarrow$ `TEST-MOD10-RARE-03`
- **Known Blockers / Unresolved Errors:**
  - `None. Ready for Stage 0 test generation and Stage 1 implementation.`

---

## 4. MODULE COMPLETION & 5-STAGE TEST LEDGER

| Module ID | Module Name | Contract Locked | Stage 1: Unit | Stage 2: Integration | Stage 3: System E2E | Stage 4: Perf | Stage 5: Regression | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **MOD-10** | M:N Tenancy, RBAC & FinOps Core | YES | `0/12` | `0/8` | `0/4` | `0/2` | `N/A` | `IN_PROGRESS` |
| **MOD-01** | Lead Discovery & Canva Pitch Engine | YES | `0/10` | `0/6` | `0/3` | `0/2` | `Pending` | `QUEUED` |
| **MOD-02** | BA Intake & Scope Synthesizer | YES | `0/12` | `0/8` | `0/4` | `0/2` | `Pending` | `QUEUED` |
| **MOD-03** | Responsive Web & Landing Builder | YES | `0/10` | `0/6` | `0/5` | `0/3` | `Pending` | `QUEUED` |
| **MOD-04** | Android Mobile App Builder | YES | `0/10` | `0/6` | `0/4` | `0/2` | `Pending` | `QUEUED` |
| **MOD-05** | Backend API & RLS Engine | YES | `0/12` | `0/8` | `0/4` | `0/3` | `Pending` | `QUEUED` |
| **MOD-06** | Autonomous QA & SecOps Verifier | YES | `0/10` | `0/6` | `0/4` | `0/2` | `Pending` | `QUEUED` |
| **MOD-07** | Canva Pro Digital Marketing Engine | YES | `0/8` | `0/6` | `0/3` | `0/2` | `Pending` | `QUEUED` |
| **MOD-08** | WhatsApp Marketing & CRM Engine | YES | `0/10` | `0/6` | `0/4` | `0/2` | `Pending` | `QUEUED` |
| **MOD-09** | Autonomous SRE & Self-Healing Ops | YES | `0/10` | `0/6` | `0/3` | `0/2` | `Pending` | `QUEUED` |