import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from './public.decorator';

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

  constructor(private reflector: Reflector) {
    console.log('🛡️ [JWT AUTH GUARD] JwtAuthGuard constructor called');
  }

  canActivate(context: ExecutionContext): boolean {
    console.log('🔍 [AUTH GUARD] canActivate called at:', new Date().toISOString());

    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      console.log('🔓 [AUTH GUARD] Public route detected, skipping authentication');
      return true;
    }

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

    const token = this.extractToken(request);
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

  private extractToken(request: Request): string | undefined {
    // Try Authorization header first (Bearer token)
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7); // Remove "Bearer " prefix
      console.log('🔑 [AUTH GUARD] Token found in Authorization header');
      return bearerToken;
    }

    // Fallback to cookies
    const cookieToken = request.cookies?.token;
    if (cookieToken) {
      console.log('🍪 [AUTH GUARD] Token found in cookies');
      return cookieToken;
    }

    console.log('❌ [AUTH GUARD] No token found in Authorization header or cookies');
    return undefined;
  }
}