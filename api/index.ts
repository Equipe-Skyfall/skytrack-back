import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { VercelRequest, VercelResponse } from '@vercel/node';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/auth/auth.guard';

let cachedApp: any = null;

async function getApp() {
  if (!cachedApp) {
    console.log('🚀 [VERCEL] Starting Vercel serverless function...');

    // Set environment variable to indicate serverless environment
    process.env.IS_SERVERLESS = 'true';

    // Create NestJS app without custom Express adapter
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    // Configure cookie parser
    console.log('🍪 [VERCEL] Configuring cookie parser...');
    app.use(cookieParser());

    // Configure class-validator to use NestJS dependency injection
    console.log('🔧 [VERCEL] Configuring class-validator...');
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    // Global authentication guard
    console.log('🛡️ [VERCEL] Registering global auth guard...');
    const authGuard = new JwtAuthGuard();
    console.log('🛡️ [VERCEL] Auth guard instance created:', !!authGuard);
    app.useGlobalGuards(authGuard);
    console.log('🛡️ [VERCEL] Global auth guard registered successfully');

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // CORS configuration
    console.log('🌐 [VERCEL] Configuring CORS with credentials enabled...');
    const corsOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:5173']; // fallback for development

    console.log('🌐 [VERCEL] CORS origins:', corsOrigins);
    app.enableCors({
      origin: corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true,
    });

    // Global prefix for API routes (excluding root route)
    app.setGlobalPrefix('api', {
      exclude: ['/'],
    });

    // Swagger configuration (after global prefix so it reflects the correct paths)
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
      },
    });

    await app.init();
    console.log('✅ [VERCEL] NestJS application initialized successfully');
    console.log('🛡️ [VERCEL] Authentication guard is active and protecting all routes');

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