import { describe, it } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';

// Microservice Engine Imports
import { processLeadDiscovery } from '../../services/lead-pitch-service/src/lib/engine.ts';
import type { ProspectRaw } from '../../services/lead-pitch-service/src/types/index.ts';
import { processBaIntake } from '../../services/ba-intake-service/src/lib/engine.ts';
import { processWebBuild } from '../../services/web-builder-service/src/lib/engine.ts';
import { processAndroidBuild } from '../../services/mobile-app-service/src/lib/engine.ts';
import { processBackendBuild } from '../../services/backend-api-service/src/lib/engine.ts';
import { processQAVerification } from '../../services/qa-secops-service/src/lib/engine.ts';
import { processMarketingCampaign } from '../../services/marketing-engine-service/src/lib/engine.ts';
import { processWhatsAppEvent } from '../../services/whatsapp-service/src/lib/engine.ts';
import { processSREIncident } from '../../services/sre-healing-service/src/lib/engine.ts';

// MOD-10 Governance & RBAC in-memory permission and gate store
interface GateState {
  id: string;
  projectId: string;
  gateType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
  decidedBy?: string;
  feedbackNotes?: string;
  version: number;
}

interface Principal {
  id: string;
  type: 'HUMAN' | 'AI_AGENT';
  role: string;
  clientId: string | null;
  allowedProjects: Set<string>;
}

class GovernanceMesh {
  private gates = new Map<string, GateState>();
  private principals = new Map<string, Principal>();

  registerPrincipal(principal: Principal) {
    this.principals.set(principal.id, principal);
  }

  createGate(projectId: string, gateId: string, gateType: string): GateState {
    const gate: GateState = {
      id: gateId,
      projectId,
      gateType,
      status: 'PENDING',
      version: 1,
    };
    this.gates.set(gateId, gate);
    return gate;
  }

  getGate(gateId: string): GateState | undefined {
    return this.gates.get(gateId);
  }

  decideGate(
    principalId: string,
    gateId: string,
    decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED',
    notes?: string
  ): GateState {
    const principal = this.principals.get(principalId);
    if (!principal) {
      const err = new Error('Principal not found');
      (err as any).statusCode = 401;
      throw err;
    }

    // AI Agents cannot self-approve Human-in-the-Loop gates
    if (principal.type === 'AI_AGENT') {
      const err = new Error('AI agents are prohibited from approving governance gates');
      (err as any).statusCode = 403;
      (err as any).code = 'ERR_RBAC_DENIED';
      throw err;
    }

    const gate = this.gates.get(gateId);
    if (!gate) {
      const err = new Error('Gate not found');
      (err as any).statusCode = 404;
      throw err;
    }

    // Tenant boundary check: principal must belong to project
    if (!principal.allowedProjects.has(gate.projectId)) {
      const err = new Error('Tenant mismatch: Principal is not authorized for this project');
      (err as any).statusCode = 403;
      (err as any).code = 'ERR_TENANT_MISMATCH';
      throw err;
    }

    gate.status = decision;
    gate.decidedBy = principalId;
    gate.feedbackNotes = notes;
    gate.version += 1;
    return gate;
  }
}

