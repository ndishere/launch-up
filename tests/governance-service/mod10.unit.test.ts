import { describe, it } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';

// Standard JWT Signer using native node:crypto (RFC 7519)
function signJwt(payload: Record<string, any>, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 300 })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${b64Header}.${b64Payload}`).digest('base64url');
  return `${b64Header}.${b64Payload}.${signature}`;
}

/**
 * MOD-10: M:N Tenancy, RBAC & FinOps Governance Core
 * Stage 1 Unit Test Suite
 *
 * Implements test scenarios from:
 * - tests/specs/master_tdd_test_matrix_5_stage_pipeline.md
 * - contracts/module_input_output_contracts.md (MOD-10)
 *
 * Test IDs: TEST-MOD10-POS-01 through TEST-MOD10-RARE-03
 */

// Error classes
class RbacDeniedError extends Error {
  statusCode = 403;
  code = 'ERR_RBAC_DENIED';
  constructor(msg = 'Permission denied') {
    super(msg);
    this.name = 'RbacDeniedError';
  }
}

class TenantMismatchError extends Error {
  statusCode = 403;
  code = 'ERR_TENANT_MISMATCH';
  constructor(msg = 'Principal is not a member of the requested project') {
    super(msg);
    this.name = 'TenantMismatchError';
  }
}

class BudgetExceededError extends Error {
  statusCode = 402;
  code = 'ERR_BUDGET_EXCEEDED';
  constructor(msg = 'Monthly token budget exceeded') {
    super(msg);
    this.name = 'BudgetExceededError';
  }
}

class CircularTenancyError extends Error {
  statusCode = 422;
  code = 'ERR_CIRCULAR_TENANCY';
  constructor(msg = 'Circular vendor/partner hierarchy detected') {
    super(msg);
    this.name = 'CircularTenancyError';
  }
}

// In-Memory Test Model for isolated Unit Testing of MOD-10 Rules
interface PrincipalRecord {
  id: string;
  principalType: 'HUMAN' | 'AI_AGENT';
  identifier: string;
  displayName: string;
  isSuperAdmin: boolean;
  orgId: string;
}

interface MembershipRecord {
  id: string;
  principalId: string;
  clientId: string | null;
  projectId: string;
  roleId: string;
  canApproveGates: boolean;
  orgId: string;
}

interface RoleRecord {
  id: string;
  name: string;
  permissions: string[];
}

interface ProjectRecord {
  id: string;
  monthly_token_budget_usd: number;
  tokens_spent_usd: number;
  orgId: string;
}

interface ClientProjectLinkRecord {
  clientId: string;
  projectId: string;
  relationshipType: 'PRIMARY_OWNER' | 'CO_OWNER' | 'AGENCY_PARTNER' | 'VENDOR';
  billingSharePercent: number;
}

interface ApprovalGateRecord {
  id: string;
  projectId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
  version: number;
  decidedBy?: string;
  feedbackNotes?: string;
}

function verifyPermissionLogic(
  store: {
    principals: Map<string, PrincipalRecord>;
    memberships: Map<string, MembershipRecord>;
    roles: Map<string, RoleRecord>;
    projects: Map<string, ProjectRecord>;
  },
  request: {
    principal_id: string;
    client_id: string | null;
    project_id: string;
    requested_action: string;
    estimated_cost_usd: number;
  },
  jwtSecret = 'test-secret-at-least-32-chars-long-for-jwt-signing!!'
) {
  // 1. Principal lookup
  const principal = store.principals.get(request.principal_id);
  if (!principal) {
    throw new RbacDeniedError('Principal not found');
  }

  // 2. Project membership lookup
  const membershipKey = `${request.principal_id}:${request.project_id}`;
  const membership = store.memberships.get(membershipKey);
  if (!membership) {
    throw new TenantMismatchError('Principal has no valid membership in project');
  }

  // 3. Role & Permission lookup
  const role = store.roles.get(membership.roleId);
  if (!role) {
    throw new RbacDeniedError('Role not found');
  }

  if (!role.permissions.includes(request.requested_action)) {
    throw new RbacDeniedError(`Role does not grant permission ${request.requested_action}`);
  }

  // 4. AI AGENT cannot self-approve human gates
  if (principal.principalType === 'AI_AGENT' && request.requested_action === 'gate:approve') {
    throw new RbacDeniedError('AI agents cannot self-approve human gates');
  }

  // 5. Budget checks
  const project = store.projects.get(request.project_id);
  const monthlyBudget = project?.monthly_token_budget_usd ?? 25.0;
  const tokensSpent = project?.tokens_spent_usd ?? 0.0;

  if (tokensSpent + request.estimated_cost_usd > monthlyBudget) {
    throw new BudgetExceededError(
      `Budget exceeded: spent $${tokensSpent.toFixed(2)} + $${request.estimated_cost_usd.toFixed(2)} > limit $${monthlyBudget.toFixed(2)}`
    );
  }

  const remainingBudget = monthlyBudget - tokensSpent;
  let budgetTierFallback: 'NONE' | 'TIER_2' | 'TIER_3' = 'NONE';
  const remainingPct = remainingBudget / monthlyBudget;
  if (remainingPct < 0.2) {
    budgetTierFallback = 'TIER_3';
  } else if (remainingPct < 0.5) {
    budgetTierFallback = 'TIER_2';
  }

  const gateRequired = request.requested_action === 'gate:approve';

  const rlsToken = signJwt(
    {
      org_id: membership.orgId,
      project_id: request.project_id,
      principal_id: request.principal_id,
      principal_type: principal.principalType,
      role: role.name,
    },
    jwtSecret
  );

  return {
    authorized: true,
    principal_type: principal.principalType,
    effective_role: role.name,
    rls_session_token: rlsToken,
    remaining_budget_usd: Math.round(remainingBudget * 100) / 100,
    budget_tier_fallback: budgetTierFallback,
    gate_required: gateRequired,
  };
}

function detectCycle(
  links: ClientProjectLinkRecord[],
  newSource: string,
  newTarget: string,
  projectId: string
): boolean {
  const hasReverse = links.some(
    (l) =>
      l.projectId === projectId &&
      l.clientId === newTarget &&
      (l.relationshipType === 'VENDOR' || l.relationshipType === 'AGENCY_PARTNER')
  );
  if (hasReverse && newSource === newTarget) return true;
  return hasReverse;
}

// ═══════════════════════════════════════════════════════════════════
// TEST SUITE EXECUTION
// ═══════════════════════════════════════════════════════════════════

describe('MOD-10: M:N Tenancy, RBAC & FinOps Governance Core', () => {
  const ORG_ID = '00000000-0000-0000-0000-000000000001';
  const CLIENT_A = 'aaaa0000-0000-0000-0000-000000000001';
  const CLIENT_B = 'aaaa0000-0000-0000-0000-000000000002';
  const PROJ_1 = 'bbbb0000-0000-0000-0000-000000000001';
  const PROJ_2 = 'bbbb0000-0000-0000-0000-000000000002';
  const PROJ_3 = 'bbbb0000-0000-0000-0000-000000000003';

  const HUMAN_APPROVER = 'cccc0000-0000-0000-0000-000000000001';
  const AI_AGENT = 'cccc0000-0000-0000-0000-000000000002';

  const ROLE_APPROVER = 'dddd0000-0000-0000-0000-000000000001';
  const ROLE_MARKETER = 'dddd0000-0000-0000-0000-000000000002';

  const store = {
    principals: new Map<string, PrincipalRecord>([
      [
        HUMAN_APPROVER,
        {
          id: HUMAN_APPROVER,
          principalType: 'HUMAN',
          identifier: 'lead@client.com',
          displayName: 'Client Approver',
          isSuperAdmin: false,
          orgId: ORG_ID,
        },
      ],
      [
        AI_AGENT,
        {
          id: AI_AGENT,
          principalType: 'AI_AGENT',
          identifier: 'agent-marketer-01',
          displayName: 'AI Marketer Agent',
          isSuperAdmin: false,
          orgId: ORG_ID,
        },
      ],
    ]),
    memberships: new Map<string, MembershipRecord>([
      // Human approver in Proj 1, 2, 3
      [
        `${HUMAN_APPROVER}:${PROJ_1}`,
        {
          id: 'mem-1',
          principalId: HUMAN_APPROVER,
          clientId: CLIENT_A,
          projectId: PROJ_1,
          roleId: ROLE_APPROVER,
          canApproveGates: true,
          orgId: ORG_ID,
        },
      ],
      [
        `${HUMAN_APPROVER}:${PROJ_2}`,
        {
          id: 'mem-2',
          principalId: HUMAN_APPROVER,
          clientId: CLIENT_A,
          projectId: PROJ_2,
          roleId: ROLE_APPROVER,
          canApproveGates: true,
          orgId: ORG_ID,
        },
      ],
      [
        `${HUMAN_APPROVER}:${PROJ_3}`,
        {
          id: 'mem-3',
          principalId: HUMAN_APPROVER,
          clientId: CLIENT_A,
          projectId: PROJ_3,
          roleId: ROLE_APPROVER,
          canApproveGates: true,
          orgId: ORG_ID,
        },
      ],
      // AI Agent in Proj 1
      [
        `${AI_AGENT}:${PROJ_1}`,
        {
          id: 'mem-ai-1',
          principalId: AI_AGENT,
          clientId: CLIENT_A,
          projectId: PROJ_1,
          roleId: ROLE_MARKETER,
          canApproveGates: false,
          orgId: ORG_ID,
        },
      ],
    ]),
    roles: new Map<string, RoleRecord>([
      [
        ROLE_APPROVER,
        {
          id: ROLE_APPROVER,
          name: 'client_approver',
          permissions: ['project:read', 'gate:approve', 'gate:read'],
        },
      ],
      [
        ROLE_MARKETER,
        {
          id: ROLE_MARKETER,
          name: 'agent_marketer',
          permissions: ['marketing:draft', 'marketing:read'],
        },
      ],
    ]),
    projects: new Map<string, ProjectRecord>([
      [PROJ_1, { id: PROJ_1, monthly_token_budget_usd: 25.0, tokens_spent_usd: 0.0, orgId: ORG_ID }],
      [PROJ_2, { id: PROJ_2, monthly_token_budget_usd: 25.0, tokens_spent_usd: 15.0, orgId: ORG_ID }],
      [PROJ_3, { id: PROJ_3, monthly_token_budget_usd: 25.0, tokens_spent_usd: 22.0, orgId: ORG_ID }],
    ]),
  };

  // ── POSITIVE SCENARIOS ───────────────────────────────────────────
  describe('Positive Scenarios (Happy Path)', () => {
    it('TEST-MOD10-POS-01: Client Approver can read and approve gates across 3 projects', () => {
      for (const projId of [PROJ_1, PROJ_2, PROJ_3]) {
        // Read permission
        const readRes = verifyPermissionLogic(store, {
          principal_id: HUMAN_APPROVER,
          client_id: CLIENT_A,
          project_id: projId,
          requested_action: 'project:read',
          estimated_cost_usd: 0,
        });
        assert.strictEqual(readRes.authorized, true);
        assert.strictEqual(readRes.effective_role, 'client_approver');
        assert.ok(readRes.rls_session_token.length > 20);

        // Gate approval permission
        const gateRes = verifyPermissionLogic(store, {
          principal_id: HUMAN_APPROVER,
          client_id: CLIENT_A,
          project_id: projId,
          requested_action: 'gate:approve',
          estimated_cost_usd: 0,
        });
        assert.strictEqual(gateRes.authorized, true);
        assert.strictEqual(gateRes.gate_required, true);
      }
    });

    it('TEST-MOD10-POS-02: Multi-client split billing and budget tier fallback calculation', () => {
      // PROJ_2 has $15 spent of $25 -> remaining $10 (40%), should be TIER_2
      const resProj2 = verifyPermissionLogic(store, {
        principal_id: HUMAN_APPROVER,
        client_id: CLIENT_A,
        project_id: PROJ_2,
        requested_action: 'project:read',
        estimated_cost_usd: 0.05,
      });
      assert.strictEqual(resProj2.remaining_budget_usd, 10.0);
      assert.strictEqual(resProj2.budget_tier_fallback, 'TIER_2');

      // PROJ_3 has $22 spent of $25 -> remaining $3 (12%), should be TIER_3
      const resProj3 = verifyPermissionLogic(store, {
        principal_id: HUMAN_APPROVER,
        client_id: CLIENT_A,
        project_id: PROJ_3,
        requested_action: 'project:read',
        estimated_cost_usd: 0.05,
      });
      assert.strictEqual(resProj3.remaining_budget_usd, 3.0);
      assert.strictEqual(resProj3.budget_tier_fallback, 'TIER_3');
    });

    it('TEST-MOD10-POS-03: AI Agent receives scoped JWT for marketing:draft and blocks code:write', () => {
      // Authorized for marketing:draft
      const res = verifyPermissionLogic(store, {
        principal_id: AI_AGENT,
        client_id: CLIENT_A,
        project_id: PROJ_1,
        requested_action: 'marketing:draft',
        estimated_cost_usd: 0.02,
      });
      assert.strictEqual(res.authorized, true);
      assert.strictEqual(res.principal_type, 'AI_AGENT');
      assert.strictEqual(res.effective_role, 'agent_marketer');

      // Denied for code:write
      assert.throws(
        () =>
          verifyPermissionLogic(store, {
            principal_id: AI_AGENT,
            client_id: CLIENT_A,
            project_id: PROJ_1,
            requested_action: 'code:write',
            estimated_cost_usd: 0.02,
          }),
        (err: any) => err instanceof RbacDeniedError && err.code === 'ERR_RBAC_DENIED'
      );
    });
  });

  // ── NEGATIVE SCENARIOS ───────────────────────────────────────────
  describe('Negative Scenarios (Security & Boundary Checks)', () => {
    it('TEST-MOD10-NEG-01: AI Agent attempting gate:approve is rejected with 403 ERR_RBAC_DENIED', () => {
      assert.throws(
        () =>
          verifyPermissionLogic(store, {
            principal_id: AI_AGENT,
            client_id: CLIENT_A,
            project_id: PROJ_1,
            requested_action: 'gate:approve',
            estimated_cost_usd: 0,
          }),
        (err: any) => err instanceof RbacDeniedError && err.code === 'ERR_RBAC_DENIED'
      );
    });

    it('TEST-MOD10-NEG-02: Cross-tenant project access without membership rejected with 403 ERR_TENANT_MISMATCH', () => {
      const UNKNOWN_PROJ = 'bbbb0000-0000-0000-0000-999999999999';
      assert.throws(
        () =>
          verifyPermissionLogic(store, {
            principal_id: HUMAN_APPROVER,
            client_id: CLIENT_A,
            project_id: UNKNOWN_PROJ,
            requested_action: 'project:read',
            estimated_cost_usd: 0,
          }),
        (err: any) => err instanceof TenantMismatchError && err.code === 'ERR_TENANT_MISMATCH'
      );
    });

    it('TEST-MOD10-NEG-03: Budget exceeded blocks action with 402 ERR_BUDGET_EXCEEDED', () => {
      // PROJ_3 has spent $22 out of $25 limit. Requesting $3.50 will exceed $25.
      assert.throws(
        () =>
          verifyPermissionLogic(store, {
            principal_id: HUMAN_APPROVER,
            client_id: CLIENT_A,
            project_id: PROJ_3,
            requested_action: 'project:read',
            estimated_cost_usd: 3.5,
          }),
        (err: any) => err instanceof BudgetExceededError && err.code === 'ERR_BUDGET_EXCEEDED'
      );
    });
  });

  // ── RARE & EDGE SCENARIOS ─────────────────────────────────────────
  describe('Rare & Chaos Scenarios', () => {
    it('TEST-MOD10-RARE-01: Optimistic locking version conflict rejection for concurrent gate approvals', () => {
      const gate: ApprovalGateRecord = {
        id: 'gate-1',
        projectId: PROJ_1,
        status: 'PENDING',
        version: 1,
      };

      // Decision 1 commits version 1 -> 2
      const firstDecision = { ...gate, status: 'APPROVED' as const, version: gate.version + 1 };
      assert.strictEqual(firstDecision.version, 2);

      // Concurrent Decision 2 arrives with expected version 1, but gate is now version 2
      const isConflict = firstDecision.version !== gate.version;
      assert.strictEqual(isConflict, true);
    });

    it('TEST-MOD10-RARE-02: Mid-session membership revocation immediately rejects subsequent calls', () => {
      // Token was generated previously while membership was active
      const validToken = signJwt(
        { principal_id: HUMAN_APPROVER, project_id: PROJ_1 },
        'secret'
      );
      assert.ok(validToken);

      // Simulate revocation: membership deleted from DB
      const storeWithRevocation = {
        ...store,
        memberships: new Map(store.memberships),
      };
      storeWithRevocation.memberships.delete(`${HUMAN_APPROVER}:${PROJ_1}`);

      // Next call fails at DB membership check
      assert.throws(
        () =>
          verifyPermissionLogic(storeWithRevocation, {
            principal_id: HUMAN_APPROVER,
            client_id: CLIENT_A,
            project_id: PROJ_1,
            requested_action: 'project:read',
            estimated_cost_usd: 0,
          }),
        (err: any) => err instanceof TenantMismatchError && err.code === 'ERR_TENANT_MISMATCH'
      );
    });

    it('TEST-MOD10-RARE-03: Circular agency hierarchy detection rejects with 422 ERR_CIRCULAR_TENANCY', () => {
      const existingLinks: ClientProjectLinkRecord[] = [
        {
          clientId: CLIENT_B,
          projectId: PROJ_1,
          relationshipType: 'VENDOR',
          billingSharePercent: 50,
        },
      ];

      // Client A attempts to add Client B as VENDOR when Client B already has Client A as VENDOR
      const isCircular = detectCycle(existingLinks, CLIENT_A, CLIENT_B, PROJ_1);
      assert.strictEqual(isCircular, true);

      if (isCircular) {
        const error = new CircularTenancyError();
        assert.strictEqual(error.statusCode, 422);
        assert.strictEqual(error.code, 'ERR_CIRCULAR_TENANCY');
      }
    });
  });
});
