import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/auth.guard';

async function bootstrap() {
  console.log('🚀 [BOOTSTRAP] Starting application...');
  const app = await NestFactory.create(AppModule);

  // Configure cookie parser
  console.log('🍪 [BOOTSTRAP] Configuring cookie parser...');
  app.use(cookieParser());

  // Configure class-validator to use NestJS dependency injection
  console.log('🔧 [BOOTSTRAP] Configuring class-validator...');
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Global authentication guard
  console.log('🛡️ [BOOTSTRAP] Registering global auth guard...');
  const authGuard = new JwtAuthGuard();
  console.log('🛡️ [BOOTSTRAP] Auth guard instance created:', !!authGuard);
  app.useGlobalGuards(authGuard);
  console.log('🛡️ [BOOTSTRAP] Global auth guard registered successfully');

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS configuration
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5173']; // fallback for development

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('SkyTrack API')
    .setDescription('A comprehensive backend API for SkyTrack application')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 [BOOTSTRAP] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
  console.log(`📚 [BOOTSTRAP] API Documentation available at http://localhost:${port}/api-docs`);
  console.log(`🛡️ [BOOTSTRAP] Authentication guard is active and protecting all routes`);
}

bootstrap();