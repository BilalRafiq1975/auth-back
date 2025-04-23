import { config } from 'dotenv';
config(); // Load .env variables

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import helmet from 'helmet';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const reflector = app.get(Reflector);

  // Use JWT Guard globally
  app.useGlobalGuards(new JwtAuthGuard(reflector));


  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];

  logger.log(`Configuring CORS for: ${allowedOrigins.join(', ')}`);

  // Configure secure and flexible CORS
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow Postman or server-side requests

      try {
        const hostname = new URL(origin).hostname;
        const isAllowed = allowedOrigins.some((o) => new URL(o).hostname === hostname);
        return isAllowed ? callback(null, true) : callback(new Error('Not allowed by CORS'));
      } catch (err) {
        return callback(new Error('Invalid Origin'));
      }
    },
    credentials: true,
    methods: process.env.CORS_METHODS?.split(',') || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: process.env.CORS_HEADERS?.split(',') || [
      'Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'
    ],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 3600,
  });

  // Secure headers via Helmet
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginEmbedderPolicy: false,
  }));

  // Request validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Start server
  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 Server running on port ${port}`);
}
bootstrap();
