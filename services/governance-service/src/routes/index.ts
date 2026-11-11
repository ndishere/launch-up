import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '../db.js';
import {
  principals,
  projectMemberships,
  clientProjectLinks,
  approvalGates,
} from '../models/schema.js';
import { authenticate } from '../middleware/authenticate.js';
import {
  verifyPrincipalPermission,
  RbacDeniedError,
  TenantMismatchError,
  BudgetExceededError,
  CircularTenancyError,
} from '../lib/verify_permission.js';
import { detectCircularTenancy } from '../lib/circular_tenancy_check.js';

// ── Validation Schemas ────────────────────────────────
const verifySchema = z.object({
  principal_id: z.string().uuid(),
  client_id: z.string().uuid().nullable().optional().default(null),
  project_id: z.string().uuid(),
  requested_action: z.string().min(1),
  estimated_cost_usd: z.number().min(0).default(0),
});

const createGateSchema = z.object({
  project_id: z.string().uuid(),
  langgraph_thread_id: z.string().max(255).optional().default(''),
  gate_stage: z.enum([
    'OUTREACH_PITCH',
    'REQUIREMENTS_PRD',
    'PRODUCTION_DEPLOY',
    'MARKETING_PUBLISH',
    'HOTFIX_MERGE',
  ]),
  artifact_summary: z.string().optional().default(''),
  artifact_payload: z.record(z.string(), z.any()).optional().default({}),
});

const decideGateSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED', 'REVISION_REQUESTED']),
  feedback_notes: z.string().optional(),
});

const createMembershipSchema = z.object({
  principal_id: z.string().uuid(),
  client_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid(),
  role_id: z.string().uuid(),
  can_approve_gates: z.boolean().default(false),
});

const createLinkSchema = z.object({
  client_id: z.string().uuid(),
  project_id: z.string().uuid(),
  relationship_type: z.enum(['PRIMARY_OWNER', 'CO_OWNER', 'AGENCY_PARTNER', 'VENDOR']),
  billing_share_percent: z.number().min(0).max(100).default(100),
});

