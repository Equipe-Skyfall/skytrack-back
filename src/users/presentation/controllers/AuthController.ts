// import { Request, Response, NextFunction } from 'express';
// import { AuthUseCase } from '../../application/useCases/AuthUseCase';
// import { LoginCredentials } from '../../domain/entities/Auth';

// export class AuthController {
//   constructor(private authUseCase: AuthUseCase) {}

//   login = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const credentials: LoginCredentials = req.body;
//       const authToken = await this.authUseCase.login(credentials);

//       // Set JWT in cookie
//       res.cookie('token', authToken.token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         expires: authToken.expiresAt
//       });

//       res.status(200).json({
//         success: true,
//         message: 'Login successful',
//         data: {
//           token: authToken.token,
//           expiresAt: authToken.expiresAt
//         }
//       });
//     } catch (error) {
//       // Pass error to Express error handler middleware
//       next(error);
//     }
//   };

//   logout = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // Clear the JWT cookie
//       res.clearCookie('token');

//       res.status(200).json({
//         success: true,
//         message: 'Logout successful'
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   profile = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       res.status(200).json({
//         success: true,
//         message: 'Profile retrieved successfully',
//         data: req.user
//       });
//     } catch (error) {
//       next(error);
//     }
//   };
// }