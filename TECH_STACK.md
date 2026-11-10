# Launch Up — Comprehensive Technology Stack & Curriculum Guide

This document details every technology, framework, and architectural pattern used in the **Launch Up** production platform, mapped directly to the core topics, design patterns, and engineering concepts applied in the project.

---

## 1. Frontend Core & Reactive Architecture

### React 18+
* **Component-Driven Architecture**: Modular hierarchy separating presentational elements (`Button`, `Badge`, `Card`), composite widgets (`Header`, `Sidebar`, `CommandPalette`), and domain views (`DashboardTab`, `ProjectsTab`, `ClientsTab`, `DeploymentsTab`, `SystemDesignTab`).
* **Custom Context Providers (`AppContext.tsx`)**: Centralized single-source-of-truth state container managing clients, projects, deployments, alerts, theme modes, search queries, and modal lifecycles.
* **React Hooks & Lifecycle Orchestration**:
  * `useState`: Local form state, subtab transitions, active filters, and dropdown toggles.
  * `useEffect`: Event listener registration for keyboard hotkeys (`Ctrl+K`, `Escape`), dark-mode document class manipulation, and focus management.
  * `useMemo`: High-performance fuzzy filtering of client rosters and project lists without redundant re-renders.
  * `useRef`: DOM node imperative access for auto-focusing spotlight search inputs and managing clicks outside overlays.
  * `useCallback`: Memoized handlers passed to child views to prevent downstream cascading renders.
* **Controlled Forms & Modals**: Multi-step wizard workflows (`CreateProjectModal`), real-time input validation, and step indicators.
* **Keyboard Accessibility & Event Capture**: Event listener attachment in the `{ capture: true }` phase to intercept global shortcut combinations (`Ctrl+K` / `⌘K`) before browser default intercepts.

---

## 2. Type System & Software Correctness

### TypeScript 5.x
* **Domain Modeling & Strict Interfaces (`src/types/index.ts`)**:
  * `Client`: Enterprise B2B / Startup B2C classification, SLA tiers, billing MRR, and relational project IDs.
  * `Project`: Framework identifiers, git configurations, health scores, and deployment targets.
  * `DeploymentLog`: Time-series execution logs, commit metadata, environment scopes, and durations.
  * `SystemAlert`: Severity levels (`error`, `warning`, `info`, `success`), read states, and related entity links.
* **Union Types & String Literals**:
  * Type-safe tab routing: `'dashboard' | 'projects' | 'clients' | 'deployments' | 'analytics' | 'templates' | 'system-design' | 'alerts' | 'settings'`.
  * Environment scopes: `'Production' | 'Staging' | 'Preview'`.
  * Deployment statuses: `'Queued' | 'In Progress' | 'Success' | 'Failed'`.
* **Generic Handlers & Component Typing**: Explicit typing for `React.FC`, event parameter types (`React.FormEvent`, `KeyboardEvent`), and state setter interfaces.

---

## 3. Styling, Design Systems & Theming

### Tailwind CSS v4
* **Utility-First Layouts**: Extensive use of Flexbox, multi-column CSS Grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-12`), gap rhythm, and adaptive responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`).
* **Dark / Light Theme Engine**: Class-based theming (`dark:`) leveraging high-contrast slate palettes (`#111622`, `#0B0F17`, `#1E2638`) and pristine light neutrals (`#FFFFFF`, `#F8FAFC`).
* **Design Token Consistency**:
  * Typography: Mathematical scaling, tight tracking (`tracking-tight`), and tabular numeric alignment (`tabular-nums`).
  * Micro-Surfaces: Elevated cards with `rounded-2xl`, subtle borders (`border-slate-200/80`, `dark:border-slate-800/80`), and light shadows.
  * Color Semantics: Emerald for healthy/live status, Indigo/Violet for primary brands, Amber for warnings, and Slate for secondary metadata.

