import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { processMarketingCampaign } from '../lib/engine.ts';
import {
  CanvaRateLimitError,
  TemplateFieldMismatchError,
} from '../types/index.ts';

const marketingRequestSchema = z.object({
  project_id: z.string().min(1, 'project_id is required'),
  brand_kit: z.record(z.any()),
  campaign_theme: z.string().min(1, 'campaign_theme is required'),
  days_count: z.number().int().min(1).max(365).optional().default(30),
  canva_brand_template_ids: z.array(z.string()).min(1, 'At least one canva template ID is required'),
  simulate_rate_limit: z.boolean().optional(),
  simulate_field_mismatch: z.boolean().optional(),
});

export async function marketingRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'marketing-engine-service',
    timestamp: new Date().toISOString(),
  }));

  app.post('/api/v1/marketing/calendar', async (request, reply) => {
    const parseResult = marketingRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
    }

    try {
      const response = await processMarketingCampaign(parseResult.data as any);
      return reply.status(200).send(response);
    } catch (err: any) {
      if (err instanceof CanvaRateLimitError) {
        reply.header('Retry-After', err.retryAfterSeconds);
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
          retryAfterSeconds: err.retryAfterSeconds,
        });
      }
      if (err instanceof TemplateFieldMismatchError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
          missingFields: err.missingFields,
        });
      }

      app.log.error(err);
      return reply.status(500).send({
        success: false,
        error: 'Internal Marketing Engine execution error',
      });
    }
  });
}
