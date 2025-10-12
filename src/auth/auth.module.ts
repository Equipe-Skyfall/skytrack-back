import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './auth.guard';

@Module({
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {
  constructor() {
    console.log('🔐 [AUTH MODULE] AuthModule instantiated');
  }
}