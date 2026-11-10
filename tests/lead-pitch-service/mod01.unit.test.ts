import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  processLeadDiscovery,
  auditDigitalGaps,
  resolveCompliance,
  checkDncSuppression,
  autofillCanvaProposal,
} from '../../services/lead-pitch-service/src/lib/engine.ts';
import type {
  Mod01LeadRequest,
  ProspectRaw,
} from '../../services/lead-pitch-service/src/types/index.ts';
import {
  DncListBlockedError,
  ScrapeTimeoutError,
  CanvaAutofillFailError,
} from '../../services/lead-pitch-service/src/types/index.ts';

/**
 * LAUNCH UP — MOD-01: LEAD DISCOVERY & CANVA PITCH ENGINE
 * Stage 1 Unit Test Suite (TDD)
 *
 * Contract: contracts/module_input_output_contracts.md (MOD-01)
 * Test Matrix: tests/specs/master_tdd_test_matrix_5_stage_pipeline.md (MOD-01)
 */

describe('MOD-01: Lead Discovery & Canva Pitch Engine (Unit Tests)', () => {
  const sampleProspects: ProspectRaw[] = [
    {
      id: 'lead-0001-0000-0000-000000000001',
      name: 'Amritsar Regional Express Logistics',
      website: 'https://amritsarexpress.example.com',
      email: 'contact@amritsarexpress.example.com',
      phone: '+919876543210',
      hasMobileApp: false,
      lighthouseMobileScore: 38,
      hasWhatsAppBot: false,
      hasResponsiveViewport: true,
    },
    {
      id: 'lead-0002-0000-0000-000000000002',
      name: 'Punjab Cargo Freight Ltd',
      website: 'https://punjabcargo.example.com',
      email: 'info@punjabcargo.example.com',
      phone: '+919876543211',
      hasMobileApp: false,
      lighthouseMobileScore: 42,
      hasWhatsAppBot: false,
      hasResponsiveViewport: false,
    },
  ];

  const emptyDnc = new Set<string>();

  // ── POSITIVE SCENARIOS ───────────────────────────────────────────
  describe('Positive Scenarios (Happy Path)', () => {
    it('TEST-MOD01-POS-01: Audit prospect URL, detect digital gaps, autofill Canva Pro proposal, and create Gate 1', async () => {
      const request: Mod01LeadRequest = {
        target_niche: 'regional-logistics',
        country_code: 'IN',
        city: 'Amritsar',
        max_leads: 1,
        canva_pitch_template_id: 'DAG_canva_template_01',
      };

      const res = await processLeadDiscovery(request, sampleProspects, emptyDnc);

      assert.strictEqual(res.leads_generated.length, 1);
      const lead = res.leads_generated[0];
      assert.strictEqual(lead.company_name, 'Amritsar Regional Express Logistics');
      assert.strictEqual(lead.website_url, 'https://amritsarexpress.example.com');

      // Gaps detected
      assert.ok(lead.digital_gaps_found.includes('NO_ANDROID_APP'));
      assert.ok(lead.digital_gaps_found.includes('LIGHTHOUSE_MOBILE_BELOW_50'));
      assert.ok(lead.digital_gaps_found.includes('NO_WHATSAPP_BOT'));

      // Compliance resolved for India
      assert.deepStrictEqual(lead.applicable_compliance, ['DPDP_INDIA_2023', 'CERT_IN']);

      // Canva export PDF generated
      assert.ok(lead.canva_proposal_pdf_url.startsWith('https://export.canva.com/'));
      assert.ok(lead.canva_proposal_pdf_url.endsWith('.pdf'));

      // Approval Gate ID created for human review
      assert.strictEqual(typeof lead.approval_gate_id, 'string');
      assert.strictEqual(lead.approval_gate_id.length, 36);
    });

    it('TEST-MOD01-POS-02: Multi-country compliance mapping matches legal standards', () => {
      assert.deepStrictEqual(resolveCompliance('IN'), ['DPDP_INDIA_2023', 'CERT_IN']);
      assert.deepStrictEqual(resolveCompliance('US'), ['CCPA_US', 'CAN_SPAM_ACT']);
      assert.deepStrictEqual(resolveCompliance('DE'), ['GDPR_EU', 'EU_AI_ACT']);
      assert.deepStrictEqual(resolveCompliance('FR'), ['GDPR_EU', 'EU_AI_ACT']);
    });

    it('TEST-MOD01-POS-03: Output matches strict Mod01LeadResponse contract schema', async () => {
      const request: Mod01LeadRequest = {
        target_niche: 'regional-logistics',
        country_code: 'IN',
        city: 'Amritsar',
        max_leads: 2,
        canva_pitch_template_id: 'DAG_canva_template_01',
      };

      const res = await processLeadDiscovery(request, sampleProspects, emptyDnc);
      assert.ok(Array.isArray(res.leads_generated));

      for (const item of res.leads_generated) {
        assert.strictEqual(typeof item.lead_id, 'string');
        assert.strictEqual(typeof item.company_name, 'string');
        assert.strictEqual(typeof item.website_url, 'string');
        assert.ok(Array.isArray(item.digital_gaps_found));
        assert.ok(Array.isArray(item.applicable_compliance));
        assert.strictEqual(typeof item.canva_proposal_pdf_url, 'string');
        assert.strictEqual(typeof item.approval_gate_id, 'string');
      }
    });
  });

  // ── NEGATIVE SCENARIOS ───────────────────────────────────────────
  describe('Negative Scenarios (Deterministic Error Codes)', () => {
    it('TEST-MOD01-NEG-01: Prospect on DNC suppression list rejects with 422 ERR_DNC_LIST_BLOCKED', async () => {
      const activeDnc = new Set<string>(['contact@amritsarexpress.example.com']);
      const request: Mod01LeadRequest = {
        target_niche: 'regional-logistics',
        country_code: 'IN',
        city: 'Amritsar',
        max_leads: 5,
        canva_pitch_template_id: 'DAG_canva_template_01',
      };

      await assert.rejects(
        async () => processLeadDiscovery(request, sampleProspects, activeDnc),
        (err: any) => err instanceof DncListBlockedError && err.statusCode === 422 && err.code === 'ERR_DNC_LIST_BLOCKED'
      );
    });

    it('TEST-MOD01-NEG-02: Scrape timeout rejects with 504 ERR_SCRAPE_TIMEOUT', async () => {
      const request: Mod01LeadRequest = {
        target_niche: 'regional-logistics',
        country_code: 'IN',
        city: 'Amritsar',
        max_leads: 5,
        canva_pitch_template_id: 'DAG_canva_template_01',
      };

      await assert.rejects(
        async () => processLeadDiscovery(request, sampleProspects, emptyDnc, { simulateScrapeTimeout: true }),
        (err: any) => err instanceof ScrapeTimeoutError && err.statusCode === 504 && err.code === 'ERR_SCRAPE_TIMEOUT'
      );
    });

    it('TEST-MOD01-NEG-03: Invalid Canva template ID rejects with 502 ERR_CANVA_AUTOFILL_FAIL', async () => {
      const request: Mod01LeadRequest = {
        target_niche: 'regional-logistics',
        country_code: 'IN',
        city: 'Amritsar',
        max_leads: 1,
        canva_pitch_template_id: 'INVALID_TEMPLATE_ID',
      };

      await assert.rejects(
        async () => processLeadDiscovery(request, sampleProspects, emptyDnc),
        (err: any) => err instanceof CanvaAutofillFailError && err.statusCode === 502 && err.code === 'ERR_CANVA_AUTOFILL_FAIL'
      );
    });
  });

  // ── RARE & EDGE SCENARIOS ─────────────────────────────────────────
  describe('Rare & Edge Scenarios', () => {
    it('TEST-MOD01-RARE-01: Fully optimized prospect yields zero gaps', () => {
      const optimizedProspect: ProspectRaw = {
        id: 'opt-1',
        name: 'Top Logistics Tech',
        website: 'https://toptech.example.com',
        email: 'hello@toptech.example.com',
        phone: '+919999999999',
        hasMobileApp: true,
        lighthouseMobileScore: 95,
        hasWhatsAppBot: true,
        hasResponsiveViewport: true,
      };

      const gaps = auditDigitalGaps(optimizedProspect);
      assert.strictEqual(gaps.length, 0);
    });

    it('TEST-MOD01-RARE-02: Phone number with spacing and country code matches DNC list', () => {
      const dncWithCleanPhone = new Set<string>(['+919876543210']);
      const isBlocked = checkDncSuppression({ phone: '+91 (987) 654-3210' }, dncWithCleanPhone);
      assert.strictEqual(isBlocked, true);
    });
  });
});
