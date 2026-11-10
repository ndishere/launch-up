import crypto from 'node:crypto';
import type {
  Mod06QAVerifyRequest,
  Mod06QAVerifyResponse,
  LighthouseScores,
  SimulatedQAFindings,
  UserStory,
} from '../types/index.ts';
import {
  SecurityVulnFoundError,
  E2EAssertionFailError,
  LighthouseBelow90Error,
} from '../types/index.ts';

export function validateLighthouseScores(scores: LighthouseScores): void {
  const failing: Record<string, number> = {};

  if (scores.performance < 90) failing.performance = scores.performance;
  if (scores.accessibility < 90) failing.accessibility = scores.accessibility;
  if (scores.best_practices < 90) failing.best_practices = scores.best_practices;
  if (scores.seo < 90) failing.seo = scores.seo;

  if (Object.keys(failing).length > 0) {
    const details = Object.entries(failing)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ');
    throw new LighthouseBelow90Error(
      `Lighthouse CI audit threshold violation: All categories must score >= 90. Failing categories: ${details}`,
      failing
    );
  }
}

export function runSecurityAudit(findings?: SimulatedQAFindings): {
  semgrep: number;
  trivy: number;
  gitleaks: number;
} {
  const semgrep = findings?.semgrep_critical_findings ?? 0;
  const trivy = findings?.trivy_critical_cves ?? 0;
  const gitleaks = findings?.gitleaks_secrets_found ?? 0;

  if (semgrep > 0 || trivy > 0 || gitleaks > 0) {
    throw new SecurityVulnFoundError(
      `SecOps SAST/SCA security vulnerabilities detected: Semgrep=${semgrep}, Trivy=${trivy}, Gitleaks=${gitleaks}`,
      { semgrep, trivy, gitleaks }
    );
  }

  return { semgrep, trivy, gitleaks };
}

export function runPlaywrightE2E(
  userStories: UserStory[],
  findings?: SimulatedQAFindings
): { passRate: number; failedStories: string[] } {
  const failing = findings?.failing_user_stories || [];
  if (failing.length > 0) {
    const total = userStories.length || failing.length;
    const passed = Math.max(0, total - failing.length);
    const passRate = Math.round((passed / total) * 100);

    throw new E2EAssertionFailError(
      `Playwright E2E assertion failure: ${failing.length} user story flow(s) failed acceptance criteria: ${failing.join(', ')}`,
      failing,
      passRate
    );
  }

  return { passRate: 100.0, failedStories: [] };
}

export async function processQAVerification(
  request: Mod06QAVerifyRequest
): Promise<Mod06QAVerifyResponse> {
  // 1. Run SecOps scanning (Semgrep, Trivy, Gitleaks)
  const security = runSecurityAudit(request.simulated_findings);

  // 2. Run Playwright E2E verification
  const e2e = runPlaywrightE2E(request.user_stories || [], request.simulated_findings);

  // 3. Run Lighthouse CI audits
  const defaultScores: LighthouseScores = {
    performance: 94,
    accessibility: 98,
    best_practices: 96,
    seo: 95,
  };

  const finalScores: LighthouseScores = {
    ...defaultScores,
    ...(request.simulated_findings?.custom_lighthouse_scores || {}),
  };

  validateLighthouseScores(finalScores);

  // 4. Generate Gate 3 (STAGE_PREVIEW_APPROVED) Certificate ID
  const gateId = `gate-0003-${crypto.randomUUID()}`;

  return {
    project_id: request.project_id,
    overall_pass: true,
    playwright_pass_rate: e2e.passRate,
    semgrep_critical_findings: security.semgrep,
    trivy_critical_cves: security.trivy,
    gitleaks_secrets_found: security.gitleaks,
    lighthouse_scores: finalScores,
    approval_gate_id: gateId,
  };
}
