# Launch Up — System Design Document (SDD)

**Document Version:** 2.4.0  
**Status:** Approved Architecture  
**Target Platform:** Multi-Tenant Client & Project Orchestration Engine  
**Author:** Principal Systems Architect & Engineering Team  

---

## 1. Architectural Blueprint & System Context

```
+----------------------------------------------------------------------------------------------------+
|                                    CLIENT TIER (Browser / SPA)                                     |
|                                                                                                    |
|  [ React 18+ App ] <==== Context API (AppContext) ====> [ Command Palette (Ctrl+K) ]               |
|         |                                                               |                          |
|         v                                                               v                          |
|  [ Dashboard View ]   [ Projects Tab ]   [ Clients Tab ]   [ Deployments Tab ]  [ System Design ]  |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                HTTPS (TLS 1.3) / WebSockets (WSS)
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                  APPLICATION & ORCHESTRATION TIER                                 |
|                                                                                                    |
|   +--------------------------+   +--------------------------+   +------------------------------+   |
|   |   Client & Project Core  |   |   Deployment Orchestrator|   |   Security Vault (AES-GCM)   |   |
|   |   - Multi-tenant logic   |   |   - Multi-cloud routing  |   |   - 96-bit unique IV         |   |
|   |   - SLA calculations     |   |   - Live log streaming   |   |   - Master key envelope      |   |
|   |   - Billing MRR sync     |   |   - 1-Click Rollback     |   |   - Zero browser leakage     |   |
|   +--------------------------+   +--------------------------+   +------------------------------+   |
+----------------------------------------------------------------------------------------------------+
              |                                          |                                |
              v                                          v                                v
+----------------------------+   +------------------------------------+   +--------------------------+
|      PERSISTENCE TIER      |   |        DEPLOYMENT TARGETS          |   |  DISASTER RECOVERY TIER  |
|                            |   |                                    |   |                          |
|  PostgreSQL 16+ Engine     |   |  [ Vercel Edge ] (SPA / SSR)       |   |  [ S3 Bare Git Mirrors ] |
|  - Multi-tenant schemas    |   |  [ AWS ECS ] (Fargate Tasks)       |   |  - Automated Push Hooks  |
|  - client_projects M:N     |   |  [ Cloud Run ] (Microservices)     |   |                          |
|  - JSONB Telemetry Logs    |   |  [ DigitalOcean ] (Dedicated VPS)  |   |  [ PostgreSQL WAL ]      |
|  - UUIDv4 / B-Tree Indexes |   |                                    |   |  - Continuous Archiving  |
|  - Read Replicas (ACID)    |   |                                    |   |  - 30-Day PITR Snapshots |
+----------------------------+   +------------------------------------+   +--------------------------+
```

---

## 2. High-Level Architecture Decomposition

### 2.1 Client Application Tier
* **Technology:** React 18+, TypeScript 5.x, Tailwind CSS v4, Lucide React, Recharts.
* **State Machine:** Custom React Context Provider (`AppContext.tsx`) maintaining a normalized in-memory data cache of clients, projects, deployments, and alerts.
* **Event Interception:** Dedicated event listener registered during the `{ capture: true }` phase to capture `Ctrl+K` / `⌘K` spotlight searches and `Escape` modal dismissals before browser default interception.
* **Performance Primitives:** `useMemo` for high-performance sub-millisecond filtering across thousands of project/client records.

### 2.2 Deployment & Cloud Orchestration Engine
* **Execution Flow:**
  1. Trigger event initiated via UI button, automated webhook, or API call.
  2. Build phase initiates: Git Clone $\to$ Dependency Installation $\to$ Type Check $\to$ Production Bundle.
  3. Real-time log chunks streamed back via WebSocket / SSE pipe with line-by-line ANSI formatting.
  4. Final deployment digest committed to the time-series log history.
* **Zero-Downtime Rollback Mechanism:**
  * When an alert or degraded health metric occurs, the operator triggers "Rollback".
  * The orchestrator modifies the target routing layer (e.g., Vercel DNS alias, ECS task revision, or Cloud Run traffic split) to redirect 100% of traffic back to the previous stable release commit digest in $< 3\text{ seconds}$.

---

## 3. Database Design & Entity Relationship Diagram (ERD)

### 3.1 Relational Architecture Diagram

