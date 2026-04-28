import { serve } from '@hono/node-server';

import { env } from './config/env';
import { logger } from './config/logger';
import { connectToDatabase, disconnectDatabase } from './db/mongoose';
import { app } from './app';

async function bootstrap() {
  await connectToDatabase();

  const server = serve({
    fetch: app.fetch,
    port: env.PORT
  });

  logger.info(`HTTP server listening on port ${env.PORT}`);

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);

    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to bootstrap server', {
    error: error instanceof Error ? error.message : String(error)
  });
  process.exit(1);
});
