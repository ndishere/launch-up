# Launch Up — Product & Software Requirements Specification (PRD / SRS)

**Document Version:** 2.4.0  
**Status:** Approved & Production-Ready  
**Classification:** Enterprise Engineering Blueprint  
**System Target:** Launch Up Client & Project Orchestration Platform  

---

## 1. Executive Summary & Business Objectives

### 1.1 Problem Statement
Digital agencies, SaaS incubators, and enterprise engineering teams frequently struggle with fragmented tooling across client onboarding, git repository management, multi-cloud deployments, disaster recovery, and secret credential handling. Typical workflows require switching between multiple disparate interfaces (Stripe, GitHub/GitLab, Vercel/AWS consoles, Jira, and password vaults), creating communication latency, deployment errors, and operational security risks.

### 1.2 Product Vision & Objective
**Launch Up** provides a unified, production-grade orchestration cockpit where engineering leaders and account directors can:
1. Seamlessly onboard and manage enterprise B2B and consumer B2C clients.
2. Link, track, and monitor software projects across multiple git repositories and modern frameworks.
3. Trigger and monitor multi-target cloud deployments (AWS ECS, Google Cloud Run, Vercel Edge, VPS) with real-time streaming build logs and 1-click zero-downtime rollbacks.
4. Safeguard client secrets and API keys via an envelope-encrypted client vault (AES-256-GCM).
5. Ensure continuous data preservation through automated Git mirroring and point-in-time database WAL snapshots.

---

## 2. User Personas & Permissions Matrix (RBAC)

### 2.1 Personas
* **Persona 1: Agency Principal / Super Admin (Alex):**
  * *Goals:* Oversee aggregate MRR, SLA health scores, client rosters, subscription tiers, and global system alerts.
  * *Pain Points:* Lack of visibility into project delivery timelines and unmonitored infrastructure downtime.
* **Persona 2: Lead DevOps / Platform Engineer (Sam):**
  * *Goals:* Execute multi-target builds, inspect real-time log outputs, revert unstable builds with 1 click, and audit git backup mirrors.
  * *Pain Points:* Slow rollbacks during deployment failures and scattered server credentials.
* **Persona 3: Client Stakeholder / Project Manager (Elena):**
  * *Goals:* Review staging and preview environments, monitor project progress, and view billing invoices and SLA health.
  * *Pain Points:* Complex technical dashboards that lack executive clarity.

### 2.2 Access Control Matrix

| Feature / Domain | Super Admin | DevOps Lead | Client Stakeholder | Read-Only Auditor |
| :--- | :---: | :---: | :---: | :---: |
| Client Management (CRUD) | **Full** | View Only | View Assigned | View Only |
| Project Creation & Config | **Full** | **Full** | View Assigned | View Only |
| Deployments & 1-Click Rollbacks | **Full** | **Full** | Trigger Preview | View Logs Only |
| Credential Vault (Secret Decryption) | **Full** | Role-Scoped | Denied | Denied |
| Database Snapshots & Git Mirroring | **Full** | **Full** | Denied | View Status |
| Billing & Invoices (MRR) | **Full** | Denied | View Own | View Only |

---

## 3. Functional Requirements (FR)

### FR-01: Client Onboarding & Lifecycle Management
* **FR-1.1:** System shall classify clients into **Enterprise B2B** (high SLA, custom domain, dedicated account rep) or **Startup B2C** (standard SLA, rapid turnaround).
* **FR-1.2:** System shall record SLA tier levels: `Tier 1: 99.99% Enterprise`, `Tier 2: 99.9% Premium`, or `Tier 3: 99.5% Standard`.
* **FR-1.3:** System shall calculate real-time Monthly Recurring Revenue (MRR) and associate multiple projects to each client via a relational many-to-many relationship.
* **FR-1.4:** System shall support client filtering by tier, health score, and search query.

### FR-02: Project Orchestration & Repository Binding
* **FR-2.1:** System shall support project instantiation with framework selectors (`Next.js`, `React + Vite`, `Remix`, `Node.js`, `Vue.js`, `Python / FastAPI`).
* **FR-2.2:** System shall validate git repository URLs (GitHub/GitLab) and target branches (`main`, `staging`, `develop`).
* **FR-2.3:** System shall assign health scores (0–100%) based on active commit frequency, deployment success rate, and uptime checks.
* **FR-2.4:** System shall support a multi-step project creation wizard with real-time validation and cancellation guards.

