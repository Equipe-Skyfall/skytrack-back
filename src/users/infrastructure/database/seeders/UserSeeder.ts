// import { PrismaClient, Role as PrismaRole } from '@prisma/client';
// import { UserRole } from '../../../domain/entities/User';
// import { PasswordService } from '../../services/PasswordService';

// export class UserSeeder {
//   private prisma: PrismaClient;
//   private passwordService: PasswordService;

//   constructor(prisma: PrismaClient) {
//     this.prisma = prisma;
//     this.passwordService = new PasswordService();
//   }

//   async seedDefaultUsers(): Promise<void> {
//     console.log('🌱 Seeding default users...');

//     const defaultUsers = [
//       {
//         email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
//         username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
//         password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
//         role: PrismaRole.ADMIN // Use Prisma enum directly
//       },
//       {
//         email: process.env.DEFAULT_USER_EMAIL || 'user@example.com',
//         username: process.env.DEFAULT_USER_USERNAME || 'user',
//         password: process.env.DEFAULT_USER_PASSWORD || 'user123',
//         role: PrismaRole.USER // Use Prisma enum directly
//       }
//     ];

//     for (const userData of defaultUsers) {
//       try {
//         // Check if user already exists
//         const existingUser = await this.prisma.user.findFirst({
//           where: {
//             OR: [
//               { email: userData.email },
//               { username: userData.username }
//             ]
//           }
//         });

//         if (!existingUser) {
//           const hashedPassword = await this.passwordService.hash(userData.password);
          
//           await this.prisma.user.create({
//             data: {
//               email: userData.email,
//               username: userData.username,
//               password: hashedPassword,
//               role: userData.role
//             }
//           });

//           console.log(`✅ Created default ${userData.role.toLowerCase()} user: ${userData.email}`);
//         } else {
//           console.log(`ℹ️  User already exists: ${userData.email}`);
//         }
//       } catch (error) {
//         console.error(`❌ Failed to create user ${userData.email}:`, error);
//       }
//     }

//     console.log('✅ Default users seeding completed');
//   }
// }