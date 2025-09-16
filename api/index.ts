import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { AppModule } from '../src/app.module';

let cachedApp: any = null;

async function getApp() {
  if (!cachedApp) {
    // Set environment variable to indicate serverless environment
    process.env.IS_SERVERLESS = 'true';

    // Create NestJS app without custom Express adapter
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // CORS configuration
    app.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: false,
    });

    // Global prefix for API routes
    app.setGlobalPrefix('api');

    // Swagger configuration
    const config = new DocumentBuilder()
      .setTitle('SkyTrack API')
      .setDescription('A comprehensive backend API for SkyTrack application')
      .setVersion('1.0.0')
      .addServer('https://am-6r0tigshm-fabios-projects-ee9987e5.vercel.app', 'Production server (Vercel)')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);

    // Ensure response hasn't been sent already
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}