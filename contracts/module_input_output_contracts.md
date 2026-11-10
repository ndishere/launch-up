# LAUNCH UP — LOCKED MODULE INPUT/OUTPUT CONTRACTS (DESIGN-BY-CONTRACT)

> **STRICT ARCHITECTURAL RULE:** Every module in **Launch Up** is an isolated black box. Coding AI models must strictly implement the Input JSON schemas, Output JSON schemas, and Error Codes defined in this file. Never alter field names or types without explicit approval from the Senior Architect.

---

## 1. Core Database & RBAC Relational Contract (Foundation for `MOD-10`)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    country_code CHAR(2) NOT NULL DEFAULT 'US',
    billing_tier VARCHAR(50) DEFAULT 'standard',
    whatsapp_number VARCHAR(30),
    brand_kit_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    project_type VARCHAR(50) NOT NULL CHECK (project_type IN (
        'WEBSITE', 'ANDROID_APP', 'LANDING_PAGE', 'BACKEND_API',
        'DIGITAL_MARKETING', 'WHATSAPP_MARKETING', 'FULL_SUITE'
    )),
    status VARCHAR(50) DEFAULT 'ONBOARDING',
    golden_template_id VARCHAR(100),
    git_repo_url TEXT,
    staging_url TEXT,
    production_url TEXT,
    monthly_token_budget_usd NUMERIC(10, 2) DEFAULT 25.00,
    tokens_spent_usd NUMERIC(10, 2) DEFAULT 0.00,
    config_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Many-to-Many: 1 Client -> N Projects AND 1 Project -> N Clients/Partners
CREATE TABLE client_project_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN (
        'PRIMARY_OWNER', 'CO_OWNER', 'AGENCY_PARTNER', 'VENDOR'
    )),
    billing_share_percent NUMERIC(5, 2) DEFAULT 100.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, project_id)
);

-- Unified Principals (Both Human Users & Scoped AI Agents)
CREATE TABLE principals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    principal_type VARCHAR(20) NOT NULL CHECK (principal_type IN ('HUMAN', 'AI_AGENT')),
    identifier VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    is_super_admin BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_key VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL
);

CREATE TABLE project_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    principal_id UUID NOT NULL REFERENCES principals(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    can_approve_gates BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(principal_id, client_id, project_id, role_id)
);

CREATE TABLE approval_gates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    langgraph_thread_id VARCHAR(255) NOT NULL,
    gate_stage VARCHAR(100) NOT NULL CHECK (gate_stage IN (
        'OUTREACH_PITCH', 'REQUIREMENTS_PRD', 'PRODUCTION_DEPLOY', 'MARKETING_PUBLISH', 'HOTFIX_MERGE'
    )),
    artifact_summary TEXT NOT NULL,
    artifact_payload JSONB NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED')),
    decided_by UUID REFERENCES principals(id),
    feedback_notes TEXT,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. Module-by-Module JSON Input/Output Contracts

### `MOD-10`: M:N Tenancy, RBAC & FinOps Governance Core
* **Input Contract (`Mod10AuthRequest`):**
```json
{
  "principal_id": "uuid-string",
  "client_id": "uuid-string-or-null",
  "project_id": "uuid-string",
  "requested_action": "project:read | code:write | gate:approve | marketing:draft",
  "estimated_cost_usd": 0.05
}
```
* **Output Contract (`Mod10AuthResponse`):**
```json
{
  "authorized": true,
  "principal_type": "HUMAN | AI_AGENT",
  "effective_role": "CLIENT_APPROVER",
  "rls_session_token": "signed-jwt-token",
  "remaining_budget_usd": 24.95,
  "budget_tier_fallback": "NONE | TIER_2 | TIER_3",
  "gate_required": true
}
```
* **Deterministic Error Codes:**
  * `ERR_RBAC_DENIED (403)`: Principal lacks permission or `AI_AGENT` attempted to approve a human gate.
  * `ERR_TENANT_MISMATCH (403)`: Principal has no valid membership in `project_memberships` for `project_id`.
  * `ERR_BUDGET_EXCEEDED (402)`: Project token spend exceeds `monthly_token_budget_usd`.
  * `ERR_CIRCULAR_TENANCY (422)`: Circular partner/vendor hierarchy detected in `client_project_links`.

