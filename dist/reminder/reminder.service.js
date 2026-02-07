"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ReminderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const telegram_service_1 = require("../telegram/telegram.service");
let ReminderService = ReminderService_1 = class ReminderService {
    prisma;
    telegram;
    logger = new common_1.Logger(ReminderService_1.name);
    constructor(prisma, telegram) {
        this.prisma = prisma;
        this.telegram = telegram;
    }
    async createReminder(dto) {
        await this.prisma.reminder.create({
            data: {
                chat_id: dto.chatId,
                text: dto.text,
                trigger_at: dto.triggerAt,
            },
        });
        this.logger.log(`Reminder created for ${dto.triggerAt.toISOString()}`);
    }
    async processDueReminders() {
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
                await this.telegram.sendMessage(reminder.chat_id, `🔔 <b>Напоминание!</b>\n\n${reminder.text}\n\n<i>Мяу, не забудь! 🐱</i>`);
                await this.prisma.reminder.update({
                    where: { id: reminder.id },
                    data: { sent: true },
                });
                sentCount++;
                this.logger.log(`Reminder ${reminder.id} sent to ${reminder.chat_id}`);
            }
            catch (error) {
                this.logger.error(`Failed to send reminder ${reminder.id}: ${error.message}`);
            }
        }
        return sentCount;
    }
};
exports.ReminderService = ReminderService;
exports.ReminderService = ReminderService = ReminderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telegram_service_1.TelegramService])
], ReminderService);
//# sourceMappingURL=reminder.service.js.map