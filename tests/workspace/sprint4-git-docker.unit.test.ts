import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyBranchAutomationAction,
  generateGitDockerCliCommands,
  generateProjectComposeYaml,
  generateProjectDockerfile,
  getNextGitStageBranch,
  GIT_STAGE_ORDER,
} from '../../src/lib/git-docker-manager.ts';
import { sanitizeCodeSnippet } from '../../src/lib/code-sanitizer.ts';
import { createDefaultProjectWorkspace } from '../../src/components/workspace/workspaceDefaults.ts';
import type { Project } from '../../src/types';

const SAMPLE_PROJECT: Project = {
  id: 'proj-git-1',
  name: 'Atlas Fleet Portal',
  type: 'SaaS Platform',
  status: 'In Progress',
  healthPercent: 98,
  repoUrl: 'https://github.com/launchup/atlas-fleet',
  branch: 'main',
  framework: 'React 19 + Fastify',
  serverTarget: 'Cloud Run',
  lastBackupDate: 'Just now',
  backupStatus: 'Healthy',
  clientIds: [],
};

describe('Sprint 4: Docker & Git Branch Automation Manager (Unit Tests)', () => {
  it('GIT-01: enforces canonical 4-branch promotion order', () => {
    assert.deepEqual([...GIT_STAGE_ORDER], [
      'feature/dev',
      'feature/testing',
      'feature/uat',
      'feature/production',
    ]);
    assert.equal(getNextGitStageBranch('feature/dev'), 'feature/testing');
    assert.equal(getNextGitStageBranch('feature/testing'), 'feature/uat');
    assert.equal(getNextGitStageBranch('feature/uat'), 'feature/production');
    assert.equal(getNextGitStageBranch('feature/production'), null);
  });

  it('GIT-02: handles commit, rebuild, promote, and rollback transitions on isolated branches', () => {
    const ws = createDefaultProjectWorkspace(SAMPLE_PROJECT, []);

    const committed = applyBranchAutomationAction(
      ws.gitDocker,
      'feature/dev',
      'commit',
      'feat(rls): isolate shipment orders',
      'seed-1'
    );
    const devAfterCommit = committed.branches.find((b) => b.branch === 'feature/dev')!;
    assert.equal(devAfterCommit.status, 'Ahead');
    assert.equal(devAfterCommit.dockerHealth, 'Building');
    assert.equal(devAfterCommit.lastCommitMsg, 'feat(rls): isolate shipment orders');

    const rebuilt = applyBranchAutomationAction(
      committed.branches,
      'feature/dev',
      'rebuild',
      undefined,
      'seed-2'
    );
    assert.equal(rebuilt.branches.find((b) => b.branch === 'feature/dev')?.dockerHealth, 'Healthy');

    const promoted = applyBranchAutomationAction(
      rebuilt.branches,
      'feature/dev',
      'promote',
      undefined,
      'seed-3'
    );
    assert.equal(promoted.targetBranch, 'feature/testing');
    assert.equal(promoted.branches.find((b) => b.branch === 'feature/dev')?.status, 'Synced');
    assert.equal(promoted.branches.find((b) => b.branch === 'feature/testing')?.status, 'Active');
    assert.equal(promoted.branches.find((b) => b.branch === 'feature/testing')?.dockerHealth, 'Healthy');

    const rolledBack = applyBranchAutomationAction(
      promoted.branches,
      'feature/testing',
      'rollback',
      undefined,
      'seed-4'
    );
    assert.equal(rolledBack.branches.find((b) => b.branch === 'feature/testing')?.dockerHealth, 'Standby');
  });

  it('GIT-03: generates multi-container docker-compose YAML free of hardcoded secrets', () => {
    const ws = createDefaultProjectWorkspace(SAMPLE_PROJECT, []);
    const compose = generateProjectComposeYaml(SAMPLE_PROJECT, ws.gitDocker);

    assert.ok(compose.includes('postgres-rls'));
    assert.ok(compose.includes('redis-cache'));
    assert.ok(compose.includes('atlas-fleet-portal-dev'));
    assert.ok(compose.includes('atlas-fleet-portal-testing'));
    assert.ok(compose.includes('atlas-fleet-portal-uat'));
    assert.ok(compose.includes('atlas-fleet-portal-production'));
    assert.ok(compose.includes('TARGET_CLOUD=Cloud Run'));

    const scan = sanitizeCodeSnippet(compose);
    assert.equal(scan.isSafe, true);
    assert.equal(scan.removedItems.length, 0);
  });

  it('GIT-04: generates tailored multi-stage Dockerfile and Git/Docker CLI script', () => {
    const dockerfile = generateProjectDockerfile(SAMPLE_PROJECT);
    assert.ok(dockerfile.includes('FROM node:22-alpine AS builder'));
    assert.ok(dockerfile.includes('FROM node:22-alpine AS runner'));
    assert.ok(dockerfile.includes('USER appuser'));
    assert.ok(dockerfile.includes('HEALTHCHECK'));
    assert.ok(dockerfile.includes('TARGET_CLOUD="Cloud Run"'));

    const cli = generateGitDockerCliCommands(SAMPLE_PROJECT, 'feature/uat');
    assert.ok(cli.includes('feature/uat'));
    assert.ok(cli.includes('docker compose -f docker-compose.staging.yml build atlas-fleet-portal-uat'));
    assert.ok(cli.includes('docker compose -f docker-compose.staging.yml up -d atlas-fleet-portal-uat'));
  });
});
