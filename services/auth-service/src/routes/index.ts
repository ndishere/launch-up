import type { FastifyInstance } from 'fastify';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { db } from '../db.js';
import { config } from '../config.js';
import { users, roles, userRoles, rolePermissions, permissions, refreshTokens, organizations } from '../models/schema.js';
import { authenticate, type JwtPayload } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

// ── Validation Schemas ──────────────────────────────
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(255),
  orgId: z.string().uuid().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

// ── Helper: Build JWT Payload ───────────────────────
async function buildTokenPayload(userId: string) {
  // Get user with org
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      organization: true,
      userRoles: {
        with: {
          role: {
            with: {
              rolePermissions: {
                with: { permission: true },
              },
            },
          },
        },
      },
    },
  });

  if (!user) throw new Error('User not found');

  const roleNames = user.userRoles.map((ur) => ur.role.name);
  const permissionStrings = [
    ...new Set(
      user.userRoles.flatMap((ur) =>
        ur.role.rolePermissions.map(
          (rp) => `${rp.permission.resource}:${rp.permission.action}:${rp.permission.scope}`
        )
      )
    ),
  ];

  return {
    sub: user.id,
    email: user.email,
    orgId: user.orgId,
    fullName: user.fullName,
    roles: roleNames,
    permissions: permissionStrings,
  };
}

function signAccessToken(payload: object): string {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.ACCESS_TOKEN_EXPIRY });
}

function signRefreshToken(payload: { sub: string }): string {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: config.REFRESH_TOKEN_EXPIRY });
}

