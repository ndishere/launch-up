import type { FastifyInstance } from 'fastify';
import { processWhatsAppEvent } from '../lib/engine.ts';
import {
  validateWhatsAppRequest,
  NoOptinProofError,
  Outside24hWindowError,
  MetaApiRejectError,
  ValidationError,
} from '../types/index.ts';

export async function whatsappRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'whatsapp-service',
    timestamp: new Date().toISOString(),
  }));

  const handleMessage = async (request: any, reply: any) => {
    try {
      const validated = validateWhatsAppRequest(request.body);
      const result = await processWhatsAppEvent(validated);
      return reply.status(200).send(result);
    } catch (err: any) {
      if (err instanceof ValidationError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
        });
      }
      if (err instanceof NoOptinProofError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
        });
      }
      if (err instanceof Outside24hWindowError) {
        return reply.status(err.statusCode).send({
          success: false,
          code: err.code,
          error: err.message,
        });
      }
      if (err instanceof MetaApiRejectError) {
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
        error: err.message || 'An unexpected error occurred in WhatsApp service',
      });
    }
  };

  app.post('/api/v1/whatsapp/send', handleMessage);
  app.post('/api/v1/whatsapp/webhook', handleMessage);
}
