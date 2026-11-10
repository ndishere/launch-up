-- =====================================================
-- Launch Up — Initial Database Bootstrap
-- Run order: schemas → extensions → tables → indexes → seed roles
-- =====================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";      -- case-insensitive text

-- 2. Schemas (one per service domain)
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS clients;
CREATE SCHEMA IF NOT EXISTS projects;
CREATE SCHEMA IF NOT EXISTS deployments;
CREATE SCHEMA IF NOT EXISTS billing;
CREATE SCHEMA IF NOT EXISTS vault;
CREATE SCHEMA IF NOT EXISTS notifications;
CREATE SCHEMA IF NOT EXISTS telemetry;

-- =====================================================
-- AUTH SCHEMA
-- =====================================================

CREATE TABLE auth.organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    slug            CITEXT NOT NULL UNIQUE,
    plan_tier       VARCHAR(50) NOT NULL DEFAULT 'free'
                    CHECK (plan_tier IN ('free', 'starter', 'professional', 'enterprise')),
    settings        JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE auth.users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES auth.organizations(id) ON DELETE CASCADE,
    email           CITEXT NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    avatar_url      TEXT,
    mfa_secret      VARCHAR(255),
    mfa_enabled     BOOLEAN NOT NULL DEFAULT false,
    status          VARCHAR(20) NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'invited', 'suspended', 'deactivated')),
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE auth.roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    display_name    VARCHAR(255) NOT NULL,
    description     TEXT,
    is_system_role  BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE auth.permissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource        VARCHAR(100) NOT NULL,   -- e.g. 'clients', 'projects', 'deployments'
    action          VARCHAR(50) NOT NULL,     -- e.g. 'create', 'read', 'update', 'delete', 'execute'
    scope           VARCHAR(50) NOT NULL DEFAULT 'org',  -- 'all', 'org', 'assigned', 'own'
    description     TEXT,
    UNIQUE(resource, action, scope)
);

CREATE TABLE auth.role_permissions (
    role_id         UUID NOT NULL REFERENCES auth.roles(id) ON DELETE CASCADE,
    permission_id   UUID NOT NULL REFERENCES auth.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE auth.user_roles (
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id         UUID NOT NULL REFERENCES auth.roles(id) ON DELETE CASCADE,
    org_id          UUID NOT NULL REFERENCES auth.organizations(id) ON DELETE CASCADE,
    granted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    granted_by      UUID REFERENCES auth.users(id),
    PRIMARY KEY (user_id, role_id, org_id)
);

CREATE TABLE auth.refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked         BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_agent      TEXT,
    ip_address      INET
);

