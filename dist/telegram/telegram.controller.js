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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TelegramController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const message_handler_service_1 = require("./message-handler.service");
let TelegramController = TelegramController_1 = class TelegramController {
    messageHandler;
    logger = new common_1.Logger(TelegramController_1.name);
    constructor(messageHandler) {
        this.messageHandler = messageHandler;
    }
    async handleWebhook(update) {
        this.logger.log(`Received update: ${JSON.stringify(update).substring(0, 200)}...`);
        try {
            await this.messageHandler.handleUpdate(update);
        }
        catch (error) {
            this.logger.error(`Error handling update: ${error.message}`, error.stack);
        }
        return { ok: true };
    }
};
exports.TelegramController = TelegramController;
__decorate([
    (0, common_1.Post)('telegram'),
    (0, common_1.HttpCode)(200),
    (0, common_1.Header)('Cache-Control', 'no-store'),
    (0, swagger_1.ApiOperation)({ summary: 'Telegram webhook endpoint' }),
    (0, swagger_1.ApiBody)({ description: 'Telegram update object', type: Object }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "handleWebhook", null);
exports.TelegramController = TelegramController = TelegramController_1 = __decorate([
    (0, swagger_1.ApiTags)('telegram'),
    (0, common_1.Controller)('webhook'),
    __metadata("design:paramtypes", [message_handler_service_1.MessageHandlerService])
], TelegramController);
//# sourceMappingURL=telegram.controller.js.map