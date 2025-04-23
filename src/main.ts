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

  // CORS configuration
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || [];
  logger.log(`Configuring CORS for: ${allowedOrigins.join(', ')}`);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        // Allow requests without an origin (e.g., Postman, curl)
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn(`Blocked by CORS: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Include OPTIONS for preflight
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'], // Ensure correct headers
    exposedHeaders: ['Authorization'], // Expose the Authorization header if needed
    credentials: true, // Allow credentials (cookies, headers) to be sent
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

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Start the server
  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`Server running on port ${port}`);
}
bootstrap();
