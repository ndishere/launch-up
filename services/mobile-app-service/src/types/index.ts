export interface BrandAssets {
  primary_color_hex?: string;
  secondary_color_hex?: string;
  font_heading?: string;
  font_body?: string;
  app_icon_url?: string;
}

export interface FileDelta {
  file_path: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  content?: string;
}

export interface KeystoreConfig {
  keystore_base64?: string;
  key_alias?: string;
  key_password?: string;
  store_password?: string;
}

export interface Mod04AndroidBuildRequest {
  project_id: string;
  golden_template_id: string;
  openapi_3_1_yaml?: string;
  brand_assets?: BrandAssets;
  package_name: string;
  target_sdk_version: number;
  file_deltas: FileDelta[];
  keystore_config?: KeystoreConfig;
  declared_permissions?: string[];
  data_safety_csv_declarations?: string[];
}

export interface Mod04AndroidBuildResponse {
  project_id: string;
  git_commit_sha: string;
  signed_apk_url: string;
  signed_aab_url: string;
  play_store_data_safety_csv_url: string;
  in_app_account_deletion_route: string;
  web_account_deletion_url: string;
  graphify_updated: boolean;
}

// ── Deterministic Domain Error Classes ──

export class PlayPolicyMissingError extends Error {
  readonly code = 'ERR_PLAY_POLICY_MISSING';
  readonly statusCode = 422;
  readonly missingDeclarations?: string[];

  constructor(message: string, missingDeclarations?: string[]) {
    super(message);
    this.name = 'PlayPolicyMissingError';
    this.missingDeclarations = missingDeclarations;
  }
}

export class SigningKeyInvalidError extends Error {
  readonly code = 'ERR_SIGNING_KEY_INVALID';
  readonly statusCode = 401;

  constructor(message: string) {
    super(message);
    this.name = 'SigningKeyInvalidError';
  }
}

export class GradleFastlaneError extends Error {
  readonly code = 'ERR_GRADLE_FASTLANE';
  readonly statusCode = 500;
  readonly details?: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'GradleFastlaneError';
    this.details = details;
  }
}
