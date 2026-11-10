-- =====================================================
-- Launch Up — MOD-10: M:N Tenancy, RBAC & FinOps Governance Core
-- Migration: 002_mod10_rbac_finops.sql
-- 
-- Adds: principals (unified HUMAN + AI_AGENT), project_memberships,
--       client_project_links (M:N with relationship types), 
--       approval_gates (LangGraph integration), budget tracking
-- =====================================================

-- 1. Add budget tracking columns to projects.projects
ALTER TABLE projects.projects
  ADD COLUMN IF NOT EXISTS monthly_token_budget_usd NUMERIC(10, 2) NOT NULL DEFAULT 25.00,
  ADD COLUMN IF NOT EXISTS tokens_spent_usd         NUMERIC(10, 2) NOT NULL DEFAULT 0.00;

-- 2. Principals — Unified identity for both HUMAN users and AI_AGENTS
CREATE TABLE auth.principals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    principal_type  VARCHAR(20) NOT NULL CHECK (principal_type IN ('HUMAN', 'AI_AGENT')),
    identifier      VARCHAR(255) UNIQUE NOT NULL,    -- email for HUMAN, agent-key for AI_AGENT
    display_name    VARCHAR(255) NOT NULL,
    is_super_admin  BOOLEAN NOT NULL DEFAULT FALSE,
    -- For HUMAN: links to auth.users; For AI_AGENT: NULL
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    org_id          UUID NOT NULL REFERENCES auth.organizations(id) ON DELETE CASCADE,
    metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_principals_org ON auth.principals(org_id);
CREATE INDEX idx_principals_type ON auth.principals(principal_type);
CREATE INDEX idx_principals_user ON auth.principals(user_id) WHERE user_id IS NOT NULL;

ALTER TABLE auth.principals ENABLE ROW LEVEL SECURITY;
CREATE POLICY principals_tenant_isolation ON auth.principals
    USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- 3. Client-Project Links — M:N with relationship types and billing shares
--    (Extends existing clients.client_projects with richer relationship model)
CREATE TABLE auth.client_project_links (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id             UUID NOT NULL REFERENCES clients.clients(id) ON DELETE CASCADE,
    project_id            UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
    relationship_type     VARCHAR(50) NOT NULL CHECK (relationship_type IN (
        'PRIMARY_OWNER', 'CO_OWNER', 'AGENCY_PARTNER', 'VENDOR'
    )),
    billing_share_percent NUMERIC(5, 2) NOT NULL DEFAULT 100.00
        CHECK (billing_share_percent >= 0 AND billing_share_percent <= 100),
    org_id                UUID NOT NULL REFERENCES auth.organizations(id) ON DELETE CASCADE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(client_id, project_id)
);

CREATE INDEX idx_client_project_links_client ON auth.client_project_links(client_id);
CREATE INDEX idx_client_project_links_project ON auth.client_project_links(project_id);
CREATE INDEX idx_client_project_links_org ON auth.client_project_links(org_id);

ALTER TABLE auth.client_project_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_project_links_tenant_isolation ON auth.client_project_links
    USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- 4. Project Memberships — Principal-scoped access with gate approval rights
