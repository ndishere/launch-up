# LAUNCH UP — MASTER ARCHITECTURE, GLOBAL COMPLIANCE & BUSINESS ANALYST SUITE

> **DOCUMENT OWNER:** Senior Development Architect & Lead Business Analyst
> **PLATFORM NAME:** **Launch Up**

---

## 1. Executive Vision & Multi-Tenant Business Architecture

**Launch Up** is an autonomous, multi-tenant B2B software factory and digital marketing agency platform. It automates lead discovery, client onboarding, requirement engineering, full-stack software creation (Websites, Landing Pages, Android Mobile Apps, Backend APIs), and ongoing digital services (Canva Pro Social Marketing, WhatsApp Cloud API Marketing & RAG Support, Google Analytics 4 SEO/Funnel Optimization, and 24/7 Self-Healing Backend Management) governed by mandatory Human-in-the-Loop (HITL) approval gates.

### Many-to-Many (M:N) Tenancy & Revenue Model
- **1 Client $\rightarrow$ Many Projects:** A client organization can simultaneously own a Website, an Android App, and a Monthly Marketing Retainer.
- **1 Project $\rightarrow$ Many Clients / White-Label Partners:** Multiple businesses or partner agencies can co-own or collaborate on a single project with automated split-billing (`billing_share_percent`) and scoped role access.
- **Unified Principals (`HUMAN` & `AI_AGENT`):** Both human stakeholders and autonomous AI agents are governed by the exact same Role-Based Access Control (RBAC) and PostgreSQL Row-Level Security (RLS) engine.

---

## 2. Token Reduction & Multi-Model Continuity via `Graphify`

To ensure you can switch coding AI models (Gemini Pro, ChatGPT Plus / Codex, Claude Code, DeepSeek, or local Ollama models) at any point without re-reading the codebase or burning tokens, **Launch Up** enforces the **Graphify Protocol (`Graphify-Labs/graphify`, PyPI: `graphifyy`)**:

1. **Zero-LLM AST Indexing:** Graphify uses local `tree-sitter` AST parsing to map code, SQL migrations, and Markdown specifications into a queryable knowledge graph (`graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md`) with zero LLM token spend.
2. **Subgraph-Only Context Loading:** Coding models are forbidden from scanning full directories. They must query `graphify query "<MODULE_ID>"` and `graphify path <NodeA> <NodeB>` to load only the $3$–$5$ relevant files for their current task.
3. **Golden Template + Delta Pattern ($80\%$ Token Savings):** Client applications are never generated from scratch. Agents clone pre-tested Golden Repositories (`golden-web-landing`, `golden-mobile-android`, `golden-backend-api`) inside isolated OpenHands Docker sandboxes and write only the $15\%$–$20\%$ custom business delta.
4. **3-Tier LiteLLM Cost Router:**
   - **Tier 1 (`llm-tier-1-architect` — $\sim 10\%$ of calls):** Gemini 2.5 Pro / GPT-4o / Claude Sonnet for BA synthesis, DB schema design, and root-cause debugging.
   - **Tier 2 (`llm-tier-2-coder` — $\sim 40\%$ of calls):** Gemini 2.5 Flash / DeepSeek-Coder / Qwen-2.5-Coder for writing code deltas and unit/Playwright tests.
   - **Tier 3 (`llm-tier-3-worker` — $\sim 50\%$ of calls):** Local Ollama or Flash-Lite for lead scraping, WhatsApp FAQ routing, and log formatting.

---

## 3. Curated Open-Source & Subscription Tool Stack

| Layer | Selected Tool / Repository | Cost Tier | Purpose in Launch Up |
| :--- | :--- | :--- | :--- |
| **Structural Memory** | `Graphify-Labs/graphify` (`graphifyy`) | Free / Apache-2.0 | Cross-model AST & doc knowledge graph; cuts context tokens by $>80\%$. |
| **Stateful Orchestration** | `langchain-ai/langgraph` | Free / MIT | Workflow state machine with PostgreSQL checkpointing & `interrupt()` human gates. |
| **Coding Sandbox** | `All-Hands-AI/OpenHands` | Free / MIT | Rootless, resource-capped Docker sandboxes for safe code generation & testing. |
| **AI Cost Gateway** | `BerriAI/litellm` | Free / MIT | 3-Tier model routing, Redis semantic caching, and per-project USD budget caps. |
| **Visual Automation** | **Canva Pro Connect API / MCP** | Existing Subscription | Automated Brand Templates, dynamic autofill, and PDF/PNG/MP4 asset export. |
| **Web Analytics & SEO** | **Google Analytics 4 (GA4) API** + `PostHog` + `Lighthouse CI` | Free / Open Source | Traffic, funnel conversion tracking, Core Web Vitals, and automated SEO audits. |
| **WhatsApp & CRM** | **Meta WhatsApp Cloud API** + `chatwoot/chatwoot` | Free / MIT | 24/7 RAG customer support, opt-in broadcast campaigns, and human escalation inbox. |
| **Self-Hosted PaaS** | `coollabsio/coolify` | Free / Apache-2.0 | Zero-downtime Docker deployment for client websites, APIs, and databases on low-cost VPS. |
| **QA & SecOps** | `Playwright`, `Semgrep`, `Trivy`, `Gitleaks` | Free / Open Source | Automated E2E UI testing, SAST security scanning, CVE checks, and secret detection. |
| **SRE & Monitoring** | `getsentry/sentry` (or GlitchTip) + `louislam/uptime-kuma` | Free / MIT | Real-time crash and uptime webhooks that trigger the Autonomous SRE hotfix agent. |

