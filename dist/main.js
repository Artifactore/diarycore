"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
    app.enableCors();
    const swaggerPath = 'api-docs';
    app.use(`/${swaggerPath}`, (req, res, next) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
        next();
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Artur Diary Bot API')
        .setDescription('Personal diary Telegram bot API for workouts and notes')
        .setVersion('1.0')
        .addTag('telegram', 'Telegram webhook endpoints')
        .addTag('reminders', 'Reminder management')
        .addTag('health', 'Health check')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup(swaggerPath, app, document, {
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
//# sourceMappingURL=main.js.map