---

### `MOD-01`: Lead Discovery & Canva Pitch Engine
* **Input Contract (`Mod01LeadRequest`):**
```json
{
  "target_niche": "regional-logistics",
  "country_code": "IN",
  "city": "Amritsar",
  "max_leads": 10,
  "canva_pitch_template_id": "DAG_canva_template_01"
}
```
* **Output Contract (`Mod01LeadResponse`):**
```json
{
  "leads_generated": [
    {
      "lead_id": "uuid-string",
      "company_name": "Example Logistics Pvt Ltd",
      "website_url": "https://example.com",
      "digital_gaps_found": ["NO_ANDROID_APP", "LIGHTHOUSE_MOBILE_BELOW_50", "NO_WHATSAPP_BOT"],
      "applicable_compliance": ["DPDP_INDIA_2023", "CERT_IN"],
      "canva_proposal_pdf_url": "https://export.canva.com/proposal_01.pdf",
      "approval_gate_id": "uuid-string"
    }
  ]
}
```
* **Deterministic Error Codes:** `ERR_SCRAPE_TIMEOUT (504)`, `ERR_CANVA_AUTOFILL_FAIL (502)`, `ERR_DNC_LIST_BLOCKED (422)`.

---

### `MOD-02`: BA Intake & Scope Synthesizer
* **Input Contract (`Mod02IntakeRequest`):**
```json
{
  "project_id": "uuid-string",
  "client_id": "uuid-string",
  "intake_transcript": "Client interview Q&A transcript...",
  "brand_assets": {
    "primary_color_hex": "#0F172A",
    "secondary_color_hex": "#3B82F6",
    "font_heading": "Inter",
    "font_body": "Inter"
  },
  "target_countries": ["IN", "US", "DE"],
  "target_modules": {
    "build_website": true,
    "build_landing_page": true,
    "build_android_app": true,
    "build_backend_api": true,
    "enable_digital_marketing": true,
    "enable_whatsapp_marketing": true
  }
}
```
* **Output Contract (`Mod02IntakeResponse`):**
```json
{
  "project_id": "uuid-string",
  "prd_json": {
    "executive_summary": "string",
    "user_stories": [
      {
        "id": "US-001",
        "role": "Customer",
        "goal": "Book a shipment via Android app or Website",
        "acceptance_criteria": ["Given valid address, When submitted, Then order ID is returned"],
        "priority": "MUST_HAVE"
      }
    ],
    "roles_and_permissions": {"ADMIN": ["*"], "CUSTOMER": ["order:create", "order:read"]}
  },
  "db_migration_sql": "CREATE TABLE ... ENABLE ROW LEVEL SECURITY;",
  "openapi_3_1_yaml": "openapi: 3.1.0\ninfo: ...",
  "compliance_flags": ["DPDP_INDIA", "GDPR_EU", "CCPA_US", "GOOGLE_PLAY_DATA_SAFETY"],
  "generated_docs_paths": [
    "01_PRD_Executive_Blueprint.md",
    "02_Functional_Requirements_Matrix.md",
    "03_Detailed_Technical_SRS.md"
  ],
  "approval_gate_id": "uuid-string"
}
```
* **Deterministic Error Codes:** `ERR_SCHEMA_INVALID (422)`, `ERR_AMBIGUOUS_SCOPE (409)`, `ERR_UNSUPPORTED_LAW (400)`.

---

