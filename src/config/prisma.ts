import { PrismaClient } from '../generated/prisma';
import dotenv from 'dotenv';

dotenv.config();

// Prisma database configuration interface following Interface Segregation Principle
export interface IPrismaConfig {
  databaseUrl: string;
  logLevel: ('info' | 'query' | 'warn' | 'error')[];
}

// Prisma configuration factory following Factory Pattern
export class PrismaConfigFactory {
  static create(): IPrismaConfig {
    return {
      databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/skytrack?schema=public',
      logLevel: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    };
  }
}

// Prisma connection interface following Dependency Inversion Principle
export interface IPrismaConnection {
  getClient(): PrismaClient;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

// Singleton Prisma Connection Factory following Singleton Pattern
export class PrismaConnectionFactory implements IPrismaConnection {
  private static instance: PrismaConnectionFactory;
  private client: PrismaClient | null = null;
  private config: IPrismaConfig;
  private connected = false;

  private constructor(config: IPrismaConfig) {
    this.config = config;
  }

  static getInstance(config?: IPrismaConfig): PrismaConnectionFactory {
    if (!PrismaConnectionFactory.instance) {
      const prismaConfig = config || PrismaConfigFactory.create();
      PrismaConnectionFactory.instance = new PrismaConnectionFactory(prismaConfig);
    }
    return PrismaConnectionFactory.instance;
  }

  getClient(): PrismaClient {
    if (!this.client) {
      this.client = new PrismaClient({
        datasources: {
          db: {
            url: this.config.databaseUrl,
          },
        },
        log: this.config.logLevel as any,
      });
    }
    return this.client;
  }

  async connect(): Promise<void> {
    try {
      if (!this.connected) {
        const client = this.getClient();

        // Test the connection
        await client.$connect();

        // Run a simple query to verify the connection
        await client.$queryRaw`SELECT 1`;

        this.connected = true;
        console.log('✅ Prisma connected successfully');
      }
    } catch (error) {
      console.error('❌ Prisma connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.connected) {
      await this.client.$disconnect();
      this.connected = false;
      console.log('🔌 Prisma disconnected');
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.connected) return false;

      const client = this.getClient();
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Prisma health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const prismaConnection = PrismaConnectionFactory.getInstance();