# LAUNCH UP — MASTER TEST-DRIVEN DEVELOPMENT (TDD) MATRIX & 5-STAGE PIPELINE

> **CODING AI MANDATE:** You must write the automated test cases for a module **before** writing its implementation code (Red $\rightarrow$ Green $\rightarrow$ Refactor). Every module must pass Positive, Negative, and Rare/Edge scenarios across all 5 Testing Stages before updating `CHECKPOINT_STATE.md`.

---

## 1. Module-by-Module Positive, Negative & Rare Test Cases

### `MOD-10`: M:N Tenancy, RBAC & FinOps Governance Core
* **Positive Scenarios (Happy Path):**
  * `TEST-MOD10-POS-01`: Create $1$ Client linked to $3$ Projects (`PRIMARY_OWNER`) and verify the `CLIENT_APPROVER` user can read and approve gates across all $3$ projects.
  * `TEST-MOD10-POS-02`: Link $2$ Clients (`PRIMARY_OWNER` at $60\%$ billing share, `CO_OWNER` at $40\%$ share) to $1$ shared Project and verify split-billing ledger accuracy and scoped visibility.
  * `TEST-MOD10-POS-03`: Verify an `AI_AGENT` principal (`AGENT_MARKETER`) receives a valid scoped JWT permitting `marketing:draft` while blocking `code:write`.
* **Negative Scenarios (Security & Boundary Checks):**
  * `TEST-MOD10-NEG-01`: `AI_AGENT` principal attempts to call `POST /api/v1/gates/{id}/decide` to self-approve a human gate $\rightarrow$ Must reject with `403 ERR_RBAC_DENIED`.
  * `TEST-MOD10-NEG-02`: Authenticated user from `Client_A` attempts to query `Project_B` (owned solely by `Client_B`) via direct UUID parameter tampering $\rightarrow$ PostgreSQL RLS must return $0$ rows and `403 ERR_TENANT_MISMATCH`.
  * `TEST-MOD10-NEG-03`: Agent requests a Tier-1 LLM call when `tokens_spent_usd` is at $\$25.00 / \$25.00$ $\rightarrow$ Must block call and return `402 ERR_BUDGET_EXCEEDED`.
* **Rare / Edge / Chaos Scenarios:**
  * `TEST-MOD10-RARE-01` *(Concurrent Approval Race Condition)*: Two `CLIENT_APPROVER` principals on a co-owned project submit `APPROVED` and `REVISION_REQUESTED` on the exact same `gate_id` within $5\text{ ms}$ $\rightarrow$ PostgreSQL `SELECT ... FOR UPDATE` row lock must commit the first and reject the second with `409 Conflict` without corrupting LangGraph checkpoint state.
  * `TEST-MOD10-RARE-02` *(Mid-Session Role Revocation)*: A partner agency's `AGENCY_PARTNER` membership is deleted while their JWT still has $14$ minutes of TTL remaining $\rightarrow$ RLS database session policy must block access on the very next query.
  * `TEST-MOD10-RARE-03` *(Circular Agency Hierarchy)*: Client A adds Client B as a sub-vendor on Project X while Client B already lists Client A as a sub-vendor on Project X $\rightarrow$ Must reject with `422 ERR_CIRCULAR_TENANCY`.

---

### `MOD-01` & `MOD-02`: Lead Discovery, BA Intake & Legal Compliance Synthesizer
* **Positive Scenarios:**
  * `TEST-MOD01-POS-01`: Audit a prospect URL, detect missing mobile app and slow Lighthouse score, autofill Canva Pro proposal template, and create Gate 1 (`OUTREACH_PITCH`).
  * `TEST-MOD02-POS-01`: Given an intake transcript for a business operating in India, Germany, and California, generate a valid `ClientProjectPRD`, SQL migration with RLS, and OpenAPI 3.1 YAML with `DPDP_INDIA`, `GDPR_EU`, and `CCPA_US` flags enabled.
