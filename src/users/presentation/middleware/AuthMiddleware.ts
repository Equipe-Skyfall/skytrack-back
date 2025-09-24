// import { Request, Response, NextFunction } from 'express';
// import { AuthUseCase } from '../../application/useCases/AuthUseCase';
// import { UserRole } from '../../domain/entities/User';
// import { AuthUser } from '../../domain/entities/Auth';
// import { AppError } from '../../application/errors/AppError';

// // Extend Express Request type to include user
// declare global {
//   namespace Express {
//     interface Request {
//       user?: AuthUser;
//     }
//   }
// }

// export class AuthMiddleware {
//   constructor(private authUseCase: AuthUseCase) {}

//   authenticate = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       let token: string | undefined;

//       // Check for JWT in Authorization header (Bearer token)
//       const authHeader = req.headers.authorization;
//       if (authHeader && authHeader.startsWith('Bearer ')) {
//         token = authHeader.substring(7);
//       }

//       // If no Bearer token, check for JWT in cookies
//       if (!token && req.cookies.token) {
//         token = req.cookies.token;
//       }

//       if (!token) {
//         throw new AppError('Authentication token required', 401);
//       }

//       // Validate token and get user
//       const user = await this.authUseCase.validateToken(token);
//       req.user = user;
      
//       next();
//     } catch (error) {
//       if (error instanceof AppError) {
//         return res.status(error.statusCode).json({
//           success: false,
//           message: error.message
//         });
//       }
      
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid or expired token'
//       });
//     }
//   };

//   authorize = (roles: UserRole[]) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//       if (!req.user) {
//         return res.status(401).json({
//           success: false,
//           message: 'Authentication required'
//         });
//       }

//       if (!roles.includes(req.user.role)) {
//         return res.status(403).json({
//           success: false,
//           message: 'Insufficient permissions'
//         });
//       }

//       next();
//     };
//   };
// }