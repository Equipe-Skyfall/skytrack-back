import { config } from './config';
import { createApp } from './app';
import { PrismaClient } from './generated/prisma';
import { MigrationScheduler } from './services/migration/migrationScheduler';

async function startServer() {
  try {
    const app = await createApp();

    // Start migration scheduler
    const prisma = new PrismaClient();
    const migrationScheduler = new MigrationScheduler(prisma);
    migrationScheduler.start();
    console.log('🔄 Migration scheduler started');

    const server = app.listen(config.port, () => {
      console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${config.port}`);
      console.log(`📚 API Documentation available at http://localhost:${config.port}/api-docs`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      migrationScheduler.stop();
      prisma.$disconnect();
      server.close(() => {
        console.log('Process terminated');
      });
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();