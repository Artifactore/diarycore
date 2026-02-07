import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();

  // Swagger setup with cache prevention
  const swaggerPath = 'api-docs';
  app.use(`/${swaggerPath}`, (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('Artur Diary Bot API')
    .setDescription('Personal diary Telegram bot API for workouts and notes')
    .setVersion('1.0')
    .addTag('telegram', 'Telegram webhook endpoints')
    .addTag('reminders', 'Reminder management')
    .addTag('health', 'Health check')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document, {
    customSiteTitle: 'Artur Diary Bot API',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { font-size: 2rem; color: #2d3748; }
      .swagger-ui .info { margin-bottom: 2rem; }
    `,
  });

  await app.listen(3000);
  logger.log('Application running on port 3000');
  logger.log('Swagger docs available at /api-docs');
}
bootstrap();
