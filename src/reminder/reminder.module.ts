import { Module } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { ReminderController } from './reminder.controller';
import { TelegramService } from '../telegram/telegram.service';

@Module({
  providers: [ReminderService, TelegramService],
  controllers: [ReminderController],
  exports: [ReminderService],
})
export class ReminderModule {}
