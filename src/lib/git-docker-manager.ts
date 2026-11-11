import type {
  GitStageBranchName,
  Project,
  ProjectGitBranchNode,
} from '../types';

export const GIT_STAGE_ORDER: readonly GitStageBranchName[] = [
  'feature/dev',
  'feature/testing',
  'feature/uat',
  'feature/production',
];

export type GitDockerActionType = 'promote' | 'commit' | 'rebuild' | 'rollback';

export interface GitDockerTransitionResult {
  branches: ProjectGitBranchNode[];
  targetBranch: GitStageBranchName;
  sha: string;
  logMessage: string;
}

function slugifyProjectName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'launchup-app';
}

function generateDeterministicSha(seed: string): string {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(7, '0').slice(0, 7);
}

/**
 * Computes the next isolated branch in the canonical 4-stage pipeline, or null for production.
 */
export function getNextGitStageBranch(branch: GitStageBranchName): GitStageBranchName | null {
  const idx = GIT_STAGE_ORDER.indexOf(branch);
  if (idx === -1 || idx >= GIT_STAGE_ORDER.length - 1) return null;
  return GIT_STAGE_ORDER[idx + 1];
}

/**
 * Applies an interactive Git branch or Docker container lifecycle action and returns
 * the updated branch nodes alongside an audit log summary.
 */
export function applyBranchAutomationAction(
  branches: ProjectGitBranchNode[],
  branch: GitStageBranchName,
  action: GitDockerActionType,
  customMessage?: string,
  entropySeed = Date.now().toString(16)
): GitDockerTransitionResult {
  const sha = generateDeterministicSha(`${branch}-${action}-${entropySeed}`);

  if (action === 'promote') {
    const nextBranch = getNextGitStageBranch(branch);
    if (!nextBranch) {
      return {
        branches,
        targetBranch: branch,
        sha,
        logMessage: `Branch ${branch} is already at the terminal production stage.`,
      };
    }

    const updated = branches.map((node) => {
      if (node.branch === branch) {
        return {
          ...node,
          status: 'Synced' as const,
          dockerHealth: 'Healthy' as const,
        };
      }
      if (node.branch === nextBranch) {
        return {
          ...node,
          status: 'Active' as const,
          lastCommitSha: sha,
          lastCommitMsg:
            customMessage?.trim() || `merge(${nextBranch}): promoted verified build from ${branch}`,
          dockerHealth: 'Healthy' as const,
          replicas: nextBranch === 'feature/production' ? '3/3 Live' : '2/2 Healthy',
        };
      }
      return node;
    });

    return {
      branches: updated,
      targetBranch: nextBranch,
      sha,
      logMessage: `Promoted isolated Git branch ${branch} → ${nextBranch} (${sha}). Containers healthy.`,
    };
  }

  if (action === 'commit') {
    const commitMsg =
      customMessage?.trim() || `feat(${branch.replace('feature/', '')}): sync agent delta`;
    const updated = branches.map((node) =>
      node.branch === branch
        ? {
            ...node,
            status: 'Ahead' as const,
            lastCommitSha: sha,
            lastCommitMsg: commitMsg,
            dockerHealth: 'Building' as const,
          }
        : node
    );

    return {
      branches: updated,
      targetBranch: branch,
      sha,
      logMessage: `Committed "${commitMsg}" on isolated branch ${branch} (${sha}); queued container rebuild.`,
    };
  }

  if (action === 'rebuild') {
    const updated = branches.map((node) =>
      node.branch === branch
        ? {
            ...node,
            status: node.status === 'Pending' ? ('Active' as const) : node.status,
            dockerHealth: 'Healthy' as const,
            replicas: node.branch === 'feature/production' ? '3/3 Live' : '2/2 Healthy',
          }
        : node
    );

    return {
      branches: updated,
      targetBranch: branch,
      sha,
      logMessage: `Rebuilt & health-verified Docker container for ${branch} (${sha}).`,
    };
  }

  // action === 'rollback'
  const updated = branches.map((node) =>
    node.branch === branch
      ? {
          ...node,
          status: branch === 'feature/dev' ? ('Active' as const) : ('Synced' as const),
          lastCommitSha: sha,
          lastCommitMsg: customMessage?.trim() || `revert(${branch}): restored last healthy image`,
          dockerHealth: branch === 'feature/dev' ? ('Healthy' as const) : ('Standby' as const),
          replicas: branch === 'feature/production' ? '1/3 Standby' : '1/1 Standby',
        }
      : node
  );

  return {
    branches: updated,
    targetBranch: branch,
    sha,
    logMessage: `Rolled back ${branch} (${sha}) to last verified immutable snapshot.`,
  };
}

/**
 * Generates a hardened multi-stage Dockerfile tailored to the project's framework and runtime.
 */
export function generateProjectDockerfile(project: Project): string {
  const slug = slugifyProjectName(project.name);
  const isMobileApi = project.type === 'Mobile App API';
  const runtimeLabel = isMobileApi ? 'Fastify API & Mobile Gateway' : project.framework || 'React 19 + Fastify';

  return `# Multi-Stage Container Image · ${project.name} (${runtimeLabel})
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV LAUNCHUP_PROJECT=${slug}
ENV TARGET_CLOUD="${project.serverTarget}"
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts
USER appuser
EXPOSE 3000 8004
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]`;
}

/**
 * Generates an environment-safe multi-container Docker Compose specification across all
 * 4 Git stage branches plus PostgreSQL 16 RLS and Redis.
 */
export function generateProjectComposeYaml(
  project: Project,
  branches: ProjectGitBranchNode[]
): string {
  const slug = slugifyProjectName(project.name);
  const branchEntries = branches
    .map((node) => {
      const stageKey = node.branch.replace('feature/', '');
      const serviceName = `${slug}-${stageKey}`;
      return `  ${serviceName}:
    build:
      context: .
      dockerfile: Dockerfile
    image: launchup/${slug}:${node.lastCommitSha}
    container_name: ${node.containerService}-${slug}
    ports:
      - "${node.containerPort}:${node.containerPort}"
    environment:
      - GIT_BRANCH=${node.branch}
      - TARGET_CLOUD=${project.serverTarget}
      - DATABASE_URL=\${DATABASE_URL}
      - REDIS_URL=\${REDIS_URL}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://127.0.0.1:${node.containerPort}/health"]
      interval: 20s
      timeout: 5s
      retries: 3
    depends_on:
      postgres-rls:
        condition: service_healthy`;
    })
    .join('\n\n');

  return `name: ${slug}-mesh
services:
  postgres-rls:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=launchup_${slug.replace(/-/g, '_')}
      - POSTGRES_USER=\${POSTGRES_USER}
      - POSTGRES_PASSWORD=\${POSTGRES_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER:-postgres}"]
      interval: 10s
      retries: 5

  redis-cache:
    image: redis:7-alpine
    command: ["redis-server", "--appendonly", "yes"]

${branchEntries}`;
}

/**
 * Builds copyable Git & Docker CLI commands for the selected isolated branch.
 */
export function generateGitDockerCliCommands(
  project: Project,
  branch: GitStageBranchName
): string {
  const slug = slugifyProjectName(project.name);
  const stageKey = branch.replace('feature/', '');

  return `# Isolated Branch Checkout & Container Staging (${branch})
git fetch origin ${branch} || git checkout -b ${branch}
git status -sb

# Build & Healthcheck Isolated Stage Container
docker compose -f docker-compose.staging.yml build ${slug}-${stageKey}
docker compose -f docker-compose.staging.yml up -d ${slug}-${stageKey}
docker compose -f docker-compose.staging.yml ps ${slug}-${stageKey}`;
}
