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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TelegramService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let TelegramService = TelegramService_1 = class TelegramService {
    configService;
    logger = new common_1.Logger(TelegramService_1.name);
    botToken;
    apiUrl;
    constructor(configService) {
        this.configService = configService;
        this.botToken = this.configService.get('TELEGRAM_BOT_TOKEN') || '';
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
    }
    async sendMessage(chatId, text) {
        try {
            await axios_1.default.post(`${this.apiUrl}/sendMessage`, {
                chat_id: chatId.toString(),
                text,
                parse_mode: 'HTML',
            });
            this.logger.log(`Message sent to ${chatId}`);
        }
        catch (error) {
            this.logger.error(`Failed to send message: ${error.message}`);
            throw error;
        }
    }
    async getFile(fileId) {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/getFile`, {
                params: { file_id: fileId },
            });
            const filePath = response.data.result.file_path;
            const fileUrl = `https://api.telegram.org/file/bot${this.botToken}/${filePath}`;
            return { filePath, fileUrl };
        }
        catch (error) {
            this.logger.error(`Failed to get file: ${error.message}`);
            throw error;
        }
    }
    async downloadFile(fileUrl) {
        const response = await axios_1.default.get(fileUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    }
    async setWebhook(webhookUrl) {
        try {
            const response = await axios_1.default.post(`${this.apiUrl}/setWebhook`, {
                url: webhookUrl,
            });
            this.logger.log(`Webhook set result: ${JSON.stringify(response.data)}`);
            return response.data.ok;
        }
        catch (error) {
            this.logger.error(`Failed to set webhook: ${error.message}`);
            return false;
        }
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = TelegramService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map