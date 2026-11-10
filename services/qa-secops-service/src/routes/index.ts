import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { processQAVerification } from '../lib/engine.ts';
import {
  SecurityVulnFoundError,
  E2EAssertionFailError,
  LighthouseBelow90Error,
} from '../types/index.ts';

const userStorySchema = z.object({
  id: z.string().min(1),
  role: z.string().min(1),
  goal: z.string().min(1),
  acceptance_criteria: z.array(z.string()),
});

const qaVerifyRequestSchema = z.object({
  project_id: z.string().min(1, 'project_id is required'),
  web_staging_url: z.string().url('web_staging_url must be a valid URL'),
  api_staging_url: z.string().url('api_staging_url must be a valid URL'),
  signed_apk_url: z.string().url('signed_apk_url must be a valid URL'),
  user_stories: z.array(userStorySchema),
  simulated_findings: z.record(z.any()).optional(),
});

export async function qaSecopsRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'qa-secops-service',
    timestamp: new Date().toISOString(),
  }));

  app.post('/api/v1/qa/verify', async (request, reply) => {
    const parseResult = qaVerifyRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
    }

    try {
      const response = await processQAVerification(parseResult.data as any);
      return reply.status(200).send(response);
    } catch (err: any) {
      if (err instanceof SecurityVulnFoundError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
          findings: err.findings,
        });
      }
      if (err instanceof E2EAssertionFailError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
          failedStories: err.failedStories,
          passRate: err.passRate,
        });
      }
      if (err instanceof LighthouseBelow90Error) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
          failingCategories: err.failingCategories,
        });
      }

      app.log.error(err);
      return reply.status(500).send({
        success: false,
        code: 'ERR_QA_VERIFY',
        error: 'Internal QA & SecOps verification error',
      });
    }
  });
}
