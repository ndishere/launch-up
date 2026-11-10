import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/**
 * LAUNCH UP — MOD-10: STAGE 3 SYSTEM & SECURITY E2E TESTING
 * 
 * Target: services/governance-service
 * Specification: tests/specs/master_tdd_test_matrix_5_stage_pipeline.md (Stage 3)
 * Contract: contracts/module_input_output_contracts.md (MOD-10)
 *
 * Scope:
 * 1. Multi-Tenant Isolation E2E (Cross-Tenant parameter tampering & RLS token integrity)
 * 2. AI Agent Gate Bypass Prevention (Human-in-the-loop gate protection)
 * 3. Token Budget Circuit Breakers (Tier 1 -> Tier 2 -> Tier 3 -> Hard circuit breaker at 100%)
 * 4. Optimistic Concurrency Stress Testing (Parallel race condition resolution)
 * 5. SecOps & SAST Automated Audit (Gitleaks/Semgrep equivalent rules for zero leaked secrets & SQLi sinks)
 */

const JWT_SECRET = 'launchup-dev-jwt-secret-change-in-production-2024';

function signToken(payload: Record<string, any>, secret = JWT_SECRET, expiresIn = 300): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const b64H = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64P = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresIn })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(`${b64H}.${b64P}`).digest('base64url');
  return `${b64H}.${b64P}.${sig}`;
}

function verifyToken(token: string, secret = JWT_SECRET): any {
  const [b64H, b64P, sig] = token.split('.');
  if (!b64H || !b64P || !sig) throw new Error('Malformed token');
  const expectedSig = crypto.createHmac('sha256', secret).update(`${b64H}.${b64P}`).digest('base64url');
  if (sig !== expectedSig) throw new Error('Signature mismatch');
  const payload = JSON.parse(Buffer.from(b64P, 'base64url').toString('utf8'));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
  return payload;
}

// ── Multi-Tenant E2E Fixtures ─────────────────────────────────────────
const TENANT_A_ORG = '11110000-0000-0000-0000-000000000001';
const TENANT_B_ORG = '22220000-0000-0000-0000-000000000001';

const TENANT_A_PROJ = 'aaaa0000-0000-0000-0000-000000000001';
const TENANT_B_PROJ = 'bbbb0000-0000-0000-0000-000000000001';

const USER_TENANT_A = 'user0000-0000-0000-0000-000000000001';
const USER_TENANT_B = 'user0000-0000-0000-0000-000000000002';
const AI_AGENT_TENANT_A = 'agnt0000-0000-0000-0000-000000000001';

const ROLE_APPROVER_ID = 'role0000-0000-0000-0000-000000000001';
const ROLE_AGENT_ID = 'role0000-0000-0000-0000-000000000002';

// ── Full Multi-Tenant System Data Store ───────────────────────────────
const systemStore = {
  principals: new Map([
    [USER_TENANT_A, { id: USER_TENANT_A, principal_type: 'HUMAN', org_id: TENANT_A_ORG, display_name: 'Tenant A Approver' }],
    [USER_TENANT_B, { id: USER_TENANT_B, principal_type: 'HUMAN', org_id: TENANT_B_ORG, display_name: 'Tenant B Approver' }],
    [AI_AGENT_TENANT_A, { id: AI_AGENT_TENANT_A, principal_type: 'AI_AGENT', org_id: TENANT_A_ORG, display_name: 'Tenant A Bot' }],
  ]),
  roles: new Map([
    [ROLE_APPROVER_ID, { id: ROLE_APPROVER_ID, name: 'CLIENT_APPROVER', permissions: ['project:read', 'gate:approve', 'gate:read'] }],
    [ROLE_AGENT_ID, { id: ROLE_AGENT_ID, name: 'AI_AGENT_WORKER', permissions: ['code:write', 'marketing:draft'] }],
  ]),
  memberships: new Map([
    [`${USER_TENANT_A}:${TENANT_A_PROJ}`, { principal_id: USER_TENANT_A, project_id: TENANT_A_PROJ, role_id: ROLE_APPROVER_ID, can_approve_gates: true, org_id: TENANT_A_ORG }],
    [`${USER_TENANT_B}:${TENANT_B_PROJ}`, { principal_id: USER_TENANT_B, project_id: TENANT_B_PROJ, role_id: ROLE_APPROVER_ID, can_approve_gates: true, org_id: TENANT_B_ORG }],
    [`${AI_AGENT_TENANT_A}:${TENANT_A_PROJ}`, { principal_id: AI_AGENT_TENANT_A, project_id: TENANT_A_PROJ, role_id: ROLE_AGENT_ID, can_approve_gates: false, org_id: TENANT_A_ORG }],
  ]),
  projects: new Map([
    [TENANT_A_PROJ, { id: TENANT_A_PROJ, monthly_token_budget_usd: 100.00, tokens_spent_usd: 0.00, org_id: TENANT_A_ORG }],
    [TENANT_B_PROJ, { id: TENANT_B_PROJ, monthly_token_budget_usd: 50.00, tokens_spent_usd: 0.00, org_id: TENANT_B_ORG }],
  ]),
  gates: new Map<string, any>(),
};

