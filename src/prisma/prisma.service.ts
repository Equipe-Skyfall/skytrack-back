import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const isServerless = process.env.IS_SERVERLESS === 'true';

    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Reduce logging in serverless to minimize cold start time
      log: isServerless
        ? ['error', 'warn']
        : ['error', 'warn', 'query'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();

      // In serverless, skip the test query to avoid prepared statement conflicts
      if (process.env.IS_SERVERLESS !== 'true') {
        await this.$queryRaw`SELECT 1`;
      }

      console.log('✅ Prisma connected successfully');
    } catch (error) {
      console.error('❌ Prisma connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    // In serverless, keep connections open for reuse across Lambda invocations
    // The cached app instance in api/index.ts + pgBouncer pooler handle connection management
    if (process.env.IS_SERVERLESS !== 'true') {
      await this.$disconnect();
      console.log('🔌 Prisma disconnected');
    }
  }
}