### FR-03: Multi-Cloud Deployment & Real-Time Telemetry
* **FR-3.1:** System shall support 4 distinct deployment cloud targets:
  * `Vercel Edge` (Static SPA & Serverless Functions)
  * `AWS ECS` (Containerized Fargate Tasks)
  * `Google Cloud Run` (Serverless Microservices)
  * `DigitalOcean VPS` (Dedicated Linux Instances)
* **FR-3.2:** System shall stream asynchronous build logs with live stdout/stderr formatting and phase tracking (Clone $\to$ Lint $\to$ Compile $\to$ Deploy).
* **FR-3.3:** System shall provide an instantaneous **1-Click Rollback Mechanism** reverting production traffic to any chosen historical commit digest without service interruption.
* **FR-3.4:** System shall maintain execution durations (seconds) and commit author metadata.

### FR-04: Security Vault & Secret Isolation
* **FR-4.1:** Client API keys (Stripe secrets, cloud credentials, database connection strings) must be encrypted using **AES-256-GCM** with a unique 96-bit Initialization Vector (IV) per record.
* **FR-4.2:** Decryption keys must remain exclusively on the server side; no unmasked production secrets shall ever be sent to client browser contexts.
* **FR-4.3:** Webhook ingress endpoints must verify HMAC-SHA256 signatures before processing deployment or billing events.

### FR-05: Git Mirroring & Disaster Recovery
* **FR-5.1:** Automated push hooks shall mirror all git commits to an isolated, encrypted S3 object storage repository.
* **FR-5.2:** Database state shall be preserved using Write-Ahead Logging (WAL) continuous archiving paired with automated 30-day point-in-time recovery (PITR) snapshots.

### FR-06: Command Palette & Keyboard Ergonomics
* **FR-6.1:** Global hotkey `Ctrl+K` (or `⌘K` on macOS) shall summon an accessible spotlight search palette in `< 50ms`.
* **FR-6.2:** System shall capture shortcut events in the `{ capture: true }` event phase to prevent browser default conflicts.
* **FR-6.3:** Search must execute fuzzy filtering over clients, projects, deployments, and quick actions.

---

## 4. Non-Functional Requirements (NFR)

### NFR-01: Performance & Latency
* **Initial Page Load:** Core Web Vitals LCP $< 1.2\text{s}$, FID $< 50\text{ms}$, CLS $< 0.05$.
* **Local Filtering Latency:** Client-side list and search filtering must respond in $< 16\text{ms}$ (60 FPS) for datasets up to 1,000 records using `useMemo`.
* **Bundle Footprint:** Client bundle must maintain tree-shaken gzipped size $< 180\text{KB}$.

### NFR-02: Availability & SLA
* Platform target uptime: **99.95%**.
* Disaster recovery Recovery Time Objective (RTO) $< 15\text{ minutes}$.
* Recovery Point Objective (RPO) $< 5\text{ minutes}$ via continuous WAL streaming.

### NFR-03: Accessibility & Design Standards
* Strict adherence to **WCAG 2.1 AA** standards (minimum 4.5:1 color contrast for all text).
* Full keyboard navigation support (Tab indexing, focus trapping on modal wizards, Escape to dismiss).
* Support for both dark mode (`#0B0F17` obsidian slate) and light mode with instant toggle.
* Zero "AI Slop" policy: No arbitrary neon gradient text, no nested cards, and mathematical nested border-radii.

### NFR-04: Browser Compatibility
* Full functional and visual parity across modern Evergreen browsers: Chrome $\ge 110$, Edge $\ge 110$, Firefox $\ge 115$, Safari $\ge 16.4$.

---

## 5. System Constraints & Assumptions

1. **Port Constraint:** Container network routes external HTTP ingress strictly via reverse-proxy port `3000`.
2. **Environment Variable Security:** All sensitive server environment keys declared in `.env.example`; no public `VITE_` prefix on private cryptographic keys.
3. **Storage Strategy:** Client UI operates with real-time responsive state paired with relational PostgreSQL 16+ DDL schema specifications for multi-tenant persistence.