CREATE TABLE auth.api_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES auth.organizations(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    key_hash        VARCHAR(255) NOT NULL UNIQUE,
    key_prefix      VARCHAR(10) NOT NULL,    -- first 8 chars for display: "lu_abc12..."
    scopes          TEXT[] NOT NULL DEFAULT '{}',
    last_used_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auth indexes
CREATE INDEX idx_users_org ON auth.users(org_id);
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_user_roles_user ON auth.user_roles(user_id);
CREATE INDEX idx_user_roles_org ON auth.user_roles(org_id);
CREATE INDEX idx_refresh_tokens_user ON auth.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON auth.refresh_tokens(expires_at) WHERE revoked = false;

-- =====================================================
-- CLIENTS SCHEMA
-- =====================================================

CREATE TABLE clients.clients (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id              UUID NOT NULL REFERENCES auth.organizations(id) ON DELETE CASCADE,
    name                VARCHAR(255) NOT NULL,
    domain              VARCHAR(255),
    email               CITEXT NOT NULL,
    phone               VARCHAR(50),
    tier                VARCHAR(30) NOT NULL DEFAULT 'Startup B2C'
                        CHECK (tier IN ('Enterprise B2B', 'Growth B2B', 'Startup B2C', 'Agency')),
    status              VARCHAR(20) NOT NULL DEFAULT 'Onboarding'
                        CHECK (status IN ('Active', 'Onboarding', 'Pending', 'Inactive')),
    monthly_mrr         INTEGER NOT NULL DEFAULT 0,  -- stored in cents
    contact_info        JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes               TEXT,
    is_deleted          BOOLEAN NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE clients.client_projects (
    client_id           UUID NOT NULL REFERENCES clients.clients(id) ON DELETE CASCADE,
    project_id          UUID NOT NULL,  -- FK to projects.projects(id), cross-schema
    is_primary          BOOLEAN NOT NULL DEFAULT false,
    revenue_share_pct   NUMERIC(5,2) DEFAULT 0,
    access_permissions  JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (client_id, project_id)
);

CREATE TABLE clients.requirement_intakes (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                  UUID NOT NULL REFERENCES auth.organizations(id) ON DELETE CASCADE,
    client_id               UUID REFERENCES clients.clients(id),
    client_name             VARCHAR(255) NOT NULL,
    company_name            VARCHAR(255) NOT NULL,
    contact_email           CITEXT NOT NULL,
    contact_phone           VARCHAR(50),
    project_title           VARCHAR(255) NOT NULL,
    product_types           TEXT[] NOT NULL DEFAULT '{}',
    services_needed         TEXT[] NOT NULL DEFAULT '{}',
    budget_estimated        VARCHAR(100),
    deadline                VARCHAR(100),
    summary                 TEXT NOT NULL,
    detailed_requirements   TEXT,
    status                  VARCHAR(30) NOT NULL DEFAULT 'Draft'
                            CHECK (status IN ('Draft', 'Submitted', 'Under Review', 'Converted', 'Archived')),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Client indexes
CREATE INDEX idx_clients_org ON clients.clients(org_id);
CREATE INDEX idx_clients_tier ON clients.clients(tier);
CREATE INDEX idx_clients_status ON clients.clients(status) WHERE is_deleted = false;
CREATE INDEX idx_clients_search ON clients.clients USING gin (to_tsvector('english', name || ' ' || COALESCE(domain, '') || ' ' || email));
CREATE INDEX idx_client_projects_project ON clients.client_projects(project_id);
CREATE INDEX idx_intakes_org ON clients.requirement_intakes(org_id);

-- Row-Level Security
ALTER TABLE clients.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients.requirement_intakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY clients_tenant_isolation ON clients.clients
    USING (org_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY intakes_tenant_isolation ON clients.requirement_intakes
    USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- =====================================================
-- PROJECTS SCHEMA
-- =====================================================

CREATE TABLE projects.stack_presets (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id              UUID REFERENCES auth.organizations(id) ON DELETE CASCADE,  -- NULL = system preset
    name                VARCHAR(255) NOT NULL,
    category            VARCHAR(50) NOT NULL
                        CHECK (category IN ('Full-Stack', 'Mobile & Web', 'Enterprise Event-Driven', 'Microservices & AI', 'Lightweight Edge')),
    frontend            VARCHAR(255) NOT NULL,
    backend             VARCHAR(255) NOT NULL,
    database            VARCHAR(255) NOT NULL,
    streaming_or_queue  VARCHAR(255),
    devops              VARCHAR(255) NOT NULL,
    is_preset           BOOLEAN NOT NULL DEFAULT true,
    tags                TEXT[] NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects.projects (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id              UUID NOT NULL REFERENCES auth.organizations(id) ON DELETE CASCADE,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    type                VARCHAR(50) NOT NULL DEFAULT 'Marketing Website'
                        CHECK (type IN ('Marketing Website', 'CRM Platform', 'Landing Page', 'E-commerce Site', 'Mobile App API', 'SaaS Platform')),
    status              VARCHAR(20) NOT NULL DEFAULT 'Pending'
                        CHECK (status IN ('Live', 'In Progress', 'Pending', 'On Hold')),
    framework           VARCHAR(100) NOT NULL,
    repo_url            TEXT NOT NULL,
    branch              VARCHAR(100) NOT NULL DEFAULT 'main',
    server_target       VARCHAR(30) NOT NULL DEFAULT 'Vercel'
                        CHECK (server_target IN ('Vercel', 'AWS ECS', 'Cloud Run', 'DigitalOcean VPS')),
    health_percent      INTEGER NOT NULL DEFAULT 0 CHECK (health_percent BETWEEN 0 AND 100),
    live_url            TEXT,
    deployed_date       TIMESTAMPTZ,
    stack_preset_id     UUID REFERENCES projects.stack_presets(id),
    data_structure_model TEXT,
    deployment_status   VARCHAR(30)
                        CHECK (deployment_status IN ('Provisioned', 'Building Docker', 'Canary Rollout', 'Healthy Live', 'Auto-Patched')),
    is_deleted          BOOLEAN NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects.templates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    description         TEXT NOT NULL,
    category            VARCHAR(30) NOT NULL
                        CHECK (category IN ('B2B SaaS', 'E-commerce', 'Marketing', 'Client Portal', 'API Backend')),
    tech_stack          TEXT[] NOT NULL DEFAULT '{}',
    stars               INTEGER NOT NULL DEFAULT 0,
    preview_image       TEXT,
    deploy_time         VARCHAR(50),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects.project_agents (
    project_id          UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
    agent_id            UUID NOT NULL,
    assigned_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, agent_id)
);

-- Project indexes
CREATE INDEX idx_projects_org ON projects.projects(org_id);
CREATE INDEX idx_projects_status ON projects.projects(status) WHERE is_deleted = false;
CREATE INDEX idx_projects_framework ON projects.projects(framework);
CREATE INDEX idx_projects_server ON projects.projects(server_target);
CREATE INDEX idx_stack_presets_org ON projects.stack_presets(org_id);

-- Row-Level Security
ALTER TABLE projects.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY projects_tenant_isolation ON projects.projects
    USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- =====================================================
-- DEPLOYMENTS SCHEMA
-- =====================================================

CREATE TABLE deployments.deployments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id              UUID NOT NULL REFERENCES auth.organizations(id) ON DELETE CASCADE,
    project_id          UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
    commit_hash         VARCHAR(40) NOT NULL,
    commit_message      TEXT,
    author              VARCHAR(255),
    environment         VARCHAR(20) NOT NULL DEFAULT 'Production'
                        CHECK (environment IN ('Production', 'Staging', 'Preview')),
    status              VARCHAR(20) NOT NULL DEFAULT 'Queued'
                        CHECK (status IN ('Queued', 'In Progress', 'Success', 'Failed', 'Rolled Back')),
    duration_seconds    INTEGER DEFAULT 0,
    build_logs          JSONB NOT NULL DEFAULT '[]'::jsonb,
    rollback_target_id  UUID REFERENCES deployments.deployments(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at        TIMESTAMPTZ
);

CREATE TABLE deployments.backups (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id              UUID NOT NULL REFERENCES auth.organizations(id) ON DELETE CASCADE,
    project_id          UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
    type                VARCHAR(30) NOT NULL
                        CHECK (type IN ('Automated Daily', 'Manual Snapshot', 'Pre-Deploy Git Tag')),
    storage_target      VARCHAR(100) NOT NULL,
    size_bytes          BIGINT DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'In Progress'
                        CHECK (status IN ('Completed', 'In Progress', 'Verified', 'Failed')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deployment indexes
CREATE INDEX idx_deployments_project ON deployments.deployments(project_id, created_at DESC);
CREATE INDEX idx_deployments_org ON deployments.deployments(org_id);
CREATE INDEX idx_deployments_status ON deployments.deployments(status);
CREATE INDEX idx_backups_project ON deployments.backups(project_id);

ALTER TABLE deployments.deployments ENABLE ROW LEVEL SECURITY;
CREATE POLICY deployments_tenant_isolation ON deployments.deployments
    USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- =====================================================
-- BILLING SCHEMA
-- =====================================================

CREATE TABLE billing.invoices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id              UUID NOT NULL REFERENCES auth.organizations(id) ON DELETE CASCADE,
    client_id           UUID NOT NULL,
    invoice_number      VARCHAR(50) NOT NULL UNIQUE,
    amount_cents        INTEGER NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'USD',
    status              VARCHAR(20) NOT NULL DEFAULT 'Pending'
                        CHECK (status IN ('Paid', 'Pending', 'Overdue', 'Cancelled')),
    due_date            DATE NOT NULL,
    issued_date         DATE NOT NULL DEFAULT CURRENT_DATE,
    plan_name           VARCHAR(100),
    stripe_invoice_id   VARCHAR(255),
    paid_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_org ON billing.invoices(org_id);
CREATE INDEX idx_invoices_client ON billing.invoices(client_id);
CREATE INDEX idx_invoices_status ON billing.invoices(status);

-- =====================================================
-- VAULT SCHEMA
-- =====================================================

CREATE TABLE vault.secrets (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id              UUID NOT NULL REFERENCES auth.organizations(id) ON DELETE CASCADE,
    client_id           UUID,
    project_id          UUID,
    name                VARCHAR(255) NOT NULL,
    iv                  VARCHAR(32) NOT NULL,           -- base64 96-bit IV
    ciphertext          TEXT NOT NULL,                   -- base64 AES-256-GCM ciphertext
    encrypted_dek       TEXT NOT NULL,                   -- base64 encrypted DEK
    auth_tag            VARCHAR(32) NOT NULL,            -- base64 128-bit auth tag
    key_version         INTEGER NOT NULL DEFAULT 1,
    created_by          UUID REFERENCES auth.users(id),
    last_rotated_at     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_secrets_org ON vault.secrets(org_id);
CREATE INDEX idx_secrets_client ON vault.secrets(client_id);
CREATE INDEX idx_secrets_project ON vault.secrets(project_id);

-- =====================================================
-- SEED: Default System Roles
-- =====================================================

INSERT INTO auth.roles (name, display_name, description, is_system_role) VALUES
('super_admin',       'Platform Super Admin',   'Full platform access — CTO/CEO level',            true),
('org_admin',         'Organization Admin',     'Full access within their organization',            true),
('lead_architect',    'Lead Architect',         'Technical leadership with broad project access',   true),
('devops_engineer',   'DevOps Engineer',        'Deployment, infrastructure, and backup access',    true),
('sr_engineer',       'Senior Engineer',        'Full project access on assigned projects',         true),
('finance_manager',   'Finance Manager',        'Billing, invoicing, and MRR analytics',            true),
('marketing_manager', 'Marketing Manager',      'Campaign and marketing engine access',             true),
('client_success',    'Client Success Manager', 'Client relationship and onboarding management',    true),
('jr_engineer',       'Junior Engineer',        'Limited project access on assigned projects',      true),
('auditor',           'Read-Only Auditor',      'Read-only access across the platform',             true),
('client_portal',     'Client Portal User',     'External customer with limited self-service',      true);

-- Seed: Core Permissions
INSERT INTO auth.permissions (resource, action, scope, description) VALUES
-- Client permissions
('clients', 'create', 'org',      'Create clients in own organization'),
('clients', 'read',   'org',      'Read all clients in own organization'),
('clients', 'read',   'assigned', 'Read only assigned clients'),
('clients', 'read',   'own',      'Read own client profile (portal)'),
('clients', 'update', 'org',      'Update any client in own organization'),
('clients', 'update', 'assigned', 'Update only assigned clients'),
('clients', 'delete', 'org',      'Delete (deactivate) clients'),
-- Project permissions
('projects', 'create', 'org',      'Create projects in own organization'),
('projects', 'read',   'org',      'Read all projects in own organization'),
('projects', 'read',   'assigned', 'Read only assigned projects'),
('projects', 'read',   'own',      'Read own projects (portal)'),
('projects', 'update', 'org',      'Update any project'),
('projects', 'update', 'assigned', 'Update only assigned projects'),
('projects', 'delete', 'org',      'Archive projects'),
-- Deployment permissions
('deployments', 'create',  'org',      'Trigger deployments on any project'),
('deployments', 'create',  'assigned', 'Trigger deployments on assigned projects'),
('deployments', 'read',    'org',      'View all deployment logs'),
('deployments', 'read',    'assigned', 'View deployment logs for assigned projects'),
('deployments', 'rollback','org',      'Rollback any deployment'),
-- Vault permissions
('vault', 'read',    'org',      'View encrypted secrets (masked)'),
('vault', 'decrypt', 'org',      'Decrypt secrets platform-wide'),
('vault', 'decrypt', 'assigned', 'Decrypt secrets for assigned projects'),
('vault', 'create',  'org',      'Store new secrets'),
-- Billing permissions
('billing', 'read',   'org',  'View all invoices and MRR data'),
('billing', 'read',   'own',  'View own invoices (portal)'),
('billing', 'create', 'org',  'Create invoices'),
('billing', 'update', 'org',  'Update invoice status'),
-- Agent permissions
('agents', 'read',    'org', 'View all agents'),
('agents', 'execute', 'org', 'Dispatch agent tasks'),
('agents', 'create',  'org', 'Create/configure agents'),
-- SLM permissions
('slm', 'read',  'org', 'View SLM models'),
('slm', 'train', 'org', 'Train/fine-tune models'),
('slm', 'create','org', 'Add new SLM models'),
-- Marketing permissions
('marketing', 'read',   'org', 'View campaigns'),
('marketing', 'create', 'org', 'Create campaigns'),
('marketing', 'update', 'org', 'Update/rebalance campaigns'),
-- Telemetry permissions
('telemetry', 'read',   'org',  'View telemetry data'),
('telemetry', 'read',   'own',  'View own package telemetry'),
('telemetry', 'update', 'org',  'Trigger auto-updates'),
-- Workflow permissions
('workflows', 'read',    'org', 'View workflows'),
('workflows', 'create',  'org', 'Create workflows'),
('workflows', 'execute', 'org', 'Trigger workflow runs'),
-- Backup permissions
('backups', 'read',   'org', 'View backup records'),
('backups', 'create', 'org', 'Create manual backups'),
-- System permissions
('settings', 'read',   'org', 'View system settings'),
('settings', 'update', 'org', 'Modify system settings'),
('users',    'read',   'org', 'View team members'),
('users',    'create', 'org', 'Invite team members'),
('users',    'update', 'org', 'Update team member roles'),
('users',    'delete', 'org', 'Deactivate team members');

-- Assign all permissions to super_admin
INSERT INTO auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM auth.roles r, auth.permissions p
WHERE r.name = 'super_admin';

-- Seed: Default Organization
INSERT INTO auth.organizations (id, name, slug, plan_tier) VALUES
('00000000-0000-0000-0000-000000000001', 'Launch Up HQ', 'launchup-hq', 'enterprise');

