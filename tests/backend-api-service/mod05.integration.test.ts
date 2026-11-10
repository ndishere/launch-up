import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import {
  processBackendBuild,
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
  CREATE TABLE clients (id UUID PRIMARY KEY, name VARCHAR(255));
  ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

  CREATE TABLE orders (id UUID PRIMARY KEY, client_id UUID);
  ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
`;

const VALID_OPENAPI_YAML = `
openapi: 3.1.0
paths:
  /api/v1/clients:
    get:
  /api/v1/orders:
    post:
`;

function createBackendApiHttpServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    const sendJson = (status: number, data: any) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(200, {
        status: 'ok',
        service: 'backend-api-service',
        timestamp: new Date().toISOString(),
      });
    }

    if (req.method === 'GET' && url.pathname === '/api/v1/privacy/me/export') {
      const userId = url.searchParams.get('user_id') || 'usr-test-01';
      return sendJson(200, executePrivacyExport(userId));
    }

    if (req.method === 'DELETE' && url.pathname === '/api/v1/privacy/me/erase') {
      const userId = url.searchParams.get('user_id') || 'usr-test-01';
      return sendJson(200, executePrivacyErasure(userId));
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/backend/build') {
      let b = '';
      req.on('data', c => { b += c; });
      req.on('end', async () => {
        try {
          let body: Mod05BackendBuildRequest;
          try {
            body = JSON.parse(b);
          } catch {
            return sendJson(400, {
              success: false,
              code: 'ERR_VALIDATION',
              error: 'Malformed JSON payload',
            });
          }

          if (
            !body.project_id ||
            !body.golden_template_id ||
            !body.db_migration_sql ||
            !body.openapi_3_1_yaml
          ) {
            return sendJson(400, {
              success: false,
              code: 'ERR_VALIDATION',
              error: 'Missing mandatory fields: project_id, golden_template_id, db_migration_sql, openapi_3_1_yaml',
            });
          }

          const response: Mod05BackendBuildResponse = await processBackendBuild(body);
          return sendJson(200, response);
        } catch (err: any) {
          if (err instanceof RlsUnprotectedTableError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
              unprotectedTables: err.unprotectedTables,
            });
          }
          if (err instanceof MigrationConflictError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
              conflictingEntities: err.conflictingEntities,
            });
          }
          if (err instanceof OpenApiDriftError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
              driftingEndpoints: err.driftingEndpoints,
            });
          }
          return sendJson(500, {
            success: false,
            code: 'ERR_BACKEND_BUILD',
            error: 'Internal Server Error',
          });
        }
      });
      return;
    }

    return sendJson(404, { error: 'Not Found' });
  });
}

describe('MOD-05: Backend API & Row-Level Security Engine (Integration & HTTP Contract Tests)', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    server = createBackendApiHttpServer();
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('MOD05-INT-01: GET /health returns 200 OK with service identity', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.service, 'backend-api-service');
  });

  it('MOD05-INT-02: POST /api/v1/backend/build returns 200 and matches locked Mod05BackendBuildResponse contract', async () => {
    const payload: Mod05BackendBuildRequest = {
      project_id: 'proj-0005-0000-0000-000000000010',
      golden_template_id: 'golden-backend-api',
      db_migration_sql: VALID_MIGRATION_SQL,
      openapi_3_1_yaml: VALID_OPENAPI_YAML,
      rbac_matrix: { ADMIN: ['*'] },
      compliance_flags: ['GDPR_EU', 'DPDP_INDIA'],
    };

    const res = await fetch(`${baseUrl}/api/v1/backend/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const data: Mod05BackendBuildResponse = await res.json();

    assert.strictEqual(data.project_id, payload.project_id);
    assert.strictEqual(typeof data.git_commit_sha, 'string');
    assert.strictEqual(data.git_commit_sha.length, 8);
    assert.ok(data.api_staging_url.includes('api-preview-'));
    assert.strictEqual(data.rls_tables_verified_count, 2);
    assert.strictEqual(data.unprotected_tables_count, 0);
    assert.deepStrictEqual(data.privacy_endpoints_active, [
      '/api/v1/privacy/me/export',
      '/api/v1/privacy/me/erase',
    ]);
    assert.strictEqual(data.graphify_updated, true);
  });

  it('MOD05-INT-03: POST /api/v1/backend/build returns 400 on missing mandatory parameters', async () => {
    const invalidPayload = {
      project_id: 'proj-0005-0000-0000-000000000011',
      // missing golden_template_id, db_migration_sql, openapi_3_1_yaml
    };

    const res = await fetch(`${baseUrl}/api/v1/backend/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_VALIDATION');
  });

  it('MOD05-INT-04: POST /api/v1/backend/build returns 403 ERR_RLS_UNPROTECTED_TABLE on unprotected table', async () => {
    const unprotectedPayload: Mod05BackendBuildRequest = {
      project_id: 'proj-0005-0000-0000-000000000012',
      golden_template_id: 'golden-backend-api',
      db_migration_sql: `
        CREATE TABLE users (id UUID PRIMARY KEY);
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;

        CREATE TABLE sensitive_data (id UUID PRIMARY KEY);
      `,
      openapi_3_1_yaml: 'openapi: 3.1.0\npaths:\n  /api/v1/users:\n    get:\n  /api/v1/sensitive_data:\n    get:',
      rbac_matrix: { ADMIN: ['*'] },
    };

    const res = await fetch(`${baseUrl}/api/v1/backend/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(unprotectedPayload),
    });

    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_RLS_UNPROTECTED_TABLE');
    assert.deepStrictEqual(data.unprotectedTables, ['sensitive_data']);
  });

  it('MOD05-INT-05: POST /api/v1/backend/build returns 409 ERR_MIGRATION_CONFLICT on duplicate table definitions', async () => {
    const conflictPayload: Mod05BackendBuildRequest = {
      project_id: 'proj-0005-0000-0000-000000000013',
      golden_template_id: 'golden-backend-api',
      db_migration_sql: `
        CREATE TABLE orders (id UUID PRIMARY KEY);
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

        CREATE TABLE orders (id UUID PRIMARY KEY, total NUMERIC);
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
      `,
      openapi_3_1_yaml: 'openapi: 3.1.0\npaths:\n  /api/v1/orders:\n    get:',
      rbac_matrix: { ADMIN: ['*'] },
    };

    const res = await fetch(`${baseUrl}/api/v1/backend/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conflictPayload),
    });

    assert.strictEqual(res.status, 409);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_MIGRATION_CONFLICT');
  });

  it('MOD05-INT-06: POST /api/v1/backend/build returns 422 ERR_OPENAPI_DRIFT on unmapped API endpoint', async () => {
    const driftPayload: Mod05BackendBuildRequest = {
      project_id: 'proj-0005-0000-0000-000000000014',
      golden_template_id: 'golden-backend-api',
      db_migration_sql: VALID_MIGRATION_SQL,
      openapi_3_1_yaml: `
        openapi: 3.1.0
        paths:
          /api/v1/clients:
            get:
          /api/v1/unmapped_inventory:
            get:
      `,
      rbac_matrix: { ADMIN: ['*'] },
    };

    const res = await fetch(`${baseUrl}/api/v1/backend/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driftPayload),
    });

    assert.strictEqual(res.status, 422);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_OPENAPI_DRIFT');
  });

  it('MOD05-INT-07: GET /api/v1/privacy/me/export returns 200 and structured user export payload', async () => {
    const res = await fetch(`${baseUrl}/api/v1/privacy/me/export?user_id=usr-123`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user_id, 'usr-123');
    assert.ok(data.profile);
    assert.ok(data.orders);
  });

  it('MOD05-INT-08: DELETE /api/v1/privacy/me/erase returns 200 and cryptographic hash proof of erasure', async () => {
    const res = await fetch(`${baseUrl}/api/v1/privacy/me/erase?user_id=usr-123`, {
      method: 'DELETE',
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user_id, 'usr-123');
    assert.strictEqual(data.pii_purged, true);
    assert.strictEqual(data.financial_ledger_retained, true);
    assert.strictEqual(data.anonymized_hash.length, 64);
  });
});
