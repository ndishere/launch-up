export interface BrandAssets {
  primary_color_hex: string;
  secondary_color_hex: string;
  font_heading: string;
  font_body: string;
}

export interface TargetModules {
  build_website: boolean;
  build_landing_page: boolean;
  build_android_app: boolean;
  build_backend_api: boolean;
  enable_digital_marketing: boolean;
  enable_whatsapp_marketing: boolean;
}

export interface Mod02IntakeRequest {
  project_id: string;
  client_id: string;
  intake_transcript: string;
  brand_assets: BrandAssets;
  target_countries: string[];
  target_modules: TargetModules;
}

export interface UserStory {
  id: string;
  role: string;
  goal: string;
  acceptance_criteria: string[];
  priority: 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE';
}

export interface PrdJson {
  executive_summary: string;
  user_stories: UserStory[];
  roles_and_permissions: Record<string, string[]>;
}

export interface Mod02IntakeResponse {
  project_id: string;
  prd_json: PrdJson;
  db_migration_sql: string;
  openapi_3_1_yaml: string;
  compliance_flags: string[];
  generated_docs_paths: string[];
  approval_gate_id: string;
}

// ── Deterministic Error Classes ───────────────────────────────────────
export class SchemaInvalidError extends Error {
  readonly statusCode = 422;
  readonly code = 'ERR_SCHEMA_INVALID';
  constructor(msg = 'Validation failed: Intake schema or generated artifacts invalid') {
    super(msg);
    this.name = 'SchemaInvalidError';
  }
}

export class AmbiguousScopeError extends Error {
  readonly statusCode = 409;
  readonly code = 'ERR_AMBIGUOUS_SCOPE';
  constructor(msg = 'Ambiguous or conflicting requirements detected in scope synthesis') {
    super(msg);
    this.name = 'AmbiguousScopeError';
  }
}

export class UnsupportedLawError extends Error {
  readonly statusCode = 400;
  readonly code = 'ERR_UNSUPPORTED_LAW';
  constructor(msg = 'Target country requested is unsupported or invalid') {
    super(msg);
    this.name = 'UnsupportedLawError';
  }
}
