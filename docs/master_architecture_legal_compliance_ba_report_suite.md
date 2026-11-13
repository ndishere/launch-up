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

---

## 9. Canonical 3-Section Screen Layout & Contextual Inspector Standards (Phase 2A)

1. **Standard 3-Section Screen Grid Across Core Tabs (`ThreeZoneScreenLayout.tsx`)**:
   - **Row 1 (Top Summary Section):** The single unified 5-cell horizontal `<SummaryMetricGrid />` with `19px` primary values, `1px` vertical dividers, and real-time status tones (`good`, `warn`, `bad`, `live`, `neutral`).
   - **Row 2, Column 1 (Main Content Area):** `flex-1 min-w-0` clean workspace with plain-English filter pills, action buttons, and selectable rows/cards. Every selected item is styled with a subtle indigo selection highlight ring (`ring-2 ring-indigo-500/80 bg-indigo-50/20 dark:bg-indigo-950/20`).
   - **Row 2, Column 2 (Dynamic Expandable/Collapsible Right Details Panel):** Integrated `<ExpandableRightDetailPanel />` that updates whenever an item in Column 1 is selected, with a companion `<ExpandableDetailToggleButton />` in the top toolbar to expand or collapse the panel without causing layout shifts or horizontal scrollbars.

2. **Core Tab Implementations (Phase 2A Deliverables)**:
   - **Dashboard (`DashboardTab.tsx`):**
     - Clicking the 5th summary card (*Agency Health*) opens live telemetry for all 10 core Launch Up microservices (`:8004..:8013`) with health pulse diagnostics.
     - Selecting an item in the Approvals Inbox opens Column 2 with a visual preview, human feedback textarea, and 1-click **`Approve`** / **`Request Changes`** buttons.
     - Selecting a follow-up lead renders client contact details, live customer preview link, and 1-click WhatsApp closing note dispatch.
   - **Clients (`ClientsTab.tsx`):**
     - Top toolbar contains `Generate Lead (Scan)`, `+ Add Client`, and `<ExpandableDetailToggleButton />`.
     - Selecting any client in Kanban or Table view opens Column 2 displaying contact information, retainer value, linked software projects with quick `Create Project for Client` action, a Canva pitch proposal preview card with external link, and quick action buttons.
   - **Projects (`ProjectsTab.tsx`):**
     - Standardized into `ThreeZoneScreenLayout`.
     - Row 1 renders the unified 5-cell summary bar (Total Projects, Live Production, Build Swarm, Container Sync, Rollback Guard).
     - Row 2 Column 1 provides `Pull Project from Folder` and `+ New Project` toolbar actions, the Autonomous App Factory strip, and minimalist project cards with selection rings.
     - Row 2 Column 2 provides the selected project inspector with a 5-step build checklist (*Plan -> Design -> Build -> Quality Check -> Live*), FinOps unit economics profit summary ($2,500 retainer, ~$14.20 infra/LLM cost, 99.4% margin), technical specs (Server Target, Git Branch, Staging Port, Health), and action buttons (**`Open Full Workspace`**, **`Approve Go-Live (Gate 3)`**, **`Multi-Viewport Preview`**).
   - **Services (`ServicesTab.tsx`, `MarketingEngineTab.tsx`, `AlertsTab.tsx`):**
     - **Marketing & WhatsApp (`MarketingEngineTab.tsx`):** 2-column layout with right inspector. Selecting a 30-day social calendar item or campaign opens visual post preview, EU AI Act Art. 50 disclosure status, and 1-click **`Approve Campaign (Gate 4)`** button.
     - **Website Health & Auto-Fix (`AlertsTab.tsx`):** 2-column layout with right inspector. Selecting an incident opens plain-English Root Cause Analysis (RCA), Graphify AST impact node (`services/rates.py:42`), sandbox regression test verification status, and 1-click **`Approve Quick Fix (Gate 5)`** button.


---

## 10. Clutter-Free 3-Section UI Standardization & Built-In 4-Card Inspector Architecture (Step A)