### Lucide React
* **Micro-Iconography**: Vector iconography with responsive sizing (`w-4 h-4`, `w-5 h-5`), dynamic color passing, and semantic labeling for DevOps (Server, Git, Terminal, Rocket, Layers, Database, Shield).

---

## 4. Data Visualization & Charting

### Custom SVG Geometry & Trigonometry
* **Dynamic Donut Charts (`DashboardTab.tsx`)**:
  * SVG circle circumference formulas ($C = 2 \times \pi \times r$).
  * Precise `strokeDasharray` and `strokeDashoffset` calculations for pie/donut segmentation.
  * Responsive viewBox coordinate space (`0 0 100 100`) preventing layout distortion.
* **Recharts / Analytical Curves**:
  * Responsive containers (`ResponsiveContainer`), linear and curved area graphs (`AreaChart`, `LineChart`), Cartesian grids, interactive tooltips, and x/y axes.

---

## 5. Database Architecture & Systems Engineering

### PostgreSQL 16+ (System Design & Schema)
* **Relational Multi-Tenancy**:
  * Isolation of B2B and B2C clients via distinct tenant records.
  * **Many-to-Many Relationship Pattern**: Implementation of `client_projects` junction table with granular RBAC permissions (`access_permissions` JSONB) and revenue-share percentages.
* **UUIDv4 Primary Keys**: Utilization of `gen_random_uuid()` for non-enumerable, globally unique distributed identifiers.
* **High-Performance JSONB Columns**: Dynamic, semi-structured storage for build logs, webhooks, audit telemetry, and project metadata.
* **Integrity & Constraints**: Foreign keys with `ON DELETE CASCADE`, check constraints (`CHECK (tier IN (...))`), and unique domain constraints.
* **B-Tree & Composite Indexing**: Accelerated query execution for tenant filtering (`idx_client_projects_lookup`, `idx_deployments_project`).

---

## 6. DevOps, Infrastructure & CI/CD Pipelines

### Deployment Orchestration
* **Multi-Target Cloud Deployment**: Architectural abstraction supporting Vercel (Edge SPA/SSR), AWS ECS (Fargate Docker containers), Google Cloud Run (Serverless microservices), and DigitalOcean VPS (Bare-metal hosting).
* **Live Streaming Pipeline Simulation**:
  * Asynchronous build log streaming with stage tracking (git clone $\to$ type check $\to$ bundle build $\to$ edge routing).
  * Rollback triggers with instant zero-downtime routing reversion to previous stable commit digests.
* **Multi-Environment Promotion**: Strict isolation of `Preview`, `Staging`, and `Production` build targets.

### Git Mirroring & Automated Redundancy
* **Bare Remote Mirroring**: Automated push hooks replicating repositories to isolated encrypted cloud storage.
* **Point-in-Time Database Snapshots**: Automated Write-Ahead Logging (WAL) archiving and 30-day snapshot retention plans.

---

## 7. Security, Cryptography & Compliance

### Security Engineering
* **Envelope Encryption & Vault**: Architectural design specifying **AES-256-GCM** encryption with unique 96-bit Initialization Vectors (IV) per client secret.
* **Zero Client Exposure**: Isolation of environment variables and third-party API credentials on the server side (`.env.example` declaration).
* **Role-Based Access Control (RBAC)**: Defined permission matrix for Super Admins, DevOps Engineers, and Client Stakeholders.
* **Transport Layer Security**: Enforcement of TLS 1.3 in transit and HMAC-SHA256 signature verification for external webhooks.

---

## 8. Build Tools & Runtime Environment

### Vite 6 & Node.js
* **ESM (ECMAScript Modules)**: Native browser module loading for instant cold starts.
* **Rollup Tree-Shaking**: Elimination of unused code paths for minimal bundle footprints.
* **Vite Plugins**: Tailwind CSS Vite plugin integration, TypeScript compilation via `tsc --noEmit`.
