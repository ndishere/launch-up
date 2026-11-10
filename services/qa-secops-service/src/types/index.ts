export interface UserStory {
  id: string;
  role: string;
  goal: string;
  acceptance_criteria: string[];
}

export interface LighthouseScores {
  performance: number;
  accessibility: number;
  best_practices: number;
  seo: number;
}

export interface SimulatedQAFindings {
  semgrep_critical_findings?: number;
  trivy_critical_cves?: number;
  gitleaks_secrets_found?: number;
  failing_user_stories?: string[];
  custom_lighthouse_scores?: Partial<LighthouseScores>;
}

export interface Mod06QAVerifyRequest {
  project_id: string;
  web_staging_url: string;
  api_staging_url: string;
  signed_apk_url: string;
  user_stories: UserStory[];
  simulated_findings?: SimulatedQAFindings;
}

export interface Mod06QAVerifyResponse {
  project_id: string;
  overall_pass: boolean;
  playwright_pass_rate: number;
  semgrep_critical_findings: number;
  trivy_critical_cves: number;
  gitleaks_secrets_found: number;
  lighthouse_scores: LighthouseScores;
  approval_gate_id: string;
}

// ── Deterministic Domain Error Classes ──

export class SecurityVulnFoundError extends Error {
  readonly code = 'ERR_SECURITY_VULN_FOUND';
  readonly statusCode = 406;
  readonly findings?: {
    semgrep?: number;
    trivy?: number;
    gitleaks?: number;
  };

  constructor(message: string, findings?: { semgrep?: number; trivy?: number; gitleaks?: number }) {
    super(message);
    this.name = 'SecurityVulnFoundError';
    this.findings = findings;
  }
}

export class E2EAssertionFailError extends Error {
  readonly code = 'ERR_E2E_ASSERTION_FAIL';
  readonly statusCode = 422;
  readonly failedStories?: string[];
  readonly passRate?: number;

  constructor(message: string, failedStories?: string[], passRate?: number) {
    super(message);
    this.name = 'E2EAssertionFailError';
    this.failedStories = failedStories;
    this.passRate = passRate;
  }
}

export class LighthouseBelow90Error extends Error {
  readonly code = 'ERR_LIGHTHOUSE_BELOW_90';
  readonly statusCode = 422;
  readonly failingCategories?: Record<string, number>;

  constructor(message: string, failingCategories?: Record<string, number>) {
    super(message);
    this.name = 'LighthouseBelow90Error';
    this.failingCategories = failingCategories;
  }
}
