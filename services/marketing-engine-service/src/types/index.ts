export type SocialPlatform = 'INSTAGRAM' | 'LINKEDIN' | 'FACEBOOK';

export interface CalendarItem {
  day: number;
  platform: SocialPlatform;
  caption: string;
  canva_export_url: string;
  eu_ai_act_disclosure_attached: boolean;
}

export interface Mod07MarketingRequest {
  project_id: string;
  brand_kit: Record<string, any>;
  campaign_theme: string;
  days_count: number;
  canva_brand_template_ids: string[];
  simulate_rate_limit?: boolean;
  simulate_field_mismatch?: boolean;
}

export interface Mod07MarketingResponse {
  project_id: string;
  calendar_items: CalendarItem[];
  approval_gate_id: string;
}

// ── Deterministic Domain Error Classes ──

export class CanvaRateLimitError extends Error {
  readonly code = 'ERR_CANVA_RATE_LIMIT';
  readonly statusCode = 429;
  readonly retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number = 60) {
    super(message);
    this.name = 'CanvaRateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class TemplateFieldMismatchError extends Error {
  readonly code = 'ERR_TEMPLATE_FIELD_MISMATCH';
  readonly statusCode = 422;
  readonly missingFields?: string[];

  constructor(message: string, missingFields?: string[]) {
    super(message);
    this.name = 'TemplateFieldMismatchError';
    this.missingFields = missingFields;
  }
}
