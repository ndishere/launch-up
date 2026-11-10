import type { FastifyInstance } from 'fastify';
import { eq, and, ilike, or, sql, desc, asc, count } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db.js';
import { clients, clientProjects, requirementIntakes } from '../models/schema.js';
import { authenticate, authorize } from '../middleware/authenticate.js';

// ── Validation Schemas ──────────────────────────────
const createClientSchema = z.object({
  name: z.string().min(1).max(255),
  domain: z.string().max(255).optional(),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
  tier: z.enum(['Enterprise B2B', 'Growth B2B', 'Startup B2C', 'Agency']).default('Startup B2C'),
  status: z.enum(['Active', 'Onboarding', 'Pending', 'Inactive']).default('Onboarding'),
  monthlyMrr: z.number().int().min(0).default(0),
  contactInfo: z.record(z.any()).default({}),
  notes: z.string().optional(),
});

const updateClientSchema = createClientSchema.partial();

const createIntakeSchema = z.object({
  clientName: z.string().min(1),
  companyName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  projectTitle: z.string().min(1),
  productTypes: z.array(z.string()).default([]),
  servicesNeeded: z.array(z.string()).default([]),
  budgetEstimated: z.string().optional(),
  deadline: z.string().optional(),
  summary: z.string().min(1),
  detailedRequirements: z.string().optional(),
  status: z.enum(['Draft', 'Submitted', 'Under Review', 'Converted', 'Archived']).default('Submitted'),
});

const linkProjectSchema = z.object({
  projectId: z.string().uuid(),
  isPrimary: z.boolean().default(false),
  revenueSharePct: z.number().min(0).max(100).default(0),
});

