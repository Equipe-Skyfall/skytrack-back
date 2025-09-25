// import { PrismaClient } from '@prisma/client';

// // Domain
// import { IUserRepository } from '../../domain/repositories/IUserRepository';
// import { IPasswordService } from '../../domain/services/IPasswordService';
// import { ITokenService } from '../../domain/services/ITokenService';

// // Infrastructure
// import { UserRepository } from '../repositories/UserRepository';
// import { PasswordService } from '../services/PasswordService';
// import { TokenService } from '../services/TokenService';

// // Application
// import { AuthUseCase } from '../../application/useCases/AuthUseCase';
// import { UserUseCase } from '../../application/useCases/UserUseCase';

// // Presentation
// import { AuthController } from '../../presentation/controllers/AuthController';
// import { UserController } from '../../presentation/controllers/UserController';

// import Database from '../database/connection';
// import { UserSeeder } from '../database/seeders/UserSeeder';
// import { AuthMiddleware } from '../../presentation/middleware/AuthMiddleware';
// import { AuthRoutes } from '../../presentation/routes/AuthRoutes';
// import { UserRoutes } from '../../presentation/routes/UserRoutes';

// export class Container {
//   private static instance: Container;
//   private prisma!: PrismaClient;

//   // Services
//   public passwordService!: IPasswordService;
//   public tokenService!: ITokenService;

//   // Repositories
//   public userRepository!: IUserRepository;

//   // Use Cases
//   public authUseCase!: AuthUseCase;
//   public userUseCase!: UserUseCase;

//   // Controllers
//   public authController!: AuthController;
//   public userController!: UserController;

//   // Middleware
//   public authMiddleware!: AuthMiddleware;

//   // Routes
//   public authRoutes!: AuthRoutes;
//   public userRoutes!: UserRoutes;

//   // Seeders
//   public userSeeder!: UserSeeder;

//   private constructor() {
//     this.initializeDependencies();
//   }

//   public static getInstance(): Container {
//     if (!Container.instance) {
//       Container.instance = new Container();
//     }
//     return Container.instance;
//   }

//   private initializeDependencies(): void {
//     // Database
//     this.prisma = Database.getInstance().getClient();

//     // Services
//     this.passwordService = new PasswordService(
//       parseInt(process.env.BCRYPT_ROUNDS || '12')
//     );
//     this.tokenService = new TokenService(
//       process.env.JWT_SECRET || 'default-secret',
//       process.env.JWT_EXPIRES_IN || '24h'
//     );

//     // Repositories
//     this.userRepository = new UserRepository(this.prisma);

//     // Use Cases
//     this.authUseCase = new AuthUseCase(
//       this.userRepository,
//       this.passwordService,
//       this.tokenService
//     );
//     this.userUseCase = new UserUseCase(
//       this.userRepository,
//       this.passwordService
//     );

//     // Controllers
//     this.authController = new AuthController(this.authUseCase);
//     this.userController = new UserController(this.userUseCase);

//     // Middleware
//     this.authMiddleware = new AuthMiddleware(this.authUseCase);

//     // Routes
//     this.authRoutes = new AuthRoutes(this.authController, this.authMiddleware);
//     this.userRoutes = new UserRoutes(this.userController, this.authMiddleware);

//     // Seeders
//     this.userSeeder = new UserSeeder(this.prisma);
//   }

//   public async initializeDatabase(): Promise<void> {
//     try {
//       await Database.getInstance().connect();
//       console.log('🌱 Starting database initialization...');
      
//       // Only run seeding if database connection is successful
//       const isHealthy = await this.checkDatabaseHealth();
//       if (isHealthy) {
//         await this.userSeeder.seedDefaultUsers();
//         console.log('✅ Database initialization completed');
//       } else {
//         console.warn('⚠️ Database unhealthy, skipping seeding');
//       }
//     } catch (error) {
//       console.error('❌ Database initialization failed:', error);
      
//       // In serverless environments, don't throw - allow app to start
//       if (process.env.VERCEL) {
//         console.warn('⚠️ Continuing without database initialization in serverless environment');
//         return;
//       }
      
//       // In local development, throw the error
//       throw error;
//     }
//   }

//   public async cleanup(): Promise<void> {
//     await Database.getInstance().disconnect();
//   }

//   // Public method to access Prisma client for health checks
//   public getPrismaClient(): PrismaClient {
//     return this.prisma;
//   }

//   // Enhanced health check with better error handling
//   public async checkDatabaseHealth(): Promise<boolean> {
//     try {
//       await this.prisma.$queryRaw`SELECT 1`;
//       return true;
//     } catch (error) {
//       console.error('Database health check failed:', error);
      
//       // Log specific connection errors
//       if (error instanceof Error) {
//         if (error.message.includes('Can\'t reach database server')) {
//           console.error('🔌 Database server is unreachable. Check your DATABASE_URL and network connection.');
//         } else if (error.message.includes('authentication failed')) {
//           console.error('🔐 Database authentication failed. Check your credentials.');
//         } else if (error.message.includes('database does not exist')) {
//           console.error('🗄️ Database does not exist. Make sure to create the database first.');
//         }
//       }
      
//       return false;
//     }
//   }
// }