import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  processMarketingCampaign,
  generatePlatformPost,
} from '../../services/marketing-engine-service/src/lib/engine.ts';
import type {
  Mod07MarketingRequest,
  Mod07MarketingResponse,
} from '../../services/marketing-engine-service/src/types/index.ts';
import {
  CanvaRateLimitError,
  TemplateFieldMismatchError,
} from '../../services/marketing-engine-service/src/types/index.ts';

describe('MOD-07: Canva Pro Digital Marketing Engine (Unit Tests)', () => {
  describe('Positive Scenarios (Happy Path)', () => {
    it('TEST-MOD07-POS-01: Autofill 30-day marketing calendar, attach EU AI Act disclosure, generate Gate 4', async () => {
      const request: Mod07MarketingRequest = {
        project_id: 'proj-0007-0000-0000-000000000001',
        brand_kit: {
          primary_color_hex: '#0F172A',
          secondary_color_hex: '#3B82F6',
          font_heading: 'Inter',
          font_body: 'Inter',
          company_name: 'Express Route Logistics',
        },
        campaign_theme: 'Festive Logistics Launch',
        days_count: 30,
        canva_brand_template_ids: ['DAG_social_01', 'DAG_carousel_02'],
      };

      const response: Mod07MarketingResponse = await processMarketingCampaign(request);

      assert.strictEqual(response.project_id, request.project_id);
      assert.strictEqual(response.calendar_items.length, 30);
      assert.ok(response.approval_gate_id.startsWith('gate-0004-'));

      // Check first item
      const item1 = response.calendar_items[0];
      assert.strictEqual(item1.day, 1);
      assert.strictEqual(item1.platform, 'INSTAGRAM');
      assert.ok(item1.caption.includes('Express Route Logistics'));
      assert.ok(item1.canva_export_url.startsWith('https://export.canva.com/'));
      assert.strictEqual(item1.eu_ai_act_disclosure_attached, true);

      // Verify all items have EU AI Act Article 50 disclosure attached
      for (const item of response.calendar_items) {
        assert.strictEqual(item.eu_ai_act_disclosure_attached, true);
        assert.ok(['INSTAGRAM', 'LINKEDIN', 'FACEBOOK'].includes(item.platform));
      }
    });

    it('TEST-MOD07-POS-02: Multi-platform distribution across INSTAGRAM, LINKEDIN, and FACEBOOK', async () => {
      const request: Mod07MarketingRequest = {
        project_id: 'proj-0007-0000-0000-000000000002',
        brand_kit: { company_name: 'Logistics Co' },
        campaign_theme: 'Next-Day Delivery Guarantee',
        days_count: 6,
        canva_brand_template_ids: ['DAG_social_01'],
      };

      const response = await processMarketingCampaign(request);
      assert.strictEqual(response.calendar_items.length, 6);

      const platforms = response.calendar_items.map(i => i.platform);
      assert.deepStrictEqual(platforms, [
        'INSTAGRAM',
        'LINKEDIN',
        'FACEBOOK',
        'INSTAGRAM',
        'LINKEDIN',
        'FACEBOOK',
      ]);
    });

    it('TEST-MOD07-POS-03: Strict compliance with locked Mod07MarketingResponse contract schema', async () => {
      const request: Mod07MarketingRequest = {
        project_id: 'proj-0007-0000-0000-000000000003',
        brand_kit: {},
        campaign_theme: 'Product Launch',
        days_count: 3,
        canva_brand_template_ids: ['DAG_template_1'],
      };

      const res: Mod07MarketingResponse = await processMarketingCampaign(request);

      const expectedKeys = ['project_id', 'calendar_items', 'approval_gate_id'].sort();
      assert.deepStrictEqual(Object.keys(res).sort(), expectedKeys);

      const itemKeys = ['day', 'platform', 'caption', 'canva_export_url', 'eu_ai_act_disclosure_attached'].sort();
      assert.deepStrictEqual(Object.keys(res.calendar_items[0]).sort(), itemKeys);
    });
  });

  describe('Negative Scenarios (Deterministic Error Codes)', () => {
    it('TEST-MOD07-NEG-01: Canva API rate limit exceeded rejects with 429 ERR_CANVA_RATE_LIMIT', async () => {
      const request: Mod07MarketingRequest = {
        project_id: 'proj-0007-0000-0000-000000000004',
        brand_kit: {},
        campaign_theme: 'Flash Sale',
        days_count: 30,
        canva_brand_template_ids: ['DAG_social_01'],
        simulate_rate_limit: true,
      };

      await assert.rejects(
        async () => {
          await processMarketingCampaign(request);
        },
        (err: any) => {
          assert.strictEqual(err instanceof CanvaRateLimitError, true);
          assert.strictEqual(err.code, 'ERR_CANVA_RATE_LIMIT');
          assert.strictEqual(err.statusCode, 429);
          assert.strictEqual(typeof err.retryAfterSeconds, 'number');
          return true;
        }
      );
    });

    it('TEST-MOD07-NEG-02: Template field mismatch rejects with 422 ERR_TEMPLATE_FIELD_MISMATCH', async () => {
      const requestWithMissingFields: Mod07MarketingRequest = {
        project_id: 'proj-0007-0000-0000-000000000005',
        brand_kit: {}, // Missing required fields specified in template
        campaign_theme: 'Summer Promo',
        days_count: 30,
        canva_brand_template_ids: ['DAG_strict_template'],
        simulate_field_mismatch: true,
      };

      await assert.rejects(
        async () => {
          await processMarketingCampaign(requestWithMissingFields);
        },
        (err: any) => {
          assert.strictEqual(err instanceof TemplateFieldMismatchError, true);
          assert.strictEqual(err.code, 'ERR_TEMPLATE_FIELD_MISMATCH');
          assert.strictEqual(err.statusCode, 422);
          assert.ok(err.missingFields && err.missingFields.length > 0);
          return true;
        }
      );
    });

    it('TEST-MOD07-NEG-03: Empty canva_brand_template_ids rejects with 422 ERR_TEMPLATE_FIELD_MISMATCH', async () => {
      const requestWithNoTemplates: Mod07MarketingRequest = {
        project_id: 'proj-0007-0000-0000-000000000006',
        brand_kit: {},
        campaign_theme: 'Brand Awareness',
        days_count: 14,
        canva_brand_template_ids: [],
      };

      await assert.rejects(
        async () => {
          await processMarketingCampaign(requestWithNoTemplates);
        },
        (err: any) => {
          assert.strictEqual(err instanceof TemplateFieldMismatchError, true);
          assert.strictEqual(err.code, 'ERR_TEMPLATE_FIELD_MISMATCH');
          assert.strictEqual(err.statusCode, 422);
          return true;
        }
      );
    });
  });

  describe('Rare & Edge Scenarios', () => {
    it('TEST-MOD07-RARE-01: Custom 7-day sprint generates exactly 7 items with correct day indexing', async () => {
      const request: Mod07MarketingRequest = {
        project_id: 'proj-0007-0000-0000-000000000007',
        brand_kit: { company_name: 'Sprint Co' },
        campaign_theme: 'Weekly Sprint',
        days_count: 7,
        canva_brand_template_ids: ['DAG_social_01'],
      };

      const response = await processMarketingCampaign(request);
      assert.strictEqual(response.calendar_items.length, 7);
      assert.strictEqual(response.calendar_items[0].day, 1);
      assert.strictEqual(response.calendar_items[6].day, 7);
    });

    it('TEST-MOD07-RARE-02: Generates customized captions per platform', () => {
      const postInsta = generatePlatformPost(1, 'INSTAGRAM', 'Logistics Fest', 'FastLog');
      assert.ok(postInsta.includes('#')); // Instagram hashtag

      const postLinkedIn = generatePlatformPost(2, 'LINKEDIN', 'Logistics Fest', 'FastLog');
      assert.ok(postLinkedIn.includes('optimization') || postLinkedIn.includes('enterprise') || postLinkedIn.includes('B2B') || postLinkedIn.includes('leadership') || postLinkedIn.includes('Logistics Fest'));

      const postFb = generatePlatformPost(3, 'FACEBOOK', 'Logistics Fest', 'FastLog');
      assert.ok(postFb.includes('community') || postFb.includes('today') || postFb.includes('FastLog') || postFb.includes('Logistics Fest'));
    });
  });
});