1. **Clutter-Free 3-Section Screen Layout Enforced Across All 9 Tabs**:
   - **Global Top Header (`h-16` fixed height):** Active tab Heading + Subtitle on the left (`min-w-0 flex-1 truncate` so resizing smoothly truncates with `...` without increasing header height), global search in the center, and quick actions/theme toggles on the right. Duplicate standalone `<h1>`/`<p>` headers inside tab bodies are eliminated.
   - **Section 1 (Horizontal Row 1 — Unified 5-Cell Summary Bar):** Single unified container (`<SummaryMetricGrid />`) with `1px` vertical dividers (`divide-x`) and `19px` bold primary numbers.
   - **Section 2 (Horizontal Row 2, Column 1 — Clean Main Content Area):** Cluttered inline banners and verbose technical code dumps are replaced with clean, scannable rows and minimalist cards with essential business information.
   - **Section 3 (Horizontal Row 2, Column 2 — Dynamic Expandable/Collapsible Right Details Panel):** Automatically updates whenever a user clicks any item in Column 1, and can be collapsed or expanded anytime via the top-right `Details` toggle button (`<ExpandableDetailToggleButton />`) without breaking layout alignment or introducing horizontal scrollbars.

2. **Standardized 4 Smart Cards Inside the Right-Side Expandable Details Panel (`StandardContextInspector.tsx`)**:
   - **Card 1 (Overview & Visual Preview):** Status summary, domain/URL badge, live preview link/thumbnail, and quick action launch buttons (`Open Workspace`, `Open Device Preview`, `View Proposal`).
   - **Card 2 (Global Legal & Security Compliance Shield):** 5-point verification badge row:
     - DPDP Act & CERT-In Logs: Verified
     - EU/UK GDPR, Cookie Consent & AI Act Disclosure: Verified
     - US CCPA & WhatsApp 24h Opt-In Rule: Verified
     - Google Play Data Safety & Account Deletion: Verified
     - Data Isolation RLS & CVE Scan: 100% Pass
   - **Card 3 (Cost Intelligence & Portability Passport):**
     - Template & Token Savings: 88% Base Reused • Caveman + Graphify Active • Est. AI Cost: ₹18 / $0.22 • Net Margin: 99.4%
     - 100% Portability: Docker + Git Branches Ready • Local Folder Path • Export/Pull Compatible with Claude Code & Codex
   - **Card 4 (Sticky Bottom Approval & Maintenance Action Bar):** Decision buttons for human-in-the-loop governance (`Approve & Continue`, `Approve Go-Live`, `Approve Quick Fix`, `Request Changes`, or custom buttons).

3. **Complete 9-Tab Coverage**:
   - `Dashboard` (`DashboardTab.tsx`): Row 1 5-cell metrics, Column 1 follow-ups & active clients, Column 2 `StandardContextInspector` with live microservice health telemetry diagnostics.
   - `Clients` (`ClientsTab.tsx`): Row 1 5-cell metrics, Column 1 client pipeline cards, Column 2 `StandardContextInspector` with Canva proposal preview and client outreach.
   - `Projects` (`ProjectsTab.tsx`): Row 1 5-cell metrics, Column 1 autonomous factory strip & project cards, Column 2 `StandardContextInspector` with 5-step build checklist (*Plan -> Design -> Build -> Quality Check -> Live*) & Gate 3 Go-Live approval.
   - `Services` (`MarketingEngineTab.tsx`, `AlertsTab.tsx`, `TelemetryHubTab.tsx`): Converted to 3-section layout with Row 1 5-cell metrics, Column 1 feeds, Column 2 `StandardContextInspector` with Gate 4/5 approvals & live WebSocket telemetry stream.
   - `Tools/Apps` (`TemplatesTab.tsx`, `IntegrationsTab.tsx`, `NoCodeEditorTab.tsx`, `PreviewStudioTab.tsx`): Row 1 5-cell metrics, Column 1 template blueprints, Column 2 `StandardContextInspector` with 88% token reuse & Repomix skeletons.
   - `AI Workshop` (`AgentCompanyTab.tsx`, `SLMLabTab.tsx`, `N8nWorkflowsTab.tsx`): Row 1 5-cell metrics, Column 1 fleet roster & local GPU VRAM optimizer, Column 2 `StandardContextInspector`.
   - `Analytics` (`AnalyticsTab.tsx`): Converted to 3-section layout with Row 1 5-cell metrics, Column 1 campaigns attribution table with interactive row selection, Column 2 `StandardContextInspector`.
   - `Teams` (`TeamTab.tsx`): Converted from `ScreenAnalyticsHeader` to 3-section layout with Row 1 5-cell metrics, Column 1 human approval gates 1-5 + RBAC tester + team members, Column 2 `StandardContextInspector` with Gate sign-off & revision actions.
   - `Settings` (`SettingsTab.tsx`): Row 1 5-cell metrics, Column 1 theme mode & color palette selection, Column 2 `StandardContextInspector` with auto-persisted workspace tokens & state reset.
