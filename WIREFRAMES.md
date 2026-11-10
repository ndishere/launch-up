# Launch Up — UI/UX Wireframes & Page Layout Specifications

**Document Version:** 2.4.0  
**Status:** Approved UI/UX Specification  
**Design System:** Modern Obsidian Slate / Light Clean Bento Architecture  
**Typography:** Plus Jakarta Sans & JetBrains Mono  

---

## 1. Global Shell & Navigation Framework

### Layout Anatomy
The application shell employs a desktop-first responsive structure:
* **Fixed Left Sidebar (64px collapsed / 240px expanded):** Persistent brand identifier, primary navigation route buttons, system health badge, and current user profile snippet.
* **Top Header Bar (64px height):** Global search bar trigger (`Ctrl+K`), quick environment indicator (`Production`), notifications popover, dark/light theme switch, and action buttons.
* **Main Canvas (calc(100vh - 64px)):** Fluid container (`max-w-7xl mx-auto`) with responsive padding (`p-4 sm:p-6 lg:p-8`).

```
+----------------------------------------------------------------------------------------------------+
| [Logo] Launch Up   | [Search: Ctrl+K / ⌘K                 ]   [Env: Prod] [Theme] [Alerts] [User] |
+--------------------+-------------------------------------------------------------------------------+
|  (Nav)             |                                                                               |
|  * Dashboard       |  Main View Area                                                               |
|  * Projects        |  (Active Tab Content Rendered Here)                                           |
|  * Clients         |                                                                               |
|  * Deployments     |                                                                               |
|  * Analytics       |                                                                               |
|  * System Design   |                                                                               |
|  * Settings        |                                                                               |
|                    |                                                                               |
|  [System Status]   |                                                                               |
|  Operational 99.9% |                                                                               |
+--------------------+-------------------------------------------------------------------------------+
```

---

## 2. Page Wireframe 1: Command Center / Dashboard Tab

### View Hierarchy & Layout Breakdown
1. **Hero Header:** Welcome greeting, current active client count, and "New Project" call-to-action button.
2. **Top Metric Bento (4 Cards):**
   * Total Monthly MRR (with trend percentage pill).
   * Active Clients (Enterprise vs. Startup breakdown).
   * Production Deployments (Total today & success rate).
   * Global System Health Score (Avg 98.4%).
3. **Primary Content Grid (8-col / 4-col split):**
   * **Left (8-cols):** Recent Deployment Activity Feed with live status chips, commit hashes, target tags, and elapsed duration.
   * **Right (4-cols):** Build Distribution Gauge (Custom Polar SVG Donut Chart with percentage legends for Success, In-Progress, and Failed builds) and Quick Action shortcut list.

