import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';

export interface CreateReminderDto {
  chatId: bigint;
  text: string;
  triggerAt: Date;
}

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private prisma: PrismaService,
    private telegram: TelegramService,
  ) {}

  async createReminder(dto: CreateReminderDto): Promise<void> {
    await this.prisma.reminder.create({
      data: {
        chat_id: dto.chatId,
        text: dto.text,
        trigger_at: dto.triggerAt,
      },
    });
    this.logger.log(`Reminder created for ${dto.triggerAt.toISOString()}`);
  }

  async processDueReminders(): Promise<number> {
    const now = new Date();
    
    const dueReminders = await this.prisma.reminder.findMany({
      where: {
        sent: false,
        trigger_at: { lte: now },
      },
    });

    this.logger.log(`Found ${dueReminders.length} due reminders`);

    let sentCount = 0;
    for (const reminder of dueReminders) {
      try {
        await this.telegram.sendMessage(
          reminder.chat_id,
          `🔔 <b>Напоминание!</b>\n\n${reminder.text}\n\n<i>Мяу, не забудь! 🐱</i>`,
        );
        
        await this.prisma.reminder.update({
          where: { id: reminder.id },
          data: { sent: true },
        });
        
        sentCount++;
        this.logger.log(`Reminder ${reminder.id} sent to ${reminder.chat_id}`);
      } catch (error) {
        this.logger.error(`Failed to send reminder ${reminder.id}: ${error.message}`);
      }
    }

    return sentCount;
  }
}