---

## 4. Global Multi-Country Legal, Privacy & App Store Compliance Matrix

Every project built or managed by **Launch Up** automatically configures its compliance middleware based on the target countries selected during `MOD-02` onboarding:

| Jurisdiction | Governing Regulations | Mandatory Built-In Features in Launch Up & Client Golden Templates |
| :--- | :--- | :--- |
| **European Union & UK** | **GDPR**, **UK GDPR**, **ePrivacy**, **EU AI Act (Art. 50)** | 1. Strict opt-in Cookie Banner (blocks GA4/pixels until consent).<br>2. `/api/v1/privacy/me/export` (Data Portability JSON) & `/api/v1/privacy/me/erase` (Right to Erasure).<br>3. Visible *"AI-Generated / Assisted by AI"* disclosure badge on chatbots and synthetic marketing assets.<br>4. EU database residency pinning. |
| **United States** | **CCPA / CPRA**, **TCPA**, **CAN-SPAM** | 1. *"Do Not Sell or Share My Personal Information"* link & Global Privacy Control (GPC) browser signal support.<br>2. Immutable double opt-in consent ledger (`opt_in_proof_id`) before sending any SMS/WhatsApp message.<br>3. One-click `List-Unsubscribe` headers on all outreach emails. |
| **India** | **DPDP Act 2023**, **CERT-In Directions**, **TRAI** | 1. Itemized multilingual Consent Notice (English + 22 scheduled Indian languages support) prior to PII collection.<br>2. One-click Consent Withdrawal endpoint.<br>3. 180-day immutable security & access log retention for CERT-In compliance. |
| **Brazil, Canada, APAC & MENA** | **LGPD (Brazil)**, **PIPEDA & CASL (Canada)**, **PDPA (SG)**, **PDPL (UAE/KSA)** | 1. Express consent proof logging (IP, timestamp, form URL).<br>2. Cross-border transfer flags and regional VPS database pinning. |
| **Google Play Store** | **Google Play Developer Program Policies** | 1. Auto-generated **Data Safety CSV** matching exact Android manifest permissions.<br>2. Mandatory **in-app Account Deletion flow** AND **public web Account Deletion URL**. |
| **Meta WhatsApp** | **WhatsApp Business Messaging Policy** | 1. Hard enforcement of the **24-Hour Customer Service Window** for free-form AI replies.<br>2. Outbound campaigns restricted to approved templates with an automatic *"Reply STOP to opt out"* handler. |

---

## 5. Future Report Analysis Protocol (How You Work With Your Senior Architect & BA)

As **Launch Up** builds projects and runs live campaigns, you can paste or upload any of the **5 Standardized Platform Reports** below into our chat for architectural, security, or business optimization:

1. **`REP-01` — Graphify Structural & Code Health Report (`graphify-out/GRAPH_REPORT.md`):**
   - *When to share:* After a coding AI model completes a module or sprint.
   - *What I will analyze:* Coupling hotspots, circular dependencies, god nodes, and exact refactoring instructions.
2. **`REP-02` — Pre-Deployment QA, Security & Compliance Certificate (`MOD-06` JSON):**
   - *When to share:* At Approval Gate 3 (`PRODUCTION_DEPLOY`).
   - *What I will analyze:* Playwright E2E coverage, Semgrep/Trivy findings, Lighthouse scores, and multi-country legal readiness before you approve production launch.
3. **`REP-03` — Client Growth, GA4 Funnel & Marketing Performance Report:**
   - *When to share:* Monthly for active client retainers.
   - *What I will analyze:* Landing page bounce rates, conversion drop-offs, Canva social engagement, and WhatsApp broadcast ROI—delivering an actionable growth optimization plan.
