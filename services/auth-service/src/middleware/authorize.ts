import type { FastifyRequest, FastifyReply } from 'fastify';
import type { JwtPayload } from './authenticate.js';

/**
 * Creates a Fastify preHandler that checks if the current user
 * has a specific permission (resource:action:scope).
 *
 * Usage: { preHandler: [authenticate, authorize('clients', 'create')] }
 */
export function authorize(resource: string, action: string) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as JwtPayload | undefined;

    if (!user) {
      return reply.status(401).send({
        success: false,
        error: 'Authentication required',
      });
    }

    // Super admins bypass all checks
    if (user.roles.includes('super_admin')) {
      return;
    }

    // Check if any of the user's permissions match
    const required = `${resource}:${action}`;
    const hasPermission = user.permissions.some((p) => {
      // Permission format: "resource:action:scope"
      const [pResource, pAction] = p.split(':');
      return pResource === resource && pAction === action;
    });

    if (!hasPermission) {
      return reply.status(403).send({
        success: false,
        error: `Insufficient permissions: requires ${required}`,
      });
    }
  };
}

