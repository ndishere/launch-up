import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  processAndroidBuild,
  validatePackageName,
  checkPlayPolicyDataSafety,
} from '../../services/mobile-app-service/src/lib/engine.ts';
import type {
  Mod04AndroidBuildRequest,
  Mod04AndroidBuildResponse,
} from '../../services/mobile-app-service/src/types/index.ts';
import {
  PlayPolicyMissingError,
  SigningKeyInvalidError,
  GradleFastlaneError,
} from '../../services/mobile-app-service/src/types/index.ts';

describe('MOD-04: Android Mobile App Builder (Unit Tests)', () => {
  describe('Positive Scenarios (Happy Path)', () => {
    it('TEST-MOD04-POS-01: Clone golden-mobile-android, compile signed APK/AAB, verify data safety CSV & account deletion routes', async () => {
      const request: Mod04AndroidBuildRequest = {
        project_id: 'proj-0004-0000-0000-000000000001',
        golden_template_id: 'golden-mobile-android',
        openapi_3_1_yaml: 'openapi: 3.1.0\ninfo:\n  title: Mobile API\n  version: 1.0.0',
        brand_assets: {
          primary_color_hex: '#0F172A',
          secondary_color_hex: '#3B82F6',
          app_icon_url: 'https://assets.example.com/icon.png',
        },
        package_name: 'com.client.app',
        target_sdk_version: 35,
        file_deltas: [
          {
            file_path: 'app/src/main/java/com/client/app/MainActivity.kt',
            operation: 'CREATE',
            content: 'package com.client.app\nclass MainActivity : AppCompatActivity()',
          },
        ],
        declared_permissions: ['INTERNET', 'ACCESS_FINE_LOCATION'],
        data_safety_csv_declarations: ['LOCATION'],
        keystore_config: {
          key_alias: 'release_key',
          key_password: 'ValidSecretPassword123',
          store_password: 'ValidSecretPassword123',
        },
      };

      const response: Mod04AndroidBuildResponse = await processAndroidBuild(request);

      assert.strictEqual(response.project_id, request.project_id);
      assert.strictEqual(typeof response.git_commit_sha, 'string');
      assert.strictEqual(response.git_commit_sha.length, 8);
      assert.ok(response.signed_apk_url.endsWith('.apk'));
      assert.ok(response.signed_aab_url.endsWith('.aab'));
      assert.ok(response.play_store_data_safety_csv_url.endsWith('.csv'));
      assert.strictEqual(response.in_app_account_deletion_route, '/settings/delete-account');
      assert.ok(response.web_account_deletion_url.includes('/privacy/delete-account'));
      assert.strictEqual(response.graphify_updated, true);
    });

    it('TEST-MOD04-POS-02: Package name validation accepts valid Java identifiers', () => {
      assert.strictEqual(validatePackageName('com.client.logistics'), true);
      assert.strictEqual(validatePackageName('in.express.route'), true);
      assert.strictEqual(validatePackageName('com.delivery_service.app2'), true);
    });

    it('TEST-MOD04-POS-03: Strict compliance with locked Mod04AndroidBuildResponse contract schema', async () => {
      const request: Mod04AndroidBuildRequest = {
        project_id: 'proj-0004-0000-0000-000000000002',
        golden_template_id: 'golden-mobile-android',
        package_name: 'com.launchup.demo',
        target_sdk_version: 35,
        file_deltas: [],
      };

      const res: Mod04AndroidBuildResponse = await processAndroidBuild(request);

      const expectedKeys = [
        'project_id',
        'git_commit_sha',
        'signed_apk_url',
        'signed_aab_url',
        'play_store_data_safety_csv_url',
        'in_app_account_deletion_route',
        'web_account_deletion_url',
        'graphify_updated',
      ].sort();

      assert.deepStrictEqual(Object.keys(res).sort(), expectedKeys);
    });
  });

  describe('Negative Scenarios (Deterministic Error Codes)', () => {
    it('TEST-MOD04-NEG-01: Requested dangerous permission missing from Data Safety CSV rejects with 422 ERR_PLAY_POLICY_MISSING', async () => {
      const requestWithUndeclaredContacts: Mod04AndroidBuildRequest = {
        project_id: 'proj-0004-0000-0000-000000000003',
        golden_template_id: 'golden-mobile-android',
        package_name: 'com.client.app',
        target_sdk_version: 35,
        file_deltas: [],
        declared_permissions: ['READ_CONTACTS', 'ACCESS_FINE_LOCATION'],
        data_safety_csv_declarations: ['LOCATION'], // Missing CONTACTS
      };

      await assert.rejects(
        async () => {
          await processAndroidBuild(requestWithUndeclaredContacts);
        },
        (err: any) => {
          assert.strictEqual(err instanceof PlayPolicyMissingError, true);
          assert.strictEqual(err.code, 'ERR_PLAY_POLICY_MISSING');
          assert.strictEqual(err.statusCode, 422);
          assert.ok(err.missingDeclarations?.includes('CONTACTS'));
          return true;
        }
      );
    });

    it('TEST-MOD04-NEG-02: Invalid or corrupted signing key rejects with 401 ERR_SIGNING_KEY_INVALID', async () => {
      const requestWithBadKey: Mod04AndroidBuildRequest = {
        project_id: 'proj-0004-0000-0000-000000000004',
        golden_template_id: 'golden-mobile-android',
        package_name: 'com.client.app',
        target_sdk_version: 35,
        file_deltas: [],
        keystore_config: {
          key_alias: 'corrupted_alias',
          key_password: 'WRONG_PASSWORD',
          store_password: 'WRONG_PASSWORD',
        },
      };

      await assert.rejects(
        async () => {
          await processAndroidBuild(requestWithBadKey);
        },
        (err: any) => {
          assert.strictEqual(err instanceof SigningKeyInvalidError, true);
          assert.strictEqual(err.code, 'ERR_SIGNING_KEY_INVALID');
          assert.strictEqual(err.statusCode, 401);
          return true;
        }
      );
    });

    it('TEST-MOD04-NEG-03: Gradle build compilation error or missing template rejects with 500 ERR_GRADLE_FASTLANE', async () => {
      const requestWithBadTemplate: Mod04AndroidBuildRequest = {
        project_id: 'proj-0004-0000-0000-000000000005',
        golden_template_id: 'unsupported-mobile-template',
        package_name: 'com.client.app',
        target_sdk_version: 35,
        file_deltas: [],
      };

      await assert.rejects(
        async () => {
          await processAndroidBuild(requestWithBadTemplate);
        },
        (err: any) => {
          assert.strictEqual(err instanceof GradleFastlaneError, true);
          assert.strictEqual(err.code, 'ERR_GRADLE_FASTLANE');
          assert.strictEqual(err.statusCode, 500);
          return true;
        }
      );
    });
  });

  describe('Rare & Edge Scenarios', () => {
    it('TEST-MOD04-RARE-01: Invalid Java package syntax or reserved word rejects with 500 ERR_GRADLE_FASTLANE', async () => {
      // Reserved word 'int' or starting with digits
      assert.strictEqual(validatePackageName('com.int.app'), false);
      assert.strictEqual(validatePackageName('com.123.app'), false);
      assert.strictEqual(validatePackageName('Com.Client.App'), false);

      const requestWithBadPackage: Mod04AndroidBuildRequest = {
        project_id: 'proj-0004-0000-0000-000000000006',
        golden_template_id: 'golden-mobile-android',
        package_name: 'com.default.app', // 'default' is a Java keyword
        target_sdk_version: 35,
        file_deltas: [],
      };

      await assert.rejects(
        async () => {
          await processAndroidBuild(requestWithBadPackage);
        },
        (err: any) => {
          assert.strictEqual(err instanceof GradleFastlaneError, true);
          assert.strictEqual(err.code, 'ERR_GRADLE_FASTLANE');
          assert.ok(err.message.includes('package name'));
          return true;
        }
      );
    });

    it('TEST-MOD04-RARE-02: Target SDK Version below Google Play threshold (< 34) rejects with 422 ERR_PLAY_POLICY_MISSING', async () => {
      const requestWithOutdatedSdk: Mod04AndroidBuildRequest = {
        project_id: 'proj-0004-0000-0000-000000000007',
        golden_template_id: 'golden-mobile-android',
        package_name: 'com.client.app',
        target_sdk_version: 30, // Outdated! Must be >= 34
        file_deltas: [],
      };

      await assert.rejects(
        async () => {
          await processAndroidBuild(requestWithOutdatedSdk);
        },
        (err: any) => {
          assert.strictEqual(err instanceof PlayPolicyMissingError, true);
          assert.strictEqual(err.code, 'ERR_PLAY_POLICY_MISSING');
          assert.ok(err.message.includes('target_sdk_version'));
          return true;
        }
      );
    });
  });
});
