import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
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
    await this.$disconnect();
    console.log('🔌 Prisma disconnected');
  }
}