import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  processWhatsAppEvent,
  check24HourServiceWindow,
  evaluateRagConfidence,
} from '../../services/whatsapp-service/src/lib/engine.ts';
import type {
  Mod08WhatsAppRequest,
  Mod08WhatsAppResponse,
} from '../../services/whatsapp-service/src/types/index.ts';
import {
  NoOptinProofError,
  Outside24hWindowError,
  MetaApiRejectError,
} from '../../services/whatsapp-service/src/types/index.ts';

describe('MOD-08: WhatsApp Marketing & CRM RAG Engine (Unit Tests)', () => {
  describe('Positive Scenarios (Happy Path)', () => {
    it('TEST-MOD08-POS-01: Inbound customer question processed within 24h window, pgvector RAG high-confidence, no human escalation', async () => {
      const now = new Date('2026-11-10T12:00:00Z');
      const request: Mod08WhatsAppRequest = {
        project_id: 'proj-0008-0000-0000-000000000001',
        event_type: 'INBOUND_CUSTOMER_MSG',
        recipient_phone_e164: '+919876543210',
        opt_in_proof_id: null,
        last_inbound_timestamp: '2026-11-10T10:00:00Z', // 2 hours ago
        message_payload: {
          text_or_template: 'What are your delivery pricing tiers for express parcels?',
        },
        current_time_iso: now.toISOString(),
      };

      const response: Mod08WhatsAppResponse = await processWhatsAppEvent(request);

      assert.strictEqual(response.project_id, request.project_id);
      assert.ok(response.whatsapp_message_id.startsWith('wamid.'));
      assert.strictEqual(response.within_24h_service_window, true);
      assert.ok(response.rag_confidence_score >= 0.75, `Expected high RAG score, got ${response.rag_confidence_score}`);
      assert.strictEqual(response.escalated_to_human_chatwoot, false);
      assert.strictEqual(typeof response.unsubscribe_footer_attached, 'boolean');
    });

    it('TEST-MOD08-POS-02: Outbound broadcast with valid opt_in_proof_id, mandatory unsubscribe footer attached', async () => {
      const now = new Date('2026-11-10T12:00:00Z');
      const request: Mod08WhatsAppRequest = {
        project_id: 'proj-0008-0000-0000-000000000002',
        event_type: 'OUTBOUND_CAMPAIGN_BROADCAST',
        recipient_phone_e164: '+919876543211',
        opt_in_proof_id: 'optin-proof-uuid-12345',
        last_inbound_timestamp: '2026-11-10T11:00:00Z',
        message_payload: {
          text_or_template: 'Special Launch Offer: Get 20% off on your next 3 shipments today!',
        },
        current_time_iso: now.toISOString(),
      };

      const response: Mod08WhatsAppResponse = await processWhatsAppEvent(request);

      assert.strictEqual(response.project_id, request.project_id);
      assert.ok(response.whatsapp_message_id.startsWith('wamid.'));
      assert.strictEqual(response.within_24h_service_window, true);
      assert.strictEqual(response.escalated_to_human_chatwoot, false);
      assert.strictEqual(response.unsubscribe_footer_attached, true);
    });

    it('TEST-MOD08-POS-03: Strict compliance with locked Mod08WhatsAppResponse JSON contract schema', async () => {
      const now = new Date('2026-11-10T12:00:00Z');
      const request: Mod08WhatsAppRequest = {
        project_id: 'proj-0008-0000-0000-000000000003',
        event_type: 'INBOUND_CUSTOMER_MSG',
        recipient_phone_e164: '+14155552671',
        opt_in_proof_id: null,
        last_inbound_timestamp: '2026-11-10T08:00:00Z',
        message_payload: {
          text_or_template: 'Where is my order #5524?',
        },
        current_time_iso: now.toISOString(),
      };

      const response: Mod08WhatsAppResponse = await processWhatsAppEvent(request);

      // Verify exact keys in locked contract
      const keys = Object.keys(response).sort();
      const expectedKeys = [
        'project_id',
        'whatsapp_message_id',
        'within_24h_service_window',
        'rag_confidence_score',
        'escalated_to_human_chatwoot',
        'unsubscribe_footer_attached',
      ].sort();

      assert.deepStrictEqual(keys, expectedKeys);
      assert.strictEqual(typeof response.project_id, 'string');
      assert.strictEqual(typeof response.whatsapp_message_id, 'string');
      assert.strictEqual(typeof response.within_24h_service_window, 'boolean');
      assert.strictEqual(typeof response.rag_confidence_score, 'number');
      assert.strictEqual(typeof response.escalated_to_human_chatwoot, 'boolean');
      assert.strictEqual(typeof response.unsubscribe_footer_attached, 'boolean');
    });
  });

  describe('Negative Scenarios (Deterministic Error Codes)', () => {
    it('TEST-MOD08-NEG-01: Outbound broadcast without opt_in_proof_id rejects with 403 ERR_NO_OPTIN_PROOF', async () => {
      const request: Mod08WhatsAppRequest = {
        project_id: 'proj-0008-0000-0000-000000000004',
        event_type: 'OUTBOUND_CAMPAIGN_BROADCAST',
        recipient_phone_e164: '+919876543212',
        opt_in_proof_id: null, // Missing opt-in proof!
        last_inbound_timestamp: '2026-11-10T10:00:00Z',
        message_payload: {
          text_or_template: 'Flash discount campaign!',
        },
      };

      await assert.rejects(
        async () => {
          await processWhatsAppEvent(request);
        },
        (err: any) => {
          assert.strictEqual(err.name, 'NoOptinProofError');
          assert.strictEqual(err.code, 'ERR_NO_OPTIN_PROOF');
          assert.strictEqual(err.statusCode, 403);
          return true;
        }
      );
    });

    it('TEST-MOD08-NEG-02: Free-form message outside 24h window rejects with 422 ERR_OUTSIDE_24H_WINDOW', async () => {
      const now = new Date('2026-11-10T12:00:00Z');
      const request: Mod08WhatsAppRequest = {
        project_id: 'proj-0008-0000-0000-000000000005',
        event_type: 'OUTBOUND_CAMPAIGN_BROADCAST',
        recipient_phone_e164: '+919876543213',
        opt_in_proof_id: 'proof-uuid-valid-123',
        last_inbound_timestamp: '2026-11-09T08:00:00Z', // 28 hours ago (> 24h)
        message_payload: {
          text_or_template: 'Hey there, checking back on your cart!',
          is_meta_approved_template: false,
        },
        current_time_iso: now.toISOString(),
      };

      await assert.rejects(
        async () => {
          await processWhatsAppEvent(request);
        },
        (err: any) => {
          assert.strictEqual(err.name, 'Outside24hWindowError');
          assert.strictEqual(err.code, 'ERR_OUTSIDE_24H_WINDOW');
          assert.strictEqual(err.statusCode, 422);
          return true;
        }
      );
    });

    it('TEST-MOD08-NEG-03: Meta Graph API downstream rejection triggers 502 ERR_META_API_REJECT', async () => {
      const now = new Date('2026-11-10T12:00:00Z');
      const request: Mod08WhatsAppRequest = {
        project_id: 'proj-0008-0000-0000-000000000006',
        event_type: 'INBOUND_CUSTOMER_MSG',
        recipient_phone_e164: '+919876543214',
        opt_in_proof_id: null,
        last_inbound_timestamp: '2026-11-10T11:00:00Z',
        message_payload: {
          text_or_template: 'How can I change address?',
        },
        mock_meta_failure: true, // Simulate Meta downstream failure
        current_time_iso: now.toISOString(),
      };

      await assert.rejects(
        async () => {
          await processWhatsAppEvent(request);
        },
        (err: any) => {
          assert.strictEqual(err.name, 'MetaApiRejectError');
          assert.strictEqual(err.code, 'ERR_META_API_REJECT');
          assert.strictEqual(err.statusCode, 502);
          return true;
        }
      );
    });
  });

  describe('Rare & Edge Scenarios', () => {
    it('TEST-MOD08-RARE-01: Low RAG confidence (< 0.75) escalates to human Chatwoot agent', async () => {
      const now = new Date('2026-11-10T12:00:00Z');
      const request: Mod08WhatsAppRequest = {
        project_id: 'proj-0008-0000-0000-000000000007',
        event_type: 'INBOUND_CUSTOMER_MSG',
        recipient_phone_e164: '+919876543215',
        opt_in_proof_id: null,
        last_inbound_timestamp: '2026-11-10T11:30:00Z',
        message_payload: {
          text_or_template: 'My complex custom edge case question with zero context...',
        },
        mock_rag_score: 0.45, // Explicit low confidence
        current_time_iso: now.toISOString(),
      };

      const response = await processWhatsAppEvent(request);

      assert.strictEqual(response.rag_confidence_score, 0.45);
      assert.strictEqual(response.escalated_to_human_chatwoot, true);
    });

    it('TEST-MOD08-RARE-02: Customer replies STOP or UNSUBSCRIBE triggers real-time opt-out and suppression', async () => {
      const now = new Date('2026-11-10T12:00:00Z');
      const request: Mod08WhatsAppRequest = {
        project_id: 'proj-0008-0000-0000-000000000008',
        event_type: 'INBOUND_CUSTOMER_MSG',
        recipient_phone_e164: '+919876543216',
        opt_in_proof_id: null,
        last_inbound_timestamp: '2026-11-10T11:55:00Z',
        message_payload: {
          text_or_template: 'STOP',
        },
        current_time_iso: now.toISOString(),
      };

      const response = await processWhatsAppEvent(request);

      assert.strictEqual(response.within_24h_service_window, true);
      assert.strictEqual(response.unsubscribe_footer_attached, true);
      assert.strictEqual(response.escalated_to_human_chatwoot, false);
    });

    it('TEST-MOD08-RARE-03: Meta approved template allowed outside 24h window', async () => {
      const now = new Date('2026-11-10T12:00:00Z');
      const request: Mod08WhatsAppRequest = {
        project_id: 'proj-0008-0000-0000-000000000009',
        event_type: 'OUTBOUND_CAMPAIGN_BROADCAST',
        recipient_phone_e164: '+919876543217',
        opt_in_proof_id: 'optin-proof-uuid-99999',
        last_inbound_timestamp: '2026-11-08T10:00:00Z', // 50 hours ago
        message_payload: {
          text_or_template: 'shipping_update_v2',
          template_name: 'shipping_update_v2',
          is_meta_approved_template: true, // Pre-approved template HSM
        },
        current_time_iso: now.toISOString(),
      };

      const response = await processWhatsAppEvent(request);

      assert.strictEqual(response.within_24h_service_window, false); // Accurately false
      assert.ok(response.whatsapp_message_id.startsWith('wamid.'));
      assert.strictEqual(response.unsubscribe_footer_attached, true);
    });
  });
});
