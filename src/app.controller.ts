import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './auth/public.decorator';

@ApiTags('API Info')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'API Information and Documentation' })
  @ApiResponse({
    status: 200,
    description: 'Returns API information and documentation links',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        version: { type: 'string' },
        documentation: { type: 'string' },
        apiBaseUrl: { type: 'string' },
        endpoints: {
          type: 'object',
          properties: {
            stations: { type: 'string' },
            health: { type: 'string' },
            migration: { type: 'string' }
          }
        }
      }
    }
  })
  getApiInfo() {
    return {
      name: 'SkyTrack API',
      description: 'A comprehensive backend API for SkyTrack meteorological station management',
      version: '1.0.0',
      documentation: '/docs',
      apiBaseUrl: '/api',
      endpoints: {
        stations: '/api/stations',
        health: '/api/health',
        migration: '/api/migration'
      }
    };
  }
}