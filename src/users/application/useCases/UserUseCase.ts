// import { IUserRepository } from '../../domain/repositories/IUserRepository';
// import { IPasswordService } from '../../domain/services/IPasswordService';
// import { User, CreateUserData, UpdateUserData, UserPublicData, UserRole } from '../../domain/entities/User';
// import { AuthUser } from '../../domain/entities/Auth';
// import { AppError } from '../errors/AppError';

// export class UserUseCase {
//   constructor(
//     private userRepository: IUserRepository,
//     private passwordService: IPasswordService
//   ) {}

//   async createUser(userData: CreateUserData, currentUser?: AuthUser): Promise<UserPublicData> {
//     // Only admins can create users, or if no current user (registration/seeding)
//     if (currentUser && currentUser.role !== UserRole.ADMIN) {
//       throw new AppError('Insufficient permissions to create users', 403);
//     }

//     // Check if user already exists
//     const existingUser = await this.userRepository.findByEmail(userData.email);
//     if (existingUser) {
//       throw new AppError('User with this email already exists', 409);
//     }

//     const existingUsername = await this.userRepository.findByUsername(userData.username);
//     if (existingUsername) {
//       throw new AppError('User with this username already exists', 409);
//     }

//     // Hash password
//     const hashedPassword = await this.passwordService.hash(userData.password);

//     const newUserData: CreateUserData = {
//       ...userData,
//       password: hashedPassword,
//       role: userData.role || UserRole.USER
//     };

//     const user = await this.userRepository.create(newUserData);
//     return this.toPublicData(user);
//   }

//   async getAllUsers(currentUser: AuthUser, skip = 0, take = 10): Promise<UserPublicData[]> {
//     // Only admins can see all users, regular users can only see themselves
//     if (currentUser.role !== UserRole.ADMIN) {
//       const user = await this.userRepository.findById(currentUser.id);
//       if (!user) {
//         throw new AppError('User not found', 404);
//       }
//       return [this.toPublicData(user)];
//     }

//     const users = await this.userRepository.findAll(skip, take);
//     return users.map(user => this.toPublicData(user));
//   }

//   async getUserById(id: string, currentUser: AuthUser): Promise<UserPublicData> {
//     const user = await this.userRepository.findById(id);
//     if (!user) {
//       throw new AppError('User not found', 404);
//     }

//     // Users can only access their own data unless they're admin
//     if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
//       throw new AppError('Access denied', 403);
//     }

//     return this.toPublicData(user);
//   }

//   async updateUser(id: string, userData: UpdateUserData, currentUser: AuthUser): Promise<UserPublicData> {
//     const existingUser = await this.userRepository.findById(id);
//     if (!existingUser) {
//       throw new AppError('User not found', 404);
//     }

//     // Users can only update their own data unless they're admin
//     if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
//       throw new AppError('Access denied', 403);
//     }

//     // Only admins can change roles
//     if (userData.role && currentUser.role !== UserRole.ADMIN) {
//       throw new AppError('Insufficient permissions to change user role', 403);
//     }

//     // Check for email conflicts
//     if (userData.email && userData.email !== existingUser.email) {
//       const emailExists = await this.userRepository.findByEmail(userData.email);
//       if (emailExists) {
//         throw new AppError('Email already in use', 409);
//       }
//     }

//     // Check for username conflicts
//     if (userData.username && userData.username !== existingUser.username) {
//       const usernameExists = await this.userRepository.findByUsername(userData.username);
//       if (usernameExists) {
//         throw new AppError('Username already in use', 409);
//       }
//     }

//     // Hash password if provided
//     const updateData: UpdateUserData = { ...userData };
//     if (userData.password) {
//       updateData.password = await this.passwordService.hash(userData.password);
//     }

//     const updatedUser = await this.userRepository.update(id, updateData);
//     return this.toPublicData(updatedUser);
//   }

//   async deleteUser(id: string, currentUser: AuthUser): Promise<void> {
//     // Only admins can delete users
//     if (currentUser.role !== UserRole.ADMIN) {
//       throw new AppError('Insufficient permissions to delete users', 403);
//     }

//     const existingUser = await this.userRepository.findById(id);
//     if (!existingUser) {
//       throw new AppError('User not found', 404);
//     }

//     // Prevent admin from deleting themselves
//     if (currentUser.id === id) {
//       throw new AppError('Cannot delete your own account', 400);
//     }

//     await this.userRepository.delete(id);
//   }

//   private toPublicData(user: User): UserPublicData {
//     return {
//       id: user.id,
//       email: user.email,
//       username: user.username,
//       role: user.role,
//       createdAt: user.createdAt,
//       updatedAt: user.updatedAt
//     };
//   }
// }