4. **`REP-04` — FinOps, Token Spend & Unit Economics Report (`MOD-10` Ledger):**
   - *When to share:* Bi-weekly or monthly.
   - *What I will analyze:* Token cost per build, LiteLLM tier distribution, and gross margin per client/partner to maximize profitability.
5. **`REP-05` — Autonomous SRE Incident & Hotfix Audit (`MOD-09` RCA):**
   - *When to share:* At Approval Gate 5 (`HOTFIX_MERGE`) when a production error occurs.
   - *What I will analyze:* Root-cause validity, regression safety across connected Graphify nodes, and permanent Golden Template improvements.

---

## 6. Global Top Header Architecture & Tab Metadata UI Standard

To maintain executive clarity, reduce vertical visual noise, and provide an instant screen breadcrumb across both **Prototype Theme** and **Classic Theme**, the platform enforces the **Global Header Tab Title & Subtitle Standard**:

1. **Top Global Header Breadcrumb Integration (`src/components/layout/Header.tsx`)**:
   - Replaces the redundant `10/10 Services Live` pill (which is already displayed in the unified 5-cell summary bar) with the active tab's **Title** and **Subtitle**.
   - Located immediately to the right of the sidebar toggle button within a flexible container (`flex flex-col justify-center min-w-0 flex-1 mr-4 overflow-hidden`).
   - Title formatted with `text-sm sm:text-base font-bold tracking-tight leading-tight truncate`.
   - Subtitle formatted with `text-[11px] sm:text-xs leading-tight truncate mt-0.5` with `title={tabMeta.subtitle}` for instant full-text hover tooltip.

2. **Strict Height & Resize Truncation Rules**:
   - **Zero Header Height Increase:** The global header height remains strictly pinned to `72px` (`h-[72px]`) under the Prototype Theme and `56px` (`h-14`) under the Classic Theme.
   - **Single-Line Ellipsis Truncation:** Both title and subtitle use `truncate` (`text-overflow: ellipsis; overflow: hidden; white-space: nowrap`). Under responsive browser resizing or split-screen views, text gracefully truncates with `...` without wrapping to a second line or displacing the Command Palette search bar or action icons.

3. **Centralized Tab Metadata Registry (`src/constants/tabHeaders.ts`)**:
   - Governed by `TAB_HEADER_META: Record<string, { title: string; subtitle: string }>` mapping all 27 canonical tab IDs (`dashboard`, `clients`, `projects`, `services`, `tools`, `ai-workshop`, `analytics`, `team`, `settings`, `templates`, etc.).
   - Includes a deterministic fallback generator `getTabHeaderMeta(tabId)` that auto-converts kebab-case identifiers into capitalized titles and descriptive subtitles for future or dynamically loaded plugins/tabs.

4. **Screen Body Deduplication Contract**:
   - All shared layout wrappers (`ThreeZoneScreenLayout.tsx`, `ScreenAnalyticsHeader.tsx`) and individual tab components (`AgentCompanyTab.tsx`, `AlertsTab.tsx`, `AnalyticsTab.tsx`, `BillingTab.tsx`, `IntegrationsTab.tsx`, `MarketingEngineTab.tsx`, `SystemDesignTab.tsx`, `TemplatesTab.tsx`) omit redundant top-level `<h1>` headings and description paragraphs.
   - Action buttons (`+ Add Client`, `+ Intake Business`, `Scan *.launchup.json`, `Plans`, `Mark All as Read`, etc.) and status badges are rendered directly in compact top toolbars, preserving 100% of functional capabilities while saving vertical screen real estate.

---

## 7. Locked Slate & Indigo Control Plane Theme & Expandable Right Detail Panel Standards

1. **Locked Slate & Indigo Theme Standard**:
   - The platform UI visual design is strictly locked to the original dark/light **Slate & Indigo Control Plane Theme** (commit `8c12cde`), providing high visual contrast, crisp typography, and native Tailwind CSS `@theme` design tokens.
   - All experimental prototype-scoped CSS variables (`:root[data-ui-style="prototype"]`) and non-standard `.chip` / `.btn-pri` utility classes have been completely removed.
   - Color modes support Dark (`#090B10` background, Slate-900 surfaces), Light (`slate-50/80` background, white surfaces), and System synchronization with 5 selectable primary accent palettes: Indigo (default), Cyan, Emerald, Amber, and Rose.
   - The full navigation sidebar is optimized with `<LaunchUpLogo size={34} />` and sleek active tab highlights.

