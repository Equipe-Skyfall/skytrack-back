import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SkyTrack API',
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
            code: {
              type: 'string',
              description: 'Error code',
            },
          },
        },
        HealthStatus: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Health status',
              example: 'OK',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of the health check',
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
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Health status',
              example: 'OK',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of the health check',
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
        ApiError: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
            code: {
              type: 'string',
              description: 'Error code',
            },
            details: {
              type: 'object',
              description: 'Additional error details',
            },
          },
        },
        Station: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the station',
            },
            name: {
              type: 'string',
              description: 'Station name',
              minLength: 1,
              maxLength: 100,
            },
            latitude: {
              type: 'number',
              minimum: -90,
              maximum: 90,
              description: 'Station latitude',
            },
            longitude: {
              type: 'number',
              minimum: -180,
              maximum: 180,
              description: 'Station longitude',
            },
            address: {
              type: 'string',
              description: 'Station address',
              maxLength: 255,
              nullable: true,
            },
            description: {
              type: 'string',
              description: 'Station description',
              maxLength: 500,
              nullable: true,
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE'],
              description: 'Station status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        CreateStationRequest: {
          type: 'object',
          required: ['name', 'latitude', 'longitude'],
          properties: {
            name: {
              type: 'string',
              description: 'Station name',
              minLength: 1,
              maxLength: 100,
            },
            latitude: {
              type: 'number',
              minimum: -90,
              maximum: 90,
              description: 'Station latitude',
            },
            longitude: {
              type: 'number',
              minimum: -180,
              maximum: 180,
              description: 'Station longitude',
            },
            address: {
              type: 'string',
              description: 'Station address',
              maxLength: 255,
            },
            description: {
              type: 'string',
              description: 'Station description',
              maxLength: 500,
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE'],
              description: 'Station status',
              default: 'ACTIVE',
            },
          },
        },
        UpdateStationRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Station name',
              minLength: 1,
              maxLength: 100,
            },
            latitude: {
              type: 'number',
              minimum: -90,
              maximum: 90,
              description: 'Station latitude',
            },
            longitude: {
              type: 'number',
              minimum: -180,
              maximum: 180,
              description: 'Station longitude',
            },
            address: {
              type: 'string',
              description: 'Station address',
              maxLength: 255,
            },
            description: {
              type: 'string',
              description: 'Station description',
              maxLength: 500,
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE'],
              description: 'Station status',
            },
          },
        },
        StationsListResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Station',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'number',
                  description: 'Current page number',
                },
                limit: {
                  type: 'number',
                  description: 'Items per page',
                },
                total: {
                  type: 'number',
                  description: 'Total number of items',
                },
                totalPages: {
                  type: 'number',
                  description: 'Total number of pages',
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

let cachedSwaggerSpec: any = null;

export const swaggerSpec = (() => {
  if (!cachedSwaggerSpec) {
    cachedSwaggerSpec = swaggerJsdoc(options);
  }
  return cachedSwaggerSpec;
})();