### `MOD-03`: Responsive Web & Landing Page Builder
* **Input Contract (`Mod03WebBuildRequest`):**
```json
{
  "project_id": "uuid-string",
  "golden_template_id": "golden-web-landing",
  "openapi_3_1_yaml": "string",
  "brand_assets": {},
  "compliance_flags": ["GDPR_EU", "DPDP_INDIA"],
  "ga4_measurement_id": "G-XXXXXXXXXX",
  "file_deltas": [
    {"file_path": "src/app/booking/page.tsx", "operation": "CREATE", "linked_user_story_ids": ["US-001"]}
  ]
}
```
* **Output Contract (`Mod03WebBuildResponse`):**
```json
{
  "project_id": "uuid-string",
  "git_commit_sha": "a1b2c3d4",
  "staging_preview_url": "https://preview-proj1.launchup.internal",
  "viewports_verified": ["375px", "768px", "1280px", "1920px"],
  "rtl_verified": true,
  "cookie_consent_banner_active": true,
  "graphify_updated": true
}
```
* **Deterministic Error Codes:** `ERR_BUILD_COMPILE (500)`, `ERR_VIEWPORT_OVERFLOW (422)`, `ERR_SANDBOX_TIMEOUT (504)`.

---

### `MOD-04`: Android Mobile App Builder
* **Input Contract (`Mod04AndroidBuildRequest`):**
```json
{
  "project_id": "uuid-string",
  "golden_template_id": "golden-mobile-android",
  "openapi_3_1_yaml": "string",
  "brand_assets": {},
  "package_name": "com.client.app",
  "target_sdk_version": 35,
  "file_deltas": []
}
```
* **Output Contract (`Mod04AndroidBuildResponse`):**
```json
{
  "project_id": "uuid-string",
  "git_commit_sha": "e5f6g7h8",
  "signed_apk_url": "https://artifacts.launchup.internal/app-release.apk",
  "signed_aab_url": "https://artifacts.launchup.internal/app-release.aab",
  "play_store_data_safety_csv_url": "https://artifacts.launchup.internal/data_safety.csv",
  "in_app_account_deletion_route": "/settings/delete-account",
  "web_account_deletion_url": "https://preview-proj1.launchup.internal/privacy/delete-account",
  "graphify_updated": true
}
```
* **Deterministic Error Codes:** `ERR_GRADLE_FASTLANE (500)`, `ERR_PLAY_POLICY_MISSING (422)`, `ERR_SIGNING_KEY_INVALID (401)`.

---

### `MOD-05`: Backend API & Row-Level Security (RLS) Engine
* **Input Contract (`Mod05BackendBuildRequest`):**
```json
{
  "project_id": "uuid-string",
  "golden_template_id": "golden-backend-api",
  "db_migration_sql": "string",
  "openapi_3_1_yaml": "string",
  "rbac_matrix": {"ADMIN": ["*"], "CUSTOMER": ["order:create"]},
  "compliance_flags": ["GDPR_EU", "DPDP_INDIA"]
}
```
* **Output Contract (`Mod05BackendBuildResponse`):**
```json
{
  "project_id": "uuid-string",
  "git_commit_sha": "i9j0k1l2",
  "api_staging_url": "https://api-preview-proj1.launchup.internal",
  "rls_tables_verified_count": 6,
  "unprotected_tables_count": 0,
  "privacy_endpoints_active": ["/api/v1/privacy/me/export", "/api/v1/privacy/me/erase"],
  "graphify_updated": true
}
```
* **Deterministic Error Codes:** `ERR_MIGRATION_CONFLICT (409)`, `ERR_RLS_UNPROTECTED_TABLE (403)`, `ERR_OPENAPI_DRIFT (422)`.

---

