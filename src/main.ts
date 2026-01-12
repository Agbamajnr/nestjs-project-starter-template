import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { CURRENT_APP_VERSION, SERVER_PORT } from './config/env.config';
import { Transport } from '@nestjs/microservices';
import { REDIS_DB_CONFIG } from './config/env.config';
import compression from 'compression';
import { webcrypto } from 'node:crypto';
import { logger } from './common/helpers/logger.lib';
import { AllExceptionsFilter } from './common/filters/all-http-exceptions.filter';
import { initializeTransactionalContext } from 'typeorm-transactional';

// Polyfill crypto for Node.js environments
if (typeof global.crypto === 'undefined') {
  (global as any).crypto = webcrypto;
}

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule);

  // Redis Microservice Connection
  app.connectMicroservice({
    transport: Transport.REDIS,
    options: REDIS_DB_CONFIG,
  });
  await app.startAllMicroservices();

  // Security Headers
  app.use(helmet());

  // Cookie Parser
  app.use(cookieParser());

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS (Restrict in production)
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.setGlobalPrefix(`/api/${CURRENT_APP_VERSION}`);
  app.use(helmet());
  app.use(compression());

  app.useGlobalFilters(new AllExceptionsFilter());

  const PORT = SERVER_PORT;
  await app
    .listen(PORT)
    .then(() => {
      logger().log(`Listening on port ${PORT}`);
    })
    .catch((error) => {
      logger().error(`Error listening on ${PORT} %o`, error);
    });
}
bootstrap();
