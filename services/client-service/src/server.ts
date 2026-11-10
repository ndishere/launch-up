import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { config } from './config.js';
import { clientRoutes } from './routes/index.js';
import { closeDb } from './db.js';

const app = Fastify({
  logger: {
    level: config.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: config.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  },
});

// ── Plugins ───────────────────────────────────────────
await app.register(cors, { origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN.split(',') });
await app.register(helmet, { global: true });

// ── Routes ────────────────────────────────────────────
await app.register(clientRoutes);

// ── Graceful Shutdown ─────────────────────────────────
const shutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, shutting down gracefully...`);
  await app.close();
  await closeDb();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ── Start ─────────────────────────────────────────────
try {
  await app.listen({ port: config.PORT, host: '0.0.0.0' });
  app.log.info(`👥 Client service running on port ${config.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