describe('Stage 3: Master End-to-End Agency Pipeline Verification', () => {
  const mesh = new GovernanceMesh();

  // Test Entities
  const CLIENT_ID = 'client-0001-0000-0000-000000000001';
  const OTHER_CLIENT_ID = 'client-9999-0000-0000-000000000099';
  const PROJECT_ID = 'proj-0001-0000-0000-000000000001';
  const OTHER_PROJECT_ID = 'proj-9999-0000-0000-000000000099';

  const HUMAN_APPROVER_ID = 'user-human-approver-001';
  const AI_AGENT_ID = 'agent-marketer-autonomous-001';

  mesh.registerPrincipal({
    id: HUMAN_APPROVER_ID,
    type: 'HUMAN',
    role: 'CLIENT_APPROVER',
    clientId: CLIENT_ID,
    allowedProjects: new Set([PROJECT_ID]),
  });

  mesh.registerPrincipal({
    id: AI_AGENT_ID,
    type: 'AI_AGENT',
    role: 'AGENT_MARKETER',
    clientId: CLIENT_ID,
    allowedProjects: new Set([PROJECT_ID]),
  });

  let gate1Id = '';
  let gate2Id = '';
  let gate3Id = '';
  let gate4Id = '';
  let gate5Id = '';

  let generatedSqlMigration = '';
  let generatedOpenApiYaml = '';

  it('Stage 1 (MOD-01): Prospect Lead Discovery & Canva Proposal Generation -> Gate 1', async () => {
    const prospects: ProspectRaw[] = [
      {
        id: 'lead-0001-0000-0000-000000000001',
        name: 'Punjab Freight & Logistics Ltd',
        website: 'https://punjabfreight.example.com',
        email: 'partners@punjabfreight.example.com',
        phone: '+919876543210',
        hasMobileApp: false,
        lighthouseMobileScore: 42,
        hasWhatsAppBot: false,
        hasResponsiveViewport: true,
      },
    ];

    const dncList = new Set<string>(['blocked@example.com']);

    const leadResponse = await processLeadDiscovery(
      {
        target_niche: 'Logistics',
        country_code: 'IN',
        city: 'Amritsar',
        max_leads: 1,
        canva_pitch_template_id: 'DAG_canva_template_prospect_pitch_v2',
      },
      prospects,
      dncList
    );

    assert.strictEqual(leadResponse.leads_generated.length, 1);
    const lead = leadResponse.leads_generated[0];
    assert.strictEqual(lead.company_name, 'Punjab Freight & Logistics Ltd');
    assert.ok(lead.canva_proposal_pdf_url.includes('canva.com'));
    assert.ok(lead.digital_gaps_found.includes('NO_ANDROID_APP'));
    assert.ok(lead.digital_gaps_found.includes('LIGHTHOUSE_MOBILE_BELOW_50'));
    assert.ok(lead.applicable_compliance.includes('DPDP_INDIA_2023'));

    gate1Id = lead.approval_gate_id;
    assert.ok(gate1Id, 'Gate 1 ID must be generated');

    mesh.createGate(PROJECT_ID, gate1Id, 'OUTREACH_PITCH');
    const gate1 = mesh.getGate(gate1Id);
    assert.strictEqual(gate1?.status, 'PENDING');
  });

  it('Stage 2 (MOD-10): Gate 1 Human Approval (Client Approver signs proposal)', async () => {
    const updatedGate = mesh.decideGate(
      HUMAN_APPROVER_ID,
      gate1Id,
      'APPROVED',
      'Proposal pitch approved for immediate digital development'
    );
    assert.strictEqual(updatedGate.status, 'APPROVED');
    assert.strictEqual(updatedGate.decidedBy, HUMAN_APPROVER_ID);
  });

  it('Stage 3 (MOD-02): Business Analyst Intake & Legal Spec Synthesis -> Gate 2', async () => {
    const intakeTranscript = `
      We operate cross-border express delivery across India, Germany, and California (USA).
      Customers need real-time order tracking, responsive landing page, Android delivery app,
      and secure order management REST APIs.
      Users must be able to export their data and request full account erasure under DPDP and GDPR.
    `;

    const intakeResponse = await processBaIntake({
      project_id: PROJECT_ID,
      client_id: CLIENT_ID,
      intake_transcript: intakeTranscript,
      target_countries: ['IN', 'DE', 'US'],
      target_modules: {
        build_website: true,
        build_landing_page: true,
        build_android_app: true,
        build_backend_api: true,
      },
    });

    assert.strictEqual(intakeResponse.project_id, PROJECT_ID);
    assert.ok(intakeResponse.compliance_flags.includes('DPDP_INDIA'));
    assert.ok(intakeResponse.compliance_flags.includes('GDPR_EU'));
    assert.ok(intakeResponse.compliance_flags.includes('CCPA_US'));
    assert.ok(intakeResponse.compliance_flags.includes('GOOGLE_PLAY_DATA_SAFETY'));

    assert.ok(intakeResponse.prd_json.user_stories.length >= 3);
    assert.ok(intakeResponse.db_migration_sql.includes('ENABLE ROW LEVEL SECURITY'));
    assert.ok(intakeResponse.openapi_3_1_yaml.includes('openapi: 3.1.0'));

    generatedSqlMigration = intakeResponse.db_migration_sql;
    generatedOpenApiYaml = intakeResponse.openapi_3_1_yaml;

    gate2Id = intakeResponse.approval_gate_id;
    assert.ok(gate2Id, 'Gate 2 ID must be generated');

    mesh.createGate(PROJECT_ID, gate2Id, 'REQUIREMENTS_PRD');
    const gate2 = mesh.getGate(gate2Id);
    assert.strictEqual(gate2?.status, 'PENDING');
  });

  it('Stage 4 (MOD-10): Gate 2 Human Approval (PRD & Compliance Blueprint Approved)', async () => {
    const updatedGate = mesh.decideGate(
      HUMAN_APPROVER_ID,
      gate2Id,
      'APPROVED',
      'PRD and database architecture approved for code generation'
    );
    assert.strictEqual(updatedGate.status, 'APPROVED');
  });

  it('Stage 5 (MOD-03, MOD-04, MOD-05): Concurrent Triple-Engine Factory Generation', async () => {
    // 1. MOD-03: Responsive Web & Landing Builder
    const webResponse = await processWebBuild({
      project_id: PROJECT_ID,
      golden_template_id: 'golden-web-landing',
      compliance_flags: ['DPDP_INDIA', 'GDPR_EU'],
      file_deltas: [
        {
          file_path: 'src/pages/Home.tsx',
          content: '<main className="container mx-auto px-4"><h1 className="text-4xl font-bold">Punjab Freight</h1></main>',
        },
      ],
    });

    assert.deepStrictEqual(webResponse.viewports_verified, ['375px', '768px', '1280px', '1920px']);
    assert.strictEqual(webResponse.rtl_verified, true);
    assert.strictEqual(webResponse.cookie_consent_banner_active, true);
    assert.ok(webResponse.staging_preview_url.includes('launchup.internal'));
    assert.strictEqual(webResponse.git_commit_sha.length, 8);

    // 2. MOD-04: Android Mobile App Builder
    const androidResponse = await processAndroidBuild({
      project_id: PROJECT_ID,
      golden_template_id: 'golden-mobile-android',
      package_name: 'com.punjabfreight.express',
      target_sdk_version: 35,
      declared_permissions: ['ACCESS_COARSE_LOCATION'],
      data_safety_csv_declarations: ['LOCATION'],
      keystore_config: {
        alias: 'release-key',
        key_password: 'ValidPassword123!',
        store_password: 'ValidPassword123!',
      },
    });

    assert.ok(androidResponse.signed_apk_url.endsWith('-release.apk'));
    assert.ok(androidResponse.signed_aab_url.endsWith('-release.aab'));
    assert.ok(androidResponse.play_store_data_safety_csv_url.endsWith('-data-safety.csv'));
    assert.strictEqual(androidResponse.in_app_account_deletion_route, '/settings/delete-account');

    // 3. MOD-05: Backend API & Row-Level Security Verification
    const backendResponse = await processBackendBuild({
      project_id: PROJECT_ID,
      golden_template_id: 'golden-backend-api',
      db_migration_sql: generatedSqlMigration,
      openapi_3_1_yaml: generatedOpenApiYaml,
    });

    assert.ok(backendResponse.rls_tables_verified_count > 0);
    assert.strictEqual(backendResponse.unprotected_tables_count, 0);
    assert.ok(backendResponse.privacy_endpoints_active.includes('/api/v1/privacy/me/export'));
    assert.ok(backendResponse.privacy_endpoints_active.includes('/api/v1/privacy/me/erase'));
  });

  it('Stage 6 (MOD-06): Autonomous QA, SecOps & Lighthouse CI Verification -> Gate 3', async () => {
    const qaResponse = await processQAVerification({
      project_id: PROJECT_ID,
      staging_web_url: 'https://preview-proj-000.launchup.internal',
      api_endpoint_url: 'https://api-preview-proj-000.launchup.internal',
      user_stories: [
        {
          id: 'US-001',
          title: 'Real-time order tracking',
          acceptance_criteria: ['Returns 200 OK', 'Displays live GPS coordinates'],
        },
      ],
      simulated_findings: {
        semgrep_critical_findings: 0,
        trivy_critical_cves: 0,
        gitleaks_secrets_found: 0,
        custom_lighthouse_scores: {
          performance: 96,
          accessibility: 98,
          best_practices: 95,
          seo: 98,
        },
      },
    });

    assert.strictEqual(qaResponse.overall_pass, true);
    assert.strictEqual(qaResponse.playwright_pass_rate, 100.0);
    assert.strictEqual(qaResponse.semgrep_critical_findings, 0);
    assert.strictEqual(qaResponse.trivy_critical_cves, 0);
    assert.strictEqual(qaResponse.gitleaks_secrets_found, 0);
    assert.ok(qaResponse.lighthouse_scores.performance >= 90);

    gate3Id = qaResponse.approval_gate_id;
    assert.ok(gate3Id.startsWith('gate-0003-'));

    mesh.createGate(PROJECT_ID, gate3Id, 'STAGE_PREVIEW_APPROVED');
    const gate3 = mesh.getGate(gate3Id);
    assert.strictEqual(gate3?.status, 'PENDING');
  });

  it('Stage 7 (MOD-10): Gate 3 Human Approval (Staging Preview Approved for Production)', async () => {
    const updatedGate = mesh.decideGate(
      HUMAN_APPROVER_ID,
      gate3Id,
      'APPROVED',
      'QA & SecOps certificate verified: 100% test pass and 0 vulnerabilities'
    );
    assert.strictEqual(updatedGate.status, 'APPROVED');
  });

  it('Stage 8 (MOD-07, MOD-08): Digital Marketing Calendar & WhatsApp Operations -> Gate 4', async () => {
    // 1. MOD-07: Canva Pro Marketing Campaign
    const marketingResponse = await processMarketingCampaign({
      project_id: PROJECT_ID,
      campaign_theme: 'Next-Day Express Dispatch',
      canva_brand_template_ids: ['DAG_canva_brand_template_social_01'],
      days_count: 30,
      brand_kit: {
        company_name: 'Punjab Freight & Logistics',
        primary_color_hex: '#1E40AF',
        logo_svg_url: 'https://assets.example.com/logo.svg',
      },
    });

    assert.strictEqual(marketingResponse.calendar_items.length, 30);
    const day1 = marketingResponse.calendar_items[0];
    assert.strictEqual(day1.day, 1);
    assert.strictEqual(day1.platform, 'INSTAGRAM');
    assert.strictEqual(day1.eu_ai_act_disclosure_attached, true);

    gate4Id = marketingResponse.approval_gate_id;
    assert.ok(gate4Id.startsWith('gate-0004-'));

    mesh.createGate(PROJECT_ID, gate4Id, 'MARKETING_PUBLISH');

    // Approve Gate 4
    const updatedGate4 = mesh.decideGate(
      HUMAN_APPROVER_ID,
      gate4Id,
      'APPROVED',
      '30-day marketing schedule and EU AI Act disclosures approved'
    );
    assert.strictEqual(updatedGate4.status, 'APPROVED');

    // 2. MOD-08: Inbound WhatsApp Customer Service & RAG
    const inboundResponse = await processWhatsAppEvent({
      project_id: PROJECT_ID,
      client_id: CLIENT_ID,
      event_type: 'INBOUND_CUSTOMER_MSG',
      recipient_phone_e164: '+919876543210',
      last_inbound_timestamp: new Date().toISOString(),
      message_payload: {
        text_or_template: 'What is the tracking number for order #PF-9482?',
      },
    });

    assert.strictEqual(inboundResponse.within_24h_service_window, true);
    assert.ok(inboundResponse.rag_confidence_score >= 0.75);
    assert.strictEqual(inboundResponse.escalated_to_human_chatwoot, false);

    // 3. MOD-08: Outbound Campaign Broadcast with Valid Opt-In Proof
    const outboundResponse = await processWhatsAppEvent({
      project_id: PROJECT_ID,
      client_id: CLIENT_ID,
      event_type: 'OUTBOUND_CAMPAIGN_BROADCAST',
      recipient_phone_e164: '+919876543210',
      opt_in_proof_id: 'optin-proof-user-consent-v1',
      last_inbound_timestamp: new Date().toISOString(),
      message_payload: {
        text_or_template: 'Your Punjab Freight express order has dispatched! Track live: https://pf.link/9482',
        is_meta_approved_template: true,
      },
    });

    assert.ok(outboundResponse.whatsapp_message_id.startsWith('wamid.HBgM'));
    assert.strictEqual(outboundResponse.unsubscribe_footer_attached, true);
  });

  it('Stage 9 (MOD-09): Autonomous SRE Healing & AST Blast Radius Analysis -> Gate 5', async () => {
    const sreResponse = await processSREIncident({
      project_id: PROJECT_ID,
      incident_source: 'SENTRY_5XX',
      error_signature: 'KeyError: "shipping_rates"',
      stack_trace_or_metric: {
        service: 'rates-service',
        culprit_file: 'services/rates/calculator.py',
        frames: [
          'services/rates/calculator.py::calculate_shipping_rates:84',
          'services/orders/fulfillment.py::process_fulfillment:112',
        ],
      },
    });

    assert.strictEqual(sreResponse.project_id, PROJECT_ID);
    assert.strictEqual(sreResponse.is_external_third_party_outage, false);
    assert.ok(sreResponse.impacted_graphify_nodes.length > 0);
    assert.strictEqual(sreResponse.sandbox_regression_passed, true);
    assert.ok(sreResponse.hotfix_pr_url.includes('pull/'));

    gate5Id = sreResponse.approval_gate_id;
    assert.ok(gate5Id.startsWith('gate-0005-'));

    mesh.createGate(PROJECT_ID, gate5Id, 'HOTFIX_MERGE');
    const gate5 = mesh.getGate(gate5Id);
    assert.strictEqual(gate5?.status, 'PENDING');
  });

  it('Stage 10 (MOD-10): Gate 5 Human Approval (Production Hotfix PR Approved)', async () => {
    const updatedGate5 = mesh.decideGate(
      HUMAN_APPROVER_ID,
      gate5Id,
      'APPROVED',
      'Hotfix PR reviewed and sandbox regression passed. Ready to merge to main.'
    );
    assert.strictEqual(updatedGate5.status, 'APPROVED');
    assert.strictEqual(updatedGate5.version, 2);
  });

  it('Negative Guardrail 1: AI Agent Self-Approval Rejected (403 ERR_RBAC_DENIED)', async () => {
    assert.throws(
      () => {
        mesh.decideGate(AI_AGENT_ID, gate5Id, 'APPROVED', 'AI agent auto-approval');
      },
      (err: any) => {
        return err.statusCode === 403 && err.code === 'ERR_RBAC_DENIED';
      }
    );
  });

  it('Negative Guardrail 2: Cross-Tenant Project Tampering Blocked (403 ERR_TENANT_MISMATCH)', async () => {
    const otherGateId = 'gate-0001-other-project-gate';
    mesh.createGate(OTHER_PROJECT_ID, otherGateId, 'OUTREACH_PITCH');

    assert.throws(
      () => {
        mesh.decideGate(HUMAN_APPROVER_ID, otherGateId, 'APPROVED', 'Unauthorized access');
      },
      (err: any) => {
        return err.statusCode === 403 && err.code === 'ERR_TENANT_MISMATCH';
      }
    );
  });

  it('Negative Guardrail 3: Forbidden File Touch in SRE Engine Blocked (403 ERR_FORBIDDEN_FILE_TOUCH)', async () => {
    await assert.rejects(
      async () => {
        await processSREIncident({
          project_id: PROJECT_ID,
          incident_source: 'SENTRY_5XX',
          error_signature: 'AuthenticationBypassAttempt',
          stack_trace_or_metric: {
            attempted_touch_file: 'services/auth-service/src/middleware/authenticate.ts',
          },
        });
      },
      (err: any) => {
        return err.code === 'ERR_FORBIDDEN_FILE_TOUCH' && err.statusCode === 403;
      }
    );
  });

  it('Negative Guardrail 4: Unconsented Outbound WhatsApp Broadcast Blocked (403 ERR_NO_OPTIN_PROOF)', async () => {
    await assert.rejects(
      async () => {
        await processWhatsAppEvent({
          project_id: PROJECT_ID,
          client_id: CLIENT_ID,
          event_type: 'OUTBOUND_CAMPAIGN_BROADCAST',
          recipient_phone_e164: '+919876543210',
          opt_in_proof_id: '', // Missing opt-in proof
          last_inbound_timestamp: new Date().toISOString(),
          message_payload: {
            text_or_template: 'Promotional blast without consent',
          },
        });
      },
      (err: any) => {
        return err.code === 'ERR_NO_OPTIN_PROOF' && err.statusCode === 403;
      }
    );
  });
});
