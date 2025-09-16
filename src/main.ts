import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    .addServer(`http://localhost:${process.env.PORT || 3000}`, 'Development server')
    .addServer('https://am-6r0tigshm-fabios-projects-ee9987e5.vercel.app', 'Production server (Vercel)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api-docs`);
}

bootstrap();