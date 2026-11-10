import type { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface JwtPayload {
  sub: string;
  email: string;
  orgId: string;
  fullName: string;
  roles: string[];
  permissions: string[];
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ success: false, error: 'Missing or invalid Authorization header' });
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    request.user = decoded;
  } catch {
    return reply.status(401).send({ success: false, error: 'Invalid or expired token' });
  }
}

export function authorize(resource: string, action: string) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const user = request.user;
    if (!user) return reply.status(401).send({ success: false, error: 'Authentication required' });
    if (user.roles.includes('super_admin')) return;

    const hasPermission = user.permissions.some((p) => {
      const [r, a] = p.split(':');
      return r === resource && a === action;
    });

    if (!hasPermission) {
      return reply.status(403).send({ success: false, error: `Insufficient permissions: ${resource}:${action}` });
    }
  };
}