2. **Expandable / Collapsible Right-Side Detail Panel Standard (`src/components/common/ExpandableRightDetailPanel.tsx`)**:
   - Reusable `<ExpandableRightDetailPanel />` component styled in pure Slate & Indigo (`bg-white dark:bg-slate-900/95 border-l border-slate-200 dark:border-slate-800`), sliding in or collapsing without content jump.
   - Provides contextual drill-down inspection when any row, client, project, gate, alert, template, or service node is selected.
   - Features an integrated `[✕ / Collapse >]` header action, a collapsed vertical `Details` pill toggle for 1-click re-opening, and a companion toolbar toggle button `<ExpandableDetailToggleButton />`.
   - Integrated into `ThreeZoneScreenLayout.tsx` for consistent multi-zone desktop screen layouts across all tabs.

---

## 8. Consolidated 9-Tab Navigation Architecture & Plain-English Domain Labeling Standards

1. **9-Tab Primary Navigation Standard (`src/components/layout/Sidebar.tsx` & `src/App.tsx`)**:
   - The global left navigation sidebar is consolidated into exactly 9 primary business domains:
     1. **`Dashboard` (`dashboard`)**: Real-time client pipeline, follow-ups, and executive approval inbox.
     2. **`Clients` (`clients`)**: Lead prospecting, intake questionnaires, scope notes, and retainers.
     3. **`Projects` (`projects`)**: Deliverable tracking, builder orchestration, Docker staging, and external project folder adapters.
     4. **`Services` (`services`)**: Active microservices mesh, digital marketing campaigns, WhatsApp outreach, and website auto-fix care.
     5. **`Tools/Apps` (`tools-apps`)**: Golden project templates, connected cloud accounts, visual drag-and-drop page editor, and multi-device previewer.
     6. **`AI Workshop` (`ai-workshop`)**: Virtual executive/technical team helpers, local 6GB VRAM memory optimization, Ollama discovery, and automated flows.
     7. **`Analytics` (`analytics`)**: Unit economics, LLM token costs, client profitability, and gross margin calculations.
     8. **`Teams` (`team`)**: Business approval gates, client permission matrix, and co-owner sign-offs.
     9. **`Settings` (`settings`)**: Control plane appearance, 5 color palettes, brand logos, and custom API verification gateway.

2. **Zero-Feature-Loss Segmented Sub-View Architecture (`src/components/tabs/*.tsx`)**:
   - Consolidated tabs embed a clean, compact segmented sub-tab control at the top, preserving 100% of functional screens with zero cognitive overload:
     - **Projects (`ProjectsTabWrapper.tsx`)**: *All Projects* (`ProjectsTab`), *Project Builder* (`ProjectBuilderTab`), and *Deployments & Releases* (`DeploymentsTab`).
     - **Services (`ServicesTab.tsx`)**: *Marketing & WhatsApp* (`MarketingEngineTab`), *Website Health & Auto-Fix* (`AlertsTab`), and *Live Uptime & Logs* (`TelemetryHubTab`).
     - **Tools/Apps (`ToolsAppsTab.tsx`)**: *Project Templates* (`TemplatesTab`), *Connected Accounts* (`IntegrationsTab`), *Visual Page Editor* (`NoCodeEditorTab`), and *Device Previewer* (`PreviewStudioTab`).
     - **AI Workshop (`AIWorkshopTab.tsx`)**: *AI Team Helpers* (`AgentCompanyTab`), *AI Models & Local PC* (`SLMLabTab`), and *Automation Flows* (`N8nWorkflowsTab`).

3. **Plain-English Business Domain Labeling Standard**:
   - User interfaces replace technical acronyms and numeric gates with domain-friendly business terminology:
     - **Gate 1 (`OUTREACH_PITCH`)** → **`Proposal Approval`**
     - **Gate 2 (`SCOPE_LOCK`)** → **`Project Plan Sign-Off`**
     - **Gate 3 (`DEPLOY_STAGING`)** → **`Go-Live Approval`**
     - **Gate 4 (`MARKETING_PUBLISH`)** → **`Campaign Approval`**
     - **Gate 5 (`HOTFIX_MERGE`)** → **`Quick Fix Approval`**
   - Microservices are surfaced with their human business function: *Lead Finder (MOD-01)*, *Scope Planner (MOD-02)*, *Web Builder (MOD-03)*, *Mobile App Builder (MOD-04)*, *Backend Engine (MOD-05)*, *Quality & Security Check (MOD-06)*, *Canva Marketing (MOD-07)*, *WhatsApp CRM (MOD-08)*, *Auto-Fix Care (MOD-09)*, and *Access & Approvals (MOD-10)*.
   - Hardware and token compression settings are labeled with intuitive business descriptions: *Local PC Memory Saver (VRAM & KV-Cache)* and *Smart Token Cost Saver (/caveman)*.
