export interface BrandAssets {
  primary_color_hex?: string;
  secondary_color_hex?: string;
  font_heading?: string;
  font_body?: string;
  logo_url?: string;
}

export interface FileDelta {
  file_path: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  content?: string;
  linked_user_story_ids?: string[];
}

export interface Mod03WebBuildRequest {
  project_id: string;
  golden_template_id: string;
  openapi_3_1_yaml?: string;
  brand_assets?: BrandAssets;
  compliance_flags?: string[];
  ga4_measurement_id?: string;
  file_deltas: FileDelta[];
}

export interface Mod03WebBuildResponse {
  project_id: string;
  git_commit_sha: string;
  staging_preview_url: string;
  viewports_verified: string[];
  rtl_verified: boolean;
  cookie_consent_banner_active: boolean;
  graphify_updated: boolean;
}

// ── Deterministic Domain Error Classes ──

export class BuildCompileError extends Error {
  readonly code = 'ERR_BUILD_COMPILE';
  readonly statusCode = 500;
  readonly details?: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'BuildCompileError';
    this.details = details;
  }
}

export class ViewportOverflowError extends Error {
  readonly code = 'ERR_VIEWPORT_OVERFLOW';
  readonly statusCode = 422;
  readonly viewport?: string;
  readonly culprit?: string;

  constructor(message: string, viewport?: string, culprit?: string) {
    super(message);
    this.name = 'ViewportOverflowError';
    this.viewport = viewport;
    this.culprit = culprit;
  }
}

export class SandboxTimeoutError extends Error {
  readonly code = 'ERR_SANDBOX_TIMEOUT';
  readonly statusCode = 504;

  constructor(message: string) {
    super(message);
    this.name = 'SandboxTimeoutError';
  }
}