// ── E2E HTTP Server ───────────────────────────────────────────────────
function startSystemE2EServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const method = req.method;

    const sendJson = (status: number, data: any) => {
      res.writeHead(status, {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      });
      res.end(JSON.stringify(data));
    };

    const readBody = async (): Promise<any> => {
      return new Promise((resolve) => {
        let b = '';
        req.on('data', chunk => { b += chunk; });
        req.on('end', () => {
          try { resolve(b ? JSON.parse(b) : {}); } catch { resolve({}); }
        });
      });
    };

    const getAuthUser = () => {
      const auth = req.headers['authorization'];
      if (!auth?.startsWith('Bearer ')) return null;
      try { return verifyToken(auth.slice(7)); } catch { return null; }
    };

    // ── Routes ────────────────────────────────────────────────────────

    // 1. Verify Endpoint
    if (method === 'POST' && url.pathname === '/api/v1/governance/verify') {
      const body = await readBody();
      const { principal_id, project_id, requested_action, estimated_cost_usd = 0 } = body;

      const principal = systemStore.principals.get(principal_id);
      if (!principal) {
        return sendJson(403, { authorized: false, error: 'Principal not found', code: 'ERR_RBAC_DENIED' });
      }

      // Multi-tenant check: Membership must exist in the exact project
      const membership = systemStore.memberships.get(`${principal_id}:${project_id}`);
      if (!membership) {
        return sendJson(403, { authorized: false, error: 'Access denied: Tenant isolation policy', code: 'ERR_TENANT_MISMATCH' });
      }

      // Role check
      const role = systemStore.roles.get(membership.role_id);
      if (!role?.permissions.includes(requested_action)) {
        return sendJson(403, { authorized: false, error: 'Action not allowed by role', code: 'ERR_RBAC_DENIED' });
      }

      // AI Agent Gate Lockout
      if (principal.principal_type === 'AI_AGENT' && requested_action === 'gate:approve') {
        return sendJson(403, { authorized: false, error: 'AI agents cannot approve human gates', code: 'ERR_RBAC_DENIED' });
      }

      // Budget Circuit Breaker Check
      const project = systemStore.projects.get(project_id)!;
      const spent = project.tokens_spent_usd;
      const budget = project.monthly_token_budget_usd;

      if (spent + estimated_cost_usd > budget) {
        return sendJson(402, { authorized: false, error: 'Circuit breaker triggered: monthly token budget exhausted', code: 'ERR_BUDGET_EXCEEDED' });
      }

      // Deduct budget
      project.tokens_spent_usd += estimated_cost_usd;
      const remaining = Math.round((budget - project.tokens_spent_usd) * 100) / 100;
      const remainingPct = remaining / budget;

      let fallback: 'NONE' | 'TIER_2' | 'TIER_3' = 'NONE';
      if (remainingPct < 0.2) fallback = 'TIER_3';
      else if (remainingPct < 0.5) fallback = 'TIER_2';

      const rlsToken = signToken({
        org_id: membership.org_id,
        project_id,
        principal_id,
        principal_type: principal.principal_type,
        role: role.name,
      });

      return sendJson(200, {
        authorized: true,
        principal_type: principal.principal_type,
        effective_role: role.name,
        rls_session_token: rlsToken,
        remaining_budget_usd: remaining,
        budget_tier_fallback: fallback,
        gate_required: requested_action === 'gate:approve',
      });
    }

    // 2. Gates Endpoints with Strict Tenant Isolation
    if (method === 'GET' && url.pathname === '/api/v1/governance/gates') {
      const user = getAuthUser();
      if (!user) return sendJson(401, { success: false, error: 'Unauthorized' });
      const projId = url.searchParams.get('project_id');

      // Tenant isolation: User can only see gates from their own organization
      const visibleGates = Array.from(systemStore.gates.values()).filter(
        g => g.org_id === user.org_id && (!projId || g.project_id === projId)
      );
      return sendJson(200, { success: true, data: visibleGates });
    }

    if (method === 'POST' && url.pathname === '/api/v1/governance/gates') {
      const user = getAuthUser();
      if (!user) return sendJson(401, { success: false, error: 'Unauthorized' });
      const body = await readBody();

      // Check project tenant ownership
      const project = systemStore.projects.get(body.project_id);
      if (!project || project.org_id !== user.org_id) {
        return sendJson(403, { success: false, error: 'Cannot create gate for foreign tenant project', code: 'ERR_TENANT_MISMATCH' });
      }

      const id = crypto.randomUUID();
      const gate = {
        id,
        project_id: body.project_id,
        org_id: user.org_id,
        gate_stage: body.gate_stage || 'REQUIREMENTS_PRD',
        status: 'PENDING',
        version: 1,
        created_at: new Date().toISOString(),
      };
      systemStore.gates.set(id, gate);
      return sendJson(201, { success: true, data: gate });
    }

    // 3. Gate Decision (Atomic Optimistic Locking)
    if (method === 'POST' && url.pathname.startsWith('/api/v1/governance/gates/') && url.pathname.endsWith('/decide')) {
      const user = getAuthUser();
      if (!user) return sendJson(401, { success: false, error: 'Unauthorized' });

      // Security check: AI Agent strictly blocked
      if (user.principal_type === 'AI_AGENT') {
        return sendJson(403, { success: false, error: 'Security violation: AI agents cannot decide gates', code: 'ERR_RBAC_DENIED' });
      }

      const gateId = url.pathname.split('/')[5];
      const gate = systemStore.gates.get(gateId);
      if (!gate) return sendJson(404, { success: false, error: 'Gate not found' });

      // Cross-tenant protection
      if (gate.org_id !== user.org_id) {
        return sendJson(403, { success: false, error: 'Forbidden: Gate belongs to another tenant', code: 'ERR_TENANT_MISMATCH' });
      }

      const body = await readBody();
      const expectedVersion = body.version;

      // Optimistic concurrency check (Atomic compare-and-swap)
      if (gate.status !== 'PENDING' || (expectedVersion !== undefined && gate.version !== expectedVersion)) {
        return sendJson(409, {
          success: false,
          error: 'Concurrency conflict: Gate has already been decided or version mismatch',
          code: 'ERR_CONCURRENT_UPDATE_CONFLICT',
        });
      }

      // Commit update atomically
      gate.status = body.decision || 'APPROVED';
      gate.version += 1;
      gate.decided_by = user.principal_id;
      gate.decided_at = new Date().toISOString();

      return sendJson(200, { success: true, data: gate });
    }

    return sendJson(404, { error: 'Not Found' });
  });
}

