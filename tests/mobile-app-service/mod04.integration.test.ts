import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { processAndroidBuild } from '../../services/mobile-app-service/src/lib/engine.ts';
import type {
  Mod04AndroidBuildRequest,
  Mod04AndroidBuildResponse,
} from '../../services/mobile-app-service/src/types/index.ts';
import {
  PlayPolicyMissingError,
  SigningKeyInvalidError,
  GradleFastlaneError,
} from '../../services/mobile-app-service/src/types/index.ts';

function createMobileAppHttpServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    const sendJson = (status: number, data: any) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(200, {
        status: 'ok',
        service: 'mobile-app-service',
        timestamp: new Date().toISOString(),
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/mobile/build') {
      let b = '';
      req.on('data', c => { b += c; });
      req.on('end', async () => {
        try {
          let body: Mod04AndroidBuildRequest;
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
            !body.package_name ||
            typeof body.target_sdk_version !== 'number'
          ) {
            return sendJson(400, {
              success: false,
              code: 'ERR_VALIDATION',
              error: 'Missing mandatory fields: project_id, golden_template_id, package_name, target_sdk_version',
            });
          }

          const response: Mod04AndroidBuildResponse = await processAndroidBuild(body);
          return sendJson(200, response);
        } catch (err: any) {
          if (err instanceof PlayPolicyMissingError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
              missingDeclarations: err.missingDeclarations,
            });
          }
          if (err instanceof SigningKeyInvalidError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
            });
          }
          if (err instanceof GradleFastlaneError) {
            return sendJson(err.statusCode, {
              success: false,
              code: err.code,
              error: err.message,
            });
          }
          return sendJson(500, {
            success: false,
            code: 'ERR_GRADLE_FASTLANE',
            error: 'Internal Server Error',
          });
        }
      });
      return;
    }

    return sendJson(404, { error: 'Not Found' });
  });
}

describe('MOD-04: Android Mobile App Builder (Integration & HTTP Contract Tests)', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    server = createMobileAppHttpServer();
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

  it('MOD04-INT-01: GET /health returns 200 OK with service identity', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.service, 'mobile-app-service');
  });

  it('MOD04-INT-02: POST /api/v1/mobile/build returns 200 and matches locked Mod04AndroidBuildResponse contract', async () => {
    const payload: Mod04AndroidBuildRequest = {
      project_id: 'proj-0004-0000-0000-000000000010',
      golden_template_id: 'golden-mobile-android',
      openapi_3_1_yaml: 'openapi: 3.1.0',
      brand_assets: {
        primary_color_hex: '#0F172A',
        secondary_color_hex: '#3B82F6',
      },
      package_name: 'com.client.logistics',
      target_sdk_version: 35,
      file_deltas: [
        {
          file_path: 'app/src/main/AndroidManifest.xml',
          operation: 'UPDATE',
          content: '<manifest package="com.client.logistics"/>',
        },
      ],
      declared_permissions: ['INTERNET'],
      data_safety_csv_declarations: [],
    };

    const res = await fetch(`${baseUrl}/api/v1/mobile/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 200);
    const data: Mod04AndroidBuildResponse = await res.json();

    assert.strictEqual(data.project_id, payload.project_id);
    assert.strictEqual(typeof data.git_commit_sha, 'string');
    assert.strictEqual(data.git_commit_sha.length, 8);
    assert.ok(data.signed_apk_url.endsWith('.apk'));
    assert.ok(data.signed_aab_url.endsWith('.aab'));
    assert.ok(data.play_store_data_safety_csv_url.endsWith('.csv'));
    assert.strictEqual(data.in_app_account_deletion_route, '/settings/delete-account');
    assert.ok(data.web_account_deletion_url.includes('/privacy/delete-account'));
    assert.strictEqual(data.graphify_updated, true);
  });

  it('MOD04-INT-03: POST /api/v1/mobile/build returns 400 on missing mandatory parameters', async () => {
    const invalidPayload = {
      // missing project_id, package_name, target_sdk_version
      golden_template_id: 'golden-mobile-android',
    };

    const res = await fetch(`${baseUrl}/api/v1/mobile/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_VALIDATION');
  });

  it('MOD04-INT-04: POST /api/v1/mobile/build returns 422 ERR_PLAY_POLICY_MISSING when contacts permission missing declaration', async () => {
    const policyMissingPayload: Mod04AndroidBuildRequest = {
      project_id: 'proj-0004-0000-0000-000000000011',
      golden_template_id: 'golden-mobile-android',
      package_name: 'com.client.logistics',
      target_sdk_version: 35,
      file_deltas: [],
      declared_permissions: ['READ_CONTACTS'],
      data_safety_csv_declarations: [], // Missing CONTACTS
    };

    const res = await fetch(`${baseUrl}/api/v1/mobile/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policyMissingPayload),
    });

    assert.strictEqual(res.status, 422);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_PLAY_POLICY_MISSING');
    assert.deepStrictEqual(data.missingDeclarations, ['CONTACTS']);
  });

  it('MOD04-INT-05: POST /api/v1/mobile/build returns 401 ERR_SIGNING_KEY_INVALID on invalid keystore password', async () => {
    const badKeyPayload: Mod04AndroidBuildRequest = {
      project_id: 'proj-0004-0000-0000-000000000012',
      golden_template_id: 'golden-mobile-android',
      package_name: 'com.client.logistics',
      target_sdk_version: 35,
      file_deltas: [],
      keystore_config: {
        key_alias: 'release_key',
        key_password: 'WRONG_PASSWORD',
        store_password: 'WRONG_PASSWORD',
      },
    };

    const res = await fetch(`${baseUrl}/api/v1/mobile/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(badKeyPayload),
    });

    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_SIGNING_KEY_INVALID');
  });

  it('MOD04-INT-06: POST /api/v1/mobile/build returns 500 ERR_GRADLE_FASTLANE on invalid template or package syntax', async () => {
    const badPackagePayload = {
      project_id: 'proj-0004-0000-0000-000000000013',
      golden_template_id: 'golden-mobile-android',
      package_name: 'com.123.bad-syntax',
      target_sdk_version: 35,
      file_deltas: [],
    };

    const res = await fetch(`${baseUrl}/api/v1/mobile/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(badPackagePayload),
    });

    assert.strictEqual(res.status, 500);
    const data = await res.json();
    assert.strictEqual(data.code, 'ERR_GRADLE_FASTLANE');
  });
});
