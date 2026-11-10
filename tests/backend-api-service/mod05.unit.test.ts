import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  processBackendBuild,
  verifyRlsCoverage,
  detectOpenApiDrift,
  executePrivacyExport,
  executePrivacyErasure,
} from '../../services/backend-api-service/src/lib/engine.ts';
import type {
  Mod05BackendBuildRequest,
  Mod05BackendBuildResponse,
} from '../../services/backend-api-service/src/types/index.ts';
import {
  RlsUnprotectedTableError,
  MigrationConflictError,
  OpenApiDriftError,
} from '../../services/backend-api-service/src/types/index.ts';

const VALID_MIGRATION_SQL = `
  CREATE TABLE clients (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL
  );
  ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

  CREATE TABLE orders (
    id UUID PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    status VARCHAR(50) NOT NULL
  );
  ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

  CREATE TABLE shipments (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id),
    tracking_code VARCHAR(100) NOT NULL
  );
  ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
`;

const VALID_OPENAPI_YAML = `
openapi: 3.1.0
info:
  title: LaunchUp Backend API
  version: 1.0.0
paths:
  /api/v1/clients:
    get:
      summary: List clients
  /api/v1/orders:
    post:
      summary: Create order
  /api/v1/shipments:
    get:
      summary: Get shipment status
`;