export async function governanceRoutes(app: FastifyInstance) {
  // ── Health Check ───────────────────────────────────
  app.get('/health', async () => ({
    status: 'ok',
    service: 'governance-service',
    timestamp: new Date().toISOString(),
  }));

  // ── MOD-10 Core: Verify Principal Permission ───────
  app.post('/api/v1/governance/verify', async (request, reply) => {
    const parseResult = verifySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid verify request payload',
        details: parseResult.error.format(),
      });
    }

    try {
      const response = await verifyPrincipalPermission(db, parseResult.data);
      return reply.status(200).send(response);
    } catch (err: any) {
      if (err instanceof RbacDeniedError) {
        return reply.status(err.statusCode).send({
          authorized: false,
          error: err.message,
          code: err.code,
        });
      }
      if (err instanceof TenantMismatchError) {
        return reply.status(err.statusCode).send({
          authorized: false,
          error: err.message,
          code: err.code,
        });
      }
      if (err instanceof BudgetExceededError) {
        return reply.status(err.statusCode).send({
          authorized: false,
          error: err.message,
          code: err.code,
        });
      }
      if (err instanceof CircularTenancyError) {
        return reply.status(err.statusCode).send({
          authorized: false,
          error: err.message,
          code: err.code,
        });
      }

      app.log.error(err);
      return reply.status(500).send({
        success: false,
        error: 'Internal authorization error',
      });
    }
  });

  // ── Approval Gates: List ───────────────────────────
  app.get('/api/v1/governance/gates', { preHandler: [authenticate] }, async (request, reply) => {
    const { project_id, status } = request.query as Record<string, string>;
    const orgId = request.user!.orgId;

    let query = db
      .select()
      .from(approvalGates)
      .where(eq(approvalGates.orgId, orgId));

    if (project_id) {
      query = db
        .select()
        .from(approvalGates)
        .where(
          and(
            eq(approvalGates.orgId, orgId),
            eq(approvalGates.projectId, project_id),
            status ? eq(approvalGates.status, status as any) : sql`TRUE`,
          ),
        ) as any;
    }

    const gates = await query.orderBy(desc(approvalGates.createdAt));
    return reply.send({ success: true, data: gates });
  });

  // ── Approval Gates: Create ─────────────────────────
  app.post('/api/v1/governance/gates', { preHandler: [authenticate] }, async (request, reply) => {
    const parseResult = createGateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
    }

    const orgId = request.user!.orgId;
    const [gate] = await db
      .insert(approvalGates)
      .values({
        projectId: parseResult.data.project_id,
        langgraphThreadId: parseResult.data.langgraph_thread_id,
        gateStage: parseResult.data.gate_stage,
        artifactSummary: parseResult.data.artifact_summary,
        artifactPayload: parseResult.data.artifact_payload,
        status: 'PENDING',
        orgId,
      })
      .returning();

    return reply.status(201).send({ success: true, data: gate });
  });

  // ── Approval Gates: Decide (Optimistic Locking & Race-Free) ──
  app.post('/api/v1/governance/gates/:id/decide', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parseResult = decideGateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
    }

    const principalId = request.user!.userId ?? request.user!.sub;
    const orgId = request.user!.orgId;

    // 1. Principal lookup and check if AI_AGENT
    const [principal] = await db
      .select()
      .from(principals)
      .where(eq(principals.id, principalId))
      .limit(1);

    if (principal && principal.principalType === 'AI_AGENT') {
      return reply.status(403).send({
        success: false,
        error: 'AI agents cannot approve or decide human gates',
        code: 'ERR_RBAC_DENIED',
      });
    }

    // 2. Fetch gate with FOR UPDATE lock simulation
    const [gate] = await db
      .select()
      .from(approvalGates)
      .where(and(eq(approvalGates.id, id), eq(approvalGates.orgId, orgId)))
      .limit(1);

    if (!gate) {
      return reply.status(404).send({ success: false, error: 'Approval gate not found' });
    }

    if (gate.status !== 'PENDING') {
      return reply.status(409).send({
        success: false,
        error: `Gate has already been decided (${gate.status})`,
        code: 'ERR_GATE_ALREADY_DECIDED',
      });
    }

    // 3. Check gate approval permission on project membership
    const [membership] = await db
      .select()
      .from(projectMemberships)
      .where(
        and(
          eq(projectMemberships.principalId, principalId),
          eq(projectMemberships.projectId, gate.projectId),
        ),
      )
      .limit(1);

    if (!membership?.canApproveGates && !request.user!.roles.includes('super_admin')) {
      return reply.status(403).send({
        success: false,
        error: 'Principal does not have gate approval authority for this project',
        code: 'ERR_RBAC_DENIED',
      });
    }

    // 4. Update gate with optimistic version check
    const updated = await db
      .update(approvalGates)
      .set({
        status: parseResult.data.decision,
        decidedBy: principalId,
        feedbackNotes: parseResult.data.feedback_notes,
        decidedAt: new Date(),
        version: gate.version + 1,
      })
      .where(
        and(
          eq(approvalGates.id, id),
          eq(approvalGates.version, gate.version),
        ),
      )
      .returning();

    if (updated.length === 0) {
      return reply.status(409).send({
        success: false,
        error: 'Concurrent modification conflict: gate was updated by another approver',
        code: 'ERR_CONCURRENT_UPDATE_CONFLICT',
      });
    }

    return reply.send({ success: true, data: updated[0] });
  });

  // ── Project Memberships: List ───────────────────────
  app.get('/api/v1/governance/memberships', { preHandler: [authenticate] }, async (request, reply) => {
    const { project_id, principal_id } = request.query as Record<string, string>;
    const orgId = request.user!.orgId;

    let query = db
      .select()
      .from(projectMemberships)
      .where(eq(projectMemberships.orgId, orgId));

    if (project_id) {
      query = db
        .select()
        .from(projectMemberships)
        .where(
          and(
            eq(projectMemberships.orgId, orgId),
            eq(projectMemberships.projectId, project_id),
            principal_id ? eq(projectMemberships.principalId, principal_id) : sql`TRUE`,
          ),
        ) as any;
    }

    const records = await query;
    return reply.send({ success: true, data: records });
  });

  // ── Project Memberships: Create ─────────────────────
  app.post('/api/v1/governance/memberships', { preHandler: [authenticate] }, async (request, reply) => {
    const parseResult = createMembershipSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
    }

    const orgId = request.user!.orgId;
    const [membership] = await db
      .insert(projectMemberships)
      .values({
        principalId: parseResult.data.principal_id,
        clientId: parseResult.data.client_id ?? null,
        projectId: parseResult.data.project_id,
        roleId: parseResult.data.role_id,
        canApproveGates: parseResult.data.can_approve_gates,
        orgId,
      })
      .returning();

    return reply.status(201).send({ success: true, data: membership });
  });

  // ── Client Project Links: Create (with circular check) ──
  app.post('/api/v1/governance/client-project-links', { preHandler: [authenticate] }, async (request, reply) => {
    const parseResult = createLinkSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
    }

    const { client_id, project_id, relationship_type, billing_share_percent } = parseResult.data;
    const orgId = request.user!.orgId;

    // Circular tenancy detection
    const isCircular = await detectCircularTenancy(db, client_id, project_id, relationship_type);
    if (isCircular) {
      return reply.status(422).send({
        success: false,
        error: 'Circular vendor/partner tenancy detected in project hierarchy',
        code: 'ERR_CIRCULAR_TENANCY',
      });
    }

    const [link] = await db
      .insert(clientProjectLinks)
      .values({
        clientId: client_id,
        projectId: project_id,
        relationshipType: relationship_type,
        billingSharePercent: billing_share_percent.toString(),
        orgId,
      })
      .returning();

    return reply.status(201).send({ success: true, data: link });
  });
}
