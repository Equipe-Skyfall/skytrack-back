// import jwt from 'jsonwebtoken';
// import { ITokenService } from '../../domain/services/ITokenService';
// import { AuthToken, TokenPayload, AuthUser } from '../../domain/entities/Auth';

// export class TokenService implements ITokenService {
//   private readonly secret: string;
//   private readonly expiresIn: string;

//   constructor(secret: string, expiresIn = '24h') {
//     this.secret = secret;
//     this.expiresIn = expiresIn;
//   }

//   async generateToken(user: AuthUser): Promise<AuthToken> {
//     const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
//       userId: user.id,
//       email: user.email,
//       username: user.username,
//       role: user.role
//     };

//     // Fix: Use proper type casting and options object
//     const token = jwt.sign(
//       payload,
//       this.secret,
//       { expiresIn: this.expiresIn } as jwt.SignOptions
//     );
    
//     // Calculate expiration date
//     const decoded = jwt.decode(token) as jwt.JwtPayload;
//     const expiresAt = new Date((decoded?.exp || 0) * 1000);

//     return { token, expiresAt };
//   }

//   async verifyToken(token: string): Promise<TokenPayload> {
//     return new Promise((resolve, reject) => {
//       jwt.verify(token, this.secret, (error: jwt.VerifyErrors | null, decoded: any) => {
//         if (error) {
//           reject(error);
//         } else {
//           resolve(decoded as TokenPayload);
//         }
//       });
//     });
//   }

//   decodeToken(token: string): TokenPayload | null {
//     try {
//       const decoded = jwt.decode(token);
//       return decoded as TokenPayload;
//     } catch {
//       return null;
//     }
//   }
// }