// ── Route Registration ──────────────────────────────
export async function clientRoutes(app: FastifyInstance) {

  // ── GET /clients ──────────────────────────────────
  app.get('/clients', { preHandler: [authenticate, authorize('clients', 'read')] }, async (request, reply) => {
    const { page = '1', limit = '20', tier, status, search, sort = 'createdAt', order = 'desc' } = request.query as Record<string, string>;
    const orgId = request.user!.orgId;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [
      eq(clients.orgId, orgId),
      eq(clients.isDeleted, false),
    ];

    if (tier) conditions.push(eq(clients.tier, tier));
    if (status) conditions.push(eq(clients.status, status));
    if (search) {
      conditions.push(
        or(
          ilike(clients.name, `%${search}%`),
          ilike(clients.domain, `%${search}%`),
          ilike(clients.email, `%${search}%`),
        )!
      );
    }

    const where = and(...conditions);
    const orderFn = order === 'asc' ? asc : desc;

    const [data, totalResult] = await Promise.all([
      db.select().from(clients).where(where)
        .orderBy(orderFn(clients[sort as keyof typeof clients.$inferSelect] ? clients.createdAt : clients.createdAt))
        .limit(limitNum).offset(offset),
      db.select({ count: count() }).from(clients).where(where),
    ]);

    return reply.send({
      success: true,
      data,
      meta: { page: pageNum, limit: limitNum, total: totalResult[0]?.count || 0 },
    });
  });

  // ── GET /clients/stats ────────────────────────────
  app.get('/clients/stats', { preHandler: [authenticate, authorize('clients', 'read')] }, async (request, reply) => {
    const orgId = request.user!.orgId;
    const where = and(eq(clients.orgId, orgId), eq(clients.isDeleted, false));

    const stats = await db.select({
      totalClients: count(),
      totalMrr: sql<number>`COALESCE(SUM(${clients.monthlyMrr}), 0)`,
    }).from(clients).where(where);

    const tierBreakdown = await db.select({
      tier: clients.tier,
      count: count(),
    }).from(clients).where(where).groupBy(clients.tier);

    return reply.send({
      success: true,
      data: {
        totalClients: stats[0]?.totalClients || 0,
        totalMrr: stats[0]?.totalMrr || 0,
        byTier: tierBreakdown,
      },
    });
  });

  // ── GET /clients/:id ──────────────────────────────
  app.get('/clients/:id', { preHandler: [authenticate, authorize('clients', 'read')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const orgId = request.user!.orgId;

    const client = await db.query.clients.findFirst({
      where: and(eq(clients.id, id), eq(clients.orgId, orgId), eq(clients.isDeleted, false)),
      with: { clientProjects: true },
    });

    if (!client) return reply.status(404).send({ success: false, error: 'Client not found' });
    return reply.send({ success: true, data: client });
  });

  // ── POST /clients ─────────────────────────────────
  app.post('/clients', { preHandler: [authenticate, authorize('clients', 'create')] }, async (request, reply) => {
    const parsed = createClientSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const [newClient] = await db.insert(clients).values({
      ...parsed.data,
      orgId: request.user!.orgId,
    }).returning();

    return reply.status(201).send({ success: true, data: newClient });
  });

  // ── PATCH /clients/:id ────────────────────────────
  app.patch('/clients/:id', { preHandler: [authenticate, authorize('clients', 'update')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updateClientSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const [updated] = await db.update(clients)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(clients.id, id), eq(clients.orgId, request.user!.orgId)))
      .returning();

    if (!updated) return reply.status(404).send({ success: false, error: 'Client not found' });
    return reply.send({ success: true, data: updated });
  });

  // ── DELETE /clients/:id (soft delete) ─────────────
  app.delete('/clients/:id', { preHandler: [authenticate, authorize('clients', 'delete')] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const [updated] = await db.update(clients)
      .set({ isDeleted: true, status: 'Inactive', updatedAt: new Date() })
      .where(and(eq(clients.id, id), eq(clients.orgId, request.user!.orgId)))
      .returning();

    if (!updated) return reply.status(404).send({ success: false, error: 'Client not found' });
    return reply.send({ success: true, data: { message: 'Client deactivated' } });
  });

  // ── POST /clients/:id/projects (link project) ────
  app.post('/clients/:id/projects', { preHandler: [authenticate, authorize('clients', 'update')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = linkProjectSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    await db.insert(clientProjects).values({
      clientId: id,
      projectId: parsed.data.projectId,
      isPrimary: parsed.data.isPrimary,
      revenueSharePct: String(parsed.data.revenueSharePct),
    }).onConflictDoNothing();

    return reply.status(201).send({ success: true, data: { message: 'Project linked' } });
  });

  // ── GET /clients/:id/projects ─────────────────────
  app.get('/clients/:id/projects', { preHandler: [authenticate, authorize('clients', 'read')] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const links = await db.select().from(clientProjects)
      .where(eq(clientProjects.clientId, id));

    return reply.send({ success: true, data: links });
  });

  // ── DELETE /clients/:id/projects/:projectId ───────
  app.delete('/clients/:id/projects/:projectId', { preHandler: [authenticate, authorize('clients', 'update')] }, async (request, reply) => {
    const { id, projectId } = request.params as { id: string; projectId: string };

    await db.delete(clientProjects).where(
      and(eq(clientProjects.clientId, id), eq(clientProjects.projectId, projectId))
    );

    return reply.send({ success: true, data: { message: 'Project unlinked' } });
  });

  // ── POST /intakes ─────────────────────────────────
  app.post('/intakes', { preHandler: [authenticate, authorize('clients', 'create')] }, async (request, reply) => {
    const parsed = createIntakeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const [intake] = await db.insert(requirementIntakes).values({
      ...parsed.data,
      orgId: request.user!.orgId,
    }).returning();

    return reply.status(201).send({ success: true, data: intake });
  });

  // ── GET /intakes ──────────────────────────────────
  app.get('/intakes', { preHandler: [authenticate, authorize('clients', 'read')] }, async (request, reply) => {
    const { page = '1', limit = '20' } = request.query as Record<string, string>;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const data = await db.select().from(requirementIntakes)
      .where(eq(requirementIntakes.orgId, request.user!.orgId))
      .orderBy(desc(requirementIntakes.createdAt))
      .limit(parseInt(limit)).offset(offset);

    return reply.send({ success: true, data });
  });

  // ── PATCH /intakes/:id ────────────────────────────
  app.patch('/intakes/:id', { preHandler: [authenticate, authorize('clients', 'update')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: string };

    const [updated] = await db.update(requirementIntakes)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(requirementIntakes.id, id), eq(requirementIntakes.orgId, request.user!.orgId)))
      .returning();

    if (!updated) return reply.status(404).send({ success: false, error: 'Intake not found' });
    return reply.send({ success: true, data: updated });
  });

  // ── Health ────────────────────────────────────────
  app.get('/health', async (_request, reply) => {
    return reply.send({ status: 'ok', service: 'client-service', timestamp: new Date().toISOString() });
  });
}

