// import { PrismaClient, Role as PrismaRole } from '@prisma/client';
// import { IUserRepository } from '../../domain/repositories/IUserRepository';
// import { User, CreateUserData, UpdateUserData, UserRole } from '../../domain/entities/User';

// export class UserRepository implements IUserRepository {
//   constructor(private prisma: PrismaClient) {}

//   // Helper method to convert Prisma user to domain user
//   private toDomainUser(prismaUser: any): User {
//     return {
//       id: prismaUser.id,
//       email: prismaUser.email,
//       username: prismaUser.username,
//       password: prismaUser.password,
//       role: prismaUser.role as UserRole, // Type conversion
//       createdAt: prismaUser.createdAt,
//       updatedAt: prismaUser.updatedAt
//     };
//   }

//   // Helper method to convert domain role to Prisma role
//   private toPrismaRole(role: UserRole): PrismaRole {
//     return role as PrismaRole;
//   }

//   async create(userData: CreateUserData): Promise<User> {
//     const prismaUser = await this.prisma.user.create({
//       data: {
//         ...userData,
//         role: userData.role ? this.toPrismaRole(userData.role) : PrismaRole.USER
//       }
//     });
//     return this.toDomainUser(prismaUser);
//   }

//   async findById(id: string): Promise<User | null> {
//     const prismaUser = await this.prisma.user.findUnique({
//       where: { id }
//     });
//     return prismaUser ? this.toDomainUser(prismaUser) : null;
//   }

//   async findByEmail(email: string): Promise<User | null> {
//     const prismaUser = await this.prisma.user.findUnique({
//       where: { email }
//     });
//     return prismaUser ? this.toDomainUser(prismaUser) : null;
//   }

//   async findByUsername(username: string): Promise<User | null> {
//     const prismaUser = await this.prisma.user.findUnique({
//       where: { username }
//     });
//     return prismaUser ? this.toDomainUser(prismaUser) : null;
//   }

//   async findAll(skip = 0, take = 10): Promise<User[]> {
//     const prismaUsers = await this.prisma.user.findMany({
//       skip,
//       take,
//       orderBy: { createdAt: 'desc' }
//     });
//     return prismaUsers.map(user => this.toDomainUser(user));
//   }

//   async update(id: string, userData: UpdateUserData): Promise<User> {
//     const updateData: any = { ...userData };
//     if (userData.role) {
//       updateData.role = this.toPrismaRole(userData.role);
//     }

//     const prismaUser = await this.prisma.user.update({
//       where: { id },
//       data: updateData
//     });
//     return this.toDomainUser(prismaUser);
//   }

//   async delete(id: string): Promise<void> {
//     await this.prisma.user.delete({
//       where: { id }
//     });
//   }

//   async exists(email: string, username: string): Promise<boolean> {
//     const user = await this.prisma.user.findFirst({
//       where: {
//         OR: [
//           { email },
//           { username }
//         ]
//       }
//     });
//     return !!user;
//   }

//   async count(): Promise<number> {
//     return await this.prisma.user.count();
//   }
// }