CREATE TABLE auth.project_memberships (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    principal_id    UUID NOT NULL REFERENCES auth.principals(id) ON DELETE CASCADE,
    client_id       UUID REFERENCES clients.clients(id) ON DELETE CASCADE,
    project_id      UUID REFERENCES projects.projects(id) ON DELETE CASCADE,
    role_id         UUID NOT NULL REFERENCES auth.roles(id) ON DELETE RESTRICT,
    can_approve_gates BOOLEAN NOT NULL DEFAULT FALSE,
    org_id          UUID NOT NULL REFERENCES auth.organizations(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(principal_id, client_id, project_id, role_id)
);

CREATE INDEX idx_project_memberships_principal ON auth.project_memberships(principal_id);
CREATE INDEX idx_project_memberships_project ON auth.project_memberships(project_id);
CREATE INDEX idx_project_memberships_client ON auth.project_memberships(client_id);
CREATE INDEX idx_project_memberships_org ON auth.project_memberships(org_id);

ALTER TABLE auth.project_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY project_memberships_tenant_isolation ON auth.project_memberships
    USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- 5. Approval Gates — Human-in-the-loop decision points for LangGraph
CREATE TABLE auth.approval_gates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id          UUID NOT NULL REFERENCES projects.projects(id) ON DELETE CASCADE,
    langgraph_thread_id VARCHAR(255) NOT NULL,
    gate_stage          VARCHAR(100) NOT NULL CHECK (gate_stage IN (
        'OUTREACH_PITCH', 'REQUIREMENTS_PRD', 'PRODUCTION_DEPLOY',
        'MARKETING_PUBLISH', 'HOTFIX_MERGE'
    )),
    artifact_summary    TEXT NOT NULL,
    artifact_payload    JSONB NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED'
    )),
    decided_by          UUID REFERENCES auth.principals(id),
    feedback_notes      TEXT,
    decided_at          TIMESTAMPTZ,
    org_id              UUID NOT NULL REFERENCES auth.organizations(id) ON DELETE CASCADE,
    -- Optimistic locking: prevents concurrent approval race conditions
    version             INTEGER NOT NULL DEFAULT 1,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_approval_gates_project ON auth.approval_gates(project_id);
CREATE INDEX idx_approval_gates_status ON auth.approval_gates(status) WHERE status = 'PENDING';
CREATE INDEX idx_approval_gates_org ON auth.approval_gates(org_id);

ALTER TABLE auth.approval_gates ENABLE ROW LEVEL SECURITY;
CREATE POLICY approval_gates_tenant_isolation ON auth.approval_gates
    USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- 6. Seed MOD-10 specific roles into auth.roles
INSERT INTO auth.roles (name, display_name, description, is_system_role) VALUES
('client_approver',  'Client Approver',      'Can read projects and approve/reject gates',           true),
('agent_marketer',   'AI Marketing Agent',    'Scoped AI agent for marketing drafts only',            true),
('agent_coder',      'AI Coding Agent',       'Scoped AI agent for code write operations',            true),
('agency_partner',   'Agency Partner',        'External partner with scoped project access',          true)
ON CONFLICT (name) DO NOTHING;

-- 7. Seed MOD-10 specific permissions
INSERT INTO auth.permissions (resource, action, scope, description) VALUES
('gate', 'approve',  'assigned', 'Approve/reject gates on assigned projects'),
('gate', 'read',     'org',      'View all gates in organization'),
('gate', 'read',     'assigned', 'View gates on assigned projects'),
('code', 'write',    'assigned', 'Write code on assigned projects'),
('code', 'read',     'assigned', 'Read code on assigned projects'),
('marketing', 'draft', 'assigned', 'Draft marketing content on assigned projects')
ON CONFLICT (resource, action, scope) DO NOTHING;

-- 8. Wire client_approver role permissions
INSERT INTO auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM auth.roles r, auth.permissions p
WHERE r.name = 'client_approver'
  AND (
    (p.resource = 'gate' AND p.action = 'approve' AND p.scope = 'assigned')
    OR (p.resource = 'gate' AND p.action = 'read' AND p.scope = 'assigned')
    OR (p.resource = 'projects' AND p.action = 'read' AND p.scope = 'assigned')
  )
ON CONFLICT DO NOTHING;

-- Wire agent_marketer role permissions
INSERT INTO auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM auth.roles r, auth.permissions p
WHERE r.name = 'agent_marketer'
  AND (
    (p.resource = 'marketing' AND p.action = 'draft' AND p.scope = 'assigned')
    OR (p.resource = 'marketing' AND p.action = 'read' AND p.scope = 'org')
  )
ON CONFLICT DO NOTHING;
