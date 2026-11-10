import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { whatsappRoutes } from './routes/index.ts';

const PORT = parseInt(process.env.PORT || '8012', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: LOG_LEVEL,
      transport:
        NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  });

  await app.register(cors, { origin: true });
  await app.register(helmet, { global: true });
  await app.register(whatsappRoutes);

  return app;
}

// Start standalone if executed directly
if (process.argv[1]?.endsWith('server.ts') || process.argv[1]?.endsWith('server.js')) {
  const app = await buildApp();
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    app.log.info(`🚀 WhatsApp marketing & CRM service listening on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}