```
+---------------------------------------------------------------------------------------------------+
| Overview Dashboard                                                 [Filter ▾]   [+ New Project]   |
+---------------------------------------------------------------------------------------------------+
| [ $142.8k MRR       ]  [ 38 Active Clients ]  [ 124 Deployments     ]  [ 99.9% Uptime SLA      ]  |
|   +12.4% vs last mo |    24 Ent / 14 B2C   |    98.2% Success Rate  |    All Systems Normal    |
+------------------------------------------------------------------------+--------------------------+
|  RECENT DEPLOYMENTS & PIPELINE ACTIVITY                                | BUILD DISTRIBUTION (24h) |
|  +------------------------------------------------------------------+  |   .---""---.             |
|  | [✓] launchup-core-api   main (c4a91b)   AWS ECS     42s  [View]  |  |  /   92%    \  ■ Success   |
|  | [⟳] client-portal-web   feat (8e1f02)   Vercel Edge 18s  [Logs]  |  | |   Passed   | ■ In-Prog   |
|  | [✓] analytics-worker    main (3d77a1)   Cloud Run   31s  [View]  |  |  \          /  ■ Failed    |
|  | [✕] payment-gateway     staging (1b2f)  AWS ECS     12s  [Retry] |  |   `---..--'              |
|  +------------------------------------------------------------------+  +--------------------------+
|                                                                        | QUICK ACTIONS            |
|  ACTIVE CLIENT PROJECTS                                                | [>] Run Disaster Sync    |
|  +------------------------------------------------------------------+  | [>] Rotate Vault Keys    |
|  | Nexus Corp (Enterprise) - 4 Projects - Health 99% - $18,500/mo   |  | [>] Export CSV Report    |
|  +------------------------------------------------------------------+  +--------------------------+
```

---

## 3. Page Wireframe 2: Projects Roster & Creation Modal

### View Hierarchy & Layout Breakdown
1. **Toolbar:** Framework filter chips (`All`, `Next.js`, `Vite`, `Cloud Run`, `Docker`), search input, and sorting dropdown.
2. **Project Bento Cards (3-column responsive grid):**
   * Card Header: Project Name, Client Badge, Health Score Radial.
   * Card Body: Git repository link, active branch name, and primary framework badge.
   * Card Footer: Last deployment timestamp, cloud target pill, and "Deploy Now" action.
3. **Multi-Step Modal Wizard (`CreateProjectModal`):**
   * *Step 1:* Project Name, Client association dropdown, Framework selector.
   * *Step 2:* Git Repo URL, Target Branch (`main`/`staging`), Cloud Target (ECS/Cloud Run/Vercel/VPS).
   * *Step 3:* Environment Variables & Secret Vault inputs.

```
+---------------------------------------------------------------------------------------------------+
| Projects Portfolio (18 Total)                                           [Search...] [+ New Project]
| Filters: [All] [Next.js] [React+Vite] [Cloud Run] [AWS ECS]            Sort: [Most Active ▾]     |
+-----------------------------------+-----------------------------------+---------------------------+
| nexus-enterprise-portal           | finpulse-trading-engine           | orbit-mobile-gateway      |
| Client: Nexus Corp [Tier 1]       | Client: FinPulse [Tier 1]         | Client: Orbit Technologies|
| Health: [ 99% ● ]                 | Health: [ 94% ● ]                 | Health: [ 100% ● ]        |
| Git: github.com/nexus/portal      | Git: github.com/finpulse/engine   | Git: github.com/orbit/gw  |
| Branch: main (b3f81e)             | Branch: main (7a14c2)             | Branch: release/v2.1      |
| Target: AWS ECS (Fargate)         | Target: Google Cloud Run          | Target: Vercel Edge       |
| Status: [✓ Live]                  | Status: [✓ Live]                  | Status: [✓ Live]          |
| [View Telemetry]   [Deploy Now]   | [View Telemetry]   [Deploy Now]   | [View Telemetry]  [Deploy]|
+-----------------------------------+-----------------------------------+---------------------------+

