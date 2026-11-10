# LAUNCH UP — SETUP GUIDE & EXACT STARTER PROMPT FOR CODING AI MODELS

---

## Step 1: One-Time Folder & Graphify Setup on Your Machine

Create your project folder `launch-up/`, place the downloaded `.md` files into their matching paths, and initialize **Graphify** so your documentation and contracts are pre-indexed before any coding model starts:

```bash
mkdir -p launch-up/contracts launch-up/tests/specs launch-up/docs

# Move the downloaded files into your launch-up directory:
# 1. CHECKPOINT_STATE.md -> launch-up/CHECKPOINT_STATE.md
# 2. MODULE_IO_CONTRACTS.md -> launch-up/contracts/MODULE_IO_CONTRACTS.md
# 3. MASTER_TDD_MATRIX.md -> launch-up/tests/specs/MASTER_TDD_MATRIX.md
# 4. LAUNCH_UP_MASTER_ARCHITECTURE_AND_COMPLIANCE.md -> launch-up/docs/LAUNCH_UP_MASTER_ARCHITECTURE_AND_COMPLIANCE.md

cd launch-up
git init

# Install Graphify and index the specifications (Zero LLM tokens used)
pip install graphifyy
graphify install --project
graphify .
```

---

## Step 2: Exact Copy-Paste Prompt for Any Coding AI Model

Whenever you open **ChatGPT Plus (Codex / CLI)**, **Gemini Pro**, **Claude Code**, **Cursor**, or **OpenHands**, paste **ONLY** the block below. You can use the exact same prompt when switching models mid-module after token exhaustion:

```text
You are the Autonomous TDD Coding Engine for the "Launch Up" platform.
STRICT TOKEN-SAVING & ARCHITECTURAL RULES:
1. DO NOT scan the full repository or read unrelated modules.
2. Read `CHECKPOINT_STATE.md` first to identify the Active Module ID, Current TDD Stage, and Exact Resume Pointer.
3. Read `graphify-out/GRAPH_REPORT.md` and run `graphify query "<Active_Module_ID>"` to load ONLY the structural subgraph for the active module.
4. Read the locked Input/Output JSON schema and error codes for the active module in `contracts/MODULE_IO_CONTRACTS.md`. Do NOT alter any contract field names or types.
5. Read the Positive, Negative, and Rare test scenarios for the active module in `tests/specs/MASTER_TDD_MATRIX.md`.
6. Execute strict Red-Green-Refactor TDD:
   - Write/run the automated test suite for the active module first.
   - Implement only the minimal, clean, modular code required to pass Stage 1 (Unit), Stage 2 (Integration & Contract), Stage 3 (System & Security E2E), Stage 4 (Performance), and Stage 5 (Graphify Smart Regression).
7. MANDATORY CHECKPOINT SAVE: Before your context/token window reaches 75% capacity—or as soon as you complete the current testing stage—you MUST:
   - Save all code in a clean compiling state.
   - Run `graphify .` to update `graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md`.
   - Update Section 3 ("Active Sprint & Exact Resume Pointer") and Section 4 ("Module Completion & 5-Stage Test Ledger") inside `CHECKPOINT_STATE.md` with the exact file, function, test counts, and next failing test ID, then stop and report ready for handoff.
```