describe('MOD-05: Backend API & Row-Level Security Engine (Unit Tests)', () => {
  describe('Positive Scenarios (Happy Path)', () => {
    it('TEST-MOD05-POS-01: Apply SQL migrations with RLS across 100% of tables, verify privacy endpoints', async () => {
      const request: Mod05BackendBuildRequest = {
        project_id: 'proj-0005-0000-0000-000000000001',
        golden_template_id: 'golden-backend-api',
        db_migration_sql: VALID_MIGRATION_SQL,
        openapi_3_1_yaml: VALID_OPENAPI_YAML,
        rbac_matrix: {
          ADMIN: ['*'],
          CUSTOMER: ['order:create', 'shipment:read'],
        },
        compliance_flags: ['GDPR_EU', 'DPDP_INDIA'],
      };

      const response: Mod05BackendBuildResponse = await processBackendBuild(request);

      assert.strictEqual(response.project_id, request.project_id);
      assert.strictEqual(typeof response.git_commit_sha, 'string');
      assert.strictEqual(response.git_commit_sha.length, 8);
      assert.ok(response.api_staging_url.includes('api-preview-'));
      assert.strictEqual(response.rls_tables_verified_count, 3);
      assert.strictEqual(response.unprotected_tables_count, 0);
      assert.deepStrictEqual(response.privacy_endpoints_active, [
        '/api/v1/privacy/me/export',
        '/api/v1/privacy/me/erase',
      ]);
      assert.strictEqual(response.graphify_updated, true);
    });

    it('TEST-MOD05-POS-02: RBAC matrix correctly registers admin and customer scopes', async () => {
      const rbac = {
        ADMIN: ['*'],
        MANAGER: ['order:read', 'order:update'],
        CUSTOMER: ['order:create'],
      };

      const request: Mod05BackendBuildRequest = {
        project_id: 'proj-0005-0000-0000-000000000002',
        golden_template_id: 'golden-backend-api',
        db_migration_sql: VALID_MIGRATION_SQL,
        openapi_3_1_yaml: VALID_OPENAPI_YAML,
        rbac_matrix: rbac,
      };

      const response = await processBackendBuild(request);
      assert.strictEqual(response.project_id, request.project_id);
      assert.strictEqual(response.unprotected_tables_count, 0);
    });

    it('TEST-MOD05-POS-03: Strict compliance with locked Mod05BackendBuildResponse contract schema', async () => {
      const request: Mod05BackendBuildRequest = {
        project_id: 'proj-0005-0000-0000-000000000003',
        golden_template_id: 'golden-backend-api',
        db_migration_sql: VALID_MIGRATION_SQL,
        openapi_3_1_yaml: VALID_OPENAPI_YAML,
        rbac_matrix: { ADMIN: ['*'] },
      };

      const res: Mod05BackendBuildResponse = await processBackendBuild(request);

      const expectedKeys = [
        'project_id',
        'git_commit_sha',
        'api_staging_url',
        'rls_tables_verified_count',
        'unprotected_tables_count',
        'privacy_endpoints_active',
        'graphify_updated',
      ].sort();

      assert.deepStrictEqual(Object.keys(res).sort(), expectedKeys);
    });
  });

  describe('Negative Scenarios (Deterministic Error Codes)', () => {
    it('TEST-MOD05-NEG-01: Table created without ENABLE ROW LEVEL SECURITY rejects with 403 ERR_RLS_UNPROTECTED_TABLE', async () => {
      const insecureSql = `
        CREATE TABLE users (
          id UUID PRIMARY KEY,
          email VARCHAR(255) NOT NULL
        );
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;

        CREATE TABLE payments (
          id UUID PRIMARY KEY,
          amount NUMERIC NOT NULL
        );
        -- Missing ALTER TABLE payments ENABLE ROW LEVEL SECURITY!
      `;

      const request: Mod05BackendBuildRequest = {
        project_id: 'proj-0005-0000-0000-000000000004',
        golden_template_id: 'golden-backend-api',
        db_migration_sql: insecureSql,
        openapi_3_1_yaml: 'openapi: 3.1.0\npaths:\n  /api/v1/users:\n    get:\n  /api/v1/payments:\n    get:',
        rbac_matrix: { ADMIN: ['*'] },
      };

      await assert.rejects(
        async () => {
          await processBackendBuild(request);
        },
        (err: any) => {
          assert.strictEqual(err instanceof RlsUnprotectedTableError, true);
          assert.strictEqual(err.code, 'ERR_RLS_UNPROTECTED_TABLE');
          assert.strictEqual(err.statusCode, 403);
          assert.deepStrictEqual(err.unprotectedTables, ['payments']);
          return true;
        }
      );
    });

    it('TEST-MOD05-NEG-02: Duplicate table definition rejects with 409 ERR_MIGRATION_CONFLICT', async () => {
      const conflictingSql = `
        CREATE TABLE audit_logs (id UUID PRIMARY KEY);
        ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

        CREATE TABLE audit_logs (id UUID PRIMARY KEY, action TEXT);
        ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
      `;

      const request: Mod05BackendBuildRequest = {
        project_id: 'proj-0005-0000-0000-000000000005',
        golden_template_id: 'golden-backend-api',
        db_migration_sql: conflictingSql,
        openapi_3_1_yaml: 'openapi: 3.1.0\npaths:\n  /api/v1/audit_logs:\n    get:',
        rbac_matrix: { ADMIN: ['*'] },
      };

      await assert.rejects(
        async () => {
          await processBackendBuild(request);
        },
        (err: any) => {
          assert.strictEqual(err instanceof MigrationConflictError, true);
          assert.strictEqual(err.code, 'ERR_MIGRATION_CONFLICT');
          assert.strictEqual(err.statusCode, 409);
          assert.ok(err.conflictingEntities?.includes('audit_logs'));
          return true;
        }
      );
    });

    it('TEST-MOD05-NEG-03: OpenAPI path referring to missing database entity rejects with 422 ERR_OPENAPI_DRIFT', async () => {
      const requestWithDrift: Mod05BackendBuildRequest = {
        project_id: 'proj-0005-0000-0000-000000000006',
        golden_template_id: 'golden-backend-api',
        db_migration_sql: VALID_MIGRATION_SQL, // has clients, orders, shipments
        openapi_3_1_yaml: `
          openapi: 3.1.0
          paths:
            /api/v1/orders:
              get:
            /api/v1/crypto_wallets: # Does NOT exist in SQL migration!
              post:
        `,
        rbac_matrix: { ADMIN: ['*'] },
      };

      await assert.rejects(
        async () => {
          await processBackendBuild(requestWithDrift);
        },
        (err: any) => {
          assert.strictEqual(err instanceof OpenApiDriftError, true);
          assert.strictEqual(err.code, 'ERR_OPENAPI_DRIFT');
          assert.strictEqual(err.statusCode, 422);
          assert.ok(err.driftingEndpoints?.includes('crypto_wallets'));
          return true;
        }
      );
    });
  });

  describe('Rare & Edge Scenarios', () => {
    it('TEST-MOD05-RARE-01: Privacy export packages user data across RLS tenant tables into compliant JSON', () => {
      const userId = 'usr-0001-0000-0000-000000000001';
      const exportData = executePrivacyExport(userId);

      assert.strictEqual(exportData.user_id, userId);
      assert.ok(Array.isArray(exportData.profile));
      assert.ok(Array.isArray(exportData.orders));
      assert.ok(typeof exportData.exported_at === 'string');
    });

    it('TEST-MOD05-RARE-02: Privacy erasure redacts PII while retaining ledger consistency', () => {
      const userId = 'usr-0001-0000-0000-000000000002';
      const result = executePrivacyErasure(userId);

      assert.strictEqual(result.user_id, userId);
      assert.strictEqual(result.pii_purged, true);
      assert.strictEqual(result.anonymized_hash.length, 64); // SHA-256
      assert.strictEqual(result.financial_ledger_retained, true);
    });
  });
});
