import type { FastifyInstance } from 'fastify';
import { processSREIncident } from '../lib/engine.ts';
import {
  validateSRERequest,
  ForbiddenFileTouchError,
  ReproductionFailedError,
  HotfixBrokeTestsError,
  MaxRetriesExceededError,
  ValidationError,
} from '../types/index.ts';

export async function sreRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'sre-healing-service',
    timestamp: new Date().toISOString(),
  }));

  const handleIncident = async (request: any, reply: any) => {
    try {
      const validated = validateSRERequest(request.body);
      const response = await processSREIncident(validated);
      return reply.status(200).send(response);
    } catch (err: any) {
      if (err instanceof ValidationError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
        });
      }
      if (err instanceof ForbiddenFileTouchError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
        });
      }
      if (err instanceof ReproductionFailedError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
        });
      }
      if (err instanceof HotfixBrokeTestsError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
        });
      }
      if (err instanceof MaxRetriesExceededError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
        });
      }

      app.log.error(err);
      return reply.status(500).send({
        success: false,
        code: 'ERR_INTERNAL_SERVER_ERROR',
        error: err.message || 'An unexpected error occurred in SRE service',
      });
    }
  };

  app.post('/api/v1/sre/heal', handleIncident);
  app.post('/api/v1/sre/webhook', handleIncident);
}
