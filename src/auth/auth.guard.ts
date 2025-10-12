import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwtSecret = 'fycknudiasdnoasdericdahgayasodp';

  constructor() {
    console.log('🛡️ [JWT AUTH GUARD] JwtAuthGuard constructor called');
  }

  canActivate(context: ExecutionContext): boolean {
    console.log('🔍 [AUTH GUARD] canActivate called at:', new Date().toISOString());

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    console.log('🔍 [AUTH GUARD] Request details:', {
      url: request.url,
      method: request.method,
      headers: {
        cookie: request.headers.cookie ? 'Present' : 'Missing',
        authorization: request.headers.authorization ? 'Present' : 'Missing'
      }
    });

    console.log('🔍 [AUTH GUARD] Raw cookies:', request.cookies);

    const token = this.extractTokenFromCookies(request);
    console.log('🔍 [AUTH GUARD] Token extracted:', token ? 'Present' : 'Missing');

    if (!token) {
      console.log('❌ [AUTH GUARD] No token found, returning 401');
      throw new UnauthorizedException('Authentication token required');
    }

    try {
      const payload = jwt.verify(token, this.jwtSecret) as JwtPayload;
      request.user = payload;
      console.log('✅ [AUTH GUARD] Authentication successful for user:', payload.username);
      return true;
    } catch (error) {
      console.log('❌ [AUTH GUARD] Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromCookies(request: Request): string | undefined {
    // Extract token from cookies
    const token = request.cookies?.token;
    return token;
  }
}