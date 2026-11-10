import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  processWebBuild,
  verifyViewports,
  checkCookieConsent,
} from '../../services/web-builder-service/src/lib/engine.ts';
import type {
  Mod03WebBuildRequest,
  Mod03WebBuildResponse,
  FileDelta,
} from '../../services/web-builder-service/src/types/index.ts';
import {
  BuildCompileError,
  ViewportOverflowError,
  SandboxTimeoutError,
} from '../../services/web-builder-service/src/types/index.ts';

describe('MOD-03: Responsive Web & Landing Builder (Unit Tests)', () => {
  describe('Positive Scenarios (Happy Path)', () => {
    it('TEST-MOD03-POS-01: Clone golden-web-landing, inject custom pages & GA4, verify 375px-1920px viewports', async () => {
      const request: Mod03WebBuildRequest = {
        project_id: 'proj-0003-0000-0000-000000000001',
        golden_template_id: 'golden-web-landing',
        openapi_3_1_yaml: 'openapi: 3.1.0\ninfo:\n  title: Logistics API\n  version: 1.0.0',
        brand_assets: {
          primary_color_hex: '#0F172A',
          secondary_color_hex: '#3B82F6',
          font_heading: 'Inter',
          font_body: 'Inter',
        },
        compliance_flags: ['GDPR_EU', 'DPDP_INDIA'],
        ga4_measurement_id: 'G-1234567890',
        file_deltas: [
          {
            file_path: 'src/app/booking/page.tsx',
            operation: 'CREATE',
            linked_user_story_ids: ['US-001'],
            content: `
              export default function BookingPage() {
                return (
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Book Shipment</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                      <div className="w-full bg-white p-6 shadow rounded-lg">Form</div>
                    </div>
                  </main>
                );
              }
            `,
          },
        ],
      };

      const response = await processWebBuild(request);

      assert.strictEqual(response.project_id, request.project_id);
      assert.strictEqual(typeof response.git_commit_sha, 'string');
      assert.strictEqual(response.git_commit_sha.length, 8);
      assert.ok(response.staging_preview_url.startsWith('https://preview-'));
      assert.deepStrictEqual(response.viewports_verified, ['375px', '768px', '1280px', '1920px']);
      assert.strictEqual(response.rtl_verified, true);
      assert.strictEqual(response.cookie_consent_banner_active, true);
      assert.strictEqual(response.graphify_updated, true);
    });

    it('TEST-MOD03-POS-02: Cookie consent banner is activated when compliance_flags contain GDPR_EU or DPDP_INDIA', () => {
      assert.strictEqual(checkCookieConsent(['GDPR_EU']), true);
      assert.strictEqual(checkCookieConsent(['DPDP_INDIA']), true);
      assert.strictEqual(checkCookieConsent(['CCPA_US', 'GDPR_EU']), true);
      assert.strictEqual(checkCookieConsent(['CCPA_US']), false);
      assert.strictEqual(checkCookieConsent([]), false);
      assert.strictEqual(checkCookieConsent(undefined), false);
    });

    it('TEST-MOD03-POS-03: Strict compliance with locked Mod03WebBuildResponse contract schema', async () => {
      const request: Mod03WebBuildRequest = {
        project_id: 'proj-0003-0000-0000-000000000002',
        golden_template_id: 'golden-web-landing',
        file_deltas: [
          {
            file_path: 'src/components/Hero.tsx',
            operation: 'CREATE',
            content: '<section className="w-full min-h-screen flex items-center justify-center">Hero</section>',
          },
        ],
      };

      const res: Mod03WebBuildResponse = await processWebBuild(request);

      const expectedKeys = [
        'project_id',
        'git_commit_sha',
        'staging_preview_url',
        'viewports_verified',
        'rtl_verified',
        'cookie_consent_banner_active',
        'graphify_updated',
      ].sort();

      assert.deepStrictEqual(Object.keys(res).sort(), expectedKeys);
    });
  });

  describe('Negative Scenarios (Deterministic Error Codes)', () => {
    it('TEST-MOD03-NEG-01: Hardcoded width > 375px causes horizontal overflow, rejects with 422 ERR_VIEWPORT_OVERFLOW', async () => {
      const request: Mod03WebBuildRequest = {
        project_id: 'proj-0003-0000-0000-000000000003',
        golden_template_id: 'golden-web-landing',
        file_deltas: [
          {
            file_path: 'src/components/BadContainer.tsx',
            operation: 'CREATE',
            content: '<div className="w-[500px] min-w-[600px] bg-red-500">Broken Layout</div>',
          },
        ],
      };

      await assert.rejects(
        async () => {
          await processWebBuild(request);
        },
        (err: any) => {
          assert.strictEqual(err instanceof ViewportOverflowError, true);
          assert.strictEqual(err.code, 'ERR_VIEWPORT_OVERFLOW');
          assert.strictEqual(err.statusCode, 422);
          assert.strictEqual(err.viewport, '375px');
          return true;
        }
      );
    });

    it('TEST-MOD03-NEG-02: Syntax error or missing template rejects with 500 ERR_BUILD_COMPILE', async () => {
      // Test invalid template
      const invalidTemplateRequest: Mod03WebBuildRequest = {
        project_id: 'proj-0003-0000-0000-000000000004',
        golden_template_id: 'non-existent-template-id',
        file_deltas: [],
      };

      await assert.rejects(
        async () => {
          await processWebBuild(invalidTemplateRequest);
        },
        (err: any) => {
          assert.strictEqual(err instanceof BuildCompileError, true);
          assert.strictEqual(err.code, 'ERR_BUILD_COMPILE');
          assert.strictEqual(err.statusCode, 500);
          return true;
        }
      );

      // Test JSX syntax error (unclosed tag)
      const syntaxErrorRequest: Mod03WebBuildRequest = {
        project_id: 'proj-0003-0000-0000-000000000005',
        golden_template_id: 'golden-web-landing',
        file_deltas: [
          {
            file_path: 'src/Broken.tsx',
            operation: 'CREATE',
            content: 'export default function Broken() { return <div><p>Unclosed div; }',
          },
        ],
      };

      await assert.rejects(
        async () => {
          await processWebBuild(syntaxErrorRequest);
        },
        (err: any) => {
          assert.strictEqual(err instanceof BuildCompileError, true);
          assert.strictEqual(err.code, 'ERR_BUILD_COMPILE');
          assert.strictEqual(err.statusCode, 500);
          return true;
        }
      );
    });

    it('TEST-MOD03-NEG-03: Sandbox timeout simulation rejects with 504 ERR_SANDBOX_TIMEOUT', async () => {
      const timeoutRequest: Mod03WebBuildRequest = {
        project_id: 'proj-0003-0000-0000-000000000006',
        golden_template_id: 'golden-web-landing',
        file_deltas: [],
      };

      await assert.rejects(
        async () => {
          await processWebBuild(timeoutRequest, { simulateTimeout: true });
        },
        (err: any) => {
          assert.strictEqual(err instanceof SandboxTimeoutError, true);
          assert.strictEqual(err.code, 'ERR_SANDBOX_TIMEOUT');
          assert.strictEqual(err.statusCode, 504);
          return true;
        }
      );
    });
  });

  describe('Rare & Edge Scenarios', () => {
    it('TEST-MOD03-RARE-01: RTL and German compound word wrapping verifies rtl_verified and break-words', async () => {
      const request: Mod03WebBuildRequest = {
        project_id: 'proj-0003-0000-0000-000000000007',
        golden_template_id: 'golden-web-landing',
        file_deltas: [
          {
            file_path: 'src/app/contact/page.tsx',
            operation: 'CREATE',
            content: `
              <div dir="rtl" className="flex flex-row start-0 end-0 break-words hyphens-auto">
                <span className="ms-4 me-4">Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz</span>
              </div>
            `,
          },
        ],
      };

      const response = await processWebBuild(request);
      assert.strictEqual(response.rtl_verified, true);
      assert.deepStrictEqual(response.viewports_verified, ['375px', '768px', '1280px', '1920px']);
    });

    it('TEST-MOD03-RARE-02: Missing or null GA4 measurement ID safely builds without error', async () => {
      const request: Mod03WebBuildRequest = {
        project_id: 'proj-0003-0000-0000-000000000008',
        golden_template_id: 'golden-web-landing',
        ga4_measurement_id: undefined,
        file_deltas: [
          {
            file_path: 'src/app/page.tsx',
            operation: 'CREATE',
            content: '<main className="w-full">Clean</main>',
          },
        ],
      };

      const response = await processWebBuild(request);
      assert.strictEqual(response.project_id, request.project_id);
      assert.strictEqual(response.staging_preview_url.length > 0, true);
    });
  });
});
