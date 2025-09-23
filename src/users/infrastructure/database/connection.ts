// import { PrismaClient } from '@prisma/client';

// class Database {
//   private static instance: Database;
//   private prisma: PrismaClient;

//   private constructor() {
//     this.prisma = new PrismaClient({
//       log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
//       datasources: {
//         db: {
//           url: process.env.DATABASE_URL,
//         },
//       },
//     });

//     // Handle connection cleanup for serverless
//     if (process.env.VERCEL) {
//       // Graceful shutdown for serverless
//       process.on('beforeExit', async () => {
//         await this.prisma.$disconnect();
//       });
//     }
//   }

//   public static getInstance(): Database {
//     if (!Database.instance) {
//       Database.instance = new Database();
//     }
//     return Database.instance;
//   }

//   public getClient(): PrismaClient {
//     return this.prisma;
//   }

//   public async connect(): Promise<void> {
//     try {
//       // Test the connection with a simple query
//       await this.prisma.$queryRaw`SELECT 1`;
//       console.log('✅ Database connected successfully');
//     } catch (error) {
//       console.error('❌ Database connection failed:', error);
      
//       // More detailed error logging for debugging
//       if (process.env.NODE_ENV === 'development') {
//         console.error('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
//         console.error('Error details:', error);
//       }
      
//       // For serverless environments, don't exit the process
//       if (process.env.VERCEL) {
//         console.warn('⚠️ Database connection failed in serverless environment, continuing...');
//         // Don't throw error in serverless to allow app to start
//         return;
//       }
      
//       // For local development, exit on connection failure
//       throw error;
//     }
//   }

//   public async disconnect(): Promise<void> {
//     try {
//       await this.prisma.$disconnect();
//       console.log('✅ Database disconnected successfully');
//     } catch (error) {
//       console.error('❌ Database disconnection failed:', error);
//     }
//   }

//   public async healthCheck(): Promise<boolean> {
//     try {
//       await this.prisma.$queryRaw`SELECT 1`;
//       return true;
//     } catch (error) {
//       console.error('Database health check failed:', error);
//       return false;
//     }
//   }

//   // Method to ensure connection is ready (for serverless)
//   public async ensureConnection(): Promise<void> {
//     try {
//       await this.prisma.$connect();
//     } catch (error) {
//       console.error('Failed to ensure database connection:', error);
//       throw error;
//     }
//   }
// }

// export default Database;