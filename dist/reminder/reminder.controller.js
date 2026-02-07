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
var ReminderController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const reminder_service_1 = require("./reminder.service");
let ReminderController = ReminderController_1 = class ReminderController {
    reminderService;
    configService;
    logger = new common_1.Logger(ReminderController_1.name);
    cronApiKey;
    constructor(reminderService, configService) {
        this.reminderService = reminderService;
        this.configService = configService;
        this.cronApiKey = this.configService.get('CRON_API_KEY') || '';
    }
    async processReminders(apiKey) {
        if (!this.cronApiKey || apiKey !== this.cronApiKey) {
            this.logger.warn('Unauthorized cron access attempt');
            throw new common_1.UnauthorizedException('Invalid API key');
        }
        this.logger.log('Processing reminders...');
        const processed = await this.reminderService.processDueReminders();
        return {
            processed,
            message: `Processed ${processed} reminders`,
        };
    }
};
exports.ReminderController = ReminderController;
__decorate([
    (0, common_1.Post)('process'),
    (0, common_1.HttpCode)(200),
    (0, common_1.Header)('Cache-Control', 'no-store'),
    (0, swagger_1.ApiOperation)({ summary: 'Process and send due reminders (called by cron)' }),
    (0, swagger_1.ApiHeader)({ name: 'x-api-key', description: 'API key for cron authentication' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reminders processed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Headers)('x-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReminderController.prototype, "processReminders", null);
exports.ReminderController = ReminderController = ReminderController_1 = __decorate([
    (0, swagger_1.ApiTags)('reminders'),
    (0, common_1.Controller)('reminders'),
    __metadata("design:paramtypes", [reminder_service_1.ReminderService,
        config_1.ConfigService])
], ReminderController);
//# sourceMappingURL=reminder.controller.js.map