import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration interface following Interface Segregation Principle
export interface IDatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

// Database configuration factory following Factory Pattern
export class DatabaseConfigFactory {
  static create(): IDatabaseConfig {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'skytrack',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      max: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
    };
  }
}

// Database connection interface following Dependency Inversion Principle
export interface IDatabaseConnection {
  getPool(): Pool;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

// Singleton Database Connection Factory following Singleton Pattern
export class DatabaseConnectionFactory implements IDatabaseConnection {
  private static instance: DatabaseConnectionFactory;
  private pool: Pool | null = null;
  private config: IDatabaseConfig;

  private constructor(config: IDatabaseConfig) {
    this.config = config;
  }

  static getInstance(config?: IDatabaseConfig): DatabaseConnectionFactory {
    if (!DatabaseConnectionFactory.instance) {
      const dbConfig = config || DatabaseConfigFactory.create();
      DatabaseConnectionFactory.instance = new DatabaseConnectionFactory(dbConfig);
    }
    return DatabaseConnectionFactory.instance;
  }

  getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.pool;
  }

  async connect(): Promise<void> {
    try {
      if (!this.pool) {
        const poolConfig: PoolConfig = {
          host: this.config.host,
          port: this.config.port,
          database: this.config.database,
          user: this.config.user,
          password: this.config.password,
          max: this.config.max,
          idleTimeoutMillis: this.config.idleTimeoutMillis,
          connectionTimeoutMillis: this.config.connectionTimeoutMillis,
        };

        this.pool = new Pool(poolConfig);

        // Test the connection
        const client = await this.pool.connect();
        await client.query('SELECT NOW()');
        client.release();

        console.log('✅ Database connected successfully');
      }
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('🔌 Database disconnected');
    }
  }

  isConnected(): boolean {
    return this.pool !== null;
  }
}

// Export singleton instance
export const databaseConnection = DatabaseConnectionFactory.getInstance();