// ── Route Registration ──────────────────────────────
export async function authRoutes(app: FastifyInstance) {

  // ── POST /auth/register ───────────────────────────
  app.post('/auth/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { email, password, fullName, orgId } = parsed.data;

    // Check if user exists
    const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existing) {
      return reply.status(409).send({ success: false, error: 'Email already registered' });
    }

    // Default org if none provided
    const targetOrgId = orgId || '00000000-0000-0000-0000-000000000001';

    const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

    const [newUser] = await db.insert(users).values({
      email,
      passwordHash,
      fullName,
      orgId: targetOrgId,
      status: 'active',
    }).returning();

    // Assign default role (jr_engineer)
    const defaultRole = await db.query.roles.findFirst({ where: eq(roles.name, 'jr_engineer') });
    if (defaultRole) {
      await db.insert(userRoles).values({
        userId: newUser.id,
        roleId: defaultRole.id,
        orgId: targetOrgId,
      });
    }

    const payload = await buildTokenPayload(newUser.id);
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ sub: newUser.id });

    // Store refresh token hash
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await db.insert(refreshTokens).values({
      userId: newUser.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: request.headers['user-agent'] || null,
      ipAddress: request.ip,
    });

    return reply.status(201).send({
      success: true,
      data: {
        user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName },
        accessToken,
        refreshToken,
      },
    });
  });

  // ── POST /auth/login ──────────────────────────────
  app.post('/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const { email, password } = parsed.data;

    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) {
      return reply.status(401).send({ success: false, error: 'Invalid email or password' });
    }
    if (user.status !== 'active') {
      return reply.status(403).send({ success: false, error: `Account is ${user.status}` });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return reply.status(401).send({ success: false, error: 'Invalid email or password' });
    }

    // Update last login
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    const payload = await buildTokenPayload(user.id);
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ sub: user.id });

    // Store refresh token hash
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: request.headers['user-agent'] || null,
      ipAddress: request.ip,
    });

    return reply.send({
      success: true,
      data: {
        user: { id: user.id, email: user.email, fullName: user.fullName, orgId: user.orgId },
        accessToken,
        refreshToken,
      },
    });
  });

  // ── POST /auth/refresh ────────────────────────────
  app.post('/auth/refresh', async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: 'refreshToken is required' });
    }

    const { refreshToken: token } = parsed.data;
    let decoded: { sub: string };

    try {
      decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as { sub: string };
    } catch {
      return reply.status(401).send({ success: false, error: 'Invalid or expired refresh token' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const stored = await db.query.refreshTokens.findFirst({
      where: and(eq(refreshTokens.tokenHash, tokenHash), eq(refreshTokens.revoked, false)),
    });

    if (!stored || stored.expiresAt < new Date()) {
      return reply.status(401).send({ success: false, error: 'Refresh token revoked or expired' });
    }

    // Rotate: revoke old, issue new
    await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.id, stored.id));

    const payload = await buildTokenPayload(decoded.sub);
    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken({ sub: decoded.sub });

    const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await db.insert(refreshTokens).values({
      userId: decoded.sub,
      tokenHash: newHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: request.headers['user-agent'] || null,
      ipAddress: request.ip,
    });

    return reply.send({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  });

  // ── POST /auth/logout ─────────────────────────────
  app.post('/auth/logout', { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    // Revoke all refresh tokens for this user
    await db.update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.userId, user.sub));

    return reply.send({ success: true, data: { message: 'Logged out successfully' } });
  });

  // ── GET /auth/me ──────────────────────────────────
  app.get('/auth/me', { preHandler: [authenticate] }, async (request, reply) => {
    const user = request.user!;
    const fullUser = await db.query.users.findFirst({
      where: eq(users.id, user.sub),
      columns: { passwordHash: false, mfaSecret: false },
    });

    if (!fullUser) {
      return reply.status(404).send({ success: false, error: 'User not found' });
    }

    return reply.send({
      success: true,
      data: { ...fullUser, roles: user.roles, permissions: user.permissions },
    });
  });

  // ── GET /auth/verify ──────────────────────────────
  app.get('/auth/verify', { preHandler: [authenticate] }, async (request, reply) => {
    return reply.send({ success: true, data: request.user });
  });

  // ── GET /users ────────────────────────────────────
  app.get('/users', { preHandler: [authenticate, authorize('users', 'read')] }, async (request, reply) => {
    const { page = '1', limit = '20' } = request.query as Record<string, string>;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const usersList = await db.query.users.findMany({
      where: eq(users.orgId, request.user!.orgId),
      columns: { passwordHash: false, mfaSecret: false },
      limit: parseInt(limit),
      offset,
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });

    return reply.send({
      success: true,
      data: usersList,
      meta: { page: parseInt(page), limit: parseInt(limit) },
    });
  });

  // ── GET /users/:id ────────────────────────────────
  app.get('/users/:id', { preHandler: [authenticate, authorize('users', 'read')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = await db.query.users.findFirst({
      where: and(eq(users.id, id), eq(users.orgId, request.user!.orgId)),
      columns: { passwordHash: false, mfaSecret: false },
      with: { userRoles: { with: { role: true } } },
    });

    if (!user) return reply.status(404).send({ success: false, error: 'User not found' });
    return reply.send({ success: true, data: user });
  });

  // ── GET /roles ────────────────────────────────────
  app.get('/roles', { preHandler: [authenticate] }, async (request, reply) => {
    const allRoles = await db.query.roles.findMany({
      orderBy: (roles, { asc }) => [asc(roles.name)],
    });
    return reply.send({ success: true, data: allRoles });
  });

  // ── POST /users/:id/roles ─────────────────────────
  app.post('/users/:id/roles', { preHandler: [authenticate, authorize('users', 'update')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { roleId } = request.body as { roleId: string };

    if (!roleId) return reply.status(400).send({ success: false, error: 'roleId is required' });

    await db.insert(userRoles).values({
      userId: id,
      roleId,
      orgId: request.user!.orgId,
      grantedBy: request.user!.sub,
    }).onConflictDoNothing();

    return reply.status(201).send({ success: true, data: { message: 'Role assigned' } });
  });

  // ── Health ────────────────────────────────────────
  app.get('/health', async (_request, reply) => {
    return reply.send({ status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() });
  });
}