```
+---------------------------+             +-------------------------------+             +---------------------------+
|   launchup_core.clients   |             | launchup_core.client_projects |             |   launchup_core.projects  |
+---------------------------+             +-------------------------------+             +---------------------------+
| PK id (UUID)              |<---(1:N)----| FK client_id (UUID)           |----(N:1)--->| PK id (UUID)              |
|    name (VARCHAR)         |             | FK project_id (UUID)          |             |    name (VARCHAR)         |
|    client_type (VARCHAR)  |             |    is_primary (BOOLEAN)       |             |    repository_url (TEXT)  |
|    tier (VARCHAR)         |             |    revenue_share_pct (NUMERIC)|             |    framework (VARCHAR)    |
|    monthly_mrr (NUMERIC)  |             |    access_permissions (JSONB) |             |    target_cloud (VARCHAR) |
|    encrypted_vault (JSONB)|             | PK (client_id, project_id)    |             |    health_score (INTEGER) |
|    created_at (TIMESTAMPTZ|             |    created_at (TIMESTAMPTZ)   |             |    status (VARCHAR)       |
+---------------------------+             +-------------------------------+             +---------------------------+
              |                                                                                       |
              | (1:N)                                                                                 | (1:N)
              v                                                                                       v
+-----------------------------+                                                         +-----------------------------+
| launchup_core.audit_logs    |                                                         |  launchup_core.deployments  |
+-----------------------------+                                                         +-----------------------------+
| PK id (UUID)                |                                                         | PK id (UUID)                |
| FK client_id (UUID)         |                                                         | FK project_id (UUID)        |
|    action (VARCHAR)         |                                                         |    environment (VARCHAR)    |
|    actor (VARCHAR)          |                                                         |    commit_hash (VARCHAR)    |
|    metadata (JSONB)         |                                                         |    status (VARCHAR)         |
|    ip_address (INET)        |                                                         |    build_logs (JSONB)       |
|    created_at (TIMESTAMPTZ) |                                                         |    duration_sec (INTEGER)   |
+-----------------------------+                                                         +-----------------------------+
```

### 3.2 Key Design Choices in DDL
1. **Many-to-Many Junction Table (`client_projects`):**
   * Eliminates 1:1 constraints, allowing enterprise parent organizations or multi-brand clients to collaborate on shared infrastructure projects.
   * Houses granular RBAC permission overrides via `access_permissions` JSONB column.
2. **UUIDv4 Keys (`gen_random_uuid()`):**
   * Non-enumerable, collision-free distributed keys suitable for microservice partitioning.
3. **JSONB Semi-Structured Columns:**
   * Used for `build_logs`, `metadata`, and `encrypted_vault` to handle variable stdout telemetry and heterogeneous credentials without schema migrations.
4. **B-Tree Indexing Strategy:**
   * Compound index `idx_client_projects_lookup (client_id, project_id)` for high-throughput join lookups.
   * `idx_deployments_project (project_id, created_at DESC)` for instantaneous pagination of deployment histories.

---

## 4. Security Architecture & Zero-Trust Cryptography

### 4.1 Envelope Encryption Pattern (AES-256-GCM)
* Every sensitive credential stored in `encrypted_vault` is processed through the NIST SP 800-38D standard:
  $$\text{Ciphertext} = \text{AES-256-GCM}(K_{\text{DEK}}, \text{PlaintextSecret}, \text{IV}_{96}, \text{AAD})$$
* **Unique IV:** A cryptographically random 96-bit Initialization Vector is generated for every individual secret write, preventing replay and pattern leakage.
* **Authentication Tag:** A 128-bit authentication tag is evaluated prior to any decryption operation; tampering causes immediate rejection.
* **Zero Client Exposure:** Master keys ($K_{\text{KEK}}$) and Data Encryption Keys ($K_{\text{DEK}}$) reside strictly within server-side KMS/HSM environments.

### 4.2 Webhook Signature Authentication
* External hooks (e.g., GitHub pushes, Stripe invoice settlements) are verified using HMAC-SHA256:
  $$\text{Signature} = \text{HMAC-SHA256}(\text{SecretKey}, \text{RawPayloadBody})$$
* Constant-time comparison (`crypto.timingSafeEqual`) prevents timing attack vectors.

---

## 5. Disaster Recovery & Business Continuity (DR/BC)

### 5.1 Automated Git Remote Mirroring
* All source code repositories are continuously synchronized:
  * Primary: GitHub / GitLab cloud repositories.
  * Secondary: Bare git mirrors pushed to encrypted, versioned AWS S3 buckets across distinct geographical regions (e.g., `us-east-1` $\to$ `eu-central-1`).

### 5.2 Database Backup Lifecycle
* **Write-Ahead Logging (WAL):** PostgreSQL writes transaction records sequentially to disk before data pages. These WAL segments are continuously streamed to cold cloud storage.
* **Point-in-Time Recovery (PITR):** Enables reconstructing database state down to the exact millisecond before an accidental deletion or corruption event.
* **Snapshot Cadence:** Automated full physical snapshots taken every 24 hours with a 30-day rolling retention window.
