export type Mod08EventType = 'INBOUND_CUSTOMER_MSG' | 'OUTBOUND_CAMPAIGN_BROADCAST';

export interface Mod08MessagePayload {
  text_or_template: string;
  template_name?: string;
  template_params?: Record<string, string>;
  is_meta_approved_template?: boolean;
}

export interface Mod08WhatsAppRequest {
  project_id: string;
  event_type: Mod08EventType;
  recipient_phone_e164: string;
  opt_in_proof_id: string | null;
  last_inbound_timestamp: string;
  message_payload: Mod08MessagePayload;
  mock_meta_failure?: boolean;
  mock_rag_score?: number;
  current_time_iso?: string; // For deterministic unit test clock verification
}

export interface Mod08WhatsAppResponse {
  project_id: string;
  whatsapp_message_id: string;
  within_24h_service_window: boolean;
  rag_confidence_score: number;
  escalated_to_human_chatwoot: boolean;
  unsubscribe_footer_attached: boolean;
}

// Deterministic Error Classes (Node 26 strip-only compatible, no parameter properties)
export class NoOptinProofError extends Error {
  readonly code = 'ERR_NO_OPTIN_PROOF';
  readonly statusCode = 403;
  readonly details?: any;

  constructor(message: string = 'Outbound campaign broadcast requires a verified opt-in proof ID', details?: any) {
    super(message);
    this.name = 'NoOptinProofError';
    this.details = details;
  }
}

export class Outside24hWindowError extends Error {
  readonly code = 'ERR_OUTSIDE_24H_WINDOW';
  readonly statusCode = 422;
  readonly details?: any;

  constructor(message: string = 'Message sent outside the 24-hour customer service window requires an approved Meta template', details?: any) {
    super(message);
    this.name = 'Outside24hWindowError';
    this.details = details;
  }
}

export class MetaApiRejectError extends Error {
  readonly code = 'ERR_META_API_REJECT';
  readonly statusCode = 502;
  readonly details?: any;

  constructor(message: string = 'Meta WhatsApp Business API rejected the message delivery', details?: any) {
    super(message);
    this.name = 'MetaApiRejectError';
    this.details = details;
  }
}

export class ValidationError extends Error {
  readonly code = 'ERR_VALIDATION_FAILED';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateWhatsAppRequest(data: any): Mod08WhatsAppRequest {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Request body must be a valid JSON object');
  }
  if (!data.project_id || typeof data.project_id !== 'string') {
    throw new ValidationError('project_id is required and must be a string');
  }
  if (data.event_type !== 'INBOUND_CUSTOMER_MSG' && data.event_type !== 'OUTBOUND_CAMPAIGN_BROADCAST') {
    throw new ValidationError('event_type must be either INBOUND_CUSTOMER_MSG or OUTBOUND_CAMPAIGN_BROADCAST');
  }
  if (!data.recipient_phone_e164 || typeof data.recipient_phone_e164 !== 'string') {
    throw new ValidationError('recipient_phone_e164 is required');
  }
  if (!/^\+[1-9]\d{6,14}$/.test(data.recipient_phone_e164)) {
    throw new ValidationError('recipient_phone_e164 must be a valid E.164 phone number (e.g. +919876543210)');
  }
  if (data.opt_in_proof_id !== null && data.opt_in_proof_id !== undefined && typeof data.opt_in_proof_id !== 'string') {
    throw new ValidationError('opt_in_proof_id must be a string or null');
  }
  if (!data.last_inbound_timestamp || typeof data.last_inbound_timestamp !== 'string') {
    throw new ValidationError('last_inbound_timestamp is required');
  }
  if (isNaN(new Date(data.last_inbound_timestamp).getTime())) {
    throw new ValidationError('last_inbound_timestamp must be a valid ISO 8601 date string');
  }
  if (!data.message_payload || typeof data.message_payload !== 'object' || !data.message_payload.text_or_template) {
    throw new ValidationError('message_payload.text_or_template is required');
  }

  return {
    project_id: data.project_id,
    event_type: data.event_type,
    recipient_phone_e164: data.recipient_phone_e164,
    opt_in_proof_id: data.opt_in_proof_id || null,
    last_inbound_timestamp: data.last_inbound_timestamp,
    message_payload: data.message_payload,
    mock_meta_failure: Boolean(data.mock_meta_failure),
    mock_rag_score: typeof data.mock_rag_score === 'number' ? data.mock_rag_score : undefined,
    current_time_iso: typeof data.current_time_iso === 'string' ? data.current_time_iso : undefined,
  };
}
