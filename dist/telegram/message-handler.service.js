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
var MessageHandlerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageHandlerService = void 0;
const common_1 = require("@nestjs/common");
const telegram_service_1 = require("./telegram.service");
const llm_service_1 = require("../llm/llm.service");
const transcription_service_1 = require("../llm/transcription.service");
const sheets_service_1 = require("../google/sheets.service");
const docs_service_1 = require("../google/docs.service");
const reminder_service_1 = require("../reminder/reminder.service");
let MessageHandlerService = MessageHandlerService_1 = class MessageHandlerService {
    telegram;
    llm;
    transcription;
    sheets;
    docs;
    reminders;
    logger = new common_1.Logger(MessageHandlerService_1.name);
    constructor(telegram, llm, transcription, sheets, docs, reminders) {
        this.telegram = telegram;
        this.llm = llm;
        this.transcription = transcription;
        this.sheets = sheets;
        this.docs = docs;
        this.reminders = reminders;
    }
    async handleUpdate(update) {
        const message = update.message;
        if (!message)
            return;
        const chatId = message.chat.id;
        let text = message.text || '';
        if (message.voice) {
            this.logger.log('Processing voice message...');
            try {
                const { fileUrl } = await this.telegram.getFile(message.voice.file_id);
                const audioBuffer = await this.telegram.downloadFile(fileUrl);
                text = await this.transcription.transcribe(audioBuffer);
                this.logger.log(`Transcribed: ${text}`);
            }
            catch (error) {
                this.logger.error(`Transcription failed: ${error.message}`);
                await this.telegram.sendMessage(chatId, 'Мяу, не смог разобрать голосовое сообщение 🙀 Попробуй ещё раз или напиши текстом.');
                return;
            }
        }
        if (!text) {
            await this.telegram.sendMessage(chatId, 'Пришли мне текст или голосовое сообщение, и я помогу записать! 🐱');
            return;
        }
        try {
            const parsed = await this.llm.parseMessage(text);
            this.logger.log(`Parsed: ${JSON.stringify(parsed)}`);
            await this.processIntent(chatId, parsed);
        }
        catch (error) {
            this.logger.error(`LLM processing failed: ${error.message}`);
            await this.telegram.sendMessage(chatId, 'Что-то пошло не так при обработке сообщения 😿 Попробуй переформулировать.');
        }
    }
    async processIntent(chatId, parsed) {
        const { intent, data, response, needsClarification } = parsed;
        if (needsClarification) {
            await this.telegram.sendMessage(chatId, response);
            return;
        }
        switch (intent) {
            case 'workout':
                await this.saveWorkout(chatId, data, response);
                break;
            case 'note':
                await this.saveNote(chatId, data, response);
                break;
            case 'detailed_note':
                await this.saveDetailedNote(chatId, data, response);
                break;
            case 'reminder':
                await this.saveReminder(chatId, data, response);
                break;
            case 'question':
            case 'greeting':
            default:
                await this.telegram.sendMessage(chatId, response);
                break;
        }
    }
    async saveWorkout(chatId, data, response) {
        try {
            await this.sheets.appendWorkout({
                date: data.date || new Date().toLocaleDateString('ru-RU'),
                exercise: data.exercise,
                muscleGroup: data.muscleGroup,
                sets: data.sets,
                reps: data.reps,
                weight: data.weight,
                comment: data.comment || '',
            });
            await this.telegram.sendMessage(chatId, response);
        }
        catch (error) {
            this.logger.error(`Failed to save workout: ${error.message}`);
            await this.telegram.sendMessage(chatId, 'Мяу, записал в голове, но Google Sheets сейчас недоступен 😿 Попробуй позже.');
        }
    }
    async saveNote(chatId, data, response) {
        try {
            await this.sheets.appendNote({
                date: data.date || new Date().toLocaleDateString('ru-RU'),
                time: data.time || new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                note: data.text,
            });
            await this.telegram.sendMessage(chatId, response);
        }
        catch (error) {
            this.logger.error(`Failed to save note: ${error.message}`);
            await this.telegram.sendMessage(chatId, 'Мяу, не смог сохранить заметку в таблицу 😿');
        }
    }
    async saveDetailedNote(chatId, data, response) {
        try {
            const dateStr = data.date || new Date().toLocaleDateString('ru-RU');
            await this.docs.appendNote(dateStr, data.text);
            await this.telegram.sendMessage(chatId, response);
        }
        catch (error) {
            this.logger.error(`Failed to save detailed note: ${error.message}`);
            await this.telegram.sendMessage(chatId, 'Мяу, Google Docs не отвечает 😿 Твои мысли важны, попробуй позже!');
        }
    }
    async saveReminder(chatId, data, response) {
        try {
            await this.reminders.createReminder({
                chatId: BigInt(chatId),
                text: data.text,
                triggerAt: new Date(data.triggerAt),
            });
            await this.telegram.sendMessage(chatId, response);
        }
        catch (error) {
            this.logger.error(`Failed to save reminder: ${error.message}`);
            await this.telegram.sendMessage(chatId, 'Мяу, не смог создать напоминание 😿');
        }
    }
};
exports.MessageHandlerService = MessageHandlerService;
exports.MessageHandlerService = MessageHandlerService = MessageHandlerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [telegram_service_1.TelegramService,
        llm_service_1.LlmService,
        transcription_service_1.TranscriptionService,
        sheets_service_1.GoogleSheetsService,
        docs_service_1.GoogleDocsService,
        reminder_service_1.ReminderService])
], MessageHandlerService);
//# sourceMappingURL=message-handler.service.js.map