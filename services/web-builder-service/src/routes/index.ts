import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { processWebBuild } from '../lib/engine.ts';
import {
  BuildCompileError,
  ViewportOverflowError,
  SandboxTimeoutError,
} from '../types/index.ts';

const fileDeltaSchema = z.object({
  file_path: z.string().min(1),
  operation: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  content: z.string().optional(),
  linked_user_story_ids: z.array(z.string()).optional(),
});

const webBuildRequestSchema = z.object({
  project_id: z.string().min(1, 'project_id is required'),
  golden_template_id: z.string().min(1, 'golden_template_id is required'),
  openapi_3_1_yaml: z.string().optional(),
  brand_assets: z.record(z.any()).optional(),
  compliance_flags: z.array(z.string()).optional(),
  ga4_measurement_id: z.string().optional(),
  file_deltas: z.array(fileDeltaSchema),
});

export async function webBuilderRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'web-builder-service',
    timestamp: new Date().toISOString(),
  }));

  app.post('/api/v1/web/build', async (request, reply) => {
    const parseResult = webBuildRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
    }

    try {
      const response = await processWebBuild(parseResult.data as any);
      return reply.status(200).send(response);
    } catch (err: any) {
      if (err instanceof ViewportOverflowError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
          viewport: err.viewport,
          culprit: err.culprit,
        });
      }
      if (err instanceof BuildCompileError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
        });
      }
      if (err instanceof SandboxTimeoutError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
        });
      }

      app.log.error(err);
      return reply.status(500).send({
        success: false,
        code: 'ERR_BUILD_COMPILE',
        error: 'Internal Web Build execution error',
      });
    }
  });
}
