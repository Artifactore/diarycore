import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
export interface CreateReminderDto {
    chatId: bigint;
    text: string;
    triggerAt: Date;
}
export declare class ReminderService {
    private prisma;
    private telegram;
    private readonly logger;
    constructor(prisma: PrismaService, telegram: TelegramService);
    createReminder(dto: CreateReminderDto): Promise<void>;
    processDueReminders(): Promise<number>;
}