* **Negative Scenarios:**
  * `TEST-MOD01-NEG-01`: Prospect phone or email exists on the suppression / Do-Not-Contact (DNC) ledger $\rightarrow$ Abort lead generation with `422 ERR_DNC_LIST_BLOCKED`.
  * `TEST-MOD02-NEG-01`: LLM emits malformed OpenAPI YAML or SQL syntax errors $\rightarrow$ Pydantic schema validator catches error and triggers self-correction before creating Gate 2.
* **Rare / Edge Scenarios:**
  * `TEST-MOD02-RARE-01` *(Contradictory Co-Owner Requirements)*: Co-Owner A specifies "Guest checkout without login" while Co-Owner B specifies "Mandatory OTP login before viewing catalog" $\rightarrow$ BA Agent detects semantic conflict, emits `409 ERR_AMBIGUOUS_SCOPE`, and surfaces a side-by-side conflict resolution card in Gate 2.
  * `TEST-MOD02-RARE-02` *(Multi-Day Interrupted Onboarding)*: Client closes browser mid-interview and replies $72$ hours later via WhatsApp $\rightarrow$ LangGraph `PostgresSaver` resumes the exact interview state with zero lost context.

---

### `MOD-03`, `MOD-04` & `MOD-05`: Responsive Web, Android App & Backend Factory
* **Positive Scenarios:**
  * `TEST-MOD03-POS-01`: Clone `golden-web-landing`, inject custom pages and GA4 tag, and verify zero horizontal overflow across `375px`, `768px`, `1280px`, and `1920px` viewports.
  * `TEST-MOD04-POS-01`: Clone `golden-mobile-android`, wire OpenAPI client, compile signed `.apk`/`.aab`, and verify in-app Account Deletion screen + Google Play Data Safety CSV exist.
  * `TEST-MOD05-POS-01`: Apply SQL migrations and verify $100\%$ of tenant tables have `ROW LEVEL SECURITY` enabled and `/api/v1/privacy/me/export` + `/api/v1/privacy/me/erase` endpoints work.
* **Negative Scenarios:**
  * `TEST-MOD03-NEG-01`: Generated CSS causes horizontal overflow (`scrollWidth > innerWidth`) on a `375px` mobile screen $\rightarrow$ Fail build with `422 ERR_VIEWPORT_OVERFLOW`.
  * `TEST-MOD04-NEG-01`: Android manifest requests `READ_CONTACTS` or `ACCESS_FINE_LOCATION` without a corresponding declaration in the Data Safety CSV $\rightarrow$ Fail build with `422 ERR_PLAY_POLICY_MISSING`.
  * `TEST-MOD05-NEG-01`: Coding agent creates a table without `ENABLE ROW LEVEL SECURITY` $\rightarrow$ SQL AST linter blocks commit with `403 ERR_RLS_UNPROTECTED_TABLE`.
* **Rare / Edge Scenarios:**
  * `TEST-MOD03-RARE-01` *(RTL & Multilingual Compound Word Overflow)*: Switch locale from English (`LTR`) to Arabic (`RTL`) and German $\rightarrow$ Verify Flexbox/Grid flips cleanly (`dir="rtl"`) and long German CTA text wraps without clipping.
  * `TEST-MOD04-RARE-02` *(Offline-to-Online Mobile Double-Submit)*: Android user taps "Submit Order" while offline (queued in local SQLite) and taps again as 5G reconnects $\rightarrow$ Backend idempotency key ensures exactly $1$ order is created.
  * `TEST-MOD05-RARE-03` *(Prompt Injection Sandbox Escape Attempt)*: Malicious text in a user story attempts to instruct the coding agent to read `/etc/shadow` or host env vars $\rightarrow$ Rootless Docker sandbox with `--cap-drop=ALL` blocks access and aborts build.

---