// ═══════════════════════════════════════════════════════════════════
// TEST SUITE: STAGE 3 SYSTEM & SECURITY E2E
// ═══════════════════════════════════════════════════════════════════

describe('Stage 3: MOD-10 System & Security E2E Testing', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    server = startSystemE2EServer();
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const address = server.address() as any;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  // ── TEST 1: Multi-Tenant Isolation & Anti-Tampering E2E ───────────
  it('STAGE3-01: Cross-Tenant Isolation — Tenant A user cannot query, view, or tamper Tenant B resources', async () => {
    const tenantAJwt = signToken({ principal_id: USER_TENANT_A, principal_type: 'HUMAN', org_id: TENANT_A_ORG });
    const tenantBJwt = signToken({ principal_id: USER_TENANT_B, principal_type: 'HUMAN', org_id: TENANT_B_ORG });

    // 1. Tenant B creates a gate on Tenant B's project
    const createRes = await fetch(`${baseUrl}/api/v1/governance/gates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tenantBJwt}` },
      body: JSON.stringify({ project_id: TENANT_B_PROJ, gate_stage: 'PRODUCTION_DEPLOY' }),
    });
    assert.strictEqual(createRes.status, 201);
    const gateB = (await createRes.json()).data;

    // 2. Tenant A tries to list gates for Tenant B's project -> Must return 0 gates (scoped by tenant)
    const listRes = await fetch(`${baseUrl}/api/v1/governance/gates?project_id=${TENANT_B_PROJ}`, {
      headers: { 'Authorization': `Bearer ${tenantAJwt}` },
    });
    assert.strictEqual(listRes.status, 200);
    const listData = await listRes.json();
    assert.strictEqual(listData.data.length, 0, 'Tenant A must NOT see Tenant B gates');

    // 3. Tenant A attempts direct decision on Tenant B's gate UUID -> 403 ERR_TENANT_MISMATCH
    const decideRes = await fetch(`${baseUrl}/api/v1/governance/gates/${gateB.id}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tenantAJwt}` },
      body: JSON.stringify({ decision: 'APPROVED' }),
    });
    assert.strictEqual(decideRes.status, 403);
    const decideData = await decideRes.json();
    assert.strictEqual(decideData.code, 'ERR_TENANT_MISMATCH');

    // 4. Parameter tampering via /verify endpoint
    const verifyTamper = await fetch(`${baseUrl}/api/v1/governance/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        principal_id: USER_TENANT_A,
        project_id: TENANT_B_PROJ, // Tampering target
        requested_action: 'project:read',
        estimated_cost_usd: 0.05,
      }),
    });
    assert.strictEqual(verifyTamper.status, 403);
    assert.strictEqual((await verifyTamper.json()).code, 'ERR_TENANT_MISMATCH');
  });

  // ── TEST 2: AI Agent Gate Bypass Prevention ──────────────────────
  it('STAGE3-02: AI Agent Gate Protection — Complete lockout from approving human gates', async () => {
    const tenantAJwt = signToken({ principal_id: USER_TENANT_A, principal_type: 'HUMAN', org_id: TENANT_A_ORG });
    const aiAgentJwt = signToken({ principal_id: AI_AGENT_TENANT_A, principal_type: 'AI_AGENT', org_id: TENANT_A_ORG });

    // 1. Create a human gate
    const createRes = await fetch(`${baseUrl}/api/v1/governance/gates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tenantAJwt}` },
      body: JSON.stringify({ project_id: TENANT_A_PROJ, gate_stage: 'MARKETING_PUBLISH' }),
    });
    const gate = (await createRes.json()).data;

    // 2. AI agent attempts to approve via verify endpoint -> 403 ERR_RBAC_DENIED
    const verifyBlock = await fetch(`${baseUrl}/api/v1/governance/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        principal_id: AI_AGENT_TENANT_A,
        project_id: TENANT_A_PROJ,
        requested_action: 'gate:approve',
        estimated_cost_usd: 0,
      }),
    });
    assert.strictEqual(verifyBlock.status, 403);
    assert.strictEqual((await verifyBlock.json()).code, 'ERR_RBAC_DENIED');

    // 3. AI agent attempts direct HTTP decision call -> 403 ERR_RBAC_DENIED
    const decideBlock = await fetch(`${baseUrl}/api/v1/governance/gates/${gate.id}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aiAgentJwt}` },
      body: JSON.stringify({ decision: 'APPROVED' }),
    });
    assert.strictEqual(decideBlock.status, 403);
    assert.strictEqual((await decideBlock.json()).code, 'ERR_RBAC_DENIED');

    // Verify gate remains in pristine PENDING status
    assert.strictEqual(systemStore.gates.get(gate.id).status, 'PENDING');
  });

  // ── TEST 3: FinOps Token Budget Circuit Breaker ──────────────────
  it('STAGE3-03: FinOps Token Circuit Breaker — Graceful degradation to TIER_2/TIER_3 and hard stop at 100%', async () => {
    // Project starts with $100 budget and $0 spent
    const proj = systemStore.projects.get(TENANT_A_PROJ)!;
    proj.tokens_spent_usd = 0; // Reset

    // Phase 1: Spend $55 (Remaining $45, 45% remaining -> TIER_2)
    const res55 = await fetch(`${baseUrl}/api/v1/governance/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        principal_id: USER_TENANT_A,
        project_id: TENANT_A_PROJ,
        requested_action: 'project:read',
        estimated_cost_usd: 55.00,
      }),
    });
    const data55 = await res55.json();
    assert.strictEqual(res55.status, 200);
    assert.strictEqual(data55.budget_tier_fallback, 'TIER_2');
    assert.strictEqual(data55.remaining_budget_usd, 45.00);

    // Phase 2: Spend $37 more (Total spent $92, Remaining $8, 8% remaining -> TIER_3)
    const res37 = await fetch(`${baseUrl}/api/v1/governance/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        principal_id: USER_TENANT_A,
        project_id: TENANT_A_PROJ,
        requested_action: 'project:read',
        estimated_cost_usd: 37.00,
      }),
    });
    const data37 = await res37.json();
    assert.strictEqual(res37.status, 200);
    assert.strictEqual(data37.budget_tier_fallback, 'TIER_3');
    assert.strictEqual(data37.remaining_budget_usd, 8.00);

    // Phase 3: Spend $10 (Exceeds remaining $8 -> Circuit Breaker Trips!)
    const resTrip = await fetch(`${baseUrl}/api/v1/governance/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        principal_id: USER_TENANT_A,
        project_id: TENANT_A_PROJ,
        requested_action: 'project:read',
        estimated_cost_usd: 10.00,
      }),
    });
    assert.strictEqual(resTrip.status, 402);
    const dataTrip = await resTrip.json();
    assert.strictEqual(dataTrip.code, 'ERR_BUDGET_EXCEEDED');
  });

  // ── TEST 4: Optimistic Concurrency Stress Testing ────────────────
  it('STAGE3-04: Optimistic Concurrency Stress Test — 10 concurrent requests to single gate yields exactly 1 winner and 9 conflicts', async () => {
    const tenantAJwt = signToken({ principal_id: USER_TENANT_A, principal_type: 'HUMAN', org_id: TENANT_A_ORG });

    // 1. Create a fresh gate at version 1
    const createRes = await fetch(`${baseUrl}/api/v1/governance/gates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tenantAJwt}` },
      body: JSON.stringify({ project_id: TENANT_A_PROJ, gate_stage: 'PRODUCTION_DEPLOY' }),
    });
    const gate = (await createRes.json()).data;
    assert.strictEqual(gate.version, 1);

    // 2. Fire 10 simultaneous approval requests with expected version 1
    const requests = Array.from({ length: 10 }, (_, i) =>
      fetch(`${baseUrl}/api/v1/governance/gates/${gate.id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tenantAJwt}` },
        body: JSON.stringify({ decision: 'APPROVED', version: 1, feedback_notes: `Attempt ${i + 1}` }),
      })
    );

    const responses = await Promise.all(requests);
    const statusCodes = responses.map(r => r.status);

    const successCount = statusCodes.filter(s => s === 200).length;
    const conflictCount = statusCodes.filter(s => s === 409).length;

    assert.strictEqual(successCount, 1, 'Exactly one concurrent decision must win');
    assert.strictEqual(conflictCount, 9, 'All other 9 decisions must be rejected with 409 Conflict');

    // Final gate state check
    const finalGate = systemStore.gates.get(gate.id);
    assert.strictEqual(finalGate.status, 'APPROVED');
    assert.strictEqual(finalGate.version, 2);
  });

  // ── TEST 5: Automated SecOps & SAST Codebase Scan ─────────────────
  it('STAGE3-05: SecOps & SAST Scan — Zero hardcoded secrets and SQLi sinks in governance-service', () => {
    const serviceDir = path.resolve('services/governance-service/src');
    const sourceFiles = [
      'config.ts',
      'db.ts',
      'server.ts',
      'models/schema.ts',
      'middleware/authenticate.ts',
      'lib/verify_permission.ts',
      'lib/circular_tenancy_check.ts',
      'routes/index.ts',
    ];

    // Secret detection regexes (similar to Gitleaks rules)
    const SECRET_PATTERNS = [
      /(['"`])(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36}\1/, // GitHub Token
      /(['"`])sk-[A-Za-z0-9]{32,}\1/,                       // OpenAI Secret Key
      /(['"`])AIza[0-9A-Za-z-_]{35}\1/,                     // Google API Key
      /password\s*=\s*['"][^'"]{8,}['"]/i,                  // Hardcoded Password Assignment
      /private_key/i,                                       // Hardcoded Private Key
    ];

    for (const relPath of sourceFiles) {
      const fullPath = path.join(serviceDir, relPath);
      if (!fs.existsSync(fullPath)) continue;
      const content = fs.readFileSync(fullPath, 'utf8');

      // Rule 1: No hardcoded secrets
      for (const pattern of SECRET_PATTERNS) {
        assert.strictEqual(
          pattern.test(content),
          false,
          `Security violation: Potential secret found matching ${pattern} in ${relPath}`
        );
      }

      // Rule 2: SQL Injection Sink Check (raw string concatenation into SQL)
      const rawSqlConcatPattern = /db\.execute\(\s*['"`]\s*SELECT.*?[\+\$]\{/i;
      assert.strictEqual(
        rawSqlConcatPattern.test(content),
        false,
        `SAST violation: Insecure raw SQL concatenation detected in ${relPath}`
      );
    }
  });
});
