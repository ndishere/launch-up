import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  processBackendBuild,
  executePrivacyExport,
  executePrivacyErasure,
} from '../lib/engine.ts';
import {
  RlsUnprotectedTableError,
  MigrationConflictError,
  OpenApiDriftError,
} from '../types/index.ts';

const backendBuildRequestSchema = z.object({
  project_id: z.string().min(1, 'project_id is required'),
  golden_template_id: z.string().min(1, 'golden_template_id is required'),
  db_migration_sql: z.string().min(1, 'db_migration_sql cannot be empty'),
  openapi_3_1_yaml: z.string().min(1, 'openapi_3_1_yaml cannot be empty'),
  rbac_matrix: z.record(z.string(), z.array(z.string())),
  compliance_flags: z.array(z.string()).optional(),
});

export async function backendApiRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'backend-api-service',
    timestamp: new Date().toISOString(),
  }));

  app.post('/api/v1/backend/build', async (request, reply) => {
    const parseResult = backendBuildRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
    }

    try {
      const response = await processBackendBuild(parseResult.data as any);
      return reply.status(200).send(response);
    } catch (err: any) {
      if (err instanceof RlsUnprotectedTableError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
          unprotectedTables: err.unprotectedTables,
        });
      }
      if (err instanceof MigrationConflictError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
          conflictingEntities: err.conflictingEntities,
        });
      }
      if (err instanceof OpenApiDriftError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
          driftingEndpoints: err.driftingEndpoints,
        });
      }

      app.log.error(err);
      return reply.status(500).send({
        success: false,
        code: 'ERR_BACKEND_BUILD',
        error: 'Internal Backend API Build execution error',
      });
    }
  });

  // Privacy export & erasure endpoints (GDPR/DPDP compliance)
  app.get('/api/v1/privacy/me/export', async (request, reply) => {
    const userId = (request.query as any)?.user_id || 'usr-anonymous';
    const data = executePrivacyExport(userId);
    return reply.status(200).send(data);
  });

  app.delete('/api/v1/privacy/me/erase', async (request, reply) => {
    const userId = (request.query as any)?.user_id || 'usr-anonymous';
    const data = executePrivacyErasure(userId);
    return reply.status(200).send(data);
  });
}
