export interface Mod05BackendBuildRequest {
  project_id: string;
  golden_template_id: string;
  db_migration_sql: string;
  openapi_3_1_yaml: string;
  rbac_matrix: Record<string, string[]>;
  compliance_flags?: string[];
}

export interface Mod05BackendBuildResponse {
  project_id: string;
  git_commit_sha: string;
  api_staging_url: string;
  rls_tables_verified_count: number;
  unprotected_tables_count: number;
  privacy_endpoints_active: string[];
  graphify_updated: boolean;
}

// ── Deterministic Domain Error Classes ──

export class RlsUnprotectedTableError extends Error {
  readonly code = 'ERR_RLS_UNPROTECTED_TABLE';
  readonly statusCode = 403;
  readonly unprotectedTables?: string[];

  constructor(message: string, unprotectedTables?: string[]) {
    super(message);
    this.name = 'RlsUnprotectedTableError';
    this.unprotectedTables = unprotectedTables;
  }
}

export class MigrationConflictError extends Error {
  readonly code = 'ERR_MIGRATION_CONFLICT';
  readonly statusCode = 409;
  readonly conflictingEntities?: string[];

  constructor(message: string, conflictingEntities?: string[]) {
    super(message);
    this.name = 'MigrationConflictError';
    this.conflictingEntities = conflictingEntities;
  }
}

export class OpenApiDriftError extends Error {
  readonly code = 'ERR_OPENAPI_DRIFT';
  readonly statusCode = 422;
  readonly driftingEndpoints?: string[];

  constructor(message: string, driftingEndpoints?: string[]) {
    super(message);
    this.name = 'OpenApiDriftError';
    this.driftingEndpoints = driftingEndpoints;
  }
}
