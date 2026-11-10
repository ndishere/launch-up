import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  processBaIntake,
  resolveComplianceFlags,
  detectSemanticConflicts,
  synthesizePrd,
  generateSqlMigration,
  generateOpenApiYaml,
} from '../../services/ba-intake-service/src/lib/engine.ts';
import type {
  Mod02IntakeRequest,
} from '../../services/ba-intake-service/src/types/index.ts';
import {
  SchemaInvalidError,
  AmbiguousScopeError,
  UnsupportedLawError,
} from '../../services/ba-intake-service/src/types/index.ts';

/**
 * LAUNCH UP — MOD-02: BA INTAKE & SCOPE SYNTHESIZER
 * Stage 1 Unit Test Suite (TDD)
 *
 * Contract: contracts/module_input_output_contracts.md (MOD-02)
 * Test Matrix: tests/specs/master_tdd_test_matrix_5_stage_pipeline.md (MOD-02)
 */

describe('MOD-02: BA Intake & Scope Synthesizer (Unit Tests)', () => {
  const sampleRequest: Mod02IntakeRequest = {
    project_id: 'proj-0002-0000-0000-000000000001',
    client_id: 'clnt-0002-0000-0000-000000000001',
    intake_transcript: `
      Client: We are launching a multi-regional freight dispatch network across India, Germany, and the United States.
      Architect: What are the primary platforms you need?
      Client: We need a responsive customer portal, an Android driver app for dispatch, and an automated backend with strong database tenancy.
      Architect: Are there specific privacy requirements?
      Client: Yes, Indian customers fall under DPDP, European operations under GDPR, and California under CCPA.
    `,
    brand_assets: {
      primary_color_hex: '#0F172A',
      secondary_color_hex: '#3B82F6',
      font_heading: 'Inter',
      font_body: 'Inter',
    },
    target_countries: ['IN', 'US', 'DE'],
    target_modules: {
      build_website: true,
      build_landing_page: true,
      build_android_app: true,
      build_backend_api: true,
      enable_digital_marketing: true,
      enable_whatsapp_marketing: true,
    },
  };

  // ── POSITIVE SCENARIOS ───────────────────────────────────────────
  describe('Positive Scenarios (Happy Path)', () => {
    it('TEST-MOD02-POS-01: Synthesize valid PRD, SQL DDL with RLS, and OpenAPI 3.1 with DPDP_INDIA, GDPR_EU, CCPA_US', async () => {
      const res = await processBaIntake(sampleRequest);

      // Verify PRD
      assert.strictEqual(res.project_id, sampleRequest.project_id);
      assert.ok(res.prd_json.user_stories.length >= 3);
      assert.strictEqual(res.prd_json.user_stories[0].id, 'US-001');
      assert.ok(res.prd_json.roles_and_permissions.ADMIN.includes('*'));

      // Verify SQL DDL with RLS
      assert.ok(res.db_migration_sql.includes('ENABLE ROW LEVEL SECURITY'));
      assert.ok(res.db_migration_sql.includes('CREATE POLICY'));

      // Verify OpenAPI 3.1
      assert.ok(res.openapi_3_1_yaml.startsWith('openapi: 3.1.0'));
      assert.ok(res.openapi_3_1_yaml.includes('/api/v1/privacy/me/export'));

      // Verify Compliance Flags
      assert.ok(res.compliance_flags.includes('DPDP_INDIA'));
      assert.ok(res.compliance_flags.includes('GDPR_EU'));
      assert.ok(res.compliance_flags.includes('CCPA_US'));
      assert.ok(res.compliance_flags.includes('GOOGLE_PLAY_DATA_SAFETY'));

      // Documentation paths
      assert.strictEqual(res.generated_docs_paths.length, 3);
      assert.strictEqual(res.generated_docs_paths[0], '01_PRD_Executive_Blueprint.md');

      // Approval Gate 2 created
      assert.strictEqual(typeof res.approval_gate_id, 'string');
      assert.strictEqual(res.approval_gate_id.length, 36);
    });

    it('TEST-MOD02-POS-02: Android module automatically attaches GOOGLE_PLAY_DATA_SAFETY compliance', () => {
      const flagsWithAndroid = resolveComplianceFlags(['IN'], {
        build_website: false,
        build_landing_page: false,
        build_android_app: true,
        build_backend_api: false,
        enable_digital_marketing: false,
        enable_whatsapp_marketing: false,
      });
      assert.ok(flagsWithAndroid.includes('GOOGLE_PLAY_DATA_SAFETY'));
      assert.ok(flagsWithAndroid.includes('DPDP_INDIA'));

      const flagsWithoutAndroid = resolveComplianceFlags(['IN'], {
        build_website: true,
        build_landing_page: true,
        build_android_app: false,
        build_backend_api: true,
        enable_digital_marketing: false,
        enable_whatsapp_marketing: false,
      });
      assert.strictEqual(flagsWithoutAndroid.includes('GOOGLE_PLAY_DATA_SAFETY'), false);
    });

    it('TEST-MOD02-POS-03: SQL DDL enforces PostgreSQL Row-Level Security', () => {
      const sql = generateSqlMigration('proj-123', []);
      assert.ok(sql.includes('ALTER TABLE project_orders ENABLE ROW LEVEL SECURITY;'));
      assert.ok(sql.includes('CREATE POLICY project_orders_tenant_isolation ON project_orders'));
    });
  });

  // ── NEGATIVE SCENARIOS ───────────────────────────────────────────
  describe('Negative Scenarios (Deterministic Error Codes)', () => {
    it('TEST-MOD02-NEG-01: Malformed schema or LLM generation error rejects with 422 ERR_SCHEMA_INVALID', async () => {
      await assert.rejects(
        async () => processBaIntake(sampleRequest, { simulateInvalidSchema: true }),
        (err: any) => err instanceof SchemaInvalidError && err.statusCode === 422 && err.code === 'ERR_SCHEMA_INVALID'
      );
    });

    it('TEST-MOD02-NEG-02: Unsupported country code rejects with 400 ERR_UNSUPPORTED_LAW', async () => {
      const badCountryRequest: Mod02IntakeRequest = {
        ...sampleRequest,
        target_countries: ['INVALID_COUNTRY_XYZ'],
      };

      await assert.rejects(
        async () => processBaIntake(badCountryRequest),
        (err: any) => err instanceof UnsupportedLawError && err.statusCode === 400 && err.code === 'ERR_UNSUPPORTED_LAW'
      );
    });
  });

  // ── RARE & EDGE SCENARIOS ─────────────────────────────────────────
  describe('Rare & Edge Scenarios (Conflict Detection)', () => {
    it('TEST-MOD02-RARE-01: Contradictory co-owner requirements (Guest checkout vs Mandatory OTP) rejects with 409 ERR_AMBIGUOUS_SCOPE', () => {
      const conflictingTranscript = `
        Co-Owner A: We want seamless guest checkout with no login required for instant conversions.
        Co-Owner B: All users must complete mandatory OTP login before viewing catalog to protect inventory.
      `;

      assert.throws(
        () => detectSemanticConflicts(conflictingTranscript),
        (err: any) => err instanceof AmbiguousScopeError && err.statusCode === 409 && err.code === 'ERR_AMBIGUOUS_SCOPE'
      );
    });

    it('TEST-MOD02-RARE-02: Public catalog vs Private exclusive access conflict rejects with 409 ERR_AMBIGUOUS_SCOPE', () => {
      const conflictingTranscript = `
        Stakeholder 1: Keep a public catalog for everyone to browse.
        Stakeholder 2: We must have private exclusive access only for invited B2B members.
      `;

      assert.throws(
        () => detectSemanticConflicts(conflictingTranscript),
        (err: any) => err instanceof AmbiguousScopeError && err.statusCode === 409 && err.code === 'ERR_AMBIGUOUS_SCOPE'
      );
    });
  });
});