[ MODAL OVERLAY: CREATE NEW PROJECT ]
+----------------------------------------------------------------------------------+
| Create New Project                                                           [X] |
| Step 1 of 3: General Configuration  [●------○------○]                            |
|                                                                                  |
| Project Name *                                                                   |
| [ e.g. Acme Dashboard                                                          ] |
|                                                                                  |
| Client Association *                             Framework *                     |
| [ Select Client (Nexus Corp, FinPulse...)   ▾ ]  [ Next.js 14 (App Router)   ▾ ] |
|                                                                                  |
| [ Cancel ]                                                    [ Next: Git Setup → ]
+----------------------------------------------------------------------------------+
```

---

## 4. Page Wireframe 3: Clients & Accounts Management

### View Hierarchy & Layout Breakdown
1. **Header Metrics:** Total B2B Enterprise accounts, Startup B2C accounts, Average MRR, SLA Adherence.
2. **Client Roster Table:**
   * Columns: Client Organization, Classification (B2B/B2C), SLA Tier, Linked Projects count, Monthly MRR, Status, Actions.
3. **Expandable Client Drawer:**
   * Associated project cards, encrypted vault status, SLA uptime logs, and contact details.

```
+---------------------------------------------------------------------------------------------------+
| Client Directory & Accounts                                                [+ Onboard Client]     |
+---------------------------------------------------------------------------------------------------+
| Search: [ Filter client name, tier, or email... ]      Filter: [ All Types ▾ ]  [ All Tiers ▾ ]   |
+---------------------------------------------------------------------------------------------------+
| CLIENT ORGANISATION   | TYPE | SLA TIER       | PROJECTS | MONTHLY MRR | STATUS   | ACTIONS       |
+-----------------------+------+----------------+----------+-------------+----------+---------------+
| Nexus Corp            | B2B  | Tier 1 (99.99%)| 4 Active | $18,500.00  | [Active] | [Manage] [···]|
| FinPulse Systems      | B2B  | Tier 1 (99.99%)| 2 Active | $12,200.00  | [Active] | [Manage] [···]|
| Orbit Technologies    | B2C  | Tier 2 (99.9%) | 3 Active | $7,400.00   | [Active] | [Manage] [···]|
| HyperGrowth Labs      | B2C  | Tier 3 (99.5%) | 1 Active | $3,200.00   | [Trial]  | [Manage] [···]|
+-----------------------+------+----------------+----------+-------------+----------+---------------+
```

---

## 5. Page Wireframe 4: Deployments & Streaming Terminal

### View Hierarchy & Layout Breakdown
1. **Target Cloud Filter:** Tabs for `All Clouds`, `Vercel Edge`, `AWS ECS`, `Google Cloud Run`, `VPS`.
2. **Execution Stream / Terminal Console:**
   * Live streaming build log output with line numbers, syntax highlighting, timestamp chips, and phase progress bars.
3. **1-Click Rollback Controls:**
   * Rollback banner displaying the currently active live commit hash alongside previous stable releases.
   * "Revert to This Release" action buttons with safety confirmations.

```
+---------------------------------------------------------------------------------------------------+
| Deployments & Pipeline Orchestrator                                                               |
| Targets: [ All Targets ]  [ AWS ECS ]  [ Cloud Run ]  [ Vercel Edge ]  [ VPS ]                    |
+---------------------------------------------------------------------------------------------------+
| ACTIVE PIPELINE: launchup-core-api (Target: AWS ECS Fargate)                                      |
| Environment: [ Production ]   Commit: e9142b ("fix: update jwt expiry")   Duration: 41s          |
+---------------------------------------------------------------------------------------------------+
| [TERMINAL STREAM: STDOUT / STDERR]                                                   [Copy Logs]  |
| 10:42:01.104 [INFO]  Cloning repository: git@github.com:launchup/core-api.git...                  |
| 10:42:03.220 [INFO]  HEAD is now at e9142b fix: update jwt expiry                                 |
| 10:42:05.412 [INFO]  Executing build script: vite build && esbuild server.ts --bundle            |
| 10:42:09.810 [INFO]  Transforming modules... 128 modules bundled in 1.42s                         |
| 10:42:12.901 [INFO]  Pushing container image to AWS ECR: 434751658557.dkr.ecr.us-east-1...        |
| 10:42:15.540 [OK]    Task definition registered: launchup-api-task:42                             |
| 10:42:16.890 [OK]    Health probe 200 OK received at /api/health (12ms)                           |
| 10:42:17.100 [DONE]  Traffic shift complete. 100% routed to task revision 42                      |
+---------------------------------------------------------------------------------------------------+
| ROLLBACK CONTROLS (Zero-Downtime Traffic Rerouting)                                               |
| Current Live: e9142b (Task 42)                                                                    |
| Previous Stable Releases:                                                                         |
| • commit a81b04 - "feat: add client vault encryption" (Deployed 3h ago)   [ Revert to a81b04 ]    |
| • commit 77c2e1 - "chore: optimize postgres junction query" (Yesterday)   [ Revert to 77c2e1 ]    |
+---------------------------------------------------------------------------------------------------+
```

---

## 6. Page Wireframe 5: System Design & Documentation Hub

### View Hierarchy & Layout Breakdown
1. **Top Spec Switcher:** Direct subtabs for `Database Schema (ERD)`, `Tech Stack & Topics`, `SDLC Roadmap`, `Security & Vault`, `Git & Backups`.
2. **Interactive DDL & Architecture Visualizers:**
   * Copyable SQL DDL schema viewer with syntax highlighting and table count statistics.
   * Cryptographic Envelope Encryption architecture visualization.
   * Disaster recovery Git mirroring & WAL retention schedule.
3. **Document Export Bar:** Action buttons to open standalone HTML specification pages:
   * Tech Stack Document (`/tech-stack.html`)
   * Requirements Document (`/requirements.html`)
   * System Design Document (`/system-design.html`)
   * Pages Wireframe Document (`/wireframes.html`)

```
+---------------------------------------------------------------------------------------------------+
| System Architecture & Engineering Blueprints                                                      |
| [ Database Schema & ERD ] [ Tech Stack & Topics ] [ SDLC Roadmap ] [ Security & Vault ] [ Backups ]
+---------------------------------------------------------------------------------------------------+
| POSTGRESQL 16+ PRODUCTION SCHEMA                                [ Copy DDL ] [ View Full ERD ]    |
| 5 Tables Defined · UUIDv4 Primary Keys · JSONB Semi-Structured Telemetry · Multi-Tenant M:N       |
| +-----------------------------------------------------------------------------------------------+ |
| | CREATE SCHEMA IF NOT EXISTS launchup_core;                                                    | |
| | CREATE TABLE launchup_core.clients (                                                          | |
| |     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                                            | |
| |     name VARCHAR(255) NOT NULL,                                                               | |
| |     tier VARCHAR(50) NOT NULL CHECK (tier IN ('Tier 1', 'Tier 2', 'Tier 3')),                 | |
| |     encrypted_vault JSONB DEFAULT '{}'::jsonb                                                 | |
| | );                                                                                            | |
| +-----------------------------------------------------------------------------------------------+ |
| STANDALONE HTML SPECIFICATIONS                                                                    |
| [ ↗ Tech Stack HTML ]  [ ↗ Requirements HTML ]  [ ↗ System Design HTML ]  [ ↗ Wireframes HTML ]   |
+---------------------------------------------------------------------------------------------------+
```

---

## 7. Global Component Wireframe: Spotlight Command Palette (`Ctrl+K`)

```
+----------------------------------------------------------------------------------+
|  [🔍]  Search clients, projects, deployments, or quick commands...         [ESC] |
+----------------------------------------------------------------------------------+
|  QUICK ACTIONS                                                                   |
|  [+] Create New Project                                                  Enter ↵ |
|  [+] Onboard Client                                                      Enter ↵ |
|  [⟳] Trigger Global Disaster Backup Sync                                 Enter ↵ |
|                                                                                  |
|  MATCHING PROJECTS                                                               |
|  [📦] nexus-enterprise-portal       Client: Nexus Corp · AWS ECS         Enter ↵ |
|  [📦] finpulse-trading-engine       Client: FinPulse · Cloud Run         Enter ↵ |
|                                                                                  |
|  MATCHING CLIENTS                                                                |
|  [🏢] Nexus Corp                    Enterprise B2B · $18,500/mo          Enter ↵ |
|  [🏢] Orbit Technologies            Startup B2C · $7,400/mo              Enter ↵ |
+----------------------------------------------------------------------------------+
|  Navigation: [↑] [↓] to select  ·  [Enter] to execute  ·  [Esc] to dismiss       |
+----------------------------------------------------------------------------------+
```
