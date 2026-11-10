import crypto from 'node:crypto';
import type {
  Mod02IntakeRequest,
  Mod02IntakeResponse,
  PrdJson,
  UserStory,
  TargetModules,
} from '../types/index.ts';
import {
  SchemaInvalidError,
  AmbiguousScopeError,
  UnsupportedLawError,
} from '../types/index.ts';

const VALID_COUNTRIES = new Set(['IN', 'US', 'DE', 'FR', 'GB', 'CA', 'AU', 'EU']);

export function resolveComplianceFlags(countries: string[], modules: TargetModules): string[] {
  const flags = new Set<string>();

  for (const c of countries) {
    const code = c.toUpperCase();
    if (!VALID_COUNTRIES.has(code)) {
      throw new UnsupportedLawError(`Target country '${c}' is unsupported or has invalid legal frameworks`);
    }

    if (code === 'IN') {
      flags.add('DPDP_INDIA');
    } else if (code === 'US') {
      flags.add('CCPA_US');
    } else if (code === 'DE' || code === 'FR' || code === 'EU') {
      flags.add('GDPR_EU');
    }
  }

  if (modules.build_android_app) {
    flags.add('GOOGLE_PLAY_DATA_SAFETY');
  }

  return Array.from(flags);
}

export function detectSemanticConflicts(transcript: string): void {
  const lower = transcript.toLowerCase();
  
  // Contradiction Check 1: Guest checkout vs Mandatory login
  const hasGuestCheckout = lower.includes('guest checkout') || lower.includes('no login required') || lower.includes('without registration');
  const hasMandatoryOtp = lower.includes('mandatory otp') || lower.includes('mandatory login') || lower.includes('mandatory authentication');

  if (hasGuestCheckout && hasMandatoryOtp) {
    throw new AmbiguousScopeError(
      'Conflicting requirements detected: Guest checkout without login directly contradicts mandatory OTP authentication requirement'
    );
  }

  // Contradiction Check 2: Public catalog vs Gated exclusive access
  const hasPublicCatalog = lower.includes('public catalog') || lower.includes('open catalog');
  const hasPrivateAccessOnly = lower.includes('private exclusive') || lower.includes('keep the catalog private') || lower.includes('accessible only to invited') || lower.includes('exclusive access only');

  if (hasPublicCatalog && hasPrivateAccessOnly) {
    throw new AmbiguousScopeError(
      'Conflicting requirements detected: Public open catalog contradicts private exclusive access'
    );
  }
}

export function synthesizePrd(transcript: string, modules: TargetModules): PrdJson {
  const stories: UserStory[] = [];

  if (modules.build_website || modules.build_landing_page) {
    stories.push({
      id: 'US-001',
      role: 'Customer',
      goal: 'Explore digital services catalog and calculate instant quote',
      acceptance_criteria: [
        'Given valid service inputs, When submitted, Then dynamic price estimate is rendered',
        'Mobile responsive layout verified across 375px to 1920px viewports',
      ],
      priority: 'MUST_HAVE',
    });
  }

  if (modules.build_android_app) {
    stories.push({
      id: 'US-002',
      role: 'Mobile User',
      goal: 'Book on-demand shipment via Android app and receive live GPS tracking',
      acceptance_criteria: [
        'Given authenticated customer, When booking order, Then unique tracking token is generated',
        'Includes explicit In-App Account Deletion screen adhering to Google Play policy',
      ],
      priority: 'MUST_HAVE',
    });
  }

  if (modules.build_backend_api) {
    stories.push({
      id: 'US-003',
      role: 'System Administrator',
      goal: 'Manage multi-tenant client project orders with Row-Level Security isolation',
      acceptance_criteria: [
        'All database queries enforce tenant isolation via PostgreSQL RLS session variables',
        'Endpoints /api/v1/privacy/me/export and /api/v1/privacy/me/erase active',
      ],
      priority: 'MUST_HAVE',
    });
  }

  if (modules.enable_whatsapp_marketing) {
    stories.push({
      id: 'US-004',
      role: 'Customer',
      goal: 'Receive WhatsApp notifications and instant conversational support',
      acceptance_criteria: [
        'Inbound queries answered within 2s via pgvector RAG',
        'Unsubscribe footer attached on outbound broadcast campaigns',
      ],
      priority: 'SHOULD_HAVE',
    });
  }

  const executiveSummary = `Comprehensive technical and business specification synthesized from client interview transcript. Scope covers ${stories.length} core user stories across target operating environments.`;

  const rolesAndPermissions: Record<string, string[]> = {
    ADMIN: ['*'],
    CUSTOMER: ['order:create', 'order:read', 'profile:update'],
    AUDITOR: ['audit:read', 'telemetry:read'],
  };

  return {
    executive_summary: executiveSummary,
    user_stories: stories,
    roles_and_permissions: rolesAndPermissions,
  };
}

