export type IncidentSource = 'SENTRY_5XX' | 'UPTIME_KUMA_DOWN' | 'GA4_CONVERSION_DROP';

export interface Mod09SRERequest {
  project_id: string;
  incident_source: IncidentSource;
  error_signature: string;
  stack_trace_or_metric: Record<string, any>;
  simulate_reproduction_failure?: boolean;
  simulate_patch_test_failure?: boolean;
  simulate_max_retries?: boolean;
  simulate_forbidden_file_touch?: boolean;
}

export interface Mod09SREResponse {
  project_id: string;
  is_external_third_party_outage: boolean;
  rca_summary: string;
  impacted_graphify_nodes: string[];
  hotfix_pr_url: string;
  sandbox_regression_passed: boolean;
  approval_gate_id: string;
}

// ── Deterministic Domain Error Classes ──

export class ForbiddenFileTouchError extends Error {
  readonly code = 'ERR_FORBIDDEN_FILE_TOUCH';
  readonly statusCode = 403;
  readonly details?: any;

  constructor(message: string = 'Autonomous SRE agent attempted to modify protected file (RLS, auth middleware, or billing ledger)', details?: any) {
    super(message);
    this.name = 'ForbiddenFileTouchError';
    this.details = details;
  }
}

export class ReproductionFailedError extends Error {
  readonly code = 'ERR_REPRODUCTION_FAILED';
  readonly statusCode = 422;
  readonly details?: any;

  constructor(message: string = 'Failed to reproduce incident error in isolated sandbox reproduction harness', details?: any) {
    super(message);
    this.name = 'ReproductionFailedError';
    this.details = details;
  }
}

export class HotfixBrokeTestsError extends Error {
  readonly code = 'ERR_HOTFIX_BROKE_TESTS';
  readonly statusCode = 409;
  readonly details?: any;

  constructor(message: string = 'Automated hotfix patch broke existing regression test suite in sandbox', details?: any) {
    super(message);
    this.name = 'HotfixBrokeTestsError';
    this.details = details;
  }
}

export class MaxRetriesExceededError extends Error {
  readonly code = 'ERR_MAX_RETRIES_EXCEEDED';
  readonly statusCode = 508;
  readonly details?: any;

  constructor(message: string = 'Maximum hotfix repair retry attempts (3) exceeded without resolving test failures', details?: any) {
    super(message);
    this.name = 'MaxRetriesExceededError';
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

export function validateSRERequest(data: any): Mod09SRERequest {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Request body must be a valid JSON object');
  }
  if (!data.project_id || typeof data.project_id !== 'string') {
    throw new ValidationError('project_id is required and must be a string');
  }
  const validSources: IncidentSource[] = ['SENTRY_5XX', 'UPTIME_KUMA_DOWN', 'GA4_CONVERSION_DROP'];
  if (!validSources.includes(data.incident_source)) {
    throw new ValidationError(`incident_source must be one of: ${validSources.join(', ')}`);
  }
  if (!data.error_signature || typeof data.error_signature !== 'string') {
    throw new ValidationError('error_signature is required and must be a string');
  }
  if (!data.stack_trace_or_metric || typeof data.stack_trace_or_metric !== 'object') {
    throw new ValidationError('stack_trace_or_metric is required and must be an object');
  }

  return {
    project_id: data.project_id,
    incident_source: data.incident_source,
    error_signature: data.error_signature,
    stack_trace_or_metric: data.stack_trace_or_metric,
    simulate_reproduction_failure: Boolean(data.simulate_reproduction_failure),
    simulate_patch_test_failure: Boolean(data.simulate_patch_test_failure),
    simulate_max_retries: Boolean(data.simulate_max_retries),
    simulate_forbidden_file_touch: Boolean(data.simulate_forbidden_file_touch),
  };
}
