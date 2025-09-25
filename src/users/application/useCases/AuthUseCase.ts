// import { IUserRepository } from '../../domain/repositories/IUserRepository';
// import { IPasswordService } from '../../domain/services/IPasswordService';
// import { ITokenService } from '../../domain/services/ITokenService';
// import { LoginCredentials, AuthToken, AuthUser } from '../../domain/entities/Auth';
// import { AppError } from '../errors/AppError';

// export class AuthUseCase {
//   constructor(
//     private userRepository: IUserRepository,
//     private passwordService: IPasswordService,
//     private tokenService: ITokenService
//   ) {}

//   async login(credentials: LoginCredentials): Promise<AuthToken> {
//     const { email, password } = credentials;

//     // Find user by email
//     const user = await this.userRepository.findByEmail(email);
//     if (!user) {
//       throw new AppError('Invalid credentials', 401);
//     }

//     // Verify password
//     const isPasswordValid = await this.passwordService.compare(password, user.password);
//     if (!isPasswordValid) {
//       throw new AppError('Invalid credentials', 401);
//     }

//     // Generate token
//     const authUser: AuthUser = {
//       id: user.id,
//       email: user.email,
//       username: user.username,
//       role: user.role
//     };

//     return await this.tokenService.generateToken(authUser);
//   }

//   async validateToken(token: string): Promise<AuthUser> {
//     try {
//       const payload = await this.tokenService.verifyToken(token);
      
//       // Verify user still exists
//       const user = await this.userRepository.findById(payload.userId);
//       if (!user) {
//         throw new AppError('User not found', 404);
//       }

//       return {
//         id: user.id,
//         email: user.email,
//         username: user.username,
//         role: user.role
//       };
//     } catch (error) {
//       if (error instanceof AppError) {
//         throw error;
//       }
//       throw new AppError('Invalid or expired token', 401);
//     }
//   }
// }