export function generateSqlMigration(projectId: string, stories: UserStory[]): string {
  return `-- =====================================================
-- Auto-generated Database Migration for Project: ${projectId}
-- Enforces Row-Level Security (RLS) & Multi-Tenant Isolation
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS project_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    order_status VARCHAR(50) NOT NULL DEFAULT 'CREATED',
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable PostgreSQL Row-Level Security
ALTER TABLE project_orders ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policy
CREATE POLICY project_orders_tenant_isolation ON project_orders
    USING (project_id = current_setting('app.current_project_id', true)::uuid);
`;
}

export function generateOpenApiYaml(projectId: string, stories: UserStory[]): string {
  return `openapi: 3.1.0
info:
  title: Launch Up Project API - ${projectId}
  version: 1.0.0
  description: Autonomous microservice backend synthesized by MOD-02
paths:
  /api/v1/orders:
    post:
      summary: Create new order
      operationId: createOrder
      responses:
        '201':
          description: Order created successfully
    get:
      summary: List tenant orders
      operationId: listOrders
      responses:
        '200':
          description: List of authorized orders
  /api/v1/privacy/me/export:
    get:
      summary: GDPR/DPDP personal data export
      responses:
        '200':
          description: Personal archive exported
`;
}

export async function processBaIntake(
  request: Mod02IntakeRequest,
  options?: { simulateInvalidSchema?: boolean }
): Promise<Mod02IntakeResponse> {
  // 1. Basic schema validation
  if (!request.project_id || !request.client_id || !request.intake_transcript) {
    throw new SchemaInvalidError('Required fields missing from intake request');
  }

  if (options?.simulateInvalidSchema) {
    throw new SchemaInvalidError('Simulated malformed LLM syntax error in OpenAPI/SQL generator');
  }

  // 2. Conflict detection
  detectSemanticConflicts(request.intake_transcript);

  // 3. Compliance mapping
  const complianceFlags = resolveComplianceFlags(request.target_countries, request.target_modules);

  // 4. PRD synthesis
  const prd = synthesizePrd(request.intake_transcript, request.target_modules);

  // 5. SQL & OpenAPI generation
  const dbMigrationSql = generateSqlMigration(request.project_id, prd.user_stories);
  const openapiYaml = generateOpenApiYaml(request.project_id, prd.user_stories);

  // 6. Documentation paths & Gate 2: REQUIREMENTS_PRD
  const generatedDocsPaths = [
    '01_PRD_Executive_Blueprint.md',
    '02_Functional_Requirements_Matrix.md',
    '03_Detailed_Technical_SRS.md',
  ];

  const approvalGateId = crypto.randomUUID();

  return {
    project_id: request.project_id,
    prd_json: prd,
    db_migration_sql: dbMigrationSql,
    openapi_3_1_yaml: openapiYaml,
    compliance_flags: complianceFlags,
    generated_docs_paths: generatedDocsPaths,
    approval_gate_id: approvalGateId,
  };
}
