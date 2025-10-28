import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.IS_SERVERLESS === 'true'
        ? ['error', 'warn']
        : ['error', 'warn', 'query'],
    });

    // Configure connection pool for serverless
    if (process.env.IS_SERVERLESS === 'true') {
      this.$extends({
        query: {
          $allModels: {
            async $allOperations({ operation, model, args, query }) {
              // Set statement timeout for serverless
              const result = await query(args);
              return result;
            },
          },
        },
      });
    }
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
    // In serverless, keep connections open for reuse
    if (process.env.IS_SERVERLESS !== 'true') {
      await this.$disconnect();
      console.log('🔌 Prisma disconnected');
    }
  }
}