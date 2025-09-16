import { Injectable } from '@nestjs/common';
import { HealthCheckDto } from './dto/health-check.dto';

@Injectable()
export class HealthService {
  getHealth(): HealthCheckDto {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    };
  }
}