### `MOD-06`, `MOD-07`, `MOD-08` & `MOD-09`: QA/SecOps, Canva, WhatsApp & SRE
* **Positive Scenarios:**
  * `TEST-MOD06-POS-01`: Run Playwright E2E, Semgrep, Trivy, Gitleaks, and Lighthouse CI on staging containers and produce a passing Gate 3 certificate.
  * `TEST-MOD07-POS-01`: Autofill $30$ Canva Pro Brand Templates, export PNGs, attach EU AI Act Article 50 disclosure metadata, and queue Gate 4 (`MARKETING_PUBLISH`).
  * `TEST-MOD08-POS-01`: Reply to an inbound customer WhatsApp question within $2$ seconds using pgvector RAG; send an outbound broadcast only to numbers with valid `opt_in_proof_id`.
  * `TEST-MOD09-POS-01`: Receive a Sentry `500` webhook, run `graphify path` to locate the buggy function, validate a fix in the OpenHands sandbox, and create Gate 5 (`HOTFIX_MERGE`).
* **Negative Scenarios:**
  * `TEST-MOD08-NEG-01`: Attempt to send a free-form promotional WhatsApp message $25$ hours after the user's last inbound message without using an approved Meta template $\rightarrow$ Block with `422 ERR_OUTSIDE_24H_WINDOW`.
  * `TEST-MOD06-NEG-01`: Semgrep detects an SQL injection sink or Gitleaks finds a hardcoded token $\rightarrow$ Reject build with `406 ERR_SECURITY_VULN_FOUND`.
* **Rare / Edge Scenarios:**
  * `TEST-MOD08-RARE-01` *(Real-Time "STOP / Erase" During Active Broadcast)*: Customer replies `"STOP"` or `"DELETE MY DATA"` $5$ seconds before a $10,000$-recipient campaign worker reaches their batch $\rightarrow$ Immediately purge PII, record suppression hash, and skip their phone number in the active queue.
  * `TEST-MOD09-RARE-02` *(Third-Party Outage vs. Code Bug Distinction)*: Upstream payment gateway (Stripe/Razorpay) suffers a global outage causing `502/500` errors $\rightarrow$ SRE Agent detects external outage via health probes, avoids generating useless code patches, activates graceful degradation mode, and alerts human admin.

---

## 2. The 5-Stage Post-Development Automated Testing Pipeline

Every coding AI model must execute these 5 stages sequentially after writing code for any module:

1. **Stage 1 — Unit Testing (`pytest` / `vitest`):**
   - Executes all Positive, Negative, and Rare unit tests with mocked external I/O.
   - **Exit Criteria:** $100\%$ pass rate and $\ge 85\%$ line/branch coverage on the module.
2. **Stage 2 — Integration & Contract Testing (`Testcontainers` + `Schemathesis`):**
   - Spins up real ephemeral PostgreSQL 16 (with RLS active) and Redis containers.
   - Validates that all module inputs, outputs, and error codes match `contracts/MODULE_IO_CONTRACTS.md` $100\%$.
3. **Stage 3 — System & Security E2E Testing (`Playwright` + `Semgrep` + `Trivy` + `Gitleaks`):**
   - Tests full user flows across $4$ responsive viewports (`375px`, `768px`, `1280px`, `1920px`).
   - **Exit Criteria:** $0$ leaked secrets, $0$ High/Critical SAST findings, $0$ Critical CVEs.
4. **Stage 4 — Performance & Responsiveness Testing (`k6` + `Lighthouse CI`):**
   - Runs $100$ concurrent virtual users against API endpoints ($\text{p95 latency} < 250\text{ ms}$, $0\%$ error rate).
   - Verifies Lighthouse scores $\ge 90$ for Performance, Accessibility, Best Practices, and SEO.
5. **Stage 5 — Graphify-Driven Smart Regression Testing (`graphify query` / `graphify path`):**
   - Runs `graphify .` to update the AST knowledge graph.
   - Queries `graphify path` to find all upstream and downstream modules connected to the modified files/tables, and automatically re-runs Stage 2 & Stage 3 tests for **only** those impacted modules.