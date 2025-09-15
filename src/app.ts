import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { swaggerSpec } from './config/swagger';
import createRoutes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { createDependencies } from './composition-root';

export async function createApp() {
  try {
    // Initialize dependencies (database connection and wiring)
    const dependencies = await createDependencies();

    const app = express();

    // CORS configuration - allowing all origins for development
    app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: false
    }));

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Swagger UI setup
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // API routes
    app.use(config.apiPrefix, createRoutes(dependencies));

    // Error handling
    app.use(notFound);
    app.use(errorHandler);

    return app;
  } catch (error) {
    console.error('Failed to create app:', error);
    throw error;
  }
}