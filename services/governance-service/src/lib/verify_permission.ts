import { eq, and, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { principals, projectMemberships } from '../models/schema.js';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../models/schema.js';

// ── Contracts ─────────────────────────────────────────
export interface Mod10AuthRequest {
  principal_id: string;
  client_id: string | null;
  project_id: string;
  requested_action: string; // 'project:read' | 'code:write' | 'gate:approve' | 'marketing:draft'
  estimated_cost_usd: number;
}

export interface Mod10AuthResponse {
  authorized: boolean;
  principal_type: 'HUMAN' | 'AI_AGENT';
  effective_role: string;
  rls_session_token: string;
  remaining_budget_usd: number;
  budget_tier_fallback: 'NONE' | 'TIER_2' | 'TIER_3';
  gate_required: boolean;
}

// ── Error Classes ─────────────────────────────────────
export class RbacDeniedError extends Error {
  public readonly statusCode = 403;
  public readonly code = 'ERR_RBAC_DENIED';
  constructor(message = 'Permission denied') {
    super(message);
    this.name = 'RbacDeniedError';
  }
}

export class TenantMismatchError extends Error {
  public readonly statusCode = 403;
  public readonly code = 'ERR_TENANT_MISMATCH';
  constructor(message = 'Principal is not a member of the requested project') {
    super(message);
    this.name = 'TenantMismatchError';
  }
}

export class BudgetExceededError extends Error {
  public readonly statusCode = 402;
  public readonly code = 'ERR_BUDGET_EXCEEDED';
  constructor(message = 'Monthly token budget exceeded') {
    super(message);
    this.name = 'BudgetExceededError';
  }
}

export class CircularTenancyError extends Error {
  public readonly statusCode = 422;
  public readonly code = 'ERR_CIRCULAR_TENANCY';
  constructor(message = 'Circular vendor/partner tenancy detected') {
    super(message);
    this.name = 'CircularTenancyError';
  }
}

// ── Gate Stages ───────────────────────────────────────
const GATE_STAGES = new Set([
  'OUTREACH_PITCH',
  'REQUIREMENTS_PRD',
  'PRODUCTION_DEPLOY',
  'MARKETING_PUBLISH',
  'HOTFIX_MERGE',
]);

// ── Core Authorization Function ──────────────────────
export async function verifyPrincipalPermission(
  db: NodePgDatabase<typeof schema>,
  request: Mod10AuthRequest,
): Promise<Mod10AuthResponse> {
  // 1. Look up principal by id
  const [principal] = await db
    .select()
    .from(principals)
    .where(eq(principals.id, request.principal_id))
    .limit(1);

  if (!principal) {
    throw new RbacDeniedError('Principal not found');
  }

  // 2. Check project membership for (principal_id, project_id)
  const [membership] = await db
    .select()
    .from(projectMemberships)
    .where(
      and(
        eq(projectMemberships.principalId, request.principal_id),
        eq(projectMemberships.projectId, request.project_id),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new TenantMismatchError();
  }

  // 3. Load role + permissions from auth.roles and auth.role_permissions via raw SQL
  //    (cross-service tables not modelled in this service's Drizzle schema)
  const roleResult = await db.execute(
    sql`SELECT r.name AS role_name, r.display_name,
               array_agg(p.resource || ':' || p.action) AS permissions
        FROM auth.roles r
        LEFT JOIN auth.role_permissions rp ON rp.role_id = r.id
        LEFT JOIN auth.permissions p ON p.id = rp.permission_id
        WHERE r.id = ${membership.roleId}
        GROUP BY r.id, r.name, r.display_name`,
  );

  const roleRow = (roleResult as any).rows?.[0] ?? (roleResult as any)[0];
  if (!roleRow) {
    throw new RbacDeniedError('Role not found');
  }

  const roleName: string = roleRow.role_name;
  const permissionsList: string[] = roleRow.permissions?.filter(Boolean) ?? [];

  // 4. Check if requested_action is in the role's permissions
  if (!permissionsList.includes(request.requested_action)) {
    throw new RbacDeniedError(
      `Role '${roleName}' does not grant permission '${request.requested_action}'`,
    );
  }

  // 5. SPECIAL RULE: AI agents cannot self-approve human gates
  if (
    principal.principalType === 'AI_AGENT' &&
    request.requested_action === 'gate:approve'
  ) {
    throw new RbacDeniedError('AI agents cannot approve human gates');
  }

  // 6. Load project budget (cross-service query via raw SQL)
  const budgetResult = await db.execute(
    sql`SELECT monthly_token_budget_usd, tokens_spent_usd
        FROM projects.projects
        WHERE id = ${request.project_id}`,
  );

  const budgetRow = (budgetResult as any).rows?.[0] ?? (budgetResult as any)[0];
  const monthlyBudget = budgetRow ? Number(budgetRow.monthly_token_budget_usd) : 0;
  const tokensSpent = budgetRow ? Number(budgetRow.tokens_spent_usd) : 0;

  if (monthlyBudget > 0 && tokensSpent + request.estimated_cost_usd > monthlyBudget) {
    throw new BudgetExceededError(
      `Budget exceeded: spent $${tokensSpent.toFixed(2)} + requested $${request.estimated_cost_usd.toFixed(2)} > limit $${monthlyBudget.toFixed(2)}`,
    );
  }

  // 7. Compute budget_tier_fallback
  const remainingBudget = monthlyBudget > 0 ? monthlyBudget - tokensSpent : 0;
  let budgetTierFallback: 'NONE' | 'TIER_2' | 'TIER_3' = 'NONE';
  if (monthlyBudget > 0) {
    const remainingPct = remainingBudget / monthlyBudget;
    if (remainingPct < 0.2) {
      budgetTierFallback = 'TIER_3';
    } else if (remainingPct < 0.5) {
      budgetTierFallback = 'TIER_2';
    }
  }

  // 8. Determine gate_required
  const gateRequired =
    request.requested_action === 'gate:approve' ||
    GATE_STAGES.has(request.requested_action);

  // 9. Sign scoped JWT (rls_session_token)
  const rlsSessionToken = jwt.sign(
    {
      org_id: membership.orgId,
      project_id: request.project_id,
      principal_id: request.principal_id,
      principal_type: principal.principalType,
      role: roleName,
    },
    config.JWT_SECRET,
    { expiresIn: '5m' },
  );

  return {
    authorized: true,
    principal_type: principal.principalType as 'HUMAN' | 'AI_AGENT',
    effective_role: roleName,
    rls_session_token: rlsSessionToken,
    remaining_budget_usd: remainingBudget,
    budget_tier_fallback: budgetTierFallback,
    gate_required: gateRequired,
  };
}
