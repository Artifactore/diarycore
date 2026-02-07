import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { GoogleModule } from './google/google.module';
import { LlmModule } from './llm/llm.module';
import { ReminderModule } from './reminder/reminder.module';
import { PrismaModule } from './prisma/prisma.module';
import { TelegramService } from './telegram/telegram.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TelegramModule,
    GoogleModule,
    LlmModule,
    ReminderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(private readonly telegramService: TelegramService) {}

  async onModuleInit() {
    // Webhook will be registered after deployment
    // For now just log that the service is ready
    this.logger.log('AppModule initialized. Webhook registration available after deployment.');
  }
}
