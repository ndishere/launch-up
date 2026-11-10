import type { FastifyRequest, FastifyReply } from 'fastify';
import { config } from '../config.js';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  email: string;
  orgId: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      error: 'Missing or invalid Authorization header',
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    request.user = decoded;
  } catch (err) {
    const message = err instanceof jwt.TokenExpiredError
      ? 'Token expired'
      : 'Invalid token';
    return reply.status(401).send({ success: false, error: message });
  }
}

