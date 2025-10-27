import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { VercelRequest, VercelResponse } from '@vercel/node';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

let cachedApp: any = null;

async function getApp() {
  // 🔁 Force rebuild on cold start or when a new deployment happens
  if (!cachedApp || process.env.NODE_ENV !== 'production') {
    console.log('🚀 [VERCEL] Building a fresh NestJS app instance...');

    process.env.IS_SERVERLESS = 'true';

    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    app.use(cookieParser());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const corsOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
      : ['http://localhost:5173'];

    app.enableCors({
      origin: corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true,
    });

    app.setGlobalPrefix('api', { exclude: ['/'] });

    const config = new DocumentBuilder()
      .setTitle('SkyTrack API')
      .setDescription('A comprehensive backend API for SkyTrack application')
      .setVersion('1.0.0')
      .build();

    // 🧠 Rebuild Swagger docs every time app is (re)initialized
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      customCssUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
      swaggerOptions: {
        persistAuthorization: true,
        cache: false, // 🚀 force Swagger to regenerate docs
      },
    });

    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }

  return cachedApp;
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