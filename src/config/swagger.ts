import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SkyTrack Backend API',
      version: '1.0.0',
      description: 'A comprehensive backend API for SkyTrack application',
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.apiPrefix}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
            status: {
              type: 'number',
              description: 'HTTP status code',
            },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['OK'],
              description: 'Service status',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Current timestamp',
            },
            uptime: {
              type: 'number',
              description: 'Process uptime in seconds',
            },
            version: {
              type: 'string',
              description: 'API version',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);