import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  processLeadDiscovery,
  ProspectRaw,
} from '../lib/engine.js';
import {
  DncListBlockedError,
  ScrapeTimeoutError,
  CanvaAutofillFailError,
} from '../types/index.js';

const leadRequestSchema = z.object({
  target_niche: z.string().min(1),
  country_code: z.string().length(2),
  city: z.string().min(1),
  max_leads: z.number().int().positive().optional().default(10),
  canva_pitch_template_id: z.string().min(1),
});

// Mock database / external API registry for discovery
const mockProspectRegistry: ProspectRaw[] = [
  {
    id: 'lead-0001-0000-0000-000000000001',
    name: 'Express Route Logistics',
    website: 'https://expressroute.example.com',
    email: 'contact@expressroute.example.com',
    phone: '+919876543210',
    hasMobileApp: false,
    lighthouseMobileScore: 35,
    hasWhatsAppBot: false,
    hasResponsiveViewport: true,
  },
  {
    id: 'lead-0002-0000-0000-000000000002',
    name: 'North Freight Cargo',
    website: 'https://northfreight.example.com',
    email: 'info@northfreight.example.com',
    phone: '+919876543211',
    hasMobileApp: false,
    lighthouseMobileScore: 48,
    hasWhatsAppBot: false,
    hasResponsiveViewport: false,
  },
];

const mockDncLedger = new Set<string>([
  'dnc@example.com',
  '+919000000000',
]);

export async function leadPitchRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'lead-pitch-service',
    timestamp: new Date().toISOString(),
  }));

  app.post('/api/v1/leads/discover', async (request, reply) => {
    const parseResult = leadRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
    }

    try {
      const response = await processLeadDiscovery(
        parseResult.data,
        mockProspectRegistry,
        mockDncLedger
      );
      return reply.status(200).send(response);
    } catch (err: any) {
      if (err instanceof DncListBlockedError) {
        return reply.status(err.statusCode).send({
          success: false,
          error: err.message,
          code: err.code,
        });
      }
      if (err instanceof ScrapeTimeoutError) {
        return reply.status(err.statusCode).send({
          success: false,
          error: err.message,
          code: err.code,
        });
      }
      if (err instanceof CanvaAutofillFailError) {
        return reply.status(err.statusCode).send({
          success: false,
          error: err.message,
          code: err.code,
        });
      }

      app.log.error(err);
      return reply.status(500).send({
        success: false,
        error: 'Internal lead discovery error',
      });
    }
  });
}
