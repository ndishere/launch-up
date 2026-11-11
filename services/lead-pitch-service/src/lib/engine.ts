import crypto from 'node:crypto';
import type {
  Mod01LeadRequest,
  Mod01LeadResponse,
  GeneratedLead,
  ProspectRaw,
} from '../types/index.ts';
export type { ProspectRaw };

import {
  DncListBlockedError,
  ScrapeTimeoutError,
  CanvaAutofillFailError,
} from '../types/index.ts';

export function resolveCompliance(countryCode: string): string[] {
  switch (countryCode.toUpperCase()) {
    case 'IN':
      return ['DPDP_INDIA_2023', 'CERT_IN'];
    case 'US':
      return ['CCPA_US', 'CAN_SPAM_ACT'];
    case 'DE':
    case 'FR':
    case 'EU':
      return ['GDPR_EU', 'EU_AI_ACT'];
    default:
      return ['GLOBAL_PRIVACY_STANDARD'];
  }
}

export function auditDigitalGaps(prospect: ProspectRaw): string[] {
  const gaps: string[] = [];
  if (!prospect.hasMobileApp) gaps.push('NO_ANDROID_APP');
  if (prospect.lighthouseMobileScore < 50) gaps.push('LIGHTHOUSE_MOBILE_BELOW_50');
  if (!prospect.hasWhatsAppBot) gaps.push('NO_WHATSAPP_BOT');
  if (!prospect.hasResponsiveViewport) gaps.push('NO_RESPONSIVE_VIEWPORT');
  return gaps;
}

export function checkDncSuppression(
  identifier: { email?: string; phone?: string },
  dncList: Set<string>
): boolean {
  if (identifier.email && dncList.has(identifier.email.toLowerCase())) {
    return true;
  }
  if (identifier.phone) {
    const cleanPhone = identifier.phone.replace(/[^0-9+]/g, '');
    if (dncList.has(cleanPhone)) return true;
  }
  return false;
}

export function autofillCanvaProposal(
  templateId: string,
  companyName: string,
  gaps: string[],
  options?: { simulateFailure?: boolean }
): string {
  if (options?.simulateFailure || !templateId.startsWith('DAG_canva_template')) {
    throw new CanvaAutofillFailError(`Template autofill failed for template '${templateId}'`);
  }
  const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `https://export.canva.com/proposal_${slug}_01.pdf`;
}

export async function processLeadDiscovery(
  request: Mod01LeadRequest,
  prospects: ProspectRaw[],
  dncList: Set<string>,
  options?: { simulateScrapeTimeout?: boolean; simulateCanvaFail?: boolean }
): Promise<Mod01LeadResponse> {
  if (options?.simulateScrapeTimeout) {
    throw new ScrapeTimeoutError();
  }

  const leads: GeneratedLead[] = [];
  const max = request.max_leads || 10;

  for (const p of prospects.slice(0, max)) {
    // 1. DNC check
    if (checkDncSuppression({ email: p.email, phone: p.phone }, dncList)) {
      throw new DncListBlockedError(`Prospect '${p.name}' is on the DNC list`);
    }

    // 2. Audit gaps & compliance
    const gaps = auditDigitalGaps(p);
    const compliance = resolveCompliance(request.country_code);

    // 3. Generate Canva Proposal
    const pdfUrl = autofillCanvaProposal(
      request.canva_pitch_template_id,
      p.name,
      gaps,
      { simulateFailure: options?.simulateCanvaFail }
    );

    // 4. Create Gate 1: OUTREACH_PITCH
    const approvalGateId = crypto.randomUUID();

    leads.push({
      lead_id: p.id,
      company_name: p.name,
      website_url: p.website,
      digital_gaps_found: gaps,
      applicable_compliance: compliance,
      canva_proposal_pdf_url: pdfUrl,
      approval_gate_id: approvalGateId,
    });
  }

  return { leads_generated: leads };
}
