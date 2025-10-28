import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { VercelRequest, VercelResponse } from '@vercel/node';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

// Cache the app instance for reuse across serverless invocations
let cachedApp: any = null;

async function getApp() {
  // Return cached instance if available
  if (cachedApp) {
    console.log('♻️  [VERCEL] Reusing cached NestJS app instance');
    return cachedApp;
  }

  console.log('🚀 [VERCEL] Building NestJS app instance...');

  // Set environment variable to indicate serverless environment
  process.env.IS_SERVERLESS = 'true';

  // Create NestJS app
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Cookie parser
  console.log('🍪 [VERCEL] Configuring cookie parser...');
  app.use(cookieParser());

  // class-validator DI
  console.log('🔧 [VERCEL] Configuring class-validator...');
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5173'];

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api', { exclude: ['/'] });

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('SkyTrack API')
    .setDescription('A comprehensive backend API for SkyTrack application')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    swaggerOptions: {
      persistAuthorization: true,
      cache: false, // 🔑 force Swagger to regenerate every time
    },
  });

  await app.init();

  console.log('✅ [VERCEL] NestJS application initialized successfully');

  // Get the adapter instance and cache it
  const expressApp = app.getHttpAdapter().getInstance();
  cachedApp = expressApp;

  return expressApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {

    const app = await getApp() as (req: VercelRequest, res: VercelResponse) => void;
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);

    // Ensure response hasn't been sent already
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}