export interface Mod01LeadRequest {
  target_niche: string;
  country_code: string;
  city: string;
  max_leads?: number;
  canva_pitch_template_id: string;
}

export interface GeneratedLead {
  lead_id: string;
  company_name: string;
  website_url: string;
  digital_gaps_found: string[];
  applicable_compliance: string[];
  canva_proposal_pdf_url: string;
  approval_gate_id: string;
}

export interface Mod01LeadResponse {
  leads_generated: GeneratedLead[];
}

export interface ProspectRaw {
  id: string;
  name: string;
  website: string;
  email: string;
  phone: string;
  hasMobileApp: boolean;
  lighthouseMobileScore: number;
  hasWhatsAppBot: boolean;
  hasResponsiveViewport: boolean;
}

export class DncListBlockedError extends Error {
  readonly statusCode = 422;
  readonly code = 'ERR_DNC_LIST_BLOCKED';
  constructor(msg = 'Prospect is on the Do-Not-Contact (DNC) suppression list') {
    super(msg);
    this.name = 'DncListBlockedError';
  }
}

export class ScrapeTimeoutError extends Error {
  readonly statusCode = 504;
  readonly code = 'ERR_SCRAPE_TIMEOUT';
  constructor(msg = 'Prospect digital audit scrape timed out') {
    super(msg);
    this.name = 'ScrapeTimeoutError';
  }
}

export class CanvaAutofillFailError extends Error {
  readonly statusCode = 502;
  readonly code = 'ERR_CANVA_AUTOFILL_FAIL';
  constructor(msg = 'Canva template autofill failed') {
    super(msg);
    this.name = 'CanvaAutofillFailError';
  }
}
