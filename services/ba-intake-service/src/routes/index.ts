import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { processBaIntake } from '../lib/engine.js';
import {
  SchemaInvalidError,
  AmbiguousScopeError,
  UnsupportedLawError,
} from '../types/index.js';

const intakeRequestSchema = z.object({
  project_id: z.string().min(1, 'project_id is required'),
  client_id: z.string().min(1, 'client_id is required'),
  intake_transcript: z.string().min(1, 'intake_transcript cannot be empty'),
  brand_assets: z.object({
    primary_color_hex: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Invalid hex color'),
    secondary_color_hex: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Invalid hex color'),
    font_heading: z.string().min(1),
    font_body: z.string().min(1),
  }),
  target_countries: z.array(z.string().length(2)).min(1, 'At least one target country required'),
  target_modules: z.object({
    build_website: z.boolean(),
    build_landing_page: z.boolean(),
    build_android_app: z.boolean(),
    build_backend_api: z.boolean(),
    enable_digital_marketing: z.boolean(),
    enable_whatsapp_marketing: z.boolean(),
  }),
});

export async function baIntakeRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'ba-intake-service',
    timestamp: new Date().toISOString(),
  }));

  app.post('/api/v1/intake/synthesize', async (request, reply) => {
    const parseResult = intakeRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(422).send({
        success: false,
        code: 'ERR_SCHEMA_INVALID',
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
    }

    try {
      const response = await processBaIntake(parseResult.data as any);
      return reply.status(200).send(response);
    } catch (err: any) {
      if (err instanceof SchemaInvalidError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
        });
      }
      if (err instanceof AmbiguousScopeError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
        });
      }
      if (err instanceof UnsupportedLawError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
        });
      }

      app.log.error(err);
      return reply.status(500).send({
        success: false,
        error: 'Internal BA intake synthesis error',
      });
    }
  });
}
