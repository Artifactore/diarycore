import { Module } from '@nestjs/common';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { MessageHandlerService } from './message-handler.service';
import { LlmModule } from '../llm/llm.module';
import { GoogleModule } from '../google/google.module';
import { ReminderModule } from '../reminder/reminder.module';

@Module({
  imports: [LlmModule, GoogleModule, ReminderModule],
  controllers: [TelegramController],
  providers: [TelegramService, MessageHandlerService],
  exports: [TelegramService],
})
export class TelegramModule {}