### `MOD-06`: Autonomous QA, SecOps & Compliance Verifier
* **Input Contract (`Mod06QAVerifyRequest`):**
```json
{
  "project_id": "uuid-string",
  "web_staging_url": "https://preview-proj1.launchup.internal",
  "api_staging_url": "https://api-preview-proj1.launchup.internal",
  "signed_apk_url": "https://artifacts.launchup.internal/app-release.apk",
  "user_stories": []
}
```
* **Output Contract (`Mod06QAVerifyResponse`):**
```json
{
  "project_id": "uuid-string",
  "overall_pass": true,
  "playwright_pass_rate": 100.0,
  "semgrep_critical_findings": 0,
  "trivy_critical_cves": 0,
  "gitleaks_secrets_found": 0,
  "lighthouse_scores": {
    "performance": 94,
    "accessibility": 98,
    "best_practices": 96,
    "seo": 95
  },
  "approval_gate_id": "uuid-string"
}
```
* **Deterministic Error Codes:** `ERR_SECURITY_VULN_FOUND (406)`, `ERR_E2E_ASSERTION_FAIL (422)`, `ERR_LIGHTHOUSE_BELOW_90 (422)`.

---

### `MOD-07`: Canva Pro Digital Marketing Engine
* **Input Contract (`Mod07MarketingRequest`):**
```json
{
  "project_id": "uuid-string",
  "brand_kit": {},
  "campaign_theme": "Festive Logistics Launch",
  "days_count": 30,
  "canva_brand_template_ids": ["DAG_social_01", "DAG_carousel_02"]
}
```
* **Output Contract (`Mod07MarketingResponse`):**
```json
{
  "project_id": "uuid-string",
  "calendar_items": [
    {
      "day": 1,
      "platform": "INSTAGRAM | LINKEDIN | FACEBOOK",
      "caption": "Fastest regional deliveries...",
      "canva_export_url": "https://export.canva.com/day1.png",
      "eu_ai_act_disclosure_attached": true
    }
  ],
  "approval_gate_id": "uuid-string"
}
```
* **Deterministic Error Codes:** `ERR_CANVA_RATE_LIMIT (429)`, `ERR_TEMPLATE_FIELD_MISMATCH (422)`.

---

### `MOD-08`: WhatsApp Marketing & CRM RAG Engine
* **Input Contract (`Mod08WhatsAppRequest`):**
```json
{
  "project_id": "uuid-string",
  "event_type": "INBOUND_CUSTOMER_MSG | OUTBOUND_CAMPAIGN_BROADCAST",
  "recipient_phone_e164": "+919876543210",
  "opt_in_proof_id": "uuid-string-or-null",
  "last_inbound_timestamp": "2026-11-10T10:00:00Z",
  "message_payload": {"text_or_template": "string"}
}
```
* **Output Contract (`Mod08WhatsAppResponse`):**
```json
{
  "project_id": "uuid-string",
  "whatsapp_message_id": "wamid.HBgM...",
  "within_24h_service_window": true,
  "rag_confidence_score": 0.92,
  "escalated_to_human_chatwoot": false,
  "unsubscribe_footer_attached": true
}
```
* **Deterministic Error Codes:** `ERR_NO_OPTIN_PROOF (403)`, `ERR_OUTSIDE_24H_WINDOW (422)`, `ERR_META_API_REJECT (502)`.

---

### `MOD-09`: Autonomous SRE & Self-Healing Backend Operations
* **Input Contract (`Mod09SRERequest`):**
```json
{
  "project_id": "uuid-string",
  "incident_source": "SENTRY_5XX | UPTIME_KUMA_DOWN | GA4_CONVERSION_DROP",
  "error_signature": "ZeroDivisionError in /api/v1/rates",
  "stack_trace_or_metric": {}
}
```
* **Output Contract (`Mod09SREResponse`):**
```json
{
  "project_id": "uuid-string",
  "is_external_third_party_outage": false,
  "rca_summary": "Missing check for zero weight in rate calculator",
  "impacted_graphify_nodes": ["app/services/rates.py::calculate_shipping"],
  "hotfix_pr_url": "https://github.com/org/repo/pull/42",
  "sandbox_regression_passed": true,
  "approval_gate_id": "uuid-string"
}
```
* **Deterministic Error Codes:** `ERR_REPRODUCTION_FAILED (422)`, `ERR_HOTFIX_BROKE_TESTS (409)`, `ERR_MAX_RETRIES_EXCEEDED (508)`.